import { createButton, createButtonGrid, textVisible, textNotVisible, loadPointCloud, exportPointCloud, frameCameraOnMesh } from "./functions.js";

// Ottieni il canvas e crea l'engine
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

// Crea la scena
export var scene = new BABYLON.Scene(engine);

const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 3,
    100,
    BABYLON.Vector3.Zero(),
    scene
);
camera.attachControl(canvas, true);

camera.lowerRadiusLimit = 0.1;
camera.upperRadiusLimit = 2000;
camera.inertia = 0.9;
camera.angularSensibilityX = 1000;
camera.angularSensibilityY = 1000;
camera.panningSensibility = 100;
camera.wheelDeltaPercentage = 0.05;
camera.lowerBetaLimit = 0.01;
camera.upperBetaLimit = Math.PI - 0.01;



// Aggiungi luce
var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// // Aggiungi un cubo semplice
// var box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);

// Render loop
engine.runRenderLoop(function () {
    scene.render();
});

// Adatta l'engine alla finestra
window.addEventListener("resize", function () {
    engine.resize();
});


const importPCButton = createButton("Export PointCloud", "importPC");
console.clear();
// // Testa quanta memoria ha il tuo browser
// console.log("Max heap size:", performance.memory?.jsHeapSizeLimit / 1024 / 1024, "MB");
// console.log("Used heap:", performance.memory?.usedJSHeapSize / 1024 / 1024, "MB");
// // Stima punti massimi
// const maxMemoryMB = 4000; // 2GB sicuri
// const bytesPerPoint = 40;
// const maxPoints = (maxMemoryMB * 1024 * 1024) / bytesPerPoint;
// console.log("Punti massimi stimati:", Math.floor(maxPoints / 1000000), "milioni");
// // Output: ~52 milioni di punti


// TEST IMPORT
// const folder_path = "static/viewer/data/";
// const export_folder_path = "/app/classifyViewer/viewer/static/viewer/data/";
// const filepath = folder_path + "c78Europ_segm.ply";
// const pointCloud = await loadPointCloud(filepath, scene);
// const positions = pointCloud.getVerticesData(
//     BABYLON.VertexBuffer.PositionKind
// );
// frameCameraOnMesh(camera, pointCloud);
 
importPCButton.addEventListener("click", async () => {

    // Salva PLY binary
    //await exportPointCloud(pointCloud, export_folder_path + "c78_exp.ply", "ply", true);

    // // Salva TXT ascii
    await exportPointCloud(pointCloud, export_folder_path + "c78_exp.txt", "txt", true);
    
});

scene.onPointerDown = (evt) => {
    const ray = scene.createPickingRay(
        evt.clientX,
        evt.clientY,
        BABYLON.Matrix.Identity(),
        camera
    );

    let closestDist = Infinity;
    let closestPoint = null;

    for (let i = 0; i < positions.length; i += 3) {
        const p = new BABYLON.Vector3(
            positions[i],
            positions[i + 1],
            positions[i + 2]
        );

        const dist = BABYLON.Vector3.Distance(ray.origin, p);
        if (dist < closestDist) {
            closestDist = dist;
            closestPoint = p;
        }
    }

    if (closestPoint) {
        console.log("🎯 Selected point:", closestPoint);

        const sphere = BABYLON.MeshBuilder.CreateSphere(
            "marker",
            { diameter: 0.05 },
            scene
        );
        sphere.position.copyFrom(closestPoint);
    }
};


const testGButton = createButton("Test G", "testG");
testGButton.style.position = "absolute";
testGButton.style.top = "90dvh";
testGButton.style.right = "50dvw";
testGButton.style.transform = "translateX(50%)";
testGButton.style.width = "10dvh";

// TODO: remove button
// #testG{
//     background-color: var(--canvas-bg-color);
//     color: var(--text-color);
//     font-size: var(--button-font-size);
//     border-radius: var(--button-border-radius);
//     padding: var(--button-padding);
//     position: absolute;
//     top: 90dvh;
//     right: 50dvw;
//     transform: translateX(50%);
//     cursor: pointer;
//     z-index: 1;
// }

testGButton.addEventListener("click", async () => {
    
    console.log("Sending request for testing the function...");

    // TRAINING RF PARAMETERS
    // const nr_estimators = "50-100-150-200";
    // const max_depth = "None";
    // const n_jobs = 12;

    // const body = JSON.stringify({
    //             nr_estimators: nr_estimators,
    //             max_depth: max_depth,
    //             n_jobs: n_jobs
    //         })

    // SUBSAMPLING PARAMETERS
    // const file_path = "/app/classifyViewer/viewer/static/viewer/data/c78_pc.ply";
    // const voxel_size = 0.05; // 5cm
    // const body = JSON.stringify({
    //     file_path: file_path,
    //     voxel_size: voxel_size
    // });

    // MESH TO POINT CLOUD PARAMETERS
    // const file_path = "/app/classifyViewer/viewer/static/viewer/data/c78.glb";
    // const num_points = 5000000; // 5 millions points
    // const sampling_method = "uniform"; // or "poisson"
    // const body = JSON.stringify({
    //     file_path: file_path,
    //     num_points: num_points,
    //     sampling_method: sampling_method
    // });
    // PLY TO LAS PARAMETERS
    const file_path = "/app/classifyViewer/viewer/static/viewer/data/c78_pc.ply";
    const out_path = "/app/classifyViewer/viewer/static/viewer/data/c78_pc.las";
    const body = JSON.stringify({
        file_path: file_path,
        out_path: out_path
    });
    
    // Send request to launch function
    const response = await send_request("ply2las/", "POST", body);
    
    if (response.ok) {  
        console.log("Function completed successfully.");
    } else {
        const error = `Error: ${response.statusText}`;
        console.error(`${error}`);
    }


});

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}


async function send_request(which_function, method, body=null) {
    const response = await fetch(which_function, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: body
    });
    return response;
}


function highlightPoint(mesh, index) {
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    const p = new BABYLON.Vector3(
        positions[index],
        positions[index + 1],
        positions[index + 2]
    );

    const sphere = BABYLON.MeshBuilder.CreateSphere("sel", {
        diameter: 0.02
    }, scene);

    sphere.position = p;
}
