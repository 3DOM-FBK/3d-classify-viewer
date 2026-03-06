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

def mesh_to_point_cloud(mesh_path, out_path, num_points=5000000):
    print("\n[FUNCTION] ---- MESH TO POINT CLOUD -----\n")
    
    # Make paths absolute
    abs_input = os.path.abspath(os.path.join(settings.BASE_DIR, mesh_path))
    abs_output = os.path.abspath(os.path.join(settings.BASE_DIR, out_path)) if out_path else None
    
    command = ["/webapp/opt/mesh2pc", abs_input, abs_output, str(num_points)]
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

def split_las_by_binary(las_path: str, bin_path: str, meta_path: str, output_dir: str = None):
    """
    Splits a LAS file into multiple files based on a binary label buffer.
    
    Args:
        las_path:   Path to the input .las file
        bin_path:   Path to the .bin file (uint8) generated by the viewer
        meta_path:  Path to the .json file containing the ID -> Name mapping
        output_dir: Output directory
    """
    las_path = Path(las_path)
    bin_path = Path(bin_path)
    meta_path = Path(meta_path)
    output_dir = Path(output_dir) if output_dir else las_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    # --- Load Metadata ---
    print(f"Loading Metadata: {meta_path}")
    with open(meta_path, "r", encoding="utf-8") as f:
        meta_raw = json.load(f)
    
    # New structure: { "segments": {...}, "classes": {...} }
    segment_map = {int(k): v for k, v in meta_raw.get("segments", {}).items()}
    class_map   = {int(k): v for k, v in meta_raw.get("classes", {}).items()}
    
    print(f"  Detected segments: {segment_map}")
    print(f"  Detected classes:  {class_map}")

    # --- Load Binary Labels (2-Channel) ---
    print(f"Loading Labels: {bin_path}")
    raw_data = np.fromfile(bin_path, dtype=np.uint8)

    # Reshape to (N, 2) -> Column 0: Segment, Column 1: Class
    labels_2d = raw_data.reshape(-1, 2)
    segments = labels_2d[:, 0]
    classes  = labels_2d[:, 1]
    
    print(f"  Found {len(segments):,} labels in the buffer (interleaved 2-bytes)")

    # --- Load LAS ---
    print(f"Loading LAS: {las_path}")
    las = laspy.read(las_path)
    total_points = len(las.points)
    print(f"  Total points in LAS: {total_points:,}")

    if len(segments) < total_points:
        print(f"⚠️  WARNING: The buffer has fewer points ({len(segments)}) than the LAS ({total_points}).")
    elif len(segments) > total_points:
        print(f"⚠️  WARNING: The buffer has more points ({len(segments)}) than the LAS ({total_points}).")
        segments = segments[:total_points]
        classes = classes[:total_points]

    # --- Splitting ---
    for seg_id, element_name in segment_map.items():
        print(f"\nProcessing: '{element_name}' (ID: {seg_id})")
        
        # Mask for the current segment
        mask = (segments == seg_id)
        count = np.sum(mask)

        if count == 0:
            print(f"  No points found, skipping.")
            continue

        print(f"  Found {count:,} points.")
        
        # Class analysis (optional, useful for debugging)
        found_classes = np.unique(classes[mask])
        if len(found_classes) > 0:
            print(f"  Classes present in this segment: {found_classes.tolist()}")

        # Create new LAS
        new_las = laspy.LasData(header=las.header)
        new_las.points = las.points[mask]

        # OPTIONAL: If you want to overwrite the LAS 'classification'
        # attribute with the one assigned in the viewer:
        # new_las.classification = classes[mask]

        # Safe file name
        safe_name = "".join(c if c.isalnum() or c in "._- " else "_" for c in element_name).strip()
        out_path = output_dir / f"{las_path.stem}_{safe_name}.las"

        new_las.write(out_path)
        print(f"  Saved: {out_path}")

    print("\n✅ Process completed!")
