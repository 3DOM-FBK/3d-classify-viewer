import { createButton, createButtonGrid, textVisible, textNotVisible, loadPointCloud, frameCameraOnMesh } from "./functions.js";

// Ottieni il canvas e crea l'engine
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

// Crea la scena
export var scene = new BABYLON.Scene(engine);

// Aggiungi camera orbitale
var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Impostazioni scroll graduale / smooth
camera.lowerRadiusLimit = null;
camera.upperRadiusLimit = 20;
camera.wheelDeltaPercentage = 0.05;
camera.inertia = 0.8;
camera.useNaturalPinchZoom = true;

// Rotazione verticale libera
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

const importPCButton = createButton("Import PointCCloud", "importPC");

importPCButton.addEventListener("click", () =>{
    // const response = fetch("/load-points/");
    // response.then(res => res.json()).then(data => {
        
    // });
    const filepath = "static/viewer/data/cloud.txt"
    console.log("File path:", filepath);
    const point_cloud = loadPointCloud(filepath, scene);
    frameCameraOnMesh(camera, point_cloud);
  });
