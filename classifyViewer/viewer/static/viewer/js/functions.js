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
export async function loadPointCloudPLY(url) {
    try {
        console.log("📦 Carico nuvola di punti:", url);
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", url, scene);
        const mesh = result.meshes[0];

        // Centro e scala
        // centerMesh(mesh);
        // normalizeScale(mesh, 1);

        // Materiale point cloud
        const mat = new BABYLON.StandardMaterial("pointMat", scene);
        mat.pointsCloud = true;
        mat.pointSize = 2.0;
        mesh.material = mat;

        console.log("Nuvola di punti caricata e centrata:", mesh);
        return mesh;
    } catch (err) {
        console.error(`Errore caricamento PLY ${url}:`, err);
    }
}

export async function loadPointCloudTXT(url, scene) {
    try {
        console.log("📦 Carico nuvola di punti TXT:", url);

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

            // colore opzionale
            if (r !== undefined && g !== undefined && b !== undefined) {
                colors.push(r / 255, g / 255, b / 255, 1.0);
            }
        }

        console.log("Numero di punti:", positions.length / 3);

        // 🔹 Mesh vuota
        const mesh = new BABYLON.Mesh("pointCloudTXT", scene);

        // 🔹 Vertex data
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;

        if (colors.length > 0) {
            vertexData.colors = colors;
        }

        vertexData.applyToMesh(mesh);

        // 🔹 Materiale point cloud
        const mat = new BABYLON.StandardMaterial("pointMatTXT", scene);
        mat.pointsCloud = true;
        mat.pointSize = 2.0;
        mat.disableLighting = true;

        mesh.material = mat;

        console.log("✅ Nuvola TXT caricata:", mesh);
        return mesh;

    } catch (err) {
        console.error("❌ Errore caricamento TXT:", err);
    }
}

export function frameCameraOnMesh(camera, mesh) {
    mesh.computeWorldMatrix(true);

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