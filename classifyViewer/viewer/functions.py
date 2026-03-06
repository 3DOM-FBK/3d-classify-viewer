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
    
    folder_path = os.path.abspath(os.path.join(settings.BASE_DIR, "viewer/static/viewer/data2/"))

    features_filepath = os.path.join(folder_path, "RF/training_using_gaussian/dataset/feature_index_gs.txt")
    model_savepath = os.path.join(folder_path, "RF/training_using_gaussian/output/model_avt_gaussian.pkl")
    test_filepath = os.path.join(folder_path, "RF/training_using_gaussian/dataset/test_avt.las")
    output_classify_name = os.path.join(folder_path, "RF/training_using_gaussian/output/avt_gs_predicted")
    use_gpu = data['use_gpu']
    
    classification(features_filepath, model_savepath, test_filepath, output_classify_name, use_gpu)



# ---------------------------------------------------------------
# TODO: DELETE THIS PARTS BELOW IF THERE ARE NOT USEFUL ANYMORE 
# ---------------------------------------------------------------

def load_point_cloud(filepath):
    """
    Read the point cloud from a .txt file showing the loading bar
       
    Return:
        X (np.array) : points
        header (str) : header line
    """
    header = None
    X = []
    print(filepath)
    print(f"Loading the point cloud from {filepath}")
    with open(filepath, 'r') as f:
        lines = f.readlines()
        total_lines = len(lines)

        for line_index, line in enumerate(tqdm(lines, desc="Loading points")):
            tokens = line.strip().split(' ')
            if line_index == 0:
                header = " ".join(tokens)
                continue
            X.append([float(t) for t in tokens])
    
    return np.asarray(X, dtype=np.float32), header

def select_points(points, mode="bbox", params=None):
    """
    Select point using bbox or sphere selection
    Take only the first 3 columns [X,Y,Z] for the spatial operation. 

    Args:
        points (np.ndarray): point cloud NxM (columns: X,Y,Z,...)
        mode (str): "bbox" o "radius"
        params (dict):
            - bbox: {"xmin":.., "xmax":.., "ymin":.., "ymax":.., "zmin":.., "zmax":..}
            - radius: {"center": np.array([x,y,z]), "r": float}

    Returns:
        np.ndarray: Selected points
    """
    coords = points[:, :3]

    if mode == "bbox":
        mask = np.ones(len(coords), dtype=bool)
        for axis, (min_val, max_val) in zip(["x","y","z"],
                                            [(params.get("xmin",-np.inf), params.get("xmax",np.inf)),
                                             (params.get("ymin",-np.inf), params.get("ymax",np.inf)),
                                             (params.get("zmin",-np.inf), params.get("zmax",np.inf))]):
            idx = {"x":0, "y":1, "z":2}[axis]
            mask &= (coords[:,idx] >= min_val) & (coords[:,idx] <= max_val)
        selected = points[mask]  # return all the original columns 

    elif mode == "radius":
        center = np.array(params["center"])
        r = params["r"]
        distances = np.linalg.norm(coords - center, axis=1)
        selected = points[distances <= r]  # return all the original columns 

    else:
        raise ValueError("Invalid Mode. Use 'bbox' or 'radius'")

    return selected

# Standard RGB colors (0–255)

RED       = (255, 0, 0)
GREEN     = (0, 255, 0)
BLUE      = (0, 0, 255)

YELLOW    = (255, 255, 0)
ORANGE    = (255, 165, 0)

PURPLE    = (138, 43, 226)
CYAN      = (0, 255, 255)
PINK      = (255, 105, 180)

BROWN     = (139, 69, 19)
GRAY      = (128, 128, 128)

COLORS = {
    "red": RED,
    "green": GREEN,
    "blue": BLUE,
    "yellow": YELLOW,
    "orange": ORANGE,
    "purple": PURPLE,
    "cyan": CYAN,
    "pink": PINK,
    "brown": BROWN,
    "gray": GRAY,
}

@dataclass
class LabelInfo:
    id: int
    name: str
    color: Tuple[int,int,int]

class LabelManager:
    def __init__(self):
        self.labels: List[LabelInfo] = []
        self.next_id = 0
        self._update_id_to_name()

    def _update_id_to_name(self):
        self.id_to_name = {label.id: label.name for label in self.labels}

    def list_labels(self):
        return [(label.id, label.name, label.color) for label in self.labels]

    def add_label(self, name: str, color_name: str):
        if color_name not in COLORS:
            raise ValueError(f"Color '{color_name}' not found in the list COLORS {COLORS}")
        label = LabelInfo(self.next_id, name, COLORS[color_name])
        self.labels.append(label)
        self.next_id += 1
        self._update_id_to_name()
        return label

    def remove_label(self, id_or_name):
        self.labels = [lbl for lbl in self.labels if lbl.id != id_or_name and lbl.name != id_or_name]
        self._update_id_to_name()

    def rename_label(self, id_or_name, new_name):
        for lbl in self.labels:
            if lbl.id == id_or_name or lbl.name == id_or_name:
                lbl.name = new_name
                self._update_id_to_name()
                return lbl
        raise ValueError(f"Label {id_or_name} not found")

    def assign_label(self, selection: List[int], id_or_name):
        """ Selection is the list with the corrispondent index for each point (index from the list of points), 
            return a list with (index of point, label_id ) """
        for lbl in self.labels:
            if lbl.id == id_or_name or lbl.name == id_or_name:
                return [(i, lbl.id) for i in selection]
        raise ValueError(f"Label {id_or_name} not found")

    def remove_label_from_selection(self, selection: List[int]):
        """ Remove the label from the selection, return a list with None"""
        return [(i, None) for i in selection]

    def get_class_name(self, label_id):
        return self.id_to_name.get(label_id, "unknown")

def main():

    parser = argparse.ArgumentParser(description='Testing the function for App')
    parser.add_argument('--file_path', help='Path to the file containing the point cloud')
    args = parser.parse_args()
    

    file_path = "data/cloud.txt"
    output_path = "data/"

    load_cloud_flag = True
    select_region_flag = False
    classes_flag = True
    subsampling_flag = False
    voxel_size = 0.05 

    if load_cloud_flag == True:
        print(f"Load cloud")
        points, header = load_point_cloud(file_path)
        print(f"Header: {header}")
        print(f"N Point loaded: {len(points)}")
        # print(points[:5])

        columns = header.strip().split()  
        labels_index = columns.index("labels")  # find labels pos
        print("Index of 'labels':", labels_index)
        
        # mins = points[:, :3].min(axis=0)
        # maxs = points[:, :3].max(axis=0)

        # print("MIN (X,Y,Z):", mins)
        # print("MAX (X,Y,Z):", maxs)


    if classes_flag == True :

        all_classes = LabelManager()
        
        all_classes.add_label("ground", "bown")
        all_classes.add_label("building", "red")
        all_classes.add_label("vegetation", "green")
        all_classes.add_label("unclassified", "grey")

        print("Initial list:", all_classes.list_labels())

        # Rename
        all_classes.rename_label("vegetation", "plants")
        print("After rename:", all_classes.list_labels())

        # Point position
        point_pos = 0

        # Pick the label value for the points position 
        label_id = int(points[point_pos, labels_index])
        print(f"Point {point_pos} has a numeric label:", label_id)

        # Find the name of the class
        class_name = all_classes.get_class_name(label_id)
        print(f"Point {point_pos} is associated to:", class_name)

        # Remove label
        all_classes.remove_label("building")
        print("After removing:", all_classes.list_labels())

    if subsampling_flag == True :
        sampling_file_path = subsampling_point_cloud(file_path, voxel_size)
    
    # SELECT A REGION OF POINT USING BBOX AND RADIUS AND THEN EXPORT
    if select_region_flag == True:
        print(f"Select a region")
        center = (mins + maxs) / 2
        size = (maxs - mins) * 0.2  # 20% of the point cloud

        bbox_params = {
            "xmin": center[0] - size[0],
            "xmax": center[0] + size[0],
            "ymin": center[1] - size[1],
            "ymax": center[1] + size[1],
            "zmin": center[2] - size[2],
            "zmax": center[2] + size[2],
        }

        subset_bbox = select_points(points, mode="bbox", params=bbox_params)
        print("Bounding box:", subset_bbox.shape)

        
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points[:, :3])

        o3d.visualization.draw_geometries([pcd, bbox_params])

        # Center picked from mean of the points
        center = points[:, :3].mean(axis=0)
        radius_params = {
            "center": center,
            "r": 5.0
        }
        subset_radius = select_points(points, mode="radius", params=radius_params)
        print("Raggio:", subset_radius.shape)

        # Exporting files
        export_point_cloud(os.path.join(output_path, "cloud_bbox.txt"), subset_bbox, header)
        export_point_cloud(os.path.join(output_path, "cloud_rad.txt"), subset_radius, header)

# if __name__== '__main__':
#     main()