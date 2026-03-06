import {
    loadPotree2PointCloud,
    getPotree2Loader
} from "./potree2-loader.js";

// =====================================================================
// UNIFIED POINT CLOUD LOADER - Auto-detects format
// =====================================================================
/**
 * Unified point cloud loader - loads Potree 2.0 format
 */
export async function loadPointCloud(path, scene, options = {}) {
    console.log("🔍 Loading Potree 2.0 point cloud...");

    try {
        // Try to load metadata.json to verify it's a valid Potree 2.0 folder
        const metadataUrl = `${path}/metadata.json`;
        const response = await fetch(metadataUrl);

        if (!response.ok) {
            throw new Error("No metadata.json found at " + path);
        }

        const metadata = await response.json();

        if (metadata.version !== "2.0") {
            console.warn(`⚠️ Warning: Metadata version is ${metadata.version}, expected 2.0. Attempting to load anyway.`);
        }

        console.log("✅ Using Potree2Loader");
        return await loadPotree2PointCloud(path, scene, options);

    } catch (error) {
        console.error("❌ Failed to load point cloud:", error);
        throw error;
    }
}

/**
 * Get the active loader (Potree2)
 */
export function getLODLoader(scene) {
    return getPotree2Loader(scene);
}

/**
 * Get LOD statistics
 */
export function getLODStats(scene) {
    const loader = getLODLoader(scene);
    if (!loader) return null;
    return loader.getStats();
}

/**
 * Update LOD
 */
export function updateLOD(scene) {
    const loader = getLODLoader(scene);
    if (loader && scene.activeCamera) {
        loader.update(scene.activeCamera);
    }
}

/**
 * Set LOD parameters (works with both loaders)
 */
export function setLODParameters(scene, params) {
    const loader = getLODLoader(scene);
    if (!loader) {
        console.warn("LOD loader not available");
        return false;
    }

    // Common parameters
    if (params.pointSize !== undefined) {
        loader.setPointSize(params.pointSize);
    }

    if (params.maxVisiblePoints !== undefined) {
        loader.maxVisiblePoints = params.maxVisiblePoints;
    }

    if (params.maxVisibleNodes !== undefined) {
        loader.maxVisibleNodes = params.maxVisibleNodes;
    }

    // Trigger update
    if (scene.activeCamera) {
        loader.update(scene.activeCamera);
    }

    return true;
}

// Re-export for compatibility
export {
    loadPotree2PointCloud,
    getPotree2Loader,
    showDownloadModal,
    showLoadModal
};

// =====================================================================
// CLASS REGISTRY
// =====================================================================

/**
 * Global registry of classification classes.
 * Map: classId (int) -> { name (string), color (hex string) }
 */
export const classRegistry = new Map();
let _classIdCounter = 1;

/**
 * Converts a hex color string (e.g. "#ef4444") to [r, g, b] floats in [0,1].
 */
function hexToRgbFloat(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255
    ];
}

/**
 * Assigns a class (id + color) to the currently selected points.
 *
 * Strategy:
 *  1. If the Potree2Loader exposes getSelectedPointsInfo(), use that for
 *     accurate per-point index tracking.
 *  2. Fallback: scan vertex colors for the red selection highlight [1, 0, 0]
 *     and tag those points.
 *
 * Class data is persisted in mesh.metadata:
 *   - classIds   : Int32Array   — classId per point (0 = unclassified)
 *   - classColors: Float32Array — RGBA per point, set when classId > 0
 */
export function applyClassToSelection(scene, classId, hexColor) {
    const [r, g, b] = hexToRgbFloat(hexColor);
    const loader = getPotree2Loader(scene);

    if (!loader) {
        console.warn("⚠️ Potree2 loader not found. Make sure a point cloud is loaded.");
        return;
    }

    if (!loader.loadedNodes || loader.loadedNodes.size === 0) {
        console.warn("⚠️ No nodes loaded yet.");
        return;
    }

    // Delega al loader: ha accesso diretto a loadedNodes e alla classificationMap
    const total = loader.applyClassToLoadedNodes(classId, r, g, b);

    if (total > 0) {
        console.log(`✅ Class ${classId} "${classRegistry.get(classId)?.name}" (${hexColor}) assigned to ${total.toLocaleString()} points.`);
    } else {
        console.warn("⚠️ No selected (red-highlighted) points found. Select points first, then assign a class.");
    }
}

// BUTTONS
export function createButton(name, id, where = document.body) {
    const button = document.createElement('button');
    button.textContent = name;
    button.id = id;
    button.classList.add('btn');
    where.appendChild(button);
    return button;
}

export function createToolButton(id, svgContent, tooltip, where = document.body) {
    const button = document.createElement('button');
    button.id = id;
    button.classList.add('tool-btn');
    button.setAttribute('data-tooltip', tooltip);
    button.innerHTML = svgContent;
    where.appendChild(button);
    return button;
}
export function createButtonGrid(id) {
    const grid = document.createElement('div');
    grid.id = id;
    document.body.appendChild(grid);
    return grid;
}

export function textVisible(textName) {
    // Visible
    textName.style.pointerEvents = "auto";
    textName.style.opacity = "1";
}

// // LOADING POINT CLOUD
// export async function loadPointCloud(url, scene) {
//     if (url.endsWith(".ply")) {
//         try {
//             console.log("Loading point cloud from:", url);

//             // 🔧 Carica prima i dati del PLY
//             const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", url, scene);
//             const tempMesh = result.meshes[0];

//             // Estrai dati
//             const positions = tempMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
//             const colors = tempMesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
//             const normals = tempMesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);

//             const numPoints = positions.length / 3;
//             // console.log(`📊 Punti caricati: ${numPoints.toLocaleString()}`);

//             // 🔧 CREA POINT CLOUD SYSTEM
//             const pcs = new BABYLON.PointsCloudSystem("pcs", 1, scene);
//             pcs.pointSize = 3;
//             // Funzione per inizializzare ogni punto
//             pcs.addPoints(numPoints, (particle, i) => {
//                 const idx = i * 3;

//                 // Posizione
//                 particle.position.set(
//                     positions[idx],
//                     positions[idx + 1],
//                     positions[idx + 2]
//                 );

//                 // Colore
//                 if (colors) {
//                     const colorIdx = i * 4;
//                     particle.color = new BABYLON.Color4(
//                         colors[colorIdx],
//                         colors[colorIdx + 1],
//                         colors[colorIdx + 2],
//                         1.0
//                     );
//                     particle.originalColor = particle.color.clone();
//                 }

//                 // Normale (opzionale)
//                 if (normals) {
//                     // PCS non usa direttamente le normali, ma puoi salvarle
//                     particle.normal = new BABYLON.Vector3(
//                         normals[idx],
//                         normals[idx + 1],
//                         normals[idx + 2]
//                     );
//                 }
//             });

//             // 🔧 Build del PCS
//             await pcs.buildMeshAsync();

//             // 🔧 Ottimizzazioni
//             pcs.mesh.alwaysSelectAsActiveMesh = true; // Sempre visibile
//             pcs.computeParticleColor = false; // Usa colori già impostati
//             pcs.computeParticleTexture = false;

//             // Rimuovi mesh temporanea
//             tempMesh.dispose();

//             // console.log(`✅ Point Cloud System creato con ${numPoints.toLocaleString()} punti`);
//             pcs.mesh.isPickable = true;
//             pcs.mesh.refreshBoundingInfo(true);
//             pcs.mesh._pcs = pcs; // Link PCS to mesh for easy access

//             return pcs.mesh;

//         } catch (err) {
//             console.error(`Error loading PLY:`, err);
//             return null;
//         }
//     } else if (url.endsWith(".txt")) {
//         try {
//             console.log("Loading point cloud from:", url);

//             const response = await fetch(url);
//             const text = await response.text();
//             const lines = text.split("\n");

//             const positions = [];
//             const colors = [];

//             for (let i = 1; i < lines.length; i++) {
//                 const line = lines[i].trim();
//                 if (!line) continue;

//                 const values = line.split(/\s+/).map(Number);
//                 if (values.length < 3) continue;

//                 const [x, y, z, r, g, b] = values;
//                 positions.push(x, y, z);

//                 // Optional color
//                 if (r !== undefined && g !== undefined && b !== undefined) {
//                     colors.push(r / 255, g / 255, b / 255, 1.0);
//                 }
//             }

//             const numPoints = positions.length / 3;
//             // console.log(`📊 Punti caricati: ${numPoints.toLocaleString()}`);

//             // 🔧 CREA POINT CLOUD SYSTEM
//             const pcs = new BABYLON.PointsCloudSystem("pcs", 1, scene);

//             pcs.addPoints(numPoints, (particle, i) => {
//                 const idx = i * 3;

//                 particle.position.set(
//                     positions[idx],
//                     positions[idx + 1],
//                     positions[idx + 2]
//                 );

//                 if (colors.length > 0) {
//                     const colorIdx = i * 4;
//                     particle.color = new BABYLON.Color4(
//                         colors[colorIdx],
//                         colors[colorIdx + 1],
//                         colors[colorIdx + 2],
//                         1.0
//                     );
//                     particle.originalColor = particle.color.clone();
//                 }
//             });

//             await pcs.buildMeshAsync();

//             pcs.mesh.alwaysSelectAsActiveMesh = true;
//             pcs.computeParticleColor = false;
//             pcs.computeParticleTexture = false;

//             // console.log(`✅ Point Cloud System creato`);
//             pcs.mesh.isPickable = true;
//             pcs.mesh.refreshBoundingInfo(true);
//             pcs.mesh._pcs = pcs; // Link PCS to mesh for easy access

//             return pcs.mesh;

//         } catch (err) {
//             console.error("Error loading TXT:", err);
//             return null;
//         }

//     } else {
//         console.error("Unsupported file format:", url);
//         return null;
//     }

// }

// ----------------------
// Carica un singolo cluster .bin (formato 15 byte: XYZ float32 + RGB uint8)
// ----------------------

export async function exportPointCloud(mesh, filepath, format = "ply", binary = true) {
    if (!mesh) {
        console.error("No mesh to export");
        return;
    }

    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
    const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);

    if (!positions) {
        console.error("Mesh has no positions");
        return;
    }

    const numPoints = positions.length / 3;
    console.log(`Request to export ${numPoints.toLocaleString()} points in the format ${format.toUpperCase()} (${binary ? "binary" : "ascii"})`);

    if (format === "ply") {
        await exportPLY(positions, colors, normals, filepath, binary);
    } else if (format === "txt") {
        await exportTXT(positions, colors, normals, filepath, binary);
    } else {
        console.error("Unsupported format. Use 'ply' or 'txt'");
    }
}

// ========== EXPORT PLY ==========
async function exportPLY(positions, colors, normals, filepath, binary) {
    const numPoints = positions.length / 3;
    const hasColors = colors && colors.length > 0;
    const hasNormals = normals && normals.length > 0;

    if (binary) {
        // PLY BINARY
        let header = `ply\nformat binary_little_endian 1.0\n`;
        header += `element vertex ${numPoints}\n`;
        header += `property float x\nproperty float y\nproperty float z\n`;

        if (hasNormals) {
            header += `property float nx\nproperty float ny\nproperty float nz\n`;
        }

        if (hasColors) {
            header += `property uchar red\nproperty uchar green\nproperty uchar blue\n`;
        }

        header += `end_header\n`;

        const headerBytes = new TextEncoder().encode(header);
        const bytesPerPoint = 12 + (hasNormals ? 12 : 0) + (hasColors ? 3 : 0);
        const buffer = new ArrayBuffer(headerBytes.length + numPoints * bytesPerPoint);
        const view = new DataView(buffer);
        const uint8View = new Uint8Array(buffer);

        // Scrivi header
        uint8View.set(headerBytes, 0);
        let offset = headerBytes.length;

        // Scrivi dati
        for (let i = 0; i < numPoints; i++) {
            const idx = i * 3;

            // Posizioni (float32)
            view.setFloat32(offset, positions[idx], true); offset += 4;
            view.setFloat32(offset, positions[idx + 1], true); offset += 4;
            view.setFloat32(offset, positions[idx + 2], true); offset += 4;

            // Normali (float32)
            if (hasNormals) {
                view.setFloat32(offset, normals[idx], true); offset += 4;
                view.setFloat32(offset, normals[idx + 1], true); offset += 4;
                view.setFloat32(offset, normals[idx + 2], true); offset += 4;
            }

            // Colori (uint8)
            if (hasColors) {
                const colorIdx = i * 4;
                view.setUint8(offset, Math.round(colors[colorIdx] * 255)); offset += 1;
                view.setUint8(offset, Math.round(colors[colorIdx + 1] * 255)); offset += 1;
                view.setUint8(offset, Math.round(colors[colorIdx + 2] * 255)); offset += 1;
            }
        }

        await saveFile(filepath, new Blob([buffer]));

    } else {
        // PLY ASCII
        let ply = `ply\nformat ascii 1.0\n`;
        ply += `element vertex ${numPoints}\n`;
        ply += `property float x\nproperty float y\nproperty float z\n`;

        if (hasNormals) {
            ply += `property float nx\nproperty float ny\nproperty float nz\n`;
        }

        if (hasColors) {
            ply += `property uchar red\nproperty uchar green\nproperty uchar blue\n`;
        }

        ply += `end_header\n`;

        for (let i = 0; i < numPoints; i++) {
            const idx = i * 3;
            ply += `${positions[idx]} ${positions[idx + 1]} ${positions[idx + 2]}`;

            if (hasNormals) {
                ply += ` ${normals[idx]} ${normals[idx + 1]} ${normals[idx + 2]}`;
            }

            if (hasColors) {
                const colorIdx = i * 4;
                const r = Math.round(colors[colorIdx] * 255);
                const g = Math.round(colors[colorIdx + 1] * 255);
                const b = Math.round(colors[colorIdx + 2] * 255);
                ply += ` ${r} ${g} ${b}`;
            }

            ply += '\n';
        }

        await saveFile(filepath, new Blob([ply], { type: 'text/plain' }));
    }
}

// ========== EXPORT TXT ==========
async function exportTXT(positions, colors, normals, filepath, binary) {
    const numPoints = positions.length / 3;
    const hasColors = colors && colors.length > 0;
    const hasNormals = normals && normals.length > 0;

    if (binary) {
        // TXT BINARY (custom format)
        const bytesPerPoint = 12 + (hasColors ? 3 : 0) + (hasNormals ? 12 : 0);
        const buffer = new ArrayBuffer(numPoints * bytesPerPoint);
        const view = new DataView(buffer);
        let offset = 0;

        for (let i = 0; i < numPoints; i++) {
            const idx = i * 3;

            // Posizioni
            view.setFloat32(offset, positions[idx], true); offset += 4;
            view.setFloat32(offset, positions[idx + 1], true); offset += 4;
            view.setFloat32(offset, positions[idx + 2], true); offset += 4;

            // Colori
            if (hasColors) {
                const colorIdx = i * 4;
                view.setUint8(offset, Math.round(colors[colorIdx] * 255)); offset += 1;
                view.setUint8(offset, Math.round(colors[colorIdx + 1] * 255)); offset += 1;
                view.setUint8(offset, Math.round(colors[colorIdx + 2] * 255)); offset += 1;
            }

            // Normali
            if (hasNormals) {
                view.setFloat32(offset, normals[idx], true); offset += 4;
                view.setFloat32(offset, normals[idx + 1], true); offset += 4;
                view.setFloat32(offset, normals[idx + 2], true); offset += 4;
            }
        }

        await saveFile(filepath, new Blob([buffer]));

    } else {
        // TXT ASCII
        let txt = "X Y Z";
        if (hasColors) txt += " R G B";
        if (hasNormals) txt += " NX NY NZ";
        txt += "\n";

        for (let i = 0; i < numPoints; i++) {
            const idx = i * 3;
            txt += `${positions[idx]} ${positions[idx + 1]} ${positions[idx + 2]}`;

            if (hasColors) {
                const colorIdx = i * 4;
                const r = Math.round(colors[colorIdx] * 255);
                const g = Math.round(colors[colorIdx + 1] * 255);
                const b = Math.round(colors[colorIdx + 2] * 255);
                txt += ` ${r} ${g} ${b}`;
            }

            if (hasNormals) {
                txt += ` ${normals[idx]} ${normals[idx + 1]} ${normals[idx + 2]}`;
            }

            txt += '\n';
        }

        await saveFile(filepath, new Blob([txt], { type: 'text/plain' }));
    }
}

// ========== SAVE FILE HELPER ==========
let isSaving = false;
const saveQueue = [];

async function saveFile(filepath, blob) {
    // Aggiungi alla coda
    return new Promise((resolve, reject) => {
        saveQueue.push({ filepath, blob, resolve, reject });
        processSaveQueue();
    });
}

async function processSaveQueue() {
    // Se già sta salvando o coda vuota, esci
    if (isSaving || saveQueue.length === 0) return;

    isSaving = true;
    const { filepath, blob, resolve, reject } = saveQueue.shift();

    try {
        // console.log(`Saving (${saveQueue.length} in queue): ${filepath}`);

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Converti in base64
        let binary = '';
        for (let i = 0; i < buffer.length; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        const base64 = btoa(binary);

        const response = await fetch('/save_file/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filepath: filepath,
                data: base64
            })
        });

        if (response.ok) {
            console.log(`File saved: ${filepath} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
            resolve();
        } else {
            const error = `Error: ${response.statusText}`;
            console.error(`${error}`);
            reject(new Error(error));
        }
    } catch (error) {
        console.error(`Error saving file:`, error);
        reject(error);
    } finally {
        isSaving = false;
        // Processa prossimo file in coda
        processSaveQueue();
    }
}

// Centra camera sulla mesh
export function frameCameraOnMesh(camera, node) {
    if (!node) return;
    console.log("Centering camera on:", node.name);

    let min = null;
    let max = null;

    const meshes = node instanceof BABYLON.AbstractMesh ? [node] : node.getChildMeshes();

    if (meshes.length === 0) return;

    meshes.forEach(mesh => {
        const bbox = mesh.getBoundingInfo().boundingBox;
        const meshMin = bbox.minimumWorld;
        const meshMax = bbox.maximumWorld;

        if (!min) {
            min = meshMin.clone();
            max = meshMax.clone();
        } else {
            min.x = Math.min(min.x, meshMin.x);
            min.y = Math.min(min.y, meshMin.y);
            min.z = Math.min(min.z, meshMin.z);
            max.x = Math.max(max.x, meshMax.x);
            max.y = Math.max(max.y, meshMax.y);
            max.z = Math.max(max.z, meshMax.z);
        }
    });

    const center = min.add(max).scale(0.5);
    const size = max.subtract(min);
    const radius = size.length() * 0.8;

    camera.setTarget(center);

    if (camera.radius !== undefined) {
        camera.radius = radius;
    } else {
        camera.position = center.add(new BABYLON.Vector3(0, 0, radius));
    }
}


// TEXTS
export function textNotVisible(textName) {
    // Not Visible
    textName.style.pointerEvents = "none";
    textName.style.opacity = "0";
}


export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function createAccordionSection(title, parentId) {
    const parent = document.getElementById(parentId);
    if (!parent) return null;

    const section = document.createElement('div');
    section.classList.add('accordion-section');

    const header = document.createElement('div');
    header.classList.add('accordion-header');

    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    header.appendChild(titleSpan);

    const headerActions = document.createElement('div');
    headerActions.classList.add('accordion-header-actions');
    header.appendChild(headerActions);

    const arrow = document.createElement('span');
    arrow.classList.add('accordion-arrow');
    header.appendChild(arrow);

    const content = document.createElement('div');
    content.classList.add('accordion-content');

    header.addEventListener('click', (e) => {
        if (e.target.closest('.accordion-header-actions')) return;
        section.classList.toggle('collapsed');
    });

    section.appendChild(header);
    section.appendChild(content);
    parent.appendChild(section);

    return { content, headerActions, arrow };
}

export function createPropertyRow(label, initialValue, parent) {
    const row = document.createElement('div');
    row.classList.add('property-row');

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('property-label');
    labelSpan.textContent = label + ":";

    const valueInput = document.createElement('input');
    valueInput.classList.add('property-input');
    valueInput.value = initialValue;

    row.appendChild(labelSpan);
    row.appendChild(valueInput);
    parent.appendChild(row);

    return valueInput;
}

export function createCheckbox(label, initialState, parent) {
    const row = document.createElement('div');
    row.classList.add('property-row');

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('property-label');
    labelSpan.textContent = label + ":";

    // Struttura Toggle (Switch)
    const toggleLabel = document.createElement('label');
    toggleLabel.classList.add('switch');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initialState;

    const slider = document.createElement('span');
    slider.classList.add('switch-slider');

    toggleLabel.appendChild(checkbox);
    toggleLabel.appendChild(slider);

    row.appendChild(labelSpan);
    row.appendChild(toggleLabel);
    parent.appendChild(row);

    return checkbox;
}

export function createSimpleCheckbox(label, initialState, parent) {
    const item = document.createElement('label');
    item.classList.add('checkbox-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initialState;

    const checkmark = document.createElement('span');
    checkmark.classList.add('checkmark');

    const span = document.createElement('span');
    span.textContent = label;

    item.appendChild(checkbox);
    item.appendChild(checkmark);
    item.appendChild(span);
    parent.appendChild(item);

    return checkbox;
}

export function createSlider(label, min, max, initial, step, parent) {
    const row = document.createElement('div');
    row.classList.add('property-row', 'property-row-vertical');

    const labelContainer = document.createElement('div');
    labelContainer.classList.add('label-container');

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('property-label');
    labelSpan.textContent = label;

    const valueDisplay = document.createElement('span');
    valueDisplay.classList.add('property-value-display');
    valueDisplay.textContent = initial;

    labelContainer.appendChild(labelSpan);
    labelContainer.appendChild(valueDisplay);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = initial;
    slider.step = step;
    slider.classList.add('property-slider');

    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;
    });

    row.appendChild(labelContainer);
    row.appendChild(slider);
    parent.appendChild(row);

    return slider;
}

/**
 * @param {string} name
 * @param {string} iconSrc
 * @param {HTMLElement} parent
 * @param {Function|null} onVisibilityChange  Optional callback(visible: boolean).
 *   When provided it is called instead of any built-in mesh toggling, giving the
 *   caller full control (e.g. loader.setSegmentVisible).
 *   When null the item is inert until setVisibilityCallback() is called later.
 */
export function createOutlineItem(name, iconSrc, parent, segmentId, onVisibilityChange = null, initialVisible = true) {
    const row = document.createElement('div');
    row.classList.add('outline-item');
    if (segmentId !== undefined && segmentId !== null) {
        row.dataset.segmentId = segmentId;
    }

    const mainInfo = document.createElement('div');
    mainInfo.classList.add('outline-main-info');

    const icon = document.createElement('img');
    icon.src = iconSrc;
    icon.classList.add('outline-icon');
    icon.alt = "Icon";

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = name;
    nameInput.classList.add('outline-name-input');

    mainInfo.appendChild(icon);
    mainInfo.appendChild(nameInput);

    // Visibility Toggle
    const visibilityBtn = document.createElement('button');
    visibilityBtn.classList.add('outline-visibility-btn');

    const visibilityIcon = document.createElement('img');
    const iconBase = "static/viewer/icons/";
    visibilityIcon.src = `${iconBase}visibility-on.png`;
    visibilityIcon.classList.add('outline-visibility-icon');

    visibilityBtn.appendChild(visibilityIcon);

    let isVisible = initialVisible;
    let _visibilityCallback = onVisibilityChange;

    visibilityIcon.src = isVisible ? `${iconBase}visibility-on.png` : `${iconBase}visibility-off.png`;
    visibilityBtn.classList.toggle('off', !isVisible);

    visibilityBtn.addEventListener('click', () => {
        isVisible = !isVisible;
        visibilityIcon.src = isVisible ? `${iconBase}visibility-on.png` : `${iconBase}visibility-off.png`;
        visibilityBtn.classList.toggle('off', !isVisible);
        if (_visibilityCallback) _visibilityCallback(isVisible);
    });

    row.appendChild(mainInfo);
    row.appendChild(visibilityBtn);
    parent.appendChild(row);

    // Right-click context menu (Same logic as createClassItem)
    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const iconBase = "static/viewer/icons/";
        const options = [
            {
                label: `Assign selection to "${nameInput.value}"`,
                icon: `${iconBase}cursor.png`,
                action: () => {
                    const scene = window.__babylonScene;
                    if (scene && scene.potree2Loader) {
                        const count = scene.potree2Loader.assignSelectionToSegment(segmentId);
                        if (count > 0) console.log(`✅ Assigned ${count} points to ${nameInput.value}`);
                    }
                }
            },
            {
                label: `Remove selection from "${nameInput.value}"`,
                icon: `${iconBase}trash.png`,
                action: () => {
                    const scene = window.__babylonScene;
                    if (scene && scene.potree2Loader) {
                        const count = scene.potree2Loader.removeSelectionFromSegment(segmentId);
                        if (count > 0) console.log(`✅ Removed ${count} points from ${nameInput.value}`);
                    }
                }
            }
        ];

        if (segmentId !== 0) {
            options.push({
                label: `Delete segment "${nameInput.value}"`,
                icon: `${iconBase}trash.png`,
                action: () => {
                    if (confirm(`Are you sure you want to delete segment "${nameInput.value}"?`)) {
                        const scene = window.__babylonScene;
                        if (scene && scene.potree2Loader) {
                            scene.potree2Loader.deleteSegment(segmentId);
                            row.remove();
                        }
                    }
                }
            });
        }

        showContextMenu(e.clientX, e.clientY, options);
    });

    return {
        nameInput,
        visibilityBtn,
        row,
        /**
         * Bind or replace the visibility callback.
         * Also resets the visual state to "visible".
         */
        setVisibilityCallback(cb) {
            _visibilityCallback = cb;
            isVisible = true;
            visibilityIcon.src = `${iconBase}visibility-on.png`;
            visibilityBtn.classList.remove('off');
        }
    };
}

export function createClassItem(name, iconSrc, parent) {
    const row = document.createElement('div');
    row.classList.add('outline-item', 'class-item');

    const mainInfo = document.createElement('div');
    mainInfo.classList.add('outline-main-info');

    const icon = document.createElement('img');
    icon.src = iconSrc;
    icon.classList.add('outline-icon');
    icon.alt = "Class Icon";

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = name;
    nameInput.classList.add('outline-name-input');

    mainInfo.appendChild(icon);
    mainInfo.appendChild(nameInput);

    row.appendChild(mainInfo);

    // --- Register this class in the global registry ---
    const classId = _classIdCounter++;
    const defaultColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    let currentColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    classRegistry.set(classId, { name, color: currentColor });

    // Keep registry in sync when name is edited
    nameInput.addEventListener('change', () => {
        const entry = classRegistry.get(classId);
        if (entry) entry.name = nameInput.value;
    });

    // Color Selector
    const colorWrapper = document.createElement('div');
    colorWrapper.classList.add('class-color-wrapper');

    const colorDot = document.createElement('div');
    colorDot.classList.add('class-color-dot');
    colorDot.style.backgroundColor = currentColor;

    colorDot.addEventListener('click', (e) => {
        e.stopPropagation();
        showColorPicker(colorDot, currentColor, (newColor) => {
            currentColor = newColor;
            colorDot.style.backgroundColor = newColor;
            // Keep registry in sync
            const entry = classRegistry.get(classId);
            if (entry) entry.color = newColor;

            // Update points in the scene if loader is available
            const sceneRef = window.__babylonScene;
            if (sceneRef && sceneRef.potree2Loader) {
                sceneRef.potree2Loader.updateClassColor(classId, newColor);
            }
        });
    });

    colorWrapper.appendChild(colorDot);
    row.appendChild(colorWrapper);

    parent.appendChild(row);

    // Right-click context menu
    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const iconBase = "static/viewer/icons/";
        showContextMenu(e.clientX, e.clientY, [
            {
                label: `Assign "${nameInput.value}" to selection`,
                icon: `${iconBase}cursor.png`,
                action: () => {
                    // Import scene from main.js at call-time to avoid circular deps
                    const sceneRef = window.__babylonScene;
                    if (!sceneRef) {
                        console.warn("⚠️ Scene not available. Make sure window.__babylonScene is set in main.js.");
                        return;
                    }
                    applyClassToSelection(sceneRef, classId, currentColor);
                    console.log(`✅ Class "${nameInput.value}" (id:${classId}, ${currentColor}) assigned to selection.`);
                }
            },
            {
                label: `Delete "${nameInput.value}"`,
                icon: `${iconBase}trash.png`,
                action: () => {
                    if (confirm(`Are you sure you want to delete the class "${nameInput.value}"?`)) {
                        classRegistry.delete(classId);
                        row.remove();
                    }
                }
            }
        ]);
    });

    return nameInput;
}

export function showContextMenu(x, y, options) {
    // Remove existing menus
    const oldMenu = document.querySelector('.context-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.classList.add('context-menu');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    options.forEach(opt => {
        const item = document.createElement('button');
        item.classList.add('context-menu-item');

        if (opt.icon) {
            const img = document.createElement('img');
            img.src = opt.icon;
            item.appendChild(img);
        }

        const span = document.createElement('span');
        span.textContent = opt.label;
        item.appendChild(span);

        item.addEventListener('click', () => {
            opt.action();
            menu.remove();
        });

        menu.appendChild(item);
    });

    document.body.appendChild(menu);

    // Close the menu if clicked elsewhere
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('mousedown', closeMenu);
            }
        };
        document.addEventListener('mousedown', closeMenu);
    }, 10);
}

// Helper to convert HSV to HEX
function hsvToHex(h, s, v) {
    h /= 360; s /= 100; v /= 100;
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function showColorPicker(anchor, currentColor, onSelect) {
    const overlay = document.createElement('div');
    overlay.classList.add('color-picker-overlay');
    const popover = document.createElement('div');
    popover.classList.add('color-picker-popover');
    const rect = anchor.getBoundingClientRect();
    popover.style.left = `${rect.right + 15}px`;
    popover.style.top = `${rect.top - 20}px`;

    let h = 0, s = 100, v = 100;

    const svContainer = document.createElement('div');
    svContainer.classList.add('sv-canvas-container');
    svContainer.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), #ff0000`;
    const svCursor = document.createElement('div');
    svCursor.classList.add('sv-cursor');
    svContainer.appendChild(svCursor);

    const hueContainer = document.createElement('div');
    hueContainer.classList.add('hue-slider-container');
    const hueCursor = document.createElement('div');
    hueCursor.classList.add('hue-cursor');
    hueContainer.appendChild(hueCursor);

    const hexInputGroup = document.createElement('div');
    hexInputGroup.classList.add('hex-input-group');
    hexInputGroup.innerHTML = `<span>#</span>`;
    const hexInputField = document.createElement('input');
    hexInputField.type = 'text';
    hexInputField.classList.add('hex-field');
    hexInputField.value = currentColor.replace('#', '');
    hexInputGroup.appendChild(hexInputField);

    const presets = document.createElement('div');
    presets.classList.add('color-presets');
    const defaultColors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#10b981", "#0ea5e9", "#3b82f6", "#6366f1", "#d946ef", "#64748b"];
    defaultColors.forEach(col => {
        const p = document.createElement('div');
        p.classList.add('preset-color');
        p.style.backgroundColor = col;
        p.onclick = () => { onSelect(col); hexInputField.value = col.replace('#', ''); };
        presets.appendChild(p);
    });

    function updateColor() {
        const hex = hsvToHex(h, s, v);
        hexInputField.value = hex.replace('#', '');
        svContainer.style.backgroundColor = hsvToHex(h, 100, 100);
        onSelect(hex);
    }

    let isDraggingSV = false;
    let isDraggingHue = false;

    const handleSV = (e) => {
        const r = svContainer.getBoundingClientRect();
        let x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        let y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        s = x * 100; v = (1 - y) * 100;
        svCursor.style.left = `${x * 100}%`; svCursor.style.top = `${y * 100}%`;
        updateColor();
    };

    const handleHue = (e) => {
        const r = hueContainer.getBoundingClientRect();
        let x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        h = x * 360; hueCursor.style.left = `${x * 100}%`;
        updateColor();
    };

    svContainer.onmousedown = (e) => { isDraggingSV = true; handleSV(e); };
    hueContainer.onmousedown = (e) => { isDraggingHue = true; handleHue(e); };

    const moveListener = (e) => { if (isDraggingSV) handleSV(e); if (isDraggingHue) handleHue(e); };
    const upListener = () => { isDraggingSV = false; isDraggingHue = false; };

    window.addEventListener('mousemove', moveListener);
    window.addEventListener('mouseup', upListener);

    popover.appendChild(svContainer);
    popover.appendChild(hueContainer);
    popover.appendChild(hexInputGroup);
    popover.appendChild(presets);

    function close() {
        popover.style.opacity = '0'; popover.style.transform = 'scale(0.95)';
        window.removeEventListener('mousemove', moveListener);
        window.removeEventListener('mouseup', upListener);
        setTimeout(() => { overlay.remove(); popover.remove(); }, 150);
    }

    overlay.onclick = close;
    document.body.appendChild(overlay);
    document.body.appendChild(popover);
}

export function createModal(title, contentCallback, footerCallback) {
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const container = document.createElement('div');
    container.classList.add('modal-container');

    // Header
    const header = document.createElement('div');
    header.classList.add('modal-header');

    const titleEl = document.createElement('span');
    titleEl.classList.add('modal-title');
    titleEl.textContent = title;

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('modal-close');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.classList.add('modal-body');
    if (contentCallback) contentCallback(body);

    // Footer
    const footer = document.createElement('div');
    footer.classList.add('modal-footer');
    if (footerCallback) footerCallback(footer, overlay);

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Show with animation
    setTimeout(() => overlay.classList.add('active'), 10);

    return overlay;
}

function showDownloadModal() {
    createModal(
        "Download Configuration",
        (body) => {
            const group = document.createElement('div');
            group.classList.add('checkbox-group');

            createSimpleCheckbox("PointCloud Training", true, group);
            createSimpleCheckbox("PointCloud Evaluation", false, group);
            createSimpleCheckbox("PointCloud Testing", false, group);

            body.appendChild(group);
        },
        (footer, overlay) => {
            const cancelBtn = document.createElement('button');
            cancelBtn.classList.add('btn');
            cancelBtn.style.backgroundColor = 'transparent';
            cancelBtn.style.border = '1px solid var(--border-color)';
            cancelBtn.textContent = "Cancel";
            cancelBtn.onclick = () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            };

            const downloadBtn = document.createElement('button');
            downloadBtn.classList.add('btn');
            downloadBtn.textContent = "Download";
            downloadBtn.onclick = () => {
                console.log("Download triggered (to be implemented)");
                // Future: collect checkbox states and trigger download logic
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            };

            footer.appendChild(cancelBtn);
            footer.appendChild(downloadBtn);
        }
    );
}

function showLoadModal() {
    let fileInputEl = null;

    let meshPointsRow = null;
    let meshPointsInput = null;

    let subToggle = null;
    let voxelInput = null;

    createModal(
        "Load Data",
        (body) => {
            // Section 1: File Selection
            const fileSection = document.createElement('div');
            fileSection.classList.add('modal-section');

            const fileTitle = document.createElement('div');
            fileTitle.classList.add('modal-section-title');
            fileTitle.textContent = "Data Source";
            fileSection.appendChild(fileTitle);

            const fileContainer = document.createElement('div');
            fileContainer.classList.add('file-input-container');

            const fileCustom = document.createElement('div');
            fileCustom.classList.add('file-input-custom');
            fileCustom.innerHTML = `
                <b>Click to select file</b>
                <span>Supports .ply, .las, .glb</span>
            `;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.classList.add('file-input-hidden');
            fileInput.accept = ".ply,.las,.glb";
            fileInputEl = fileInput;

            fileInput.onchange = (e) => {
                const fileName = e.target.files[0]?.name;
                if (fileName) {
                    fileCustom.innerHTML = `<b>Selected:</b> <span>${fileName}</span>`;
                    const ext = fileName.split('.').pop().toLowerCase();
                    if (meshPointsRow) {
                        meshPointsRow.style.display = ext === 'glb' ? "flex" : "none";
                    }
                }
            };

            fileContainer.appendChild(fileCustom);
            fileContainer.appendChild(fileInput);
            fileSection.appendChild(fileContainer);
            body.appendChild(fileSection);

            // Spacer
            const spacer = document.createElement('div');
            spacer.style.height = '10px';
            body.appendChild(spacer);

            // Section 2: Subsampling
            const subSection = document.createElement('div');
            subSection.classList.add('modal-section');

            const subTitle = document.createElement('div');
            subTitle.classList.add('modal-section-title');
            subTitle.textContent = "Processing";
            subSection.appendChild(subTitle);

            const subContainer = document.createElement('div');
            subToggle = createSimpleCheckbox("Enable Subsampling", false, subContainer);

            const subSettings = document.createElement('div');
            subSettings.classList.add('expandable-content');

            // Add settings to subSettings
            // Voxel Size Slider
            const voxelRow = document.createElement('div');
            voxelRow.classList.add('property-row');
            voxelRow.style.padding = "0 4px";
            voxelRow.innerHTML = `<span class="property-label">Voxel Size (m):</span>`;
            voxelInput = document.createElement('input');
            voxelInput.type = "number";
            voxelInput.classList.add('property-input');
            voxelInput.value = "0.05";
            voxelInput.step = "0.01";
            voxelInput.min = "0.01";
            voxelRow.appendChild(voxelInput);
            subSettings.appendChild(voxelRow);

            subToggle.onchange = (e) => {
                subSettings.classList.toggle('visible', e.target.checked);
            };

            subSection.appendChild(subContainer);
            subSection.appendChild(subSettings);

            // New: Mesh Points (for GLB)
            meshPointsRow = document.createElement('div');
            meshPointsRow.classList.add('property-row');
            meshPointsRow.style.padding = "10px 4px 0 4px";
            meshPointsRow.style.display = "none"; // hidden by default
            meshPointsRow.innerHTML = `<span class="property-label">GLB Mesh Points:</span>`;
            meshPointsInput = document.createElement('input');
            meshPointsInput.type = "number";
            meshPointsInput.classList.add('property-input');
            meshPointsInput.value = "5000000";
            meshPointsInput.step = "100000";
            meshPointsInput.min = "10000";
            meshPointsInput.style.width = "100px";
            meshPointsRow.appendChild(meshPointsInput);
            subSection.appendChild(meshPointsRow);

            body.appendChild(subSection);
        },
        (footer, overlay) => {
            const cancelBtn = document.createElement('button');
            cancelBtn.classList.add('btn');
            cancelBtn.style.backgroundColor = 'transparent';
            cancelBtn.style.border = '1px solid var(--border-color)';
            cancelBtn.textContent = "Cancel";
            cancelBtn.onclick = () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            };

            const uploadBtn = document.createElement('button');
            uploadBtn.classList.add('btn');
            uploadBtn.textContent = "Upload & Process";
            uploadBtn.onclick = async () => {
                const file = fileInputEl?.files[0];
                if (!file) {
                    alert("Please select a file first.");
                    return;
                }

                console.log("🚀 Starting complex processing pipeline for:", file.name);

                // ── Replace modal body with step list view ─────────────────
                const container = overlay.querySelector('.modal-container');
                const body = overlay.querySelector('.modal-body');
                const footer = overlay.querySelector('.modal-footer');

                // Swap content: hide original body, show step list
                body.innerHTML = '';
                if (footer) footer.style.display = 'none';

                const STEPS = [
                    "Clearing Workspace",
                    "Uploading File",
                    "Converting File",
                    "Extracting Features",
                    "Potree Converter",
                    "Loading Viewer"
                ];

                // Build step list
                const stepList = document.createElement('div');
                stepList.classList.add('pipeline-step-list');

                const stepEls = STEPS.map((label) => {
                    const item = document.createElement('div');
                    item.classList.add('pipeline-step-item', 'step-idle');

                    const iconWrap = document.createElement('div');
                    iconWrap.classList.add('step-icon-wrap');
                    // Inner ring (the animated spinner arc + static base ring)
                    iconWrap.innerHTML = `
                        <svg class="step-svg" viewBox="0 0 32 32">
                            <circle class="step-track" cx="16" cy="16" r="13" />
                            <circle class="step-arc"   cx="16" cy="16" r="13" />
                        </svg>
                        <div class="step-check">
                            <svg viewBox="0 0 12 12" fill="none">
                                <polyline points="2,6 5,9 10,3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="step-cross">
                            <svg viewBox="0 0 12 12" fill="none">
                                <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                                <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                            </svg>
                        </div>
                    `;

                    const labelEl = document.createElement('span');
                    labelEl.classList.add('step-label');
                    labelEl.textContent = label;

                    item.appendChild(iconWrap);
                    item.appendChild(labelEl);
                    stepList.appendChild(item);
                    return item;
                });

                body.appendChild(stepList);

                // Helpers
                const activateStep = (idx) => {
                    stepEls[idx].classList.remove('step-idle', 'step-done', 'step-error');
                    stepEls[idx].classList.add('step-running');
                };
                const completeStep = (idx) => {
                    stepEls[idx].classList.remove('step-running');
                    stepEls[idx].classList.add('step-done');
                };
                const failStep = (idx) => {
                    stepEls[idx].classList.remove('step-running');
                    stepEls[idx].classList.add('step-error');
                };

                // Track current step for error handling
                let currentStepIdx = 0;

                try {
                    // STEP 1: Clear current data directory
                    currentStepIdx = 0;
                    activateStep(0);
                    console.log("🧹 Step 1: Clearing /static/viewer/data/...");
                    const clearResponse = await fetch('/api/clear-data/', { method: 'POST' });
                    if (!clearResponse.ok) throw new Error("Failed to clear data directory");
                    completeStep(0);
                    console.log("✅ Workspace cleared");

                    // STEP 2: Upload the source file
                    currentStepIdx = 1;
                    activateStep(1);
                    console.log("📤 Step 2: Uploading file to /static/viewer/data/...");
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadResponse = await fetch('/api/upload-data/', {
                        method: 'POST',
                        body: formData
                    });
                    if (!uploadResponse.ok) {
                        const errData = await uploadResponse.json().catch(() => ({}));
                        throw new Error(errData.error || "Failed to upload file");
                    }
                    completeStep(1);
                    console.log("✅ File uploaded");

                    // STEP 3: Handle conversion based on extension
                    currentStepIdx = 2;
                    activateStep(2);
                    const filename = file.name;
                    const extension = filename.split('.').pop().toLowerCase();
                    const inputPath = `viewer/static/viewer/data/${filename}`;
                    let lasPath = `viewer/static/viewer/data/output.las`;

                    if (extension === 'ply') {
                        console.log("🔄 Step 3: Converting PLY to LAS...");
                        const plyResponse = await fetch('/ply2las/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
                            body: JSON.stringify({ file_path: inputPath, out_path: lasPath })
                        });
                        if (!plyResponse.ok) {
                            const errData = await plyResponse.json().catch(() => ({}));
                            throw new Error(errData.message || errData.error || "PLY conversion failed");
                        }
                        console.log("✅ PLY converted to LAS");
                    } else if (extension === 'glb') {
                        console.log("🔄 Step 3: Converting GLB to LAS...");
                        let numPoints = 5000000;
                        if (meshPointsInput && meshPointsInput.value) numPoints = parseInt(meshPointsInput.value, 10);
                        const meshResponse = await fetch('/mesh2pc/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
                            body: JSON.stringify({ file_path: inputPath, out_path: lasPath, num_points: numPoints })
                        });
                        if (!meshResponse.ok) {
                            const errData = await meshResponse.json().catch(() => ({}));
                            throw new Error(errData.message || errData.error || "Mesh sampling failed");
                        }
                        console.log(`✅ Mesh sampled to point cloud (${numPoints} points)`);
                    } else if (extension === 'las' || extension === 'laz') {
                        console.log("⏩ Step 3: Skipping conversion (already LAS/LAZ)");
                        lasPath = inputPath;
                    }
                    completeStep(2);

                    // STEP 4: Feature Extraction
                    currentStepIdx = 3;
                    activateStep(3);
                    console.log("🧠 Step 4: Starting feature extraction...");
                    let samplingParam = 0;
                    if (subToggle.checked) {
                        samplingParam = parseFloat(voxelInput.value) || 0;
                    }
                    const featResponse = await fetch('/feature_extraction/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
                        body: JSON.stringify({
                            input_filepath: lasPath,
                            output_filepath: `viewer/static/viewer/data/features.las`,
                            feature_list: ["anisotropy", "height_above", "height_below", "linearity", "planarity", "verticality", "neighbours", "omnivariance", "sphericity", "surface_variation", "vertical_range"],
                            radius_list: [0.1, 0.2, 0.5],
                            sampling: samplingParam
                        })
                    });
                    if (!featResponse.ok) {
                        const errData = await featResponse.json().catch(() => ({}));
                        throw new Error(errData.message || errData.error || "Feature extraction failed");
                    }
                    completeStep(3);
                    console.log("✅ Features extracted");

                    // STEP 5: PotreeConverter
                    currentStepIdx = 4;
                    activateStep(4);
                    console.log("🧠 Step 5: Starting Potree conversion...");
                    const potreeResponse = await fetch('/potree_converter/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
                        body: JSON.stringify({
                            input_filepath: `viewer/static/viewer/data/features.las`,
                            output_filepath: `viewer/static/viewer/data/clusters`
                        })
                    });
                    if (!potreeResponse.ok) {
                        const errData = await potreeResponse.json().catch(() => ({}));
                        throw new Error(errData.message || errData.error || "Potree conversion failed");
                    }
                    completeStep(4);
                    console.log("✅ Potree conversion completed");

                    // STEP 6: Final Loading in Babylon
                    currentStepIdx = 5;
                    activateStep(5);
                    console.log("🏗️ Step 6: Loading Potree data from /data/clusters/...");
                    const scene = window.__babylonScene;
                    const sceneObjects = window.__sceneObjects;
                    if (sceneObjects && sceneObjects.currentPointCloud) {
                        if (typeof sceneObjects.currentPointCloud.dispose === 'function') {
                            sceneObjects.currentPointCloud.dispose();
                        }
                        sceneObjects.currentPointCloud = null;
                    }
                    const pcPath = "/static/viewer/data/clusters";
                    const pc = await loadPointCloud(pcPath, scene);
                    if (pc) {
                        if (sceneObjects) sceneObjects.currentPointCloud = pc;
                        frameCameraOnMesh(scene.activeCamera || scene.cameras[0], pc);
                        const pcLabel = filename || "Point Cloud";
                        if (typeof window.__registerPointCloudInOutline === 'function') {
                            window.__registerPointCloudInOutline(pc, pcLabel);
                        }
                    }
                    completeStep(5);
                    console.log("✅ Process complete. Potree cloud loaded.");

                    await new Promise(r => setTimeout(r, 800));
                    overlay.classList.remove('active');
                    setTimeout(() => overlay.remove(), 300);

                } catch (err) {
                    console.error("❌ Processing Pipeline Error:", err);

                    failStep(currentStepIdx);

                    // Show error message below the step list
                    const errorDiv = document.createElement('div');
                    errorDiv.classList.add('pipeline-error-msg');
                    errorDiv.innerHTML = `
                        <div style="font-weight:600;margin-bottom:4px;">⚠️ Import Failed</div>
                        <div style="font-family:monospace;font-size:0.8em;white-space:pre-wrap;word-break:break-word;opacity:0.8;">${err.message || err.toString()}</div>
                    `;
                    body.appendChild(errorDiv);

                    // Re-show footer with close button
                    if (footer) {
                        footer.style.display = '';
                        footer.innerHTML = '';
                        const closeBtn = document.createElement('button');
                        closeBtn.classList.add('btn');
                        closeBtn.textContent = "Close";
                        closeBtn.onclick = () => {
                            overlay.classList.remove('active');
                            setTimeout(() => overlay.remove(), 300);
                        };
                        footer.appendChild(closeBtn);
                    }
                }
            };

            footer.appendChild(cancelBtn);
            footer.appendChild(uploadBtn);
        }
    );
}

/**
 * Shows a modal for configuring Random Forest training parameters.
 */
export function showTrainingModal(scene, onStart) {
    const overlay = createModal(
        "Training Configuration",
        (body) => {
            // --- SECTION 1: DATA SPLIT ---
            const splitTitle = document.createElement('div');
            splitTitle.classList.add('modal-section-title');
            splitTitle.textContent = "Data Split";
            body.appendChild(splitTitle);

            const splitContainer = document.createElement('div');
            splitContainer.classList.add('modal-section');
            // splitContainer.style.marginBottom = "20px";

            const createSelectRow = (labelStr, id) => {
                const row = document.createElement('div');
                row.classList.add('property-row');
                row.style.alignItems = "center";
                // row.style.marginBottom = "12px";

                const label = document.createElement('span');
                label.classList.add('property-label');
                label.style.width = "100px";
                label.textContent = labelStr + ":";
                row.appendChild(label);

                const select = document.createElement('select');
                select.id = id;
                select.style.flex = "1";
                select.classList.add('property-input');
                row.appendChild(select);

                return { row, select };
            };

            const trainObj = createSelectRow("Training Data", "train-select");
            const valObj = createSelectRow("Validation Data", "val-select");

            splitContainer.appendChild(trainObj.row);
            splitContainer.appendChild(valObj.row);
            body.appendChild(splitContainer);

            // Get segments from the DOM
            const segments = document.querySelectorAll('.outline-item[data-segment-id]');

            const addOptions = (select) => {
                const noneOpt = document.createElement('option');
                noneOpt.value = "none";
                noneOpt.textContent = "-- Select Segment --";
                select.appendChild(noneOpt);

                segments.forEach((item) => {
                    const segmentId = item.dataset.segmentId;
                    const nameInput = item.querySelector('.outline-name-input');
                    const name = nameInput ? nameInput.value : `Segment ${segmentId}`;

                    const opt = document.createElement('option');
                    opt.value = segmentId;
                    opt.textContent = name;
                    select.appendChild(opt);
                });
            };

            if (segments.length === 0) {
                const opt = document.createElement('option');
                opt.disabled = true;
                opt.textContent = "No segments found";
                trainObj.select.appendChild(opt);
                valObj.select.appendChild(opt.cloneNode(true));
            } else {
                addOptions(trainObj.select);
                addOptions(valObj.select);

                // Pre-select some defaults if possible
                if (segments.length >= 1) trainObj.select.selectedIndex = 1;
                if (segments.length >= 2) valObj.select.selectedIndex = 2;
                else if (segments.length >= 1) valObj.select.selectedIndex = 1;
            }

            // --- SECTION 2: FEATURE SELECTION (Collapsible) ---
            const featureTitle = document.createElement('div');
            featureTitle.classList.add('modal-section-title');
            featureTitle.style.cursor = "pointer";
            featureTitle.style.display = "flex";
            featureTitle.style.justifyContent = "space-between";
            featureTitle.style.alignItems = "center";
            featureTitle.style.padding = "8px 0";
            featureTitle.style.transition = "color 0.2s";
            featureTitle.innerHTML = `<span>Feature Selection</span><span style="font-size: 0.6rem; opacity: 0.5;">▼</span>`;

            featureTitle.onmouseover = () => featureTitle.style.color = "white";
            featureTitle.onmouseout = () => featureTitle.style.color = "var(--accent-blue)";

            body.appendChild(featureTitle);

            const featureContainer = document.createElement('div');
            featureContainer.classList.add('modal-section');
            featureContainer.style.display = "none"; // Initial state: collapsed
            featureContainer.style.paddingTop = "10px";
            featureContainer.style.borderTop = "1px solid rgba(255,255,255,0.05)";

            // Two columns using flex
            const colsContainer = document.createElement('div');
            colsContainer.style.display = "flex";
            colsContainer.style.width = "100%";
            colsContainer.style.gap = "20px";

            const col1 = document.createElement('div');
            col1.style.flex = "1";
            const col2 = document.createElement('div');
            col2.style.flex = "1";
            colsContainer.appendChild(col1);
            colsContainer.appendChild(col2);
            featureContainer.appendChild(colsContainer);

            featureTitle.onclick = () => {
                const isHidden = featureContainer.style.display === "none";
                featureContainer.style.display = isHidden ? "flex" : "none";
                featureTitle.querySelector('span:last-child').textContent = isHidden ? "▲" : "▼";
                featureTitle.querySelector('span:last-child').style.opacity = isHidden ? "1" : "0.5";
            };

            // Remove unused two-column containers, we'll build the matrix directly
            colsContainer.remove();

            const loader = scene.potree2Loader;
            const validFeatures = loader ? loader.getAttributeList() : [];
            const featureSwitches = {};

            if (validFeatures.length === 0) {
                const emptyMsg = document.createElement('span');
                emptyMsg.style.cssText = "font-size:0.75rem; color:var(--text-muted)";
                emptyMsg.textContent = "No custom features found";
                featureContainer.appendChild(emptyMsg);
            } else {
                // Parse features: name_radius (e.g. "linearity_0_1" -> name="linearity", radius="0.1")
                // Radius part: everything after first underscore-separated non-numeric group
                const featureMap = new Map(); // featureName -> Set of radiusKeys
                const radiusOrder = [];

                validFeatures.forEach(featName => {
                    // Split on underscore, find where numeric part starts
                    const parts = featName.split('_');
                    // Find split point: last index where prefix is all non-numeric
                    let splitIdx = parts.length - 1;
                    for (let i = parts.length - 1; i >= 1; i--) {
                        if (isNaN(parts[i])) { splitIdx = i; break; }
                        splitIdx = i;
                    }
                    // Heuristic: look for first part that is numeric from the end
                    // Better: the base name is everything before the last two numeric segments
                    // Pattern: name_N_M where N and M are numbers
                    let baseName, radiusKey;
                    // Try to match trailing _<num>_<num> or _<num>
                    const match = featName.match(/^(.+?)_([\d]+(?:_[\d]+)*)$/);
                    if (match) {
                        baseName = match[1];
                        radiusKey = match[2].replace(/_/g, '.');
                    } else {
                        baseName = featName;
                        radiusKey = '-';
                    }

                    if (!featureMap.has(baseName)) featureMap.set(baseName, new Map());
                    featureMap.get(baseName).set(radiusKey, featName);

                    if (!radiusOrder.includes(radiusKey)) radiusOrder.push(radiusKey);
                });

                // Sort radii numerically
                radiusOrder.sort((a, b) => parseFloat(a) - parseFloat(b));

                // --- Build matrix ---
                const matrixWrapper = document.createElement('div');
                matrixWrapper.classList.add('feature-matrix-wrapper');

                // Select All / None controls
                const matrixControls = document.createElement('div');
                matrixControls.classList.add('feature-matrix-controls');

                const selectAllBtn = document.createElement('button');
                selectAllBtn.classList.add('feature-matrix-ctrl-btn');
                selectAllBtn.textContent = "Select All";
                selectAllBtn.onclick = () => {
                    matrixWrapper.querySelectorAll('.feat-cell-btn').forEach(btn => {
                        btn.classList.add('active');
                        btn.setAttribute('data-active', 'true');
                    });
                };

                const selectNoneBtn = document.createElement('button');
                selectNoneBtn.classList.add('feature-matrix-ctrl-btn');
                selectNoneBtn.textContent = "Select None";
                selectNoneBtn.onclick = () => {
                    matrixWrapper.querySelectorAll('.feat-cell-btn').forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('data-active', 'false');
                    });
                };

                matrixControls.appendChild(selectAllBtn);
                matrixControls.appendChild(selectNoneBtn);
                featureContainer.appendChild(matrixControls);

                // Matrix table
                const table = document.createElement('div');
                table.classList.add('feature-matrix');

                // Header row
                const headerRow = document.createElement('div');
                headerRow.classList.add('feature-matrix-row', 'feature-matrix-header-row');

                // Top-left empty corner
                const cornerCell = document.createElement('div');
                cornerCell.classList.add('feature-matrix-cell', 'feature-matrix-corner');
                cornerCell.textContent = 'Feature \\ Radius';
                headerRow.appendChild(cornerCell);

                // Radius column headers
                radiusOrder.forEach(r => {
                    const th = document.createElement('div');
                    th.classList.add('feature-matrix-cell', 'feature-matrix-col-header');
                    th.textContent = r;
                    headerRow.appendChild(th);
                });
                table.appendChild(headerRow);

                // Feature rows
                featureMap.forEach((radiiMap, baseName) => {
                    const row = document.createElement('div');
                    row.classList.add('feature-matrix-row');

                    // Row label
                    const rowLabel = document.createElement('div');
                    rowLabel.classList.add('feature-matrix-cell', 'feature-matrix-row-label');
                    rowLabel.textContent = baseName;
                    rowLabel.title = baseName;
                    row.appendChild(rowLabel);

                    // Cells for each radius
                    radiusOrder.forEach(r => {
                        const cell = document.createElement('div');
                        cell.classList.add('feature-matrix-cell', 'feature-matrix-data-cell');

                        const fullName = radiiMap.get(r);
                        if (fullName) {
                            const btn = document.createElement('button');
                            btn.classList.add('feat-cell-btn', 'active');
                            btn.setAttribute('data-feature', fullName);
                            btn.setAttribute('data-active', 'true');
                            btn.title = fullName;
                            // Checkmark icon
                            btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                            btn.onclick = () => {
                                const isActive = btn.getAttribute('data-active') === 'true';
                                btn.setAttribute('data-active', String(!isActive));
                                btn.classList.toggle('active', !isActive);
                            };
                            featureSwitches[fullName] = btn;
                            cell.appendChild(btn);
                        } else {
                            cell.classList.add('feature-matrix-empty-cell');
                        }

                        row.appendChild(cell);
                    });

                    table.appendChild(row);
                });

                matrixWrapper.appendChild(table);
                featureContainer.appendChild(matrixWrapper);
            }

            body.appendChild(featureContainer);

            // --- SECTION 3: ALGORITHM SETTINGS (Collapsible) ---
            const algoTitle = document.createElement('div');
            algoTitle.classList.add('modal-section-title');
            algoTitle.style.cursor = "pointer";
            algoTitle.style.display = "flex";
            algoTitle.style.justifyContent = "space-between";
            algoTitle.style.alignItems = "center";
            algoTitle.style.padding = "8px 0";
            algoTitle.style.transition = "color 0.2s";
            algoTitle.innerHTML = `<span>Random Forest Settings</span><span style="font-size: 0.6rem; opacity: 0.5;">▼</span>`;

            algoTitle.onmouseover = () => algoTitle.style.color = "white";
            algoTitle.onmouseout = () => algoTitle.style.color = "var(--accent-blue)";

            body.appendChild(algoTitle);

            const algoContainer = document.createElement('div');
            algoContainer.classList.add('modal-section');
            algoContainer.style.display = "none"; // Initial state: collapsed
            algoContainer.style.paddingTop = "10px";
            algoContainer.style.borderTop = "1px solid rgba(255,255,255,0.05)";

            algoTitle.onclick = () => {
                const isHidden = algoContainer.style.display === "none";
                algoContainer.style.display = isHidden ? "flex" : "none";
                algoTitle.querySelector('span:last-child').textContent = isHidden ? "▲" : "▼";
                algoTitle.querySelector('span:last-child').style.opacity = isHidden ? "1" : "0.5";
            };

            // Helper to build a standard number row
            const makeNumberRow = (labelText, defaultVal, minVal, maxVal, placeholderText) => {
                const row = document.createElement('div');
                row.classList.add('property-row');
                row.style.padding = "0 4px";
                row.innerHTML = `<span class="property-label">${labelText}</span>`;
                const inp = document.createElement('input');
                inp.type = "number";
                inp.classList.add('property-input');
                if (defaultVal !== null) inp.value = defaultVal;
                if (minVal !== null) inp.min = minVal;
                if (maxVal !== null) inp.max = maxVal;
                if (placeholderText) inp.placeholder = placeholderText;
                row.appendChild(inp);
                algoContainer.appendChild(row);
                return inp;
            };

            // n_estimators
            const estInput = makeNumberRow("N. Estimators:", 200, 10, 2000, null);
            // max_depth
            const depthInput = makeNumberRow("Max Depth:", 15, 1, 100, null);
            // min_samples_split
            const minSplitInput = makeNumberRow("Min Samples Split:", 20, 2, 1000, null);
            // n_jobs
            const jobsInput = makeNumberRow("N. Jobs:", 12, 1, 128, null);

            // use_gpu — toggle switch row
            const gpuRow = document.createElement('div');
            gpuRow.classList.add('property-row');
            gpuRow.style.padding = "0 4px";
            gpuRow.innerHTML = `<span class="property-label">Use GPU:</span>`;

            const gpuToggleWrap = document.createElement('div');
            gpuToggleWrap.classList.add('rf-toggle-wrap');

            const gpuToggle = document.createElement('button');
            gpuToggle.classList.add('rf-toggle-btn');
            gpuToggle.setAttribute('data-on', 'false');
            gpuToggle.textContent = 'OFF';
            gpuToggle.onclick = () => {
                const isOn = gpuToggle.getAttribute('data-on') === 'true';
                gpuToggle.setAttribute('data-on', String(!isOn));
                gpuToggle.textContent = isOn ? 'OFF' : 'ON';
                gpuToggle.classList.toggle('on', !isOn);
            };

            gpuToggleWrap.appendChild(gpuToggle);
            gpuRow.appendChild(gpuToggleWrap);
            algoContainer.appendChild(gpuRow);

            // user_rgb — toggle switch row
            const rgbRow = document.createElement('div');
            rgbRow.classList.add('property-row');
            rgbRow.style.padding = "0 4px";
            rgbRow.innerHTML = `<span class="property-label">Use RGB:</span>`;

            const rgbToggleWrap = document.createElement('div');
            rgbToggleWrap.classList.add('rf-toggle-wrap');

            const rgbToggle = document.createElement('button');
            rgbToggle.classList.add('rf-toggle-btn');
            rgbToggle.setAttribute('data-on', 'false');
            rgbToggle.textContent = 'OFF';
            rgbToggle.onclick = () => {
                const isOn = rgbToggle.getAttribute('data-on') === 'true';
                rgbToggle.setAttribute('data-on', String(!isOn));
                rgbToggle.textContent = isOn ? 'OFF' : 'ON';
                rgbToggle.classList.toggle('on', !isOn);
            };

            rgbToggleWrap.appendChild(rgbToggle);
            rgbRow.appendChild(rgbToggleWrap);
            algoContainer.appendChild(rgbRow);

            body.appendChild(algoContainer);
        },
        (footer, overlay) => {
            const cancelBtn = document.createElement('button');
            cancelBtn.classList.add('btn');
            cancelBtn.style.backgroundColor = 'transparent';
            cancelBtn.style.border = '1px solid var(--border-color)';
            cancelBtn.textContent = "Cancel";
            cancelBtn.onclick = () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            };

            const runBtn = document.createElement('button');
            runBtn.classList.add('btn');
            runBtn.textContent = "Start Training";
            runBtn.onclick = () => {
                const body = overlay.querySelector('.modal-body');

                const trainId = body.querySelector('#train-select').value;
                const valId = body.querySelector('#val-select').value;

                // Reconstruct data map for backend
                const split = {};
                if (trainId !== "none") {
                    split[trainId] = ['train'];
                }
                if (valId !== "none") {
                    if (!split[valId]) split[valId] = [];
                    if (!split[valId].includes('val')) split[valId].push('val');
                }

                // Extract Features from matrix buttons
                const selectedFeatures = [];
                body.querySelectorAll('.feat-cell-btn[data-active="true"]').forEach(btn => {
                    selectedFeatures.push(btn.getAttribute('data-feature'));
                });

                // Extract RF params directly from named inputs/toggle
                const algoSec = body.querySelectorAll('.modal-section')[2];
                const rfInputs = algoSec.querySelectorAll('input[type="number"]');
                const gpuBtn = algoSec.querySelector('.rf-toggle-btn');
                const params = {
                    split,
                    features: selectedFeatures,
                    rf_params: {
                        n_estimators: parseInt(rfInputs[0]?.value) || 200,
                        max_depth: parseInt(rfInputs[1]?.value) || 15,
                        min_samples_split: parseInt(rfInputs[2]?.value) || 20,
                        n_jobs: parseInt(rfInputs[3]?.value) || 12,
                        use_gpu: gpuBtn?.getAttribute('data-on') === 'true'
                    }
                };

                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);

                if (onStart) onStart(params);
            };

            footer.appendChild(cancelBtn);
            footer.appendChild(runBtn);
        }
    );

    // Adjust modal width
    const container = overlay.querySelector('.modal-container');
    if (container) container.style.width = "620px";
}

/**
 * Select points in a 2D area (lasso or rectangle) and highlights them in red.
 * Projects 3D points to screen space to check if they fall within the selection area.
 */
export function deselectPoints(scene, type, area) {
    const loader = getPotree2Loader(scene);
    if (loader && loader.removeSelection) {
        return loader.removeSelection(type, area);
    }
    return 0;
}

export function selectPoints(scene, pointCloudRoot, type, area) {
    if (!pointCloudRoot) {
        console.warn("No point cloud loaded for selection.");
        return 0;
    }

    // Check if we have a Potree2Loader for persistent selection across LOD levels
    const loader = getPotree2Loader(scene);
    if (loader && loader.applySelection) {
        return loader.applySelection(type, area);
    }

    // Fallback logic for simple meshes (non-LOD systems)
    const meshes = pointCloudRoot.getChildMeshes ? pointCloudRoot.getChildMeshes() : [pointCloudRoot];
    const camera = scene.activeCamera;
    const engine = scene.getEngine();
    const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
    const transformMatrix = scene.getTransformMatrix();

    let totalSelected = 0;
    meshes.forEach(mesh => {
        if (!mesh.isVisible) return;
        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
        if (!positions || !colors) return;

        let modified = false;
        const worldMatrix = mesh.getWorldMatrix();

        for (let i = 0; i < positions.length / 3; i++) {
            const vector = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            const projection = BABYLON.Vector3.Project(vector, worldMatrix, transformMatrix, viewport);

            let isInside = false;
            if (type === "rect") {
                isInside = (projection.x >= area.x && projection.x <= area.x + area.width &&
                    projection.y >= area.y && projection.y <= area.y + area.height);
            } else if (type === "lasso") {
                isInside = isPointInPoly(area, [projection.x, projection.y]);
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

    console.log(`🎯 Selection: ${totalSelected.toLocaleString()} points highlighted.`);
    return totalSelected;
}

/**
 * Clear all point selections and reset colors to original.
 * Wrapper around Potree2Loader.clearSelection() for external use.
 */
export function clearSelection(scene) {
    const loader = getPotree2Loader(scene);
    if (loader && loader.clearSelection) {
        loader.clearSelection();
        return;
    }

    // Fallback for simple meshes (non-LOD systems)
    const root = scene.potree2Root;
    if (!root) return;
    const meshes = root.getChildMeshes ? root.getChildMeshes() : [root];
    meshes.forEach(mesh => {
        if (mesh.metadata && mesh.metadata.originalColors) {
            mesh.setVerticesData(
                BABYLON.VertexBuffer.ColorKind,
                new Float32Array(mesh.metadata.originalColors)
            );
        }
    });
    console.log("🧹 Selection cleared.");
}

/**
 * Invert the current point selection.
 * Points that were selected (red) become unselected (original color),
 * and unselected points become selected (red).
 * Works on all currently loaded nodes via Potree2Loader.
 */
export function invertSelection(scene) {
    const loader = getPotree2Loader(scene);

    if (loader && loader.invertSelection) {
        loader.invertSelection();
        return;
    }

    // Fallback for simple meshes (non-LOD systems)
    const root = scene.potree2Root;
    if (!root) return;
    const meshes = root.getChildMeshes ? root.getChildMeshes() : [root];
    meshes.forEach(mesh => {
        const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
        const originalColors = mesh.metadata?.originalColors;
        if (!colors || !originalColors) return;
        const numPoints = colors.length / 4;
        for (let i = 0; i < numPoints; i++) {
            const isSelected = (
                colors[i * 4 + 0] > 0.9 &&
                colors[i * 4 + 1] < 0.1 &&
                colors[i * 4 + 2] < 0.1
            );
            if (isSelected) {
                colors[i * 4 + 0] = originalColors[i * 4 + 0];
                colors[i * 4 + 1] = originalColors[i * 4 + 1];
                colors[i * 4 + 2] = originalColors[i * 4 + 2];
                colors[i * 4 + 3] = originalColors[i * 4 + 3];
            } else {
                colors[i * 4 + 0] = 1.0;
                colors[i * 4 + 1] = 0.0;
                colors[i * 4 + 2] = 0.0;
                colors[i * 4 + 3] = 1.0;
            }
        }
        mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
    });
    console.log("🔄 Selection inverted (fallback).");
}

/**
 * Standard Point-in-Polygon algorithm (Ray Casting)
 */
function isPointInPoly(poly, pt) {
    const x = pt[0], y = pt[1];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}