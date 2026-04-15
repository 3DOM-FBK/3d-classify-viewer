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
 * Header (fixed, same layout for v1 and v2):
 *   [0-3]           magic: "PCBN"
 *   [4]             version: uint8  (1 = float32 features, 2 = uint8 features)
 *   [5]             bytes_per_feature (bpf): uint8  (4 for v1, 1 for v2)
 *   [6-7]           reserved: 2 bytes = 0
 *   [8-11]          point_count: uint32  (= max_point_id + 1, number of slots)
 *   [12-15]         feature_count: uint32  (= F)
 *   [16 .. +F*32]   feature_names: char[32] × F  (null-padded)
 *   [.. +F*4]       vmin: float32 × F
 *   [.. +F*4]       vmax: float32 × F
 *   Header size = 16 + F*40  (same for v1 and v2)
 *
 * Records (N records, one per POINT_ID slot, indexed positionally):
 *   v1: [0 .. F*4-1]  features: float32 × F  (NaN = no data / gap)
 *   v2: [0 .. F-1]    features: uint8 × F    (255 = no-data; 0-254 → vmin+val/254*(vmax-vmin))
 *   [F*bpf]           segment_id: uint8      (0xFF = unassigned)
 *   [F*bpf+1]         manual_class_id: uint8 (0xFF = unassigned)
 *   [F*bpf+2]         predicted_class_id: uint8 (0xFF = unassigned)
 *   [F*bpf+3]         padding: uint8 = 0
 *   [F*bpf+4..+7]     confidence: float32    (NaN = no prediction)
 *   v1 record size = F*4 + 8
 *   v2 record size = F   + 8   (~71% smaller for F=36)
 *
 * Default: v2 (uint8).  Pass --v1 to force legacy float32 output.
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

static void convert(const fs::path& las_path, const fs::path& out_path, bool use_v1 = false)
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

    const uint32_t F       = static_cast<uint32_t>(features.size());
    const uint8_t  version = use_v1 ? 1u : 2u;
    const uint8_t  bpf     = use_v1 ? 4u : 1u;   // bytes per feature in pcbin record

    std::cout << "  POINT_ID at extra offset +" << pid_offset << "\n";
    std::cout << "  Features: " << F << "  pcbin version: " << (int)version
              << "  bpf: " << (int)bpf << "\n\n";

    const uint64_t N_pts   = info.point_count;
    const int      rec_len = info.point_record_len;
    const int      base    = info.base_size;

    if (rec_len <= 0)
        throw std::runtime_error("Invalid point_record_len in LAS header.");

    // ── Pass 1: scan LAS — find max POINT_ID and per-feature min/max ──────────
    std::ifstream fscan(las_path, std::ios::binary);
    if (!fscan) throw std::runtime_error("Cannot reopen: " + las_path.string());
    fscan.seekg(info.offset_to_data);

    std::vector<uint8_t> rec(static_cast<size_t>(rec_len));
    std::vector<float> vmin(F,  std::numeric_limits<float>::max());
    std::vector<float> vmax(F, -std::numeric_limits<float>::max());
    uint32_t maxPid = 0;

    for (uint64_t i = 0; i < N_pts; ++i) {
        fscan.read(reinterpret_cast<char*>(rec.data()), rec_len);
        if (!fscan) throw std::runtime_error("Failed to read point data (scan pass).");
        const uint8_t* extra = rec.data() + base;
        const uint32_t pid  = readUint32(extra + pid_offset);
        if (pid > maxPid) maxPid = pid;
        for (uint32_t fi = 0; fi < F; ++fi) {
            const float v = readAnyAsFloat(extra + features[fi].offset, features[fi].data_type);
            if (!std::isnan(v)) {
                if (v < vmin[fi]) vmin[fi] = v;
                if (v > vmax[fi]) vmax[fi] = v;
            }
        }
    }
    fscan.close();

    // Any feature with no valid values → unit range
    for (uint32_t fi = 0; fi < F; ++fi)
        if (vmin[fi] > vmax[fi]) { vmin[fi] = 0.f; vmax[fi] = 1.f; }

    const uint32_t kMaxSane = static_cast<uint32_t>(N_pts) * 10u;
    if (maxPid > kMaxSane)
        throw std::runtime_error(
            "max POINT_ID=" + std::to_string(maxPid) + " looks wrong (>" +
            std::to_string(kMaxSane) + "). Check VLR layout.");

    const uint32_t N = maxPid + 1;
    std::cout << "  max POINT_ID : " << maxPid << "  ->  N=" << N << "\n";

    // ── Prepare output file (header + default records) ───────────────────────
    const uint64_t header_bytes = 16ull + static_cast<uint64_t>(F) * 40ull;
    const uint64_t record_bytes = static_cast<uint64_t>(F) * bpf + 8ull;
    const uint64_t total_bytes  = header_bytes + static_cast<uint64_t>(N) * record_bytes;

    std::cout << "\nWriting: " << out_path << "\n";
    std::cout << "  Streaming conversion (v" << (int)version
              << ", bpf=" << (int)bpf << ").\n";

    auto writeHeader = [&](std::ofstream& out) {
        // Header: [0-3] magic | [4] version | [5] bpf | [6-7] reserved | [8-11] N | [12-15] F
        const char    magic[4]   = {'P', 'C', 'B', 'N'};
        const uint8_t hdr_ver    = version;
        const uint8_t hdr_bpf    = bpf;
        const uint8_t hdr_pad[2] = {0, 0};
        out.write(magic, 4);
        out.write(reinterpret_cast<const char*>(&hdr_ver),  1);
        out.write(reinterpret_cast<const char*>(&hdr_bpf),  1);
        out.write(reinterpret_cast<const char*>(hdr_pad),   2);
        out.write(reinterpret_cast<const char*>(&N), 4);
        out.write(reinterpret_cast<const char*>(&F), 4);

        for (uint32_t fi = 0; fi < F; ++fi) {
            char name_buf[32] = {};
            const std::string& nm = features[fi].name;
            std::memcpy(name_buf, nm.data(), std::min(nm.size(), size_t(31)));
            out.write(name_buf, 32);
        }

        if (F > 0) {
            out.write(reinterpret_cast<const char*>(vmin.data()), static_cast<std::streamsize>(F * sizeof(float)));
            out.write(reinterpret_cast<const char*>(vmax.data()), static_cast<std::streamsize>(F * sizeof(float)));
        }
    };

    const float kConfNaN = std::numeric_limits<float>::quiet_NaN();

    if (use_v1) {
        std::ofstream out_init(out_path, std::ios::binary | std::ios::trunc);
        if (!out_init) throw std::runtime_error("Cannot write: " + out_path.string());
        writeHeader(out_init);

        // Default record: F×4 float NaN + annotation(0xFF,0xFF,0xFF,0x00) + conf(NaN)
        std::vector<uint8_t> default_rec(static_cast<size_t>(record_bytes), 0xFF);
        default_rec[static_cast<size_t>(F) * bpf + 3] = 0x00;
        std::memcpy(default_rec.data() + static_cast<size_t>(F) * bpf + 4, &kConfNaN, 4);
        const float kNaN = std::numeric_limits<float>::quiet_NaN();
        for (uint32_t fi = 0; fi < F; ++fi)
            std::memcpy(default_rec.data() + fi * 4, &kNaN, 4);

        const uint32_t chunk_records = 8192;
        std::vector<uint8_t> chunk;
        chunk.reserve(static_cast<size_t>(record_bytes) * chunk_records);
        for (uint32_t i = 0; i < chunk_records; ++i)
            chunk.insert(chunk.end(), default_rec.begin(), default_rec.end());

        uint32_t written = 0;
        while (written < N) {
            const uint32_t take  = std::min(chunk_records, N - written);
            const size_t   bytes = static_cast<size_t>(take) * static_cast<size_t>(record_bytes);
            out_init.write(reinterpret_cast<const char*>(chunk.data()), static_cast<std::streamsize>(bytes));
            if (!out_init) throw std::runtime_error("Failed to initialize .pcbin records.");
            written += take;
        }
        out_init.close();

        std::ifstream fin(las_path, std::ios::binary);
        if (!fin) throw std::runtime_error("Cannot reopen: " + las_path.string());
        fin.seekg(info.offset_to_data);

        std::fstream fout(out_path, std::ios::binary | std::ios::in | std::ios::out);
        if (!fout) throw std::runtime_error("Cannot open output for random write: " + out_path.string());

        std::vector<float> row(F);
        for (uint64_t i = 0; i < N_pts; ++i) {
            fin.read(reinterpret_cast<char*>(rec.data()), rec_len);
            if (!fin) throw std::runtime_error("Failed to read point data (write pass).");
            const uint8_t* extra = rec.data() + base;
            const uint32_t pid   = readUint32(extra + pid_offset);
            if (pid >= N) continue;
            for (uint32_t fi = 0; fi < F; ++fi)
                row[fi] = readAnyAsFloat(extra + features[fi].offset, features[fi].data_type);
            const uint64_t rec_off = header_bytes + static_cast<uint64_t>(pid) * record_bytes;
            fout.seekp(static_cast<std::streamoff>(rec_off));
            if (F > 0)
                fout.write(reinterpret_cast<const char*>(row.data()), static_cast<std::streamsize>(F * sizeof(float)));
            if (!fout) throw std::runtime_error("Failed writing feature row in .pcbin.");
        }
        fin.close();
        fout.close();
    } else {
        std::cout << "  PCBIN v2: quantized features (uint8) allocated, sequential I/O enabled.\n";

        const uint64_t feature_slots_u64 = static_cast<uint64_t>(N) * static_cast<uint64_t>(F);
        if (feature_slots_u64 > static_cast<uint64_t>(std::numeric_limits<size_t>::max())) {
            throw std::runtime_error("Quantized feature matrix too large for this platform.");
        }

        std::vector<uint8_t> feat_data(static_cast<size_t>(feature_slots_u64), 0xFF);

        std::ifstream fin(las_path, std::ios::binary);
        if (!fin) throw std::runtime_error("Cannot reopen: " + las_path.string());
        fin.seekg(info.offset_to_data);

        for (uint64_t i = 0; i < N_pts; ++i) {
            fin.read(reinterpret_cast<char*>(rec.data()), rec_len);
            if (!fin) throw std::runtime_error("Failed to read point data (quantize pass).");

            const uint8_t* extra = rec.data() + base;
            const uint32_t pid   = readUint32(extra + pid_offset);
            if (pid >= N) continue;

            const size_t feature_offset = static_cast<size_t>(pid) * static_cast<size_t>(F);
            for (uint32_t fi = 0; fi < F; ++fi) {
                const float v = readAnyAsFloat(extra + features[fi].offset, features[fi].data_type);
                if (std::isnan(v)) {
                    feat_data[feature_offset + fi] = 255u;
                } else {
                    const float range = vmax[fi] - vmin[fi];
                    float q = (range == 0.f) ? 127.f
                                             : (v - vmin[fi]) / range * 254.f;
                    if (q < 0.f)   q = 0.f;
                    if (q > 254.f) q = 254.f;
                    feat_data[feature_offset + fi] = static_cast<uint8_t>(q + 0.5f);
                }
            }
        }
        fin.close();

        std::ofstream out(out_path, std::ios::binary | std::ios::trunc);
        if (!out) throw std::runtime_error("Cannot write: " + out_path.string());
        writeHeader(out);

        std::vector<uint8_t> default_tail(8, 0xFF);
        default_tail[3] = 0x00;
        std::memcpy(default_tail.data() + 4, &kConfNaN, 4);

        const uint32_t chunk_records = 8192;
        std::vector<uint8_t> chunk(static_cast<size_t>(chunk_records) * static_cast<size_t>(record_bytes));

        uint32_t written = 0;
        while (written < N) {
            const uint32_t take = std::min(chunk_records, N - written);
            const size_t bytes = static_cast<size_t>(take) * static_cast<size_t>(record_bytes);

            for (size_t ridx = 0; ridx < static_cast<size_t>(take); ++ridx) {
                uint8_t* record_ptr = chunk.data() + ridx * static_cast<size_t>(record_bytes);
                if (F > 0) {
                    const size_t feature_offset = (static_cast<size_t>(written) + ridx) * static_cast<size_t>(F);
                    std::memcpy(record_ptr, feat_data.data() + feature_offset, static_cast<size_t>(F));
                }
                std::memcpy(record_ptr + static_cast<size_t>(F), default_tail.data(), default_tail.size());
            }

            out.write(reinterpret_cast<const char*>(chunk.data()), static_cast<std::streamsize>(bytes));
            if (!out) throw std::runtime_error("Failed writing sequential .pcbin records.");
            written += take;
        }
        out.close();
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    std::cout << "  .pcbin written successfully\n";
    std::cout << "  Point slots : " << N  << ", Features: " << F << "\n";
    std::cout << "  Header size : " << header_bytes << " bytes\n";
    std::cout << "  Record size : " << record_bytes << " bytes  (F\u00d7" << (int)bpf << " + 8)\n";
    std::cout << "  Total size  : " << (total_bytes / 1024 / 1024) << " MB\n\n";

    // Last line = output path (for Python caller)
    std::cout << "\n" << out_path.string() << "\n";
}

// ─────────────────────────────────────────────────────────────────────────────

int main(int argc, char* argv[])
{
    bool use_v1 = false;
    std::vector<std::string> args;
    for (int i = 1; i < argc; ++i) {
        if (std::string(argv[i]) == "--v1") use_v1 = true;
        else args.push_back(argv[i]);
    }
    if (args.size() < 2) {
        std::cerr << "Usage: " << argv[0] << " [--v1] <features.las> <output.pcbin>\n";
        return 1;
    }
    try {
        convert(args[0], args[1], use_v1);
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << "\n";
        return 1;
    }
    return 0;
}