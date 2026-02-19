// ply2las.cpp
#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <fstream>
#include <cmath>
#include <algorithm>
#include <cstring>

// Open3D
#include <open3d/Open3D.h>

using TimePoint = std::chrono::time_point<std::chrono::high_resolution_clock>;
TimePoint now_t() { return std::chrono::high_resolution_clock::now(); }
double elapsed(TimePoint start) {
    return std::chrono::duration<double>(std::chrono::high_resolution_clock::now() - start).count();
}

template<typename T>
void write_val(std::ofstream& f, T val) {
    f.write(reinterpret_cast<const char*>(&val), sizeof(T));
}
void write_str(std::ofstream& f, const char* s, int len) {
    std::vector<char> buf(len, 0);
    int slen = (int)strlen(s);
    memcpy(buf.data(), s, std::min(slen, len));
    f.write(buf.data(), len);
}

void write_extra_bytes_record(std::ofstream& f, const char* name, const char* description) {
    write_val<uint8_t>(f, 0);
    write_val<uint8_t>(f, 0);
    write_val<uint8_t>(f, 9);
    write_val<uint8_t>(f, 0);
    write_str(f, name, 32);
    for (int i = 0; i < 4;  i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 72; i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 48; i++) write_val<uint8_t>(f, 0);
    write_str(f, description, 32);
}

void write_las(const std::string& out_file,
               const std::vector<Eigen::Vector3d>& points,
               const std::vector<Eigen::Vector3d>& colors,
               const std::vector<Eigen::Vector3d>& normals,
               bool has_colors,
               bool has_normals)
{
    std::ofstream f(out_file, std::ios::binary);
    if (!f) { std::cerr << "Cannot open: " << out_file << std::endl; return; }

    uint32_t n = (uint32_t)points.size();

    double min_x = 1e18, min_y = 1e18, min_z = 1e18;
    double max_x = -1e18, max_y = -1e18, max_z = -1e18;
    for (auto& p : points) {
        min_x = std::min(min_x, p[0]); max_x = std::max(max_x, p[0]);
        min_y = std::min(min_y, p[1]); max_y = std::max(max_y, p[1]);
        min_z = std::min(min_z, p[2]); max_z = std::max(max_z, p[2]);
    }

    double scale_xyz = 0.0001;
    uint32_t extra_bytes_payload = has_normals ? 3 * 192 : 0;
    uint16_t header_size = 227;
    uint32_t vlr_count = has_normals ? 1 : 0;
    uint32_t vlr_total = has_normals ? (54 + extra_bytes_payload) : 0;
    uint32_t offset_to_data = header_size + vlr_total;
    uint16_t point_data_length = has_normals ? 46 : 34;

    write_str(f, "LASF", 4);
    write_val<uint16_t>(f, 0);
    write_val<uint16_t>(f, 0);
    write_val<uint32_t>(f, 0);
    write_val<uint16_t>(f, 0);
    write_val<uint16_t>(f, 0);
    for (int i = 0; i < 8; i++) write_val<uint8_t>(f, 0);
    write_val<uint8_t>(f, 1);
    write_val<uint8_t>(f, 2);
    write_str(f, "OTHER", 32);
    write_str(f, "ply2las_cpp", 32);
    write_val<uint16_t>(f, 0);
    write_val<uint16_t>(f, 0);
    write_val<uint16_t>(f, header_size);
    write_val<uint32_t>(f, offset_to_data);
    write_val<uint32_t>(f, vlr_count);
    write_val<uint8_t>(f, 3);
    write_val<uint16_t>(f, point_data_length);
    write_val<uint32_t>(f, n);
    write_val<uint32_t>(f, n);
    for (int i = 0; i < 4; i++) write_val<uint32_t>(f, 0);
    write_val<double>(f, scale_xyz);
    write_val<double>(f, scale_xyz);
    write_val<double>(f, scale_xyz);
    write_val<double>(f, 0.0);
    write_val<double>(f, 0.0);
    write_val<double>(f, 0.0);
    write_val<double>(f, max_x); write_val<double>(f, min_x);
    write_val<double>(f, max_y); write_val<double>(f, min_y);
    write_val<double>(f, max_z); write_val<double>(f, min_z);

    if (has_normals) {
        write_val<uint16_t>(f, 0);
        write_str(f, "LASF_Spec", 16);
        write_val<uint16_t>(f, 4);
        write_val<uint16_t>(f, (uint16_t)extra_bytes_payload);
        write_str(f, "Normal vectors", 32);
        write_extra_bytes_record(f, "normal_x", "Normal X");
        write_extra_bytes_record(f, "normal_y", "Normal Y");
        write_extra_bytes_record(f, "normal_z", "Normal Z");
    }

    for (uint32_t i = 0; i < n; ++i) {
        int32_t ix = (int32_t)std::round(points[i][0] / scale_xyz);
        int32_t iy = (int32_t)std::round(points[i][1] / scale_xyz);
        int32_t iz = (int32_t)std::round(points[i][2] / scale_xyz);
        write_val<int32_t>(f, ix);
        write_val<int32_t>(f, iy);
        write_val<int32_t>(f, iz);
        write_val<uint16_t>(f, 0);
        write_val<uint8_t>(f, 0);
        write_val<uint8_t>(f, 0);
        write_val<uint8_t>(f, 0);
        write_val<uint8_t>(f, 0);
        write_val<uint16_t>(f, 0);
        write_val<double>(f, 0.0);
        if (has_colors) {
            write_val<uint16_t>(f, (uint16_t)(std::clamp(colors[i][0], 0.0, 1.0) * 65535));
            write_val<uint16_t>(f, (uint16_t)(std::clamp(colors[i][1], 0.0, 1.0) * 65535));
            write_val<uint16_t>(f, (uint16_t)(std::clamp(colors[i][2], 0.0, 1.0) * 65535));
        } else {
            write_val<uint16_t>(f, 0);
            write_val<uint16_t>(f, 0);
            write_val<uint16_t>(f, 0);
        }
        if (has_normals) {
            write_val<float>(f, (float)normals[i][0]);
            write_val<float>(f, (float)normals[i][1]);
            write_val<float>(f, (float)normals[i][2]);
        }
    }

    f.close();
    // std::cout << "LAS written: " << out_file << std::endl;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <file.ply> [output.las]" << std::endl;
        return 1;
    }

    std::string ply_path = argv[1];
    std::string out_path = (argc >= 3) ? argv[2]
                           : ply_path.substr(0, ply_path.rfind(".ply")) + ".las";

    auto global_start = now_t();

    std::cout << "Loading PLY from " << ply_path << std::endl;
    auto pcd = std::make_shared<open3d::geometry::PointCloud>();
    if (!open3d::io::ReadPointCloud(ply_path, *pcd)) {
        std::cerr << "Failed to read: " << ply_path << std::endl;
        return 1;
    }
    if (pcd->points_.empty()) {
        std::cerr << "Empty point cloud" << std::endl;
        return 1;
    }

    bool has_colors  = pcd->HasColors();
    bool has_normals = false;

    // Normali veloci come mesh2pc
    auto t = now_t();
    std::cout << "Computing normals..." << std::endl;
    pcd->EstimateNormals(open3d::geometry::KDTreeSearchParamHybrid(0.02, 30));
    pcd->OrientNormalsTowardsCameraLocation(); 
    has_normals = pcd->HasNormals();
    // std::cout << "  Normals: " << elapsed(t) << "s" << std::endl;

    // std::cout << " - Points: "  << pcd->points_.size() << std::endl;
    // std::cout << " - Colors: "  << (has_colors  ? "yes" : "no") << std::endl;
    // std::cout << " - Normals: " << (has_normals ? "yes" : "no") << std::endl;

    t = now_t();
    write_las(out_path, pcd->points_, pcd->colors_, pcd->normals_,
              has_colors, has_normals);
    // std::cout << "  Write LAS: " << elapsed(t) << "s" << std::endl;

    double total = elapsed(global_start);
    int mn = (int)(total / 60);
    int sc = (int)total % 60;
    std::cout << "Point cloud saved as: " << out_path
              << ", with " << pcd->points_.size() << " points" << std::endl;
    if (mn > 0)
        std::cout << "Processing time: " << mn << " min " << sc << " sec" << std::endl;
    else
        std::cout << "Processing time: " << sc << " sec" << std::endl;

    std::cout << out_path << std::endl;
    return 0;
}