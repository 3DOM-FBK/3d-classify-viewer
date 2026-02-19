// mesh2pc.cpp
#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <fstream>
#include <cmath>
#include <algorithm>
#include <cstring>

// CGAL
#include <CGAL/Simple_cartesian.h>
#include <CGAL/AABB_tree.h>
#include <CGAL/AABB_traits.h>
#include <CGAL/AABB_triangle_primitive.h>

// Open3D
#include <open3d/Open3D.h>

// tinygltf (header-only)
#define TINYGLTF_IMPLEMENTATION
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "tinygltf/tiny_gltf.h"

// OpenMP
#include <omp.h>

typedef CGAL::Simple_cartesian<double> K;
typedef K::Point_3 Point_3;
typedef K::Triangle_3 Triangle_3;
typedef std::vector<Triangle_3>::iterator Iterator;
typedef CGAL::AABB_triangle_primitive<K, Iterator> Primitive;
typedef CGAL::AABB_traits<K, Primitive> AABB_triangle_traits;
typedef CGAL::AABB_tree<AABB_triangle_traits> Tree;

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
    write_val<uint8_t>(f, 9);   // float32
    write_val<uint8_t>(f, 0);
    write_str(f, name, 32);
    for (int i = 0; i < 4;  i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 72; i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 48; i++) write_val<uint8_t>(f, 0);
    write_str(f, description, 32);
}

void write_las(const std::string& out_file,
               const std::vector<std::array<double,3>>& points,
               const std::vector<std::array<double,3>>& colors,
               const std::vector<std::array<double,3>>& normals)
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
    double offset_x = 0.0, offset_y = 0.0, offset_z = 0.0;
    uint32_t extra_bytes_payload = 3 * 192;
    uint16_t header_size = 227;
    uint32_t vlr_total = 54 + extra_bytes_payload;
    uint32_t offset_to_data = header_size + vlr_total;
    uint16_t point_data_length = 46;

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
    write_str(f, "mesh2pc_cpp", 32);
    write_val<uint16_t>(f, 0);
    write_val<uint16_t>(f, 0);
    write_val<uint16_t>(f, header_size);
    write_val<uint32_t>(f, offset_to_data);
    write_val<uint32_t>(f, 1);
    write_val<uint8_t>(f, 3);
    write_val<uint16_t>(f, point_data_length);
    write_val<uint32_t>(f, n);
    write_val<uint32_t>(f, n);
    for (int i = 0; i < 4; i++) write_val<uint32_t>(f, 0);
    write_val<double>(f, scale_xyz);
    write_val<double>(f, scale_xyz);
    write_val<double>(f, scale_xyz);
    write_val<double>(f, offset_x);
    write_val<double>(f, offset_y);
    write_val<double>(f, offset_z);
    write_val<double>(f, max_x); write_val<double>(f, min_x);
    write_val<double>(f, max_y); write_val<double>(f, min_y);
    write_val<double>(f, max_z); write_val<double>(f, min_z);

    write_val<uint16_t>(f, 0);
    write_str(f, "LASF_Spec", 16);
    write_val<uint16_t>(f, 4);
    write_val<uint16_t>(f, (uint16_t)extra_bytes_payload);
    write_str(f, "Normal vectors", 32);
    write_extra_bytes_record(f, "normal_x", "Normal X");
    write_extra_bytes_record(f, "normal_y", "Normal Y");
    write_extra_bytes_record(f, "normal_z", "Normal Z");

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
        write_val<uint16_t>(f, (uint16_t)(std::clamp(colors[i][0], 0.0, 1.0) * 65535));
        write_val<uint16_t>(f, (uint16_t)(std::clamp(colors[i][1], 0.0, 1.0) * 65535));
        write_val<uint16_t>(f, (uint16_t)(std::clamp(colors[i][2], 0.0, 1.0) * 65535));
        write_val<float>(f, (float)normals[i][0]);
        write_val<float>(f, (float)normals[i][1]);
        write_val<float>(f, (float)normals[i][2]);
    }

    f.close();
    // std::cout << "  LAS written: " << out_file << std::endl;
}

struct SubMeshResult {
    std::vector<std::array<double,3>> points;
    std::vector<std::array<double,3>> colors;
};

struct GLBMesh {
    std::vector<std::array<float,3>> vertices;
    std::vector<std::array<int,3>>   faces;
    std::vector<std::array<float,2>> uvs;
    int texture_index = -1;
};

bool load_glb(const std::string& path,
              std::vector<GLBMesh>& meshes,
              std::vector<std::vector<uint8_t>>& textures,
              std::vector<std::array<int,2>>& tex_sizes)
{
    tinygltf::Model model;
    tinygltf::TinyGLTF loader;
    std::string err, warn;
    if (!loader.LoadBinaryFromFile(&model, &err, &warn, path)) {
        std::cerr << "Failed to load GLB: " << err << std::endl;
        return false;
    }

    for (auto& img : model.images) {
        textures.push_back(img.image);
        tex_sizes.push_back({img.width, img.height});
        // std::cout << "  Texture: " << img.width << "x" << img.height
        //           << " channels=" << (img.image.size()/(img.width*img.height)) << std::endl;
    }

    for (int mi = 0; mi < (int)model.meshes.size(); ++mi) {
        auto& mesh = model.meshes[mi];
        for (auto& prim : mesh.primitives) {
            GLBMesh m;

            // Vertices — con byteStride
            auto& pa = model.accessors[prim.attributes.at("POSITION")];
            auto& pbv = model.bufferViews[pa.bufferView];
            int pos_stride = (pbv.byteStride > 0) ? pbv.byteStride : 3 * sizeof(float);
            const uint8_t* pbase = model.buffers[pbv.buffer].data.data() + pbv.byteOffset + pa.byteOffset;
            m.vertices.resize(pa.count);
            for (size_t i = 0; i < pa.count; ++i) {
                const float* pd = reinterpret_cast<const float*>(pbase + i * pos_stride);
                m.vertices[i] = {pd[0], pd[1], pd[2]};
            }

            // Indices
            auto& ia = model.accessors[prim.indices];
            auto& ibv = model.bufferViews[ia.bufferView];
            const uint8_t* ibase = model.buffers[ibv.buffer].data.data() + ibv.byteOffset + ia.byteOffset;
            m.faces.resize(ia.count / 3);
            for (size_t i = 0; i < ia.count / 3; ++i) {
                if (ia.componentType == TINYGLTF_COMPONENT_TYPE_UNSIGNED_INT) {
                    const uint32_t* idx = reinterpret_cast<const uint32_t*>(ibase);
                    m.faces[i] = {(int)idx[i*3], (int)idx[i*3+1], (int)idx[i*3+2]};
                } else {
                    const uint16_t* idx = reinterpret_cast<const uint16_t*>(ibase);
                    m.faces[i] = {(int)idx[i*3], (int)idx[i*3+1], (int)idx[i*3+2]};
                }
            }

            // UVs — con byteStride corretto
            m.uvs.resize(pa.count, {0.0f, 0.0f});
            if (prim.attributes.count("TEXCOORD_0")) {
                auto& ua = model.accessors[prim.attributes.at("TEXCOORD_0")];
                auto& ubv = model.bufferViews[ua.bufferView];
                int uv_stride = (ubv.byteStride > 0) ? ubv.byteStride : 2 * (int)sizeof(float);
                const uint8_t* ubase = model.buffers[ubv.buffer].data.data() + ubv.byteOffset + ua.byteOffset;
                for (size_t i = 0; i < ua.count; ++i) {
                    const float* ud = reinterpret_cast<const float*>(ubase + i * uv_stride);
                    m.uvs[i] = {ud[0], ud[1]};
                }
                // std::cout << "  Prim UV stride=" << uv_stride << " count=" << ua.count << std::endl;
            }

            // Texture index
            m.texture_index = (int)meshes.size();
            if (prim.material >= 0) {
                auto& mat = model.materials[prim.material];
                int tex_idx = mat.pbrMetallicRoughness.baseColorTexture.index;
                if (tex_idx >= 0 && tex_idx < (int)model.textures.size()) {
                    int img_idx = model.textures[tex_idx].source;
                    if (img_idx >= 0 && img_idx < (int)textures.size()) {
                        m.texture_index = img_idx;
                    }
                }
            }
            // std::cout << "  Prim[" << meshes.size() << "] → texture_index=" << m.texture_index << std::endl;

            meshes.push_back(std::move(m));
        }
    }
    return true;
}

SubMeshResult process_submesh(
    int idx,
    const GLBMesh& mesh,
    int points_per_mesh,
    const std::vector<std::vector<uint8_t>>& textures,
    const std::vector<std::array<int,2>>& tex_sizes)
{
    SubMeshResult result;
    auto t = now_t();

    auto o3d_mesh = std::make_shared<open3d::geometry::TriangleMesh>();
    o3d_mesh->vertices_.resize(mesh.vertices.size());
    for (size_t i = 0; i < mesh.vertices.size(); ++i)
        o3d_mesh->vertices_[i] = {mesh.vertices[i][0], mesh.vertices[i][1], mesh.vertices[i][2]};
    o3d_mesh->triangles_.resize(mesh.faces.size());
    for (size_t i = 0; i < mesh.faces.size(); ++i)
        o3d_mesh->triangles_[i] = {mesh.faces[i][0], mesh.faces[i][1], mesh.faces[i][2]};

    auto pcd = o3d_mesh->SamplePointsUniformly(points_per_mesh);
    // std::cout << "  [" << idx << "] Sampling: " << elapsed(t) << "s  (" << pcd->points_.size() << " points)" << std::endl;

    t = now_t();
    std::vector<Triangle_3> triangles;
    triangles.reserve(mesh.faces.size());
    for (auto& f : mesh.faces) {
        auto& v0 = mesh.vertices[f[0]];
        auto& v1 = mesh.vertices[f[1]];
        auto& v2 = mesh.vertices[f[2]];
        triangles.push_back(Triangle_3(
            Point_3(v0[0], v0[1], v0[2]),
            Point_3(v1[0], v1[1], v1[2]),
            Point_3(v2[0], v2[1], v2[2])
        ));
    }
    Tree tree(triangles.begin(), triangles.end());
    tree.accelerate_distance_queries();
    // std::cout << "  [" << idx << "] AABB tree build: " << elapsed(t) << "s" << std::endl;

    t = now_t();
    int n = pcd->points_.size();
    result.points.resize(n);
    result.colors.resize(n);

    int tex_idx = (mesh.texture_index >= 0 && mesh.texture_index < (int)textures.size())
                  ? mesh.texture_index : 0;
    const auto& tex = textures[tex_idx];
    int tw = tex_sizes[tex_idx][0];
    int th = tex_sizes[tex_idx][1];
    int channels = (tw > 0 && th > 0) ? (int)tex.size() / (tw * th) : 4;

    #pragma omp parallel for schedule(dynamic, 1000)
    for (int i = 0; i < n; ++i) {
        auto& pt = pcd->points_[i];
        Point_3 query(pt[0], pt[1], pt[2]);
        auto closest = tree.closest_point_and_primitive(query);
        Point_3 cp = closest.first;
        auto tri_it = closest.second;
        int tri_id = (int)std::distance(triangles.begin(), tri_it);

        result.points[i] = {pt[0], pt[1], pt[2]};

        auto& f = mesh.faces[tri_id];
        auto& v0 = mesh.vertices[f[0]];
        auto& v1 = mesh.vertices[f[1]];
        auto& v2 = mesh.vertices[f[2]];
        Eigen::Vector3d e1 = {v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]};
        Eigen::Vector3d e2 = {v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]};
        Eigen::Vector3d ep = {cp.x()-v0[0], cp.y()-v0[1], cp.z()-v0[2]};
        double d11 = e1.dot(e1), d12 = e1.dot(e2), d22 = e2.dot(e2);
        double dp1 = ep.dot(e1), dp2 = ep.dot(e2);
        double denom = d11*d22 - d12*d12;
        double bv = (denom > 1e-10) ? (d22*dp1 - d12*dp2) / denom : 0.0;
        double bw = (denom > 1e-10) ? (d11*dp2 - d12*dp1) / denom : 0.0;
        double bu = 1.0 - bv - bw;

        auto& uv0 = mesh.uvs[f[0]];
        auto& uv1 = mesh.uvs[f[1]];
        auto& uv2 = mesh.uvs[f[2]];
        double u = std::clamp(bu*uv0[0] + bv*uv1[0] + bw*uv2[0], 0.0, 1.0);
        double v = std::clamp(bu*uv0[1] + bv*uv1[1] + bw*uv2[1], 0.0, 1.0);
        int px = std::clamp((int)(u * (tw - 1)), 0, tw - 1);
        int py = std::clamp((int)(v * (th - 1)), 0, th - 1);
        int offset = (py * tw + px) * channels;

        result.colors[i] = {
            tex[offset]   / 255.0,
            tex[offset+1] / 255.0,
            tex[offset+2] / 255.0
        };
    }
    // std::cout << "  [" << idx << "] Nearest + color (OpenMP): " << elapsed(t) << "s" << std::endl;
    return result;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <file.glb> [num_points]" << std::endl;
        return 1;
    }
    std::string mesh_path = argv[1];
    int num_points = (argc >= 3) ? std::stoi(argv[2]) : 5000000;

    auto global_start = now_t();

    std::vector<GLBMesh> meshes;
    std::vector<std::vector<uint8_t>> textures;
    std::vector<std::array<int,2>> tex_sizes;

    auto t = now_t();
    if (!load_glb(mesh_path, meshes, textures, tex_sizes)) return 1;
    std::cout << "Load GLB from " << mesh_path << "" << std::endl;
    std::cout << "Iterate " << meshes.size()
              << " submeshes, " << textures.size() << " textures" << std::endl;

    if (textures.empty()) {
        textures.push_back({128, 128, 128, 255});
        tex_sizes.push_back({1, 1});
    }

    int points_per_mesh = num_points / (int)meshes.size();
    int n_meshes = (int)meshes.size();
    std::vector<SubMeshResult> results(n_meshes);

    #pragma omp parallel for num_threads(n_meshes)
    for (int i = 0; i < n_meshes; ++i)
        results[i] = process_submesh(i, meshes[i], points_per_mesh, textures, tex_sizes);

    std::cout << "Merging submeshes into final point cloud" << std::endl;
    std::vector<std::array<double,3>> all_points, all_colors;
    for (auto& r : results) {
        all_points.insert(all_points.end(), r.points.begin(), r.points.end());
        all_colors.insert(all_colors.end(), r.colors.begin(), r.colors.end());
    }

    t = now_t();
    std::cout << "Computing normals" << std::endl;
    auto pcd_final = std::make_shared<open3d::geometry::PointCloud>();
    pcd_final->points_.resize(all_points.size());
    pcd_final->colors_.resize(all_colors.size());
    for (size_t i = 0; i < all_points.size(); ++i) {
        pcd_final->points_[i] = {all_points[i][0], all_points[i][1], all_points[i][2]};
        pcd_final->colors_[i] = {all_colors[i][0], all_colors[i][1], all_colors[i][2]};
    }
    pcd_final->EstimateNormals(open3d::geometry::KDTreeSearchParamHybrid(0.02, 30));
    pcd_final->OrientNormalsTowardsCameraLocation();
    // std::cout << "  Normals: " << elapsed(t) << "s" << std::endl;

    std::vector<std::array<double,3>> all_normals(all_points.size());
    for (size_t i = 0; i < all_points.size(); ++i)
        all_normals[i] = {pcd_final->normals_[i][0], pcd_final->normals_[i][1], pcd_final->normals_[i][2]};

    t = now_t();
    std::string out_file = mesh_path.substr(0, mesh_path.rfind(".glb")) + "_pc.las";
    write_las(out_file, all_points, all_colors, all_normals);
    // std::cout << "  Write LAS: " << elapsed(t) << "s" << std::endl;

    double total = elapsed(global_start);
    int mn = (int)(total / 60);
    int sc = (int)total % 60;
    std::cout << "Saved: " << out_file << " with " << all_points.size() << " points" << std::endl;
    if (mn > 0)
        std::cout << "Processing time: " << mn << " min " << sc << " sec" << std::endl;
    else
        std::cout << "Processing time: " << sc << " sec" << std::endl;

    std::cout << out_file << std::endl;
    return 0;
}