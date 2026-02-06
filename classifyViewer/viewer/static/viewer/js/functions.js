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

            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "",
                url,
                scene,
                (evt) => {
                    if (evt.lengthComputable) {
                        const percent = Math.floor((evt.loaded / evt.total) * 100);
                        if (percent % 25 === 0) {
                            console.log(`Loading: ${percent}%`);
                        }
                    }
                }
            );

            const mesh = result.meshes[0];

            mesh.refreshBoundingInfo(true);
            mesh.createNormals(true);
            
            // console.log("✅ Nuvola PLY caricata:", mesh);
            return mesh;

        } catch (err) {
            console.error(`❌ Errore caricamento PLY ${url}:`, err);
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
            console.error("❌ Errore caricamento TXT:", err);
        }
    } else {
        console.error("Unsupported file format:", url);
        return null;
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