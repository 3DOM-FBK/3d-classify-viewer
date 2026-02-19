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

    // X axis (bit 2)
    if (childIndex & 0b100) {
        min[0] += size[0] / 2;
    } else {
        max[0] -= size[0] / 2;
    }

    // Y axis (bit 1)
    if (childIndex & 0b010) {
        min[1] += size[1] / 2;
    } else {
        max[1] -= size[1] / 2;
    }

    // Z axis (bit 0)
    if (childIndex & 0b001) {
        min[2] += size[2] / 2;
    } else {
        max[2] -= size[2] / 2;
    }

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
        this.baseUrl = baseUrl;         // e.g. "static/viewer/data/clusters"
        this.metadata = null;
        this.root = null;
        this.rootTransform = new BABYLON.TransformNode("Potree2Root", scene);

        // Derive the Range request endpoint from the baseUrl
        // We strip the prefix "static/viewer/data/" (with or without leading slash) 
        // to get the relative path for the Django endpoint.
        // Example: "/static/viewer/data/clusters" -> "clusters"
        const prefixes = ["/static/viewer/data/", "static/viewer/data/"];
        let foundPrefix = false;
        for (const prefix of prefixes) {
            if (baseUrl.startsWith(prefix)) {
                this.rangeBasePath = baseUrl.substring(prefix.length);
                foundPrefix = true;
                break;
            }
        }

        if (!foundPrefix) {
            this.rangeBasePath = baseUrl;
        }

        // Clean up leading/trailing slashes in rangeBasePath to avoid double slashes in URL
        this.rangeBasePath = this.rangeBasePath.replace(/^\/+|\/+$/g, '');

        // Parsed attributes info
        this.attributes = [];
        this.bytesPerPoint = 0;

        // Full hierarchy.bin buffer (small enough to load entirely)
        this.hierarchyBuffer = null;

        // Maps
        this.loadedNodes = new Map();   // name → mesh
        this.activeNodes = new Set();   // currently visible node names
        this.loadingNodes = new Set();  // currently loading node names

        // Options
        this.pointSize = options.pointSize || 2;
        this.maxVisibleNodes = options.maxVisibleNodes || 500;
        this.maxVisiblePoints = options.maxVisiblePoints || 5_000_000;
        this.maxConcurrentLoads = options.maxConcurrentLoads || 6;

        // Stats
        this.stats = {
            loadedNodes: 0,
            visibleNodes: 0,
            totalPointsRendered: 0,
            loadingNodes: 0
        };

        // Persistent Selection History
        this.selectionHistory = []; // { type: 'rect'|'lasso', area: ... }
    }

    // ========== PUBLIC API ==========

    /**
     * Load metadata, hierarchy, and prepare for rendering.
     */
    async load() {
        console.log("🌲 Potree2Loader: Loading from", this.baseUrl);

        // 1. Load metadata.json (small file, normal fetch is fine)
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

        // 2. Parse attribute layout
        this._parseAttributes();

        // 3. Load hierarchy.bin (usually small, a few hundred KB to a few MB)
        console.log("📂 Loading hierarchy.bin...");
        const hierUrl = this._getRangeUrl("hierarchy.bin");
        const hierResponse = await fetch(hierUrl);
        if (!hierResponse.ok) throw new Error(`Failed to load hierarchy.bin: ${hierResponse.status}`);
        this.hierarchyBuffer = await hierResponse.arrayBuffer();
        console.log(`   hierarchy.bin loaded: ${this.hierarchyBuffer.byteLength.toLocaleString()} bytes`);

        // 4. Build the octree from hierarchy
        const bbMin = this.metadata.boundingBox.min;
        const bbMax = this.metadata.boundingBox.max;
        const localBB = {
            min: [0, 0, 0],
            max: [bbMax[0] - bbMin[0], bbMax[1] - bbMin[1], bbMax[2] - bbMin[2]]
        };

        this.root = new Potree2Node("r", localBB);
        this.root.nodeType = 2; // root starts as proxy
        this.root.hierarchyByteOffset = 0n;
        this.root.hierarchyByteSize = BigInt(this.metadata.hierarchy.firstChunkSize);
        this.root.spacing = this.metadata.spacing;

        // Parse initial hierarchy chunk
        this._parseHierarchyChunk(this.root);

        // Stats
        const allNodes = this._collectNodes(this.root);
        const levelStats = {};
        let totalNodePoints = 0;
        for (const n of allNodes) {
            if (!levelStats[n.level]) levelStats[n.level] = { count: 0, points: 0 };
            levelStats[n.level].count++;
            levelStats[n.level].points += n.numPoints;
            totalNodePoints += n.numPoints;
        }
        console.log(`✅ Hierarchy parsed: ${allNodes.length} nodes, ${totalNodePoints.toLocaleString()} total points`);
        for (const [level, data] of Object.entries(levelStats).sort((a, b) => a[0] - b[0])) {
            console.log(`   Level ${level}: ${data.count} nodes, ${data.points.toLocaleString()} points`);
        }

        // Update point count UI
        const pointCountDisplay = document.getElementById('point-count');
        if (pointCountDisplay) {
            pointCountDisplay.textContent = this.metadata.points.toLocaleString();
        }

        // 5. Load initial nodes (root + first levels) via Range requests
        await this._loadInitialNodes();

        return this.rootTransform;
    }

    /**
     * Build the URL for fetching files through the Django Range request endpoint.
     */
    _getRangeUrl(filename) {
        return `/pointcloud-data/${this.rangeBasePath}/${filename}`;
    }

    /**
     * Fetch a byte range from octree.bin via the Django endpoint.
     * Returns an ArrayBuffer containing only the requested bytes.
     */
    async _fetchRange(filename, byteOffset, byteSize) {
        const url = this._getRangeUrl(filename);
        const first = Number(byteOffset);
        const last = first + Number(byteSize) - 1;

        const response = await fetch(url, {
            headers: {
                'Range': `bytes=${first}-${last}`
            }
        });

        if (response.status === 206) {
            // Successful Range response
            return await response.arrayBuffer();
        } else if (response.ok) {
            // Server ignored Range header, returned full file
            // This shouldn't happen with our custom view, but handle gracefully
            console.warn(`⚠️ Server returned full file instead of range for ${filename}. Slicing locally.`);
            const fullBuffer = await response.arrayBuffer();
            return fullBuffer.slice(first, first + Number(byteSize));
        } else {
            throw new Error(`Range request failed for ${filename}: ${response.status} ${response.statusText}`);
        }
    }

    /**
     * Load root and first levels of nodes right away so something is visible.
     */
    async _loadInitialNodes() {
        console.log("🔄 Loading initial nodes (root + levels 0-2)...");
        const allNodes = this._collectNodes(this.root);

        // Select nodes at levels 0-2 with data
        const initialNodes = allNodes
            .filter(n => n.level <= 2 && n.numPoints > 0 && n.byteSize > 0n)
            .sort((a, b) => a.level - b.level || b.numPoints - a.numPoints);

        console.log(`   Will load ${initialNodes.length} initial nodes via Range requests`);

        // Load in batches to avoid too many concurrent requests
        const batchSize = 6;
        for (let i = 0; i < initialNodes.length; i += batchSize) {
            const batch = initialNodes.slice(i, i + batchSize);
            await Promise.all(batch.map(node => this._loadNode(node)));
        }

        // Make all loaded initial nodes visible
        for (const node of initialNodes) {
            if (this.loadedNodes.has(node.name)) {
                const mesh = this.loadedNodes.get(node.name);
                mesh.isVisible = true;
                this.activeNodes.add(node.name);
            }
        }

        this.stats.visibleNodes = this.activeNodes.size;
        console.log(`✅ Initial load complete: ${this.loadedNodes.size} meshes visible`);
    }

    /**
     * Load a single node's data from octree.bin using a Range request.
     */
    async _loadNode(node) {
        if (this.loadedNodes.has(node.name) || this.loadingNodes.has(node.name)) return;
        if (node.byteSize === 0n || node.numPoints === 0) return;
        if (this.loadingNodes.size >= this.maxConcurrentLoads) return;

        this.loadingNodes.add(node.name);
        this.stats.loadingNodes = this.loadingNodes.size;

        try {
            // Fetch only this node's bytes via Range request
            const buffer = await this._fetchRange("octree.bin", node.byteOffset, node.byteSize);

            // Verify expected size
            const expectedBytes = node.numPoints * this.bytesPerPoint;
            let numPoints = node.numPoints;
            if (buffer.byteLength < expectedBytes) {
                console.warn(`⚠️ Node ${node.name}: got ${buffer.byteLength}B, expected ${expectedBytes}B`);
                numPoints = Math.floor(buffer.byteLength / this.bytesPerPoint);
                if (numPoints === 0) return;
                node.numPoints = numPoints;
            }

            // Decode and create mesh
            this._createMeshFromBuffer(node, buffer);
            this.stats.loadedNodes++;

            if (this.stats.loadedNodes <= 30 || this.stats.loadedNodes % 50 === 0) {
                console.log(`   ✅ Node ${node.name} (L${node.level}): ${node.numPoints.toLocaleString()} pts`);
            }
        } catch (err) {
            console.error(`❌ Failed to load node ${node.name}:`, err);
        } finally {
            this.loadingNodes.delete(node.name);
            this.stats.loadingNodes = this.loadingNodes.size;
        }
    }

    /**
     * Update LOD: decides which nodes to show/hide/load based on camera.
     */
    update(camera) {
        if (!this.root || !camera) return;

        const priorityQueue = [];
        const nodesToShow = new Set();
        let totalPoints = 0;

        // Traverse the octree, selecting visible nodes by screen-space error
        this._traverseForLOD(this.root, camera, priorityQueue);

        // Sort by priority (higher = more important)
        priorityQueue.sort((a, b) => b.priority - a.priority);

        // Select nodes respecting budget
        for (const entry of priorityQueue) {
            if (nodesToShow.size >= this.maxVisibleNodes) break;
            if (totalPoints + entry.node.numPoints > this.maxVisiblePoints) continue;

            nodesToShow.add(entry.node.name);
            totalPoints += entry.node.numPoints;

            // Load if not already loaded (async, via Range request)
            if (!this.loadedNodes.has(entry.node.name) &&
                !this.loadingNodes.has(entry.node.name)) {
                this._loadNode(entry.node); // fire-and-forget, will show on next update
            }
        }

        // Show/hide nodes
        for (const [name, mesh] of this.loadedNodes) {
            const shouldShow = nodesToShow.has(name);
            if (mesh.isVisible !== shouldShow) {
                mesh.isVisible = shouldShow;
            }
            if (shouldShow) {
                this.activeNodes.add(name);
            } else {
                this.activeNodes.delete(name);
            }
        }

        // Update stats
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

    getStats() {
        return {
            ...this.stats,
            loadedNodes: this.loadedNodes.size
        };
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
        console.log("📋 Attributes:", this.attributes.map(a => `${a.name}(${a.type}, ${a.size}B)`).join(", "));
        console.log("   Bytes per point:", this.bytesPerPoint);
    }

    // ========== HIERARCHY PARSING ==========

    /**
     * Parse a hierarchy chunk from hierarchy.bin buffer.
     * Potree 2.0 format: 22 bytes per node, BFS order.
     */
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

            if (current.nodeType === 2) {
                continue;
            }

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
            if (child) {
                result.push(...this._collectNodes(child));
            }
        }
        return result;
    }

    // ========== LOD TRAVERSAL ==========

    _traverseForLOD(node, camera, priorityQueue) {
        if (!node || node.numPoints === 0) return;

        if (node.nodeType === 2) {
            this._ensureHierarchyLoaded(node);
        }

        const sse = this._calculateSSE(node, camera);

        if (node.name === "r" || sse > 1.0) {
            priorityQueue.push({ node, priority: sse });

            if (sse > 2.0) {
                for (const child of node.children) {
                    if (child) {
                        this._traverseForLOD(child, camera, priorityQueue);
                    }
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

        const projectedSize = (node.spacing / distance) * (screenWidth / (2 * slope));
        return projectedSize;
    }

    _getLocalCenter(node) {
        const bb = node.boundingBox;
        const cx = (bb.min[0] + bb.max[0]) / 2;
        const cy = (bb.min[1] + bb.max[1]) / 2;
        const cz = (bb.min[2] + bb.max[2]) / 2;
        return new BABYLON.Vector3(cx, cy, cz);
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

        for (const attr of this.attributes) {
            if (attr.name === "position") posAttr = attr;
            if (attr.name === "rgb") rgbAttr = attr;
        }

        if (!posAttr) {
            console.error("No position attribute found!");
            return;
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let j = 0; j < numPoints; j++) {
            const pointOffset = j * this.bytesPerPoint;

            if (pointOffset + posAttr.byteOffset + 12 > buffer.byteLength) break;

            // Decode position: (rawInt32 * scale) + offset - bbMin
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

            // Apply persistent selection history to newly loaded points
            if (this.selectionHistory.length > 0) {
                const vector = new BABYLON.Vector3(positions[3 * j], positions[3 * j + 1], positions[3 * j + 2]);
                if (this._isPointInSelectionHistory(vector, node)) {
                    colors[4 * j + 0] = 1.0; // Red highlight
                    colors[4 * j + 1] = 0.0;
                    colors[4 * j + 2] = 0.0;
                }
            }
        }

        // Debug bounds for first few nodes
        if (this.stats.loadedNodes < 5) {
            console.log(`   📐 Node ${node.name} bounds: X[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y[${minY.toFixed(2)}, ${maxY.toFixed(2)}] Z[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
        }

        // Create BabylonJS mesh
        const mesh = new BABYLON.Mesh(`potree2_${node.name}`, this.scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.colors = colors;
        vertexData.applyToMesh(mesh);

        const mat = new BABYLON.StandardMaterial(`mat_p2_${node.name}`, this.scene);
        mat.pointsCloud = true;
        mat.pointSize = this.pointSize;
        mat.disableLighting = true;
        mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        mesh.material = mat;

        mesh.parent = this.rootTransform;
        mesh.isVisible = false;
        mesh.isPickable = true;

        mesh.metadata = {
            nodeInfo: {
                name: node.name,
                level: node.level,
                numPoints: node.numPoints
            },
            originalColors: new Float32Array(colors),
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

        if (toRemove.length > 0) {
            console.log(`🧹 Cleaned up ${toRemove.length} nodes`);
        }
    }

    /**
     * Checks if a 3D point (local to node) falls into any historical 2D selection region.
     */
    _isPointInSelectionHistory(localVector, node) {
        // Use the root transform matrix
        const worldMatrix = this.rootTransform.getWorldMatrix();

        for (const sel of this.selectionHistory) {
            // Use the camera state stored at the time of selection
            const projection = BABYLON.Vector3.Project(
                localVector,
                worldMatrix,
                sel.transformMatrix,
                sel.viewport
            );

            if (sel.type === "rect") {
                if (projection.x >= sel.area.x && projection.x <= sel.area.x + sel.area.width &&
                    projection.y >= sel.area.y && projection.y <= sel.area.y + sel.area.height) {
                    return true;
                }
            } else if (sel.type === "lasso") {
                if (this._isPointInPoly(sel.area, [projection.x, projection.y])) {
                    return true;
                }
            }
        }
        return false;
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

    /**
     * Store a selection region and apply it to all currently loaded nodes.
     * FIX: was previously nested inside applySelection; moved to class level.
     * FIX: added missing `return totalSelected`.
     */
    applySelection(type, area) {
        // Capture current camera state
        if (!this.scene.activeCamera) return 0;

        const camera = this.scene.activeCamera;
        const engine = this.scene.getEngine();
        const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
        const transformMatrix = this.scene.getTransformMatrix().clone();

        this.selectionHistory.push({
            type,
            area,
            viewport,
            transformMatrix
        });

        console.log(`📌 Selection added to history. Total regions: ${this.selectionHistory.length}`);

        let totalSelected = 0;

        // Re-use the transform/viewport we just captured for consistency
        this.loadedNodes.forEach((mesh) => {
            const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!colors || !positions) return;

            let modified = false;

            // The mesh IS the node representation. Its world matrix includes rootTransform.
            const meshWorldMatrix = mesh.getWorldMatrix();

            for (let i = 0; i < positions.length / 3; i++) {
                const vector = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

                // Project using the captured state (NOT current camera state)
                const projection = BABYLON.Vector3.Project(
                    vector,
                    meshWorldMatrix,
                    transformMatrix,
                    viewport
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
            if (modified) {
                mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
            }
        });

        // FIX: missing return statement
        return totalSelected;
    }

    /**
     * Clear all selections and reset colors.
     * FIX: was incorrectly nested inside applySelection(); moved to class level.
     */
    clearSelection() {
        this.selectionHistory = [];
        this.loadedNodes.forEach((mesh) => {
            if (mesh.metadata && mesh.metadata.originalColors) {
                // Copy original colors to a new array to avoid reference issues
                const originalColors = mesh.metadata.originalColors;
                mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, new Float32Array(originalColors));
            }
        });
        console.log("🧹 Selection cleared.");
    }

} // END class Potree2Loader


// =====================================================================
// PUBLIC HELPER FUNCTIONS
// =====================================================================

/**
 * Load a Potree 2.0 point cloud and setup LOD updates.
 */
export async function loadPotree2PointCloud(basePath, scene, options = {}) {
    console.log("🚀 loadPotree2PointCloud:", basePath);

    const loader = new Potree2Loader(scene, basePath, options);
    await loader.load();

    // Frame camera on the loaded point cloud
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

        console.log(`📷 Camera: target=${localCenter}, radius=${radius.toFixed(1)}`);
        camera.setTarget(localCenter);
        camera.radius = radius;
        camera.minZ = 0.1;
        camera.maxZ = radius * 10;

        // Setup throttled camera observer for LOD updates
        let lastUpdate = 0;
        const updateThrottle = 200; // ms

        camera.onViewMatrixChangedObservable.add(() => {
            const now = Date.now();
            if (now - lastUpdate > updateThrottle) {
                loader.update(camera);
                lastUpdate = now;
            }
        });

        // Periodic cleanup of inactive nodes
        setInterval(() => loader.cleanup(200), 30000);
    }

    // Store reference on scene
    scene.potree2Loader = loader;

    console.log(`✅ Potree2Loader ready: ${loader.loadedNodes.size} nodes loaded, ${loader.activeNodes.size} visible`);
    return loader.getRoot();
}

/**
 * Get the Potree2 loader instance from a scene.
 */
export function getPotree2Loader(scene) {
    return scene.potree2Loader || null;
}