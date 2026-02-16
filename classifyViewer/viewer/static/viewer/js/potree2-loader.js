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
 * Key design: since Django dev server does NOT support HTTP Range requests,
 * we load the full octree.bin into memory and slice from it per-node.
 * For production, this could be switched to Range requests.
 */
export class Potree2Loader {
    constructor(scene, baseUrl, options = {}) {
        this.scene = scene;
        this.baseUrl = baseUrl;
        this.metadata = null;
        this.root = null; // Potree2Node tree root
        this.rootTransform = new BABYLON.TransformNode("Potree2Root", scene);

        // Parsed attributes info
        this.attributes = [];
        this.bytesPerPoint = 0;

        // Full binary buffers (loaded entirely into memory)
        this.hierarchyBuffer = null;
        this.octreeBuffer = null;

        // Maps
        this.loadedNodes = new Map();   // name → mesh
        this.activeNodes = new Set();   // currently visible node names
        this.loadingNodes = new Set();  // currently loading node names

        // Options
        this.pointSize = options.pointSize || 2;
        this.maxVisibleNodes = options.maxVisibleNodes || 500;
        this.maxVisiblePoints = options.maxVisiblePoints || 5_000_000;

        // Stats
        this.stats = {
            loadedNodes: 0,
            visibleNodes: 0,
            totalPointsRendered: 0,
            loadingNodes: 0
        };
    }

    // ========== PUBLIC API ==========

    /**
     * Load metadata, hierarchy, octree buffer, and prepare for rendering.
     */
    async load() {
        console.log("🌲 Potree2Loader: Loading from", this.baseUrl);

        // 1. Load metadata.json
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

        // 3. Load full hierarchy.bin into memory
        console.log("📂 Loading hierarchy.bin...");
        const hierResponse = await fetch(`${this.baseUrl}/hierarchy.bin`);
        if (!hierResponse.ok) throw new Error(`Failed to load hierarchy.bin: ${hierResponse.status}`);
        this.hierarchyBuffer = await hierResponse.arrayBuffer();
        console.log(`   hierarchy.bin loaded: ${this.hierarchyBuffer.byteLength.toLocaleString()} bytes`);

        // 4. Load full octree.bin into memory
        // Django dev server doesn't support Range requests, so we load it all.
        console.log("📦 Loading octree.bin (may take a moment for large files)...");
        const octreeResponse = await fetch(`${this.baseUrl}/octree.bin`);
        if (!octreeResponse.ok) throw new Error(`Failed to load octree.bin: ${octreeResponse.status}`);
        this.octreeBuffer = await octreeResponse.arrayBuffer();
        console.log(`   octree.bin loaded: ${(this.octreeBuffer.byteLength / 1024 / 1024).toFixed(1)} MB`);

        // 5. Parse the first hierarchy chunk to build the tree root
        const bbMin = this.metadata.boundingBox.min;
        const bbMax = this.metadata.boundingBox.max;

        // Potree subtracts offset (= bbMin) from the bounding box to work in local coords
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

        // Count total parsed nodes and log per-level stats
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

        // 6. Load initial nodes (root + level 1) immediately
        await this._loadInitialNodes();

        return this.rootTransform;
    }

    /**
     * Load root and first levels of nodes right away so something is visible.
     */
    async _loadInitialNodes() {
        console.log("🔄 Loading initial nodes (levels 0-2)...");
        const allNodes = this._collectNodes(this.root);

        // Sort by level, then by numPoints descending
        const initialNodes = allNodes
            .filter(n => n.level <= 2 && n.numPoints > 0 && n.byteSize > 0n)
            .sort((a, b) => a.level - b.level || b.numPoints - a.numPoints);

        console.log(`   Will load ${initialNodes.length} initial nodes`);

        let loaded = 0;
        for (const node of initialNodes) {
            this._loadNodeSync(node);
            loaded++;
        }

        // Make all initial nodes visible
        for (const node of initialNodes) {
            if (this.loadedNodes.has(node.name)) {
                const mesh = this.loadedNodes.get(node.name);
                mesh.isVisible = true;
                this.activeNodes.add(node.name);
            }
        }

        this.stats.visibleNodes = this.activeNodes.size;
        console.log(`✅ Initial load complete: ${loaded} nodes, ${this.loadedNodes.size} meshes`);
    }

    /**
     * Synchronously load a node from the in-memory octreeBuffer.
     */
    _loadNodeSync(node) {
        if (this.loadedNodes.has(node.name)) return;
        if (node.byteSize === 0n || node.numPoints === 0) return;

        try {
            const byteStart = Number(node.byteOffset);
            const byteEnd = byteStart + Number(node.byteSize);

            if (byteEnd > this.octreeBuffer.byteLength) {
                console.warn(`⚠️ Node ${node.name}: offset ${byteStart}-${byteEnd} exceeds octree.bin size ${this.octreeBuffer.byteLength}`);
                return;
            }

            // Slice buffer for this node
            const buffer = this.octreeBuffer.slice(byteStart, byteEnd);

            // Verify: expected bytes = numPoints * bytesPerPoint
            const expectedBytes = node.numPoints * this.bytesPerPoint;
            if (buffer.byteLength < expectedBytes) {
                console.warn(`⚠️ Node ${node.name}: buffer ${buffer.byteLength} < expected ${expectedBytes} (${node.numPoints} pts × ${this.bytesPerPoint} B/pt)`);
                // Reduce numPoints to what we actually have
                node.numPoints = Math.floor(buffer.byteLength / this.bytesPerPoint);
                if (node.numPoints === 0) return;
            }

            // Decode and create mesh
            this._createMeshFromBuffer(node, buffer);
            this.stats.loadedNodes++;

            if (this.stats.loadedNodes <= 30 || this.stats.loadedNodes % 50 === 0) {
                console.log(`   ✅ Node ${node.name} (L${node.level}): ${node.numPoints.toLocaleString()} pts @ offset ${byteStart}`);
            }
        } catch (err) {
            console.error(`❌ Failed to load node ${node.name}:`, err);
        }
    }

    /**
     * Update LOD: decides which nodes to show/hide based on camera.
     */
    update(camera) {
        if (!this.root || !camera) return;

        const priorityQueue = [];
        const nodesToShow = new Set();
        let totalPoints = 0;

        // Traverse the octree, selecting visible nodes by screen-space error
        this._traverseForLOD(this.root, camera, priorityQueue);

        // Sort by priority (higher = more important = should be loaded first)
        priorityQueue.sort((a, b) => b.priority - a.priority);

        // Select nodes respecting budget
        for (const entry of priorityQueue) {
            if (nodesToShow.size >= this.maxVisibleNodes) break;
            if (totalPoints + entry.node.numPoints > this.maxVisiblePoints) continue;

            nodesToShow.add(entry.node.name);
            totalPoints += entry.node.numPoints;

            // Load if not already loaded (synchronous from cached buffer)
            if (!this.loadedNodes.has(entry.node.name)) {
                this._loadNodeSync(entry.node);
            }
        }

        // Show/hide nodes
        let shown = 0, hidden = 0;
        for (const [name, mesh] of this.loadedNodes) {
            const shouldShow = nodesToShow.has(name);
            if (mesh.isVisible !== shouldShow) {
                mesh.isVisible = shouldShow;
                if (shouldShow) shown++;
                else hidden++;
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
        this.stats.loadingNodes = 0;
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
        this.octreeBuffer = null;
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
                size: attr.size,            // total bytes for this attribute per point
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
     *   byte 0:    type (uint8)       — 0=normal, 2=proxy
     *   byte 1:    childMask (uint8)  — 8 bits for 8 children
     *   bytes 2-5: numPoints (uint32 LE)
     *   bytes 6-13: byteOffset (BigInt64 LE) — into octree.bin (or hierarchy.bin for proxy)
     *   bytes 14-21: byteSize (BigInt64 LE)
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

        // BFS array: first entry is rootNode itself
        const nodes = new Array(numNodes);
        nodes[0] = rootNode;
        let nodePos = 1;

        for (let i = 0; i < numNodes; i++) {
            const current = nodes[i];
            if (!current) {
                console.warn(`Hierarchy parse: null node at position ${i}/${numNodes}`);
                break;
            }

            const offset = i * bytesPerNode;
            const type = view.getUint8(offset + 0);
            const childMask = view.getUint8(offset + 1);
            const numPoints = view.getUint32(offset + 2, true);
            const byteOffset = view.getBigInt64(offset + 6, true);
            const byteSize = view.getBigInt64(offset + 14, true);

            if (current.nodeType === 2) {
                // This was a proxy node — now fill in real data
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            } else if (type === 2) {
                // New proxy node: byteOffset/Size refer to hierarchy.bin chunk
                current.hierarchyByteOffset = byteOffset;
                current.hierarchyByteSize = byteSize;
                current.numPoints = numPoints;
            } else {
                // Normal node
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            }

            current.nodeType = type;
            current.childMask = childMask;

            // If this is a proxy node (type 2), don't expand children now
            if (current.nodeType === 2) {
                continue;
            }

            // Expand children based on childMask
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

        // Mark root as no longer proxy
        rootNode.nodeType = 0;
    }

    /**
     * Ensure hierarchy chunk is loaded for a proxy node.
     */
    _ensureHierarchyLoaded(node) {
        if (node.nodeType !== 2) return;
        this._parseHierarchyChunk(node);
    }

    /**
     * Collect all nodes in the tree (DFS).
     */
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

    /**
     * Traverse octree and build priority list for LOD.
     */
    _traverseForLOD(node, camera, priorityQueue) {
        if (!node || node.numPoints === 0) return;

        // Lazy-load proxy hierarchy chunks
        if (node.nodeType === 2) {
            this._ensureHierarchyLoaded(node);
        }

        // Calculate screen-space error (projected size)
        const sse = this._calculateSSE(node, camera);

        // Always show root
        if (node.name === "r" || sse > 1.0) {
            priorityQueue.push({ node, priority: sse });

            // Recurse into children if this node warrants detail
            if (sse > 2.0) {
                for (const child of node.children) {
                    if (child) {
                        this._traverseForLOD(child, camera, priorityQueue);
                    }
                }
            }
        }
    }

    /**
     * Calculate screen-space error for a node.
     * Projects node's spacing onto screen to determine pixel size.
     */
    _calculateSSE(node, camera) {
        const bbCenter = this._getLocalCenter(node);
        const distance = BABYLON.Vector3.Distance(camera.position, bbCenter);

        if (distance < 0.001) return Infinity;

        const engine = this.scene.getEngine();
        const screenWidth = engine.getRenderWidth();
        const fov = camera.fov || 0.8;
        const slope = Math.tan(fov / 2);

        // Projected size of node spacing in pixels
        const projectedSize = (node.spacing / distance) * (screenWidth / (2 * slope));

        return projectedSize;
    }

    /**
     * Get center of a node's bounding box in local coords (same as positions).
     * Since positions are already in local coords (offset subtracted), 
     * the camera target should also be in local coords.
     */
    _getLocalCenter(node) {
        const bb = node.boundingBox;
        const cx = (bb.min[0] + bb.max[0]) / 2;
        const cy = (bb.min[1] + bb.max[1]) / 2;
        const cz = (bb.min[2] + bb.max[2]) / 2;
        return new BABYLON.Vector3(cx, cy, cz);
    }

    // ========== MESH CREATION ==========

    /**
     * Decode binary buffer and create a BabylonJS point cloud mesh.
     * Follows Potree's DecoderWorker.js logic exactly.
     */
    _createMeshFromBuffer(node, buffer) {
        const view = new DataView(buffer);
        const numPoints = node.numPoints;
        const positions = new Float32Array(numPoints * 3);
        const colors = new Float32Array(numPoints * 4);

        const scale = this.metadata.scale;
        const metaOffset = this.metadata.offset;
        const bbMin = this.metadata.boundingBox.min;

        // Find attribute byte offsets
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

            // Bounds check
            if (pointOffset + posAttr.byteOffset + 12 > buffer.byteLength) break;

            // Decode position (int32 × 3)
            // Potree formula: (rawInt32 * scale) + offset - bbMin
            // This places coordinates in local space relative to bounding box min
            const rawX = view.getInt32(pointOffset + posAttr.byteOffset + 0, true);
            const rawY = view.getInt32(pointOffset + posAttr.byteOffset + 4, true);
            const rawZ = view.getInt32(pointOffset + posAttr.byteOffset + 8, true);

            const x = (rawX * scale[0]) + metaOffset[0] - bbMin[0];
            const y = (rawY * scale[1]) + metaOffset[1] - bbMin[1];
            const z = (rawZ * scale[2]) + metaOffset[2] - bbMin[2];

            positions[3 * j + 0] = x;
            positions[3 * j + 1] = y;
            positions[3 * j + 2] = z;

            // Track bounds for debugging
            if (j < numPoints) {
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
            }

            // Decode RGB (uint16 × 3)
            // Potree convention: value > 255 ? value / 256 : value → maps to 0-255 Uint8
            // We normalize to 0-1 float for BabylonJS
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
                // Default white
                colors[4 * j + 0] = 1.0;
                colors[4 * j + 1] = 1.0;
                colors[4 * j + 2] = 1.0;
                colors[4 * j + 3] = 1.0;
            }
        }

        // Debug: log bounds of first few nodes
        if (this.stats.loadedNodes < 5) {
            console.log(`   📐 Node ${node.name} bounds: X[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y[${minY.toFixed(2)}, ${maxY.toFixed(2)}] Z[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
        }

        // Create BabylonJS mesh
        const mesh = new BABYLON.Mesh(`potree2_${node.name}`, this.scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.colors = colors;
        vertexData.applyToMesh(mesh);

        // Material: use vertex colors
        const mat = new BABYLON.StandardMaterial(`mat_p2_${node.name}`, this.scene);
        mat.pointsCloud = true;
        mat.pointSize = this.pointSize;
        mat.disableLighting = true;
        mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        mesh.material = mat;

        mesh.parent = this.rootTransform;
        mesh.isVisible = false; // Will be set to true by LOD or initial load
        mesh.isPickable = true;

        // Store original colors for color mode switching
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
}

// =====================================================================
// PUBLIC HELPER FUNCTIONS
// =====================================================================

/**
 * Load a Potree 2.0 point cloud and setup LOD updates.
 * Returns a TransformNode with children meshes.
 */
export async function loadPotree2PointCloud(basePath, scene, options = {}) {
    console.log("🚀 loadPotree2PointCloud:", basePath);

    const loader = new Potree2Loader(scene, basePath, options);
    await loader.load();

    // Frame camera on the loaded point cloud
    const camera = scene.activeCamera;
    if (camera) {
        // Set camera target to center of point cloud bounding box (in local coords)
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

        // Adjust clipping planes for the point cloud size
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

        // Periodic cleanup
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
