#pragma once

// GPU feature computation interface
// Called from host (C++) code, internally launches CUDA kernels

#include <cstdint>

// Number of feature types (must match F_COUNT in main code)
#define GPU_F_COUNT 11

// Feature indices (same order as FeatureId enum in main code)
#define GPU_F_ANISOTROPY        0
#define GPU_F_HEIGHT_ABOVE      1
#define GPU_F_HEIGHT_BELOW      2
#define GPU_F_LINEARITY         3
#define GPU_F_NEIGHBOURS        4
#define GPU_F_OMNIVARIANCE      5
#define GPU_F_PLANARITY         6
#define GPU_F_SPHERICITY        7
#define GPU_F_SURFACE_VARIATION 8
#define GPU_F_VERTICALITY       9
#define GPU_F_VERTICAL_RANGE   10

struct GpuFeatureParams {
    int   numPoints;          // total points (core + buffer)
    int   numScales;          // number of radius scales
    float scales[10];         // radius values
    float gridCellSize;       // cell size for spatial hash (= max scale)
};

// Compute geometric features on GPU for a tile of points.
//
// h_xyz:         host array of double3 (x,y,z) for each point, size = 3*N
// h_isCore:      host array, 1 if point is core, 0 if buffer-only
// params:        configuration
// h_features:    output host array, size = GPU_F_COUNT * numScales * N
//                layout: h_features[featureId * numScales * N + scaleIdx * N + pointIdx]
//
// Returns 0 on success, non-zero on error.
int computeFeaturesGPU(
    const double* h_xyz,
    const int*    h_isCore,
    const GpuFeatureParams& params,
    float*        h_features
);
