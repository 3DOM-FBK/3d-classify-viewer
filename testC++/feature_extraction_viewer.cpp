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
#include <pdal/io/LasWriter.hpp>
#include <pdal/io/BufferReader.hpp>
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
// Read LAS/LAZ via PDAL and populate a PCL PointCloud
// Shifts points to local coordinate system using first point as origin
// ============================================================
// ============================================================
// Parse LAS header to get offset_to_data and point_data_record_length
// so we can read raw extra bytes directly from the binary file.
// ============================================================
struct LasRawInfo {
    uint32_t offset_to_data;
    uint16_t point_record_length;
    uint32_t point_count;
    bool has_extra_bytes;    // true if point_record_length > base format size
    int extra_bytes_offset;  // byte offset within point record where extras start
};

LasRawInfo readLasRawInfo(const std::string& fileName)
{
    LasRawInfo info = {};
    std::ifstream f(fileName, std::ios::binary);
    if (!f) return info;

    f.seekg(94);  // offset_to_point_data is at byte 94
    f.read(reinterpret_cast<char*>(&info.offset_to_data), 4);

    f.seekg(104); // point_data_record_length at byte 104
    f.read(reinterpret_cast<char*>(&info.point_record_length), 2);

    f.seekg(107); // number_of_point_records at byte 107
    f.read(reinterpret_cast<char*>(&info.point_count), 4);

    // LAS 1.2 format 3 base size = 34 bytes (x,y,z,intensity,flags,class,angle,user,src,gpstime,r,g,b)
    // If point_record_length > 34, there are extra bytes
    int base_size = 34;
    info.has_extra_bytes = (info.point_record_length > base_size);
    info.extra_bytes_offset = base_size;

    // std::cout << "LAS raw info: offset=" << info.offset_to_data
    //           << " rec_len=" << info.point_record_length
    //           << " extra_bytes=" << (info.point_record_length - base_size) << std::endl;
    return info;
}

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
    // pdal::las::Header las_header = las_reader.header();
    bool hasColor = point_view->hasDim(pdal::Dimension::Id::Red) &&
                    point_view->hasDim(pdal::Dimension::Id::Green) &&
                    point_view->hasDim(pdal::Dimension::Id::Blue);

    double offsetX = 0;
    double offsetY = 0;
    int count = 0;

    // First pass: compute offset from first point
    for (pdal::PointId idx = 0; idx < point_view->size(); ++idx)
    {
        using namespace pdal::Dimension;
        double x = point_view->getFieldAs<double>(Id::X, idx);
        double y = point_view->getFieldAs<double>(Id::Y, idx);

        if (count == 0)
        {
            offsetX = x;
            offsetY = y;
            // std::cout << "Offset X: " << offsetX << "  Y: " << offsetY << std::endl;
        }
        count++;
    }

    // std::cout << "- Point count: " << count << std::endl;

    outputCloud->width  = count;
    outputCloud->height = 1;
    outputCloud->points.resize(count);

    // Initialize all raw extra fields to 0 to avoid NaN if not present in file
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

    int i = 0;
    for (pdal::PointId idx = 0; idx < point_view->size(); ++idx)
    {
        using namespace pdal::Dimension;
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
        // We use i (not POINT_ID or PointSourceId) to avoid float precision loss
        // and dependency on file-specific fields.
        outputCloud->points[i].point_source_id = static_cast<float>(i);

        if (hasColor)
        {
            outputCloud->points[i].r = static_cast<float>(point_view->getFieldAs<int>(Id::Red,   idx) * color_bitter);
            outputCloud->points[i].g = static_cast<float>(point_view->getFieldAs<int>(Id::Green, idx) * color_bitter);
            outputCloud->points[i].b = static_cast<float>(point_view->getFieldAs<int>(Id::Blue,  idx) * color_bitter);
        }

#ifdef REMAP_CLASSES
        // outputCloud->points[i].class_id = class_mapping[(int)outputCloud->points[i].class_id];
#endif
        i++;
    }

    // std::cout << "Loaded " << count << " points" << std::endl;

    // ----------------------------------------------------------
    // Read raw extra bytes directly from LAS binary file.
    // This handles extra dims written as raw bytes (e.g. by ply2las)
    // that PDAL may not expose as named dims without correct VLRs.
    // Expected layout after base 34 bytes: normal_x(f32), normal_y(f32), normal_z(f32), POINT_ID(u32)
    // ----------------------------------------------------------
    LasRawInfo rawInfo = readLasRawInfo(fileName);
    if (rawInfo.has_extra_bytes)
    {
        int extra_size = rawInfo.point_record_length - rawInfo.extra_bytes_offset;
        // std::cout << "Reading " << extra_size << " extra bytes/point from raw LAS..." << std::endl;

        std::ifstream rawf(fileName, std::ios::binary);
        for (int idx = 0; idx < count; ++idx)
        {
            // Seek to start of extra bytes for this point
            std::streampos pos = rawInfo.offset_to_data
                                 + (std::streampos)idx * rawInfo.point_record_length
                                 + rawInfo.extra_bytes_offset;
            rawf.seekg(pos);

            // Read normal_x, normal_y, normal_z (3 x float32) if available
            if (extra_size >= 12)
            {
                rawf.read(reinterpret_cast<char*>(&outputCloud->points[idx].raw_normal_x), 4);
                rawf.read(reinterpret_cast<char*>(&outputCloud->points[idx].raw_normal_y), 4);
                rawf.read(reinterpret_cast<char*>(&outputCloud->points[idx].raw_normal_z), 4);
            }
            // Read POINT_ID (uint32) if available
            if (extra_size >= 16)
            {
                rawf.read(reinterpret_cast<char*>(&outputCloud->points[idx].raw_point_id), 4);
            }
        }
        // std::cout << "Raw extra bytes loaded." << std::endl;
    }
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

    // Apri il terminale reale (funziona anche quando stdout è una pipe)
    FILE* tty = fopen("/dev/tty", "w");
    if (!tty) tty = stderr;

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
                float perc  = (progress * 100.0f) / total;
                int barWidth = 50;
                int filled  = (int)(barWidth * progress / total);

                auto now     = std::chrono::steady_clock::now();
                double elapsed = std::chrono::duration<double>(now - startTime).count();
                double eta   = (elapsed / progress) * (total - progress);

                std::string bar = "[";
                for (int b = 0; b < barWidth; b++)
                    bar += (b < filled) ? "█" : " ";
                bar += "]";

                int min = static_cast<int>(eta / 60);
                int sec = static_cast<int>(eta) % 60;

                // Scrivi sul terminale reale, non sulla pipe
                fprintf(tty, "\rComputing Features %3.0f%% %s %d/%d [ ETA: %02d:%02d ] ",
                    perc, bar.c_str(), progress, total, min, sec);
                fflush(tty);
            }
        }
    }

    fprintf(tty, "\n");
    fflush(tty);

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
// Append normals as raw extra bytes directly into a LAS file.
// PDAL remaps "NormalX/Y/Z" to internal known dims with non-UTF8
// VLR metadata that crashes PotreeConverter. Writing them as raw
// bytes after PDAL output bypasses this issue entirely.
//
// The LAS output from writeToLas has record_length N bytes/point.
// We extend each record by 12 bytes (3 x float32) and update:
//   - point_data_record_length (offset 104, uint16)
// We also write a minimal Extra Bytes VLR for the 3 normal fields.
// ============================================================
void appendNormals(const std::string& lasPath,
                   pcl::PointCloud<CustomPoint>::Ptr cloud)
{
    // std::cout << "Appending normals to LAS..." << std::endl;

    // --- Read current header info ---
    std::fstream f(lasPath, std::ios::in | std::ios::out | std::ios::binary);
    if (!f) { std::cerr << "Cannot open " << lasPath << std::endl; return; }

    // offset_to_point_data @ 96 (LAS 1.4 header is 375 bytes)
    // Note: in LAS 1.4 the offset_to_point_data field is at byte 96
    uint32_t offset_to_data;
    f.seekg(96); f.read(reinterpret_cast<char*>(&offset_to_data), 4);

    uint16_t rec_len;
    f.seekg(105); f.read(reinterpret_cast<char*>(&rec_len), 2);

    uint64_t num_points;
    f.seekg(247); f.read(reinterpret_cast<char*>(&num_points), 8);

    // std::cout << "  offset=" << offset_to_data
    //           << " rec_len=" << rec_len
    //           << " num_points=" << num_points << std::endl;

    if ((size_t)num_points != cloud->points.size()) {
        std::cerr << "  WARNING: point count mismatch ("
                  << num_points << " vs " << cloud->points.size()
                  << ") - skipping normals" << std::endl;
        return;
    }

    // --- Read all existing point data ---
    std::vector<std::vector<uint8_t>> points(num_points, std::vector<uint8_t>(rec_len));
    f.seekg(offset_to_data);
    for (uint64_t i = 0; i < num_points; ++i)
        f.read(reinterpret_cast<char*>(points[i].data()), rec_len);

    // --- New record length = old + 12 bytes (nx, ny, nz as float32) ---
    uint16_t new_rec_len = rec_len + 12;

    // Update point_data_record_length in header
    f.seekp(105); f.write(reinterpret_cast<char*>(&new_rec_len), 2);

    // --- Rewrite all points with appended normals ---
    f.seekp(offset_to_data);
    for (uint64_t i = 0; i < num_points; ++i)
    {
        // Write existing point data
        f.write(reinterpret_cast<char*>(points[i].data()), rec_len);

        // Append normals (clamp NaN/inf to 0)
        auto safeF = [](float v) { return std::isfinite(v) ? v : 0.0f; };
        float nx = safeF(cloud->points[i].raw_normal_x);
        float ny = safeF(cloud->points[i].raw_normal_y);
        float nz = safeF(cloud->points[i].raw_normal_z);
        f.write(reinterpret_cast<char*>(&nx), 4);
        f.write(reinterpret_cast<char*>(&ny), 4);
        f.write(reinterpret_cast<char*>(&nz), 4);
    }

    f.close();
    // std::cout << "  Normals appended (" << num_points << " points, +12 bytes/point)" << std::endl;
}

// ============================================================
// Write output to LAS file using PDAL.
// Only the features requested via CLI (requestedFeatures) are written.
// x, y, z and all original LAS fields are ALWAYS written.
//
// Scale-based features are written as:  featureName_radius (e.g. planarity_0_8)
// Single features are written with their name as-is.
//
// If you add a new feature to CustomPoint, add its setField block here.
// ============================================================
void writeToLas(const std::string& outputPath,
                const std::string& inputPath,  // re-read to passthrough ALL extra dims
                pcl::PointCloud<CustomPoint>::Ptr cloud,
                const std::set<std::string>& requestedFeatures,
                double offsetX, double offsetY)
{
    std::cout << "Writing LAS output ... " << std::endl;

    // -------------------------------------------------------
    // Re-read input file to get ALL dims (standard + extra).
    // This is the simplest and most reliable way to passthrough
    // any extra dims (normals, POINT_ID, etc.) regardless of how
    // they were written. Index in srcView == index in inputCloud
    // because laz2pcl reads points in the same order.
    // -------------------------------------------------------
    pdal::PointTable srcTable;
    pdal::LasReader srcReader;
    {
        pdal::Option opt("filename", inputPath);
        pdal::Options opts; opts.add(opt);
        srcReader.setOptions(opts);
        srcReader.prepare(srcTable);
    }
    pdal::PointViewPtr srcView = *srcReader.execute(srcTable).begin();

    std::set<std::string> standardDimNames = {
        "X", "Y", "Z", "Intensity", "ReturnNumber", "NumberOfReturns",
        "ScanDirectionFlag", "EdgeOfFlightLine", "Classification",
        "ScanAngleRank", "UserData", "PointSourceId",
        "GpsTime", "Red", "Green", "Blue",
        // LAS 1.4 format 6/7 extra standard fields - skip passthrough to avoid VLR corruption
        "ScannerChannel", "ClassificationFlags", "ScanAngle",
        // Also skip any PDAL internal normal dim names that get remapped
        "NormalX", "NormalY", "NormalZ", "Synthetic", "KeyPoint", "Withheld", "Overlap"
    };

    // Discover all extra dims and print them
    std::vector<std::string> extraDimNames;
    std::vector<pdal::Dimension::Id> srcDimIds;
    // std::cout << "\nAll dims in source file:" << std::endl;
    for (const auto& dimId : srcView->dims())
    {
        std::string dname = pdal::Dimension::name(dimId);
        pdal::Dimension::Type dtype = srcView->layout()->dimType(dimId);
        bool isStd = standardDimNames.count(dname) > 0;
        // std::cout << "  " << dname << " [" << pdal::Dimension::toName(pdal::Dimension::base(dtype)) << "]"
        //           << (isStd ? "" : " <-- EXTRA") << std::endl;
        if (!isStd)
        {
            extraDimNames.push_back(dname);
            srcDimIds.push_back(dimId);
        }
    }

    if (extraDimNames.empty()){
        // std::cout << "No extra dims found in source file." << std::endl;
    }
    else
    {
        // std::cout << "Passthrough extra dims (" << extraDimNames.size() << "): ";
        // for (auto& n : extraDimNames) std::cout << n << " ";
        // std::cout << std::endl;
    }

    // -------------------------------------------------------
    // Build output layout
    // -------------------------------------------------------
    pdal::PointTable table;
    pdal::PointLayoutPtr layout = table.layout();

    // Standard LAS dimensions (always present - passthrough from input)
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

    // Register all extra dims from source with their original type
    std::map<std::string, pdal::Dimension::Id> passthroughDims;
    for (size_t k = 0; k < extraDimNames.size(); ++k)
    {
        pdal::Dimension::Type dtype = srcView->layout()->dimType(srcDimIds[k]);
        passthroughDims[extraDimNames[k]] = layout->registerOrAssignDim(extraDimNames[k], dtype);
    }

    // NOTE: Normali NON scritte come extra dims PDAL perché PDAL le rinomina
    // in NormalX/NormalY/NormalZ con VLR metadata non-UTF8 che crasha PotreeConverter.
    // Le normali vengono aggiunte come raw bytes DOPO la scrittura PDAL (vedi appendNormals).
    // POINT_ID scritto come extra dim standard (nome lowercase = no conflitto PDAL).
    pdal::Dimension::Id dimPID = layout->registerOrAssignDim("point_id", pdal::Dimension::Type::Unsigned32);

    // -------------------------------------------------------
    // Register extra dims for requested features.
    // Scale-based features → featureName_radius (e.g. planarity_0_8, planarity_1_2)
    // Single features      → featureName
    // -------------------------------------------------------
    std::map<std::string, pdal::Dimension::Id> extraDims;

    auto registerExtra = [&](const std::string& name) {
        extraDims[name] = layout->registerOrAssignDim(name, pdal::Dimension::Type::Float);
    };

    // Scale-based features
    struct ScaleFeatureDef {
        std::string name;
        std::function<float(const CustomPoint&, int)> getter;
    };

    std::vector<ScaleFeatureDef> scaleFeatureDefs = {
        { "anisotropy",     [](const CustomPoint& p, int s) { return p.anisotropy[s]; } },
        { "height_above",     [](const CustomPoint& p, int s) { return p.heightAbove[s]; } },
        { "height_below",     [](const CustomPoint& p, int s) { return p.heightBelow[s]; } },
        { "linearity",        [](const CustomPoint& p, int s) { return p.linearity[s]; } },
        { "neighbours",       [](const CustomPoint& p, int s) { return p.neighbours[s]; } },
        { "omnivariance",     [](const CustomPoint& p, int s) { return p.omnivariance[s]; } },
        { "planarity",        [](const CustomPoint& p, int s) { return p.planarity[s]; } },
        { "sphericity",       [](const CustomPoint& p, int s) { return p.sphericity[s]; } },
        { "surface_variation",[](const CustomPoint& p, int s) { return p.surface_variation[s]; } },
        { "verticality",      [](const CustomPoint& p, int s) { return p.verticality[s]; } },
        { "vertical_range",   [](const CustomPoint& p, int s) { return p.verticalRange[s]; } },
    };

    // Build dim name from feature name + actual radius value (e.g. "planarity_0_8")
    // Uses the same formatDimName logic: replaces '.' with '_'
    auto dimName = [](const std::string& feat, int s) {
        std::ostringstream ss;
        ss << std::fixed << std::setprecision(1) << scales[s];
        std::string r = ss.str();
        std::replace(r.begin(), r.end(), '.', '_');
        return feat + "_" + r;
    };

    for (auto& def : scaleFeatureDefs)
    {
        if (requestedFeatures.count(def.name))
        {
            for (int s = 0; s < scalesCount; s++)
                registerExtra(dimName(def.name, s));
        }
    }

    // Single features
    struct SingleFeatureDef {
        std::string name;
        std::function<float(const CustomPoint&)> getter;
    };

    std::vector<SingleFeatureDef> singleFeatureDefs = {
        { "height",             [](const CustomPoint& p) { return p.height; } },
        // { "intensity",          [](const CustomPoint& p) { return p.intensity; } },
        // { "number_of_returns",  [](const CustomPoint& p) { return p.number_of_returns; } },
        // { "return_num",         [](const CustomPoint& p) { return p.return_num; } },
        // { "scan_angle",         [](const CustomPoint& p) { return p.scan_angle; } },
    };

    for (auto& def : singleFeatureDefs)
    {
        if (requestedFeatures.count(def.name))
            registerExtra(def.name);
    }

    // -------------------------------------------------------
    // Fill PointView
    // -------------------------------------------------------
    pdal::PointViewPtr view(new pdal::PointView(table));

    for (size_t i = 0; i < cloud->points.size(); ++i)
    {
        const CustomPoint& pt = cloud->points[i];

        // Restore original coordinates (undo local shift)
        view->setField(pdal::Dimension::Id::X, i, (double)pt.x + offsetX);
        view->setField(pdal::Dimension::Id::Y, i, (double)pt.y + offsetY);
        view->setField(pdal::Dimension::Id::Z, i, (double)pt.z);

        // Standard fields - passthrough from input
        view->setField(pdal::Dimension::Id::Classification,  i, (uint8_t)pt.class_id);
        view->setField(pdal::Dimension::Id::Intensity,       i, (uint16_t)pt.intensity);
        view->setField(pdal::Dimension::Id::ScanAngleRank,   i, (int8_t)pt.scan_angle);
        view->setField(pdal::Dimension::Id::NumberOfReturns, i, (uint8_t)pt.number_of_returns);
        view->setField(pdal::Dimension::Id::ReturnNumber,    i, (uint8_t)pt.return_num);
        view->setField(pdal::Dimension::Id::Red,   i, (uint16_t)(pt.r / color_bitter));
        view->setField(pdal::Dimension::Id::Green, i, (uint16_t)(pt.g / color_bitter));
        view->setField(pdal::Dimension::Id::Blue,  i, (uint16_t)(pt.b / color_bitter));
        // Passthrough PDAL-visible extra dims (Synthetic, KeyPoint, etc.)
        if (!extraDimNames.empty())
        {
            pdal::PointId srcIdx = (pdal::PointId)pt.point_source_id;
            if (srcIdx < srcView->size())
            {
                for (size_t k = 0; k < extraDimNames.size(); ++k)
                    view->setField(passthroughDims.at(extraDimNames[k]), i,
                                   srcView->getFieldAs<double>(srcDimIds[k], srcIdx));
            }
        }

        // Write POINT_ID as extra dim
        // Normali scritte come raw bytes dopo (appendNormals), non via PDAL
        view->setField(dimPID, i, pt.raw_point_id);

        // Scale-based features
        for (auto& def : scaleFeatureDefs)
        {
            if (requestedFeatures.count(def.name))
            {
                for (int s = 0; s < scalesCount; s++)
                {
                    float val = def.getter(pt, s);
                    view->setField(extraDims.at(dimName(def.name, s)), i, std::isfinite(val) ? val : 0.0f);
                }
            }
        }

        // Single features
        for (auto& def : singleFeatureDefs)
        {
            if (requestedFeatures.count(def.name))
            {
                float val = def.getter(pt);
                view->setField(extraDims.at(def.name), i, std::isfinite(val) ? val : 0.0f);
            }
        }
    }

    // -------------------------------------------------------
    // Write with LasWriter
    // extra_dims "all" is required to write extra byte fields
    // LAS 1.4 / point format 7 needed for extra dims + RGB support
    // -------------------------------------------------------
    pdal::BufferReader reader;
    reader.addView(view);

    pdal::Options writerOpts;
    writerOpts.add("filename",      outputPath);
    writerOpts.add("extra_dims",    "all");
    writerOpts.add("minor_version", 4);
    // dataformat_id=6: LAS 1.4 standard, no scanner_channel auto-field that causes
    // PotreeConverter to crash with invalid UTF-8 bytes in VLR metadata.
    // RGB is written via Red/Green/Blue standard dims which are always included.
    writerOpts.add("dataformat_id", 6);

    pdal::LasWriter writer;
    writer.setOptions(writerOpts);
    writer.setInput(reader);
    writer.prepare(table);
    writer.execute(table);

    std::cout << "LAS written: " << outputPath << std::endl;
}

// ============================================================
// Parse the --features argument value.
// Accepts comma-separated list, e.g.:
//   planarity,linearity,height,intensity
// ============================================================
std::set<std::string> parseFeatureList(const std::string& featuresArg)
{
    std::set<std::string> result;
    std::stringstream ss(featuresArg);
    std::string token;
    while (std::getline(ss, token, ','))
    {
        // trim spaces
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
        {
            scales[count++] = std::stof(token);
        }
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

    // Check for --list-features anywhere in args
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
    bool useAllFeatures = true; // default: write all features

    // Parse optional arguments (resolution, --features, --radius)
    for (int a = 3; a < argc; a++)
    {
        std::string arg(argv[a]);

        if (arg == "--features" && a + 1 < argc)
        {
            requestedFeatures = parseFeatureList(std::string(argv[++a]));
            useAllFeatures = false;

            // Validate requested features
            for (auto& f : requestedFeatures)
            {
                if (!AVAILABLE_SCALE_FEATURES.count(f) && !AVAILABLE_SINGLE_FEATURES.count(f))
                {
                    std::cerr << "WARNING: Unknown feature '" << f << "' will be ignored." << std::endl;
                }
            }
        }
        else if (arg == "--radius" && a + 1 < argc)
        {
            // Consume all following tokens until next -- flag or end of args
            // This handles both: --radius 0.8,1.2,2.0  AND  --radius 0.8, 1.2, 2.0
            std::string radiusStr = argv[++a];
            while (a + 1 < argc && std::string(argv[a+1]).substr(0, 2) != "--")
            {
                radiusStr += argv[++a];
            }
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

    // If no --features given, use all available features
    if (useAllFeatures)
    {
        for (auto& f : AVAILABLE_SCALE_FEATURES)  requestedFeatures.insert(f);
        for (auto& f : AVAILABLE_SINGLE_FEATURES) requestedFeatures.insert(f);
    }

    auto global_start = now_t();
       
    std::map<int, int> classes;

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

    // Save offset for output (to restore original coordinates)
    // NOTE: laz2pcl uses the first point as offset.
    // We re-read it here from the file to pass it to writeToLas.
    double offsetX = 0, offsetY = 0;
    {
        pdal::Option opt("filename", inputFile);
        pdal::Options opts; opts.add(opt);
        pdal::PointTable tbl; pdal::LasReader rdr;
        rdr.setOptions(opts); rdr.prepare(tbl);
        pdal::PointViewSet pvs = rdr.execute(tbl);
        pdal::PointViewPtr pv = *pvs.begin();
        if (pv->size() > 0)
        {
            offsetX = pv->getFieldAs<double>(pdal::Dimension::Id::X, 0);
            offsetY = pv->getFieldAs<double>(pdal::Dimension::Id::Y, 0);
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

    // Append normals as raw bytes directly into the LAS file.
    // Done after PDAL write to avoid PDAL renaming NormalX/Y/Z in VLR metadata.
    appendNormals(outputFile, filteredCloud);

    double total = elapsed(global_start);
    int mn = (int)(total / 60);
    int sc = (int)total % 60;
    if (mn > 0)
        std::cout << "Processing time: " << mn << " min " << sc << " sec" << std::endl;
    else
        std::cout << "Processing time: " << sc << " sec" << std::endl;

        // // Class distribution (informational)
        // for (size_t i = 0; i < filteredCloud->points.size(); ++i)
        //     classes[(int)filteredCloud->points[i].class_id]++;
    // }

    // std::cout << "\n--- Class distribution ---" << std::endl;
    // for (const auto& pair : classes)
    //     std::cout << "  class " << pair.first << ": " << pair.second << " points" << std::endl;

    return 0;
}