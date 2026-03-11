/**
 * las_to_feature_bin.cpp
 *
 * Reads a LAS file with extra dims (features + POINT_ID) and writes a compact
 * binary file for fast per-point feature lookup in the Babylon.js viewer.
 *
 * Usage:
 *   las_to_feature_bin <features.las> <output.bin>
 *
 * ─── Output binary format ────────────────────────────────────────────────────
 *
 *  [HEADER]
 *   4 bytes   magic          "FEAT"  (0x54 0x41 0x45 0x46 — little-endian)
 *   4 bytes   N              uint32  — array size = max(POINT_ID) + 1
 *   4 bytes   F              uint32  — number of features
 *   F × 32 bytes  names      char[32] each, null-padded ASCII
 *   F × 4 bytes   vmin       float32 per feature (global min, NaN excluded)
 *   F × 4 bytes   vmax       float32 per feature (global max, NaN excluded)
 *
 *  [DATA]
 *   N × F × 4 bytes  float32
 *   data[point_id * F + feature_idx] = value for that point/feature
 *   NaN = point not present in LAS (gap in POINT_ID space)
 *
 * ─── Notes ───────────────────────────────────────────────────────────────────
 *  - Extra dim names are read from the Extra Bytes VLR directly (binary),
 *    bypassing PDAL's broken UTF-8 parsing of non-ASCII VLR names.
 *  - Standard LAS dims (X, Y, Z, Intensity, Classification, etc.) and
 *    POINT_ID itself are excluded from the feature list.
 *  - The "labels" dim added by split_las_by_binary is also excluded.
 */

#include <pdal/PointTable.hpp>
#include <pdal/PointView.hpp>
#include <pdal/io/LasReader.hpp>
#include <pdal/Options.hpp>
#include <pdal/Dimension.hpp>

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <limits>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>

namespace fs = std::filesystem;

// ─────────────────────────────────────────────────────────────────────────────
//  Extra Bytes VLR parser (same as split_las_by_binary)
// ─────────────────────────────────────────────────────────────────────────────

struct ExtraBytesEntry {
    std::string           name;
    pdal::Dimension::Type type;
};

static pdal::Dimension::Type lasTypeToPdal(uint8_t data_type)
{
    switch (data_type) {
        case  1: return pdal::Dimension::Type::Unsigned8;
        case  2: return pdal::Dimension::Type::Signed8;
        case  3: return pdal::Dimension::Type::Unsigned16;
        case  4: return pdal::Dimension::Type::Signed16;
        case  5: return pdal::Dimension::Type::Unsigned32;
        case  6: return pdal::Dimension::Type::Signed32;
        case  7: return pdal::Dimension::Type::Unsigned64;
        case  8: return pdal::Dimension::Type::Signed64;
        case  9: return pdal::Dimension::Type::Float;
        case 10: return pdal::Dimension::Type::Double;
        default: return pdal::Dimension::Type::None;
    }
}

static std::vector<ExtraBytesEntry> readExtraBytesVLR(const fs::path& las_path)
{
    std::vector<ExtraBytesEntry> result;

    std::ifstream f(las_path, std::ios::binary);
    if (!f) throw std::runtime_error("Cannot open LAS: " + las_path.string());

    uint32_t num_vlrs;
    f.seekg(100); f.read(reinterpret_cast<char*>(&num_vlrs), 4);

    uint16_t hdr_size;
    f.seekg(94); f.read(reinterpret_cast<char*>(&hdr_size), 2);

    f.seekg(hdr_size);

    for (uint32_t v = 0; v < num_vlrs; ++v) {
        uint8_t vlr_header[54];
        f.read(reinterpret_cast<char*>(vlr_header), 54);
        if (!f) break;

        char user_id[17] = {};
        std::memcpy(user_id, vlr_header + 2, 16);

        uint16_t record_id, record_length;
        std::memcpy(&record_id,     vlr_header + 18, 2);
        std::memcpy(&record_length, vlr_header + 20, 2);

        if (std::string(user_id) == "LASF_Spec" && record_id == 4) {
            int num_extra = record_length / 192;
            std::vector<uint8_t> data(record_length);
            f.read(reinterpret_cast<char*>(data.data()), record_length);

            for (int i = 0; i < num_extra; ++i) {
                const uint8_t* rec = data.data() + i * 192;
                uint8_t data_type = rec[2];
                char name_buf[33] = {};
                std::memcpy(name_buf, rec + 4, 32);

                pdal::Dimension::Type t = lasTypeToPdal(data_type);
                if (t != pdal::Dimension::Type::None) {
                    result.push_back({ std::string(name_buf), t });
                }
            }
        } else {
            f.seekg(record_length, std::ios::cur);
        }
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Dims to exclude from the feature list
// ─────────────────────────────────────────────────────────────────────────────

static const std::set<std::string> kExcluded = {
    // Standard LAS dims
    "X","Y","Z","Intensity","ReturnNumber","NumberOfReturns",
    "ScanDirectionFlag","EdgeOfFlightLine","Classification",
    "ScanAngleRank","UserData","PointSourceId",
    "GpsTime","Red","Green","Blue",
    "ScannerChannel","ScanChannel","ClassificationFlags","ScanAngle",
    "NormalX","NormalY","NormalZ","Synthetic","KeyPoint","Withheld","Overlap",
    // Our custom dims
    "POINT_ID","point_id","labels"
};

static bool isExcluded(const std::string& name)
{
    if (kExcluded.count(name)) return true;
    // Case-insensitive check for point_id variants
    std::string lower = name;
    std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
    return lower == "point_id" || lower == "pointid" || lower == "labels";
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main conversion
// ─────────────────────────────────────────────────────────────────────────────

static void convert(const fs::path& las_path, const fs::path& out_path)
{
    // ── 1. Read extra dim names from VLR ─────────────────────────────────────
    auto vlrExtras = readExtraBytesVLR(las_path);

    // Build feature list (ordered, excluding standard/POINT_ID dims)
    struct FeatureInfo {
        std::string           name;
        pdal::Dimension::Id   pdal_id;   // filled after PDAL read
    };
    std::vector<FeatureInfo> features;

    // First pass: collect names from VLR that are not excluded
    for (auto& e : vlrExtras) {
        if (!isExcluded(e.name))
            features.push_back({ e.name, pdal::Dimension::Id::Unknown });
    }

    if (features.empty())
        throw std::runtime_error("No feature dims found in LAS. Run feature extraction first.");

    const uint32_t F = static_cast<uint32_t>(features.size());

    // ── 2. Read LAS with PDAL ─────────────────────────────────────────────────
    std::cout << "Loading LAS: " << las_path << "\n";

    pdal::PointTable table;
    pdal::LasReader  reader;
    {
        pdal::Options opts;
        opts.add("filename", las_path.string());
        reader.setOptions(opts);
        reader.prepare(table);
    }
    pdal::PointViewPtr view = *reader.execute(table).begin();

    const size_t nPoints = view->size();
    std::cout << "  Points: " << nPoints << "\n";
    std::cout << "  Features: " << F << "\n";

    // ── 3. Find POINT_ID dim in PDAL view ─────────────────────────────────────
    pdal::Dimension::Id dimPointId = pdal::Dimension::Id::Unknown;
    for (const auto& dimId : view->dims()) {
        std::string dname = pdal::Dimension::name(dimId);
        std::string lower = dname;
        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        if (lower == "point_id" || lower == "pointid") {
            dimPointId = dimId;
            break;
        }
    }

    // ── 4. Match feature names (from VLR) to PDAL dim IDs ────────────────────
    // PDAL may have empty names for non-UTF8 dims, so we match positionally:
    // collect PDAL extra dim IDs in the same order as VLR entries
    std::vector<pdal::Dimension::Id> pdal_extra_ids;
    for (const auto& dimId : view->dims()) {
        std::string dname = pdal::Dimension::name(dimId);
        if (kExcluded.count(dname)) continue;
        std::string lower = dname;
        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        if (lower == "point_id" || lower == "pointid" || lower == "labels") continue;
        pdal_extra_ids.push_back(dimId);
    }

    // vlrExtras (non-excluded) → pdal_extra_ids should align positionally
    // Build mapping: feature index → pdal dim id
    std::vector<pdal::Dimension::Id> feat_dim_ids(F, pdal::Dimension::Id::Unknown);
    {
        size_t vlr_feat_idx = 0;  // index into vlrExtras non-excluded entries
        size_t pdal_idx = 0;
        for (size_t vi = 0; vi < vlrExtras.size() && pdal_idx < pdal_extra_ids.size(); ++vi) {
            if (isExcluded(vlrExtras[vi].name)) continue;
            feat_dim_ids[vlr_feat_idx] = pdal_extra_ids[pdal_idx];
            ++vlr_feat_idx;
            ++pdal_idx;
        }
    }

    // ── 5. First pass: find max POINT_ID ─────────────────────────────────────
    uint32_t maxPointId = 0;
    if (dimPointId != pdal::Dimension::Id::Unknown) {
        for (pdal::PointId i = 0; i < static_cast<pdal::PointId>(nPoints); ++i) {
            uint32_t pid = view->getFieldAs<uint32_t>(dimPointId, i);
            if (pid > maxPointId) maxPointId = pid;
        }
    } else {
        // No POINT_ID: use sequential index
        maxPointId = static_cast<uint32_t>(nPoints) - 1;
        std::cerr << "WARNING: POINT_ID not found, using sequential index.\n";
    }

    const uint32_t N = maxPointId + 1;
    std::cout << "  Array size N (max POINT_ID + 1): " << N << "\n";

    // ── 6. Allocate output array and fill with NaN ────────────────────────────
    const float kNaN = std::numeric_limits<float>::quiet_NaN();
    std::vector<float> data(static_cast<size_t>(N) * F, kNaN);

    // ── 7. Fill data array ────────────────────────────────────────────────────
    for (pdal::PointId i = 0; i < static_cast<pdal::PointId>(nPoints); ++i) {
        uint32_t pid = (dimPointId != pdal::Dimension::Id::Unknown)
            ? view->getFieldAs<uint32_t>(dimPointId, i)
            : static_cast<uint32_t>(i);

        if (pid >= N) continue;  // safety

        for (uint32_t f = 0; f < F; ++f) {
            if (feat_dim_ids[f] == pdal::Dimension::Id::Unknown) continue;
            data[static_cast<size_t>(pid) * F + f] =
                view->getFieldAs<float>(feat_dim_ids[f], i);
        }
    }

    // ── 8. Compute per-feature min/max (ignoring NaN) ─────────────────────────
    std::vector<float> vmin(F,  std::numeric_limits<float>::max());
    std::vector<float> vmax(F, -std::numeric_limits<float>::max());

    for (size_t i = 0; i < N; ++i) {
        for (uint32_t f = 0; f < F; ++f) {
            float v = data[i * F + f];
            if (!std::isnan(v)) {
                if (v < vmin[f]) vmin[f] = v;
                if (v > vmax[f]) vmax[f] = v;
            }
        }
    }
    // Fallback for features with no valid data
    for (uint32_t f = 0; f < F; ++f) {
        if (vmin[f] > vmax[f]) { vmin[f] = 0.0f; vmax[f] = 1.0f; }
    }

    // ── 9. Write binary file ──────────────────────────────────────────────────
    std::cout << "Writing: " << out_path << "\n";

    std::ofstream out(out_path, std::ios::binary);
    if (!out) throw std::runtime_error("Cannot write: " + out_path.string());

    // Magic
    const char magic[4] = { 'F', 'E', 'A', 'T' };
    out.write(magic, 4);

    // N, F
    out.write(reinterpret_cast<const char*>(&N), 4);
    out.write(reinterpret_cast<const char*>(&F), 4);

    // Feature names (32 bytes each, null-padded)
    for (uint32_t f = 0; f < F; ++f) {
        char name_buf[32] = {};
        std::memcpy(name_buf, features[f].name.c_str(),
                    std::min(features[f].name.size(), size_t(31)));
        out.write(name_buf, 32);
    }

    // vmin, vmax
    out.write(reinterpret_cast<const char*>(vmin.data()), F * 4);
    out.write(reinterpret_cast<const char*>(vmax.data()), F * 4);

    // Data
    out.write(reinterpret_cast<const char*>(data.data()),
              static_cast<std::streamsize>(data.size()) * 4);

    out.close();

    // Summary
    const size_t total_bytes = 4 + 4 + 4 + F*32 + F*4 + F*4 + data.size()*4;
    std::cout << "  Done. File size: " << (total_bytes / 1024 / 1024) << " MB\n";
    std::cout << "  Features written:\n";
    for (uint32_t f = 0; f < F; ++f)
        std::cout << "    [" << f << "] " << features[f].name
                  << "  min=" << vmin[f] << "  max=" << vmax[f] << "\n";
    std::cout << out_path.string() << "\n";  // last line = path for Python
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