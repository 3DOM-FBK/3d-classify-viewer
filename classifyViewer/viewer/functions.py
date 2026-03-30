import numpy as np
import os
import subprocess
import signal
import threading
import time
from tqdm import tqdm 
from django.conf import settings


import laspy
import json
from pathlib import Path
import threading
import signal
from django.conf import settings


def launch_subprocess(command):
    """
    Standalone helper to launch a subprocess and return its last line of output.
    """
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    stdout_lines = []
    for line in process.stdout:
        print(line, end="")      # print live
        stdout_lines.append(line)

    process.wait()

    if process.returncode != 0:
        raise RuntimeError(
            f"Process failed (code {process.returncode})"
        )

    return stdout_lines[-1].strip() if stdout_lines else ""

class JobManager:
    def __init__(self):
        self._process = None      # subprocess C++
        self._stop_event = threading.Event()  # script Python
        self._thread = None
        self._lock = threading.Lock()
        self.result = None
        self.error = None

    # ─────────────────────────────────────────
    #  SUBPROCESS
    # ─────────────────────────────────────────
    def launch_subprocess(self, command):
        """Launch subprocess and save reference to it for later termination."""
        stdout_lines = []
        self.error = None
        self.result = None

        # Convert all command arguments to strings
        command = [str(arg) for arg in command]

        # Prepare Popen arguments based on OS
        popen_kwargs = {
            "stdout": subprocess.PIPE,
            "stderr": subprocess.STDOUT,
            "text": True,
            "bufsize": 1,
            "env": {**os.environ, "PYTHONUNBUFFERED": "1"}
        }
        
        if os.name != 'nt':
            # Linux-specific extra params to allow terminating process groups
            popen_kwargs["preexec_fn"] = os.setsid

        process = subprocess.Popen(command, **popen_kwargs)

        with self._lock:
            self._process = process  # ← salva riferimento per stop()

        try:
            for line in process.stdout:
                if '\r' in line:
                    parts = line.split('\r')
                    print('\r' + parts[-1], end="", flush=True)
                else:
                    print(line, end="", flush=True)
                stdout_lines.append(line)

            process.wait()

            sigterm_code = -signal.SIGTERM if os.name != 'nt' else None
            if process.returncode != 0 and process.returncode != sigterm_code:
                last_line = f": {stdout_lines[-1].strip()}" if stdout_lines else ""
                self.error = f"Process failed (code {process.returncode}){last_line}"
                raise RuntimeError(self.error)

            if stdout_lines:
                self.result = stdout_lines[-1].strip()
            return self.result

        finally:
            with self._lock:
                if self._process is process:
                    self._process = None

    def launch_subprocess_async(self, command):
        """Launch subprocess in background."""
        self._thread = threading.Thread(
            target=self.launch_subprocess,
            args=(command,),
            daemon=True
        )
        self._thread.start()


    # ─────────────────────────────────────────
    #  STOP 
    # ─────────────────────────────────────────
    def stop(self):
        """Ferma qualsiasi job in esecuzione."""
        with self._lock:
            if self._process is not None:
                try:
                    if os.name == 'nt':
                        self._process.terminate()
                    else:
                        os.killpg(os.getpgid(self._process.pid), signal.SIGTERM)
                    print("PROCESS TERMINATED\n")
                except (ProcessLookupError, AttributeError, PermissionError):
                    pass


    def wait(self):
        """Wait job completion."""
job = JobManager()


def fix_las_header(las_path):
    """
    Repair the bounding box of a LAS file using laspy.
    This is necessary because some C++ tools generate points slightly
    outside the header's declared bounding box, which panics PotreeConverter.
    """
    print(f"Fixing LAS header bounding box for {las_path}...")
    import laspy
    import numpy as np
    try:
        # Legge il file LAS in ram
        las = laspy.read(las_path)
        
        # Aggiorna forzatamente il bounding box leggendo le corrette coordinate min/max dei punti reali
        las.header.mins = [np.min(las.x), np.min(las.y), np.min(las.z)]
        las.header.maxs = [np.max(las.x), np.max(las.y), np.max(las.z)]
        
        # Sovrascrive il file salvando il nuovo bounding box
        las.write(las_path)
        print("Done fixing LAS header.")
    except Exception as e:
        import traceback
        print(f"Warning: could not fix LAS header for {las_path}: {e}")
        print(traceback.format_exc())


def stop_processes():
    print("\n[FUNCTION] ---- STOP PROCESSES -----\n")

    job.stop()

def subsampling_point_cloud(file_path, voxel_size=0.002):
    print("\n[FUNCTION] ---- SUBSAMPLING POINT CLOUD -----")
    
    # Make paths absolute relative to project root
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, file_path))
    
    command = ["/webapp/opt/subsample_pc", abs_input, str(voxel_size)]
    output_filepath = job.launch_subprocess(command)
    
    return output_filepath

def mesh_to_point_cloud(mesh_path, out_path, num_points=5000000):
    print("\n[FUNCTION] ---- MESH TO POINT CLOUD -----")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, mesh_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/mesh2pc", abs_input, abs_output, str(num_points)]
    job.launch_subprocess(command)
    
    # Fix LAS header
    if abs_output and abs_output.lower().endswith(".las") and os.path.exists(abs_output):
        fix_las_header(abs_output)


def ply_to_las(ply_path, out_path=None):
    print("\n[FUNCTION] ---- PLY TO LAS -----")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, ply_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/ply2las", abs_input, abs_output]
    job.launch_subprocess(command)

    # Fix LAS header
    if abs_output and abs_output.lower().endswith(".las") and os.path.exists(abs_output):
        fix_las_header(abs_output)

def feature_extraction(input_filepath, output_filepath, feature_list, radius_list, sampling=0):
    print("\n[FUNCTION] ---- FEATURE EXTRACTION -----")

    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, input_filepath))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, output_filepath))

    radius_str = ', '.join(str(x) for x in radius_list)
    feature_str = ', '.join(feature_list)

    if sampling == 0:
        command = ["/webapp/opt/feature_extraction_viewer", abs_input, abs_output, "--features", feature_str, "--radius", radius_str]
    else :
        command = ["/webapp/opt/feature_extraction_viewer", abs_input, abs_output, "--features", feature_str, "--radius", radius_str, "--sampling_resolution", sampling]
    
    job.launch_subprocess(command)

    # Fix LAS header
    if abs_output and abs_output.lower().endswith(".las") and os.path.exists(abs_output):
        fix_las_header(abs_output)


def Potree(input_filepath, output_filepath):
    print("\n[FUNCTION] ---- Potree Converter -----")

    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, input_filepath))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, output_filepath))

    # Ensure the output directory exists
    if not os.path.exists(abs_output):
        os.makedirs(abs_output, exist_ok=True)

    command = ["/app/PotreeConverter_linux_x64/PotreeConverter", "-i", abs_input, "-o", abs_output]
    
    job.launch_subprocess(command)
    
def launch_training_RF(data):
    print("\n[FUNCTION] ---- TRAINING RANDOM FOREST -----")

    selected_features = data.get('selected_features', [])
    training_filepath = data.get('training_filepath', '')
    val_filepath = data.get('val_filepath', '')
    n_jobs = data.get('n_jobs', -1)
    n_estimators = data.get('n_estimators', data.get('nr_estimators', 100))
    max_depth = data.get('max_depth', None)
    min_samples_split = data.get('min_samples_split', 2)
    max_features = data.get('max_features', 'sqrt')
    use_gpu = data.get('use_gpu', False)
    output_training_name = data.get('output_training_name', 'model')
    model_savepath = data.get('model_savepath', '')
    report_savepath = data.get('report_savepath', os.path.join(os.path.dirname(model_savepath), 'report_RF.txt') if model_savepath else '')

    script_path = os.path.abspath(os.path.join(settings.BASE_DIR, "viewer/utils_functions/RF_training.py"))

    command = [
        "python3", script_path, 
        "--selected_features", *selected_features,
        "--training_filepath", training_filepath,
        "--val_filepath", val_filepath,
        "--n_jobs", str(n_jobs),              
        "--n_estimators", str(n_estimators),  
        "--max_depth", str(max_depth),        
        "--min_samples_split", str(min_samples_split), 
        "--max_features", str(max_features),
        "--output_training_name", output_training_name,
        "--model_savepath", model_savepath,
        "--report_savepath", report_savepath,
    ]
    if use_gpu:
        command.append("--use_gpu")

    job.launch_subprocess(command)

def launch_classify_RF(data):
    print("\n[FUNCTION] ---- CLASSIFYING RANDOM FOREST -----")
    
    model_savepath = data["model_savepath"]
    test_filepath = data["test_filepath"]
    output_classify_name = data["output_classify_name"]
    use_gpu = data['use_gpu']
    selected_features = data["selected_features"]
    
    script_path = os.path.abspath(os.path.join(settings.BASE_DIR, "viewer/utils_functions/RF_classify.py"))

    command = [
        "python3", script_path, 
        "--selected_features", *selected_features,
        "--model", model_savepath,
        "--test_filepath", test_filepath,
        "--output_classify_name", output_classify_name,
    ]

    if use_gpu:
        command.append("--use_gpu")

    job.launch_subprocess(command)



# TODO Put job.launch_subprocess(command) to have possible to kill
def export_point_cloud(filepath, points, header=None):
    """
    Export the point cloud in a txt file showing the loading bar 
    
    Args:
        filepath (str): path of the output file
        points (np.array): array points Nx3
        header (str, optional): header optional to write in the first line
    """
    n_points = points.shape[0]
    print("\n[FUNCTION] ---- EXPORT POINT CLOUD -----\n")
    print(f"Exporting the point cloud {filepath}")

    if n_points == 0:
        print("Be careful, there are no points to export")
        return

    with open(filepath, 'w') as f:
        # Scrivi header se presente
        if header is not None:
            f.write(header + '\n')

        # Scrivi ogni punto con barra di progresso
        for i in tqdm(range(n_points), desc="Exporting points"):
            # Converte la riga in stringa separata da spazi
            line = ' '.join(map(str, points[i]))
            f.write(line + '\n')
   

def split_las_by_binary(las_path: str, bin_path: str, meta_path: str, output_dir: str = None):
    """
    Splits a LAS file into training.las / validation.las using the C++ PDAL tool.
    Adds an extra dimension "labels" (uint8) with the class assigned in the viewer.

    Args:
        las_path:   Path to the input .las file
        bin_path:   Path to the .bin file (uint8) generated by the viewer
        meta_path:  Path to the .json file containing the ID -> Name mapping
        output_dir: Output directory (default: same folder as las_path)
    """
    print("\n[FUNCTION] ---- SPLIT LAS BY BINARY (C++ PDAL) -----")

    abs_las    = os.path.abspath(os.path.join(settings.BASE_DIR, las_path))
    abs_bin    = os.path.abspath(os.path.join(settings.BASE_DIR, bin_path))
    abs_meta   = os.path.abspath(os.path.join(settings.BASE_DIR, meta_path))
    abs_outdir = os.path.abspath(os.path.join(settings.BASE_DIR, output_dir)) \
                 if output_dir else os.path.dirname(abs_las)

    os.makedirs(abs_outdir, exist_ok=True)

    command = [
        "/webapp/opt/split_las_by_binary",
        abs_las,
        abs_bin,
        abs_meta,
        abs_outdir,
    ]

    # Usa launch_subprocess standalone: non passa dal singleton job,
    # evita race condition quando viene chiamata più volte in sequenza
    # (es. download di più segmenti) da thread Django diversi.
    launch_subprocess(command)

def extract_segment_las(las_path: str, bin_path: str, seg_id: int, out_path: str):
    """
    Extracts all points belonging to a specific segment from features.las
    into a new LAS file ready for classification (no 'labels' extra dim added).

    Uses the same split_las_by_binary binary with the --extract-segment flag.

    Args:
        las_path:  Path to features.las (source point cloud)
        bin_path:  Path to the .bin buffer (2 bytes/point: [seg_id, class_id])
        seg_id:    Integer segment ID to extract
        out_path:  Path for the output .las file
    """
    print(f"\n[FUNCTION] ---- EXTRACT SEGMENT LAS (seg_id={seg_id}) -----")

    abs_las = os.path.abspath(os.path.join(settings.BASE_DIR, las_path))
    abs_bin = os.path.abspath(os.path.join(settings.BASE_DIR, bin_path))
    abs_out = os.path.abspath(os.path.join(settings.BASE_DIR, out_path))

    os.makedirs(os.path.dirname(abs_out), exist_ok=True)

    command = [
        "/webapp/opt/split_las_by_binary",
        abs_las,
        abs_bin,
        "--extract-segment",
        str(seg_id),
        abs_out,
    ]

    # Usa launch_subprocess standalone: stessa motivazione di split_las_by_binary.
    launch_subprocess(command)

def las_to_feature_bin(las_path: str, bin_path: str):
    """
    Converts a features.las file into a compact binary (features.bin) for
    fast per-point feature lookup in the Babylon.js viewer.

    Args:
        las_path:  Path to the input features.las (with POINT_ID + extra dims)
        bin_path:  Path for the output .bin file
    """
    print("\n[FUNCTION] ---- LAS TO FEATURE BIN -----")

    abs_las = os.path.abspath(os.path.join(settings.BASE_DIR, las_path))
    abs_bin = os.path.abspath(os.path.join(settings.BASE_DIR, bin_path))

    os.makedirs(os.path.dirname(abs_bin), exist_ok=True)

    command = [
        "/webapp/opt/las_to_feature_bin",
        abs_las,
        abs_bin,
    ]

    # Usa launch_subprocess standalone: non necessita di essere stoppabile,
    # non deve passare dal singleton job.
    launch_subprocess(command)