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
            self._process = process  # Keep a reference so stop() can terminate it.

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
        """Stop any currently running job."""
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




def stop_processes():
    print("\n[FUNCTION] ---- STOP PROCESSES -----\n")

    job.stop()

def subsampling_point_cloud(file_path, out_path, voxel_size=0.002):
    print("\n[FUNCTION] ---- SUBSAMPLING POINT CLOUD -----")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, file_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/subsample_pc", abs_input, abs_output, str(voxel_size)]
    job.launch_subprocess(command)
    

def get_voxel_size(model_dir):
    """
    Parses the 'Voxel distance value' from report_rt.txt or report.txt
    inside the given model directory.
    """
    # Get the first .txt file in the model directory (should be the only one)
    folder_path = os.path.join(settings.BASE_DIR, model_dir)
    if not os.path.exists(folder_path):
        print(f"Warning: model directory not found {folder_path}")
        return None

    txt_files = [f for f in os.listdir(folder_path) if f.lower().endswith(".txt")]
    if not txt_files:
        print(f"Warning: No .txt report file found in {model_dir}")
        return None
    
    path = os.path.join(folder_path, txt_files[0])
        
    if not path:
        print(f"Warning: No report file found in {model_dir}")
        return None

    try:
        with open(path, 'r') as f:
            content = f.read()
            # Look for "Voxel distance value = 0.XXXX"
            import re
            match = re.search(r"Voxel distance value\s*=\s*([\d\.]+)", content)
            if match:
                return float(match.group(1))
    except Exception as e:
        print(f"Error reading voxel size from {path}: {e}")
        
    return None


def mesh_to_point_cloud(mesh_path, out_path, num_points=5000000):
    print("\n[FUNCTION] ---- MESH TO POINT CLOUD -----")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, mesh_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/mesh2pc", abs_input, abs_output, str(num_points)]
    job.launch_subprocess(command)


def ply_to_las(ply_path, out_path=None):
    print("\n[FUNCTION] ---- PLY TO LAS -----")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, ply_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/ply2las", abs_input, abs_output]
    job.launch_subprocess(command)

def check_point_id(in_path, out_path=None):
    print("\n[FUNCTION] ---- CHECK POINT ID -----")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, in_path))
    # If out_path is not provided, use a temporary one or the same
    if out_path:
        abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path))
    else:
        # Default: overwrite or same directory
        abs_output = abs_input

    command = ["/webapp/opt/check_point_id", abs_input, abs_output]
    result = job.launch_subprocess(command)
    
    # The tool prints "Output: <path>" on the last line
    if result.startswith("Output: "):
        return result.replace("Output: ", "").strip()
    return result


def inspect_las_header(file_path):
    """
    Inspect LAS/LAZ header and report the version / point format.
    Used for fail-fast validation before entering the canonical pipeline.
    """
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, file_path))

    with laspy.open(abs_input) as las_file:
        header = las_file.header
        version = f"{header.version.major}.{header.version.minor}"
        point_format = int(header.point_format.id)

    return {
        "path": abs_input,
        "version": version,
        "point_format": point_format,
        "is_canonical": version == "1.2" and point_format == 3,
    }

def feature_extraction(input_filepath, output_filepath, feature_list, radius_list, sampling=0, use_gpu=True):
    print(f"\n[FUNCTION] ---- FEATURE EXTRACTION ({'GPU' if use_gpu else 'CPU'}) -----")

    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, input_filepath))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, output_filepath))

    # Use a temporary output file to avoid corruption if the process is interrupted
    temp_output = abs_output.replace(".las", "_temp_features.las")

    radius_str = ','.join(str(x) for x in radius_list)
    feature_str = ','.join(feature_list)

    binary = "/webapp/opt/feature_extraction_viewer_gpu" if use_gpu else "/webapp/opt/feature_extraction_viewer_cpu"
    
    if sampling == 0:
        command = [binary, abs_input, temp_output, "--features", feature_str, "--radius", radius_str]
    else :
        command = [binary, abs_input, temp_output, "--features", feature_str, "--radius", radius_str, "--sampling_resolution", str(sampling)]
    
    try:
        job.launch_subprocess(command)
        
        # If successful, replace the original output with the temp one
        if os.path.exists(temp_output):
            os.replace(temp_output, abs_output)
            print(f"Feature extraction successfully applied to {abs_output}")
            
    except Exception as e:
        # Cleanup temp file on failure
        if os.path.exists(temp_output):
            os.remove(temp_output)
        raise e



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
    training_filepath = os.path.abspath(os.path.join(settings.BASE_DIR, data.get('training_filepath', ''))) 
    val_filepath = os.path.abspath(os.path.join(settings.BASE_DIR, data.get('val_filepath', ''))) 
    n_jobs = data.get('n_jobs', -1)
    n_estimators = data.get('n_estimators', data.get('nr_estimators', 100))
    max_depth = data.get('max_depth', None)
    min_samples_split = data.get('min_samples_split', 2)
    max_features = data.get('max_features', 'sqrt')
    use_gpu = data.get('use_gpu', False)
    output_training_name = os.path.abspath(os.path.join(settings.BASE_DIR, data.get('output_training_name', 'model')))
    model_savepath = os.path.abspath(os.path.join(settings.BASE_DIR, data.get('model_savepath', '')))
    report_savepath = os.path.abspath(os.path.join(settings.BASE_DIR, data.get('report_savepath', os.path.join(os.path.dirname(model_savepath), 'report_RF.txt') if model_savepath else '')))

    os.makedirs(os.path.dirname(model_savepath), exist_ok=True)

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
    
    model_savepath = os.path.abspath(os.path.join(settings.BASE_DIR, data["model_savepath"]))
    test_filepath = os.path.abspath(os.path.join(settings.BASE_DIR, data["test_filepath"]))
    output_classify_name = os.path.abspath(os.path.join(settings.BASE_DIR, data["output_classify_name"]))
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
   

def split_las_by_store(las_path: str, pcbin_path: str, output_dir: str = None, exclude_unclassified: bool = False):
    """
    Splits a LAS file using .pcbin store annotations.

    Args:
        las_path:              Path to the input .las file
        pcbin_path:            Path to the .pcbin unified binary store
        output_dir:            Output directory (default: same folder as las_path)
        exclude_unclassified:  If True, skip points with class_id == 0xFF
    """
    print("\n[FUNCTION] ---- SPLIT LAS BY PCBIN STORE (C++ PDAL) -----")

    abs_las    = os.path.abspath(os.path.join(settings.BASE_DIR, las_path) if not os.path.isabs(las_path) else las_path)
    abs_pcbin  = os.path.abspath(os.path.join(settings.BASE_DIR, pcbin_path) if not os.path.isabs(pcbin_path) else pcbin_path)
    abs_outdir = os.path.abspath(os.path.join(settings.BASE_DIR, output_dir) if output_dir and not os.path.isabs(output_dir) else (output_dir or os.path.dirname(abs_las)))

    os.makedirs(abs_outdir, exist_ok=True)

    command = [
        "/webapp/opt/split_las_by_binary",
        abs_las,
        abs_pcbin,
        abs_outdir,
    ]

    if exclude_unclassified:
        command.append("--exclude-unclassified")

    launch_subprocess(command)

# Backward-compat alias
split_las_by_mapping = split_las_by_store

def extract_segment_las(las_path: str, pcbin_path: str, seg_id: int, out_path: str):
    """
    Extracts all points belonging to a specific segment from features.las
    into a new LAS file ready for classification (no 'labels' extra dim added).

    Args:
        las_path:   Path to features.las (source point cloud)
        pcbin_path: Path to the .pcbin unified binary store
        seg_id:     Integer segment ID to extract
        out_path:   Path for the output .las file
    """
    print(f"\n[FUNCTION] ---- EXTRACT SEGMENT LAS (seg_id={seg_id}) -----")

    abs_las   = os.path.abspath(os.path.join(settings.BASE_DIR, las_path))
    abs_pcbin = os.path.abspath(os.path.join(settings.BASE_DIR, pcbin_path))
    abs_out   = os.path.abspath(os.path.join(settings.BASE_DIR, out_path))

    os.makedirs(os.path.dirname(abs_out), exist_ok=True)

    command = [
        "/webapp/opt/split_las_by_binary",
        abs_las,
        abs_pcbin,
        "--extract-segment",
        str(seg_id),
        abs_out,
    ]

    launch_subprocess(command)

def las_to_feature_bin(las_path: str, pcbin_path: str):
    """
    Converts a features.las file into a unified binary store (.pcbin)
    with per-point feature values and empty annotation slots.

    Args:
        las_path:   Path to the input features.las (with POINT_ID + extra dims)
        pcbin_path: Path for the output .pcbin file
    """
    print("\n[FUNCTION] ---- LAS TO PCBIN STORE -----")

    abs_las   = os.path.abspath(os.path.join(settings.BASE_DIR, las_path))
    abs_pcbin = os.path.abspath(os.path.join(settings.BASE_DIR, pcbin_path))

    os.makedirs(os.path.dirname(abs_pcbin), exist_ok=True)

    command = [
        "/webapp/opt/las_to_feature_bin",
        abs_las,
        abs_pcbin,
    ]

    launch_subprocess(command)