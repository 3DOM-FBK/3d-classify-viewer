import open3d as o3d


def main(file_path, voxel_size=0.002):
    print(f"Loading file for downsampling: {file_path}")
    pcd = o3d.io.read_point_cloud(file_path)
    print(f"Original Points N: {len(pcd.points)}")

    pcd_down = pcd.voxel_down_sample(voxel_size=voxel_size)
    print(
        f"Points N after the voxel_down_sample ({voxel_size*100:.1f} cm): {len(pcd_down.points)}"
    )

    output_filepath = file_path.replace(".ply", f"_{int(voxel_size*100)}cm.ply")
    o3d.io.write_point_cloud(output_filepath, pcd_down)
    print(f"Subsampled point cloud saved to: {output_filepath}")

    return output_filepath

if __name__ == "__main__":
    main()