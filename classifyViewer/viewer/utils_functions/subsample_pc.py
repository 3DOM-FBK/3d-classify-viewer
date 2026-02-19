import open3d as o3d
import subprocess

# TODO: delete here
# def main(file_path, voxel_size=0.002):
    # print(f"Loading file for downsampling: {file_path}")
    # pcd = o3d.io.read_point_cloud(file_path)
    # print(f"Original Points N: {len(pcd.points)}")

    # pcd_down = pcd.voxel_down_sample(voxel_size=voxel_size)
    
    # voxel_size_cm = int(voxel_size * 100)
    # voxel_size_mm = int(voxel_size * 1000)
    # if voxel_size_cm >= 1:
    #     print(f"Points N after the voxel_down_sample ({voxel_size_cm:.1f} cm): {len(pcd_down.points)}")
    #     # Save the file to read with PlyData
    #     temp_file = dense_file.replace(".ply", f"_{voxel_size_cm}cm.ply")
    # elif voxel_size_mm >= 1:
    #     print(f"Points N after the voxel_down_sample ({voxel_size_mm:.1f} mm): {len(pcd_down.points)}")
    #     # Save the file to read with PlyData
    #     temp_file = dense_file.replace(".ply", f"_{voxel_size_mm}mm.ply")

    # output_filepath = file_path.replace(".ply", f"_{int(voxel_size*1000)}mm.ply")
    # o3d.io.write_point_cloud(output_filepath, pcd_down)
    # print(f"Subsampled point cloud saved to: {output_filepath}")


def main(file_path, voxel_size=0.002):
    result = subprocess.run(
        ["/app/classifyViewer/viewer/utils_functions/build/subsample_pc", file_path, str(voxel_size)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"C++ process failed (code {result.returncode})\nSTDERR:\n{result.stderr}"
        )

    lines = result.stdout.strip().splitlines()
    if not lines:
        raise RuntimeError("C++ program produced no output on stdout")

    output_file_path = lines[-1]


if __name__ == "__main__":
    main()