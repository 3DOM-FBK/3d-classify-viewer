import open3d as o3d
import numpy as np
import laspy
from laspy import ExtraBytesParams
import argparse
import time
from pathlib import Path


def ply_to_las(ply_path, out_path=None):
    print(f"Loading PLY from {ply_path}")
    start_time = time.time()

    pcd = o3d.io.read_point_cloud(ply_path)

    if len(pcd.points) == 0:
        print("❌ Empty point cloud")
        return

    points = np.asarray(pcd.points)

    # === Calcolo normali ===
    print("Computing normals")
    pcd.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(
            radius=0.02,
            max_nn=30
        )
    )
    pcd.orient_normals_consistent_tangent_plane(30)
    has_colors = pcd.has_colors()
    has_normals = pcd.has_normals()

    print(f" - Points: {len(points)}")
    print(f" - Colors: {has_colors}")
    print(f" - Normals: {has_normals}")

    # === HEADER LAS ===
    header = laspy.LasHeader(point_format=3, version="1.2")

    if has_normals:
        header.add_extra_dim(ExtraBytesParams(name="normal_x", type=np.float32))
        header.add_extra_dim(ExtraBytesParams(name="normal_y", type=np.float32))
        header.add_extra_dim(ExtraBytesParams(name="normal_z", type=np.float32))

    las = laspy.LasData(header)

    # === COORDINATE ===
    las.x = points[:, 0]
    las.y = points[:, 1]
    las.z = points[:, 2]

    # === COLORI ===
    if has_colors:
        colors = np.asarray(pcd.colors)
        colors_uint16 = (colors * 65535).astype(np.uint16)
        las.red   = colors_uint16[:, 0]
        las.green = colors_uint16[:, 1]
        las.blue  = colors_uint16[:, 2]

    # === NORMALI ===
    if has_normals:
        normals = np.asarray(pcd.normals)
        las.normal_x = normals[:, 0].astype(np.float32)
        las.normal_y = normals[:, 1].astype(np.float32)
        las.normal_z = normals[:, 2].astype(np.float32)

    # === OUTPUT ===
    if out_path is None:
        out_path = str(Path(ply_path).with_suffix(".las"))

    las.write(out_path)

    end_time = time.time()
    tot_sec = round(end_time - start_time, 2)
    minutes = int(tot_sec // 60)
    seconds = int(tot_sec % 60)
    print(f"Point cloud saved as: {out_path}, with {len(points)} points")
    if minutes > 0:
        print(f'Processing time: {minutes} min {seconds} sec')
    else:
        print(f'Processing time: {seconds} sec')


def main(ply_path, out_path=None):
    # parser = argparse.ArgumentParser(description="Convert PLY to LAS")
    # parser.add_argument("--ply", required=True, help="Input PLY file")
    # parser.add_argument("--out", default=None, help="Output LAS file (optional)")
    # args = parser.parse_args()

    ply_to_las(ply_path, out_path)


if __name__ == "__main__":
    main()
