#include <open3d/Open3D.h>
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <cmath>
#include <algorithm>
#include <cstring>

// ============================================================
// Read/Write helpers
// ============================================================
template<typename T>
void write_val(std::ofstream& f, T val) {
    f.write(reinterpret_cast<const char*>(&val), sizeof(T));
}
template<typename T>
T read_val(std::ifstream& f) {
    T val;
    f.read(reinterpret_cast<char*>(&val), sizeof(T));
    return val;
}
void skip(std::ifstream& f, int n) {
    f.seekg(n, std::ios::cur);
}
void write_str(std::ofstream& f, const char* s, int len) {
    std::vector<char> buf(len, 0);
    int slen = (int)strlen(s);
    memcpy(buf.data(), s, std::min(slen, len));
    f.write(buf.data(), len);
}

// ============================================================
// Extra Bytes Record: float (type=9) per normali
// ============================================================
void write_extra_bytes_record(std::ofstream& f, const char* name, const char* description) {
    write_val<uint8_t>(f, 0); write_val<uint8_t>(f, 0);
    write_val<uint8_t>(f, 9); write_val<uint8_t>(f, 0);
    write_str(f, name, 32);
    for (int i = 0; i < 4;  i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 72; i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 48; i++) write_val<uint8_t>(f, 0);
    write_str(f, description, 32);
}

// ============================================================
// Extra Bytes Record: uint32 (type=6) per POINT_ID
// ============================================================
void write_extra_bytes_record_uint32(std::ofstream& f, const char* name, const char* description) {
    write_val<uint8_t>(f, 0); write_val<uint8_t>(f, 0);
    write_val<uint8_t>(f, 6); write_val<uint8_t>(f, 0);
    write_str(f, name, 32);
    for (int i = 0; i < 4;  i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 72; i++) write_val<uint8_t>(f, 0);
    for (int i = 0; i < 48; i++) write_val<uint8_t>(f, 0);
    write_str(f, description, 32);
}

// ============================================================
// Struttura LAS con flag di presenza campi extra
// ============================================================
struct LasData {
    std::vector<Eigen::Vector3d> points;
    std::vector<Eigen::Vector3d> colors;
    std::vector<Eigen::Vector3d> normals;
    bool has_colors   = false;
    bool has_normals  = false;
    bool has_point_id = false;
    // Header info salvata per il write
    double scale_x = 0.0001, scale_y = 0.0001, scale_z = 0.0001;
    double off_x = 0.0, off_y = 0.0, off_z = 0.0;
    uint8_t  point_format = 3;
    uint16_t point_length = 0;
};

// ============================================================
// Parsing VLR per scoprire quali extra bytes ci sono
// ============================================================
struct ExtraByteInfo {
    bool has_normal_x  = false;
    bool has_normal_y  = false;
    bool has_normal_z  = false;
    bool has_point_id  = false;
    int  normal_x_off  = -1;
    int  normal_y_off  = -1;
    int  normal_z_off  = -1;
    int  point_id_off  = -1;
};

ExtraByteInfo parse_extra_bytes_vlr(std::ifstream& f,
                                    uint32_t offset_to_data,
                                    uint16_t header_size,
                                    uint32_t num_vlrs,
                                    uint16_t point_length)
{
    ExtraByteInfo info;
    const int BASE_POINT_SIZE = 34;
    int extra_size = (int)point_length - BASE_POINT_SIZE;

    f.seekg(header_size);
    for (uint32_t v = 0; v < num_vlrs; ++v) {
        uint16_t reserved   = read_val<uint16_t>(f);
        (void)reserved;
        char user_id[16];   f.read(user_id, 16);
        uint16_t record_id  = read_val<uint16_t>(f);
        uint16_t vlr_length = read_val<uint16_t>(f);
        char description[32]; f.read(description, 32);

        std::string uid(user_id, 16);
        if (record_id == 4 && uid.find("LASF_Spec") != std::string::npos) {
            int num_records = vlr_length / 192;
            int current_offset = 0;
            for (int r = 0; r < num_records; ++r) {
                uint8_t res0 = read_val<uint8_t>(f);
                uint8_t res1 = read_val<uint8_t>(f);
                (void)res0; (void)res1;
                uint8_t data_type = read_val<uint8_t>(f);
                uint8_t options   = read_val<uint8_t>(f);
                (void)options;
                char name[33] = {};
                f.read(name, 32);
                char rest[156]; f.read(rest, 156);

                std::string field_name(name);
                int field_size = 0;
                if (data_type == 9) field_size = 4; // float
                if (data_type == 6) field_size = 4; // uint32

                if (field_name == "NormalX") {
                    info.has_normal_x = true;
                    info.normal_x_off = current_offset;
                } else if (field_name == "NormalY") {
                    info.has_normal_y = true;
                    info.normal_y_off = current_offset;
                } else if (field_name == "NormalZ") {
                    info.has_normal_z = true;
                    info.normal_z_off = current_offset;
                } else if (field_name == "POINT_ID") {
                    info.has_point_id = true;
                    info.point_id_off = current_offset;
                }
                current_offset += field_size;
            }
        } else {
            f.seekg(vlr_length, std::ios::cur);
        }
    }
    return info;
}

// ============================================================
// read_las — rileva POINT_ID e normali dai VLR
//            con rilevamento automatico scala colori (8 vs 16 bit)
// ============================================================
LasData read_las(const std::string& path) {
    LasData data;
    std::ifstream f(path, std::ios::binary);
    if (!f) throw std::runtime_error("Cannot open: " + path);

    // --- Header ---
    char sig[4]; f.read(sig, 4);
    if (std::string(sig, 4) != "LASF")
        throw std::runtime_error("Not a valid LAS file: " + path);

    skip(f, 2); skip(f, 2);
    skip(f, 4); skip(f, 2); skip(f, 2); skip(f, 8);
    skip(f, 1); skip(f, 1);
    skip(f, 32); skip(f, 32);
    skip(f, 2); skip(f, 2);

    uint16_t header_size    = read_val<uint16_t>(f);
    uint32_t offset_to_data = read_val<uint32_t>(f);
    uint32_t num_vlrs       = read_val<uint32_t>(f);
    uint8_t  point_format   = read_val<uint8_t>(f);
    uint16_t point_length   = read_val<uint16_t>(f);
    uint32_t num_points     = read_val<uint32_t>(f);
    skip(f, 20);

    double scale_x = read_val<double>(f);
    double scale_y = read_val<double>(f);
    double scale_z = read_val<double>(f);
    double off_x   = read_val<double>(f);
    double off_y   = read_val<double>(f);
    double off_z   = read_val<double>(f);
    skip(f, 48);

    data.scale_x = scale_x; data.scale_y = scale_y; data.scale_z = scale_z;
    data.off_x   = off_x;   data.off_y   = off_y;   data.off_z   = off_z;
    data.point_format = point_format;
    data.point_length = point_length;

    // --- Analisi VLR per extra bytes ---
    ExtraByteInfo eb = parse_extra_bytes_vlr(f, offset_to_data, header_size, num_vlrs, point_length);
    data.has_normals  = eb.has_normal_x && eb.has_normal_y && eb.has_normal_z;
    data.has_point_id = eb.has_point_id;
    data.has_colors   = true; // Format 3 ha sempre RGB

    int extra_size = (int)point_length - 34;

    std::cout << "  LAS: " << num_points << " points"
              << "  format=" << (int)point_format
              << "  point_length=" << point_length
              << "  extra=" << extra_size
              << "  has_normals=" << data.has_normals
              << "  has_point_id=" << data.has_point_id
              << std::endl;

    // --- Lettura point records ---
    f.seekg(offset_to_data);
    data.points.resize(num_points);
    data.colors.resize(num_points);
    if (data.has_normals) data.normals.resize(num_points, {0, 0, 0});

    for (uint32_t i = 0; i < num_points; ++i) {
        // XYZ
        int32_t ix = read_val<int32_t>(f);
        int32_t iy = read_val<int32_t>(f);
        int32_t iz = read_val<int32_t>(f);
        data.points[i] = {
            ix * scale_x + off_x,
            iy * scale_y + off_y,
            iz * scale_z + off_z
        };

        skip(f, 2); // intensity
        skip(f, 1); // return bits
        skip(f, 1); // classification
        skip(f, 1); // scan angle
        skip(f, 1); // user data
        skip(f, 2); // point source ID
        skip(f, 8); // GPS time

        // RGB uint16 → [0,1]
        uint16_t r = read_val<uint16_t>(f);
        uint16_t g = read_val<uint16_t>(f);
        uint16_t b = read_val<uint16_t>(f);
        data.colors[i] = { r / 65535.0, g / 65535.0, b / 65535.0 };
        

        // Extra bytes
        if (extra_size > 0) {
            std::vector<char> extra(extra_size);
            f.read(extra.data(), extra_size);
            if (data.has_normals) {
                float nx, ny, nz;
                memcpy(&nx, extra.data() + eb.normal_x_off, 4);
                memcpy(&ny, extra.data() + eb.normal_y_off, 4);
                memcpy(&nz, extra.data() + eb.normal_z_off, 4);
                data.normals[i] = { (double)nx, (double)ny, (double)nz };
            }
            // POINT_ID ignorato in lettura (viene ricalcolato in scrittura)
        }
    }

    f.close();
    return data;
}

// ============================================================
// write_las — scrive sempre normali + POINT_ID
//             i colori vengono sempre salvati a 16 bit (0-65535)
// ============================================================
void write_las(const std::string& out_file,
               const LasData& data)
{
    std::ofstream f(out_file, std::ios::binary);
    if (!f) { std::cerr << "Cannot open output: " << out_file << std::endl; return; }

    const auto& points  = data.points;
    const auto& colors  = data.colors;
    const auto& normals = data.normals;
    bool has_normals    = data.has_normals;
    uint32_t n = (uint32_t)points.size();

    double min_x = 1e18, min_y = 1e18, min_z = 1e18;
    double max_x = -1e18, max_y = -1e18, max_z = -1e18;
    for (auto& p : points) {
        min_x = std::min(min_x, p[0]); max_x = std::max(max_x, p[0]);
        min_y = std::min(min_y, p[1]); max_y = std::max(max_y, p[1]);
        min_z = std::min(min_z, p[2]); max_z = std::max(max_z, p[2]);
    }

    double scale_xyz = (data.scale_x != 0.0) ? data.scale_x : 0.0001;

    // extra bytes VLR: normali (se presenti) + POINT_ID
    uint32_t extra_bytes_payload = 0;
    if (has_normals) extra_bytes_payload += 3 * 192; // NormalX/Y/Z
    extra_bytes_payload += 192;                       // POINT_ID

    uint16_t header_size    = 227;
    uint32_t vlr_total      = 54 + extra_bytes_payload;
    uint32_t offset_to_data = header_size + vlr_total;

    uint16_t point_data_length = 34;
    if (has_normals) point_data_length += 12; // 3 x float
    point_data_length += 4;                   // uint32 POINT_ID

    // ---- Header LAS ----
    write_str(f, "LASF", 4);
    write_val<uint16_t>(f, 0); write_val<uint16_t>(f, 0);
    write_val<uint32_t>(f, 0); write_val<uint16_t>(f, 0); write_val<uint16_t>(f, 0);
    for (int i = 0; i < 8; i++) write_val<uint8_t>(f, 0);
    write_val<uint8_t>(f, 1); write_val<uint8_t>(f, 2);
    write_str(f, "OTHER", 32);
    write_str(f, "check_point_id", 32);
    write_val<uint16_t>(f, 0); write_val<uint16_t>(f, 0);
    write_val<uint16_t>(f, header_size);
    write_val<uint32_t>(f, offset_to_data);
    write_val<uint32_t>(f, 1);     // num_vlrs
    write_val<uint8_t>(f, 3);      // point format
    write_val<uint16_t>(f, point_data_length);
    write_val<uint32_t>(f, n);     // Number of point records
    write_val<uint32_t>(f, n);     // Points by return[0]
    for (int i = 0; i < 4; i++) write_val<uint32_t>(f, 0); // Points by return[1-4]
    write_val<double>(f, scale_xyz); write_val<double>(f, scale_xyz); write_val<double>(f, scale_xyz);
    write_val<double>(f, 0.0); write_val<double>(f, 0.0); write_val<double>(f, 0.0);
    write_val<double>(f, max_x); write_val<double>(f, min_x);
    write_val<double>(f, max_y); write_val<double>(f, min_y);
    write_val<double>(f, max_z); write_val<double>(f, min_z);

    // ---- VLR: normali (se presenti) + POINT_ID ----
    write_val<uint16_t>(f, 0);
    write_str(f, "LASF_Spec", 16);
    write_val<uint16_t>(f, 4);
    write_val<uint16_t>(f, (uint16_t)extra_bytes_payload);
    write_str(f, "Extra Bytes Record", 32);

    if (has_normals) {
        write_extra_bytes_record(f, "NormalX", "Normal X");
        write_extra_bytes_record(f, "NormalY", "Normal Y");
        write_extra_bytes_record(f, "NormalZ", "Normal Z");
    }
    write_extra_bytes_record_uint32(f, "POINT_ID", "Point ID");

    // ---- Point records ----
    for (uint32_t i = 0; i < n; ++i) {
        // 1. COORDINATE (12 byte totali)
        write_val<int32_t>(f, (int32_t)std::round(points[i][0] / scale_xyz)); // X
        write_val<int32_t>(f, (int32_t)std::round(points[i][1] / scale_xyz)); // Y
        write_val<int32_t>(f, (int32_t)std::round(points[i][2] / scale_xyz)); // Z

        // 2. ATTRIBUTI STANDARD (8 byte totali)
        write_val<uint16_t>(f, 0); // Intensity (2 byte)
        write_val<uint8_t>(f, 0);  // Return Number & Number of Returns (1 byte)
        write_val<uint8_t>(f, 0);  // Classification (1 byte)
        write_val<uint8_t>(f, 0);  // Scan Angle Rank (1 byte)
        write_val<uint8_t>(f, 0);  // User Data (1 byte)
        write_val<uint16_t>(f, 0); // Point Source ID (2 byte)

        // 3. GPS TIME (8 byte totali) - OBBLIGATORIO nel formato 3
        // Se salti questo, il Rosso e il Verde leggeranno questi 8 byte!
        write_val<double>(f, 0.0); 

        // 4. COLORI RGB (6 byte totali)
        // Devono essere uint16 (0-65535)
        uint16_t r = (uint16_t)(std::clamp(colors[i][0], 0.0, 1.0) * 65535);
        uint16_t g = (uint16_t)(std::clamp(colors[i][1], 0.0, 1.0) * 65535);
        uint16_t b = (uint16_t)(std::clamp(colors[i][2], 0.0, 1.0) * 65535);
        write_val<uint16_t>(f, r);
        write_val<uint16_t>(f, g);
        write_val<uint16_t>(f, b);

        // --- Totale fin qui: 34 byte (Record Format 3 Standard) ---

        // 5. EXTRA BYTES (Normali + ID)
        if (has_normals) {
            write_val<float>(f, (float)normals[i][0]); // 4 byte
            write_val<float>(f, (float)normals[i][1]); // 4 byte
            write_val<float>(f, (float)normals[i][2]); // 4 byte
        }
        write_val<uint32_t>(f, i); // POINT_ID (4 byte)
    }
    f.close();
}

// ============================================================
// check_and_fix: restituisce il path del file valido
//   - se tutto c'è già → restituisce input_path (no I/O)
//   - altrimenti → scrive output_path e restituisce output_path
// ============================================================
std::string check_and_fix(const std::string& input_path,
                           const std::string& output_path)
{
    std::cout << "Reading: " << input_path << std::endl;
    LasData data = read_las(input_path);

    bool needs_normals  = !data.has_normals;
    bool needs_point_id = !data.has_point_id;

    if (!needs_normals && !needs_point_id) {
        std::cout << "Normals and POINT_ID already present. No modification needed." << std::endl;
        return input_path;
    }

    // --- Aggiungi normali se mancanti ---
    if (needs_normals) {
        std::cout << "Computing Normals..." << std::endl;
        auto pcd = std::make_shared<open3d::geometry::PointCloud>();
        pcd->points_ = data.points;
        pcd->EstimateNormals(open3d::geometry::KDTreeSearchParamHybrid(0.02, 30));
        pcd->OrientNormalsTowardsCameraLocation();
        data.normals.resize(data.points.size(), {0, 0, 0});
        for (size_t i = 0; i < pcd->normals_.size(); ++i) {
            auto& n = pcd->normals_[i];
            data.normals[i] = (std::isnan(n[0]) || std::isnan(n[1]) || std::isnan(n[2]))
                              ? Eigen::Vector3d(0, 0, 0) : n;
        }
        data.has_normals = true;
    }

    if (needs_point_id) {
        std::cout << "Adding POINT_ID..." << std::endl;
        data.has_point_id = true;
    }

    std::cout << "Saving..." << std::endl;
    write_las(output_path, data);
    return output_path;
}

// ============================================================
// main
// ============================================================
int main(int argc, char* argv[]) {
    try {
        if (argc < 3) {
            std::cerr << "Usage: " << argv[0] << " <input.las> <output.las>" << std::endl;
            return 1;
        }
        std::string input_path  = argv[1];
        std::string output_path = argv[2];
        std::string result = check_and_fix(input_path, output_path);
        std::cout << "Output: " << result << std::endl;
        return 0;
    }
    catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << std::endl;
        return 2;
    }
}