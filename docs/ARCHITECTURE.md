# Architecture

This document describes the technical architecture of the 3D Classify Viewer, covering
the system components, data flow, and integration between the frontend, backend, C++
processing pipeline, and ML subsystem.

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend](#frontend)
3. [Django Backend](#django-backend)
4. [C++ Processing Pipeline](#c-processing-pipeline)
5. [Python ↔ C++ Integration](#python--c-integration)
6. [ML Pipeline](#ml-pipeline)
7. [Data Storage Layout](#data-storage-layout)

---

## System Overview

```
Browser (BabylonJS + Potree 2.0)
        │  REST API calls
        ▼
Django REST API (Python 3.10, Gunicorn)
        │  subprocess
        ├──────────────────────────────► C++ Binaries (/webapp/opt/)
        │  subprocess                         │
        └──────────────────────────────► ML Pipeline (RF)
                                              │
                         File System (runtime_data/) ◄──────────┘
                                 │
                    HTTP Range / serve
                                 │
                                 ▼
                    Browser (LOD streaming)
```

**Request lifecycle:**

1. A user action in the browser triggers a REST call to Django.
2. Django validates the request and delegates to `functions.py`.
3. `functions.py` launches the appropriate C++ binary or Python ML script via
   `subprocess.Popen`.
4. Stdout is streamed in real time to the Django process log.
5. On completion, the result (file path, status) is returned as JSON to the browser.
6. The browser fetches processed data files via dedicated serve endpoints with HTTP
   Range support for efficient streaming of large binary files.

---

## Frontend

**Key files:**

| File | Role |
|---|---|
| `static/viewer/js/main.js` | Application controller (~1 000 lines): initializes the BabylonJS scene, Potree 2.0 loader, toolbar, and panels |
| `static/viewer/js/functions.js` | UI and data logic (~4 700 lines): selection tools, class registry, REST API calls, colormap management, and dynamic modals |
| `static/viewer/js/potree2-loader.js` | Potree 2.0 LOD loader with custom hooks for segment assignment |
| `templates/viewer/viewer_page.html` | Main HTML shell; injects `RUNTIME_DATA_URL` and `RUNTIME_DATA_PATH_PREFIX` from the Django template context |

**Rendering stack:**

- **BabylonJS** renders the 3D scene, manages the camera, lighting, and any additional
  mesh or annotation layers.
- **Potree 2.0** streams the point cloud octree in chunks via HTTP Range requests
  against the `/pointcloud-data/` endpoint, providing adaptive level-of-detail (LOD)
  for large datasets.
- **Selection tools** (rectangle, lasso, polygon) are implemented via mouse event
  listeners and an SVG overlay rendered on top of the 3D canvas.

**State management:** Application state (class registry, segment map, active mode,
annotation buffer) is held in the global scope and ES6 module exports. There is no
client-side persistence — all data lives on the server under `runtime_data/`.

**Operating modes:**

- **Training mode:** Enables point selection tools, class assignment, and model training
  controls. The context menu is only available in this mode.
- **Classify mode:** Enables model loading, inference triggering, and prediction
  visualization.

---

## Django Backend

**Settings** (`classifyViewer/settings.py`):

| Setting | Value | Description |
|---|---|---|
| `DEBUG` | `False` | Production mode |
| `ALLOWED_HOSTS` | `['0.0.0.0', 'localhost']` | Accepted hosts |
| `RUNTIME_DATA_ROOT` | `BASE_DIR / 'runtime_data'` | Root directory for all runtime files |
| `RUNTIME_DATA_URL` | `/runtime-data/` | URL prefix for runtime file serving |
| `DATA_UPLOAD_MAX_MEMORY_SIZE` | 5 GB | Maximum multipart upload size |
| Gunicorn `timeout` | `0` (disabled) | No timeout; required for long-running C++ operations |

**Static files:** Collected at image build time via `collectstatic` and served by
WhiteNoise middleware without requiring a separate web server.

**URL structure:**

```
/                         → viewer_page.html  (main application)
/documentation/           → docs_page.html    (in-app documentation)
/pointcloud-data/<path>   → HTTP Range-capable binary file server
/runtime-data/<path>      → Runtime file server (LAS, JSON, pcbin)
/api/*                    → REST API endpoints
/<operation>/             → Processing pipeline endpoints
```

See [API_REFERENCE.md](API_REFERENCE.md) for full endpoint documentation.

---

## C++ Processing Pipeline

Eight pre-compiled binaries are deployed to `/webapp/opt/` inside the container. They
are invoked from Python via `subprocess.Popen`, communicate through file paths and CLI
arguments, and write all output to `runtime_data/working/`.

| Binary | Purpose | Input | Output |
|---|---|---|---|
| `feature_extraction_viewer_gpu` | GPU-accelerated per-point geometric feature extraction (tiled, Thrust) | LAS | LAS with Extra Bytes |
| `feature_extraction_viewer_cpu` | CPU-only feature extraction fallback (OpenMP) | LAS | LAS with Extra Bytes |
| `subsample_pc` | Voxel-grid downsampling | PLY / LAS | Subsampled file |
| `mesh2pc` | Surface mesh → point cloud (uniform sampling) | GLB / GLTF / OBJ | LAS |
| `ply2las` | PLY → LAS format conversion | PLY | LAS |
| `split_las_by_binary` | Split LAS into per-segment files using `.pcbin` annotation store | LAS + `.pcbin` | Multiple LAS files |
| `las_to_feature_bin` | Pack feature LAS into compact `.pcbin` binary store | LAS | `.pcbin` |
| `check_point_id` | Validate and normalize POINT_ID to canonical 0-based indexing | LAS | LAS (validated) |

**Build dependencies:** PCL 1.9, PDAL 2.7.1, GDAL 3.6.2, Open3D 0.19.0, LASzip,
CGAL, Boost, CUDA 11.8 + Thrust (GPU binaries only).

See [BINARIES.md](BINARIES.md) for full CLI reference per binary.

### `.pcbin` binary format

The `.pcbin` file is the unified binary store for features and per-point annotations.

```
Header  (16 + F×40 bytes):
  [0–3]   magic    'PCBN'
  [4]     version  1 = float32 features | 2 = uint8 quantized features
  [5]     bpf      bytes per feature (1 or 4)
  [6–7]   reserved
  [8–11]  N        number of points (uint32 LE)
  [12–15] F        number of features (uint32 LE)
  [16…]   F × (32-byte name + 4-byte vmin + 4-byte vmax)

Per-point record  (F×bpf + 8 bytes):
  [0 … F×bpf-1]   feature values
  [F×bpf]         segment_id   (uint8, 0-based; 0xFF = unassigned)
  [F×bpf + 1]     class_id     (uint8; 0xFF = unassigned)
  [F×bpf + 2–5]   confidence   (float32 LE)
```

---

## Python ↔ C++ Integration

All C++ binary invocations are managed by the `JobManager` class in `functions.py`.

**`JobManager` responsibilities:**

- Launch a subprocess with `subprocess.Popen`, capturing combined stdout/stderr.
- Store a reference to the running process so `stop_process` can terminate it at any
  time.
- On Linux, use `os.setsid` to create a new process group, allowing `SIGTERM` to
  propagate to child processes.
- Stream stdout to the Django log in real time, handling both `\n` and `\r` progress
  updates (e.g. tqdm progress bars).
- On subprocess failure (non-zero exit code, excluding `SIGTERM`), parse the last
  stdout line as an error message and raise `RuntimeError`.

**`stop_process` endpoint:** Sends `SIGTERM` to the active process group on Linux, or
calls `taskkill /F /T` on Windows. Used to cancel long-running operations such as
feature extraction or model training.

---

## ML Pipeline

### Training (`utils_functions/RF_training.py`)

1. Reads `features.las` (LAS with Extra Bytes) and the binary annotation buffer
   (`labels_TIMESTAMP.bin`, one byte per point).
2. Extracts feature column names from LAS VLR Extra Bytes metadata.
3. Splits annotated points into training and validation sets by segment ID.
4. Trains a Random Forest classifier using RAPIDS `cuRF` (GPU) if available, with
   automatic fallback to scikit-learn's `RandomForestClassifier` (CPU).
5. Saves `model.pkl` (serialized classifier) and a performance report (accuracy, F1,
   confusion matrix) to `runtime_data/models/<model_name>/`.

### Inference (`utils_functions/RF_classify.py`)

1. Loads the saved `model.pkl`.
2. Reads `features.las` and extracts the same feature columns used during training,
   matched by name from VLR Extra Bytes.
3. Runs `predict` and `predict_proba` to obtain per-point class labels and confidence
   scores.
4. Writes predictions and confidence values back to the LAS file as Extra Bytes.
5. Converts the updated LAS to `.pcbin` format for visualization in the browser.

**GPU acceleration:** cuML's `RandomForestClassifier` is a drop-in replacement for
scikit-learn's. Both training and inference attempt GPU execution first; any import
error or CUDA exception triggers a graceful fallback to the CPU implementation.

---

## Data Storage Layout

All runtime data is stored under `classifyViewer/runtime_data/` (configurable via
`RUNTIME_DATA_ROOT` in `settings.py`):

```
runtime_data/
├── working/
│   ├── <uploaded_file>.*           Original uploaded file
│   ├── features.las                Canonical feature LAS (source of truth for the pipeline)
│   ├── features.pcbin              Binary feature + annotation store
│   ├── pointcloud_backup.las       Backup copy before feature re-extraction
│   ├── labels_TIMESTAMP.bin        Binary annotation buffer (one byte per point)
│   ├── meta_TIMESTAMP.json         Segment → class name metadata
│   └── potree_output/              Potree 2.0 octree files for LOD streaming
│       ├── metadata.json
│       ├── octree.bin
│       └── hierarchy.bin
└── models/
    └── <model_name>/
        ├── model.pkl               Serialized Random Forest model
        └── report.txt              Training performance metrics
```
