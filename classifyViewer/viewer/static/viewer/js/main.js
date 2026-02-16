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
    frameCameraOnMesh,
    setLODParameters
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
    const root = sceneObjects.currentPointCloud;
    if (!root) return;

    const classColors = [
        [1, 0, 0],    // Red
        [0.1, 0.8, 0.2],  // Green
        [0.2, 0.4, 1],    // Blue
        [1, 0.9, 0.1],    // Yellow
        [0.8, 0.2, 1]     // Magenta
    ];

    // Se è il nuovo sistema a cluster (TransformNode o gruppi di mesh)
    if (root.getChildMeshes) {
        root.getChildMeshes().forEach((mesh, clusterIdx) => {
            const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            if (!colors) return;

            const originalColors = mesh.metadata?.originalColors;

            for (let i = 0; i < colors.length / 4; i++) {
                if (mode === "color" && originalColors) {
                    colors[i * 4] = originalColors[i * 4];
                    colors[i * 4 + 1] = originalColors[i * 4 + 1];
                    colors[i * 4 + 2] = originalColors[i * 4 + 2];
                    colors[i * 4 + 3] = originalColors[i * 4 + 3];
                } else {
                    // Mock classification: different color pattern per cluster or per point
                    const classId = Math.floor((i + clusterIdx * 10) % 5);
                    colors[i * 4] = classColors[classId][0];
                    colors[i * 4 + 1] = classColors[classId][1];
                    colors[i * 4 + 2] = classColors[classId][2];
                    colors[i * 4 + 3] = 1.0;
                }
            }
            mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
        });
    }
    // Caso PCS (vecchio sistema, mantenuto per compatibilità)
    else if (root._pcs) {
        const pcsSystem = root._pcs;
        pcsSystem.updateParticle = (particle) => {
            if (mode === "color") {
                particle.color.copyFrom(particle.originalColor || particle.color);
            } else {
                const classId = Math.floor(particle.idx % 5);
                const c = classColors[classId];
                particle.color.set(c[0], c[1], c[2], 1.0);
            }
            return particle;
        };
        pcsSystem.setParticles();
    }
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
const loadPCButton = createButton("Load PointCloud", "loadPC", importExportContent);
const downloadPCButton = createButton("Download PointCloud", "downloadPC", importExportContent);

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
const maxPointsSlider = createSlider("Max Points (M)", 1, 20, 5, 1, viewportContent); // 1M a 20M
const maxErrorSlider = createSlider("Max Error (px)", 0.1, 10, 3.0, 0.1, viewportContent); // 0.1 a 10
const nearClipSlider = createSlider("Near Clip", 0.01, 10, 0.1, 0.01, viewportContent);
const farClipSlider = createSlider("Far Clip", 100, 50000, 10000, 100, viewportContent);

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
const gridGround = BABYLON.MeshBuilder.CreateGround("gridGround", { width: 10000, height: 10000 }, scene);
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
    const pc = sceneObjects.currentPointCloud;
    if (pc) {
        // Handle both simple mesh and clustered TransformNode
        if (pc.getChildMeshes) {
            pc.getChildMeshes().forEach(mesh => {
                if (mesh.material) mesh.material.pointSize = size;
            });
        } else if (pc.material) {
            pc.material.pointSize = size;
        }
    }
    // Update LOD loader if active
    setLODParameters(scene, { pointSize: size });
});

// Slider Max Points
maxPointsSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    setLODParameters(scene, { maxVisiblePoints: val * 1000000 });
});

// Slider Max Error
maxErrorSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    setLODParameters(scene, { maxScreenSpaceError: val });
});

// Slider Near Clip
nearClipSlider.addEventListener('input', (e) => {
    camera.minZ = parseFloat(e.target.value);
});

// Slider Far Clip
farClipSlider.addEventListener('input', (e) => {
    camera.maxZ = parseFloat(e.target.value);
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

loadPCButton.addEventListener("click", async () => {
    const metadataUrl = "static/viewer/data/clusters/hierarchy.json";
    const clusterFolder = "static/viewer/data/clusters";
    const currentPointSize = parseFloat(pointSizeSlider.value);
    const loadingOverlay = document.getElementById("loading-overlay");

    // Mostra Overlay
    if (loadingOverlay) loadingOverlay.classList.add("visible");

    try {
        // Call loadPointCloud with LOD enabled (default)
        const pc = await loadPointCloud(clusterFolder, scene);

        if (pc) {
            sceneObjects.currentPointCloud = pc;

            // Apply point size if the loader exposes a way to do it globally
            // For the LOD loader, we might need a specific method, but we can try iterating if meshes are already there
            // Note: The LOD loader applies point size dynamically as nodes load.
            // We can force an initial update if necessary or rely on the loader's default.
            // However, let's keep the legacy logic for safety if it returns a simple TransformNode with children immediately.
            if (pc.getChildMeshes && pc.getChildMeshes().length > 0) {
                pc.getChildMeshes().forEach(mesh => {
                    if (mesh.material) mesh.material.pointSize = currentPointSize;
                });
            }

            // Se abbiamo accesso al loader LOD (salvato in scene.lodLoader), aggiorniamo la dimensione
            if (scene.lodLoader) {
                scene.lodLoader.setPointSize(currentPointSize);
            }

            // Applica la modalità colore corrente (Color o Classification)
            // Nota: Con LOD dinamico, questo dovrà essere riapplicato ogni volta che nuovi nodi vengono caricati.
            // Per ora lo applichiamo ai nodi iniziali.
            switchColorMode(currentColorMode);

            // Centra la camera sulla nuvola
            // IMPORTANTE: senza questo, il LOD potrebbe pensare che la nuvola sia fuori vista se la camera è lontana (0,0,0)
            frameCameraOnMesh(camera, pc);
        }
    } catch (e) {
        console.error("Failed to load point cloud:", e);
        alert("Error loading point cloud. See console for details.");
    } finally {
        // Nascondi Overlay
        if (loadingOverlay) loadingOverlay.classList.remove("visible");
    }
});

downloadPCButton.addEventListener("click", () => {
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

// --- Global Context Menu Prevention ---
window.addEventListener('contextmenu', (e) => {
    // Prevent default browser context menu globally
    // Custom context menus (like in classes) will still work because they call e.preventDefault() themselves
    e.preventDefault();
}, false);

// --- Initialize UI Menus ---
initViewMenu();
initColorMenu();
initToolbar();

// --- Tool Actions ---
const frameToPCDButton = document.getElementById("tool-4");
if (frameToPCDButton) {
    frameToPCDButton.addEventListener("click", () => {
        if (sceneObjects.currentPointCloud) {
            frameCameraOnMesh(camera, sceneObjects.currentPointCloud);
        } else {
            console.warn("No point cloud loaded to frame.");
        }
    });
}