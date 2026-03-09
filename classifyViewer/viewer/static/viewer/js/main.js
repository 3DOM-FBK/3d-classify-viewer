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
    showDownloadModal,
    showLoadModal,
    showTrainingModal,
    showRecalculateFeaturesModal,
    selectPoints,
    deselectPoints,
    clearSelection,
    invertSelection,
    applyClassToSelection,
    classRegistry
} from "./functions.js";

// --- UI Elements ---
const sidebarLeft = document.getElementById('sidebar-left');
const sidebarRight = document.getElementById('sidebar-right');
const resizerLeft = document.getElementById('resizer-left');
const resizerRight = document.getElementById('resizer-right');
const rightToolbar = document.getElementById('right-toolbar');
const viewMenu = document.getElementById('view-menu');
const colorMenu = document.getElementById('color-menu');
const centralViewport = document.getElementById('central-viewport');

// --- Tool Selection State ---
let activeTool = "tool-1"; // Default mode

// selection state
let isDrawingLasso = false;
let isDrawingRect = false;
let lassoPoints = [];
let rectStartPoint = null;
let lassoOverlay = null;
let lassoPath = null;
let rectShape = null;

function initLassoOverlay() {
    if (document.getElementById('lasso-overlay')) return;

    lassoOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lassoOverlay.id = "lasso-overlay";
    lassoOverlay.style.pointerEvents = "none";

    lassoPath = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    lassoPath.setAttribute("class", "lasso-path");
    lassoPath.setAttribute("points", "");

    rectShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectShape.setAttribute("class", "lasso-path");
    rectShape.style.display = "none";

    lassoOverlay.appendChild(lassoPath);
    lassoOverlay.appendChild(rectShape);
    centralViewport.appendChild(lassoOverlay);
    lassoOverlay.style.display = "none";
}

initLassoOverlay();

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
        { name: "Right View", action: () => setCameraView(0, Math.PI / 2) },
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
let currentColorMode = "classification"; // default: Classification View

// References kept for dynamic updates after load
let _colorMenuBtn = null;
let _colorMenuDropdown = null;

function initColorMenu() {
    if (!colorMenu) return;

    _colorMenuBtn = document.createElement('button');
    _colorMenuBtn.classList.add('dropdown-btn');
    _colorMenuBtn.textContent = "Classification View";
    colorMenu.appendChild(_colorMenuBtn);

    _colorMenuDropdown = document.createElement('div');
    _colorMenuDropdown.classList.add('dropdown-content');
    colorMenu.appendChild(_colorMenuDropdown);

    const modes = [
        { name: "Color View", value: "color" },
        { name: "Classification View", value: "classification" }
    ];

    modes.forEach(m => {
        const opt = document.createElement('button');
        opt.classList.add('dropdown-option');
        opt.textContent = m.name;
        opt.onclick = () => {
            switchColorMode(m.value);
            _colorMenuBtn.textContent = m.name;
            _colorMenuDropdown.classList.remove('show');
        };
        _colorMenuDropdown.appendChild(opt);
    });

    _colorMenuBtn.onclick = (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        _colorMenuDropdown.classList.toggle('show');
    };
}

/**
 * Called after the point cloud loads to inject attribute entries into the color menu.
 * @param {string[]} attributeNames - list of visualizable attribute names.
 */
function addAttributesToColorMenu(attributeNames) {
    if (!_colorMenuDropdown || attributeNames.length === 0) return;

    // Avoid duplicates if called more than once
    if (_colorMenuDropdown.querySelector('.dropdown-separator')) return;

    const sep = document.createElement('div');
    sep.classList.add('dropdown-separator');
    _colorMenuDropdown.appendChild(sep);

    // Scrollable container for attribute entries
    const scrollBox = document.createElement('div');
    scrollBox.classList.add('dropdown-attr-scroll');
    _colorMenuDropdown.appendChild(scrollBox);

    attributeNames.forEach(attrName => {
        const opt = document.createElement('button');
        opt.classList.add('dropdown-option');
        opt.textContent = `📊 ${attrName}`;
        opt.onclick = () => {
            switchColorMode(`attr:${attrName}`);
            _colorMenuBtn.textContent = attrName;
            _colorMenuDropdown.classList.remove('show');
        };
        scrollBox.appendChild(opt);
    });
}

// Listen for the event fired by loadPotree2PointCloud (after loader is ready)
window.addEventListener('potree2-loaded', (e) => {
    const attrs = e.detail.loader.getAttributeList();
    console.log('📋 Visualizable attributes:', attrs);
    addAttributesToColorMenu(attrs);
});

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
}

document.addEventListener('click', closeAllDropdowns);

function switchColorMode(mode) {
    currentColorMode = mode;

    // Logica condivisa per ogni mesh:
    // - "color":          originalColors per tutti i punti
    // - "classification": originalColors per i punti non classificati,
    //                     colore classe per i punti classificati
    function applyModeToMesh(mesh) {
        const colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
        if (!colors) return;

        const originalColors = mesh.metadata?.originalColors;
        const classIds = mesh.metadata?.classIds;
        const classColors = mesh.metadata?.classColors;
        const numPoints = colors.length / 4;

        for (let i = 0; i < numPoints; i++) {
            const hasClass = classIds && classIds[i] > 0 && classColors;

            if (mode === "classification" && hasClass) {
                // Punto classificato → colore della classe
                colors[i * 4] = classColors[i * 4];
                colors[i * 4 + 1] = classColors[i * 4 + 1];
                colors[i * 4 + 2] = classColors[i * 4 + 2];
                colors[i * 4 + 3] = 1.0;
            } else {
                // Color View (qualsiasi punto) oppure Classification View + punto non classificato
                // → sempre il colore originale della nuvola
                if (originalColors) {
                    colors[i * 4] = originalColors[i * 4];
                    colors[i * 4 + 1] = originalColors[i * 4 + 1];
                    colors[i * 4 + 2] = originalColors[i * 4 + 2];
                    colors[i * 4 + 3] = originalColors[i * 4 + 3];
                }
            }
        }
        mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
    }

    // Potree2: il loader gestisce internamente l'aggiornamento dei vertex colors
    // per tutti i nodi (visibili e futuri) tramite _applyColorModeToMesh
    const p2loader = scene.potree2Loader;
    if (p2loader) {
        p2loader.setColorMode(mode);
        return;
    }

    // Fallback: TransformNode con getChildMeshes (sistemi non-Potree2)
    const root = sceneObjects.currentPointCloud;
    if (!root) return;

    if (root.getChildMeshes) {
        root.getChildMeshes().forEach(applyModeToMesh);
    }
    // Legacy PCS system
    else if (root._pcs) {
        const pcsSystem = root._pcs;
        pcsSystem.updateParticle = (particle) => {
            if (mode === "color") {
                if (particle.originalColor) particle.color.copyFrom(particle.originalColor);
            } else {
                if (particle.classColor) {
                    particle.color.set(particle.classColor[0], particle.classColor[1], particle.classColor[2], 1.0);
                } else {
                    particle.color.set(0.45, 0.45, 0.45, 1.0);
                }
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
    const tool2Img = `<img src="${iconBase}rec_select.png" alt="Rectangle Select">`;
    const tool3Img = `<img src="${iconBase}lasso-select.png" alt="Lasso Select">`;
    const tool4Img = `<img src="${iconBase}scissor.png" alt="Scissor">`;
    const tool5Img = `<img src="${iconBase}frame-to-pcd.png" alt="Frame to PCD">`;

    createToolButton("tool-1", tool1Img, "Default mode", rightToolbar, () => {
        clearSelection(scene);
    });
    createToolButton("tool-2", tool2Img, "Rectangle selection", rightToolbar);
    createToolButton("tool-3", tool3Img, "Lasso selection", rightToolbar);
    createToolButton("tool-4", tool4Img, "Cut mode", rightToolbar);
    createToolButton("tool-5", tool5Img, "Frame to PCD", rightToolbar);

    // Initial active button
    document.getElementById("tool-1").classList.add("active");

    // Tool switching logic
    [1, 2, 3, 4].forEach(i => {
        const btn = document.getElementById(`tool-${i}`);
        btn.addEventListener('click', () => {
            // Remove active from all stateful tools
            document.querySelectorAll('.tool-btn').forEach(b => {
                if (b.id !== "tool-5") b.classList.remove('active');
            });
            // Add to current
            btn.classList.add('active');
            activeTool = `tool-${i}`;

            // Disable camera control only for drawing tools (2 = rect, 3 = lasso)
            if (activeTool === "tool-2" || activeTool === "tool-3") {
                camera.detachControl(canvas);
            } else {
                camera.attachControl(canvas, true);
            }

            // Manage command guide visibility and content
            const guide = document.getElementById('command-guide');
            const navGroup = document.getElementById('guide-nav');
            const selectionGroup = document.getElementById('guide-selection');

            if (guide && navGroup && selectionGroup) {
                if (activeTool === "tool-1") {
                    guide.classList.add('visible');
                    navGroup.style.display = "block";
                    selectionGroup.style.display = "none";
                } else if (activeTool === "tool-2" || activeTool === "tool-3") {
                    guide.classList.add('visible');
                    navGroup.style.display = "none";
                    selectionGroup.style.display = "block";
                } else {
                    // tool-4 (Cut), tool-5 (Frame)
                    guide.classList.remove('visible');
                }
            }

            console.log("Active tool changed to:", activeTool);
        });
    });

    console.log("Toolbar buttons created.");

    // Initialize guide for tool-1
    const guide = document.getElementById('command-guide');
    if (guide) guide.classList.add('visible');
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

// Single persistent outline item for the main point cloud (segment 0)
const outlineItem = createOutlineItem("Point Cloud", `${iconBase}modeling.png`, outlineContent, 0, null);

/**
 * Called after a point cloud is successfully loaded.
 * Binds the outline item to segment 0 (main cloud) of the Potree2 loader.
 * @param {BABYLON.TransformNode} pc  - The loaded point cloud root node (unused now but kept for API compat).
 * @param {string} [label]            - Display name.
 */
export function registerPointCloudInOutline(pc, label = "Point Cloud") {
    outlineItem.nameInput.value = label;
    outlineItem.setVisibilityCallback((visible) => {
        const loader = window.__babylonScene?.potree2Loader;
        if (loader) loader.setSegmentVisible(0, visible);
    });
}

// Expose via window so functions.js can call it without a circular import
window.__registerPointCloudInOutline = registerPointCloudInOutline;

// --- Sidebar Right: State & Objects ---
export const sceneObjects = {
    grid: null,
    currentPointCloud: null
};

// --- Sidebar Right: Accordion Sections ---

// 1. Features Computation
const featuresSection = createAccordionSection("FEATURES COMPUTATION", "sidebar-right-content");
const featuresContent = featuresSection.content;

const featuresInfo = document.createElement('div');
featuresInfo.style.fontSize = "0.75rem";
featuresInfo.style.color = "var(--text-muted)";
featuresInfo.style.lineHeight = "1.4";
featuresInfo.textContent = "Recalculate one or more geometric or spectral features for the points in the cloud to improve model accuracy.";
featuresContent.appendChild(featuresInfo);

const recalculateButton = createButton("Recalculate Features", "recalculateFeatures", featuresContent);
recalculateButton.onclick = () => {
    const scene = window.__babylonScene;
    showRecalculateFeaturesModal(scene, async ({ features, radii }) => {
        console.log("🔄 Recalculate Features:", features, "radii:", radii);
        try {
            const lasPath = `viewer/static/viewer/data/features.las`;
            const featResponse = await fetch('/feature_extraction/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content') },
                body: JSON.stringify({
                    input_filepath: lasPath,
                    output_filepath: lasPath,
                    feature_list: features,
                    radius_list: radii,
                    sampling: 0
                })
            });
            if (!featResponse.ok) {
                const errData = await featResponse.json().catch(() => ({}));
                throw new Error(errData.message || errData.error || "Feature recalculation failed");
            }
            console.log("✅ Features recalculated successfully");
        } catch (err) {
            console.error("❌ Feature recalculation error:", err);
            alert(`Feature recalculation failed: ${err.message}`);
        }
    });
};

// 3. Training
const trainingSection = createAccordionSection("TRAINING", "sidebar-right-content");
const trainingContent = trainingSection.content;

const trainingInfo = document.createElement('div');
trainingInfo.style.fontSize = "0.75rem";
trainingInfo.style.color = "var(--text-muted)";
trainingInfo.style.lineHeight = "1.4";
trainingInfo.innerHTML = `Start the classification on the selected regions using a <strong>Random Forest</strong> algorithm.`;
trainingContent.appendChild(trainingInfo);

const startTrainingButton = createButton("Start Training", "startTraining", trainingContent);

// 4. Viewport Settings
const viewportSection = createAccordionSection("Viewport Settings", "sidebar-right-content");
const viewportContent = viewportSection.content;

const gridToggle = createCheckbox("Show Grid", true, viewportContent);
const lightModeToggle = createCheckbox("Light Background", false, viewportContent);
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
// Expose scene globally so functions.js can access it without circular imports
window.__babylonScene = scene;
window.__sceneObjects = sceneObjects;
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

// Update ortho camera on zoom and adaptive panning
scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
        updateOrthoCamera();
    }
});

// Implementation of adaptive panning: Panning speed proportional to distance (radius)
scene.onBeforeRenderObservable.add(() => {
    // panningSensibility is inverse: higher value = slower panning
    // We want visually consistent panning, so sensibility should be inversely proportional to radius
    // Base value (e.g., 2000) divided by radius ensures speed increases with distance
    const baseSensibility = 2000;
    camera.panningSensibility = baseSensibility / camera.radius;

    // Safety limits to prevent extreme values
    if (camera.panningSensibility < 50) camera.panningSensibility = 50;
    if (camera.panningSensibility > 10000) camera.panningSensibility = 10000;
});

// --- Tools Logic (Lasso & Rect) using Babylon Observation ---
// isCtrlDeselect: true quando il disegno è iniziato con CTRL premuto → modalità deselezione
let isCtrlDeselect = false;

scene.onPointerObservable.add((pointerInfo) => {
    if (activeTool !== "tool-2" && activeTool !== "tool-3") return;

    switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
            if (pointerInfo.event.button === 0) { // Left click
                isCtrlDeselect = pointerInfo.event.ctrlKey;
                // Stile tratteggiato per la deselezione, pieno per la selezione
                const selStroke = isCtrlDeselect ? "5,3" : "none";
                lassoPath.setAttribute("stroke-dasharray", selStroke);
                rectShape.setAttribute("stroke-dasharray", selStroke);

                if (activeTool === "tool-2") {
                    isDrawingRect = true;
                    rectStartPoint = { x: scene.pointerX, y: scene.pointerY };
                    lassoOverlay.style.display = "block";
                    rectShape.style.display = "block";
                    lassoPath.style.display = "none";
                    updateRectShape();
                } else {
                    isDrawingLasso = true;
                    lassoPoints = [[scene.pointerX, scene.pointerY]];
                    lassoOverlay.style.display = "block";
                    lassoPath.style.display = "block";
                    rectShape.style.display = "none";
                    updateLassoPath();
                }
            }
            break;

        case BABYLON.PointerEventTypes.POINTERMOVE:
            if (isDrawingRect) {
                updateRectShape();
            } else if (isDrawingLasso) {
                lassoPoints.push([scene.pointerX, scene.pointerY]);
                updateLassoPath();
            }
            break;

        case BABYLON.PointerEventTypes.POINTERUP:
            if (isDrawingRect) {
                isDrawingRect = false;

                const rect = {
                    x: Math.min(rectStartPoint.x, scene.pointerX),
                    y: Math.min(rectStartPoint.y, scene.pointerY),
                    width: Math.abs(rectStartPoint.x - scene.pointerX),
                    height: Math.abs(rectStartPoint.y - scene.pointerY)
                };

                if (isCtrlDeselect) {
                    deselectPoints(scene, "rect", rect);
                } else {
                    selectPoints(scene, sceneObjects.currentPointCloud, "rect", rect);
                }

                setTimeout(() => {
                    if (!isDrawingRect) {
                        lassoOverlay.style.display = "none";
                        rectShape.style.display = "none";
                    }
                }, 1000);
            } else if (isDrawingLasso) {
                isDrawingLasso = false;

                if (isCtrlDeselect) {
                    deselectPoints(scene, "lasso", lassoPoints);
                } else {
                    selectPoints(scene, sceneObjects.currentPointCloud, "lasso", lassoPoints);
                }

                setTimeout(() => {
                    if (!isDrawingLasso) {
                        lassoOverlay.style.display = "none";
                        lassoPath.style.display = "none";
                        lassoPath.setAttribute("points", "");
                        lassoPoints = [];
                    }
                }, 1000);
            }
            break;
    }
});

function updateRectShape() {
    if (!rectStartPoint) return;
    const currentX = scene.pointerX;
    const currentY = scene.pointerY;

    const x = Math.min(rectStartPoint.x, currentX);
    const y = Math.min(rectStartPoint.y, currentY);
    const width = Math.abs(rectStartPoint.x - currentX);
    const height = Math.abs(rectStartPoint.y - currentY);

    rectShape.setAttribute("x", x);
    rectShape.setAttribute("y", y);
    rectShape.setAttribute("width", width);
    rectShape.setAttribute("height", height);
}

function updateLassoPath() {
    if (lassoPoints.length < 2) return;
    const pointsStr = lassoPoints.map(p => `${p[0]},${p[1]}`).join(" ");
    lassoPath.setAttribute("points", pointsStr);
}

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

// Toggle Light Mode
lightModeToggle.addEventListener('change', (e) => {
    const isLight = e.target.checked;
    const style = getComputedStyle(document.documentElement);

    if (isLight) {
        const lightBg = style.getPropertyValue('--bg-light').trim() || "#f5f5f7";
        const lightGrid = style.getPropertyValue('--grid-lines-light').trim() || "#d1d1d6";

        scene.clearColor = BABYLON.Color4.FromHexString(lightBg + "FF");
        if (gridMaterial) {
            gridMaterial.mainColor = BABYLON.Color4.FromHexString(lightBg + "FF");
            gridMaterial.lineColor = BABYLON.Color4.FromHexString(lightGrid + "FF");
        }
    } else {
        const darkBg = style.getPropertyValue('--bg-dark').trim() || "#121214";
        const darkGrid = style.getPropertyValue('--grid-lines').trim() || "#8d8d99";

        scene.clearColor = BABYLON.Color4.FromHexString(darkBg + "FF");
        if (gridMaterial) {
            gridMaterial.mainColor = BABYLON.Color4.FromHexString(darkBg + "FF");
            gridMaterial.lineColor = BABYLON.Color4.FromHexString(darkGrid + "FF");
        }
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

// --- File Menu Navbar Logic ---
const navFileBtn = document.getElementById("nav-file-btn");
const fileDropdown = document.getElementById("file-dropdown");
if (navFileBtn && fileDropdown) {
    navFileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof closeAllDropdowns === 'function') closeAllDropdowns();
        fileDropdown.classList.toggle('show');
    });

    document.getElementById("menu-load-data").addEventListener("click", () => {
        fileDropdown.classList.remove('show');
        showLoadModal();
    });

    document.getElementById("menu-download-data").addEventListener("click", () => {
        fileDropdown.classList.remove('show');
        showDownloadModal();
    });
}

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

// --- Keyboard Shortcuts ---
// Active only when a selection tool (rect or lasso) is active:
// I → Invert Selection
// Escape → Deselect All
//
// capture: true ensures we intercept before BabylonJS can consume the event.
function handleSelectionKeydown(e) {
    // Ignore shortcuts when typing inside inputs/textareas
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Only active when a selection tool is active
    if (activeTool !== "tool-2" && activeTool !== "tool-3") return;

    if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        invertSelection(scene);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        clearSelection(scene);
        console.log("🧹 Deselect All (Escape)");
    }
}

window.addEventListener('keydown', handleSelectionKeydown, { capture: true });

// --- Initialize UI Menus ---
initViewMenu();
initColorMenu();
initToolbar();

// --- Tool Actions ---

// tool-4: Frame to PCD (era tool-4, ma nel toolbar è già mappato come tool-4 con scissor)
// NOTA: tool-4 è "Cut mode" (scissor), tool-5 è "Frame to PCD"
// Qui gestiamo entrambi:

// tool-5: Frame to PCD (Instant Action)
const frameToPCDButton = document.getElementById("tool-5");
if (frameToPCDButton) {
    frameToPCDButton.addEventListener("click", () => {
        if (sceneObjects.currentPointCloud) {
            // Visual feedback: brief flash or highlight is handled by CSS if needed, 
            // but we don't set it as "activeTool".
            frameCameraOnMesh(camera, sceneObjects.currentPointCloud);

            // Ensure we don't stay "stuck" on this button visually
            frameToPCDButton.classList.remove('active');
            // Re-activate the previous tool visually
            const prevBtn = document.getElementById(activeTool);
            if (prevBtn) prevBtn.classList.add('active');

        } else {
            console.warn("No point cloud loaded to frame.");
        }
    });
}

// --- Outline: cut segment counter ---
let cutSegmentCounter = 1;

// tool-4: Cut Mode — promuove la selezione corrente in un nuovo segmento
const cutModeButton = document.getElementById("tool-4");
if (cutModeButton) {
    cutModeButton.addEventListener("click", () => {
        const loader = scene.potree2Loader;
        if (!loader) {
            console.warn("No point cloud loaded.");
            return;
        }
        if (!loader.selectionHistory || loader.selectionHistory.length === 0) {
            console.warn("No active selection. Use rectangle or lasso selection first.");
            return;
        }

        const result = loader.cutSelection();
        if (!result) {
            console.warn("Cut returned no points.");
            return;
        }

        // Crea un nuovo elemento nell'Outline per questo segmento
        const label = `Segment ${cutSegmentCounter++}`;
        const segId = result.segmentId;

        const item = createOutlineItem(label, `${iconBase}modeling.png`, outlineContent, segId,
            (visible) => {
                const ldr = scene.potree2Loader;
                if (ldr) ldr.setSegmentVisible(segId, visible);
            },
            false // <--- start hidden
        );

        console.log(`✂️ Cut segment "${label}" (id:${segId}) created with ${result.count.toLocaleString()} points.`);

        // Torna al tool-1 (default) dopo il taglio
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.getElementById("tool-1").classList.add("active");
        activeTool = "tool-1";
        const guide = document.getElementById('command-guide');
        if (guide) guide.classList.remove('visible');
        camera.attachControl(canvas, true);
    });
}

// --- Training Logic ---
if (startTrainingButton) {
    startTrainingButton.addEventListener("click", () => {
        const loader = scene.potree2Loader;
        if (!loader) {
            console.warn("No point cloud loaded.");
            return;
        }

        // Open the modal and pass the execution callback
        showTrainingModal(scene, async (params) => {
            console.log("🚀 Starting Training with params:", params);

            startTrainingButton.disabled = true;

            // ── Step feedback helper ──────────────────────────────────────
            const setStatus = (text) => { startTrainingButton.textContent = text; };
            // ─────────────────────────────────────────────────────────────

            try {
                // ── STEP 1: Extract points from the loaded point cloud ────
                setStatus("Extracting Points...");
                console.log("📦 Step 1: Extracting training points from scene...");

                const segmentMap = {};
                document.querySelectorAll('.outline-item[data-segment-id]').forEach(item => {
                    const segId = parseInt(item.dataset.segmentId, 10);
                    const nameInput = item.querySelector('.outline-name-input');
                    if (!isNaN(segId) && nameInput) segmentMap[segId] = nameInput.value;
                });

                const classMap = {};
                classRegistry.forEach((val, id) => { classMap[id] = val.name; });

                const exportResult = await loader.exportAllTrainingData(segmentMap);

                if (!exportResult || !exportResult.buffer) {
                    console.warn("No assigned points found to train on.");
                    alert("No points were identified in the selected regions.");
                    return;
                }
                console.log(`✅ Extracted ${(exportResult.buffer.byteLength / 1024 / 1024).toFixed(2)} MB of point data`);

                // ── STEP 2: Upload binary buffer + metadata ───────────────
                setStatus("Saving Training Data...");
                console.log("📤 Step 2: Uploading binary buffer and metadata...");

                const metadata = {
                    segments: exportResult.segmentMap,
                    classes: classMap,
                    split: params.split,
                    rf_params: params.rf_params,
                    features: params.features
                };

                const formData = new FormData();
                formData.append('labels', JSON.stringify(metadata));
                formData.append('buffer', new Blob([exportResult.buffer], { type: 'application/octet-stream' }));

                const saveResponse = await fetch('/api/start-training/', {
                    method: 'POST',
                    body: formData
                });

                if (!saveResponse.ok) {
                    const errData = await saveResponse.json().catch(() => ({}));
                    throw new Error(errData.error || "Failed to save training data");
                }

                const saveData = await saveResponse.json();
                console.log("✅ Binary + metadata saved:", saveData.filename, saveData.labels_filename);

                // ── STEP 3: Split LAS by binary labels ───────────────────
                setStatus("Splitting LAS by Labels...");
                console.log("✂️ Step 3: Splitting LAS file by binary segment labels...");

                // The LAS source is always the processed features file
                const lasSourcePath = "viewer/static/viewer/data/features.las";
                // Output dir: same /static/viewer/data/ folder where bin/json were saved
                const outputDir = "viewer/static/viewer/data";

                const splitResponse = await fetch('/split_las_by_binary/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({
                        las_path: lasSourcePath,
                        bin_path: saveData.bin_path,
                        meta_path: saveData.json_path,
                        output_dir: outputDir
                    })
                });

                if (!splitResponse.ok) {
                    const errData = await splitResponse.json().catch(() => ({}));
                    throw new Error(errData.message || errData.error || "Failed to split LAS file");
                }

                const splitData = await splitResponse.json();
                console.log("✅ LAS split completed:", splitData);

                // ── Done ─────────────────────────────────────────────────
                alert(`Training data ready!\n\nBinary:  ${saveData.filename}\nMetadata: ${saveData.labels_filename}\nLAS segments saved in: ${outputDir}`);

            } catch (error) {
                console.error("❌ Training pipeline error:", error);
                alert(`Error: ${error.message}`);
            } finally {
                setStatus("Start Training");
                startTrainingButton.disabled = false;
            }
        });
    });
}