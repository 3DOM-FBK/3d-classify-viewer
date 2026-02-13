import { scene } from "./main.js";

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
// LOADING POINT CLOUD
export async function loadPointCloud(url, scene) {
    if (url.endsWith(".ply")) {
        try {
            console.log("Loading point cloud from:", url);

            // 🔧 Carica prima i dati del PLY
            const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", url, scene);
            const tempMesh = result.meshes[0];

            // Estrai dati
            const positions = tempMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const colors = tempMesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            const normals = tempMesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);

            const numPoints = positions.length / 3;
            // console.log(`📊 Punti caricati: ${numPoints.toLocaleString()}`);

            // 🔧 CREA POINT CLOUD SYSTEM
            const pcs = new BABYLON.PointsCloudSystem("pcs", 1, scene);
            pcs.pointSize = 3;
            // Funzione per inizializzare ogni punto
            pcs.addPoints(numPoints, (particle, i) => {
                const idx = i * 3;

                // Posizione
                particle.position.set(
                    positions[idx],
                    positions[idx + 1],
                    positions[idx + 2]
                );

                // Colore
                if (colors) {
                    const colorIdx = i * 4;
                    particle.color = new BABYLON.Color4(
                        colors[colorIdx],
                        colors[colorIdx + 1],
                        colors[colorIdx + 2],
                        1.0
                    );
                    particle.originalColor = particle.color.clone();
                }

                // Normale (opzionale)
                if (normals) {
                    // PCS non usa direttamente le normali, ma puoi salvarle
                    particle.normal = new BABYLON.Vector3(
                        normals[idx],
                        normals[idx + 1],
                        normals[idx + 2]
                    );
                }
            });

            // 🔧 Build del PCS
            await pcs.buildMeshAsync();

            // 🔧 Ottimizzazioni
            pcs.mesh.alwaysSelectAsActiveMesh = true; // Sempre visibile
            pcs.computeParticleColor = false; // Usa colori già impostati
            pcs.computeParticleTexture = false;

            // Rimuovi mesh temporanea
            tempMesh.dispose();

            // console.log(`✅ Point Cloud System creato con ${numPoints.toLocaleString()} punti`);
            pcs.mesh.isPickable = true;
            pcs.mesh.refreshBoundingInfo(true);
            pcs.mesh._pcs = pcs; // Link PCS to mesh for easy access

            return pcs.mesh;

        } catch (err) {
            console.error(`Error loading PLY:`, err);
            return null;
        }
    } else if (url.endsWith(".txt")) {
        try {
            console.log("Loading point cloud from:", url);

            const response = await fetch(url);
            const text = await response.text();
            const lines = text.split("\n");

            const positions = [];
            const colors = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(/\s+/).map(Number);
                if (values.length < 3) continue;

                const [x, y, z, r, g, b] = values;
                positions.push(x, y, z);

                // Optional color
                if (r !== undefined && g !== undefined && b !== undefined) {
                    colors.push(r / 255, g / 255, b / 255, 1.0);
                }
            }

            const numPoints = positions.length / 3;
            // console.log(`📊 Punti caricati: ${numPoints.toLocaleString()}`);

            // 🔧 CREA POINT CLOUD SYSTEM
            const pcs = new BABYLON.PointsCloudSystem("pcs", 1, scene);

            pcs.addPoints(numPoints, (particle, i) => {
                const idx = i * 3;

                particle.position.set(
                    positions[idx],
                    positions[idx + 1],
                    positions[idx + 2]
                );

                if (colors.length > 0) {
                    const colorIdx = i * 4;
                    particle.color = new BABYLON.Color4(
                        colors[colorIdx],
                        colors[colorIdx + 1],
                        colors[colorIdx + 2],
                        1.0
                    );
                    particle.originalColor = particle.color.clone();
                }
            });

            await pcs.buildMeshAsync();

            pcs.mesh.alwaysSelectAsActiveMesh = true;
            pcs.computeParticleColor = false;
            pcs.computeParticleTexture = false;

            // console.log(`✅ Point Cloud System creato`);
            pcs.mesh.isPickable = true;
            pcs.mesh.refreshBoundingInfo(true);
            pcs.mesh._pcs = pcs; // Link PCS to mesh for easy access

            return pcs.mesh;

        } catch (err) {
            console.error("Error loading TXT:", err);
            return null;
        }

    } else {
        console.error("Unsupported file format:", url);
        return null;
    }

}

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
export function frameCameraOnMesh(camera, mesh) {
    console.log("Centering camera on mesh:", mesh.name);
    const bbox = mesh.getBoundingInfo().boundingBox;
    const min = bbox.minimumWorld;
    const max = bbox.maximumWorld;

    const center = min.add(max).scale(0.5);
    const size = max.subtract(min);
    const radius = size.length() * 0.6;

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