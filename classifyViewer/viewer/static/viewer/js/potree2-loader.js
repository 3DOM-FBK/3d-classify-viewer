// =====================================================================
// POTREE 2.0 LOADER for BabylonJS
// Faithful implementation based on Potree's OctreeLoader.js & DecoderWorker.js
// Format: metadata.json + hierarchy.bin + octree.bin
// =====================================================================

/**
 * Potree 2.0 hierarchy node
 */
class Potree2Node {
    constructor(name, boundingBox) {
        this.name = name;
        this.level = name === "r" ? 0 : name.length - 1;
        this.boundingBox = boundingBox; // { min: [x,y,z], max: [x,y,z] }
        this.numPoints = 0;
        this.byteOffset = 0n;   // BigInt offset into octree.bin
        this.byteSize = 0n;     // BigInt size in octree.bin
        this.nodeType = 0;      // 0=normal, 2=proxy (lazy hierarchy chunk)
        this.childMask = 0;
        this.children = new Array(8).fill(null);
        this.spacing = 0;

        // For proxy nodes (type === 2)
        this.hierarchyByteOffset = 0n;
        this.hierarchyByteSize = 0n;

        // State
        this.loaded = false;
        this.loading = false;
        this.mesh = null;
    }

    get hasChildren() {
        return this.childMask !== 0;
    }
}

/**
 * Computes child AABB from parent AABB using octree index bits.
 * Potree convention:
 *   bit 0 (0b001) → Z axis
 *   bit 1 (0b010) → Y axis
 *   bit 2 (0b100) → X axis
 */
function createChildAABB(parentBB, childIndex) {
    const min = [...parentBB.min];
    const max = [...parentBB.max];
    const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];

    if (childIndex & 0b100) { min[0] += size[0] / 2; } else { max[0] -= size[0] / 2; }
    if (childIndex & 0b010) { min[1] += size[1] / 2; } else { max[1] -= size[1] / 2; }
    if (childIndex & 0b001) { min[2] += size[2] / 2; } else { max[2] -= size[2] / 2; }

    return { min, max };
}


/**
 * Potree 2.0 Loader for BabylonJS
 *
 * Uses HTTP Range requests via a Django endpoint to fetch only the needed
 * bytes for each node from octree.bin. This way, even multi-GB files can
 * be handled without loading the entire file into browser memory.
 */
export class Potree2Loader {
    constructor(scene, baseUrl, options = {}) {
        this.scene = scene;
        this.baseUrl = baseUrl;
        this.metadata = null;
        this.root = null;
        this.rootTransform = new BABYLON.TransformNode("Potree2Root", scene);

        const prefixes = ["/static/viewer/data/", "static/viewer/data/"];
        let foundPrefix = false;
        for (const prefix of prefixes) {
            if (baseUrl.startsWith(prefix)) {
                this.rangeBasePath = baseUrl.substring(prefix.length);
                foundPrefix = true;
                break;
            }
        }
        if (!foundPrefix) this.rangeBasePath = baseUrl;
        this.rangeBasePath = this.rangeBasePath.replace(/^\/+|\/+$/g, '');

        this.attributes = [];
        this.bytesPerPoint = 0;
        this.hierarchyBuffer = null;

        this.loadedNodes = new Map();   // name → mesh
        this.activeNodes = new Set();
        this.loadingNodes = new Set();

        this.pointSize = options.pointSize || 2;
        this.maxVisibleNodes = options.maxVisibleNodes || 500;
        this.maxVisiblePoints = options.maxVisiblePoints || 5_000_000;
        this.maxConcurrentLoads = options.maxConcurrentLoads || 6;

        this.stats = {
            loadedNodes: 0,
            visibleNodes: 0,
            totalPointsRendered: 0,
            loadingNodes: 0
        };

        // Persistent Selection History
        // [{ type, area, viewport, transformMatrix }]
        this.selectionHistory = [];
        // Deselection regions (CTRL+select) — same structure as selectionHistory.
        // Points that fall here are excluded from classification even if
        // they are inside a selectionHistory region.
        this.deselectionHistory = [];

        // Flag: when true, the selection logic is inverted — points OUTSIDE the
        // selectionHistory regions are highlighted, not those inside.
        this.selectionInverted = false;

        // Persistent Classification History — one entry per "assign class" action.
        // [{ classId, r, g, b, minX, minY, minZ, maxX, maxY, maxZ }]
        // Uses a 3D AABB so future LOD nodes are classified with a spatial test,
        // independent of camera position/rotation.
        this.classificationHistory = [];

        // Current display mode, synchronized with the UI via setColorMode().
        // "classification" (default): classified points show their class color.
        // "color": all points show the original point cloud color.
        // _createMeshFromBuffer uses this value to decide which colors to write
        // into the vertex data of newly loaded LOD nodes.
        this.colorMode = "classification";
        this.featureBin = null;

        // ---- CUT / SEGMENT HISTORY ----
        // segmentId 0 = main (uncut) cloud. Each cutSelection() adds an entry.
        // entry: { segmentId, visible, selections, deselections, minX..maxZ }
        this.cutHistory = [];
        this._segmentIdCounter = 1;
        this.mainCloudVisible = true;
    }

    // ========== PUBLIC API ==========

    async load() {
        console.log("🌲 Potree2Loader: Loading from", this.baseUrl);

        const metaResponse = await fetch(`${this.baseUrl}/metadata.json`);
        if (!metaResponse.ok) throw new Error(`Failed to load metadata.json: ${metaResponse.status}`);
        this.metadata = await metaResponse.json();

        console.log("📊 Metadata:");
        console.log("   Version:", this.metadata.version);
        console.log("   Points:", this.metadata.points.toLocaleString());
        console.log("   Spacing:", this.metadata.spacing);
        console.log("   Hierarchy depth:", this.metadata.hierarchy.depth);
        console.log("   Encoding:", this.metadata.encoding);
        console.log("   BoundingBox min:", this.metadata.boundingBox.min);
        console.log("   BoundingBox max:", this.metadata.boundingBox.max);
        console.log("   Scale:", this.metadata.scale);
        console.log("   Offset:", this.metadata.offset);

        this._parseAttributes();

        // console.log("📂 Loading hierarchy.bin...");
        const hierUrl = this._getRangeUrl("hierarchy.bin");
        const hierResponse = await fetch(hierUrl);
        if (!hierResponse.ok) throw new Error(`Failed to load hierarchy.bin: ${hierResponse.status}`);
        this.hierarchyBuffer = await hierResponse.arrayBuffer();
        // console.log(`   hierarchy.bin loaded: ${this.hierarchyBuffer.byteLength.toLocaleString()} bytes`);

        const bbMin = this.metadata.boundingBox.min;
        const bbMax = this.metadata.boundingBox.max;
        const localBB = {
            min: [0, 0, 0],
            max: [bbMax[0] - bbMin[0], bbMax[1] - bbMin[1], bbMax[2] - bbMin[2]]
        };

        this.root = new Potree2Node("r", localBB);
        this.root.nodeType = 2;
        this.root.hierarchyByteOffset = 0n;
        this.root.hierarchyByteSize = BigInt(this.metadata.hierarchy.firstChunkSize);
        this.root.spacing = this.metadata.spacing;

        this._parseHierarchyChunk(this.root);

        const allNodes = this._collectNodes(this.root);
        const levelStats = {};
        let totalNodePoints = 0;
        for (const n of allNodes) {
            if (!levelStats[n.level]) levelStats[n.level] = { count: 0, points: 0 };
            levelStats[n.level].count++;
            levelStats[n.level].points += n.numPoints;
            totalNodePoints += n.numPoints;
        }
        // console.log(`✅ Hierarchy parsed: ${allNodes.length} nodes, ${totalNodePoints.toLocaleString()} total points`);
        // for (const [level, data] of Object.entries(levelStats).sort((a, b) => a[0] - b[0])) {
        // console.log(`   Level ${level}: ${data.count} nodes, ${data.points.toLocaleString()} points`);
        // }

        const pointCountDisplay = document.getElementById('point-count');
        if (pointCountDisplay) pointCountDisplay.textContent = this.metadata.points.toLocaleString();

        await this._loadInitialNodes();

        return this.rootTransform;
    }

    _getRangeUrl(filename) {
        return `/pointcloud-data/${this.rangeBasePath}/${filename}`;
    }

    async _fetchRange(filename, byteOffset, byteSize) {
        const url = this._getRangeUrl(filename);
        const first = Number(byteOffset);
        const last = first + Number(byteSize) - 1;

        const response = await fetch(url, {
            headers: { 'Range': `bytes=${first}-${last}` }
        });

        if (response.status === 206) {
            return await response.arrayBuffer();
        } else if (response.ok) {
            console.warn(`⚠️ Server returned full file instead of range for ${filename}. Slicing locally.`);
            const fullBuffer = await response.arrayBuffer();
            return fullBuffer.slice(first, first + Number(byteSize));
        } else {
            throw new Error(`Range request failed for ${filename}: ${response.status} ${response.statusText}`);
        }
    }

    async _loadInitialNodes() {
        // console.log("🔄 Loading initial nodes (root + levels 0-2)...");
        const allNodes = this._collectNodes(this.root);

        const initialNodes = allNodes
            .filter(n => n.level <= 2 && n.numPoints > 0 && n.byteSize > 0n)
            .sort((a, b) => a.level - b.level || b.numPoints - a.numPoints);

        // console.log(`   Will load ${initialNodes.length} initial nodes via Range requests`);

        const batchSize = 6;
        for (let i = 0; i < initialNodes.length; i += batchSize) {
            const batch = initialNodes.slice(i, i + batchSize);
            await Promise.all(batch.map(node => this._loadNode(node)));
        }

        for (const node of initialNodes) {
            if (this.loadedNodes.has(node.name)) {
                const mesh = this.loadedNodes.get(node.name);
                mesh.isVisible = true;
                this.activeNodes.add(node.name);
            }
        }

        this.stats.visibleNodes = this.activeNodes.size;
        // console.log(`✅ Initial load complete: ${this.loadedNodes.size} meshes visible`);
    }

    async _loadNode(node) {
        if (this.loadedNodes.has(node.name) || this.loadingNodes.has(node.name)) return;
        if (node.byteSize === 0n || node.numPoints === 0) return;
        if (this.loadingNodes.size >= this.maxConcurrentLoads) return;

        this.loadingNodes.add(node.name);
        this.stats.loadingNodes = this.loadingNodes.size;

        try {
            const buffer = await this._fetchRange("octree.bin", node.byteOffset, node.byteSize);

            const expectedBytes = node.numPoints * this.bytesPerPoint;
            let numPoints = node.numPoints;
            if (buffer.byteLength < expectedBytes) {
                console.warn(`⚠️ Node ${node.name}: got ${buffer.byteLength}B, expected ${expectedBytes}B`);
                numPoints = Math.floor(buffer.byteLength / this.bytesPerPoint);
                if (numPoints === 0) return;
                node.numPoints = numPoints;
            }

            this._createMeshFromBuffer(node, buffer);
            this.stats.loadedNodes++;

            // if (this.stats.loadedNodes <= 30 || this.stats.loadedNodes % 50 === 0) {
            //     console.log(`   ✅ Node ${node.name} (L${node.level}): ${node.numPoints.toLocaleString()} pts`);
            // }
        } catch (err) {
            console.error(`❌ Failed to load node ${node.name}:`, err);
        } finally {
            this.loadingNodes.delete(node.name);
            this.stats.loadingNodes = this.loadingNodes.size;
        }
    }

    update(camera) {
        if (!this.root || !camera) return;

        const priorityQueue = [];
        const nodesToShow = new Set();
        let totalPoints = 0;

        this._traverseForLOD(this.root, camera, priorityQueue);
        priorityQueue.sort((a, b) => b.priority - a.priority);

        for (const entry of priorityQueue) {
            if (nodesToShow.size >= this.maxVisibleNodes) break;
            if (totalPoints + entry.node.numPoints > this.maxVisiblePoints) continue;

            nodesToShow.add(entry.node.name);
            totalPoints += entry.node.numPoints;

            if (!this.loadedNodes.has(entry.node.name) && !this.loadingNodes.has(entry.node.name)) {
                this._loadNode(entry.node);
            }
        }

        for (const [name, mesh] of this.loadedNodes) {
            const shouldShow = nodesToShow.has(name);
            const wasHidden = !mesh.isVisible;

            // Respect the outline hide/show state: if nothing is visible at all,
            // keep the mesh hidden so the GPU skips it.
            const anySegmentVisible = this.mainCloudVisible || this.cutHistory.some(e => e.visible);
            const targetVisible = shouldShow && anySegmentVisible;

            if (mesh.isVisible !== targetVisible) mesh.isVisible = targetVisible;

            if (targetVisible && wasHidden) {
                this._applyColorModeToMesh(mesh);
                this._applySegmentVisibilityToMesh(mesh);
            }

            if (targetVisible) { this.activeNodes.add(name); } else { this.activeNodes.delete(name); }
        }

        this.stats.visibleNodes = this.activeNodes.size;
        this.stats.totalPointsRendered = totalPoints;
        this.stats.loadingNodes = this.loadingNodes.size;
    }

    setPointSize(size) {
        this.pointSize = size;
        for (const mesh of this.loadedNodes.values()) {
            if (mesh.material) mesh.material.pointSize = size;
        }
    }

    /**
     * Updates the display mode of the loader.
     * Called by switchColorMode() in main.js every time the user changes the view,
     * so newly loaded LOD nodes immediately use the correct colors.
     */
    setColorMode(mode) {
        this.colorMode = mode;
        // Immediately update all visible nodes
        for (const mesh of this.loadedNodes.values()) {
            if (mesh.isVisible) this._applyColorModeToMesh(mesh);
        }
    }

    async loadFeatureBin(url) {
        console.log("Loading feature bin: " + url);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch feature bin: " + response.status);
        const buffer = await response.arrayBuffer();
        const dv = new DataView(buffer);
        const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        if (magic !== 'FEAT') throw new Error("Invalid feature bin magic: " + magic);
        const N = dv.getUint32(4, true), F = dv.getUint32(8, true);
        let offset = 12;
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const names = [];
        for (let f = 0; f < F; f++) {
            const bytes = new Uint8Array(buffer, offset, 32);
            const end = bytes.indexOf(0);
            const name = decoder.decode(bytes.slice(0, end === -1 ? 32 : end)).trim();
            if (name.length > 0) names.push(name);
            offset += 32;
        }
        const vmin = new Float32Array(buffer.slice(offset, offset + F * 4)); offset += F * 4;
        const vmax = new Float32Array(buffer.slice(offset, offset + F * 4)); offset += F * 4;
        const data = new Float32Array(buffer.slice(offset));
        this.featureBin = { N, F, names, vmin, vmax, data };
        console.log("Feature bin loaded: " + F + " features, " + N + " points");
        return names;
    }

    getFeatureList() {
        return this.featureBin ? [...this.featureBin.names] : [];
    }

    /**
     * Applies the current colorMode to the vertex colors of a single mesh.
     * Called by setColorMode() and by update() when a node becomes visible.
     */
    _applyColorModeToMesh(mesh) {
        const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
        if (!colors) return;

        const originalColors = mesh.metadata?.originalColors;
        const classIds = mesh.metadata?.classIds;
        const classColors = mesh.metadata?.classColors;
        const positions = this.selectionHistory.length > 0
            ? mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
            : null;
        const numPoints = colors.length / 4;
        let changed = false;

        // Feature bin mode (e.g. "feature:planarity_0_8")
        const isFeatureMode = this.colorMode.startsWith('feature:');
        const featureName = isFeatureMode ? this.colorMode.slice(8) : null;
        const featureBin = isFeatureMode ? this.featureBin : null;
        const featureIdx = (featureBin && featureName !== null) ? featureBin.names.indexOf(featureName) : -1;
        const pointIds = mesh.metadata?.pointIds;

        for (let i = 0; i < numPoints; i++) {
            // 1. Apply base color
            if (isFeatureMode && featureBin && featureIdx >= 0 && pointIds) {
                const pid = pointIds[i];
                let r = 0.3, g = 0.3, b = 0.3;
                if (pid >= 0 && pid < featureBin.N) {
                    const val = featureBin.data[pid * featureBin.F + featureIdx];
                    if (!isNaN(val)) {
                        const fmin = featureBin.vmin[featureIdx];
                        const fmax = featureBin.vmax[featureIdx];
                        const t = (fmax > fmin) ? (val - fmin) / (fmax - fmin) : 0.5;
                        [r, g, b] = this._colormapViridis(Math.max(0, Math.min(1, t)));
                    }
                }
                colors[i * 4] = r;
                colors[i * 4 + 1] = g;
                colors[i * 4 + 2] = b;
                colors[i * 4 + 3] = 1.0;
            } else {
                const hasClass = classIds && classIds[i] > 0 && classColors;
                if (this.colorMode === "classification" && hasClass) {
                    colors[i * 4] = classColors[i * 4];
                    colors[i * 4 + 1] = classColors[i * 4 + 1];
                    colors[i * 4 + 2] = classColors[i * 4 + 2];
                    colors[i * 4 + 3] = 1.0;
                } else if (originalColors) {
                    colors[i * 4] = originalColors[i * 4];
                    colors[i * 4 + 1] = originalColors[i * 4 + 1];
                    colors[i * 4 + 2] = originalColors[i * 4 + 2];
                    colors[i * 4 + 3] = originalColors[i * 4 + 3];
                }
            }

            // 2. Re-apply selection highlight on top (always overrides)
            if (positions && this.selectionHistory.length > 0 && !isNaN(positions[i * 3])) {
                const vector = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                const inHistory = this._isPointInSelectionHistory(vector);
                const shouldHighlight = this.selectionInverted ? !inHistory : inHistory;
                if (shouldHighlight) {
                    colors[i * 4] = 1.0;
                    colors[i * 4 + 1] = 0.0;
                    colors[i * 4 + 2] = 0.0;
                    colors[i * 4 + 3] = 1.0;
                }
            }

            changed = true;
        }
        if (changed) mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
    }

    getStats() {
        return { ...this.stats, loadedNodes: this.loadedNodes.size };
    }

    getRoot() {
        return this.rootTransform;
    }

    dispose() {
        for (const mesh of this.loadedNodes.values()) {
            if (mesh.material) mesh.material.dispose();
            mesh.dispose();
        }
        this.loadedNodes.clear();
        this.activeNodes.clear();
        this.loadingNodes.clear();
        this.rootTransform.dispose();
        this.hierarchyBuffer = null;
    }

    // ========== ATTRIBUTE PARSING ==========

    _parseAttributes() {
        this.attributes = [];
        let byteOffset = 0;

        for (const attr of this.metadata.attributes) {
            this.attributes.push({
                name: attr.name,
                type: attr.type,
                size: attr.size,
                numElements: attr.numElements,
                elementSize: attr.elementSize,
                byteOffset: byteOffset,
                min: attr.min,
                max: attr.max,
                scale: attr.scale,
                offset: attr.offset
            });
            byteOffset += attr.size;
        }

        this.bytesPerPoint = byteOffset;
        // console.log("📋 Attributes:", this.attributes.map(a => `${a.name}(${a.type}, ${a.size}B)`).join(", "));
        // console.log("   Bytes per point:", this.bytesPerPoint);
    }

    // ========== HIERARCHY PARSING ==========

    _parseHierarchyChunk(rootNode) {
        const buffer = this.hierarchyBuffer;
        const chunkStart = Number(rootNode.hierarchyByteOffset);
        const chunkEnd = chunkStart + Number(rootNode.hierarchyByteSize);

        if (chunkEnd > buffer.byteLength) {
            console.error(`Hierarchy chunk exceeds buffer: ${chunkStart}-${chunkEnd} > ${buffer.byteLength}`);
            return;
        }

        const view = new DataView(buffer, chunkStart, chunkEnd - chunkStart);
        const bytesPerNode = 22;
        const numNodes = Math.floor((chunkEnd - chunkStart) / bytesPerNode);

        const nodes = new Array(numNodes);
        nodes[0] = rootNode;
        let nodePos = 1;

        for (let i = 0; i < numNodes; i++) {
            const current = nodes[i];
            if (!current) break;

            const offset = i * bytesPerNode;
            const type = view.getUint8(offset + 0);
            const childMask = view.getUint8(offset + 1);
            const numPoints = view.getUint32(offset + 2, true);
            const byteOffset = view.getBigInt64(offset + 6, true);
            const byteSize = view.getBigInt64(offset + 14, true);

            if (current.nodeType === 2) {
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            } else if (type === 2) {
                current.hierarchyByteOffset = byteOffset;
                current.hierarchyByteSize = byteSize;
                current.numPoints = numPoints;
            } else {
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            }

            current.nodeType = type;
            current.childMask = childMask;

            if (current.nodeType === 2) continue;

            for (let childIdx = 0; childIdx < 8; childIdx++) {
                if (!((1 << childIdx) & childMask)) continue;

                const childName = current.name + childIdx;
                const childBB = createChildAABB(current.boundingBox, childIdx);
                const child = new Potree2Node(childName, childBB);
                child.spacing = current.spacing / 2;

                current.children[childIdx] = child;
                nodes[nodePos] = child;
                nodePos++;
            }
        }

        rootNode.nodeType = 0;
    }

    _ensureHierarchyLoaded(node) {
        if (node.nodeType !== 2) return;
        this._parseHierarchyChunk(node);
    }

    _collectNodes(node) {
        const result = [node];
        for (const child of node.children) {
            if (child) result.push(...this._collectNodes(child));
        }
        return result;
    }

    // ========== LOD TRAVERSAL ==========

    _traverseForLOD(node, camera, priorityQueue) {
        if (!node || node.numPoints === 0) return;

        if (node.nodeType === 2) this._ensureHierarchyLoaded(node);

        const sse = this._calculateSSE(node, camera);

        if (node.name === "r" || sse > 1.0) {
            priorityQueue.push({ node, priority: sse });

            if (sse > 2.0) {
                for (const child of node.children) {
                    if (child) this._traverseForLOD(child, camera, priorityQueue);
                }
            }
        }
    }

    _calculateSSE(node, camera) {
        const bbCenter = this._getLocalCenter(node);
        const distance = BABYLON.Vector3.Distance(camera.position, bbCenter);

        if (distance < 0.001) return Infinity;

        const engine = this.scene.getEngine();
        const screenWidth = engine.getRenderWidth();
        const fov = camera.fov || 0.8;
        const slope = Math.tan(fov / 2);

        return (node.spacing / distance) * (screenWidth / (2 * slope));
    }

    _getLocalCenter(node) {
        const bb = node.boundingBox;
        return new BABYLON.Vector3(
            (bb.min[0] + bb.max[0]) / 2,
            (bb.min[1] + bb.max[1]) / 2,
            (bb.min[2] + bb.max[2]) / 2
        );
    }

    // ========== ATTRIBUTE COLORIZATION UTILITIES ==========

    /**
     * Reads a scalar value from the ArrayBuffer based on the attribute type.
     */
    _readAttrScalar(view, byteOffset, attr) {
        const t = attr.type;
        if (t === 'int8') return view.getInt8(byteOffset);
        if (t === 'uint8') return view.getUint8(byteOffset);
        if (t === 'int16') return view.getInt16(byteOffset, true);
        if (t === 'uint16') return view.getUint16(byteOffset, true);
        if (t === 'int32') return view.getInt32(byteOffset, true);
        if (t === 'uint32') return view.getUint32(byteOffset, true);
        if (t === 'float') return view.getFloat32(byteOffset, true);
        if (t === 'double') return view.getFloat64(byteOffset, true);
        // int64/uint64: fallback to int32 (only low 4 bytes)
        return view.getInt32(byteOffset, true);
    }

    /**
     * Viridis colormap (clamps to [0,1]). Used for continuous attributes (e.g. intensity).
     */
    _colormapViridis(t) {
        t = Math.max(0, Math.min(1, t));
        // 5-stop Viridis approximation
        const stops = [
            [0.267, 0.005, 0.329],
            [0.283, 0.141, 0.458],
            [0.163, 0.471, 0.558],
            [0.134, 0.659, 0.518],
            [0.478, 0.821, 0.318],
            [0.993, 0.906, 0.144]
        ];
        const scaled = t * (stops.length - 1);
        const lo = Math.floor(scaled);
        const hi = Math.min(lo + 1, stops.length - 1);
        const f = scaled - lo;
        return [
            stops[lo][0] + (stops[hi][0] - stops[lo][0]) * f,
            stops[lo][1] + (stops[hi][1] - stops[lo][1]) * f,
            stops[lo][2] + (stops[hi][2] - stops[lo][2]) * f
        ];
    }

    /**
     * Discrete cyclic palette for integer attributes (e.g. classification, return_number).
     * Returns [r, g, b] in [0,1].
     */
    _colormapDiscrete(intValue) {
        const palette = [
            [0.22, 0.62, 0.85],  // blue
            [0.95, 0.45, 0.10],  // orange
            [0.17, 0.72, 0.44],  // green
            [0.80, 0.22, 0.33],  // red
            [0.58, 0.40, 0.74],  // purple
            [0.99, 0.75, 0.18],  // yellow
            [0.40, 0.76, 0.65],  // teal
            [0.88, 0.53, 0.79],  // pink
            [0.60, 0.60, 0.60],  // gray
            [0.99, 0.55, 0.38],  // salmon
        ];
        const idx = Math.abs(intValue) % palette.length;
        return palette[idx];
    }



    // ========== MESH CREATION ==========

    _createMeshFromBuffer(node, buffer) {
        const view = new DataView(buffer);
        const numPoints = node.numPoints;
        const positions = new Float32Array(numPoints * 3);
        const colors = new Float32Array(numPoints * 4);

        const scale = this.metadata.scale;
        const metaOffset = this.metadata.offset;
        const bbMin = this.metadata.boundingBox.min;

        let posAttr = null;
        let rgbAttr = null;
        let pointIdAttr = null;

        for (const attr of this.attributes) {
            if (attr.name === "position") posAttr = attr;
            if (attr.name === "rgb") rgbAttr = attr;
            if (attr.name.toLowerCase() === "point_id" || attr.name.toLowerCase() === "pointid") {
                pointIdAttr = attr;
            }
        }

        if (!posAttr) {
            console.error("No position attribute found!");
            return;
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        const pointIds = new Int32Array(numPoints);
        pointIds.fill(-1);

        for (let j = 0; j < numPoints; j++) {
            const pointOffset = j * this.bytesPerPoint;

            if (pointOffset + posAttr.byteOffset + 12 > buffer.byteLength) break;

            const rawX = view.getInt32(pointOffset + posAttr.byteOffset + 0, true);
            const rawY = view.getInt32(pointOffset + posAttr.byteOffset + 4, true);
            const rawZ = view.getInt32(pointOffset + posAttr.byteOffset + 8, true);

            const x = (rawX * scale[0]) + metaOffset[0] - bbMin[0];
            const y = (rawY * scale[1]) + metaOffset[1] - bbMin[1];
            const z = (rawZ * scale[2]) + metaOffset[2] - bbMin[2];

            positions[3 * j + 0] = x;
            positions[3 * j + 1] = y;
            positions[3 * j + 2] = z;

            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);

            // Decode RGB (uint16 × 3)
            if (rgbAttr && pointOffset + rgbAttr.byteOffset + 6 <= buffer.byteLength) {
                const rRaw = view.getUint16(pointOffset + rgbAttr.byteOffset + 0, true);
                const gRaw = view.getUint16(pointOffset + rgbAttr.byteOffset + 2, true);
                const bRaw = view.getUint16(pointOffset + rgbAttr.byteOffset + 4, true);

                const r = rRaw > 255 ? rRaw / 256 : rRaw;
                const g = gRaw > 255 ? gRaw / 256 : gRaw;
                const b = bRaw > 255 ? bRaw / 256 : bRaw;

                colors[4 * j + 0] = r / 255.0;
                colors[4 * j + 1] = g / 255.0;
                colors[4 * j + 2] = b / 255.0;
                colors[4 * j + 3] = 1.0;
            } else {
                colors[4 * j + 0] = 1.0;
                colors[4 * j + 1] = 1.0;
                colors[4 * j + 2] = 1.0;
                colors[4 * j + 3] = 1.0;
            }

            // Decode POINT_ID
            if (pointIdAttr && pointOffset + pointIdAttr.byteOffset + 4 <= buffer.byteLength) {
                // Read as Int32/Uint32 (usually 4 bytes). Using getInt32.
                pointIds[j] = view.getInt32(pointOffset + pointIdAttr.byteOffset, true);
            }
        }


        // Save original positions so they can be hidden (by assigning NaN)
        // and restored later, bypassing any bugs/limitations of BabylonJS point
        // cloud materials regarding alpha compositing.
        const originalPositions = new Float32Array(positions);

        // Save originalColors HERE — after RGB decode but BEFORE applying
        // selection or classification. This ensures originalColors always contains
        // only the real point cloud colors.
        const originalColors = new Float32Array(colors);

        // Apply persistent selection highlight AFTER saving originalColors
        if (this.selectionHistory.length > 0) {
            for (let j = 0; j < numPoints; j++) {
                const vector = new BABYLON.Vector3(positions[3 * j], positions[3 * j + 1], positions[3 * j + 2]);
                const inHistory = this._isPointInSelectionHistory(vector);
                // If inverted: highlight points OUTSIDE the selection regions
                const shouldHighlight = this.selectionInverted ? !inHistory : inHistory;
                if (shouldHighlight) {
                    colors[4 * j + 0] = 1.0;
                    colors[4 * j + 1] = 0.0;
                    colors[4 * j + 2] = 0.0;
                }
            }
        }

        // // Debug bounds for first few nodes
        // if (this.stats.loadedNodes < 5) {
        //     console.log(`   📐 Node ${node.name} bounds: X[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y[${minY.toFixed(2)}, ${maxY.toFixed(2)}] Z[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
        // }

        // Apply existing classifications using the same 2D-projection approach
        // as selectionHistory — works correctly at every LOD level.
        const classIds = new Int32Array(numPoints);        // 0 = unclassified
        const classColors = new Float32Array(numPoints * 4);  // RGBA per point

        if (this.classificationHistory.length > 0) {
            for (let j = 0; j < numPoints; j++) {
                const vector = new BABYLON.Vector3(positions[3 * j], positions[3 * j + 1], positions[3 * j + 2]);
                const cls = this._getPointClassification(vector);
                if (cls) {
                    classIds[j] = cls.classId;
                    classColors[j * 4] = cls.r;
                    classColors[j * 4 + 1] = cls.g;
                    classColors[j * 4 + 2] = cls.b;
                    classColors[j * 4 + 3] = 1.0;
                    // Paint vertex colors only if the active mode requires it.
                    // In "color" mode vertices keep their originalColors — no flash
                    // of class colors when a LOD node loads new detail.
                    if (this.colorMode === "classification") {
                        colors[4 * j + 0] = cls.r;
                        colors[4 * j + 1] = cls.g;
                        colors[4 * j + 2] = cls.b;
                        colors[4 * j + 3] = 1.0;
                    }
                }
            }
        }

        // Apply existing cut segments
        const segmentIds = new Int32Array(numPoints); // 0 = main cloud
        if (this.cutHistory.length > 0 || !this.mainCloudVisible) {
            for (let j = 0; j < numPoints; j++) {
                const vector = new BABYLON.Vector3(positions[3 * j], positions[3 * j + 1], positions[3 * j + 2]);
                const seg = this._getPointSegment(vector);
                if (seg !== null) {
                    segmentIds[j] = seg.segmentId;
                    if (!seg.visible) {
                        positions[3 * j] = NaN;
                        positions[3 * j + 1] = NaN;
                        positions[3 * j + 2] = NaN;
                    }
                } else {
                    segmentIds[j] = 0;
                    if (!this.mainCloudVisible) {
                        positions[3 * j] = NaN;
                        positions[3 * j + 1] = NaN;
                        positions[3 * j + 2] = NaN;
                    }
                }
            }
        }

        // Create BabylonJS mesh
        const mesh = new BABYLON.Mesh(`potree2_${node.name}`, this.scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.colors = colors;
        // updatable=true is REQUIRED to update visibility and colors dynamically
        vertexData.applyToMesh(mesh, true);

        const mat = new BABYLON.StandardMaterial(`mat_p2_${node.name}`, this.scene);
        mat.pointsCloud = true;
        mat.pointSize = this.pointSize;
        mat.disableLighting = true;
        mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        mat.useVertexAlpha = true; // needed for alpha=0 to hide cut segment points
        // Use ALPHA TEST to discard invisible points efficiently and avoid depth sorting issues
        mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
        mat.alphaCutOff = 0.1;

        mesh.material = mat;
        mesh.hasAlpha = true;

        mesh.parent = this.rootTransform;
        mesh.isVisible = false;
        mesh.isPickable = true;

        mesh.metadata = {
            nodeInfo: { name: node.name, level: node.level, numPoints: node.numPoints },
            originalPositions,
            originalColors,
            classIds,
            classColors,
            segmentIds,
            pointIds,
            potree2Node: true
        };

        this.loadedNodes.set(node.name, mesh);
        node.loaded = true;
        node.mesh = mesh;
    }

    // ========== CLEANUP ==========

    cleanup(keepCount = 200) {
        if (this.loadedNodes.size <= keepCount) return;

        const inactiveNodes = [...this.loadedNodes.keys()]
            .filter(name => !this.activeNodes.has(name));

        const toRemove = inactiveNodes.slice(0, Math.max(0, inactiveNodes.length - keepCount));

        for (const name of toRemove) {
            const mesh = this.loadedNodes.get(name);
            if (mesh.material) mesh.material.dispose();
            mesh.dispose();
            this.loadedNodes.delete(name);
            this.stats.loadedNodes--;
        }

        if (toRemove.length > 0) console.log(`🧹 Cleaned up ${toRemove.length} nodes`);
    }

    // ========== SELECTION ==========

    /**
     * Checks if a 3D point falls into any region in selectionHistory
     * AND is not excluded by deselectionHistory.
     */
    _isPointInSelectionHistory(localVector) {
        const worldMatrix = this.rootTransform.getWorldMatrix();

        let selected = false;
        for (const sel of this.selectionHistory) {
            const projection = BABYLON.Vector3.Project(localVector, worldMatrix, sel.transformMatrix, sel.viewport);
            if (sel.type === "rect") {
                if (projection.x >= sel.area.x && projection.x <= sel.area.x + sel.area.width &&
                    projection.y >= sel.area.y && projection.y <= sel.area.y + sel.area.height) {
                    selected = true; break;
                }
            } else if (sel.type === "lasso") {
                if (this._isPointInPoly(sel.area, [projection.x, projection.y])) {
                    selected = true; break;
                }
            }
        }
        if (!selected) return false;

        // Exclude if the point falls in a deselection region
        for (const dsel of this.deselectionHistory) {
            const projection = BABYLON.Vector3.Project(localVector, worldMatrix, dsel.transformMatrix, dsel.viewport);
            if (dsel.type === "rect") {
                if (projection.x >= dsel.area.x && projection.x <= dsel.area.x + dsel.area.width &&
                    projection.y >= dsel.area.y && projection.y <= dsel.area.y + dsel.area.height) {
                    return false;
                }
            } else if (dsel.type === "lasso") {
                if (this._isPointInPoly(dsel.area, [projection.x, projection.y])) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Returns the class { classId, r, g, b } for a 3D point, or null.
     * Accurate version: uses AABB for fast pruning, then projects to 2D regions.
     */
    _getPointClassification(localVector) {
        const worldMatrix = this.rootTransform.getWorldMatrix();
        const x = localVector.x, y = localVector.y, z = localVector.z;
        let finalCls = null;

        // Determine point's segment once per vector
        const pointSeg = this._getPointSegment(localVector);
        const pointSegId = pointSeg ? pointSeg.segmentId : 0;

        // Iterate from oldest to newest (later entries override earlier ones)
        for (const entry of this.classificationHistory) {
            // New visibility constraint: skip classification if point was hidden when this class was assigned
            if (entry.visibleSegmentIds && !entry.visibleSegmentIds.includes(pointSegId)) continue;

            // 1. Fast AABB pruning
            if (x < entry.minX || x > entry.maxX ||
                y < entry.minY || y > entry.maxY ||
                z < entry.minZ || z > entry.maxZ) continue;

            // 2. Accurate region check
            let isInside = false;
            for (const sel of entry.selections) {
                const projection = BABYLON.Vector3.Project(localVector, worldMatrix, sel.transformMatrix, sel.viewport);
                if (sel.type === "rect") {
                    if (projection.x >= sel.area.x && projection.x <= sel.area.x + sel.area.width &&
                        projection.y >= sel.area.y && projection.y <= sel.area.y + sel.area.height) {
                        isInside = true; break;
                    }
                } else if (sel.type === "lasso") {
                    if (this._isPointInPoly(sel.area, [projection.x, projection.y])) {
                        isInside = true; break;
                    }
                }
            }

            if (!isInside) continue;

            // 3. Exclude deselected regions for this classification event
            let isDeselected = false;
            for (const dsel of entry.deselections) {
                const projection = BABYLON.Vector3.Project(localVector, worldMatrix, dsel.transformMatrix, dsel.viewport);
                if (dsel.type === "rect") {
                    if (projection.x >= dsel.area.x && projection.x <= dsel.area.x + dsel.area.width &&
                        projection.y >= dsel.area.y && projection.y <= dsel.area.y + dsel.area.height) {
                        isDeselected = true; break;
                    }
                } else if (dsel.type === "lasso") {
                    if (this._isPointInPoly(dsel.area, [projection.x, projection.y])) {
                        isDeselected = true; break;
                    }
                }
            }

            if (!isDeselected) {
                finalCls = { classId: entry.classId, r: entry.r, g: entry.g, b: entry.b };
            }
        }
        return finalCls;
    }

    _isPointInPoly(poly, pt) {
        const x = pt[0], y = pt[1];
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i][0], yi = poly[i][1];
            const xj = poly[j][0], yj = poly[j][1];
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // ========== CLASSIFICATION ==========

    /**
     * Assigns a class to all selected points across ALL LOD levels.
     *
     * How it works:
     *  1. Each selectionHistory entry (a frozen 2D region + camera state) is
     *     promoted into a classificationHistory entry with classId and color.
     *     This is the key insight: classification uses the same regions and the
     *     same projection logic as selection, so it works at every LOD level —
     *     coarse nodes seen from far away and fine detail nodes zoomed in alike.
     *  2. All currently loaded nodes are re-classified immediately using the
     *     same projection (catches both red-highlighted and non-highlighted points
     *     in the region, handling any sync issues between LOD and highlight state).
     *  3. selectionHistory is cleared and all red highlights are reset to
     *     originalColors — the selection is gone after classification.
     *
     * Future nodes loaded by the LOD system are handled automatically via
     * _getPointClassification() inside _createMeshFromBuffer().
     *
     * @param {number} classId  - integer class ID
     * @param {number} r,g,b    - RGB floats [0,1]
     * @returns {number} total points classified
     */
    applyClassToLoadedNodes(classId, r, g, b) {
        if (this.selectionHistory.length === 0) {
            console.warn("⚠️ No active selection to classify. Select points first.");
            return 0;
        }

        // 1. Classify currently loaded nodes using the 2D projection with
        //    the frozen camera state — works because these nodes were already
        //    visible at selection time and the projection is correct.
        //    Also builds the 3D AABB of all classified points.
        const worldMatrix = this.rootTransform.getWorldMatrix();
        let total = 0;

        // 3D AABB accumulated across all nodes
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        let anyClassified = false;

        this.loadedNodes.forEach((mesh) => {
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!positions) return;

            const numPoints = positions.length / 3;
            if (!mesh.metadata.classIds) mesh.metadata.classIds = new Int32Array(numPoints);
            if (!mesh.metadata.classColors) mesh.metadata.classColors = new Float32Array(numPoints * 4);

            let classified = 0;

            for (let i = 0; i < numPoints; i++) {
                // Skip invisible points (NaN-masked)
                if (isNaN(positions[i * 3])) continue;

                const vector = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

                // 2D projection with frozen camera state for each selection region
                let isInside = false;
                for (const sel of this.selectionHistory) {
                    const projection = BABYLON.Vector3.Project(vector, worldMatrix, sel.transformMatrix, sel.viewport);
                    if (sel.type === "rect") {
                        isInside = (projection.x >= sel.area.x && projection.x <= sel.area.x + sel.area.width &&
                            projection.y >= sel.area.y && projection.y <= sel.area.y + sel.area.height);
                    } else if (sel.type === "lasso") {
                        isInside = this._isPointInPoly(sel.area, [projection.x, projection.y]);
                    }
                    if (isInside) break;
                }

                // Exclude deselected points (CTRL+select)
                if (isInside && this.deselectionHistory.length > 0) {
                    for (const dsel of this.deselectionHistory) {
                        const dp = BABYLON.Vector3.Project(vector, worldMatrix, dsel.transformMatrix, dsel.viewport);
                        let deselected = false;
                        if (dsel.type === "rect") {
                            deselected = (dp.x >= dsel.area.x && dp.x <= dsel.area.x + dsel.area.width &&
                                dp.y >= dsel.area.y && dp.y <= dsel.area.y + dsel.area.height);
                        } else if (dsel.type === "lasso") {
                            deselected = this._isPointInPoly(dsel.area, [dp.x, dp.y]);
                        }
                        if (deselected) { isInside = false; break; }
                    }
                }

                if (isInside) {
                    mesh.metadata.classIds[i] = classId;
                    mesh.metadata.classColors[i * 4] = r;
                    mesh.metadata.classColors[i * 4 + 1] = g;
                    mesh.metadata.classColors[i * 4 + 2] = b;
                    mesh.metadata.classColors[i * 4 + 3] = 1.0;
                    classified++;
                    // Update 3D AABB
                    const px = positions[i * 3], py = positions[i * 3 + 1], pz = positions[i * 3 + 2];
                    if (px < minX) minX = px; if (px > maxX) maxX = px;
                    if (py < minY) minY = py; if (py > maxY) maxY = py;
                    if (pz < minZ) minZ = pz; if (pz > maxZ) maxZ = pz;
                    anyClassified = true;
                }
            }

            total += classified;

            // Rebuild the correct vertex colors for the active mode:
            // start from originalColors (removes selection red), then
            // overwrite classified points if mode is "classification".
            const finalColors = mesh.metadata.originalColors
                ? new Float32Array(mesh.metadata.originalColors)
                : mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);

            if (finalColors && this.colorMode === "classification") {
                const cIds = mesh.metadata.classIds;
                const cClrs = mesh.metadata.classColors;
                if (cIds && cClrs) {
                    for (let i = 0; i < cIds.length; i++) {
                        if (cIds[i] > 0) {
                            finalColors[i * 4] = cClrs[i * 4];
                            finalColors[i * 4 + 1] = cClrs[i * 4 + 1];
                            finalColors[i * 4 + 2] = cClrs[i * 4 + 2];
                            finalColors[i * 4 + 3] = 1.0;
                        }
                    }
                }
            }

            if (finalColors) {
                mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, finalColors);
            }
        });

        // 2. Save the classification logic (regions + camera + AABB) for future LOD nodes.
        //    Include the current selections and deselections in the history entry.
        if (anyClassified) {
            const visibleSegmentIds = [];
            if (this.mainCloudVisible) visibleSegmentIds.push(0);
            this.cutHistory.forEach(c => {
                if (c.visible) visibleSegmentIds.push(c.segmentId);
            });

            const margin = 0.05;
            this.classificationHistory.push({
                classId, r, g, b,
                visibleSegmentIds,
                minX: minX - margin, minY: minY - margin, minZ: minZ - margin,
                maxX: maxX + margin, maxY: maxY + margin, maxZ: maxZ + margin,
                // Copy current histories. Clone BABYLON matrices accurately.
                selections: this.selectionHistory.map(s => ({ ...s, transformMatrix: s.transformMatrix.clone() })),
                deselections: this.deselectionHistory.map(d => ({ ...d, transformMatrix: d.transformMatrix.clone() }))
            });
        }

        // 3. Clear selection state (selection and deselection)
        this.selectionHistory = [];
        this.deselectionHistory = [];

        // console.log(`✅ Classified ${total.toLocaleString()} points. classificationHistory: ${this.classificationHistory.length} region(s).`);
        return total;
    }

    /**
     * Store a selection region and highlight matching points in red.
     */
    applySelection(type, area) {
        if (!this.scene.activeCamera) return 0;

        const camera = this.scene.activeCamera;
        const engine = this.scene.getEngine();
        const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
        const transformMatrix = this.scene.getTransformMatrix().clone();

        this.selectionHistory.push({ type, area, viewport, transformMatrix });
        this.selectionInverted = false; // new selection resets invert state
        // console.log(`📌 Selection added to history. Total regions: ${this.selectionHistory.length}`);

        let totalSelected = 0;

        this.loadedNodes.forEach((mesh) => {
            const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!colors || !positions) return;

            let modified = false;
            const meshWorldMatrix = mesh.getWorldMatrix();

            for (let i = 0; i < positions.length / 3; i++) {
                const vector = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

                const projection = BABYLON.Vector3.Project(
                    vector, meshWorldMatrix, transformMatrix, viewport
                );

                let isInside = false;
                if (type === "rect") {
                    isInside = (projection.x >= area.x && projection.x <= area.x + area.width &&
                        projection.y >= area.y && projection.y <= area.y + area.height);
                } else if (type === "lasso") {
                    isInside = this._isPointInPoly(area, [projection.x, projection.y]);
                }

                if (isInside) {
                    colors[i * 4 + 0] = 1.0;
                    colors[i * 4 + 1] = 0.0;
                    colors[i * 4 + 2] = 0.0;
                    modified = true;
                    totalSelected++;
                }
            }
            if (modified) mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
        });

        return totalSelected;
    }

    /**
     * Updates the color of an existing class across all loaded nodes and the history.
     * @param {number} classId - The ID of the class to update.
     * @param {string} hexColor - The new hex color string.
     */
    updateClassColor(classId, hexColor) {
        // 1. Convert hex to RGB float
        const h = hexColor.replace('#', '');
        const r = parseInt(h.slice(0, 2), 16) / 255;
        const g = parseInt(h.slice(2, 4), 16) / 255;
        const b = parseInt(h.slice(4, 6), 16) / 255;

        // 2. Update Classification History (for future LOD nodes)
        this.classificationHistory.forEach(entry => {
            if (entry.classId === classId) {
                entry.r = r; entry.g = g; entry.b = b;
            }
        });

        // 3. Update currently loaded meshes
        this.loadedNodes.forEach((mesh) => {
            const classIds = mesh.metadata?.classIds;
            const classColors = mesh.metadata?.classColors;
            const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            if (!classIds || !classColors || !colors) return;

            let modified = false;
            for (let i = 0; i < classIds.length; i++) {
                if (classIds[i] === classId) {
                    classColors[i * 4] = r;
                    classColors[i * 4 + 1] = g;
                    classColors[i * 4 + 2] = b;

                    // Apply to visible colors if in classification mode
                    if (this.colorMode === "classification") {
                        colors[i * 4] = r;
                        colors[i * 4 + 1] = g;
                        colors[i * 4 + 2] = b;
                        modified = true;
                    }
                }
            }
            if (modified) mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
        });

        // console.log(`🎨 Class ${classId} color updated to ${hexColor}`);
    }

    // ========== CUT / SEGMENTS ==========

    /**
     * Promotes the current selectionHistory into a new named cut segment.
     * All loaded points inside the selection regions are assigned the new segmentId.
     * Future LOD nodes are handled via cutHistory in _createMeshFromBuffer.
     * @returns {{ segmentId: number, count: number } | null}
     */
    cutSelection() {
        if (this.selectionHistory.length === 0) {
            console.warn("⚠️ No active selection to cut.");
            return null;
        }

        const segmentId = this._segmentIdCounter++;
        const worldMatrix = this.rootTransform.getWorldMatrix();
        let total = 0;
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        let anyAssigned = false;

        this.loadedNodes.forEach((mesh) => {
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!positions) return;

            if (!mesh.metadata.segmentIds) {
                mesh.metadata.segmentIds = new Int32Array(positions.length / 3);
            }
            const segmentIds = mesh.metadata.segmentIds;
            let assigned = 0;

            for (let i = 0; i < positions.length / 3; i++) {
                const vector = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                let isInside = false;

                for (const sel of this.selectionHistory) {
                    const p = BABYLON.Vector3.Project(vector, worldMatrix, sel.transformMatrix, sel.viewport);
                    if (sel.type === "rect") {
                        isInside = (p.x >= sel.area.x && p.x <= sel.area.x + sel.area.width &&
                            p.y >= sel.area.y && p.y <= sel.area.y + sel.area.height);
                    } else if (sel.type === "lasso") {
                        isInside = this._isPointInPoly(sel.area, [p.x, p.y]);
                    }
                    if (isInside) break;
                }

                if (isInside && this.deselectionHistory.length > 0) {
                    for (const dsel of this.deselectionHistory) {
                        const dp = BABYLON.Vector3.Project(vector, worldMatrix, dsel.transformMatrix, dsel.viewport);
                        let deselected = false;
                        if (dsel.type === "rect") {
                            deselected = (dp.x >= dsel.area.x && dp.x <= dsel.area.x + dsel.area.width &&
                                dp.y >= dsel.area.y && dp.y <= dsel.area.y + dsel.area.height);
                        } else if (dsel.type === "lasso") {
                            deselected = this._isPointInPoly(dsel.area, [dp.x, dp.y]);
                        }
                        if (deselected) { isInside = false; break; }
                    }
                }

                if (isInside) {
                    segmentIds[i] = segmentId;
                    assigned++;
                    const px = positions[i * 3], py = positions[i * 3 + 1], pz = positions[i * 3 + 2];
                    if (px < minX) minX = px; if (px > maxX) maxX = px;
                    if (py < minY) minY = py; if (py > maxY) maxY = py;
                    if (pz < minZ) minZ = pz; if (pz > maxZ) maxZ = pz;
                    // Hide the point physically by setting its position to NaN
                    positions[i * 3] = NaN;
                    positions[i * 3 + 1] = NaN;
                    positions[i * 3 + 2] = NaN;
                    anyAssigned = true;
                }
            }
            total += assigned;

            if (anyAssigned) {
                mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            }

            // Restore colors (remove red highlight), keep classification colors
            if (mesh.metadata.originalColors) {
                const finalColors = new Float32Array(mesh.metadata.originalColors);
                if (this.colorMode === "classification") {
                    const cIds = mesh.metadata.classIds;
                    const cClrs = mesh.metadata.classColors;
                    if (cIds && cClrs) {
                        for (let i = 0; i < cIds.length; i++) {
                            if (cIds[i] > 0) {
                                finalColors[i * 4] = cClrs[i * 4];
                                finalColors[i * 4 + 1] = cClrs[i * 4 + 1];
                                finalColors[i * 4 + 2] = cClrs[i * 4 + 2];
                            }
                        }
                    }
                }
                mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, finalColors);
            }
        });

        if (anyAssigned) {
            const margin = 0.05;
            this.cutHistory.push({
                segmentId,
                visible: false, // Hidden by default upon cut
                minX: minX - margin, minY: minY - margin, minZ: minZ - margin,
                maxX: maxX + margin, maxY: maxY + margin, maxZ: maxZ + margin,
                selections: this.selectionHistory.map(s => ({ ...s, transformMatrix: s.transformMatrix.clone() })),
                deselections: this.deselectionHistory.map(d => ({ ...d, transformMatrix: d.transformMatrix.clone() }))
            });
        }

        this.selectionHistory = [];
        this.deselectionHistory = [];

        // console.log(`✂️ Cut segment ${segmentId}: ${total.toLocaleString()} points assigned.`);
        return anyAssigned ? { segmentId, count: total } : null;
    }

    /**
     * Show or hide all points belonging to segmentId across all loaded nodes.
     * segmentId 0 = the main (uncut) cloud.
     */
    setSegmentVisible(segmentId, visible) {
        if (segmentId === 0) {
            this.mainCloudVisible = visible;
        }
        // Sync visibility to all history entries for this segment
        this.cutHistory.forEach(entry => {
            if (entry.segmentId === segmentId) entry.visible = visible;
        });

        // After updating the flags, recompute isVisible for every loaded node.
        // A node should be visible as long as at least one of its points is visible
        // (i.e. mainCloudVisible OR any cut segment is visible).
        const anySegmentVisible = this.mainCloudVisible || this.cutHistory.some(e => e.visible);

        this.loadedNodes.forEach((mesh) => {
            const segmentIds = mesh.metadata?.segmentIds;
            const originalPositions = mesh.metadata?.originalPositions;
            if (!segmentIds || !originalPositions) return;

            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!positions) return;

            const numPoints = positions.length / 3;
            let modified = false;

            for (let i = 0; i < numPoints; i++) {
                const pointSeg = segmentIds[i] || 0;
                if (pointSeg !== segmentId) continue;

                if (visible) {
                    positions[i * 3] = originalPositions[i * 3];
                    positions[i * 3 + 1] = originalPositions[i * 3 + 1];
                    positions[i * 3 + 2] = originalPositions[i * 3 + 2];
                } else {
                    positions[i * 3] = NaN;
                    positions[i * 3 + 1] = NaN;
                    positions[i * 3 + 2] = NaN;
                }
                modified = true;
            }

            if (modified) mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

            // Keep mesh.isVisible in sync: hide entirely only when nothing is visible,
            // show immediately when at least one segment becomes visible again.
            if (this.activeNodes.has(mesh.metadata?.nodeInfo?.name)) {
                mesh.isVisible = anySegmentVisible;
            }
        });

        // console.log(`👁️ Segment ${segmentId} → ${visible ? "visible" : "hidden"}`);
    }

    /**
     * Re-applies NaN / position-restore to a single mesh based on the current
     * mainCloudVisible and cutHistory states.  Called when a node re-enters
     * the LOD view so the outline hide/show state is honoured on fresh nodes.
     */
    _applySegmentVisibilityToMesh(mesh) {
        if (this.mainCloudVisible && this.cutHistory.every(e => e.visible)) return;

        const segmentIds = mesh.metadata?.segmentIds;
        const originalPositions = mesh.metadata?.originalPositions;
        if (!segmentIds || !originalPositions) return;

        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        if (!positions) return;

        const numPoints = positions.length / 3;
        let modified = false;

        for (let i = 0; i < numPoints; i++) {
            const pointSeg = segmentIds[i] || 0;
            let shouldHide;

            if (pointSeg === 0) {
                shouldHide = !this.mainCloudVisible;
            } else {
                const entry = this.cutHistory.find(e => e.segmentId === pointSeg);
                shouldHide = entry ? !entry.visible : false;
            }

            if (shouldHide) {
                positions[i * 3] = NaN;
                positions[i * 3 + 1] = NaN;
                positions[i * 3 + 2] = NaN;
            } else {
                positions[i * 3] = originalPositions[i * 3];
                positions[i * 3 + 1] = originalPositions[i * 3 + 1];
                positions[i * 3 + 2] = originalPositions[i * 3 + 2];
            }
            modified = true;
        }

        if (modified) mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    }

    /**
     * Returns { segmentId, visible } for the cut segment a point belongs to, or null.
     */
    _getPointSegment(localVector) {
        if (this.cutHistory.length === 0) return null;
        const worldMatrix = this.rootTransform.getWorldMatrix();
        const x = localVector.x, y = localVector.y, z = localVector.z;

        for (let c = this.cutHistory.length - 1; c >= 0; c--) {
            const entry = this.cutHistory[c];
            if (x < entry.minX || x > entry.maxX ||
                y < entry.minY || y > entry.maxY ||
                z < entry.minZ || z > entry.maxZ) continue;

            let isInside = false;
            for (const sel of entry.selections) {
                const p = BABYLON.Vector3.Project(localVector, worldMatrix, sel.transformMatrix, sel.viewport);
                if (sel.type === "rect") {
                    if (p.x >= sel.area.x && p.x <= sel.area.x + sel.area.width &&
                        p.y >= sel.area.y && p.y <= sel.area.y + sel.area.height) {
                        isInside = true; break;
                    }
                } else if (sel.type === "lasso") {
                    if (this._isPointInPoly(sel.area, [p.x, p.y])) { isInside = true; break; }
                }
            }
            if (!isInside) continue;

            for (const dsel of entry.deselections) {
                const dp = BABYLON.Vector3.Project(localVector, worldMatrix, dsel.transformMatrix, dsel.viewport);
                if (dsel.type === "rect") {
                    if (dp.x >= dsel.area.x && dp.x <= dsel.area.x + dsel.area.width &&
                        dp.y >= dsel.area.y && dp.y <= dsel.area.y + dsel.area.height) {
                        isInside = false; break;
                    }
                } else if (dsel.type === "lasso") {
                    if (this._isPointInPoly(dsel.area, [dp.x, dp.y])) { isInside = false; break; }
                }
            }

            if (isInside) return { segmentId: entry.segmentId, visible: entry.visible };
        }
        return null;
    }

    /**
     * Clear selection highlight and history.
     * Does NOT touch classificationHistory — classifications are permanent until clearClassifications().
     */
    clearSelection() {
        this.selectionHistory = [];
        this.deselectionHistory = [];
        this.selectionInverted = false;
        this.loadedNodes.forEach((mesh) => {
            const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            const originalColors = mesh.metadata?.originalColors;
            const classIds = mesh.metadata?.classIds;
            const classColors = mesh.metadata?.classColors;
            if (!colors || !originalColors) return;

            const numPoints = colors.length / 4;
            for (let i = 0; i < numPoints; i++) {
                const isRed = (
                    colors[i * 4] > 0.9 &&
                    colors[i * 4 + 1] < 0.1 &&
                    colors[i * 4 + 2] < 0.1
                );
                if (!isRed) continue;

                if (classIds && classIds[i] > 0 && classColors) {
                    colors[i * 4] = classColors[i * 4];
                    colors[i * 4 + 1] = classColors[i * 4 + 1];
                    colors[i * 4 + 2] = classColors[i * 4 + 2];
                    colors[i * 4 + 3] = 1.0;
                } else {
                    colors[i * 4] = originalColors[i * 4];
                    colors[i * 4 + 1] = originalColors[i * 4 + 1];
                    colors[i * 4 + 2] = originalColors[i * 4 + 2];
                    colors[i * 4 + 3] = originalColors[i * 4 + 3];
                }
            }
            mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
        });
        // console.log("🧹 Selection cleared.");
    }

    /**
     * Invert the current selection.
     * Points inside selectionHistory regions become unselected,
     * points outside become selected (red).
     * Sets a flag so newly loaded LOD nodes are colored correctly too.
     */
    invertSelection() {
        if (this.selectionHistory.length === 0) {
            console.warn("⚠️ No active selection to invert.");
            return;
        }

        this.selectionInverted = !this.selectionInverted;

        let totalNowSelected = 0;

        this.loadedNodes.forEach((mesh) => {
            if (!mesh || !mesh.isVisible) return;

            const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const originalColors = mesh.metadata?.originalColors;
            if (!colors || !positions || !originalColors) return;

            const numPoints = colors.length / 4;
            for (let i = 0; i < numPoints; i++) {
                if (isNaN(positions[i * 3])) continue; // skip NaN-masked hidden points

                const isRed = (colors[i * 4] > 0.9 && colors[i * 4 + 1] < 0.1 && colors[i * 4 + 2] < 0.1);

                if (isRed) {
                    // Was selected → restore original color
                    colors[i * 4] = originalColors[i * 4];
                    colors[i * 4 + 1] = originalColors[i * 4 + 1];
                    colors[i * 4 + 2] = originalColors[i * 4 + 2];
                    colors[i * 4 + 3] = originalColors[i * 4 + 3];
                } else {
                    // Was not selected → mark red
                    colors[i * 4] = 1.0;
                    colors[i * 4 + 1] = 0.0;
                    colors[i * 4 + 2] = 0.0;
                    colors[i * 4 + 3] = 1.0;
                    totalNowSelected++;
                }
            }
            mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
        });

        // console.log(`🔄 Selection inverted (inverted=${this.selectionInverted}). ${totalNowSelected.toLocaleString()} points now selected.`);
    }

    /**
     * Remove selection from points inside the given region (CTRL+select).
     *
     * - Finds all loaded-node points that fall inside the region using the same
     *   2D-projection approach as applySelection.
     * - Resets their vertex color to originalColors (or class color if classified
     *   and colorMode === "classification").
     * - Also removes from selectionHistory any previously added region that
     *   overlaps — keeping the history consistent.
     */
    removeSelection(type, area) {
        if (!this.scene.activeCamera) return 0;

        const camera = this.scene.activeCamera;
        const engine = this.scene.getEngine();
        const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
        const transformMatrix = this.scene.getTransformMatrix().clone();

        let totalDeselected = 0;

        this.loadedNodes.forEach((mesh) => {
            const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!colors || !positions) return;

            const originalColors = mesh.metadata?.originalColors;
            const classIds = mesh.metadata?.classIds;
            const classColors = mesh.metadata?.classColors;
            const meshWorldMatrix = mesh.getWorldMatrix();
            let modified = false;

            for (let i = 0; i < positions.length / 3; i++) {
                // Only act on currently-selected (red) points
                if (!(colors[i * 4] > 0.9 && colors[i * 4 + 1] < 0.1 && colors[i * 4 + 2] < 0.1)) continue;

                const vector = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                const projection = BABYLON.Vector3.Project(vector, meshWorldMatrix, transformMatrix, viewport);

                let isInside = false;
                if (type === "rect") {
                    isInside = (
                        projection.x >= area.x && projection.x <= area.x + area.width &&
                        projection.y >= area.y && projection.y <= area.y + area.height
                    );
                } else if (type === "lasso") {
                    isInside = this._isPointInPoly(area, [projection.x, projection.y]);
                }

                if (isInside) {
                    // Restore: class color if classified + classification mode, else original
                    const hasClass = classIds && classIds[i] > 0 && classColors;
                    if (hasClass && this.colorMode === "classification") {
                        colors[i * 4] = classColors[i * 4];
                        colors[i * 4 + 1] = classColors[i * 4 + 1];
                        colors[i * 4 + 2] = classColors[i * 4 + 2];
                        colors[i * 4 + 3] = 1.0;
                    } else if (originalColors) {
                        colors[i * 4] = originalColors[i * 4];
                        colors[i * 4 + 1] = originalColors[i * 4 + 1];
                        colors[i * 4 + 2] = originalColors[i * 4 + 2];
                        colors[i * 4 + 3] = originalColors[i * 4 + 3];
                    }
                    totalDeselected++;
                    modified = true;
                }
            }

            if (modified) mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
        });

        // Register the deselection region in history with the current camera state.
        // Does NOT modify selectionHistory — original regions remain intact to allow
        // classification of the remaining points.
        this.deselectionHistory.push({ type, area, viewport, transformMatrix });

        // console.log(`🔴 Deselected ${totalDeselected.toLocaleString()} points. deselectionHistory: ${this.deselectionHistory.length} region(s).`);
        return totalDeselected;
    }

    /**
     * Clear all classifications. Resets classificationHistory and per-mesh class data.
     */
    clearClassifications() {
        this.classificationHistory = [];
        this.loadedNodes.forEach((mesh) => {
            if (!mesh.metadata) return;
            const numPoints = mesh.metadata.classIds?.length || 0;
            mesh.metadata.classIds = new Int32Array(numPoints);
            mesh.metadata.classColors = new Float32Array(numPoints * 4);
            if (mesh.metadata.originalColors) {
                mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, new Float32Array(mesh.metadata.originalColors));
            }
        });
        // console.log("🗑️ All classifications cleared.");
    }

    /**
     * Assign currently selected points to an existing segment.
     * segmentId 0 = return to main cloud.
     */
    assignSelectionToSegment(segmentId) {
        if (this.selectionHistory.length === 0) return 0;

        const worldMatrix = this.rootTransform.getWorldMatrix();
        let totalAssigned = 0;
        let isVisible = (segmentId === 0) ? this.mainCloudVisible : true;

        if (segmentId > 0) {
            const entry = this.cutHistory.find(c => c.segmentId === segmentId);
            if (entry) isVisible = entry.visible;
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        let anyPoints = false;

        this.loadedNodes.forEach(mesh => {
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const originalPositions = mesh.metadata.originalPositions;
            const segmentIds = mesh.metadata.segmentIds;
            if (!positions || !originalPositions || !segmentIds) return;

            let modified = false;

            for (let i = 0; i < segmentIds.length; i++) {
                const vector = new BABYLON.Vector3(originalPositions[i * 3], originalPositions[i * 3 + 1], originalPositions[i * 3 + 2]);
                let isInside = false;
                for (const sel of this.selectionHistory) {
                    const p = BABYLON.Vector3.Project(vector, worldMatrix, sel.transformMatrix, sel.viewport);
                    if (sel.type === "rect") {
                        isInside = (p.x >= sel.area.x && p.x <= sel.area.x + sel.area.width &&
                            p.y >= sel.area.y && p.y <= sel.area.y + sel.area.height);
                    } else if (sel.type === "lasso") {
                        isInside = this._isPointInPoly(sel.area, [p.x, p.y]);
                    }
                    if (isInside) break;
                }

                if (isInside && this.deselectionHistory.length > 0) {
                    for (const dsel of this.deselectionHistory) {
                        const dp = BABYLON.Vector3.Project(vector, worldMatrix, dsel.transformMatrix, dsel.viewport);
                        let deselected = false;
                        if (dsel.type === "rect") {
                            deselected = (dp.x >= dsel.area.x && dp.x <= dsel.area.x + dsel.area.width &&
                                dp.y >= dsel.area.y && dp.y <= dsel.area.y + dsel.area.height);
                        } else if (dsel.type === "lasso") {
                            deselected = this._isPointInPoly(dsel.area, [dp.x, dp.y]);
                        }
                        if (deselected) { isInside = false; break; }
                    }
                }

                if (isInside) {
                    segmentIds[i] = segmentId;
                    totalAssigned++;
                    modified = true;
                    anyPoints = true;
                    const px = originalPositions[i * 3], py = originalPositions[i * 3 + 1], pz = originalPositions[i * 3 + 2];
                    if (px < minX) minX = px; if (px > maxX) maxX = px;
                    if (py < minY) minY = py; if (py > maxY) maxY = py;
                    if (pz < minZ) minZ = pz; if (pz > maxZ) maxZ = pz;

                    if (isVisible) {
                        positions[i * 3] = px; positions[i * 3 + 1] = py; positions[i * 3 + 2] = pz;
                    } else {
                        positions[i * 3] = NaN; positions[i * 3 + 1] = NaN; positions[i * 3 + 2] = NaN;
                    }
                }
            }
            if (modified) {
                mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
                this._resetSelectionColors(mesh);
            }
        });

        if (anyPoints) {
            const margin = 0.05;
            this.cutHistory.push({
                segmentId,
                visible: isVisible,
                minX: minX - margin, minY: minY - margin, minZ: minZ - margin,
                maxX: maxX + margin, maxY: maxY + margin, maxZ: maxZ + margin,
                selections: this.selectionHistory.map(s => ({ ...s, transformMatrix: s.transformMatrix.clone() })),
                deselections: this.deselectionHistory.map(d => ({ ...d, transformMatrix: d.transformMatrix.clone() }))
            });
        }

        this.selectionHistory = [];
        this.deselectionHistory = [];
        return totalAssigned;
    }

    /**
     * Build and return an array of { point_id, element } for all points 
     * Build and return an array of { point_id, element } for all points
     * in the entire cloud that belong to a mapped segment.
     * Traverse the octree to find all points across all levels of detail.
     */
    async exportAllTrainingData(segmentNameMap) {
        const totalPoints = this.metadata.points;
        const buffer = new Uint8Array(totalPoints * 2); // Interleaved: [segId, classId, segId, classId, ...]
        const seenIds = new Set();
        let totalProcessed = 0;
        let skippedNoId = 0;
        let duplicates = 0;

        // Identify which segments the user actually cares about (including segment 0)
        const requestedIds = Object.keys(segmentNameMap).map(id => parseInt(id, 10));
        if (requestedIds.length === 0) return null;

        const includeSegmentZero = segmentNameMap[0] !== undefined;

        // Helper: Is this node worth visiting?
        const shouldVisit = (node) => {
            if (includeSegmentZero) return true;
            return this.cutHistory.some(region => {
                if (!segmentNameMap[region.segmentId]) return false;
                return (node.boundingBox.min[0] <= region.maxX && node.boundingBox.max[0] >= region.minX &&
                    node.boundingBox.min[1] <= region.maxY && node.boundingBox.max[1] >= region.minY &&
                    node.boundingBox.min[2] <= region.maxZ && node.boundingBox.max[2] >= region.minZ);
            });
        };

        const traverse = async (node) => {
            if (!shouldVisit(node)) return;

            // Proxy node? Expand hierarchy
            if (node.nodeType === 2) {
                this._ensureHierarchyLoaded(node);
            }

            // Is this node already loaded in the scene?
            const mesh = this.loadedNodes.get(node.name);
            if (mesh && mesh.metadata && mesh.metadata.pointIds && mesh.metadata.segmentIds) {
                const segmentIds = mesh.metadata.segmentIds;
                const classIds = mesh.metadata.classIds || new Int32Array(mesh.metadata.pointIds.length);
                const pointIds = mesh.metadata.pointIds;
                for (let i = 0; i < pointIds.length; i++) {
                    const pid = pointIds[i];
                    totalProcessed++;
                    if (pid === -1 || pid >= totalPoints) {
                        skippedNoId++;
                        continue;
                    }
                    if (seenIds.has(pid)) {
                        duplicates++;
                        continue;
                    }

                    const segId = segmentIds[i] || 0;
                    if (segmentNameMap[segId]) {
                        seenIds.add(pid);
                        buffer[pid * 2] = segId;
                        buffer[pid * 2 + 1] = classIds[i] || 0;
                    }
                }
            } else if (node.numPoints > 0) {
                // Fetch and parse points for this node
                const nodeBuffer = await this._fetchRange("octree.bin", node.byteOffset, node.byteSize);
                if (nodeBuffer) {
                    const points = this._parsePointsFromBufferDirect(node, nodeBuffer);
                    for (const p of points) {
                        totalProcessed++;
                        if (p.id === -1 || p.id >= totalPoints) {
                            skippedNoId++;
                            continue;
                        }
                        if (seenIds.has(p.id)) {
                            duplicates++;
                            continue;
                        }

                        const seg = this._getPointSegment(p.pos);
                        const finalSegId = seg ? seg.segmentId : 0;

                        if (segmentNameMap[finalSegId]) {
                            seenIds.add(p.id);
                            buffer[p.id * 2] = finalSegId;

                            const cls = this._getPointClassification(p.pos);
                            buffer[p.id * 2 + 1] = cls ? cls.classId : 0;
                        }
                    }
                }
            }

            // Subdivide (processed sequentially to avoid ERR_INSUFFICIENT_RESOURCES)
            for (const child of node.children) {
                if (child) await traverse(child);
            }
        };

        console.log("🚀 Starting global octree traversal (2-Channel Binary Mode)...");
        await traverse(this.root);
        console.log(`✅ Global traversal finished.`);
        console.log(`   - Total points in octree nodes: ${totalProcessed.toLocaleString()}`);
        console.log(`   - Unique points assigned in buffer: ${seenIds.size.toLocaleString()}`);
        console.log(`   - Points skipped: ${skippedNoId.toLocaleString()} (no ID), ${duplicates.toLocaleString()} (duplicates)`);

        return {
            buffer: buffer,
            segmentMap: segmentNameMap
        };
    }

    /**
     * Lightweight point parser that returns { pos: Vector3, id: number }[]
     */
    _parsePointsFromBufferDirect(node, buffer) {
        const view = new DataView(buffer);
        const numPoints = node.numPoints;
        const results = [];

        const scale = this.metadata.scale;
        const metaOffset = this.metadata.offset;
        const bbMin = this.metadata.boundingBox.min;

        let posAttr = null;
        let pointIdAttr = null;
        for (const attr of this.attributes) {
            const lowName = attr.name.toLowerCase();
            if (lowName === "position") posAttr = attr;
            if (lowName === "point_id" || lowName === "pointid") {
                pointIdAttr = attr;
            }
        }
        if (!posAttr) return [];

        for (let j = 0; j < numPoints; j++) {
            const pointOffset = j * this.bytesPerPoint;
            if (pointOffset + posAttr.byteOffset + 12 > buffer.byteLength) break;

            const rawX = view.getInt32(pointOffset + posAttr.byteOffset + 0, true);
            const rawY = view.getInt32(pointOffset + posAttr.byteOffset + 4, true);
            const rawZ = view.getInt32(pointOffset + posAttr.byteOffset + 8, true);

            const x = (rawX * scale[0]) + metaOffset[0] - bbMin[0];
            const y = (rawY * scale[1]) + metaOffset[1] - bbMin[1];
            const z = (rawZ * scale[2]) + metaOffset[2] - bbMin[2];

            let pid = -1;
            if (pointIdAttr && pointOffset + pointIdAttr.byteOffset + 4 <= buffer.byteLength) {
                pid = view.getInt32(pointOffset + pointIdAttr.byteOffset, true);
            }

            results.push({ pos: new BABYLON.Vector3(x, y, z), id: pid });
        }
        return results;
    }

    /**
     * Build and return an array of { point_id, element } for all loaded points
     * that belong to a mapped segment. (Legacy/LOD-limited version)
     */
    exportTrainingData(segmentNameMap) {
        const result = [];
        const seenIds = new Set();

        this.loadedNodes.forEach(mesh => {
            if (!mesh.metadata || !mesh.metadata.segmentIds || !mesh.metadata.pointIds) return;
            const segmentIds = mesh.metadata.segmentIds;
            const pointIds = mesh.metadata.pointIds;

            for (let i = 0; i < segmentIds.length; i++) {
                const segId = segmentIds[i];
                if (segId > 0 && segmentNameMap[segId]) {
                    const pid = pointIds[i];
                    if (pid !== undefined && pid !== -1 && !seenIds.has(pid)) {
                        seenIds.add(pid);
                        result.push({ point_id: pid, element: segmentNameMap[segId] });
                    }
                }
            }
        });

        return result;
    }

    /**
     * Remove selection from a specific segment (moves it back to main cloud 0).
     */
    removeSelectionFromSegment(segmentId) {
        if (this.selectionHistory.length === 0) return 0;

        const worldMatrix = this.rootTransform.getWorldMatrix();
        let totalRemoved = 0;

        this.loadedNodes.forEach(mesh => {
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const originalPositions = mesh.metadata.originalPositions;
            const segmentIds = mesh.metadata.segmentIds;
            if (!positions || !originalPositions || !segmentIds) return;

            let modified = false;
            for (let i = 0; i < segmentIds.length; i++) {
                if (segmentIds[i] !== segmentId) continue;

                const vector = new BABYLON.Vector3(originalPositions[i * 3], originalPositions[i * 3 + 1], originalPositions[i * 3 + 2]);
                let isInside = false;
                for (const sel of this.selectionHistory) {
                    const p = BABYLON.Vector3.Project(vector, worldMatrix, sel.transformMatrix, sel.viewport);
                    if (sel.type === "rect") {
                        isInside = (p.x >= sel.area.x && p.x <= sel.area.x + sel.area.width &&
                            p.y >= sel.area.y && p.y <= sel.area.y + sel.area.height);
                    } else if (sel.type === "lasso") {
                        isInside = this._isPointInPoly(sel.area, [p.x, p.y]);
                    }
                    if (isInside) break;
                }

                if (isInside) {
                    segmentIds[i] = 0;
                    totalRemoved++;
                    modified = true;
                    if (this.mainCloudVisible) {
                        positions[i * 3] = originalPositions[i * 3];
                        positions[i * 3 + 1] = originalPositions[i * 3 + 1];
                        positions[i * 3 + 2] = originalPositions[i * 3 + 2];
                    } else {
                        positions[i * 3] = NaN; positions[i * 3 + 1] = NaN; positions[i * 3 + 2] = NaN;
                    }
                }
            }
            if (modified) {
                mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
                this._resetSelectionColors(mesh);
            }
        });

        // Update history: add these regions as deselection to all entries of this segmentId
        this.cutHistory.forEach(entry => {
            if (entry.segmentId === segmentId) {
                this.selectionHistory.forEach(s => entry.deselections.push({ ...s, transformMatrix: s.transformMatrix.clone() }));
            }
        });

        this.selectionHistory = [];
        this.deselectionHistory = [];
        return totalRemoved;
    }

    /**
     * Delete a segment and move all its points back to the main cloud (segment 0).
     */
    deleteSegment(segmentId) {
        if (segmentId === 0) return;

        this.cutHistory = this.cutHistory.filter(c => c.segmentId !== segmentId);

        this.loadedNodes.forEach(mesh => {
            const segmentIds = mesh.metadata.segmentIds;
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const originalPositions = mesh.metadata.originalPositions;
            if (!segmentIds || !positions || !originalPositions) return;

            let modified = false;
            for (let i = 0; i < segmentIds.length; i++) {
                if (segmentIds[i] === segmentId) {
                    segmentIds[i] = 0;
                    modified = true;
                    if (this.mainCloudVisible) {
                        positions[i * 3] = originalPositions[i * 3];
                        positions[i * 3 + 1] = originalPositions[i * 3 + 1];
                        positions[i * 3 + 2] = originalPositions[i * 3 + 2];
                    } else {
                        positions[i * 3] = NaN; positions[i * 3 + 1] = NaN; positions[i * 3 + 2] = NaN;
                    }
                }
            }
            if (modified) mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        });
    }

    _resetSelectionColors(mesh) {
        const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
        if (!colors) return;
        const orgClrs = mesh.metadata.originalColors;
        const clsIds = mesh.metadata.classIds;
        const clsClrs = mesh.metadata.classColors;
        let mod = false;
        for (let i = 0; i < colors.length / 4; i++) {
            if (colors[i * 4] > 0.9 && colors[i * 4 + 1] < 0.1 && colors[i * 4 + 2] < 0.1) {
                if (this.colorMode === "classification" && clsIds && clsIds[i] > 0) {
                    colors[i * 4] = clsClrs[i * 4];
                    colors[i * 4 + 1] = clsClrs[i * 4 + 1];
                    colors[i * 4 + 2] = clsClrs[i * 4 + 2];
                } else if (orgClrs) {
                    colors[i * 4] = orgClrs[i * 4];
                    colors[i * 4 + 1] = orgClrs[i * 4 + 1];
                    colors[i * 4 + 2] = orgClrs[i * 4 + 2];
                }
                colors[i * 4 + 3] = 1.0;
                mod = true;
            }
        }
        if (mod) mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
    }

} // END class Potree2Loader


// =====================================================================
// PUBLIC HELPER FUNCTIONS
// =====================================================================

export async function loadPotree2PointCloud(basePath, scene, options = {}) {
    // console.log("🚀 loadPotree2PointCloud:", basePath);

    const loader = new Potree2Loader(scene, basePath, options);
    await loader.load();

    const camera = scene.activeCamera;
    if (camera) {
        const bbMin = loader.metadata.boundingBox.min;
        const bbMax = loader.metadata.boundingBox.max;
        const localCenter = new BABYLON.Vector3(
            (bbMax[0] - bbMin[0]) / 2,
            (bbMax[1] - bbMin[1]) / 2,
            (bbMax[2] - bbMin[2]) / 2
        );
        const localSize = new BABYLON.Vector3(
            bbMax[0] - bbMin[0],
            bbMax[1] - bbMin[1],
            bbMax[2] - bbMin[2]
        );
        const radius = localSize.length() * 0.7;

        // console.log(`📷 Camera: target=${localCenter}, radius=${radius.toFixed(1)}`);
        camera.setTarget(localCenter);
        camera.radius = radius;
        camera.minZ = 0.1;
        camera.maxZ = radius * 10;

        let lastUpdate = 0;
        const updateThrottle = 200;

        camera.onViewMatrixChangedObservable.add(() => {
            const now = Date.now();
            if (now - lastUpdate > updateThrottle) {
                loader.update(camera);
                lastUpdate = now;
            }
        });

        setInterval(() => loader.cleanup(200), 30000);
    }

    scene.potree2Loader = loader;

    // Notify main.js that attribute list is ready, so it can populate the color menu
    window.dispatchEvent(new CustomEvent('potree2-loaded', { detail: { loader } }));

    if (window.__registerPointCloudInOutline) {
        window.__registerPointCloudInOutline(loader.rootTransform, "Potree 2.0 Cloud");
    }

    console.log(`✅ Potree2Loader ready: ${loader.loadedNodes.size} nodes loaded, ${loader.activeNodes.size} visible`);
    return loader.getRoot();
}

export function getPotree2Loader(scene) {
    return scene.potree2Loader || null;
}