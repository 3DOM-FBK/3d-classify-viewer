import numpy as np
import csv
import os
import argparse
from tqdm import tqdm 
import open3d as o3d
from dataclasses import dataclass
from typing import List, Tuple
from .utils_functions.RF_training import main as training
from .utils_functions.RF_classify import main as classification
from .utils_functions.mesh2pc import main as mesh2pc
from .utils_functions.ply2las import main as ply2las
from .utils_functions.subsample_pc import main as subsampling_pc
import sys
import time
import subprocess

import laspy
import json
from pathlib import Path
import threading
import signal
from django.conf import settings


def launch_subprocess(command):

    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    stdout_lines = []
    for line in process.stdout:
        print(line, end="")      # print live
        stdout_lines.append(line)

    process.wait()

    if process.returncode != 0:
        raise RuntimeError(
            f"C++ process failed (code {process.returncode})\nSTDERR:\n{process.stderr.read()}"
        )

    output_file_path = stdout_lines[-1].strip()
    return output_file_path

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

        # Crea il processo localmente prima di salvarlo
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,  # stderr già mergiato in stdout
            text=True,
            preexec_fn=os.setsid,
            bufsize=1,
            env={**os.environ, "PYTHONUNBUFFERED": "1"}
        )

        with self._lock:
            self._process = process  # ← salva riferimento per stop()

        try:
            for line in process.stdout:  # ← usa variabile locale, non self._process
                if '\r' in line:
                    parts = line.split('\r')
                    print('\r' + parts[-1], end="", flush=True)
                else:
                    print(line, end="", flush=True)
                stdout_lines.append(line)

            process.wait()  # ← variabile locale

            if process.returncode not in (0, -signal.SIGTERM):
                self.error = f"Process failed (code {process.returncode})"
                raise RuntimeError(self.error)

            if stdout_lines:
                self.result = stdout_lines[-1].strip()
            return self.result

        finally:
            with self._lock:
                if self._process is process:  # ← rimuovi solo se è ancora il nostro
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
        # 1. Ferma subprocess C++
        with self._lock:
            if self._process is not None:
                try:
                    os.killpg(os.getpgid(self._process.pid), signal.SIGTERM)
                    print("PROCESS TERMINATED\n")
                except ProcessLookupError:
                    pass


    def wait(self):
        """Wait job completion."""
        if self._thread:
            self._thread.join()

job = JobManager()


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


def ply_to_las(ply_path, out_path=None):
    print("\n[FUNCTION] ---- PLY TO LAS -----")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, ply_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/ply2las", abs_input, abs_output]
    job.launch_subprocess(command)

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

    selected_features = data['selected_features']
    training_filepath = data['training_filepath']
    val_filepath = data['val_filepath']
    n_jobs = data['n_jobs']
    n_estimators = data['nr_estimators']
    max_depth = data['max_depth']
    min_samples_split = data['min_samples_split']
    max_features = data['max_features']
    use_gpu = data['use_gpu']
    output_training_name = data['output_training_name']
    model_savepath = data['model_savepath']

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

    job.launch_subprocess(command)

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

    job.launch_subprocess(command)