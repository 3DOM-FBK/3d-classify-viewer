#include <open3d/Open3D.h>
#include <iostream>
#include <string>

std::string subsample_pc(const std::string& file_path, double voxel_size) {
    std::cout << "Loading file for downsampling in C++: " << file_path << std::endl;

    auto pcd = std::make_shared<open3d::geometry::PointCloud>();
    if (!open3d::io::ReadPointCloud(file_path, *pcd)) {
        throw std::runtime_error("Failed to read point cloud: " + file_path);
    }
    std::cout << "Original Points N: " << pcd->points_.size() << std::endl;

    auto pcd_down = pcd->VoxelDownSample(voxel_size);

    // Logica cm/mm identica al Python
    int voxel_size_cm = (int)(voxel_size * 100);
    int voxel_size_mm = (int)(voxel_size * 1000);

    std::string suffix;
    if (voxel_size_cm >= 1) {
        std::cout << "Points N after voxel_down_sample ("
                  << voxel_size_cm << " cm): "
                  << pcd_down->points_.size() << std::endl;
        suffix = "_" + std::to_string(voxel_size_cm) + "cm.ply";
    } else {
        std::cout << "Points N after voxel_down_sample ("
                  << voxel_size_mm << " mm): "
                  << pcd_down->points_.size() << std::endl;
        suffix = "_" + std::to_string(voxel_size_mm) + "mm.ply";
    }

    // Costruzione output path
    std::string output_filepath;
    size_t pos = file_path.rfind(".ply");
    if (pos == std::string::npos) {
        output_filepath = file_path + suffix;
    } else {
        output_filepath = file_path.substr(0, pos) + suffix;
    }

    if (!open3d::io::WritePointCloud(output_filepath, *pcd_down)) {
        throw std::runtime_error("Failed to write point cloud: " + output_filepath);
    }

    std::cout << "Subsampled point cloud saved to: " << output_filepath << std::endl;
    return output_filepath;
}

int main(int argc, char* argv[]) {
    try {
        if (argc < 2) {
            std::cerr << "Usage: " << argv[0] << " <file_path> [voxel_size]" << std::endl;
            return 1;
        }
        std::string file_path = argv[1];
        double voxel_size = (argc >= 3) ? std::stod(argv[2]) : 0.002;

        std::string output = subsample_pc(file_path, voxel_size);
        std::cout << output << std::endl;
        return 0;
    }
    catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << std::endl;
        return 2;
    }
}