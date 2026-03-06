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

from django.conf import settings

def subsampling_point_cloud(file_path, voxel_size=0.002):
    print("\n[FUNCTION] ---- SUBSAMPLING POINT CLOUD -----\n")
    
    # Make paths absolute relative to project root
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, file_path))
    
    command = ["/webapp/opt/subsample_pc", abs_input, str(voxel_size)]
    output_filepath = launch_subprocess(command)
    
    return output_filepath

def mesh_to_point_cloud(mesh_path, num_points=5000000):
    print("\n[FUNCTION] ---- MESH TO POINT CLOUD -----\n")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, mesh_path))
    
    command = ["/webapp/opt/mesh2pc", abs_input, str(num_points)]
    # TODO: add also output path 
    launch_subprocess(command)

def ply_to_las(ply_path, out_path=None):
    print("\n[FUNCTION] ---- PLY TO LAS -----\n")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, ply_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/ply2las", abs_input, abs_output]
    launch_subprocess(command)

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
    
    launch_subprocess(command)

def Potree(input_filepath, output_filepath):
    print("\n[FUNCTION] ---- Potree Converter -----")

    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, input_filepath))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, output_filepath))

    # Ensure the output directory exists
    if not os.path.exists(abs_output):
        os.makedirs(abs_output, exist_ok=True)

    command = ["/app/PotreeConverter_linux_x64/PotreeConverter", "-i", abs_input, "-o", abs_output]
    
    launch_subprocess(command)
    
def launch_training_RF(data):
    print("\n[FUNCTION] ---- TRAINING RANDOM FOREST -----\n")

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

    training(selected_features, training_filepath, val_filepath, n_jobs, n_estimators, max_depth, min_samples_split, max_features, use_gpu, output_training_name, model_savepath)

def launch_classify_RF(data):
    print("\n[FUNCTION] ---- CLASSIFYING RANDOM FOREST -----\n")
    
    model_savepath = data["model_savepath"]
    test_filepath = data["test_filepath"]
    output_classify_name = data["output_classify_name"]
    use_gpu = data['use_gpu']
    selected_features = data["selected_features"]
    
    classification(selected_features, model_savepath, test_filepath, output_classify_name, use_gpu)
