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
// Testa quanta memoria ha il tuo browser
console.log("Max heap size:", performance.memory?.jsHeapSizeLimit / 1024 / 1024, "MB");
console.log("Used heap:", performance.memory?.usedJSHeapSize / 1024 / 1024, "MB");
// Stima punti massimi
const maxMemoryMB = 4000; // 2GB sicuri
const bytesPerPoint = 40;
const maxPoints = (maxMemoryMB * 1024 * 1024) / bytesPerPoint;
console.log("Punti massimi stimati:", Math.floor(maxPoints / 1000000), "milioni");
// Output: ~52 milioni di punti
const folder_path = "static/viewer/data/";
const export_folder_path = "/app/classifyViewer/viewer/static/viewer/data/";
const filepath = folder_path + "c78Europ_segm.ply";
const pointCloud = await loadPointCloud(filepath, scene);
frameCameraOnMesh(camera, pointCloud);

importPCButton.addEventListener("click", async () => {

    // Salva PLY binary
    await exportPointCloud(pointCloud, export_folder_path + "c78_exp.ply", "ply", true);

    // // Salva TXT ascii
    // await exportPointCloud(pointCloud, folder_path + "/c78_exp.txt", "txt", false);
    
});

