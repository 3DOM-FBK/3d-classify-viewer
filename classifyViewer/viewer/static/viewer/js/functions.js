import { scene } from "./main.js";

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

export function createOutlineItem(name, iconSrc, parent) {
    const row = document.createElement('div');
    row.classList.add('outline-item');

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

    let isVisible = true;
    visibilityBtn.addEventListener('click', () => {
        isVisible = !isVisible;
        visibilityIcon.src = isVisible ? `${iconBase}visibility-on.png` : `${iconBase}visibility-off.png`;
        visibilityBtn.classList.toggle('off', !isVisible);
        // Logic to hide the real mesh in BabylonJS will be added here
    });

    row.appendChild(mainInfo);
    row.appendChild(visibilityBtn);
    parent.appendChild(row);

    return { nameInput, visibilityBtn };
}

export function createClassItem(name, iconSrc, parent) {
    const row = document.createElement('div');
    row.classList.add('outline-item', 'class-item'); // Reuse part of the outline style

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
    parent.appendChild(row);

    // Right-click event for context menu
    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const iconBase = "static/viewer/icons/";
        showContextMenu(e.clientX, e.clientY, [
            {
                label: `Assign "${nameInput.value}" to selection`,
                icon: `${iconBase}cursor.png`,
                action: () => {
                    console.log(`Class assignment: ${nameInput.value}`);
                    // Logic to change the color/ID of selected points will be added here
                    alert(`Class "${nameInput.value}" assigned to selected points.`);
                }
            },
            {
                label: `Delete "${nameInput.value}"`,
                icon: `${iconBase}trash.png`,
                action: () => {
                    if (confirm(`Are you sure you want to delete the class "${nameInput.value}"?`)) {
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
    createModal(
        "Load Point Cloud",
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
                <span>Supports .ply, .las, .laz</span>
            `;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.classList.add('file-input-hidden');
            fileInput.accept = ".ply,.las,.laz";

            fileInput.onchange = (e) => {
                const fileName = e.target.files[0]?.name;
                if (fileName) {
                    fileCustom.innerHTML = `<b>Selected:</b> <span>${fileName}</span>`;
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
            const subToggle = createSimpleCheckbox("Enable Subsampling", false, subContainer);

            const subSettings = document.createElement('div');
            subSettings.classList.add('expandable-content');

            // Add settings to subSettings
            // Voxel Size Slider
            const voxelRow = document.createElement('div');
            voxelRow.classList.add('property-row');
            voxelRow.style.padding = "0 4px";
            voxelRow.innerHTML = `<span class="property-label">Voxel Size (m):</span>`;
            const voxelInput = document.createElement('input');
            voxelInput.type = "number";
            voxelInput.classList.add('property-input');
            voxelInput.value = "0.05";
            voxelInput.step = "0.01";
            voxelInput.min = "0.01";
            voxelRow.appendChild(voxelInput);
            subSettings.appendChild(voxelRow);

            // Method Select
            const methodRow = document.createElement('div');
            methodRow.classList.add('property-row');
            methodRow.style.padding = "0 4px";
            methodRow.innerHTML = `<span class="property-label">Strategy:</span>`;
            const methodSelect = document.createElement('select');
            methodSelect.classList.add('property-input');
            methodSelect.style.width = "100px";
            methodSelect.innerHTML = `
                <option value="voxel">Voxel Grid</option>
                <option value="random">Random</option>
            `;
            methodRow.appendChild(methodSelect);
            subSettings.appendChild(methodRow);

            subToggle.onchange = (e) => {
                subSettings.classList.toggle('visible', e.target.checked);
            };

            subSection.appendChild(subContainer);
            subSection.appendChild(subSettings);
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
            uploadBtn.onclick = () => {
                console.log("Upload triggered (to be implemented)");
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            };

            footer.appendChild(cancelBtn);
            footer.appendChild(uploadBtn);
        }
    );
}