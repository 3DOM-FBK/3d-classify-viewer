import {
    createButton,
    createToolButton,
    createAccordionSection,
    createPropertyRow,
    createCheckbox,
    createSlider,
    createOutlineItem,
    createClassItem,
    loadPointCloud,
    frameCameraOnMesh
} from "./functions.js";

// --- UI Elements ---
const sidebarLeft = document.getElementById('sidebar-left');
const sidebarRight = document.getElementById('sidebar-right');
const resizerLeft = document.getElementById('resizer-left');
const resizerRight = document.getElementById('resizer-right');
const rightToolbar = document.getElementById('right-toolbar');
const viewMenu = document.getElementById('view-menu');
const colorMenu = document.getElementById('color-menu');

// --- View Menu Logic ---
function initViewMenu() {
    if (!viewMenu) return;

    const btn = document.createElement('button');
    btn.classList.add('dropdown-btn');
    btn.textContent = "Perspective View";
    viewMenu.appendChild(btn);

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown-content');
    viewMenu.appendChild(dropdown);

    const views = [
        { name: "Perspective", action: () => setCameraMode(BABYLON.Camera.PERSPECTIVE_CAMERA) },
        { name: "Orthographic", action: () => setCameraMode(BABYLON.Camera.ORTHOGRAPHIC_CAMERA) },
        { name: "Top View", action: () => setCameraView(0, -Math.PI / 2) },
        { name: "Bottom View", action: () => setCameraView(0, Math.PI / 2) },
        { name: "Front View", action: () => setCameraView(Math.PI / 2, Math.PI / 2) },
        { name: "Left View", action: () => setCameraView(Math.PI, Math.PI / 2) }
    ];

    views.forEach(v => {
        const opt = document.createElement('button');
        opt.classList.add('dropdown-option');
        opt.textContent = v.name;
        opt.onclick = () => {
            v.action();
            btn.textContent = v.name + " View";
            dropdown.classList.remove('show');
        };
        dropdown.appendChild(opt);
    });

    btn.onclick = (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        dropdown.classList.toggle('show');
    };
}

// --- Color Menu Logic ---
let currentColorMode = "color"; // "color" or "classification"

function initColorMenu() {
    if (!colorMenu) return;

    const btn = document.createElement('button');
    btn.classList.add('dropdown-btn');
    btn.textContent = "Color View";
    colorMenu.appendChild(btn);

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown-content');
    colorMenu.appendChild(dropdown);

    const modes = [
        { name: "Color View", value: "color" },
        { name: "Classification View", value: "classification" }
    ];

    modes.forEach(m => {
        const opt = document.createElement('button');
        opt.classList.add('dropdown-option');
        opt.innerHTML = `<style="width:16px; height:16px; filter:brightness(0) invert(1);"> ${m.name}`;

        opt.onclick = () => {
            switchColorMode(m.value);
            btn.textContent = m.name;
            dropdown.classList.remove('show');
        };
        dropdown.appendChild(opt);
    });

    btn.onclick = (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        dropdown.classList.toggle('show');
    };
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
}

document.addEventListener('click', closeAllDropdowns);

function switchColorMode(mode) {
    currentColorMode = mode;
    const pcs = scene.getMeshByName("pcs_mesh"); // PCS mesh name is "pcs" + "_mesh" by default or check creation
    // In our functions.js, we name it "pcs" and it returns pcs.mesh
    // Actually, let's find it in sceneObjects
    const pcMesh = sceneObjects.currentPointCloud;
    if (!pcMesh || !pcMesh._pcs) return;

    const pcsSystem = pcMesh._pcs;

    pcsSystem.updateParticle = (particle) => {
        if (mode === "color") {
            particle.color.copyFrom(particle.originalColor || particle.color);
        } else {
            // Mock transformation: Use a color based on a mock classification (e.g. position-based for demo)
            // In a real app, this would use a 'classification' attribute stored in the particle
            const classId = particle.classificationId || Math.floor(particle.idx % 5);
            const classColors = [
                new BABYLON.Color4(1, 0, 0, 1), // Red
                new BABYLON.Color4(0, 1, 0, 1), // Green
                new BABYLON.Color4(0, 0, 1, 1), // Blue
                new BABYLON.Color4(1, 1, 0, 1), // Yellow
                new BABYLON.Color4(1, 0, 1, 1)  // Magenta
            ];
            particle.color.copyFrom(classColors[classId % classColors.length]);
        }
        return particle;
    };

    pcsSystem.setParticles();
}

function setCameraMode(mode) {
    camera.mode = mode;
    if (mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
        updateOrthoCamera();
    }
}

function updateOrthoCamera() {
    if (camera.mode !== BABYLON.Camera.ORTHOGRAPHIC_CAMERA) return;

    // Simple ortho calculation based on distance/radius
    const aspect = engine.getAspectRatio(camera);
    const orthoSize = camera.radius || 10;

    camera.orthoTop = orthoSize;
    camera.orthoBottom = -orthoSize;
    camera.orthoLeft = -orthoSize * aspect;
    camera.orthoRight = orthoSize * aspect;
}

function setCameraView(alpha, beta) {
    // Ensure we are in perspective if moving to standard views for better feel, 
    // or keep current mode.
    camera.alpha = alpha;
    camera.beta = beta;
    // Animate would be better, but let's keep it simple for now
}

// --- Right Toolbar Buttons Logic ---
function initToolbar() {
    console.log("Initializing toolbar...", rightToolbar);
    if (!rightToolbar) {
        console.error("Toolbar element #right-toolbar not found!");
        return;
    }

    const iconBase = "/static/viewer/icons/";
    const tool1Img = `<img src="${iconBase}cursor.png" alt="Cursor">`;
    const tool2Img = `<img src="${iconBase}lasso-select.png" alt="Lasso Select">`;
    const tool3Img = `<img src="${iconBase}scissor.png" alt="Scissor">`;
    const tool4Img = `<img src="${iconBase}frame-to-pcd.png" alt="Frame to PCD">`;

    createToolButton("tool-1", tool1Img, "Default mode", rightToolbar);
    createToolButton("tool-2", tool2Img, "Selection mode", rightToolbar);
    createToolButton("tool-3", tool3Img, "Cut mode", rightToolbar);
    createToolButton("tool-4", tool4Img, "Frame to PCD", rightToolbar);
    console.log("Toolbar buttons created.");
}

// --- Sidebar Left: Accordion Sections ---
const iconBase = "static/viewer/icons/";

// 1. Classes
const classesSection = createAccordionSection("Classes", "sidebar-left-content");
const classesContent = classesSection.content;
const classesHeaderActions = classesSection.headerActions;

// Add Class button in the header
const addClassBtn = document.createElement('button');
addClassBtn.classList.add('header-action-btn');
addClassBtn.innerHTML = `<img src="${iconBase}add-class.png" alt="Add Class">`;
addClassBtn.setAttribute('data-tooltip', 'Add New Class');
classesHeaderActions.appendChild(addClassBtn);

let classCounter = 1;
addClassBtn.addEventListener('click', () => {
    createClassItem(`New Class ${classCounter++}`, `${iconBase}cluster.png`, classesContent);
});

// Add default class
createClassItem("Ground", `${iconBase}cluster.png`, classesContent);

// 2. Outline
const outlineSection = createAccordionSection("Outline", "sidebar-left-content");
const outlineContent = outlineSection.content;

const sceneMeshHeader = document.createElement('div');
sceneMeshHeader.classList.add('property-row');
sceneMeshHeader.innerHTML = `<span class="property-label">Scene Mesh:</span>`;
outlineContent.appendChild(sceneMeshHeader);

createOutlineItem("Object.001", `${iconBase}modeling.png`, outlineContent);
createOutlineItem("Object.002", `${iconBase}modeling.png`, outlineContent);

// --- Sidebar Right: State & Objects ---
const sceneObjects = {
    grid: null,
    currentPointCloud: null
};

// --- Sidebar Right: Accordion Sections ---

// 1. Import/Export
const importExportSection = createAccordionSection("IMPORT & EXPORT", "sidebar-right-content");
const importExportContent = importExportSection.content;
const importPCButton = createButton("Import PointCloud", "importPC", importExportContent);
const exportPCButton = createButton("Export PointCloud", "exportPC", importExportContent);

// 2. Training
const trainingSection = createAccordionSection("Training", "sidebar-right-content");
const trainingContent = trainingSection.content;
createPropertyRow("nr estimator", "50-100-150-200", trainingContent);
createPropertyRow("max depth", "None", trainingContent);
createPropertyRow("nr jobs", "12", trainingContent);
const startTrainingButton = createButton("Start Training", "startTraining", trainingContent);

// 3. Subsampling
const subsamplingSection = createAccordionSection("Subsampling", "sidebar-right-content");
const subsamplingContent = subsamplingSection.content;
const subsampleButton = createButton("Apply Subsampling", "subsample", subsamplingContent);

// 4. Viewport Settings
const viewportSection = createAccordionSection("Viewport Settings", "sidebar-right-content");
const viewportContent = viewportSection.content;

const gridToggle = createCheckbox("Show Grid", true, viewportContent);
const pointSizeSlider = createSlider("Point Size", 1, 10, 2, 0.5, viewportContent);

// --- Resizing Logic ---
let isResizing = false;
let currentResizer = null;

const startResizing = (e) => {
    isResizing = true;
    currentResizer = e.target;
    currentResizer.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
};

const handleMouseMove = (e) => {
    if (!isResizing) return;

    if (currentResizer === resizerLeft) {
        const newWidth = e.clientX;
        if (newWidth >= 250 && newWidth <= 500) {
            sidebarLeft.style.width = `${newWidth}px`;
        }
    } else if (currentResizer === resizerRight) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 250 && newWidth <= 500) {
            sidebarRight.style.width = `${newWidth}px`;
        }
    }
    if (typeof engine !== 'undefined') engine.resize();
};

const stopResizing = () => {
    if (!isResizing) return;
    isResizing = false;
    if (currentResizer) currentResizer.classList.remove('active');
    currentResizer = null;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
};

resizerLeft.addEventListener('mousedown', startResizing);
resizerRight.addEventListener('mousedown', startResizing);

// --- BabylonJS Initialization ---
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

export const scene = new BABYLON.Scene(engine);
const style = getComputedStyle(document.documentElement);
const bgColor = style.getPropertyValue('--bg-dark').trim() || "#121214";
const gridLinesColor = style.getPropertyValue('--grid-lines').trim() || "#8d8d99";
scene.clearColor = BABYLON.Color4.FromHexString(bgColor + "FF");

const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);
camera.wheelDeltaPercentage = 0.05;
camera.inertia = 0.8;
camera.panningSensibility = 250;

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// Update ortho camera on zoom
scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
        updateOrthoCamera();
    }
});

// --- Helpers: Grid ---
const gridGround = BABYLON.MeshBuilder.CreateGround("gridGround", { width: 100, height: 100 }, scene);
const gridMaterial = new BABYLON.GridMaterial("gridMaterial", scene);
gridMaterial.mainColor = BABYLON.Color4.FromHexString(bgColor + "FF");
gridMaterial.lineColor = BABYLON.Color4.FromHexString(gridLinesColor + "FF");
gridMaterial.gridRatio = 1;
gridMaterial.backFaceCulling = false;
gridMaterial.opacity = 0.98;
gridGround.material = gridMaterial;
sceneObjects.grid = gridGround;

const axes = new BABYLON.AxesViewer(scene, 0.15, null, null, null, null, 3);

// --- Axes Sphere Wrapper ---
const axesSphere = BABYLON.MeshBuilder.CreateSphere("axesSphere", { diameter: 0.45 }, scene);
const sphereMat = new BABYLON.PBRMaterial("sphereMat", scene);
sphereMat.albedoColor = new BABYLON.Color3(1, 1, 1);
sphereMat.alpha = 0.025;
sphereMat.transparencyMode = BABYLON.PBRMaterial.PBRMETHOD_BLEND;
sphereMat.roughness = 1;
sphereMat.metallic = 0.0;

// Sheen Effect
sphereMat.sheen.isEnabled = true;
sphereMat.sheen.intensity = 5.0;
sphereMat.sheen.color = new BABYLON.Color3(0.23, 0.51, 0.96);

axesSphere.material = sphereMat;
axesSphere.isPickable = false;

scene.registerBeforeRender(() => {
    const distance = 4;
    const aspect = engine.getAspectRatio(camera);
    const viewMatrix = camera.getViewMatrix();
    const invViewMatrix = BABYLON.Matrix.Invert(viewMatrix);
    const cornerPos = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-1.4 * aspect, -1.25, distance), invViewMatrix);

    axes.xAxis.position.copyFrom(cornerPos);
    axes.yAxis.position.copyFrom(cornerPos);
    axes.zAxis.position.copyFrom(cornerPos);
    axesSphere.position.copyFrom(cornerPos);
});

// --- Actions Logic ---

// Toggle Grid
gridToggle.addEventListener('change', (e) => {
    if (sceneObjects.grid) {
        sceneObjects.grid.isVisible = e.target.checked;
    }
});

// Slider Point Size
pointSizeSlider.addEventListener('input', (e) => {
    const size = parseFloat(e.target.value);
    if (sceneObjects.currentPointCloud && sceneObjects.currentPointCloud.material) {
        sceneObjects.currentPointCloud.material.pointSize = size;
    }
});

// --- Scene Info Bar Logic ---
// const mouseCoordsDisplay = document.getElementById('mouse-coords');
const pointCountDisplay = document.getElementById('point-count');
const fpsCounterDisplay = document.getElementById('fps-counter');

// scene.onPointerObservable.add((pointerInfo) => {
//     if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
//         const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
//         if (pickInfo.hit && pickInfo.pickedPoint) {
//             const p = pickInfo.pickedPoint;
//             mouseCoordsDisplay.textContent = `X: ${p.x.toFixed(2)} Y: ${p.y.toFixed(2)} Z: ${p.z.toFixed(2)}`;
//         } else {
//             mouseCoordsDisplay.textContent = "X: --- Y: --- Z: ---";
//         }
//     }
// });

importPCButton.addEventListener("click", () => {
    const filepath = "static/viewer/data/c78Europ_segm.ply";
    loadPointCloud(filepath, scene).then(pc => {
        if (pc) {
            sceneObjects.currentPointCloud = pc;

            // Update point count
            const vertexData = pc.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (vertexData) {
                const count = vertexData.length / 3;
                pointCountDisplay.textContent = count.toLocaleString();
            }

            // Apply current slider size to the new load
            if (pc.material) pc.material.pointSize = parseFloat(pointSizeSlider.value);
            frameCameraOnMesh(camera, pc);
        }
    });
});

exportPCButton.addEventListener("click", () => {
    console.log("Exporting point cloud...");
    alert("Export functionality is under development.");
});

engine.runRenderLoop(() => {
    scene.render();
    if (fpsCounterDisplay) {
        fpsCounterDisplay.textContent = engine.getFps().toFixed(0);
    }
});

window.addEventListener("resize", () => {
    engine.resize();
    updateOrthoCamera();
});

// --- Initialize UI Menus ---
initViewMenu();
initColorMenu();
initToolbar();
