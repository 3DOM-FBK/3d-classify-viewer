#define PCL_NO_PRECOMPILE

#include <memory>
#include <chrono>
#include <cmath>
#include <fstream>
#include <filesystem>
#include <Eigen/Core>
#include <pcl/common/pca.h>
#include <pcl/features/normal_3d_omp.h>
#include <pcl/filters/voxel_grid.h>
#include <pcl/io/ply_io.h>
#include <pcl/io/pcd_io.h>
#include <pcl/ModelCoefficients.h>
#include <pcl/point_types.h>
#include <pcl/sample_consensus/method_types.h>
#include <pcl/sample_consensus/model_types.h>
#include <pcl/search/octree.h>
#include <pcl/segmentation/sac_segmentation.h>
#include <pcl/filters/radius_outlier_removal.h>
#include <vector>
#include <map>
#include <set>
#include <unordered_map>
#include <math.h>

#include <pdal/PointTable.hpp>
#include <pdal/PointView.hpp>
#include <pdal/io/LasReader.hpp>
// LasWriter and BufferReader removed — output is now written natively without PDAL
#include <pdal/Options.hpp>
#include <pdal/StageFactory.hpp>

using TimePoint = std::chrono::time_point<std::chrono::high_resolution_clock>;
TimePoint now_t() { return std::chrono::high_resolution_clock::now(); }
double elapsed(TimePoint start) {
    return std::chrono::duration<double>(std::chrono::high_resolution_clock::now() - start).count();
}

// Uncomment the following line to enable class remapping
// #define REMAP_CLASSES

// Here I decide how many radius/scale to apply
// scalesCount and scales are now set dynamically via --radius CLI argument
// Default values used if --radius is not provided
const int MAX_SCALES = 10;
int scalesCount = 4;
float scales[MAX_SCALES] = { 0.8, 1.2, 2.0, 3.0 };

float color_bitter = 256.0f/65536.0f;
float samplingResolution = 0.5f;

// Remap class from LAS to sequential class id for training
std::map<int, int> class_mapping = {
        {0, 0},
        {7, 1},
        {12, 2},
        {24, 3},
};

// ============================================================
// ALL AVAILABLE FEATURES
// To add/remove a feature from CustomPoint:
//   1) Add/remove the field in struct CustomPoint
//   2) Add/remove it in POINT_CLOUD_REGISTER_POINT_STRUCT
//   3) Add/remove its computation in computeShapeFeatures
//   4) Add/remove its registration and setField in writeToLas
// The CLI --features flag controls which ones are written to output.
// ============================================================

// Custom point cloud point definition (standard PCL point + our features)
struct CustomPoint 
{   
    PCL_ADD_POINT4D;
    // float class_id;
    float anisotropy[MAX_SCALES];
    float heightAbove[MAX_SCALES];
    float heightBelow[MAX_SCALES];
    float linearity[MAX_SCALES];
    float neighbours[MAX_SCALES];
    float omnivariance[MAX_SCALES];
    float planarity[MAX_SCALES];
    float sphericity[MAX_SCALES];
    float surface_variation[MAX_SCALES];
    float verticality[MAX_SCALES];
    float verticalRange[MAX_SCALES];
    float height; 
    float class_id;
    float scan_angle;
    float intensity;
    float number_of_returns;
    float return_num;
    float normal_x;
    float normal_y;
    float normal_z;
    float point_source_id;
    // Raw extra bytes from input LAS (normal_x, normal_y, normal_z, POINT_ID)
    // Read directly from file binary to avoid PDAL VLR parsing issues
    float raw_normal_x;
    float raw_normal_y;
    float raw_normal_z;
    uint32_t raw_point_id;
    PCL_ADD_UNION_RGB; 
    EIGEN_MAKE_ALIGNED_OPERATOR_NEW
};

// NOTE: POINT_CLOUD_REGISTER_POINT_STRUCT is limited to 20 fields (boost::mpl::vector limit).
// Array fields (float[MAX_SCALES]) are intentionally excluded - PCL only needs
// x, y, z registered for search/PCA. All fields remain accessible via direct struct access.
POINT_CLOUD_REGISTER_POINT_STRUCT(
    CustomPoint,
    (float, x, x)
    (float, y, y)
    (float, z, z)
    (float, height, height)
    (float, class_id, class_id)
    (float, scan_angle, scan_angle)
    (float, intensity, intensity)
    (float, number_of_returns, number_of_returns)
    (float, return_num, return_num)
    (float, normal_x, normal_x)
    (float, normal_y, normal_y)
    (float, normal_z, normal_z)
    (float, point_source_id, point_source_id)
    (float, rgb, rgb)
)

// ============================================================
// Full list of available feature names that can be requested via CLI.
// Scale-based features will be expanded automatically as featureName_0, featureName_1, etc.
// ============================================================
const std::set<std::string> AVAILABLE_SCALE_FEATURES = {
    "anisotropy", "omnivariance", "sphericity",
    "planarity", "linearity", "verticality", "surface_variation",
    "neighbours", "vertical_range", "height_above", "height_below"
};


const std::set<std::string> AVAILABLE_SINGLE_FEATURES = {
    "height"
};
//, "intensity", "number_of_returns", "return_num", "scan_angle"

void printAvailableFeatures()
{
    std::cout << "\nAvailable features (scale-based, will produce featureName_0 ... featureName_N):" << std::endl;
    for (auto& f : AVAILABLE_SCALE_FEATURES)
        std::cout << "  " << f << std::endl;

    std::cout << "\nAvailable features (single value per point):" << std::endl;
    for (auto& f : AVAILABLE_SINGLE_FEATURES)
        std::cout << "  " << f << std::endl;
}

// ============================================================
// Parse LAS header + VLR extra-bytes record to determine the
// binary layout of each point record.
//
// Reads the VLR directly (no PDAL) — same approach as las_to_feature_bin.
// This eliminates the extra PDAL pipeline that was opened only for a
// base_size cross-check, which was the dominant source of startup overhead.
// ============================================================

static int lasVlrTypeSize(uint8_t t) {
    switch (t) {
        case 1: case 2: return 1;
        case 3: case 4: return 2;
        case 5: case 6: return 4;
        case 7: case 8: return 8;
        case 9:         return 4;   // float32
        case 10:        return 8;   // float64
        default:        return 0;
    }
}

static const int kLasBaseSizes[] = {
    20, 28, 26, 34, 57, 63, 30, 36, 38, 59, 67
};

struct LasExtraDim {
    std::string name;
    int         offset;  // byte offset within the extra-bytes block
    int         size;
};

struct LasRawInfo {
    uint32_t                 offset_to_data      = 0;
    uint16_t                 point_record_length = 0;
    uint64_t                 point_count         = 0;
    int                      base_size           = 0;
    bool                     has_extra_bytes     = false;
    int                      extra_bytes_offset  = 0;
    std::vector<LasExtraDim> extra_dims;  // named dims from VLR, in order
};

LasRawInfo readLasRawInfo(const std::string& fileName)
{
    LasRawInfo info;
    std::ifstream f(fileName, std::ios::binary);
    if (!f) return info;

    // LAS version
    uint8_t ver_major = 0, ver_minor = 0;
    f.seekg(24); f.read(reinterpret_cast<char*>(&ver_major), 1);
                 f.read(reinterpret_cast<char*>(&ver_minor), 1);
    bool isLas14 = (ver_major == 1 && ver_minor >= 4);

    uint16_t header_size = 0;
    uint32_t num_vlrs    = 0;
    uint8_t  point_fmt   = 0;

    f.seekg(94);  f.read(reinterpret_cast<char*>(&header_size),               2);
    f.seekg(96);  f.read(reinterpret_cast<char*>(&info.offset_to_data),        4);
    f.seekg(100); f.read(reinterpret_cast<char*>(&num_vlrs),                   4);
    f.seekg(104); f.read(reinterpret_cast<char*>(&point_fmt),                  1);
    point_fmt &= 0x0F;
    f.seekg(105); f.read(reinterpret_cast<char*>(&info.point_record_length),   2);

    if (isLas14) {
        f.seekg(247); f.read(reinterpret_cast<char*>(&info.point_count), 8);
    } else {
        uint32_t c = 0;
        f.seekg(107); f.read(reinterpret_cast<char*>(&c), 4);
        info.point_count = c;
    }

    info.base_size = (point_fmt <= 10) ? kLasBaseSizes[point_fmt] : 20;

    // Walk VLRs to find the Extra Bytes record (LASF_Spec, record_id == 4).
    // This gives us the name and size of every extra dim, letting us derive
    // base_size reliably without opening PDAL a second time.
    f.seekg(header_size);
    for (uint32_t v = 0; v < num_vlrs; ++v) {
        uint8_t hdr[54] = {};
        f.read(reinterpret_cast<char*>(hdr), 54);
        if (!f) break;

        char     user_id[17] = {};
        uint16_t record_id   = 0;
        uint16_t record_len  = 0;
        std::memcpy(user_id,    hdr + 2,  16);
        std::memcpy(&record_id, hdr + 18,  2);
        std::memcpy(&record_len,hdr + 20,  2);

        if (std::string(user_id) == "LASF_Spec" && record_id == 4) {
            int n = record_len / 192;
            std::vector<uint8_t> data(record_len);
            f.read(reinterpret_cast<char*>(data.data()), record_len);
            int running_offset = 0;
            for (int i = 0; i < n; ++i) {
                const uint8_t* rec   = data.data() + i * 192;
                uint8_t        dtype = rec[2];
                char           nbuf[33] = {};
                std::memcpy(nbuf, rec + 4, 32);
                int sz = lasVlrTypeSize(dtype);
                if (sz > 0) {
                    std::string dname(nbuf, strnlen(nbuf, 32));
                    info.extra_dims.push_back({ dname, running_offset, sz });
                    running_offset += sz;
                }
            }
            // Cross-check: if VLR total size matches the excess over base_size,
            // confirm base_size. If there's a mismatch, trust VLR sum.
            int vlr_total = 0;
            for (auto& d : info.extra_dims) vlr_total += d.size;
            int vlr_base = (int)info.point_record_length - vlr_total;
            if (vlr_total > 0 && vlr_base > 0 && vlr_base != info.base_size) {
                std::cout << "  [raw] base_size corrected by VLR: "
                          << info.base_size << " -> " << vlr_base << "\n";
                info.base_size = vlr_base;
            }
            break;
        } else {
            f.seekg(record_len, std::ios::cur);
        }
    }

    info.has_extra_bytes    = (info.point_record_length > info.base_size);
    info.extra_bytes_offset = info.base_size;
    return info;
}

// ============================================================
// Read LAS/LAZ via PDAL and populate a PCL PointCloud.
// Shifts points to local coordinate system using first point as origin.
//
// POINT_ID strategy (in priority order):
//   1. Read via PDAL if exposed as a named extra dim (most reliable).
//   2. Read from raw binary extra bytes as fallback (handles missing VLR).
// Normals are always read from raw binary because PDAL renames NormalX/Y/Z
// with non-UTF8 VLR metadata that crashes PotreeConverter.
// ============================================================
void laz2pcl(std::string fileName, pcl::PointCloud<CustomPoint>::Ptr outputCloud)
{
    // std::cout << "Reading LAS/LAZ: " << fileName << std::endl;

    pdal::Option las_opt("filename", fileName);
    pdal::Options las_opts;
    las_opts.add(las_opt);
    pdal::PointTable table;
    pdal::LasReader las_reader;
    las_reader.setOptions(las_opts);
    las_reader.prepare(table);
    pdal::PointViewSet point_view_set = las_reader.execute(table);
    pdal::PointViewPtr point_view = *point_view_set.begin();

    bool hasColor = point_view->hasDim(pdal::Dimension::Id::Red) &&
                    point_view->hasDim(pdal::Dimension::Id::Green) &&
                    point_view->hasDim(pdal::Dimension::Id::Blue);

    // ----------------------------------------------------------
    // Check if PDAL exposes POINT_ID as a named extra dim.
    // PDAL may or may not surface it depending on VLR presence.
    // We check all dim names case-insensitively.
    // ----------------------------------------------------------
    bool hasPDALPointId = false;
    pdal::Dimension::Id pdal_pid_dim = pdal::Dimension::Id::Unknown;
    for (const auto& dimId : point_view->dims())
    {
        std::string dname = pdal::Dimension::name(dimId);
        // Match common variants: POINT_ID, point_id, PointId, Point_ID
        std::string lower = dname;
        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        if (lower == "point_id" || lower == "pointid")
        {
            pdal_pid_dim    = dimId;
            hasPDALPointId  = true;
            // std::cout << "POINT_ID found via PDAL as dim: " << dname << std::endl;
            break;
        }
    }

    double offsetX = 0;
    double offsetY = 0;
    int count = (int)point_view->size();

    // First pass: compute offset from first point
    if (count > 0)
    {
        offsetX = point_view->getFieldAs<double>(pdal::Dimension::Id::X, 0);
        offsetY = point_view->getFieldAs<double>(pdal::Dimension::Id::Y, 0);
        // std::cout << "Offset X: " << offsetX << "  Y: " << offsetY << std::endl;
    }

    // std::cout << "- Point count: " << count << std::endl;

    outputCloud->width  = count;
    outputCloud->height = 1;
    outputCloud->points.resize(count);

    // Initialize all raw extra fields to 0
    for (int j = 0; j < count; ++j)
    {
        outputCloud->points[j].raw_normal_x = 0.0f;
        outputCloud->points[j].raw_normal_y = 0.0f;
        outputCloud->points[j].raw_normal_z = 0.0f;
        outputCloud->points[j].raw_point_id = 0;
        outputCloud->points[j].normal_x     = 0.0f;
        outputCloud->points[j].normal_y     = 0.0f;
        outputCloud->points[j].normal_z     = 0.0f;
    }

    for (pdal::PointId idx = 0; idx < (pdal::PointId)count; ++idx)
    {
        using namespace pdal::Dimension;
        int i = (int)idx;

        double x = point_view->getFieldAs<double>(Id::X, idx);
        double y = point_view->getFieldAs<double>(Id::Y, idx);
        double z = point_view->getFieldAs<double>(Id::Z, idx);

        outputCloud->points[i].x = static_cast<float>(x - offsetX);
        outputCloud->points[i].y = static_cast<float>(y - offsetY);
        outputCloud->points[i].z = static_cast<float>(z);

        // Standard LAS fields - always read
        outputCloud->points[i].class_id         = point_view->getFieldAs<float>(Id::Classification, idx);
        outputCloud->points[i].scan_angle        = point_view->getFieldAs<float>(Id::ScanAngleRank, idx);
        outputCloud->points[i].intensity         = point_view->getFieldAs<float>(Id::Intensity, idx);
        outputCloud->points[i].number_of_returns = point_view->getFieldAs<float>(Id::NumberOfReturns, idx);
        outputCloud->points[i].return_num        = point_view->getFieldAs<float>(Id::ReturnNumber, idx);
        // Store sequential index as point_source_id - used as key for extra dims lookup.
        outputCloud->points[i].point_source_id = static_cast<float>(i);

        if (hasColor)
        {
            outputCloud->points[i].r = static_cast<float>(point_view->getFieldAs<int>(Id::Red,   idx) * color_bitter);
            outputCloud->points[i].g = static_cast<float>(point_view->getFieldAs<int>(Id::Green, idx) * color_bitter);
            outputCloud->points[i].b = static_cast<float>(point_view->getFieldAs<int>(Id::Blue,  idx) * color_bitter);
        }

        // Strategy 1: read POINT_ID via PDAL (preferred - no binary math needed)
        if (hasPDALPointId)
            outputCloud->points[i].raw_point_id =
                point_view->getFieldAs<uint32_t>(pdal_pid_dim, idx);

#ifdef REMAP_CLASSES
        // outputCloud->points[i].class_id = class_mapping[(int)outputCloud->points[i].class_id];
#endif
    }

    // ----------------------------------------------------------
    // Read raw extra bytes from the LAS binary file in a single bulk read.
    //
    // Previously this used N individual seekg() calls — one per point.
    // With millions of points that caused severe I/O overhead. We now load
    // the entire point data block at once and access fields via pointer
    // arithmetic, the same approach used in las_to_feature_bin.
    //
    // Used for:
    //   A) Normals (always): PDAL renames NormalX/Y/Z and corrupts VLR metadata.
    //   B) POINT_ID (fallback): if PDAL did not expose it as a named dim.
    //
    // Expected extra bytes layout (written by previous pipeline):
    //   +0  normal_x  (float32)
    //   +4  normal_y  (float32)
    //   +8  normal_z  (float32)
    //   +12 POINT_ID  (uint32)
    //
    // If the VLR is present we use named-dim offsets for robustness.
    // If only POINT_ID is present (extra_size == 4) it is at offset +0.
    // ----------------------------------------------------------
    LasRawInfo rawInfo = readLasRawInfo(fileName);
    if (rawInfo.has_extra_bytes)
    {
        const int    rec_len    = rawInfo.point_record_length;
        const int    extra_off  = rawInfo.extra_bytes_offset;
        const int    extra_size = rec_len - extra_off;

        // --- Resolve named offsets from VLR (if available) ---
        int off_nx = -1, off_ny = -1, off_nz = -1, off_pid = -1;
        if (!rawInfo.extra_dims.empty()) {
            for (auto& d : rawInfo.extra_dims) {
                std::string lo = d.name;
                std::transform(lo.begin(), lo.end(), lo.begin(), ::tolower);
                if      (lo == "normalx"  || lo == "normal_x") off_nx  = d.offset;
                else if (lo == "normaly"  || lo == "normal_y") off_ny  = d.offset;
                else if (lo == "normalz"  || lo == "normal_z") off_nz  = d.offset;
                else if (lo == "point_id" || lo == "pointid")  off_pid = d.offset;
            }
        }
        // Fallback to positional layout when VLR is absent
        if (off_nx < 0 && extra_size >= 12) { off_nx = 0; off_ny = 4; off_nz = 8; }
        if (off_pid < 0 && !hasPDALPointId) {
            if      (extra_size == 4)  off_pid = 0;
            else if (extra_size >= 16) off_pid = 12;
        }

        // --- Single bulk read of the entire point data block ---
        std::vector<uint8_t> raw(static_cast<size_t>(count) * rec_len);
        {
            std::ifstream rawf(fileName, std::ios::binary);
            rawf.seekg(rawInfo.offset_to_data);
            rawf.read(reinterpret_cast<char*>(raw.data()),
                      static_cast<std::streamsize>(raw.size()));
        }

        // --- Extract fields via pointer arithmetic ---
        for (int idx = 0; idx < count; ++idx)
        {
            const uint8_t* extra = raw.data()
                                 + static_cast<size_t>(idx) * rec_len
                                 + extra_off;

            if (off_nx >= 0) std::memcpy(&outputCloud->points[idx].raw_normal_x, extra + off_nx, 4);
            if (off_ny >= 0) std::memcpy(&outputCloud->points[idx].raw_normal_y, extra + off_ny, 4);
            if (off_nz >= 0) std::memcpy(&outputCloud->points[idx].raw_normal_z, extra + off_nz, 4);
            if (off_pid >= 0 && !hasPDALPointId)
                std::memcpy(&outputCloud->points[idx].raw_point_id, extra + off_pid, 4);
        }
    }

    // std::cout << "Loaded " << count << " points" << std::endl;
}

// ============================================================
// Helper: get the third eigenvector from PCA result
// ============================================================
bool GetEigenVector(const Eigen::Matrix3f& eigenVectors, unsigned index, double eigenVector[])
{
    if (eigenVector && index < (unsigned)eigenVectors.size())
    {
        for (unsigned i = 0; i < (unsigned)eigenVectors.size(); ++i)
            eigenVector[i] = eigenVectors(i, index);
        return true;
    }
    assert(false);
    return false;
}

// ============================================================
// Compute all geometric features for a single point at all scales.
// If you add/remove a feature in CustomPoint, update this function.
// ============================================================
void computeShapeFeatures(int pt_idx, pcl::PointCloud<CustomPoint>::Ptr pcl_in, pcl::search::Search<CustomPoint>::Ptr kdTree, pcl::PCA<CustomPoint> PCA)
{
    std::vector<int> neighborsIndices;
    std::vector<float> neighborsDistances;

    Eigen::Matrix3f eigenvectors;
    Eigen::Vector3f eigenvalues;

    for (int i = 0; i < scalesCount; i++)
    {
        kdTree->radiusSearch(pcl_in->points[pt_idx], scales[i], neighborsIndices, neighborsDistances);

        pcl_in->points[pt_idx].neighbours[i] = neighborsIndices.size();

        if (neighborsIndices.size() < 3)
            kdTree->nearestKSearch(pcl_in->points[pt_idx], (int)(scales[i] * 8), neighborsIndices, neighborsDistances);

        if (neighborsIndices.size() >= 3)
        {
            float zMin = pcl_in->points[neighborsIndices[0]].z;
            float zMax = pcl_in->points[neighborsIndices[0]].z;

            for (size_t n = 1; n < neighborsIndices.size(); ++n)
            {
                zMin = pcl_in->points[neighborsIndices[n]].z < zMin ? pcl_in->points[neighborsIndices[n]].z : zMin;
                zMax = pcl_in->points[neighborsIndices[n]].z > zMax ? pcl_in->points[neighborsIndices[n]].z : zMax;
            }

            pcl_in->points[pt_idx].verticalRange[i] = zMax - zMin;
            pcl_in->points[pt_idx].heightAbove[i]   = zMax - pcl_in->points[pt_idx].z;
            pcl_in->points[pt_idx].heightBelow[i]   = pcl_in->points[pt_idx].z - zMin;

            PCA.setIndices(std::make_shared<std::vector<int>>(neighborsIndices));
            eigenvalues  = PCA.getEigenValues();
            eigenvectors = PCA.getEigenVectors();

            pcl_in->points[pt_idx].linearity[i]  = (eigenvalues(0) - eigenvalues(1)) / eigenvalues(0);
            pcl_in->points[pt_idx].planarity[i]  = (eigenvalues(1) - eigenvalues(2)) / eigenvalues(0);

            double sum = eigenvalues(0) + eigenvalues(1) + eigenvalues(2);
            pcl_in->points[pt_idx].surface_variation[i] = eigenvalues(2) / sum;
            pcl_in->points[pt_idx].omnivariance[i] = (eigenvalues(0) * eigenvalues(1) * eigenvalues(2)) / (eigenvalues(0)/eigenvalues(2));
            pcl_in->points[pt_idx].anisotropy[i] = (eigenvalues(0) - eigenvalues(2)) / eigenvalues(0);
            pcl_in->points[pt_idx].sphericity[i] = eigenvalues(2) / eigenvalues(0);

            Eigen::Vector3d Z(0, 0, 1);
            Eigen::Vector3d e3(Z);
            GetEigenVector(eigenvectors, 2, e3.data());
            pcl_in->points[pt_idx].verticality[i] = 1.0 - std::abs(Z.dot(e3));
        }
    }
}


// ============================================================
// Compute height above nearest ground point (3D distance)
// ============================================================
void computeHeight(int pt_idx, pcl::PointCloud<CustomPoint>::Ptr pcl_in, pcl::PointCloud<CustomPoint>::Ptr groundCloud, pcl::search::Search<CustomPoint>::Ptr groundTree)
{
    std::vector<int> neighborsIndices;
    std::vector<float> neighborsDistances;

    CustomPoint point = pcl_in->points[pt_idx];
    groundTree->nearestKSearch(point, 1, neighborsIndices, neighborsDistances);

    pcl_in->points[pt_idx].height = sqrt(
        pow(point.x - groundCloud->points[neighborsIndices[0]].x, 2) +
        pow(point.y - groundCloud->points[neighborsIndices[0]].y, 2) +
        pow(point.z - groundCloud->points[neighborsIndices[0]].z, 2)
    );
}

// ============================================================
// Main feature computation loop (parallelized with OpenMP)
// ============================================================
void computeFeatures(pcl::PointCloud<CustomPoint>::Ptr inputCloud, pcl::search::Search<CustomPoint>::Ptr tree)
{
    pcl::PCA<CustomPoint> PCA;
    PCA.setInputCloud(inputCloud);

    int progress = 0;

    auto startTime = std::chrono::steady_clock::now();

    FILE* tty = fopen("/dev/tty", "w");
    if (!tty) tty = stderr;
    int lastPerc = -1;
    #pragma omp parallel for
    for (int i = 0; i < (int)inputCloud->points.size(); i++)
    {
        computeShapeFeatures(i, inputCloud, tree, PCA);

        #pragma omp critical
        {
            progress++;

            if (progress % 10000 == 0 || progress == (int)inputCloud->points.size())
            {
                int total   = inputCloud->points.size();
                int perc    = int((progress * 100.0f) / total);

                auto now     = std::chrono::steady_clock::now();
                double elapsed = std::chrono::duration<double>(now - startTime).count();
                double eta   = (elapsed / progress) * (total - progress);
                int min = static_cast<int>(eta / 60);
                int sec = static_cast<int>(eta) % 60;

                if (perc != lastPerc && (perc == 0 || perc == 33 || perc == 66 || perc == 100)) {
                    fprintf(stdout, "Computing Features %3d%% [ETA: %02d:%02d]\n", perc, min, sec);
                    fflush(stdout);
                    lastPerc = perc;
                }
            }
        }
    }

    if (tty != stderr) fclose(tty);
}

// ============================================================
// Voxel downsampling: keeps the point closest to voxel centroid
// ============================================================
typedef uint64_t PointId;
typedef std::vector<PointId> PointIdList;
typedef uint64_t point_count_t;

Eigen::Vector3d computeCentroid(pcl::PointCloud<CustomPoint>::Ptr inputCloud, const PointIdList& ids)
{
    double mx = 0, my = 0, mz = 0;
    point_count_t n(0);
    for (auto const& j : ids)
    {
        auto update = [&n](double value, double average) {
            double delta = value - average;
            return average + delta / n;
        };
        n++;
        mx = update(inputCloud->points[j].x, mx);
        my = update(inputCloud->points[j].y, my);
        mz = update(inputCloud->points[j].z, mz);
    }
    Eigen::Vector3d centroid;
    centroid << mx, my, mz;
    return centroid;
}

void voxelCentroidNearestNeighborFilter(pcl::PointCloud<CustomPoint>::Ptr inputCloud, pcl::PointCloud<CustomPoint>::Ptr outputCloud, double m_cell)
{
    std::cout << "Downsampling with resolution " << m_cell << "m..." << std::endl;

    double x0 = inputCloud->points[0].x;
    double y0 = inputCloud->points[0].y;
    double z0 = inputCloud->points[0].z;

    std::map<std::tuple<size_t, size_t, size_t>, PointIdList> populated_voxel_ids;

    for (PointId id = 0; id < inputCloud->points.size(); ++id)
    {
        size_t r = static_cast<size_t>((inputCloud->points[id].y - y0) / m_cell);
        size_t c = static_cast<size_t>((inputCloud->points[id].x - x0) / m_cell);
        size_t d = static_cast<size_t>((inputCloud->points[id].z - z0) / m_cell);
        populated_voxel_ids[std::make_tuple(r, c, d)].push_back(id);
    }

    outputCloud->width  = populated_voxel_ids.size();
    outputCloud->height = 1;
    outputCloud->points.resize(outputCloud->width);

    PointId id = 0;
    for (auto const& t : populated_voxel_ids)
    {
        if (t.second.size() == 1)
        {
            outputCloud->points[id] = inputCloud->points[t.second[0]];
        }
        else if (t.second.size() == 2)
        {
            double y_center = y0 + (std::get<0>(t.first) + 0.5) * m_cell;
            double x_center = x0 + (std::get<1>(t.first) + 0.5) * m_cell;
            double z_center = z0 + (std::get<2>(t.first) + 0.5) * m_cell;

            auto dist = [&](int idx) {
                return pow(x_center - inputCloud->points[idx].x, 2) +
                       pow(y_center - inputCloud->points[idx].y, 2) +
                       pow(z_center - inputCloud->points[idx].z, 2);
            };
            outputCloud->points[id] = dist(t.second[0]) < dist(t.second[1])
                ? inputCloud->points[t.second[0]]
                : inputCloud->points[t.second[1]];
        }
        else
        {
            Eigen::Vector3d centroid = computeCentroid(inputCloud, t.second);
            PointId pmin;
            double dmin = std::numeric_limits<double>::max();
            for (auto const& p : t.second)
            {
                double sqr_dist = pow(centroid.x() - inputCloud->points[p].x, 2) +
                                  pow(centroid.y() - inputCloud->points[p].y, 2) +
                                  pow(centroid.z() - inputCloud->points[p].z, 2);
                if (sqr_dist < dmin) { dmin = sqr_dist; pmin = p; }
            }
            outputCloud->points[id] = inputCloud->points[pmin];
        }
        id++;
    }

    std::cout << "Downsampled: " << outputCloud->points.size() << " points." << std::endl;
}


// ============================================================
// Write output to LAS 1.4 / format 7 without PDAL.
//
// Replaces writeToLas (PDAL) + appendNormals (file re-write) with a
// single direct binary write. This eliminates:
//   - The third PDAL pipeline open (srcReader for passthrough)
//   - The costly appendNormals file re-read + re-write pass
//   - PDAL's POINT_ID remapping bugs
//   - PDAL's NormalX/Y/Z VLR corruption
//
// Layout: LAS 1.4, point format 7 (XYZ + RGBA + GPS + returns + scan)
// Extra dims written in this fixed order:
//   1. Passthrough extra dims from source (read from raw binary)
//      — excludes: NormalX/Y/Z, POINT_ID, labels (handled explicitly)
//   2. POINT_ID      (uint32)
//   3. Feature dims  (float32 each): scale-based and single
//   4. NormalX/Y/Z   (float32 × 3)  — always last, safe for PotreeConverter
//
// VLR Extra Bytes record (192 bytes/dim) is written for all extra dims.
// ============================================================

// Helper: write a uint8/16/32/64 little-endian value into a byte buffer
template<typename T>
static void wLE(std::vector<uint8_t>& buf, size_t off, T val) {
    std::memcpy(buf.data() + off, &val, sizeof(T));
}

// Build one 192-byte VLR Extra Bytes record.
// LAS 1.4 Extra Bytes dtype codes (Table 24):
//   1=uint8  2=int8  3=uint16 4=int16  5=uint32 6=int32
//   7=uint64 8=int64 9=float32 10=float64
static std::array<uint8_t,192> makeVlrDimRecord(const std::string& name, uint8_t dtype)
{
    std::array<uint8_t,192> rec{};
    rec[2] = dtype;
    // name at offset 4, max 32 chars null-padded
    std::memcpy(rec.data() + 4, name.c_str(), std::min(name.size(), size_t(31)));
    // description at offset 160 (32 chars) — leave empty
    return rec;
}

void writeToLas(const std::string& outputPath,
                const std::string& inputPath,
                pcl::PointCloud<CustomPoint>::Ptr cloud,
                const std::set<std::string>& requestedFeatures,
                double offsetX, double offsetY)
{
    std::cout << "Writing LAS output ... " << std::endl;

    const uint64_t N = cloud->points.size();

    // -------------------------------------------------------
    // 1. Read source raw point buffer for passthrough dims.
    //    We already parsed the VLR in readLasRawInfo; re-use it
    //    to know which extra dims existed in the source and at
    //    what offset, so we can copy them verbatim.
    // -------------------------------------------------------
    LasRawInfo srcInfo = readLasRawInfo(inputPath);

    // Pre-calculate all dimension names that will be WRITTEN by this tool.
    // Any existing dimension in the source that matches these names will be EXCLUDED from passthrough.
    auto dimName = [](const std::string& feat, int s) {
        std::ostringstream ss;
        ss << std::fixed << std::setprecision(1) << scales[s];
        std::string r = ss.str();
        std::replace(r.begin(), r.end(), '.', '_');
        return feat + "_" + r;
    };

    std::set<std::string> to_be_written;
    to_be_written.insert("point_id");
    to_be_written.insert("pointid");
    to_be_written.insert("normalx");
    to_be_written.insert("normal_x");
    to_be_written.insert("normaly");
    to_be_written.insert("normal_y");
    to_be_written.insert("normalz");
    to_be_written.insert("normal_z");
    to_be_written.insert("labels");
    to_be_written.insert("prediction");

    // Add scale-based features to exclusion mask
    for (const auto& feat : requestedFeatures) {
        if (AVAILABLE_SCALE_FEATURES.count(feat)) {
            for (int s = 0; s < scalesCount; s++) {
                std::string dn = dimName(feat, s);
                std::transform(dn.begin(), dn.end(), dn.begin(), ::tolower);
                to_be_written.insert(dn);
            }
        } else if (AVAILABLE_SINGLE_FEATURES.count(feat)) {
            std::string dn = feat;
            std::transform(dn.begin(), dn.end(), dn.begin(), ::tolower);
            to_be_written.insert(dn);
        }
    }

    auto isExcluded = [&](const std::string& name) {
        std::string lo = name;
        std::transform(lo.begin(), lo.end(), lo.begin(), ::tolower);
        return to_be_written.count(lo) > 0;
    };

    // Build list of passthrough dims (source extra dims minus excluded)
    struct PassthroughDim {
        std::string name;
        int         src_offset; // offset within extra-bytes block
        int         size;       // bytes (currently always 4)
        uint8_t     vlr_dtype;  // LAS VLR data type code
    };
    std::vector<PassthroughDim> passthroughDims;
    for (auto& d : srcInfo.extra_dims) {
        if (!isExcluded(d.name)) {
            // Map size to VLR dtype per LAS 1.4 spec:
            //   4 bytes → float32 = dtype 9 (preserve as float for generality)
            //   2 bytes → uint16  = dtype 3
            //   1 byte  → uint8   = dtype 1
            uint8_t dtype = (d.size == 4) ? 9 : (d.size == 2 ? 3 : 1);
            passthroughDims.push_back({ d.name, d.offset, d.size, dtype });
        }
    }

    // Bulk-read source point data once for passthrough
    std::vector<uint8_t> srcRaw;
    if (!passthroughDims.empty() && srcInfo.has_extra_bytes) {
        srcRaw.resize(static_cast<size_t>(N) * srcInfo.point_record_length);
        std::ifstream sf(inputPath, std::ios::binary);
        sf.seekg(srcInfo.offset_to_data);
        sf.read(reinterpret_cast<char*>(srcRaw.data()),
                static_cast<std::streamsize>(srcRaw.size()));
    }

    // -------------------------------------------------------
    // 2. Define output extra dims layout
    //    Order: passthrough | POINT_ID | features | NX NY NZ
    // -------------------------------------------------------
    struct OutExtraDim {
        std::string name;
        uint8_t     vlr_dtype;  // 5=uint32, 9=float32 (LAS 1.4 Extra Bytes spec)
        int         rec_offset; // byte offset within extra-bytes block of output record
    };
    std::vector<OutExtraDim> outExtra;
    int extraOffset = 0;

    // 2a. Passthrough
    for (auto& p : passthroughDims) {
        outExtra.push_back({ p.name, p.vlr_dtype, extraOffset });
        extraOffset += p.size;
    }

    // 2b. POINT_ID (uint32)
    const int off_pid = extraOffset;
    outExtra.push_back({ "POINT_ID", 5, off_pid }); // dtype 5 = uint32 per LAS 1.4 spec
    extraOffset += 4;

    // 2c. Feature dims (float32)
    // (dimName helper moved above)

    struct ScaleFeatureDef {
        std::string name;
        std::function<float(const CustomPoint&, int)> getter;
    };
    std::vector<ScaleFeatureDef> scaleFeatureDefs = {
        { "anisotropy",        [](const CustomPoint& p, int s) { return p.anisotropy[s]; } },
        { "height_above",      [](const CustomPoint& p, int s) { return p.heightAbove[s]; } },
        { "height_below",      [](const CustomPoint& p, int s) { return p.heightBelow[s]; } },
        { "linearity",         [](const CustomPoint& p, int s) { return p.linearity[s]; } },
        { "neighbours",        [](const CustomPoint& p, int s) { return p.neighbours[s]; } },
        { "omnivariance",      [](const CustomPoint& p, int s) { return p.omnivariance[s]; } },
        { "planarity",         [](const CustomPoint& p, int s) { return p.planarity[s]; } },
        { "sphericity",        [](const CustomPoint& p, int s) { return p.sphericity[s]; } },
        { "surface_variation", [](const CustomPoint& p, int s) { return p.surface_variation[s]; } },
        { "verticality",       [](const CustomPoint& p, int s) { return p.verticality[s]; } },
        { "vertical_range",    [](const CustomPoint& p, int s) { return p.verticalRange[s]; } },
    };

    struct SingleFeatureDef {
        std::string name;
        std::function<float(const CustomPoint&)> getter;
    };
    std::vector<SingleFeatureDef> singleFeatureDefs = {
        { "height", [](const CustomPoint& p) { return p.height; } },
    };

    // Map feature name → output record offset
    std::map<std::string, int> featOffset;

    for (auto& def : scaleFeatureDefs) {
        if (requestedFeatures.count(def.name)) {
            for (int s = 0; s < scalesCount; s++) {
                std::string dn = dimName(def.name, s);
                featOffset[dn] = extraOffset;
                outExtra.push_back({ dn, 9, extraOffset });
                extraOffset += 4;
            }
        }
    }
    for (auto& def : singleFeatureDefs) {
        if (requestedFeatures.count(def.name)) {
            featOffset[def.name] = extraOffset;
            outExtra.push_back({ def.name, 9, extraOffset });
            extraOffset += 4;
        }
    }

    // 2d. Normals (float32 × 3) — always last
    const int off_nx = extraOffset;      extraOffset += 4;
    const int off_ny = extraOffset;      extraOffset += 4;
    const int off_nz = extraOffset;      extraOffset += 4;
    outExtra.push_back({ "normal_x", 9, off_nx });
    outExtra.push_back({ "normal_y", 9, off_ny });
    outExtra.push_back({ "normal_z", 9, off_nz });

    // -------------------------------------------------------
    // 3. Compute point record size
    //    LAS 1.4 format 7 base = 36 bytes
    //    + extra dims
    // -------------------------------------------------------
    const int BASE_SIZE   = 36;                          // format 7
    const int EXTRA_SIZE  = extraOffset;
    const int REC_LEN     = BASE_SIZE + EXTRA_SIZE;

    // -------------------------------------------------------
    // 4. Compute LAS header values
    // -------------------------------------------------------

    // Re-read scale + offset from source header for precision
    double scaleX = 0.001, scaleY = 0.001, scaleZ = 0.001;
    double offX   = offsetX, offY = offsetY, offZ = 0.0;
    {
        std::ifstream hf(inputPath, std::ios::binary);
        if (hf) {
            hf.seekg(131);
            hf.read(reinterpret_cast<char*>(&scaleX), 8);
            hf.read(reinterpret_cast<char*>(&scaleY), 8);
            hf.read(reinterpret_cast<char*>(&scaleZ), 8);
            hf.read(reinterpret_cast<char*>(&offX),   8);
            hf.read(reinterpret_cast<char*>(&offY),   8);
            hf.read(reinterpret_cast<char*>(&offZ),   8);
        }
    }

    // VLR size: one 54-byte header + N * 192-byte records
    const uint32_t numVlrDims   = static_cast<uint32_t>(outExtra.size());
    const uint32_t vlrBodySize  = numVlrDims * 192;
    const uint16_t headerSize   = 375;  // LAS 1.4 fixed header size
    const uint32_t numVlrs      = 1;    // one VLR (Extra Bytes)
    const uint32_t offsetToData = headerSize + 54 + vlrBodySize;

    // -------------------------------------------------------
    // 5. Build the 375-byte LAS 1.4 header
    // -------------------------------------------------------
    std::vector<uint8_t> header(headerSize, 0);

    // File signature "LASF"
    std::memcpy(header.data(), "LASF", 4);
    // Global Encoding (offset 6, uint16):
    //   bit 0 = GPS Time Type (1 = standard GPS time)
    //   bit 4 = WKT flag — REQUIRED for point formats 6-10 by LAS 1.4 spec
    wLE<uint16_t>(header, 6, 0x0011u); // bits 0 + 4
    // Version Major/Minor
    header[24] = 1;
    header[25] = 4;
    // System identifier (offset 26, 32 bytes)
    std::memcpy(header.data() + 26, "feature_extraction", 18);
    // Generating software (offset 58, 32 bytes)
    std::memcpy(header.data() + 58, "feature_extraction_viewer", 25);
    // File creation day/year — leave 0
    // Header size
    wLE<uint16_t>(header, 94,  headerSize);
    // Offset to point data
    wLE<uint32_t>(header, 96,  offsetToData);
    // Number of VLRs
    wLE<uint32_t>(header, 100, numVlrs);
    // Point data format = 7
    header[104] = 7;
    // Point data record length
    wLE<uint16_t>(header, 105, static_cast<uint16_t>(REC_LEN));
    // Legacy point count (0 for LAS 1.4 if > 2^32)
    wLE<uint32_t>(header, 107, (N <= 0xFFFFFFFFu) ? static_cast<uint32_t>(N) : 0u);
    // Scale
    wLE<double>(header, 131, scaleX);
    wLE<double>(header, 139, scaleY);
    wLE<double>(header, 147, scaleZ);
    // Offset
    wLE<double>(header, 155, offX);
    wLE<double>(header, 163, offY);
    wLE<double>(header, 171, offZ);
    // Bounding box — compute from cloud
    double xmin=1e38, xmax=-1e38, ymin=1e38, ymax=-1e38, zmin=1e38, zmax=-1e38;
    for (auto& pt : cloud->points) {
        double wx = pt.x + offsetX, wy = pt.y + offsetY, wz = pt.z;
        if (wx < xmin) xmin=wx; if (wx > xmax) xmax=wx;
        if (wy < ymin) ymin=wy; if (wy > ymax) ymax=wy;
        if (wz < zmin) zmin=wz; if (wz > zmax) zmax=wz;
    }
    wLE<double>(header, 179, xmax); wLE<double>(header, 187, xmin);
    wLE<double>(header, 195, ymax); wLE<double>(header, 203, ymin);
    wLE<double>(header, 211, zmax); wLE<double>(header, 219, zmin);
    // LAS 1.4 point count (uint64 at offset 247)
    wLE<uint64_t>(header, 247, N);

    // -------------------------------------------------------
    // 6. Build VLR for Extra Bytes (LASF_Spec, record_id=4)
    // -------------------------------------------------------
    std::vector<uint8_t> vlr(54 + vlrBodySize, 0);
    // VLR header (54 bytes)
    // reserved (2 bytes) = 0
    std::memcpy(vlr.data() + 2,  "LASF_Spec",       9);
    wLE<uint16_t>(vlr, 18, 4);                               // record_id = 4
    wLE<uint16_t>(vlr, 20, static_cast<uint16_t>(vlrBodySize));
    std::memcpy(vlr.data() + 22, "Extra Bytes Record", 18);  // description
    // VLR body: one 192-byte record per dim
    for (uint32_t k = 0; k < numVlrDims; ++k) {
        auto rec = makeVlrDimRecord(outExtra[k].name, outExtra[k].vlr_dtype);
        std::memcpy(vlr.data() + 54 + k * 192, rec.data(), 192);
    }

    // -------------------------------------------------------
    // 7. Write file
    // -------------------------------------------------------
    std::ofstream out(outputPath, std::ios::binary);
    if (!out) {
        std::cerr << "Cannot write: " << outputPath << std::endl;
        return;
    }

    out.write(reinterpret_cast<char*>(header.data()), header.size());
    out.write(reinterpret_cast<char*>(vlr.data()),    vlr.size());

    // Write point records one by one
    std::vector<uint8_t> rec(REC_LEN, 0);

    for (uint64_t i = 0; i < N; ++i)
    {
        const CustomPoint& pt = cloud->points[i];
        std::fill(rec.begin(), rec.end(), 0);

        // ── LAS 1.4 format 7 base record (36 bytes) ──────────────────
        // Spec: https://www.asprs.org/wp-content/uploads/2019/07/LAS_1_4_r15.pdf
        //  0  int32   X
        //  4  int32   Y
        //  8  int32   Z
        // 12  uint16  Intensity
        // 14  uint8   ReturnBits  [0-3]=ReturnNumber [4-7]=NumberOfReturns
        // 15  uint8   Flags       [0-1]=ClassificationFlags [2-3]=ScannerChannel
        //                         [4]=ScanDirectionFlag [5]=EdgeOfFlightLine
        // 16  uint8   Classification
        // 17  uint8   UserData
        // 18  int16   ScanAngle
        // 20  uint16  PointSourceId
        // 22  float64 GPSTime
        // 30  uint16  Red
        // 32  uint16  Green
        // 34  uint16  Blue

        double wx = pt.x + offsetX;
        double wy = pt.y + offsetY;
        double wz = pt.z;
        int32_t ix = static_cast<int32_t>(std::round((wx - offX) / scaleX));
        int32_t iy = static_cast<int32_t>(std::round((wy - offY) / scaleY));
        int32_t iz = static_cast<int32_t>(std::round((wz - offZ) / scaleZ));
        wLE<int32_t> (rec,  0, ix);
        wLE<int32_t> (rec,  4, iy);
        wLE<int32_t> (rec,  8, iz);
        wLE<uint16_t>(rec, 12, static_cast<uint16_t>(pt.intensity));
        rec[14] = (static_cast<uint8_t>(pt.return_num)         & 0x0F) |
                  ((static_cast<uint8_t>(pt.number_of_returns)  & 0x0F) << 4);
        rec[15] = 0;  // classification flags, scanner channel
        rec[16] = static_cast<uint8_t>(pt.class_id);   // Classification
        rec[17] = 0;                                    // UserData
        wLE<int16_t> (rec, 18, static_cast<int16_t>(pt.scan_angle));
        wLE<uint16_t>(rec, 20, 0);                      // PointSourceId
        // GPSTime @ 22 — leave 0.0 (double, 8 bytes)
        wLE<uint16_t>(rec, 30, static_cast<uint16_t>(pt.r / color_bitter));
        wLE<uint16_t>(rec, 32, static_cast<uint16_t>(pt.g / color_bitter));
        wLE<uint16_t>(rec, 34, static_cast<uint16_t>(pt.b / color_bitter));

        // ── Extra dims ────────────────────────────────────────────────

        // 2a. Passthrough from source raw buffer
        if (!srcRaw.empty()) {
            for (size_t k = 0; k < passthroughDims.size(); ++k) {
                auto& pd = passthroughDims[k];
                auto& od = outExtra[k];
                size_t srcOff = static_cast<size_t>(pt.point_source_id)
                                * srcInfo.point_record_length
                                + srcInfo.extra_bytes_offset
                                + pd.src_offset;
                if (srcOff + pd.size <= srcRaw.size())
                    std::memcpy(rec.data() + BASE_SIZE + od.rec_offset,
                                srcRaw.data() + srcOff, pd.size);
            }
        }

        // 2b. POINT_ID
        wLE<uint32_t>(rec, BASE_SIZE + off_pid, pt.raw_point_id);

        // 2c. Scale-based features
        for (auto& def : scaleFeatureDefs) {
            if (requestedFeatures.count(def.name)) {
                for (int s = 0; s < scalesCount; s++) {
                    float val = def.getter(pt, s);
                    if (!std::isfinite(val)) val = 0.0f;
                    wLE<float>(rec, BASE_SIZE + featOffset.at(dimName(def.name, s)), val);
                }
            }
        }

        // 2d. Single features
        for (auto& def : singleFeatureDefs) {
            if (requestedFeatures.count(def.name)) {
                float val = def.getter(pt);
                if (!std::isfinite(val)) val = 0.0f;
                wLE<float>(rec, BASE_SIZE + featOffset.at(def.name), val);
            }
        }

        // 2e. Normals
        auto safeF = [](float v) { return std::isfinite(v) ? v : 0.0f; };
        float nx = safeF(pt.raw_normal_x);
        float ny = safeF(pt.raw_normal_y);
        float nz = safeF(pt.raw_normal_z);
        wLE<float>(rec, BASE_SIZE + off_nx, nx);
        wLE<float>(rec, BASE_SIZE + off_ny, ny);
        wLE<float>(rec, BASE_SIZE + off_nz, nz);

        out.write(reinterpret_cast<char*>(rec.data()), REC_LEN);
    }

    out.close();
    std::cout << "LAS written: " << outputPath
              << "  (" << N << " pts, " << REC_LEN << " bytes/pt, "
              << outExtra.size() << " extra dims)" << std::endl;
}

// ============================================================
// Parse the --features argument value.
// Accepts comma-separated list, e.g.: planarity,linearity,height
// ============================================================
std::set<std::string> parseFeatureList(const std::string& featuresArg)
{
    std::set<std::string> result;
    std::stringstream ss(featuresArg);
    std::string token;
    while (std::getline(ss, token, ','))
    {
        token.erase(0, token.find_first_not_of(" \t"));
        token.erase(token.find_last_not_of(" \t") + 1);
        if (!token.empty())
            result.insert(token);
    }
    return result;
}

// ============================================================
// Parse the --radius argument value.
// Accepts comma-separated list, e.g.: 0.5,1.0,2.0
// Updates global scalesCount and scales array.
// ============================================================
void parseRadiusList(const std::string& radiusArg)
{
    std::stringstream ss(radiusArg);
    std::string token;
    int count = 0;
    while (std::getline(ss, token, ','))
    {
        token.erase(0, token.find_first_not_of(" \t"));
        token.erase(token.find_last_not_of(" \t") + 1);
        if (!token.empty() && count < MAX_SCALES)
            scales[count++] = std::stof(token);
    }
    if (count > 0)
        scalesCount = count;
}

// ============================================================
// MAIN
// Usage:
//   ./feature_extraction <input_file> <output_file> [--sampling_resolution sr] [--features f1,f2,...] [--radius r1,r2,...]
//
// Examples:
//   ./feature_extraction /data/in.las /data/out.las
//   ./feature_extraction /data/in.las /data/out.las --sampling_resolution 0.5
//   ./feature_extraction /data/in.las /data/out.las --sampling_resolution 0.5 --features planarity,linearity,height
//   ./feature_extraction /data/in.las /data/out.las --features planarity,verticality --radius 0.5,1.0,2.0
//   ./feature_extraction /data/in.las /data/out.las --list-features
// ============================================================
int main(int argc, char** argv)
{
    if (argc < 3)
    {
        std::cout << "\nUsage: " << argv[0] << " <input_file> <output_file> [--sampling_resolution sr] [--features f1,f2,...] [--radius r1,r2,...]\n" << std::endl;
        std::cout << "  --list-features   Print available feature names and exit" << std::endl;
        printAvailableFeatures();
        return 0;
    }

    for (int a = 1; a < argc; a++)
    {
        if (std::string(argv[a]) == "--list-features")
        {
            printAvailableFeatures();
            return 0;
        }
    }

    const std::string inputFile  = argv[1];
    const std::string outputFile = argv[2];

    bool doSubsampling = false;
    std::set<std::string> requestedFeatures;
    bool useAllFeatures = true;

    for (int a = 3; a < argc; a++)
    {
        std::string arg(argv[a]);

        if (arg == "--features" && a + 1 < argc)
        {
            requestedFeatures = parseFeatureList(std::string(argv[++a]));
            useAllFeatures = false;

            for (auto& f : requestedFeatures)
            {
                if (!AVAILABLE_SCALE_FEATURES.count(f) && !AVAILABLE_SINGLE_FEATURES.count(f))
                    std::cerr << "WARNING: Unknown feature '" << f << "' will be ignored." << std::endl;
            }
        }
        else if (arg == "--radius" && a + 1 < argc)
        {
            std::string radiusStr = argv[++a];
            while (a + 1 < argc && std::string(argv[a+1]).substr(0, 2) != "--")
                radiusStr += argv[++a];
            parseRadiusList(radiusStr);
        }
        else if (arg == "--sampling_resolution" && a + 1 < argc)
        {
            samplingResolution = std::stof(argv[++a]);
            doSubsampling = true;
        }
        else
        {
            std::cerr << "WARNING: Unrecognized argument '" << arg << "'" << std::endl;
        }
    }

    if (useAllFeatures)
    {
        for (auto& f : AVAILABLE_SCALE_FEATURES)  requestedFeatures.insert(f);
        for (auto& f : AVAILABLE_SINGLE_FEATURES) requestedFeatures.insert(f);
    }

    auto global_start = now_t();

    std::string ext = std::filesystem::path(inputFile).extension().string();
    if (ext != ".laz" && ext != ".las") {
        std::cerr << "Skipping non-LAS file: " << inputFile << std::endl;
        return 1;
    }

    // ----------------------------------------------------------
    // 1. Read point cloud
    // ----------------------------------------------------------
    std::cout << "\nLoading File " << inputFile << " ..." << std::endl;
    pcl::PointCloud<CustomPoint>::Ptr inputCloud(new pcl::PointCloud<CustomPoint>);
    laz2pcl(inputFile, inputCloud);

    // Save offset for output (to restore original coordinates).
    // Read directly from the first point in the raw binary — no PDAL needed.
    double offsetX = 0, offsetY = 0;
    {
        LasRawInfo ri = readLasRawInfo(inputFile);
        if (ri.point_count > 0) {
            // X and Y are the first two int32 fields in every LAS point record,
            // scaled and offset as stored in the header (offsets 155 and 163).
            std::ifstream rf(inputFile, std::ios::binary);
            int32_t rawX = 0, rawY = 0;
            rf.seekg(ri.offset_to_data);
            rf.read(reinterpret_cast<char*>(&rawX), 4);
            rf.read(reinterpret_cast<char*>(&rawY), 4);
            // Read scale/offset from header
            double scaleX = 0.001, scaleY = 0.001;
            double hOffX  = 0.0,   hOffY  = 0.0;
            rf.seekg(131); rf.read(reinterpret_cast<char*>(&scaleX), 8);
            rf.seekg(139); rf.read(reinterpret_cast<char*>(&scaleY), 8);
            rf.seekg(155); rf.read(reinterpret_cast<char*>(&hOffX),  8);
            rf.seekg(163); rf.read(reinterpret_cast<char*>(&hOffY),  8);
            offsetX = rawX * scaleX + hOffX;
            offsetY = rawY * scaleY + hOffY;
        }
    }

    // ----------------------------------------------------------
    // 2. Optionally downsample
    // ----------------------------------------------------------
    pcl::PointCloud<CustomPoint>::Ptr filteredCloud(new pcl::PointCloud<CustomPoint>);
    if (doSubsampling){
        std::cout << "Subsampling ..." << std::endl;
        voxelCentroidNearestNeighborFilter(inputCloud, filteredCloud, samplingResolution);
    }
    else
        filteredCloud = inputCloud;

    // ----------------------------------------------------------
    // 3. Build search trees
    // ----------------------------------------------------------
    std::cout << "Building Search Trees ..." << std::endl;
    pcl::search::Search<CustomPoint>::Ptr tree =
        std::make_shared<pcl::search::Octree<CustomPoint>>(0.2);
    tree->setInputCloud(filteredCloud);

    // ----------------------------------------------------------
    // 4. Compute features
    // ----------------------------------------------------------
    std::cout << "Selected Features: ";
    for (auto& f : requestedFeatures) std::cout << f << " ";
    std::cout << "with radius: ";
    for (int s = 0; s < scalesCount; s++) std::cout << scales[s] << " ";
    std::cout << std::endl;

    computeFeatures(filteredCloud, tree);

    // ----------------------------------------------------------
    // 5. Write output LAS
    // ----------------------------------------------------------
    writeToLas(outputFile, inputFile, filteredCloud, requestedFeatures, offsetX, offsetY);
    // Note: normals are written directly inside writeToLas — no separate appendNormals needed.

    double total = elapsed(global_start);
    int mn = (int)(total / 60);
    int sc = (int)total % 60;
    if (mn > 0)
        std::cout << "Processing time: " << mn << " min " << sc << " sec" << std::endl;
    else
        std::cout << "Processing time: " << sc << " sec" << std::endl;

    return 0;
}