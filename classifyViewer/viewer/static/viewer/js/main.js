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
 * Called after loadFeatureBin() completes. Adds/refreshes the Features section
 * in the color menu. Safe to call multiple times (e.g. after recalculate).
 * @param {string[]} featureNames
 */
function addFeaturesToColorMenu(featureNames) {
    if (!_colorMenuDropdown || featureNames.length === 0) return;

    // Remove previous feature section if present (supports refresh)
    const existing = _colorMenuDropdown.querySelector('.dropdown-feature-section');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.classList.add('dropdown-feature-section');

    const sep = document.createElement('div');
    sep.classList.add('dropdown-separator');
    section.appendChild(sep);

    const scrollBox = document.createElement('div');
    scrollBox.classList.add('dropdown-attr-scroll');
    section.appendChild(scrollBox);

    featureNames.forEach(featName => {
        const opt = document.createElement('button');
        opt.classList.add('dropdown-option');
        opt.textContent = `🔬 ${featName}`;
        opt.onclick = () => {
            switchColorMode(`feature:${featName}`);
            _colorMenuBtn.textContent = featName;
            _colorMenuDropdown.classList.remove('show');
        };
        scrollBox.appendChild(opt);
    });

    _colorMenuDropdown.appendChild(section);
}

window.addEventListener('feature-bin-loaded', (e) => {
    addFeaturesToColorMenu(e.detail.names);
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

// --- Layout mode tool-button references (set inside initToolbar) ---
let toolBtnRect = null;
let toolBtnLasso = null;
let toolBtnCut = null;
let toolBtnMeasure = null;
let toolBtnArea = null;

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
    toolBtnRect = createToolButton("tool-2", tool2Img, "Rectangle selection", rightToolbar);
    toolBtnLasso = createToolButton("tool-3", tool3Img, "Lasso selection", rightToolbar);
    toolBtnCut = createToolButton("tool-4", tool4Img, "Cut mode", rightToolbar);
    createToolButton("tool-5", tool5Img, "Frame to PCD", rightToolbar);
    const tool6Img = `<img src="${iconBase}measure.png" alt="Measure">`;
    toolBtnMeasure = createToolButton("tool-6", tool6Img, "Measure distance", rightToolbar);
    const tool7Img = `<img src="${iconBase}measure-area.png" alt="Measure Area">`;
    toolBtnArea = createToolButton("tool-7", tool7Img, "Measure area", rightToolbar);

    // Initial active button
    document.getElementById("tool-1").classList.add("active");

    // Tool switching logic
    [1, 2, 3, 4, 6, 7].forEach(i => {
        const btn = document.getElementById(`tool-${i}`);
        btn.addEventListener('click', () => {
            // Remove active from all stateful tools
            document.querySelectorAll('.tool-btn').forEach(b => {
                if (b.id !== "tool-5") b.classList.remove('active');
            });
            // Add to current
            btn.classList.add('active');
            activeTool = `tool-${i}`;

            // Disable camera control for drawing tools (rect, lasso) and measure
            if (activeTool === "tool-2" || activeTool === "tool-3" || activeTool === "tool-6" || activeTool === "tool-7") {
                camera.detachControl(canvas);
            } else {
                camera.attachControl(canvas, true);
            }
            // Hide measure guides when switching away
            const measureGroup = document.getElementById('guide-measure');
            if (measureGroup && activeTool !== "tool-6") measureGroup.style.display = "none";
            const areaGroup = document.getElementById('guide-area');
            if (areaGroup && activeTool !== "tool-7") areaGroup.style.display = "none";
            // Reset measure/area state when switching away
            if (activeTool !== "tool-6") clearMeasure();
            if (activeTool !== "tool-7") clearArea();

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
                } else if (activeTool === "tool-6") {
                    guide.classList.add('visible');
                    navGroup.style.display = "none";
                    selectionGroup.style.display = "none";
                    const measureGroup = document.getElementById('guide-measure');
                    if (measureGroup) measureGroup.style.display = "block";
                    const areaGroupHide = document.getElementById('guide-area');
                    if (areaGroupHide) areaGroupHide.style.display = "none";
                } else if (activeTool === "tool-7") {
                    guide.classList.add('visible');
                    navGroup.style.display = "none";
                    selectionGroup.style.display = "none";
                    const measureGroupHide = document.getElementById('guide-measure');
                    if (measureGroupHide) measureGroupHide.style.display = "none";
                    const areaGroup = document.getElementById('guide-area');
                    if (areaGroup) areaGroup.style.display = "block";
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

            // Regenerate feature bin and refresh color menu
            const featureBinRes = await fetch('/las_to_feature_bin/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content') },
                body: JSON.stringify({
                    las_path: `viewer/static/viewer/data/features.las`,
                    bin_path: `viewer/static/viewer/data/features.bin`
                })
            });
            if (!featureBinRes.ok) {
                const errData = await featureBinRes.json().catch(() => ({}));
                throw new Error(errData.message || errData.error || "Feature bin generation failed");
            }
            const recalcLoader = window.__babylonScene?.potree2Loader;
            if (recalcLoader) {
                const featureNames = await recalcLoader.loadFeatureBin(`/static/viewer/data/features.bin`);
                window.dispatchEvent(new CustomEvent('feature-bin-loaded', { detail: { names: featureNames } }));
            }
            console.log("✅ Feature bin regenerated");
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

// 4. Classify (hidden by default — shown only in Classify mode)
const classifySection = createAccordionSection("CLASSIFY", "sidebar-right-content");
const classifyContent = classifySection.content;
const classifySectionEl = classifySection.content.closest('.accordion-section');
classifySectionEl.style.display = 'none';

const classifyInfo = document.createElement('div');
classifyInfo.style.fontSize = "0.75rem";
classifyInfo.style.color = "var(--text-muted)";
classifyInfo.style.lineHeight = "1.4";
classifyInfo.textContent = "Run the trained Random Forest model on the full point cloud to assign a class label to every point.";
classifyContent.appendChild(classifyInfo);

const startClassifyButton = createButton("Start Classify", "startClassify", classifyContent);

// 5. Viewport Settings
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

// ---------------------------------------------------------------------------
// MEASURE TOOL (tool-6) — click two points, show distance
// ---------------------------------------------------------------------------
let measurePoint1 = null;   // BABYLON.Vector3 | null
let measurePoint2 = null;   // BABYLON.Vector3 | null
let measureSphere1 = null;   // marker mesh
let measureSphere2 = null;   // marker mesh
let measureLine = null;   // LineSystem mesh
let measureLabel = null;   // HTML div
let measureMidpoint = null;   // BABYLON.Vector3 midpoint

// Initialise the HTML label overlay (created once)
function initMeasureLabel() {
    if (document.getElementById('measure-label')) return;
    measureLabel = document.createElement('div');
    measureLabel.id = 'measure-label';
    measureLabel.classList.add('measure-label');
    measureLabel.style.display = 'none';
    centralViewport.appendChild(measureLabel);
}
initMeasureLabel();

// Dispose 3-D objects and reset state
function disposeMeasureMarker(marker) {
    if (!marker) return;
    if (marker._scaleObserver) {
        scene.onBeforeRenderObservable.remove(marker._scaleObserver);
        marker._scaleObserver = null;
    }
    // Dispose all children (discs) then the root node
    marker.getChildMeshes().forEach(m => m.dispose());
    marker.dispose();
}

function clearMeasure() {
    disposeMeasureMarker(measureSphere1); measureSphere1 = null;
    disposeMeasureMarker(measureSphere2); measureSphere2 = null;
    if (measureLine) { measureLine.dispose(); measureLine = null; }
    measurePoint1 = null;
    measurePoint2 = null;
    measureMidpoint = null;
    if (measureLabel) measureLabel.style.display = 'none';
}

// Create a small sphere marker at a world position
// Returns a { root, update } object.
// root is a TransformNode parenting two billboard discs:
//   - outer ring  (halo, semi-transparent)
//   - inner solid dot
// update() rescales root so the marker stays a constant apparent size.
function createMeasureMarker(position, name) {
    const root = new BABYLON.TransformNode(name + 'Root', scene);
    root.position.copyFrom(position);

    // --- Outer halo disc ---
    const halo = BABYLON.MeshBuilder.CreateDisc(name + 'Halo', { radius: 1, tessellation: 32 }, scene);
    halo.parent = root;
    halo.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    halo.isPickable = false;
    halo.renderingGroupId = 2;
    const haloMat = new BABYLON.StandardMaterial(name + 'HaloMat', scene);
    haloMat.emissiveColor = BABYLON.Color3.FromHexString('#3b82f6');
    haloMat.alpha = 0.25;
    haloMat.backFaceCulling = false;
    haloMat.disableLighting = true;
    halo.material = haloMat;

    // --- Border ring (slightly larger than dot, accent-blue) ---
    const ring = BABYLON.MeshBuilder.CreateDisc(name + 'Ring', { radius: 0.58, tessellation: 32 }, scene);
    ring.parent = root;
    ring.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    ring.isPickable = false;
    ring.renderingGroupId = 2;
    const ringMat = new BABYLON.StandardMaterial(name + 'RingMat', scene);
    ringMat.emissiveColor = BABYLON.Color3.FromHexString('#3b82f6');
    ringMat.disableLighting = true;
    ringMat.backFaceCulling = false;
    ring.material = ringMat;
    ring.position.z = -0.001;   // just behind the white dot

    // Scale so the marker is ~18 px regardless of camera distance
    function updateScale() {
        const dist = BABYLON.Vector3.Distance(camera.position, position);
        const s = dist * 0.01;   // tweak this constant to taste
        root.scaling.setAll(Math.max(s, 0.01));
    }
    updateScale();

    // Register per-frame rescaling
    const observer = scene.onBeforeRenderObservable.add(updateScale);
    root._scaleObserver = observer;   // stored so clearMeasure can remove it

    return root;
}

// Draw / update the line between the two markers
function updateMeasureLine() {
    if (measureLine) { measureLine.dispose(); measureLine = null; }
    if (!measurePoint1 || !measurePoint2) return;
    measureLine = BABYLON.MeshBuilder.CreateDashedLines(
        'measureLine',
        {
            points: [measurePoint1, measurePoint2],
            dashSize: 0.4,
            gapSize: 0.2,
            dashNb: 40,
            updatable: false
        },
        scene
    );
    const lineMat = new BABYLON.StandardMaterial('measureLineMat', scene);
    lineMat.emissiveColor = BABYLON.Color3.FromHexString('#3b82f6');
    lineMat.disableLighting = true;
    measureLine.material = lineMat;
    measureLine.isPickable = false;
    measureLine.renderingGroupId = 1;
}

// Project a world point to canvas-space and update the label position
function updateMeasureLabelPosition() {
    if (!measureLabel || !measureMidpoint) return;
    const projected = BABYLON.Vector3.Project(
        measureMidpoint,
        BABYLON.Matrix.Identity(),
        scene.getTransformMatrix(),
        camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
    );
    if (projected.z < 0 || projected.z > 1) {
        measureLabel.style.display = 'none';
        return;
    }
    measureLabel.style.display = 'block';
    measureLabel.style.left = projected.x + 'px';
    measureLabel.style.top = projected.y + 'px';
}

// Find the 3-D point in the loaded point cloud closest to a screen-space click
// ---------------------------------------------------------------------------
// PICKING CACHE
// Caches raw Float32Array of positions per mesh so getVerticesData() is only
// called once per loaded node instead of on every click.
// ---------------------------------------------------------------------------
const _pickPosCache = new Map();   // mesh -> Float32Array

function _getPickCache(mesh) {
    if (_pickPosCache.has(mesh)) return _pickPosCache.get(mesh);
    const pos = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if (pos) _pickPosCache.set(mesh, pos);
    return pos || null;
}

function _evictPickCache() {
    for (const mesh of _pickPosCache.keys()) {
        if (!mesh._scene || mesh.isDisposed()) _pickPosCache.delete(mesh);
    }
}

function pickClosestPointInCloud(screenX, screenY) {
    const loader = scene.potree2Loader;
    if (!loader || !loader.loadedNodes || loader.loadedNodes.size === 0) return null;

    _evictPickCache();

    const worldMatrix = loader.rootTransform
        ? loader.rootTransform.getWorldMatrix()
        : BABYLON.Matrix.Identity();
    const vp = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());

    const vpScale = BABYLON.Matrix.FromValues(
        vp.width / 2, 0, 0, 0,
        0, -vp.height / 2, 0, 0,
        0, 0, 1, 0,
        vp.x + vp.width / 2, vp.y + vp.height / 2, 0, 1
    );
    const m = worldMatrix.multiply(scene.getTransformMatrix()).multiply(vpScale).m;
    const wm = worldMatrix.m;

    // PHASE 1: cull nodes whose screen bounding sphere is far from the click
    const CULL_R2 = 200 * 200;  // 200 px radius
    const candidates = [];
    for (const mesh of loader.loadedNodes.values()) {
        if (!mesh.isVisible) continue;
        const bb = mesh.getBoundingInfo();
        if (!bb) { candidates.push({ mesh, minD2: 0 }); continue; }
        const c = bb.boundingSphere.centerWorld;
        const cw = c.x * m[3] + c.y * m[7] + c.z * m[11] + m[15];
        if (cw <= 0) continue;
        const cx = (c.x * m[0] + c.y * m[4] + c.z * m[8] + m[12]) / cw;
        const cy = (c.x * m[1] + c.y * m[5] + c.z * m[9] + m[13]) / cw;
        const screenR = (bb.boundingSphere.radiusWorld / cw) * (vp.width / 2);
        const ddx = cx - screenX, ddy = cy - screenY;
        const distCenter = Math.sqrt(ddx * ddx + ddy * ddy);
        const minD = Math.max(0, distCenter - screenR);
        if (minD * minD > CULL_R2) continue;
        candidates.push({ mesh, minD2: minD * minD });
    }

    // Sort closer nodes first so bestDist2 tightens quickly
    candidates.sort((a, b) => a.minD2 - b.minD2);

    // PHASE 2: iterate points only in candidate nodes
    let bestDist2 = Infinity;
    let bestX = 0, bestY = 0, bestZ = 0;
    let found = false;

    for (const { mesh, minD2 } of candidates) {
        if (minD2 >= bestDist2) continue;  // entire node is farther than current best
        const pos = _getPickCache(mesh);
        if (!pos) continue;
        const n = pos.length / 3;
        for (let i = 0; i < n; i++) {
            const lx = pos[i * 3], ly = pos[i * 3 + 1], lz = pos[i * 3 + 2];
            const w = lx * m[3] + ly * m[7] + lz * m[11] + m[15];
            if (w <= 0) continue;
            const sx = (lx * m[0] + ly * m[4] + lz * m[8] + m[12]) / w;
            const sy = (lx * m[1] + ly * m[5] + lz * m[9] + m[13]) / w;
            const dx = sx - screenX, dy = sy - screenY;
            const d2 = dx * dx + dy * dy;
            if (d2 < bestDist2) {
                bestDist2 = d2;
                const ww = lx * wm[3] + ly * wm[7] + lz * wm[11] + wm[15];
                bestX = (lx * wm[0] + ly * wm[4] + lz * wm[8] + wm[12]) / ww;
                bestY = (lx * wm[1] + ly * wm[5] + lz * wm[9] + wm[13]) / ww;
                bestZ = (lx * wm[2] + ly * wm[6] + lz * wm[10] + wm[14]) / ww;
                found = true;
            }
        }
    }
    return found ? new BABYLON.Vector3(bestX, bestY, bestZ) : null;
}

// Pointer observer for the measure tool
scene.onPointerObservable.add((pointerInfo) => {
    if (activeTool !== 'tool-6') return;
    if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOWN) return;
    if (pointerInfo.event.button !== 0) return;

    const sx = scene.pointerX;
    const sy = scene.pointerY;

    const hit = pickClosestPointInCloud(sx, sy);
    if (!hit) return;

    if (!measurePoint1) {
        // First click: place point A
        clearMeasure();
        measurePoint1 = hit.clone();
        measureSphere1 = createMeasureMarker(measurePoint1, 'measureSphere1');
    } else {
        // Second click: place point B, draw line, show label
        measurePoint2 = hit.clone();
        measureSphere2 = createMeasureMarker(measurePoint2, 'measureSphere2');
        measureMidpoint = BABYLON.Vector3.Lerp(measurePoint1, measurePoint2, 0.5);

        updateMeasureLine();

        const dist = BABYLON.Vector3.Distance(measurePoint1, measurePoint2);
        const label = dist >= 1
            ? dist.toFixed(3) + ' m'
            : (dist * 100).toFixed(1) + ' cm';

        if (measureLabel) {
            measureLabel.textContent = label;
            updateMeasureLabelPosition();
        }

        // Reset so the next click starts a fresh measurement
        measurePoint1 = null;
        measurePoint2 = null;
    }
});

// Update label screen position on every frame
scene.onBeforeRenderObservable.add(() => {
    if (measureMidpoint && measureLabel && measureLabel.style.display !== 'none') {
        updateMeasureLabelPosition();
    }
});


// ---------------------------------------------------------------------------
// AREA TOOL (tool-7) — click N points, double-click to close, shows area
// ---------------------------------------------------------------------------
let areaPoints = [];    // BABYLON.Vector3[]
let areaMarkers = [];    // TransformNode[] (one per vertex)
let areaEdgeLines = [];    // dashed line meshes for each edge
let areaFillMesh = null;  // unused, kept for reference
let areaSvgPolygon = null;  // SVG polygon element for the fill
let areaPreviewLine = null;  // line from last point to cursor
let areaLabel = null;  // HTML div
let areaLabelPos = null;  // BABYLON.Vector3 centroid

function initAreaLabel() {
    if (document.getElementById('area-label')) return;
    areaLabel = document.createElement('div');
    areaLabel.id = 'area-label';
    areaLabel.classList.add('measure-label', 'area-label');
    areaLabel.style.display = 'none';
    centralViewport.appendChild(areaLabel);
}
initAreaLabel();

function clearArea() {
    if (_areaSingleClickTimer) { clearTimeout(_areaSingleClickTimer); _areaSingleClickTimer = null; }
    areaMarkers.forEach(m => disposeMeasureMarker(m));
    areaMarkers = [];
    areaEdgeLines.forEach(l => l.dispose());
    areaEdgeLines = [];
    if (areaFillMesh) { areaFillMesh.dispose(); areaFillMesh = null; }
    if (areaSvgPolygon) { areaSvgPolygon.remove(); areaSvgPolygon = null; }
    if (areaPreviewLine) { areaPreviewLine.dispose(); areaPreviewLine = null; }
    areaPoints = [];
    areaLabelPos = null;
    if (areaLabel) areaLabel.style.display = 'none';
}

// Build a dashed edge line between two world points
function createAreaEdge(pA, pB, idx) {
    const line = BABYLON.MeshBuilder.CreateDashedLines(
        'areaEdge' + idx,
        { points: [pA, pB], dashSize: 0.4, gapSize: 0.2, dashNb: 40 },
        scene
    );
    const mat = new BABYLON.StandardMaterial('areaEdgeMat' + idx, scene);
    mat.emissiveColor = BABYLON.Color3.FromHexString('#22d3ee');  // cyan-400
    mat.disableLighting = true;
    line.material = mat;
    line.isPickable = false;
    line.renderingGroupId = 1;
    return line;
}

// Re-build the SVG fill polygon projected to screen space
function updateAreaFill() {
    if (areaSvgPolygon) { areaSvgPolygon.remove(); areaSvgPolygon = null; }
    if (areaPoints.length < 3 || !lassoOverlay) return;

    const transformMatrix = scene.getTransformMatrix();
    const vp = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());

    const ptStr = areaPoints.map(p => {
        const proj = BABYLON.Vector3.Project(p, BABYLON.Matrix.Identity(), transformMatrix, vp);
        return proj.x + ',' + proj.y;
    }).join(' ');

    areaSvgPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    areaSvgPolygon.setAttribute('points', ptStr);
    areaSvgPolygon.setAttribute('class', 'area-fill-polygon');
    lassoOverlay.appendChild(areaSvgPolygon);
    lassoOverlay.style.display = 'block';
}

// Shoelace formula on the 3-D polygon (works for planar polygons)
function computeArea3D(pts) {
    if (pts.length < 3) return 0;
    // Sum of cross products
    let cross = BABYLON.Vector3.Zero();
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        cross = cross.add(BABYLON.Vector3.Cross(a, b));
    }
    return cross.length() * 0.5;
}

// Centroid of the polygon vertices
function centroid3D(pts) {
    const c = BABYLON.Vector3.Zero();
    pts.forEach(p => c.addInPlace(p));
    return c.scale(1 / pts.length);
}

function updateAreaLabelPosition() {
    if (!areaLabel || !areaLabelPos) return;
    const projected = BABYLON.Vector3.Project(
        areaLabelPos,
        BABYLON.Matrix.Identity(),
        scene.getTransformMatrix(),
        camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
    );
    if (projected.z < 0 || projected.z > 1) { areaLabel.style.display = 'none'; return; }
    areaLabel.style.display = 'block';
    areaLabel.style.left = projected.x + 'px';
    areaLabel.style.top = projected.y + 'px';
}

// Close the polygon, compute and display area
function closeAreaPolygon() {
    if (areaPoints.length < 3) return;

    // Close the last edge back to the first point
    const closingEdge = createAreaEdge(areaPoints[areaPoints.length - 1], areaPoints[0], areaEdgeLines.length);
    areaEdgeLines.push(closingEdge);

    // Remove preview line
    if (areaPreviewLine) { areaPreviewLine.dispose(); areaPreviewLine = null; }

    updateAreaFill();

    const area = computeArea3D(areaPoints);
    areaLabelPos = centroid3D(areaPoints);

    const label = area >= 1
        ? area.toFixed(3) + ' mq'
        : (area * 10000).toFixed(1) + ' cmq';

    if (areaLabel) {
        areaLabel.textContent = label;
        updateAreaLabelPosition();
    }

    // Reset points so next click starts fresh
    areaPoints = [];
}

// Pointer observer for the area tool
// State to distinguish single-click from double-click
let _areaSingleClickTimer = null;

scene.onPointerObservable.add((pointerInfo) => {
    if (activeTool !== 'tool-7') return;

    const sx = scene.pointerX;
    const sy = scene.pointerY;

    // POINTERUP left button — handles both single and double click
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP &&
        pointerInfo.event.button === 0) {

        // Double-click detected (detail >= 2 on the native event)
        if (pointerInfo.event.detail >= 2) {
            if (_areaSingleClickTimer) { clearTimeout(_areaSingleClickTimer); _areaSingleClickTimer = null; }
            closeAreaPolygon();
            return;
        }

        // Single click — defer slightly to let double-click cancel it
        if (_areaSingleClickTimer) { clearTimeout(_areaSingleClickTimer); }
        const capX = sx, capY = sy;
        _areaSingleClickTimer = setTimeout(() => {
            _areaSingleClickTimer = null;

            const hit = pickClosestPointInCloud(capX, capY);
            if (!hit) return;

            // Clicking near first point (≥ 3 pts already) → close polygon
            if (areaPoints.length >= 3) {
                const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
                const proj0 = BABYLON.Vector3.Project(
                    areaPoints[0], BABYLON.Matrix.Identity(),
                    scene.getTransformMatrix(), viewport
                );
                const dx = proj0.x - capX, dy = proj0.y - capY;
                if (dx * dx + dy * dy < 400) {  // 20 px snap radius
                    closeAreaPolygon();
                    return;
                }
            }

            // Add edge from previous point
            if (areaPoints.length > 0) {
                const edge = createAreaEdge(areaPoints[areaPoints.length - 1], hit, areaEdgeLines.length);
                areaEdgeLines.push(edge);
            }

            // Place marker and record point
            const marker = createMeasureMarker(hit.clone(), 'areaMark' + areaPoints.length);
            areaMarkers.push(marker);
            areaPoints.push(hit.clone());

        }, 220);  // 220 ms window to detect double-click
    }

    // POINTERMOVE — preview line from last vertex to cursor (no expensive picking)
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE && areaPoints.length > 0) {
        // Cast a ray onto the approximate plane of already-placed points
        const ray = scene.createPickingRay(sx, sy, BABYLON.Matrix.Identity(), camera);
        // Use the mean Y of existing points as the target plane (good enough for most clouds)
        const planeY = areaPoints.reduce((s, p) => s + p.y, 0) / areaPoints.length;
        let cursorPt;
        if (Math.abs(ray.direction.y) > 1e-4) {
            const t = (planeY - ray.origin.y) / ray.direction.y;
            if (t > 0) {
                cursorPt = ray.origin.add(ray.direction.scale(t));
            }
        }
        if (!cursorPt) return;

        if (areaPreviewLine) { areaPreviewLine.dispose(); areaPreviewLine = null; }
        areaPreviewLine = BABYLON.MeshBuilder.CreateDashedLines(
            'areaPreview',
            { points: [areaPoints[areaPoints.length - 1], cursorPt], dashSize: 0.3, gapSize: 0.3, dashNb: 30 },
            scene
        );
        const pMat = new BABYLON.StandardMaterial('areaPreviewMat', scene);
        pMat.emissiveColor = BABYLON.Color3.FromHexString('#22d3ee');
        pMat.alpha = 0.5;
        pMat.disableLighting = true;
        areaPreviewLine.material = pMat;
        areaPreviewLine.isPickable = false;
        areaPreviewLine.renderingGroupId = 1;
    }
});

// Per-frame: reproject SVG fill and keep label pinned
scene.onBeforeRenderObservable.add(() => {
    if (areaLabelPos && areaLabel && areaLabel.style.display !== 'none') {
        updateAreaLabelPosition();
    }
    if (areaSvgPolygon && areaPoints.length >= 3) {
        const tm = scene.getTransformMatrix();
        const vp = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
        const ptStr = areaPoints.map(p => {
            const proj = BABYLON.Vector3.Project(p, BABYLON.Matrix.Identity(), tm, vp);
            return proj.x + ',' + proj.y;
        }).join(' ');
        areaSvgPolygon.setAttribute('points', ptStr);
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
// Esc cancels a measure in progress
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeTool === 'tool-6') {
        clearMeasure();
    } else if (e.key === 'Escape' && activeTool === 'tool-7') {
        clearArea();
    }
});

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

// Inject guide-measure group into the command-guide (hidden by default)
(function () {
    const guide = document.getElementById('command-guide');
    if (!guide) return;
    const g = document.createElement('div');
    g.id = 'guide-measure';
    g.style.display = 'none';
    g.innerHTML = `
        <div class="command-item">
            <div class="mouse-icon left"></div>
            <span style="font-size:0.75rem;color:var(--text-primary)">1st click — set point A</span>
        </div>
        <div class="command-item">
            <div class="mouse-icon left"></div>
            <span style="font-size:0.75rem;color:var(--text-primary)">2nd click — set point B &amp; measure</span>
        </div>
        <div class="command-item">
            <div class="command-key-container"><span class="command-key">Esc</span></div>
            <span style="font-size:0.75rem;color:var(--text-muted)">cancel</span>
        </div>`;
    guide.appendChild(g);
})();

// Inject guide-area group into the command-guide (hidden by default)
(function () {
    const guide = document.getElementById('command-guide');
    if (!guide) return;
    const g = document.createElement('div');
    g.id = 'guide-area';
    g.style.display = 'none';
    g.innerHTML = `
        <div class="command-item">
            <div class="mouse-icon left"></div>
            <span style="font-size:0.75rem;color:var(--text-primary)">Click — add vertex</span>
        </div>
        <div class="command-item">
            <div class="mouse-icon left"></div>
            <span style="font-size:0.75rem;color:var(--text-primary)">Double-click — close &amp; compute</span>
        </div>
        <div class="command-item">
            <div class="command-key-container"><span class="command-key">Esc</span></div>
            <span style="font-size:0.75rem;color:var(--text-muted)">cancel</span>
        </div>`;
    guide.appendChild(g);
})();

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
                // Output dir: /static/viewer/data/workdir/ folder where bin/json were saved
                const outputDir = "viewer/static/viewer/data/workdir/";

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

                // ── STEP 4: Launch RF Training ───────────────────────
                setStatus("⏳ Training RF Model...");
                console.log("🤖 Step 4: Launching Random Forest training...");

                const rfParams = params.rf_params;
                const trainingPayload = {
                    selected_features: params.features,
                    training_filepath: `${outputDir}training.las`,
                    val_filepath: `${outputDir}validation.las`,
                    n_jobs: rfParams.n_jobs ?? 12,
                    nr_estimators: rfParams.n_estimators ?? 200,
                    max_depth: rfParams.max_depth ?? 15,
                    min_samples_split: rfParams.min_samples_split ?? 20,
                    max_features: rfParams.max_features ?? 'sqrt',
                    use_gpu: rfParams.use_gpu ?? false,
                    output_training_name: `${outputDir}test_predicted.las`,
                    model_savepath: `${outputDir}rf_model.pkl`
                };

                const trainResponse = await fetch('/launch_RF_training/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify(trainingPayload)
                });

                if (!trainResponse.ok) {
                    const errData = await trainResponse.json().catch(() => ({}));
                    throw new Error(errData.message || errData.error || 'RF training failed');
                }

                console.log("✅ RF Training completed successfully.");

                // ── Done ─────────────────────────────────────────────────
                alert(`✅ Training complete!\n\nModel saved to: ${trainingPayload.model_savepath}`);

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

// ---------------------------------------------------------------------------
// LAYOUT MODE  (Training ↔ Classify)
// ---------------------------------------------------------------------------
let currentLayoutMode = 'training'; // 'training' | 'classify'

// DOM references for the three sidebar-right accordion sections
const featureSectionEl = featuresSection.content.closest('.accordion-section');
const trainingSectionEl = trainingSection.content.closest('.accordion-section');
const classesSectionEl = classesSection.content.closest('.accordion-section');
// classifySectionEl is already declared above at section-creation time

function setLayoutMode(mode) {
    if (currentLayoutMode === mode) return;
    currentLayoutMode = mode;

    const isClassify = (mode === 'classify');

    // --- Sidebar-right sections -----------------------------------------
    featureSectionEl.style.display = isClassify ? 'none' : '';
    trainingSectionEl.style.display = isClassify ? 'none' : '';
    classifySectionEl.style.display = isClassify ? '' : 'none';

    // --- Sidebar-left sections ------------------------------------------
    classesSectionEl.style.display = isClassify ? 'none' : '';

    // --- Toolbar buttons ------------------------------------------------
    // toolBtnRect / toolBtnLasso / toolBtnCut are the actual <button> elements
    // returned by createToolButton and stored at module level.
    if (toolBtnRect) toolBtnRect.style.display = isClassify ? 'none' : '';
    if (toolBtnLasso) toolBtnLasso.style.display = isClassify ? 'none' : '';
    if (toolBtnCut) toolBtnCut.style.display = isClassify ? 'none' : '';

    // If the active tool is one of the hidden ones, snap back to tool-1
    if (isClassify && (activeTool === 'tool-2' || activeTool === 'tool-3' || activeTool === 'tool-4')) {
        const defaultBtn = document.getElementById('tool-1');
        if (defaultBtn) defaultBtn.click();
    }

    console.log('🔄 Layout mode switched to:', mode);
}

// Bind nav-mode-btn clicks.
// Mode is derived from button text (case-insensitive): "training" or "classify".
// If data-mode is present it takes priority, otherwise falls back to textContent.
document.querySelectorAll('.nav-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        document.querySelectorAll('.nav-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode || btn.textContent.trim().toLowerCase();
        setLayoutMode(mode);
    });
});