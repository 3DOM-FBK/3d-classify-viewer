/**
 * las_to_feature_bin.cpp
 *
 * Reads a LAS file (raw binary, no dependencies) and writes a compact
 * binary lookup file for the Babylon.js viewer.
 *
 * Usage:
 *   las_to_feature_bin <input.las> <output.bin>
 *
 * Compile:
 *   g++ -std=c++17 -O2 las_to_feature_bin.cpp -o las_to_feature_bin
 *
 * ─── Output binary format ────────────────────────────────────────────────────
 *
 *  [HEADER]
 *   4 bytes        magic   "FEAT"
 *   4 bytes        N       uint32  max(POINT_ID) + 1
 *   4 bytes        F       uint32  number of features
 *   F × 32 bytes   names   char[32] null-padded ASCII
 *   F × 4 bytes    vmin    float32 per feature
 *   F × 4 bytes    vmax    float32 per feature
 *
 *  [DATA]
 *   N × F × 4 bytes  float32
 *   data[point_id * F + fi] = feature value
 *   NaN = point not present (gap in POINT_ID space)
 */

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

namespace fs = std::filesystem;

// ─── LAS type helpers ─────────────────────────────────────────────────────────

static int lasTypeSize(uint8_t t) {
    switch(t) {
        case 1: case 2: return 1;
        case 3: case 4: return 2;
        case 5: case 6: return 4;
        case 7: case 8: return 8;
        case 9:         return 4;   // float32
        case 10:        return 8;   // float64
        default:        return 0;
    }
}

static const int kBaseSizes[] = {
    20, 28, 26, 34, 57, 63, 30, 36, 38, 59, 67
};

// ─── Structs ──────────────────────────────────────────────────────────────────

struct DimDef {
    std::string name;
    uint8_t     data_type;
    int         size;
    int         offset;   // byte offset within extra block (from base_size)
};

struct LasInfo {
    uint32_t            offset_to_data   = 0;
    uint16_t            point_record_len = 0;
    uint64_t            point_count      = 0;
    int                 base_size        = 0;
    std::vector<DimDef> dims;            // all VLR extra dims in order
};

// ─── Read LAS header + VLR ───────────────────────────────────────────────────

static LasInfo readLasInfo(const fs::path& path)
{
    LasInfo info;
    std::ifstream f(path, std::ios::binary);
    if (!f) throw std::runtime_error("Cannot open: " + path.string());

    uint8_t ver_major = 0, ver_minor = 0;
    f.seekg(24); f.read(reinterpret_cast<char*>(&ver_major), 1);
                 f.read(reinterpret_cast<char*>(&ver_minor), 1);
    bool isLas14 = (ver_major == 1 && ver_minor >= 4);

    uint16_t header_size = 0;
    uint32_t num_vlrs    = 0;
    uint8_t  point_fmt   = 0;

    f.seekg(94);  f.read(reinterpret_cast<char*>(&header_size),           2);
    f.seekg(96);  f.read(reinterpret_cast<char*>(&info.offset_to_data),   4);
    f.seekg(100); f.read(reinterpret_cast<char*>(&num_vlrs),              4);
    f.seekg(104); f.read(reinterpret_cast<char*>(&point_fmt),             1);
    point_fmt &= 0x0F;
    f.seekg(105); f.read(reinterpret_cast<char*>(&info.point_record_len), 2);

    if (isLas14) {
        f.seekg(247); f.read(reinterpret_cast<char*>(&info.point_count), 8);
    } else {
        uint32_t c = 0;
        f.seekg(107); f.read(reinterpret_cast<char*>(&c), 4);
        info.point_count = c;
    }

    info.base_size = (point_fmt <= 10) ? kBaseSizes[point_fmt] : 20;

    // Walk VLRs, find Extra Bytes record (LASF_Spec record_id=4)
    f.seekg(header_size);
    for (uint32_t v = 0; v < num_vlrs; ++v) {
        uint8_t hdr[54] = {};
        f.read(reinterpret_cast<char*>(hdr), 54);
        if (!f) break;

        char     user_id[17]  = {};
        uint16_t record_id    = 0;
        uint16_t record_len   = 0;
        std::memcpy(user_id,    hdr + 2,  16);
        std::memcpy(&record_id, hdr + 18, 2);
        std::memcpy(&record_len,hdr + 20, 2);

        if (std::string(user_id) == "LASF_Spec" && record_id == 4) {
            int n = record_len / 192;
            std::vector<uint8_t> data(record_len);
            f.read(reinterpret_cast<char*>(data.data()), record_len);

            int running_offset = 0;
            for (int i = 0; i < n; ++i) {
                const uint8_t* rec = data.data() + i * 192;
                uint8_t dtype = rec[2];
                char name_buf[33] = {};
                std::memcpy(name_buf, rec + 4, 32);
                int sz = lasTypeSize(dtype);
                if (sz > 0) {
                    info.dims.push_back({ std::string(name_buf), dtype, sz, running_offset });
                    running_offset += sz;
                }
            }
            break;
        } else {
            f.seekg(record_len, std::ios::cur);
        }
    }
    return info;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

static float    readFloat32(const uint8_t* p) { float    v; std::memcpy(&v, p, 4); return v; }
static uint32_t readUint32 (const uint8_t* p) { uint32_t v; std::memcpy(&v, p, 4); return v; }

static std::string cleanName(const std::string& s) {
    auto z = s.find('\0');
    return (z != std::string::npos) ? s.substr(0, z) : s;
}

static bool nameIsPointId(const std::string& s) {
    std::string lower = cleanName(s);
    std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
    return lower == "point_id" || lower == "pointid";
}

static bool nameIsExcluded(const std::string& s) {
    std::string lower = cleanName(s);
    std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
    return lower == "labels" || lower == "normalx" ||
           lower == "normaly" || lower == "normalz";
}

// ─── Main conversion ─────────────────────────────────────────────────────────

static void convert(const fs::path& las_path, const fs::path& out_path)
{
    std::cout << "Loading LAS: " << las_path << "\n";

    LasInfo info = readLasInfo(las_path);

    std::cout << "  Points        : " << info.point_count      << "\n";
    std::cout << "  Rec length    : " << info.point_record_len << "\n";
    std::cout << "  Base size     : " << info.base_size        << "\n";
    std::cout << "  VLR dims      : " << info.dims.size()      << "\n\n";

    // ── Classify VLR dims into POINT_ID and features ──────────────────────────
    int pid_offset = -1;

    struct FeatureDef {
        std::string name;
        int         offset;
    };
    std::vector<FeatureDef> features;

    for (auto& d : info.dims) {
        if (nameIsPointId(d.name)) {
            pid_offset = d.offset;
        } else if (!nameIsExcluded(d.name)) {
            features.push_back({ cleanName(d.name), d.offset });
        }
    }

    if (pid_offset < 0)
        throw std::runtime_error("POINT_ID not found in VLR.");
    if (features.empty())
        throw std::runtime_error("No feature dims found in VLR.");

    const uint32_t F = static_cast<uint32_t>(features.size());
    std::cout << "  POINT_ID at extra offset +" << pid_offset << "\n";
    std::cout << "  Features: " << F << "\n\n";

    // ── Load all points into memory ───────────────────────────────────────────
    std::ifstream f(las_path, std::ios::binary);
    if (!f) throw std::runtime_error("Cannot reopen: " + las_path.string());

    const uint64_t N_pts   = info.point_count;
    const int      rec_len = info.point_record_len;
    const int      base    = info.base_size;

    std::vector<uint8_t> raw(static_cast<size_t>(N_pts) * rec_len);
    f.seekg(info.offset_to_data);
    f.read(reinterpret_cast<char*>(raw.data()),
           static_cast<std::streamsize>(raw.size()));
    if (!f) throw std::runtime_error("Failed to read point data.");
    f.close();

    // ── First pass: find max POINT_ID ────────────────────────────────────────
    uint32_t maxPid = 0;
    for (uint64_t i = 0; i < N_pts; ++i) {
        uint32_t pid = readUint32(raw.data() + i * rec_len + base + pid_offset);
        if (pid > maxPid) maxPid = pid;
    }

    const uint32_t kMaxSane = static_cast<uint32_t>(N_pts) * 10u;
    if (maxPid > kMaxSane)
        throw std::runtime_error(
            "max POINT_ID=" + std::to_string(maxPid) + " looks wrong (>" +
            std::to_string(kMaxSane) + "). Check VLR layout.");

    const uint32_t N = maxPid + 1;
    std::cout << "  max POINT_ID : " << maxPid << "  →  N=" << N << "\n";

    // ── Allocate output array (NaN = no data) ─────────────────────────────────
    const size_t kMaxBytes  = size_t(2) * 1024 * 1024 * 1024;
    const size_t allocBytes = static_cast<size_t>(N) * F * 4;
    if (allocBytes > kMaxBytes)
        throw std::runtime_error(
            "Allocation too large: " + std::to_string(allocBytes / 1024 / 1024) + " MB");

    const float kNaN = std::numeric_limits<float>::quiet_NaN();
    std::vector<float> data(static_cast<size_t>(N) * F, kNaN);

    // ── Second pass: fill data array ─────────────────────────────────────────
    for (uint64_t i = 0; i < N_pts; ++i) {
        const uint8_t* rec = raw.data() + i * rec_len;
        uint32_t pid = readUint32(rec + base + pid_offset);
        if (pid >= N) continue;

        float* row = data.data() + static_cast<size_t>(pid) * F;
        for (uint32_t fi = 0; fi < F; ++fi)
            row[fi] = readFloat32(rec + base + features[fi].offset);
    }

    // ── Compute per-feature min/max ───────────────────────────────────────────
    std::vector<float> vmin(F,  std::numeric_limits<float>::max());
    std::vector<float> vmax(F, -std::numeric_limits<float>::max());

    for (size_t i = 0; i < N; ++i) {
        const float* row = data.data() + i * F;
        for (uint32_t fi = 0; fi < F; ++fi) {
            float v = row[fi];
            if (!std::isnan(v)) {
                if (v < vmin[fi]) vmin[fi] = v;
                if (v > vmax[fi]) vmax[fi] = v;
            }
        }
    }
    for (uint32_t fi = 0; fi < F; ++fi)
        if (vmin[fi] > vmax[fi]) { vmin[fi] = 0.f; vmax[fi] = 1.f; }

    // ── Write binary file ─────────────────────────────────────────────────────
    std::cout << "\nWriting: " << out_path << "\n";
    std::ofstream out(out_path, std::ios::binary);
    if (!out) throw std::runtime_error("Cannot write: " + out_path.string());

    // Header
    out.write("FEAT", 4);
    out.write(reinterpret_cast<const char*>(&N), 4);
    out.write(reinterpret_cast<const char*>(&F), 4);

    // Feature names (32 bytes each, null-padded)
    for (uint32_t fi = 0; fi < F; ++fi) {
        char buf[32] = {};
        std::memcpy(buf, features[fi].name.c_str(),
                    std::min(features[fi].name.size(), size_t(31)));
        out.write(buf, 32);
    }

    // vmin, vmax
    out.write(reinterpret_cast<const char*>(vmin.data()), F * 4);
    out.write(reinterpret_cast<const char*>(vmax.data()), F * 4);

    // Data
    out.write(reinterpret_cast<const char*>(data.data()),
              static_cast<std::streamsize>(data.size()) * 4);
    out.close();

    // ── Summary ───────────────────────────────────────────────────────────────
    const size_t total_bytes = 4 + 4 + 4 + F*32 + F*4 + F*4 + data.size()*4;
    std::cout << "  File size : " << (total_bytes / 1024 / 1024) << " MB\n\n";
    std::cout << std::left
              << std::setw(4)  << "Idx"
              << std::setw(32) << "Feature"
              << std::setw(14) << "Min"
              << "Max\n";
    std::cout << std::string(64, '-') << "\n";
    for (uint32_t fi = 0; fi < F; ++fi)
        std::cout << std::setw(4)  << fi
                  << std::setw(32) << features[fi].name
                  << std::setw(14) << vmin[fi]
                  << vmax[fi] << "\n";

    // Last line = output path (for Python caller)
    std::cout << "\n" << out_path.string() << "\n";
}

// ─────────────────────────────────────────────────────────────────────────────

int main(int argc, char* argv[])
{
    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <features.las> <output.bin>\n";
        return 1;
    }
    try {
        convert(argv[1], argv[2]);
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << "\n";
        return 1;
    }
    return 0;
}