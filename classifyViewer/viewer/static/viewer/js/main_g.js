import { createButton, createButtonGrid, textVisible, textNotVisible, loadPointCloud, frameCameraOnMesh } from "./functions.js";

// Ottieni il canvas e crea l'engine
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

// Crea la scena
export var scene = new BABYLON.Scene(engine);

// camera già creata
const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,     // alpha (rotazione orizzontale)
    Math.PI / 3,     // beta  (rotazione verticale)
    100,             // radius
    BABYLON.Vector3.Zero(),
    scene
);

camera.attachControl(canvas, true);

// Impostazioni zoom fluido
camera.lowerRadiusLimit = null;
camera.upperRadiusLimit = 10000;
camera.inertia = 0.8;

// 🔹 LIMITI PAN VERTICALE
camera.lowerBetaLimit = 0.2;          // non può andare troppo in basso
camera.upperBetaLimit = Math.PI - 0.2; // non può andare troppo in alto
camera.angularSensibilityX = 1200; 
camera.angularSensibilityY = 1200;
camera.panningSensibility = 100; 
camera.wheelDeltaPercentage = 0.02; 


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


const importPCButton = createButton("Import PointCCloud", "importPC");

importPCButton.addEventListener("click", async () => {
    console.clear();
    const folder_path = "static/viewer/data/";
    const filepath = folder_path + "cloud.ply";
    const pointCloud = await loadPointCloud(filepath, scene);
    frameCameraOnMesh(camera, pointCloud);
    
});

