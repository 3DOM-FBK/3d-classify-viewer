# API Reference

All endpoints are served by the Django backend at `http://localhost:8000`.

**Conventions:**

- **POST** requests with a JSON body use `Content-Type: application/json`.
- All JSON responses carry at minimum `{"status": "success"}` or
  `{"status": "error", "message": "..."}`.
- CSRF protection is disabled on API endpoints (`@csrf_exempt`); they are
  intended for same-origin browser clients.
- File paths in request bodies are relative to `BASE_DIR`
  (`classifyViewer/`) unless marked as absolute.

## Table of Contents

- [Page Routes](#page-routes)
- [Data Management](#data-management)
- [Processing Pipeline](#processing-pipeline)
- [ML Operations](#ml-operations)
- [Annotation and Export](#annotation-and-export)
- [Model Management](#model-management)
- [File Serving](#file-serving)

---

## Page Routes

### `GET /`

Returns the main viewer HTML page (`viewer_page.html`).

### `GET /documentation/`

Returns the in-app documentation HTML page (`docs_page.html`).

---

## Data Management

### `POST /api/upload-data/`

Upload a point cloud or mesh file to the working directory
(`runtime_data/working/`).

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | Point cloud file (`.ply`, `.las`, `.laz`, `.glb`, etc.) |

**Response:**

```json
{
  "message": "File uploaded successfully",
  "filename": "input.las",
  "rel_path": "input.las"
}
```

---

### `POST /api/clear-data/`

Delete all files in the working directory (`runtime_data/working/`). The
models directory is not affected.

**Request:** Empty POST body.

**Response:**

```json
{ "message": "Working directory cleared successfully" }
```

---

### `POST /api/backup-pointcloud/`

Create a backup copy of `features.las` as `pointcloud_backup.las` in the
working directory.

**Response:**

```json
{
  "status": "success",
  "message": "Point cloud backup created",
  "backup_path": "runtime_data/working/pointcloud_backup.las"
}
```

---

### `POST /api/restore-pointcloud-backup/`

Restore `features.las` from `pointcloud_backup.las` and regenerate
`features.pcbin`.

**Response:**

```json
{
  "status": "success",
  "message": "Point cloud restored from backup",
  "las_path":   "runtime_data/working/features.las",
  "pcbin_path": "runtime_data/working/features.pcbin"
}
```

---

## Processing Pipeline

### `POST /subsample_pc/`

Downsample a point cloud using a voxel-grid filter (one representative point
per voxel cell).

**Request body:**

```json
{
  "file_path":  "runtime_data/working/input.las",
  "out_path":   "runtime_data/working/subsampled.las",
  "voxel_size": 0.05
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Subsampling completed.",
  "output_file_path": "runtime_data/working/subsampled.las"
}
```

---

### `POST /mesh2pc/`

Convert a surface mesh (GLB, GLTF, OBJ) to a point cloud by uniform surface
sampling.

**Request body:**

```json
{
  "file_path":  "runtime_data/working/model.glb",
  "out_path":   "runtime_data/working/pointcloud.las",
  "num_points": 500000
}
```

| Field | Type | Description |
|---|---|---|
| `num_points` | `int` | Number of points to sample from the mesh surface |

**Response:**

```json
{ "status": "success", "message": "Mesh to Point Cloud completed." }
```

---

### `POST /ply2las/`

Convert a PLY point cloud to LAS format.

**Request body:**

```json
{
  "file_path": "runtime_data/working/input.ply",
  "out_path":  "runtime_data/working/output.las"
}
```

**Response:**

```json
{ "status": "success", "message": "PLY to LAS completed." }
```

---

### `POST /check_point_id/`

Validate and normalize the `POINT_ID` field in a LAS file to canonical 0-based
sequential indexing. Required before annotation operations.

**Request body:**

```json
{
  "input_path":  "runtime_data/working/input.las",
  "output_path": "runtime_data/working/output.las"
}
```

**Response:**

```json
{ "status": "success", "message": "CHECK POINT ID completed." }
```

---

### `POST /inspect_las_input/`

Read and return header metadata from a LAS file.

**Request body:**

```json
{ "file_path": "runtime_data/working/features.las" }
```

**Response:**

```json
{
  "status":      "success",
  "point_count": 1500000,
  "extra_dims":  ["anisotropy_0.5", "linearity_0.5", "planarity_0.5"],
  "bounds":      { "min": [x, y, z], "max": [x, y, z] }
}
```

---

### `POST /feature_extraction/`

Extract per-point geometric features at one or more radii. Uses the GPU binary
by default; falls back to the CPU binary when `use_gpu` is `false`.

**Request body:**

```json
{
  "input_filepath":  "runtime_data/working/features.las",
  "output_filepath": "runtime_data/working/features.las",
  "feature_list":    ["anisotropy", "linearity", "planarity", "sphericity"],
  "radius_list":     [0.5, 1.0, 2.0],
  "sampling":        0,
  "use_gpu":         true
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `feature_list` | `string[]` | — | Names of geometric features to compute |
| `radius_list` | `float[]` | — | Neighborhood radii in scene units |
| `sampling` | `int` | `0` | Subsampling resolution; `0` disables subsampling |
| `use_gpu` | `bool` | `true` | `false` forces the CPU binary |

**Response:**

```json
{ "status": "success", "message": "Feature extraction completed." }
```

---

### `POST /potree_converter/`

Convert a feature LAS file to Potree 2.0 octree format for LOD streaming.

**Request body:**

```json
{
  "input_filepath":  "runtime_data/working/features.las",
  "output_filepath": "runtime_data/working/potree_output"
}
```

**Response:**

```json
{ "status": "success", "message": "Potree conversion completed." }
```

---

### `POST /split_las_by_binary/`

Split a LAS file into per-segment LAS files based on annotations stored in a
`.pcbin` binary store.

**Request body:**

```json
{
  "las_path":              "runtime_data/working/features.las",
  "pcbin_path":            "runtime_data/working/features.pcbin",
  "output_dir":            "runtime_data/working/segments",
  "exclude_unclassified":  false,
  "segment_names":         { "1": "training", "2": "validation" }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `exclude_unclassified` | `bool` | `false` | Omit points with no segment assignment |
| `segment_names` | `object` | `null` | Map segment IDs to output file names |

**Response:**

```json
{ "status": "success", "message": "Split LAS completed." }
```

---

### `POST /las_to_feature_bin/`

Convert a feature LAS file to the compact `.pcbin` binary format.

**Request body:**

```json
{
  "las_path":   "runtime_data/working/features.las",
  "pcbin_path": "runtime_data/working/features.pcbin"
}
```

**Response:**

```json
{ "status": "success", "message": "Features pcbin generated successfully." }
```

---

### `POST /get_model_voxel_size/`

Retrieve the voxel size recorded in a model's training report file.

**Request body:**

```json
{ "model_dir": "runtime_data/models/my_model" }
```

**Response:**

```json
{ "status": "success", "voxel_size": 0.05 }
```

---

### `POST /stop_process/`

Send a termination signal to the currently running C++ or ML subprocess.

**Request:** Empty POST body.

**Response:**

```json
{ "status": "success", "message": "Process stopped successfully." }
```

---

## ML Operations

### `POST /launch_RF_training/`

Train a Random Forest classifier on the annotated point cloud.

**Request body:**

```json
{
  "model_name":    "my_model",
  "features_las":  "runtime_data/working/features.las",
  "labels_bin":    "runtime_data/working/labels_20240101_120000.bin",
  "meta_json":     "runtime_data/working/meta_20240101_120000.json"
}
```

**Response:**

```json
{ "status": "success", "message": "RF training launched successfully." }
```

---

### `POST /launch_RF_classify/`

Run inference with a trained model on the current point cloud.

**Request body:**

```json
{
  "model_dir":    "runtime_data/models/my_model",
  "features_las": "runtime_data/working/features.las",
  "output_las":   "runtime_data/working/features.las",
  "pcbin_path":   "runtime_data/working/features.pcbin"
}
```

**Response:**

```json
{ "status": "success", "message": "RF classify launched successfully." }
```

---

### `POST /api/start-training/`

Persist the per-point annotation buffer from the browser to the server before
launching training.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `labels` | JSON string | Map of `segmentId → segmentName` |
| `buffer` | Binary file | One byte per point: label value (0 = unannotated) |

**Response:**

```json
{
  "message":        "Binary data saved successfully",
  "filename":       "labels_20240101_120000.bin",
  "labels_filename":"meta_20240101_120000.json",
  "bin_path":       "/webapp/classifyViewer/runtime_data/working/labels_20240101_120000.bin",
  "json_path":      "/webapp/classifyViewer/runtime_data/working/meta_20240101_120000.json",
  "size_bytes":     1500000
}
```

---

## Annotation and Export

### `POST /api/export-mapping/`

Persist point annotation data (segment IDs and class IDs) into the `.pcbin`
binary store. If `features.pcbin` does not yet exist it is generated from
`features.las` automatically.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `buffer` | Binary blob | 2 bytes per point: `segment_id` (1-based, 0 = unannotated) + `class_id` |
| `point_count` | Integer string | Total number of points |
| `pcbin_path` | String | Relative path to the `.pcbin` file (default: `runtime_data/working/features.pcbin`) |

**Response:**

```json
{
  "pcbin_path":  "runtime_data/working/features.pcbin",
  "point_count": 84230
}
```

---

### `POST /api/extract-segment-las/`

Extract all points belonging to a single segment ID into a new LAS file.

**Request body:**

```json
{
  "las_path":   "runtime_data/working/features.las",
  "pcbin_path": "runtime_data/working/features.pcbin",
  "seg_id":     1,
  "out_path":   "runtime_data/working/segment_1.las"
}
```

**Response:**

```json
{ "status": "success", "message": "Segment extraction completed." }
```

---

### `POST /api/download-package/`

Assemble and stream a ZIP archive containing selected segments, point cloud
files, and trained models. Temporary files generated during packaging are
deleted after the response is sent.

**Request body:**

```json
{
  "segments": [
    { "id": 1, "label": "vegetation" },
    { "id": 2, "label": "ground" }
  ],
  "point_cloud_files": [
    { "path": "runtime_data/working/predicted.las", "label": "classified" }
  ],
  "models":   ["my_model"],
  "las_path": "runtime_data/working/features.las",
  "bin_path": "/abs/path/to/labels_TIMESTAMP.bin"
}
```

**Response:** Binary ZIP stream (`Content-Type: application/zip`).

---

### `POST /save_file/`

Save a base64-encoded payload to a path on the server. Used by the frontend to
persist annotation data and configuration files.

**Request body:**

```json
{
  "filepath": "runtime_data/working/annotations.json",
  "data":     "<base64-encoded content>"
}
```

**Response:**

```json
{ "status": "success", "filepath": "/abs/path/to/annotations.json" }
```

---

## Model Management

### `GET /api/models-list/`

List all trained models in `runtime_data/models/`.

**Response:**

```json
{
  "status": "success",
  "models": [
    {
      "name":     "my_model",
      "path":     "runtime_data/models/my_model/model.pkl",
      "created":  "2024-01-15 10:30",
      "size_mb":  12.4
    }
  ]
}
```

---

### `GET /api/model-exists/?name=<model_name>`

Check whether a model folder exists under `runtime_data/models/<name>/`.

**Response:**

```json
{ "exists": true }
```

---

### `POST /api/delete-model/`

Delete a trained model and all files in its directory.

**Request body:**

```json
{ "name": "my_model" }
```

**Response:**

```json
{ "status": "success", "message": "Model 'my_model' deleted successfully." }
```

---

### `POST /api/upload-model/`

Upload an externally trained model file to `runtime_data/models/`.

**Request:** `multipart/form-data` with a `.pkl` model file.

**Response:**

```json
{ "status": "success" }
```

---

## File Serving

### `GET /pointcloud-data/<path>`

Serve binary Potree files (`octree.bin`, `hierarchy.bin`, `.pcbin`, `.json`)
with HTTP Range request support. Potree 2.0 requires this to fetch arbitrary
byte ranges from large octree files without downloading them in full.

- **Allowed extensions:** `.bin`, `.json`, `.pcbin`
- **Restricted to** `runtime_data/` (directory traversal is prevented)
- Returns `206 Partial Content` for range requests; `200 OK` for full-file
  requests
- Files larger than 10 MB are streamed in 64 KB chunks

---

### `GET /runtime-data/<path>`

Serve general runtime data files without Range support.

- **Allowed extensions:** `.las`, `.bin`, `.json`, `.pcbin`, `.txt`
- **Restricted to** `runtime_data/`

---

### `GET /api/read-file/?path=<relative_path>`

Read and return the text content of a `.txt` file. If `path` points to a
directory, the first `.txt` file found inside it is returned.

**Response:**

```json
{ "status": "success", "content": "accuracy: 0.95\n..." }
```
