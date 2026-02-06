import {scene} from "./main.js";

// BUTTONS
export function createButton(name, id, where=document.body){
    const button = document.createElement('button');
    button.textContent = name;
    button.id = id;
    where.appendChild(button);
    return button;
}
export function createButtonGrid(id) {
    const grid = document.createElement('div');
    grid.id = id;
    document.body.appendChild(grid);
    return grid;
}

export function textVisible(textName){
    // Visible
    textName.style.pointerEvents = "auto";
    textName.style.opacity = "1";
}
// LOADING POINT CLOUD
export async function loadPointCloud(url, scene) {
    if (url.endsWith(".ply")) {
        try {
            console.log("Load point cloud from:", url);

            BABYLON.SceneLoader.ShowLoadingScreen = false;

            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "",
                url,
                scene,
                (evt) => {
                    if (evt.lengthComputable) {
                        const percent = Math.floor((evt.loaded / evt.total) * 100);
                        if (percent % 10 === 0) {
                            console.log(`Loading: ${percent}%`);
                        }
                    }
                }, 
                ".ply"
            );

            const mesh = result.meshes[0];

            mesh.refreshBoundingInfo(true);
            mesh.createNormals(true);


            // // Dopo aver caricato il mesh
            // if (mesh) {
            //     const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            //     const numPoints = positions.length / 3;
            //     const estimatedMB = (numPoints * 40) / 1024 / 1024;
                
            //     console.log("📊 Punti caricati:", numPoints.toLocaleString());
            //     console.log("📊 Memoria stimata:", Math.round(estimatedMB), "MB");
            // }

            return mesh;

        } catch (err) {
            console.error(`ERROR to load ply ${url}:`, err);
            return null;
        }
    }
    else if (url.endsWith(".txt")) {
        try {
            console.log("Load point cloud from:", url);

            const response = await fetch(url);
            const text = await response.text();
            const lines = text.split("\n");

            const positions = [];
            const colors = [];

            for (let i = 1; i < lines.length; i++) { // salta header
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(/\s+/).map(Number);
                if (values.length < 3) continue;

                const [x, y, z, r, g, b] = values;

                positions.push(x, y, z);

                if (r !== undefined && g !== undefined && b !== undefined) {
                    colors.push(r / 255, g / 255, b / 255, 1.0);
                }
            }

            // console.log("Numero di punti:", positions.length / 3);

            // 🔹 Creiamo una mesh vuota
            const mesh = new BABYLON.Mesh("pointCloudTXT", scene);

            // 🔹 Applichiamo VertexData
            const vertexData = new BABYLON.VertexData();
            vertexData.positions = positions;
            if (colors.length > 0) vertexData.colors = colors;

            const normals = [];
            for (let i = 0; i < positions.length; i += 3) {
                normals.push(0, 1, 0); 
            }
            vertexData.normals = normals;

            vertexData.applyToMesh(mesh, true);

            const mat = new BABYLON.StandardMaterial("pointMatTXT", scene);
            mat.pointsCloud = true;
            mat.pointSize = 1.0; 
            mat.disableLighting = true;
            mat.emissiveColor = new BABYLON.Color3(1, 1, 1); 
            // Abilita vertex colors
            mat.useVertexColors = true; 
            
            mesh.material = mat;
            mesh.computeWorldMatrix(true);

            return mesh;

        } catch (err) {
            console.error("ERROR to load TXT:", err);
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
        console.log(`Saving (${saveQueue.length} in queue): ${filepath}`);
        
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
export function textNotVisible(textName){
    // Not Visible
    textName.style.pointerEvents = "none"; 
    textName.style.opacity = "0"; 
}


export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}