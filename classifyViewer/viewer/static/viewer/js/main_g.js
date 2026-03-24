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


// const importPCButton = createButton("Export PointCloud", "importPC");
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
 
// importPCButton.addEventListener("click", async () => {

//     // Salva PLY binary
//     //await exportPointCloud(pointCloud, export_folder_path + "c78_exp.ply", "ply", true);

//     // // Salva TXT ascii
//     await exportPointCloud(pointCloud, export_folder_path + "c78_exp.txt", "txt", true);
    
// });

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
const stopGButton = createButton("Stop G", "stopG");
stopGButton.style.position = "absolute";
stopGButton.style.top = "90dvh";
stopGButton.style.right = "50dvw";
stopGButton.style.transform = "translateX(50%)";
stopGButton.style.width = "10dvh";


stopGButton.addEventListener("click", async () => {
    // Send request to launch function
    // console.log("Sending request to stop the process...");
    const response = await send_request("stop_process/", "POST");
    
    if (response.ok) {  
        console.log("Process stopped successfully..");
    } else {
        const error = `Error: ${response.statusText}`;
        console.error(`${error}`);
    }
});

const testGButton = createButton("Test G", "testG");
testGButton.style.position = "absolute";
testGButton.style.top = "85dvh";
testGButton.style.right = "50dvw";
testGButton.style.transform = "translateX(50%)";
testGButton.style.width = "10dvh";


testGButton.addEventListener("click", async () => {
    
    console.log("Sending request for testing the function...");

    const which_function = "launch_RF_training/";
    let body = null;
    let file_path = "";
    let use_gpu = false;
    let selected_features = ['red','green','blue','Omnivariance_0_4','Planarity_0_4','Linearity_0_4','Surface_variation_0_4'];
    const folder_path = "/webapp/classifyViewer/viewer/static/viewer/data2/";

    switch (which_function) {
        case "launch_RF_training/": {
            // TRAINING RF PARAMETERS
            const n_jobs = 12;
            const nr_estimators = 200;
            const max_depth = 15;
            const min_samples_split = 20;
            const max_features = "sqrt";
            use_gpu = true;

            // Use absolute paths for training
            const training_filepath = folder_path + "RF/training_using_gaussian/dataset/training.las";
            const val_filepath = folder_path + "RF/training_using_gaussian/dataset/validation.las";
            const output_training_name = folder_path + "RF/training_using_gaussian/output/test_predicted.las";
            const model_savepath = folder_path + "RF/training_using_gaussian/output/model_avt_gaussian.pkl";

            body = JSON.stringify({
                n_jobs: n_jobs,
                nr_estimators: nr_estimators,
                max_depth: max_depth,
                min_samples_split: min_samples_split,
                max_features: max_features,
                use_gpu: use_gpu, 
                selected_features: selected_features, 
                training_filepath: training_filepath,
                val_filepath: val_filepath, 
                output_training_name: output_training_name,
                model_savepath: model_savepath

            });
            break;
        }
        case "launch_RF_classify/":{
            use_gpu = true;
            const model_savepath = folder_path +"RF/training_using_gaussian/output/model_avt_gaussian.pkl";
            const test_filepath = folder_path +"RF/training_using_gaussian/dataset/test_avt.las";
            const output_classify_name = folder_path +"RF/training_using_gaussian/output/avt_gs_predicted.las";

            body = JSON.stringify({
                use_gpu: use_gpu, 
                selected_features: selected_features, 
                model_savepath: model_savepath, 
                test_filepath: test_filepath, 
                output_classify_name: output_classify_name
            });
            break;
        }
        case "subsample_pc/": {
            // SUBSAMPLING PARAMETERS
            file_path = folder_path + "c78_pc.ply";
            const voxel_size = 0.05; // 5cm

            body = JSON.stringify({
                file_path: file_path,
                voxel_size: voxel_size
            });
            break;
        }
        case "mesh2pc/": {
            // MESH TO POINT CLOUD PARAMETERS
            let file_path = folder_path + "c78_mesh.glb";
            const out_path = folder_path + "c78_pc_output.las";
            let num_points = 5000000; // 5 millions points
            // const sampling_method = "uniform"; // or "poisson"

            body = JSON.stringify({
                file_path: file_path,
                out_path: out_path,
                num_points: num_points,
                //sampling_method: sampling_method // not used for C++
            });
            break;
        }
        case "ply2las/": {
            // PLY TO LAS PARAMETERS
            file_path = folder_path + "c78_pc.ply";
            const out_path = folder_path + "c78_pc_output.las";

            body = JSON.stringify({
                file_path: file_path,
                out_path: out_path
            });
            break;
        }
        case "feature_extraction/":{
            // FEATURE EXTRACTION PARAMETERS

            let input_filepath = folder_path + "c78_pc.las";
            let output_filepath = folder_path + "c78_pc_feat.las";
            let radius_list = [0.4, 1.0, 2.0];
            let feature_list = ["planarity", "linearity", "height"];
            let sampling = 0.05; // 5cm

            body = JSON.stringify({
                input_filepath: input_filepath,
                output_filepath: output_filepath,
                radius_list: radius_list,
                feature_list: feature_list
                // sampling: sampling // maybe not used
            });
            break;
            
        }
        default:
            console.error("Unknown function:", which_function); 
    }
        
    // Send request to launch function
    const response = await send_request(which_function, "POST", body);
    
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
