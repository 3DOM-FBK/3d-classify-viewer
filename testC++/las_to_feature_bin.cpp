/**
 * las_to_feature_bin.cpp
 *
 * Reads a LAS file and writes features + annotation slots to a unified binary
 * store (.pcbin) for the Babylon.js viewer.
 *
 * Usage:
 *   las_to_feature_bin <input.las> <output.pcbin>
 *
 * Compile:
 *   g++ -std=c++17 -O2 las_to_feature_bin.cpp -o las_to_feature_bin
 *
 * ─── .pcbin binary format ────────────────────────────────────────────────────
 *
 * Header (fixed):
 *   [0-3]           magic: "PCBN"
 *   [4]             version: uint8 = 1
 *   [5-7]           reserved: 3 bytes = 0
 *   [8-11]          point_count: uint32  (= max_point_id + 1, number of slots)
 *   [12-15]         feature_count: uint32  (= F)
 *   [16 .. +F*32]   feature_names: char[32] × F  (null-padded)
 *   [.. +F*4]       vmin: float32 × F
 *   [.. +F*4]       vmax: float32 × F
 *   Header size = 16 + F*40
 *
 * Records (N records, one per POINT_ID slot, indexed positionally):
 *   [0 .. F*4-1]    features: float32 × F  (NaN = no data / gap)
 *   [F*4]           segment_id: uint8      (0xFF = unassigned)
 *   [F*4+1]         manual_class_id: uint8 (0xFF = unassigned)
 *   [F*4+2]         predicted_class_id: uint8 (0xFF = unassigned)
 *   [F*4+3]         padding: uint8 = 0
 *   [F*4+4..F*4+7]  confidence: float32    (NaN = no prediction)
 *   Record size = F*4 + 8
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

static uint32_t readUint32(const uint8_t* p) { uint32_t v; std::memcpy(&v, p, 4); return v; }

static float readAnyAsFloat(const uint8_t* p, uint8_t type) {
    switch (type) {
        case 1:  return (float)(*p);                                     // uint8
        case 2:  return (float)(*reinterpret_cast<const int8_t*>(p));    // int8
        case 3:  return (float)(*reinterpret_cast<const uint16_t*>(p));  // uint16
        case 4:  return (float)(*reinterpret_cast<const int16_t*>(p));   // int16
        case 5:  return (float)(*reinterpret_cast<const uint32_t*>(p));  // uint32
        case 6:  return (float)(*reinterpret_cast<const int32_t*>(p));   // int32
        case 9:  { float v; std::memcpy(&v, p, 4); return v; }           // float32
        case 10: { double v; std::memcpy(&v, p, 8); return (float)v; }   // float64
        default: return 0.0f;
    }
}

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
        uint8_t     data_type;
        int         offset;
    };
    std::vector<FeatureDef> features;

    for (auto& d : info.dims) {
        if (nameIsPointId(d.name)) {
            pid_offset = d.offset;
        } else if (!nameIsExcluded(d.name)) {
            features.push_back({ cleanName(d.name), d.data_type, d.offset });
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
            row[fi] = readAnyAsFloat(rec + base + features[fi].offset, features[fi].data_type);
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

    // ── Write .pcbin binary file ─────────────────────────────────────────────
    std::cout << "\nWriting: " << out_path << "\n";

    std::ofstream out(out_path, std::ios::binary);
    if (!out) throw std::runtime_error("Cannot write: " + out_path.string());

    // ── Header ────────────────────────────────────────────────────────────────
    // magic "PCBN"
    const char magic[4] = {'P', 'C', 'B', 'N'};
    out.write(magic, 4);

    // version (uint8) + 3 reserved bytes
    uint8_t version = 1;
    uint8_t reserved[3] = {0, 0, 0};
    out.write(reinterpret_cast<const char*>(&version), 1);
    out.write(reinterpret_cast<const char*>(reserved), 3);

    // point_count (uint32) — number of slots (= max_pid + 1)
    out.write(reinterpret_cast<const char*>(&N), 4);

    // feature_count (uint32)
    out.write(reinterpret_cast<const char*>(&F), 4);

    // feature_names: F × 32 bytes, null-padded
    for (uint32_t fi = 0; fi < F; ++fi) {
        char name_buf[32] = {};
        const std::string& nm = features[fi].name;
        std::memcpy(name_buf, nm.data(), std::min(nm.size(), size_t(31)));
        out.write(name_buf, 32);
    }

    // vmin: F × float32
    out.write(reinterpret_cast<const char*>(vmin.data()), F * 4);

    // vmax: F × float32
    out.write(reinterpret_cast<const char*>(vmax.data()), F * 4);

    // ── Records: one per point_id slot ────────────────────────────────────────
    // Record layout (F*4 + 8 bytes each):
    //   features[F]          float32 × F  (NaN = no data)
    //   segment_id           uint8        (0xFF = unassigned)
    //   manual_class_id      uint8        (0xFF = unassigned)
    //   predicted_class_id   uint8        (0xFF = unassigned)
    //   padding              uint8 = 0
    //   confidence           float32      (NaN = no prediction)

    const float kConfNaN = std::numeric_limits<float>::quiet_NaN();
    const uint8_t kUnassigned = 0xFF;
    const uint8_t kPadding    = 0x00;

    for (size_t pid = 0; pid < N; ++pid) {
        // features
        const float* row = data.data() + pid * F;
        out.write(reinterpret_cast<const char*>(row), F * 4);
        // annotation bytes
        out.write(reinterpret_cast<const char*>(&kUnassigned), 1);  // segment_id
        out.write(reinterpret_cast<const char*>(&kUnassigned), 1);  // manual_class_id
        out.write(reinterpret_cast<const char*>(&kUnassigned), 1);  // predicted_class_id
        out.write(reinterpret_cast<const char*>(&kPadding),    1);  // padding
        out.write(reinterpret_cast<const char*>(&kConfNaN),    4);  // confidence
    }

    out.close();

    // ── Summary ───────────────────────────────────────────────────────────────
    const size_t header_bytes = 16 + static_cast<size_t>(F) * 40;
    const size_t record_bytes = static_cast<size_t>(F) * 4 + 8;
    const size_t total_bytes  = header_bytes + static_cast<size_t>(N) * record_bytes;
    std::cout << "  .pcbin written successfully\n";
    std::cout << "  Point slots : " << N  << ", Features: " << F << "\n";
    std::cout << "  Header size : " << header_bytes << " bytes\n";
    std::cout << "  Record size : " << record_bytes << " bytes  (F×4 + 8)\n";
    std::cout << "  Total size  : " << (total_bytes / 1024 / 1024) << " MB\n\n";

    // Last line = output path (for Python caller)
    std::cout << "\n" << out_path.string() << "\n";
}

// ─────────────────────────────────────────────────────────────────────────────

int main(int argc, char* argv[])
{
    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <features.las> <output.pcbin>\n";
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