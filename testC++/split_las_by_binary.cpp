/**
 * split_las_by_binary.cpp
 *
 * Splits a LAS file into training.las / validation.las based on a binary
 * label buffer and a JSON metadata file produced by the viewer.
 *
 * Usage:
 *   split_las_by_binary <las_path> <bin_path> <meta_path> <output_dir>
 *
 * Extra dims whose names PDAL cannot read (non-UTF8 VLR) are recovered
 * by parsing the Extra Bytes VLR directly from the LAS binary header.
 */

#include <pdal/PointTable.hpp>
#include <pdal/PointView.hpp>
#include <pdal/io/LasReader.hpp>
#include <pdal/io/LasWriter.hpp>
#include <pdal/io/BufferReader.hpp>
#include <pdal/Options.hpp>
#include <pdal/Dimension.hpp>

#include <nlohmann/json.hpp>

#include <algorithm>
#include <cstdint>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <map>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>

namespace fs = std::filesystem;
using json   = nlohmann::json;

// ─────────────────────────────────────────────────────────────────────────────
//  LAS Extra Bytes VLR parsing
//
//  LAS spec: VLR with User ID "LASF_Spec", Record ID 4 contains Extra Bytes
//  records. Each record is 192 bytes:
//    offset  0:  reserved      (2 bytes)
//    offset  2:  data_type     (1 byte)  — matches PDAL type mapping below
//    offset  3:  options       (1 byte)
//    offset  4:  name          (32 bytes, null-terminated)
//    offset 36:  description   (32 bytes)
//    ... rest unused for our purposes
//
//  VLR header (before the data):
//    offset  0:  reserved      (2 bytes)
//    offset  2:  user_id       (16 bytes)
//    offset 18:  record_id     (2 bytes)
//    offset 20:  record_length (2 bytes)  — length of VLR data (not header)
//    offset 22:  description   (32 bytes)
//  Total VLR header = 54 bytes
// ─────────────────────────────────────────────────────────────────────────────

struct ExtraBytesEntry {
    std::string           name;
    pdal::Dimension::Type type;
    int                   size;   // bytes per point
};

// Map LAS Extra Bytes data_type to PDAL type + byte size
static pdal::Dimension::Type lasTypeToPdal(uint8_t data_type, int& size)
{
    switch (data_type) {
        case  1: size=1;  return pdal::Dimension::Type::Unsigned8;
        case  2: size=1;  return pdal::Dimension::Type::Signed8;
        case  3: size=2;  return pdal::Dimension::Type::Unsigned16;
        case  4: size=2;  return pdal::Dimension::Type::Signed16;
        case  5: size=4;  return pdal::Dimension::Type::Unsigned32;
        case  6: size=4;  return pdal::Dimension::Type::Signed32;
        case  7: size=8;  return pdal::Dimension::Type::Unsigned64;
        case  8: size=8;  return pdal::Dimension::Type::Signed64;
        case  9: size=4;  return pdal::Dimension::Type::Float;
        case 10: size=8;  return pdal::Dimension::Type::Double;
        default: size=0;  return pdal::Dimension::Type::None;
    }
}

// Read all Extra Bytes entries from a LAS file's VLR section
static std::vector<ExtraBytesEntry> readExtraBytesVLR(const fs::path& las_path)
{
    std::vector<ExtraBytesEntry> result;

    std::ifstream f(las_path, std::ios::binary);
    if (!f) throw std::runtime_error("Cannot open LAS: " + las_path.string());

    // Read LAS version
    // Number of VLRs at byte 100 (uint32)
    uint32_t num_vlrs;
    f.seekg(100); f.read(reinterpret_cast<char*>(&num_vlrs), 4);

    // VLRs start right after the public header (header_size at offset 94, uint16)
    uint16_t hdr_size16;
    f.seekg(94); f.read(reinterpret_cast<char*>(&hdr_size16), 2);

    f.seekg(hdr_size16);

    for (uint32_t v = 0; v < num_vlrs; ++v) {
        // VLR header: 54 bytes
        uint8_t vlr_header[54];
        f.read(reinterpret_cast<char*>(vlr_header), 54);
        if (!f) break;

        char user_id[17] = {};
        std::memcpy(user_id, vlr_header + 2, 16);

        uint16_t record_id;
        std::memcpy(&record_id, vlr_header + 18, 2);

        uint16_t record_length;
        std::memcpy(&record_length, vlr_header + 20, 2);

        if (std::string(user_id) == "LASF_Spec" && record_id == 4) {
            // Extra Bytes records — each 192 bytes
            int num_extra = record_length / 192;
            std::vector<uint8_t> data(record_length);
            f.read(reinterpret_cast<char*>(data.data()), record_length);

            for (int i = 0; i < num_extra; ++i) {
                const uint8_t* rec = data.data() + i * 192;

                uint8_t data_type = rec[2];
                char name_buf[33] = {};
                std::memcpy(name_buf, rec + 4, 32);

                int sz = 0;
                pdal::Dimension::Type pdal_type = lasTypeToPdal(data_type, sz);

                if (pdal_type != pdal::Dimension::Type::None && sz > 0) {
                    ExtraBytesEntry e;
                    e.name = std::string(name_buf);  // may contain non-UTF8 chars
                    e.type = pdal_type;
                    e.size = sz;
                    result.push_back(e);
                }
            }
        } else {
            f.seekg(record_length, std::ios::cur);
        }
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

struct SegmentInfo { std::string name, role; };

static std::vector<uint8_t> read_binary(const fs::path& path)
{
    std::ifstream f(path, std::ios::binary | std::ios::ate);
    if (!f) throw std::runtime_error("Cannot open binary file: " + path.string());
    std::streamsize size = f.tellg(); f.seekg(0);
    std::vector<uint8_t> buf(size);
    if (!f.read(reinterpret_cast<char*>(buf.data()), size))
        throw std::runtime_error("Failed to read: " + path.string());
    return buf;
}

static std::map<int, SegmentInfo> parse_metadata(const fs::path& path)
{
    std::ifstream f(path);
    if (!f) throw std::runtime_error("Cannot open metadata: " + path.string());
    json meta; f >> meta;
    std::map<int, SegmentInfo> result;
    if (meta.contains("segments"))
        for (auto& [k, v] : meta["segments"].items())
            result[std::stoi(k)].name = v.get<std::string>();
    if (meta.contains("split"))
        for (auto& [k, roles] : meta["split"].items()) {
            int id = std::stoi(k);
            for (auto& r : roles) {
                std::string role = r.get<std::string>();
                if      (role == "train") { result[id].role = "training";   break; }
                else if (role == "val")   { result[id].role = "validation"; break; }
            }
        }
    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//  write_segment
//
//  Uses the Extra Bytes VLR names (read from raw binary) to correctly
//  register and copy all extra dims — even those with non-UTF8 names
//  that PDAL cannot parse from the VLR.
//
//  The PDAL srcView dims() with empty names are matched positionally
//  to the VLR entries (same order, guaranteed by LAS spec).
// ─────────────────────────────────────────────────────────────────────────────

static void write_segment(const fs::path&              las_path,
                          const pdal::PointViewPtr&     srcView,
                          const std::vector<uint8_t>&   raw,
                          const std::vector<ExtraBytesEntry>& vlrExtras,
                          int                           seg_id,
                          const fs::path&               out_path)
{
    const size_t n_valid = std::min(srcView->size(), raw.size() / 2);

    static const std::set<std::string> kStandardDimNames = {
        "X","Y","Z","Intensity","ReturnNumber","NumberOfReturns",
        "ScanDirectionFlag","EdgeOfFlightLine","Classification",
        "ScanAngleRank","UserData","PointSourceId",
        "GpsTime","Red","Green","Blue",
        "ScannerChannel","ScanChannel","ClassificationFlags","ScanAngle",
        "NormalX","NormalY","NormalZ","Synthetic","KeyPoint","Withheld","Overlap"
    };

    // ── Collect PDAL extra dim IDs (positional — same order as VLR) ──────────
    std::vector<pdal::Dimension::Id> srcExtraIds;
    for (const auto& dimId : srcView->dims()) {
        std::string dname = pdal::Dimension::name(dimId);
        if (!kStandardDimNames.count(dname))
            srcExtraIds.push_back(dimId);
    }

    // vlrExtras and srcExtraIds must match positionally
    size_t nExtra = std::min(srcExtraIds.size(), vlrExtras.size());
    if (srcExtraIds.size() != vlrExtras.size())
        std::cerr << "  WARNING: VLR extra count (" << vlrExtras.size()
                  << ") != PDAL extra count (" << srcExtraIds.size()
                  << ") — using first " << nExtra << "\n";

    // ── Build fresh output PointTable — ALL dims registered before any points ─
    pdal::PointTable table;
    pdal::PointLayoutPtr layout = table.layout();

    layout->registerDim(pdal::Dimension::Id::X);
    layout->registerDim(pdal::Dimension::Id::Y);
    layout->registerDim(pdal::Dimension::Id::Z);
    layout->registerDim(pdal::Dimension::Id::Classification);
    layout->registerDim(pdal::Dimension::Id::Intensity);
    layout->registerDim(pdal::Dimension::Id::ScanAngleRank);
    layout->registerDim(pdal::Dimension::Id::NumberOfReturns);
    layout->registerDim(pdal::Dimension::Id::ReturnNumber);
    layout->registerDim(pdal::Dimension::Id::Red);
    layout->registerDim(pdal::Dimension::Id::Green);
    layout->registerDim(pdal::Dimension::Id::Blue);
    layout->registerDim(pdal::Dimension::Id::GpsTime);
    layout->registerDim(pdal::Dimension::Id::PointSourceId);
    layout->registerDim(pdal::Dimension::Id::UserData);
    layout->registerDim(pdal::Dimension::Id::ScanDirectionFlag);
    layout->registerDim(pdal::Dimension::Id::EdgeOfFlightLine);

    // Extra dims — registered with the NAME from VLR and TYPE from VLR
    std::vector<pdal::Dimension::Id> dstExtraIds(nExtra);
    for (size_t k = 0; k < nExtra; ++k)
        dstExtraIds[k] = layout->registerOrAssignDim(vlrExtras[k].name, vlrExtras[k].type);

    // labels — our new extra dim
    pdal::Dimension::Id dimLabels =
        layout->registerOrAssignDim("labels", pdal::Dimension::Type::Unsigned8);

    // ── Populate PointView ────────────────────────────────────────────────────
    pdal::PointViewPtr view(new pdal::PointView(table));

    pdal::PointId out_idx = 0;
    for (pdal::PointId i = 0; i < static_cast<pdal::PointId>(srcView->size()); ++i) {
        uint8_t s_id = (i < static_cast<pdal::PointId>(n_valid)) ? raw[i * 2]     : 0;
        uint8_t cls  = (i < static_cast<pdal::PointId>(n_valid)) ? raw[i * 2 + 1] : 0;
        if (static_cast<int>(s_id) != seg_id) continue;

        view->setField(pdal::Dimension::Id::X,                out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::X,               i));
        view->setField(pdal::Dimension::Id::Y,                out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::Y,               i));
        view->setField(pdal::Dimension::Id::Z,                out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::Z,               i));
        view->setField(pdal::Dimension::Id::Classification,   out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::Classification,  i));
        view->setField(pdal::Dimension::Id::Intensity,        out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Intensity,       i));
        view->setField(pdal::Dimension::Id::ScanAngleRank,    out_idx, srcView->getFieldAs<float>   (pdal::Dimension::Id::ScanAngleRank,   i));
        view->setField(pdal::Dimension::Id::NumberOfReturns,  out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::NumberOfReturns, i));
        view->setField(pdal::Dimension::Id::ReturnNumber,     out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::ReturnNumber,    i));
        view->setField(pdal::Dimension::Id::Red,              out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Red,             i));
        view->setField(pdal::Dimension::Id::Green,            out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Green,           i));
        view->setField(pdal::Dimension::Id::Blue,             out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Blue,            i));
        view->setField(pdal::Dimension::Id::GpsTime,          out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::GpsTime,         i));
        view->setField(pdal::Dimension::Id::PointSourceId,    out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::PointSourceId,   i));
        view->setField(pdal::Dimension::Id::UserData,         out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::UserData,        i));
        view->setField(pdal::Dimension::Id::ScanDirectionFlag,out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::ScanDirectionFlag, i));
        view->setField(pdal::Dimension::Id::EdgeOfFlightLine, out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::EdgeOfFlightLine, i));

        // Extra dims — copied by position using srcExtraIds → dstExtraIds
        for (size_t k = 0; k < nExtra; ++k)
            view->setField(dstExtraIds[k], out_idx,
                           srcView->getFieldAs<double>(srcExtraIds[k], i));

        view->setField(dimLabels, out_idx, cls);

        ++out_idx;
    }

    if (out_idx == 0) { std::cout << "  No points found, skipping.\n"; return; }
    std::cout << "  Found " << out_idx << " points.\n";

    // ── Write ─────────────────────────────────────────────────────────────────
    pdal::BufferReader reader;
    reader.addView(view);

    pdal::Options writerOpts;
    writerOpts.add("filename",      out_path.string());
    writerOpts.add("extra_dims",    "all");
    writerOpts.add("minor_version", 4);
    writerOpts.add("dataformat_id", 7);

    pdal::LasWriter writer;
    writer.setOptions(writerOpts);
    writer.setInput(reader);
    writer.prepare(table);
    writer.execute(table);

    std::cout << "  Saved: " << out_path << "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
//  write_segment_for_classify
//
//  Same as write_segment but does NOT add the "labels" extra dim.
//  Used when extracting a single segment to classify — we only need the
//  feature dims, not the training label.
// ─────────────────────────────────────────────────────────────────────────────

static void write_segment_for_classify(const fs::path&              las_path,
                                       const pdal::PointViewPtr&     srcView,
                                       const std::vector<uint8_t>&   raw,
                                       const std::vector<ExtraBytesEntry>& vlrExtras,
                                       int                           seg_id,
                                       const fs::path&               out_path)
{
    const size_t n_valid = std::min(srcView->size(), raw.size() / 2);

    static const std::set<std::string> kStandardDimNames = {
        "X","Y","Z","Intensity","ReturnNumber","NumberOfReturns",
        "ScanDirectionFlag","EdgeOfFlightLine","Classification",
        "ScanAngleRank","UserData","PointSourceId",
        "GpsTime","Red","Green","Blue",
        "ScannerChannel","ScanChannel","ClassificationFlags","ScanAngle",
        "NormalX","NormalY","NormalZ","Synthetic","KeyPoint","Withheld","Overlap"
    };

    // ── Collect PDAL extra dim IDs (positional — same order as VLR) ──────────
    std::vector<pdal::Dimension::Id> srcExtraIds;
    for (const auto& dimId : srcView->dims()) {
        std::string dname = pdal::Dimension::name(dimId);
        if (!kStandardDimNames.count(dname))
            srcExtraIds.push_back(dimId);
    }

    size_t nExtra = std::min(srcExtraIds.size(), vlrExtras.size());
    if (srcExtraIds.size() != vlrExtras.size())
        std::cerr << "  WARNING: VLR extra count (" << vlrExtras.size()
                  << ") != PDAL extra count (" << srcExtraIds.size()
                  << ") — using first " << nExtra << "\n";

    // ── Build fresh output PointTable — no "labels" dim ──────────────────────
    pdal::PointTable table;
    pdal::PointLayoutPtr layout = table.layout();

    layout->registerDim(pdal::Dimension::Id::X);
    layout->registerDim(pdal::Dimension::Id::Y);
    layout->registerDim(pdal::Dimension::Id::Z);
    layout->registerDim(pdal::Dimension::Id::Classification);
    layout->registerDim(pdal::Dimension::Id::Intensity);
    layout->registerDim(pdal::Dimension::Id::ScanAngleRank);
    layout->registerDim(pdal::Dimension::Id::NumberOfReturns);
    layout->registerDim(pdal::Dimension::Id::ReturnNumber);
    layout->registerDim(pdal::Dimension::Id::Red);
    layout->registerDim(pdal::Dimension::Id::Green);
    layout->registerDim(pdal::Dimension::Id::Blue);
    layout->registerDim(pdal::Dimension::Id::GpsTime);
    layout->registerDim(pdal::Dimension::Id::PointSourceId);
    layout->registerDim(pdal::Dimension::Id::UserData);
    layout->registerDim(pdal::Dimension::Id::ScanDirectionFlag);
    layout->registerDim(pdal::Dimension::Id::EdgeOfFlightLine);

    std::vector<pdal::Dimension::Id> dstExtraIds(nExtra);
    for (size_t k = 0; k < nExtra; ++k)
        dstExtraIds[k] = layout->registerOrAssignDim(vlrExtras[k].name, vlrExtras[k].type);

    // ── Populate PointView — keep all points that belong to seg_id ────────────
    pdal::PointViewPtr view(new pdal::PointView(table));

    pdal::PointId out_idx = 0;
    for (pdal::PointId i = 0; i < static_cast<pdal::PointId>(srcView->size()); ++i) {
        uint8_t s_id = (i < static_cast<pdal::PointId>(n_valid)) ? raw[i * 2] : 0;
        if (static_cast<int>(s_id) != seg_id) continue;

        view->setField(pdal::Dimension::Id::X,                out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::X,               i));
        view->setField(pdal::Dimension::Id::Y,                out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::Y,               i));
        view->setField(pdal::Dimension::Id::Z,                out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::Z,               i));
        view->setField(pdal::Dimension::Id::Classification,   out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::Classification,  i));
        view->setField(pdal::Dimension::Id::Intensity,        out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Intensity,       i));
        view->setField(pdal::Dimension::Id::ScanAngleRank,    out_idx, srcView->getFieldAs<float>   (pdal::Dimension::Id::ScanAngleRank,   i));
        view->setField(pdal::Dimension::Id::NumberOfReturns,  out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::NumberOfReturns, i));
        view->setField(pdal::Dimension::Id::ReturnNumber,     out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::ReturnNumber,    i));
        view->setField(pdal::Dimension::Id::Red,              out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Red,             i));
        view->setField(pdal::Dimension::Id::Green,            out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Green,           i));
        view->setField(pdal::Dimension::Id::Blue,             out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::Blue,            i));
        view->setField(pdal::Dimension::Id::GpsTime,          out_idx, srcView->getFieldAs<double>  (pdal::Dimension::Id::GpsTime,         i));
        view->setField(pdal::Dimension::Id::PointSourceId,    out_idx, srcView->getFieldAs<uint16_t>(pdal::Dimension::Id::PointSourceId,   i));
        view->setField(pdal::Dimension::Id::UserData,         out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::UserData,        i));
        view->setField(pdal::Dimension::Id::ScanDirectionFlag,out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::ScanDirectionFlag, i));
        view->setField(pdal::Dimension::Id::EdgeOfFlightLine, out_idx, srcView->getFieldAs<uint8_t> (pdal::Dimension::Id::EdgeOfFlightLine, i));

        for (size_t k = 0; k < nExtra; ++k)
            view->setField(dstExtraIds[k], out_idx,
                           srcView->getFieldAs<double>(srcExtraIds[k], i));

        ++out_idx;
    }

    if (out_idx == 0) { std::cout << "  No points found for segment " << seg_id << ", skipping.\n"; return; }
    std::cout << "  Found " << out_idx << " points.\n";

    // ── Write ─────────────────────────────────────────────────────────────────
    pdal::BufferReader reader;
    reader.addView(view);

    pdal::Options writerOpts;
    writerOpts.add("filename",      out_path.string());
    writerOpts.add("extra_dims",    "all");
    writerOpts.add("minor_version", 4);
    writerOpts.add("dataformat_id", 7);

    pdal::LasWriter writer;
    writer.setOptions(writerOpts);
    writer.setInput(reader);
    writer.prepare(table);
    writer.execute(table);

    std::cout << "  Saved: " << out_path << "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
//  extract_segment — single-segment extraction mode for classify
// ─────────────────────────────────────────────────────────────────────────────

static void extract_segment(const fs::path& las_path,
                             const fs::path& bin_path,
                             int             seg_id,
                             const fs::path& out_path)
{
    std::cout << "Mode: extract single segment " << seg_id << " for classify\n";

    std::cout << "Loading binary: " << bin_path << "\n";
    auto raw = read_binary(bin_path);
    if (raw.size() % 2 != 0) throw std::runtime_error("Binary buffer not multiple of 2.");
    std::cout << "  " << (raw.size()/2) << " label pairs found.\n";

    std::cout << "Loading LAS: " << las_path << "\n";
    pdal::PointTable srcTable;
    pdal::LasReader  srcReader;
    {
        pdal::Options opts; opts.add("filename", las_path.string());
        srcReader.setOptions(opts);
        srcReader.prepare(srcTable);
    }
    pdal::PointViewPtr srcView = *srcReader.execute(srcTable).begin();
    std::cout << "  Total points: " << srcView->size() << "\n";

    auto vlrExtras = readExtraBytesVLR(las_path);

    if (raw.size()/2 < srcView->size())
        std::cerr << "WARNING: buffer fewer entries (" << raw.size()/2
                  << ") than points (" << srcView->size() << ").\n";

    fs::create_directories(out_path.parent_path());

    write_segment_for_classify(las_path, srcView, raw, vlrExtras, seg_id, out_path);

    std::cout << "\nExtraction completed!\n";
}

// ─────────────────────────────────────────────────────────────────────────────

static void split_las(const fs::path& las_path,
                      const fs::path& bin_path,
                      const fs::path& meta_path,
                      const fs::path& output_dir)
{
    std::cout << "Loading metadata: " << meta_path << "\n";
    auto seg_map = parse_metadata(meta_path);
    for (auto& [id, info] : seg_map)
        std::cout << "  Segment " << id << ": \"" << info.name
                  << "\"  role=" << (info.role.empty() ? "(none)" : info.role) << "\n";

    std::cout << "Loading binary labels: " << bin_path << "\n";
    auto raw = read_binary(bin_path);
    if (raw.size() % 2 != 0) throw std::runtime_error("Binary buffer not multiple of 2.");
    std::cout << "  " << (raw.size()/2) << " label pairs found.\n";

    // ── Read LAS ──────────────────────────────────────────────────────────────
    std::cout << "Loading LAS: " << las_path << "\n";
    pdal::PointTable srcTable;
    pdal::LasReader  srcReader;
    {
        pdal::Options opts; opts.add("filename", las_path.string());
        srcReader.setOptions(opts);
        srcReader.prepare(srcTable);
    }
    pdal::PointViewPtr srcView = *srcReader.execute(srcTable).begin();
    std::cout << "  Total points: " << srcView->size() << "\n";

    // ── Read extra dim names directly from VLR binary ─────────────────────────
    auto vlrExtras = readExtraBytesVLR(las_path);

    if (raw.size()/2 < srcView->size())
        std::cerr << "WARNING: buffer fewer entries (" << raw.size()/2
                  << ") than points (" << srcView->size() << ").\n";

    fs::create_directories(output_dir);

    for (auto& [seg_id, info] : seg_map) {
        std::cout << "\nProcessing segment " << seg_id << " \"" << info.name << "\"...\n";

        fs::path out_path;
        if (!info.role.empty()) {
            out_path = output_dir / (info.role + ".las");
        } else {
            std::string safe;
            for (unsigned char c : info.name)
                safe += (std::isalnum(c)||c=='.'||c=='_'||c=='-'||c==' ')?(char)c:'_';
            while (!safe.empty() && safe.front()==' ') safe.erase(safe.begin());
            while (!safe.empty() && safe.back() ==' ') safe.pop_back();
            out_path = output_dir / (las_path.stem().string() + "_" + safe + ".las");
        }

        write_segment(las_path, srcView, raw, vlrExtras, seg_id, out_path);
    }

    std::cout << "\nProcess completed!\n";
}

// ─────────────────────────────────────────────────────────────────────────────

int main(int argc, char* argv[])
{
    // ── Mode 1 (training split):
    //   split_las_by_binary <las_path> <bin_path> <meta_path> <output_dir>
    //
    // ── Mode 2 (classify extract):
    //   split_las_by_binary <las_path> <bin_path> --extract-segment <seg_id> <out_path>

    if (argc >= 6 && std::string(argv[3]) == "--extract-segment") {
        try {
            int seg_id = std::stoi(argv[4]);
            extract_segment(argv[1], argv[2], seg_id, argv[5]);
        } catch (const std::exception& e) {
            std::cerr << "ERROR: " << e.what() << "\n";
            return 1;
        }
        return 0;
    }

    if (argc < 5) {
        std::cerr << "Usage (training split):\n"
                  << "  " << argv[0] << " <las_path> <bin_path> <meta_path> <output_dir>\n\n"
                  << "Usage (classify extract):\n"
                  << "  " << argv[0] << " <las_path> <bin_path> --extract-segment <seg_id> <out_path>\n";
        return 1;
    }

    try {
        split_las(argv[1], argv[2], argv[3], argv[4]);
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << "\n";
        return 1;
    }
    return 0;
}