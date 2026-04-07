#include "gpu_features.cuh"
#include <cstdio>
#include <cmath>
#include <algorithm>
#include <cuda_runtime.h>
#include <thrust/device_vector.h>
#include <thrust/sort.h>
#include <thrust/sequence.h>
#include <thrust/transform.h>
#include <thrust/functional.h>

// ============================================================
// Error checking macro
// ============================================================
#define CUDA_CHECK(call) do { \
    cudaError_t err = (call); \
    if (err != cudaSuccess) { \
        fprintf(stderr, "CUDA error at %s:%d: %s\n", __FILE__, __LINE__, \
                cudaGetErrorString(err)); \
        return -1; \
    } \
} while(0)

// ============================================================
// Device: Analytical eigendecomposition for 3x3 symmetric matrix
// Uses Cardano's method — no iterations, no branches
// Input: symmetric matrix as 6 unique elements (a00,a01,a02,a11,a12,a22)
// Output: eigenvalues sorted descending (e0 >= e1 >= e2)
//         eigenvector for smallest eigenvalue (v2x, v2y, v2z)
// ============================================================
__device__ void eigen3x3(
    double a00, double a01, double a02,
    double a11, double a12, double a22,
    double& e0, double& e1, double& e2,
    double& v2x, double& v2y, double& v2z)
{
    // Jacobi Eigenvalue Method (iterative rotations)
    // 3x3 Symmetric matrix:
    // [ a00  a01  a02 ]
    // [ a01  a11  a12 ]
    // [ a02  a12  a22 ]
    
    // Eigenvectors (V matrix) initialized to identity
    double V[3][3] = { {1.0, 0.0, 0.0}, {0.0, 1.0, 0.0}, {0.0, 0.0, 1.0} };
    double A[3][3] = { {a00, a01, a02}, {a01, a11, a12}, {a02, a12, a22} };

    const int max_iters = 15;
    for (int iter = 0; iter < max_iters; iter++) {
        // Find largest off-diagonal element
        int p, q;
        double a01_abs = fabs(A[0][1]);
        double a02_abs = fabs(A[0][2]);
        double a12_abs = fabs(A[1][2]);

        if (a01_abs >= a02_abs && a01_abs >= a12_abs) { p = 0; q = 1; }
        else if (a02_abs >= a12_abs) { p = 0; q = 2; }
        else { p = 1; q = 2; }

        if (fabs(A[p][q]) < 1e-15) break;

        // Jacobi rotation
        double theta = 0.5 * atan2(2.0 * A[p][q], A[q][q] - A[p][p]);
        double c = cos(theta);
        double s = sin(theta);

        // Update A: rotate rows and columns p and q
        double app = A[p][p], aqq = A[q][q], apq = A[p][q];
        A[p][p] = c*c*app - 2.0*s*c*apq + s*s*aqq;
        A[q][q] = s*s*app + 2.0*s*c*apq + c*c*aqq;
        A[p][q] = A[q][p] = 0.0; // By definition of theta

        int r = 3 - p - q; // the other index
        double apr = A[p][r], aqr = A[q][r];
        A[p][r] = A[r][p] = c*apr - s*aqr;
        A[q][r] = A[r][q] = s*apr + c*aqr;

        // Update V: rotate eigenvectors
        for (int i = 0; i < 3; i++) {
            double vip = V[i][p], viq = V[i][q];
            V[i][p] = c*vip - s*viq;
            V[i][q] = s*vip + c*viq;
        }
    }

    e0 = A[0][0]; e1 = A[1][1]; e2 = A[2][2];
    
    // Order eigenvalues and keep track of indices
    int idx[3] = {0, 1, 2};
    if (e0 < e1) { double t=e0; e0=e1; e1=t; int ti=idx[0]; idx[0]=idx[1]; idx[1]=ti; }
    if (e0 < e2) { double t=e0; e0=e2; e2=t; int ti=idx[0]; idx[0]=idx[2]; idx[2]=ti; }
    if (e1 < e2) { double t=e1; e1=e2; e2=t; int ti=idx[1]; idx[1]=idx[2]; idx[2]=ti; }

    // Smallest eigenvector is the column of V corresponding to the smallest eigenvalue
    int smallest_idx = idx[2];
    v2x = V[0][smallest_idx];
    v2y = V[1][smallest_idx];
    v2z = V[2][smallest_idx];

    // Ensure non-negative
    if (e0 < 0) e0 = 0;
    if (e1 < 0) e1 = 0;
    if (e2 < 0) e2 = 0;
}

// ============================================================
// Grid hash spatial index structures
// ============================================================

struct GridParams {
    double cellSize;
    double invCellSize;
    int   gridDimX, gridDimY, gridDimZ;
    double minX, minY, minZ;
    int   totalCells;
};

__device__ int calcCellId(double x, double y, double z, const GridParams& gp) {
    int cx = (int)floor((x - gp.minX) * gp.invCellSize);
    int cy = (int)floor((y - gp.minY) * gp.invCellSize);
    int cz = (int)floor((z - gp.minZ) * gp.invCellSize);
    cx = max(0, min(cx, gp.gridDimX - 1));
    cy = max(0, min(cy, gp.gridDimY - 1));
    cz = max(0, min(cz, gp.gridDimZ - 1));
    return cx + cy * gp.gridDimX + cz * gp.gridDimX * gp.gridDimY;
}

// Kernel: compute cell ID for each point
__global__ void calcCellIdsKernel(
    const double* __restrict__ xyz,   // x0,y0,z0,x1,y1,z1,...
    int N,
    GridParams gp,
    int* cellIds)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= N) return;
    double x = xyz[idx * 3 + 0];
    double y = xyz[idx * 3 + 1];
    double z = xyz[idx * 3 + 2];
    cellIds[idx] = calcCellId(x, y, z, gp);
}

// Kernel: find start/end of each cell in sorted array
__global__ void findCellBoundsKernel(
    const int* __restrict__ sortedCellIds,
    int N,
    int* cellStart,
    int* cellEnd)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= N) return;

    int cellId = sortedCellIds[idx];

    if (idx == 0 || cellId != sortedCellIds[idx - 1]) {
        cellStart[cellId] = idx;
    }
    if (idx == N - 1 || cellId != sortedCellIds[idx + 1]) {
        cellEnd[cellId] = idx + 1;
    }
}

// ============================================================
// Main feature computation kernel
// ============================================================
__global__ void computeFeaturesKernel(
    const double* __restrict__ xyz,          // sorted by cell
    const int*   __restrict__ sortedIdx,    // original index of sorted point
    const int*   __restrict__ isCore,       // is this point core? (use original idx)
    int N,
    int numScales,
    const float* __restrict__ scales,       // radius per scale
    GridParams gp,
    const int*   __restrict__ cellStart,
    const int*   __restrict__ cellEnd,
    float*       __restrict__ features)     // output
{
    int sortedPos = blockIdx.x * blockDim.x + threadIdx.x;
    if (sortedPos >= N) return;

    int origIdx = sortedIdx[sortedPos];

    // Only compute for core points
    if (!isCore[origIdx]) return;

    double px = xyz[sortedPos * 3 + 0];
    double py = xyz[sortedPos * 3 + 1];
    double pz = xyz[sortedPos * 3 + 2];

    for (int sc = 0; sc < numScales; sc++) {
        float radius = scales[sc];
        double r2 = (double)radius * (double)radius;

        // Determine cell range to search
        int cx = (int)floor((px - gp.minX) * gp.invCellSize);
        int cy = (int)floor((py - gp.minY) * gp.invCellSize);
        int cz = (int)floor((pz - gp.minZ) * gp.invCellSize);

        // How many cells to cover for this radius.
        // cellSize = minScale, so for the largest radius this is ceil(maxScale/minScale).
        // The exact sphere is enforced below by the dist2 <= r2 check.
        int cellRange = (int)ceil((double)radius * gp.invCellSize);

        // Accumulate covariance (relative to query point px,py,pz for numerical stability)
        double sumX = 0, sumY = 0, sumZ = 0;
        double sumXX = 0, sumXY = 0, sumXZ = 0;
        double sumYY = 0, sumYZ = 0, sumZZ = 0;
        double zMin = pz, zMax = pz;
        int count = 0;

        for (int dz = -cellRange; dz <= cellRange; dz++) {
            int nz = cz + dz;
            if (nz < 0 || nz >= gp.gridDimZ) continue;
            for (int dy = -cellRange; dy <= cellRange; dy++) {
                int ny = cy + dy;
                if (ny < 0 || ny >= gp.gridDimY) continue;
                for (int dx = -cellRange; dx <= cellRange; dx++) {
                    int nx = cx + dx;
                    if (nx < 0 || nx >= gp.gridDimX) continue;

                    int cellId = nx + ny * gp.gridDimX + nz * gp.gridDimX * gp.gridDimY;
                    int start = cellStart[cellId];
                    int end   = cellEnd[cellId];

                    for (int j = start; j < end; j++) {
                        double qx = xyz[j * 3 + 0];
                        double qy = xyz[j * 3 + 1];
                        double qz = xyz[j * 3 + 2];
                        double ddx = qx - px, ddy = qy - py, ddz = qz - pz;
                        double dist2 = ddx*ddx + ddy*ddy + ddz*ddz;
                        // Use a small epsilon to match CC's inclusion behavior at boundaries
                        if (dist2 <= r2 + 1e-7) {
                            double dx_rel = qx - px;
                            double dy_rel = qy - py;
                            double dz_rel = qz - pz;
                            sumX += dx_rel; sumY += dy_rel; sumZ += dz_rel;
                            sumXX += dx_rel*dx_rel; sumXY += dx_rel*dy_rel; sumXZ += dx_rel*dz_rel;
                            sumYY += dy_rel*dy_rel; sumYZ += dy_rel*dz_rel; sumZZ += dz_rel*dz_rel;
                            if (qz < zMin) zMin = qz;
                            if (qz > zMax) zMax = qz;
                            count++;
                        }
                    }
                }
            }
        }

        // Base offset for writing features for this point
        // Layout: features[featureId * numScales * N + scaleIdx * N + origIdx]
        int base = sc * N + origIdx;

        // Write neighbour count
        features[GPU_F_NEIGHBOURS * numScales * N + base] = (float)count;

        if (count < 3) {
            // Not enough neighbors — features stay zero
            continue;
        }

        // Vertical stats
        features[GPU_F_VERTICAL_RANGE * numScales * N + base] = (float)(zMax - zMin);
        features[GPU_F_HEIGHT_ABOVE   * numScales * N + base] = (float)(zMax - pz);
        features[GPU_F_HEIGHT_BELOW   * numScales * N + base] = (float)(pz - zMin);

        // Covariance matrix
        double inv_n = 1.0 / (double)count;
        double mx = sumX * inv_n, my = sumY * inv_n, mz = sumZ * inv_n;

        double cov00 = sumXX * inv_n - mx*mx;
        double cov01 = sumXY * inv_n - mx*my;
        double cov02 = sumXZ * inv_n - mx*mz;
        double cov11 = sumYY * inv_n - my*my;
        double cov12 = sumYZ * inv_n - my*mz;
        double cov22 = sumZZ * inv_n - mz*mz;

        // Eigendecomposition
        double e0, e1, e2, v2x, v2y, v2z;
        eigen3x3(cov00, cov01, cov02, cov11, cov12, cov22,
                 e0, e1, e2, v2x, v2y, v2z);

        // Guard against degenerate cases
        if (e0 < 1e-18) continue;

        double sum_ev = e0 + e1 + e2;

        features[GPU_F_LINEARITY         * numScales * N + base] = (float)((e0 - e1) / e0);
        features[GPU_F_PLANARITY         * numScales * N + base] = (float)((e1 - e2) / e0);
        features[GPU_F_SURFACE_VARIATION * numScales * N + base] = (float)(e2 / sum_ev);
        features[GPU_F_OMNIVARIANCE      * numScales * N + base] = (float)pow(fmax(e0 * e1 * e2, 0.0), 1.0/3.0);
        features[GPU_F_ANISOTROPY        * numScales * N + base] = (float)((e0 - e2) / e0);
        features[GPU_F_SPHERICITY        * numScales * N + base] = (float)(e2 / e0);

        // Verticality: 1 - |Z · e3|  where e3 is smallest eigenvector
        features[GPU_F_VERTICALITY * numScales * N + base] = (float)(1.0 - fabs(v2z));
    }
}


// ============================================================
// Host function: computeFeaturesGPU
// ============================================================
int computeFeaturesGPU(
    const double* h_xyz,
    const int*    h_isCore,
    const GpuFeatureParams& params,
    float*        h_features)
{
    int N = params.numPoints;
    if (N == 0) return 0;

    int numScales = params.numScales;
    size_t featureSize = (size_t)GPU_F_COUNT * numScales * N;

    // ---- Compute grid dimensions ----
    float maxScale = 0;
    float minScale = params.scales[0];
    for (int i = 0; i < numScales; i++) {
        maxScale = fmaxf(maxScale, params.scales[i]);
        minScale = fminf(minScale, params.scales[i]);
    }

    // Use the smallest scale as cell size so that cellRange = ceil(radius / cellSize)
    // gives the correct number of cells to search for every scale.
    // Using maxScale here caused cellRange = 1 for all smaller scales, making the
    // effective search radius up to 2*maxScale instead of the requested radius.
    double cellSize = (double)minScale;
    double invCell = 1.0 / cellSize;

    // Find bounding box
    double minX = h_xyz[0], maxX = h_xyz[0];
    double minY = h_xyz[1], maxY = h_xyz[1];
    double minZ = h_xyz[2], maxZ = h_xyz[2];
    for (int i = 0; i < N; i++) {
        double x = h_xyz[i*3+0], y = h_xyz[i*3+1], z = h_xyz[i*3+2];
        minX = fmin(minX, x); maxX = fmax(maxX, x);
        minY = fmin(minY, y); maxY = fmax(maxY, y);
        minZ = fmin(minZ, z); maxZ = fmax(maxZ, z);
    }

    GridParams gp;
    gp.cellSize = cellSize;
    gp.invCellSize = invCell;
    // Increase padding to ensure points at the very edge are not subject to rounding issues
    // into invalid cells. We use 2*cellSize padding.
    gp.minX = minX - 2.0 * cellSize;
    gp.minY = minY - 2.0 * cellSize;
    gp.minZ = minZ - 2.0 * cellSize;
    gp.gridDimX = (int)ceil((maxX - gp.minX) / cellSize) + 3;
    gp.gridDimY = (int)ceil((maxY - gp.minY) / cellSize) + 3;
    gp.gridDimZ = (int)ceil((maxZ - gp.minZ) / cellSize) + 3;
    gp.totalCells = gp.gridDimX * gp.gridDimY * gp.gridDimZ;

    // Cap grid cells to prevent OOM (if point cloud is very tall/wide)
    if (gp.totalCells > 50000000) {
        fprintf(stderr, "GPU grid too large (%d cells). Increase cell size.\n", gp.totalCells);
        return -1;
    }

    // ---- Allocate GPU memory ----
    double* d_xyz = nullptr;
    int*   d_isCore = nullptr;
    int*   d_cellIds = nullptr;
    int*   d_sortedIdx = nullptr;
    int*   d_cellStart = nullptr;
    int*   d_cellEnd = nullptr;
    float* d_scales = nullptr;
    float* d_features = nullptr;

    CUDA_CHECK(cudaMalloc(&d_xyz,       N * 3 * sizeof(double)));
    CUDA_CHECK(cudaMalloc(&d_isCore,    N * sizeof(int)));
    CUDA_CHECK(cudaMalloc(&d_cellIds,   N * sizeof(int)));
    CUDA_CHECK(cudaMalloc(&d_sortedIdx, N * sizeof(int)));
    CUDA_CHECK(cudaMalloc(&d_cellStart, gp.totalCells * sizeof(int)));
    CUDA_CHECK(cudaMalloc(&d_cellEnd,   gp.totalCells * sizeof(int)));
    CUDA_CHECK(cudaMalloc(&d_scales,    numScales * sizeof(float)));
    CUDA_CHECK(cudaMalloc(&d_features,  featureSize * sizeof(float)));

    // ---- Copy data to GPU ----
    CUDA_CHECK(cudaMemcpy(d_xyz,    h_xyz,         N * 3 * sizeof(double), cudaMemcpyHostToDevice));
    CUDA_CHECK(cudaMemcpy(d_isCore, h_isCore,      N * sizeof(int),      cudaMemcpyHostToDevice));
    CUDA_CHECK(cudaMemcpy(d_scales, params.scales,  numScales * sizeof(float), cudaMemcpyHostToDevice));
    CUDA_CHECK(cudaMemset(d_features,  0, featureSize * sizeof(float)));
    CUDA_CHECK(cudaMemset(d_cellStart, 0xFF, gp.totalCells * sizeof(int))); // -1 sentinel
    CUDA_CHECK(cudaMemset(d_cellEnd,   0,    gp.totalCells * sizeof(int)));

    int blockSize = 256;
    int gridSize = (N + blockSize - 1) / blockSize;

    // ---- Step 1: Compute cell IDs ----
    calcCellIdsKernel<<<gridSize, blockSize>>>(d_xyz, N, gp, d_cellIds);
    CUDA_CHECK(cudaGetLastError());

    // ---- Step 2: Sort points by cell ID ----
    // Create index array
    {
        thrust::device_ptr<int> dp_cellIds(d_cellIds);
        thrust::device_ptr<int> dp_sortedIdx(d_sortedIdx);
        thrust::sequence(dp_sortedIdx, dp_sortedIdx + N);
        thrust::sort_by_key(dp_cellIds, dp_cellIds + N, dp_sortedIdx);
    }

    // Step 2b: Reorder xyz by sorted index (Host-side fallback for simplicity/portability)
    double* d_xyz_sorted = nullptr;
    CUDA_CHECK(cudaMalloc(&d_xyz_sorted, N * 3 * sizeof(double)));
    {
        std::vector<double> h_xyz_copy(N * 3);
        std::vector<int>   h_sorted_idx(N);
        CUDA_CHECK(cudaMemcpy(h_xyz_copy.data(), d_xyz, N * 3 * sizeof(double), cudaMemcpyDeviceToHost));
        CUDA_CHECK(cudaMemcpy(h_sorted_idx.data(), d_sortedIdx, N * sizeof(int), cudaMemcpyDeviceToHost));

        std::vector<double> h_xyz_sorted(N * 3);
        for (int i = 0; i < N; i++) {
            int si = h_sorted_idx[i];
            h_xyz_sorted[i * 3 + 0] = h_xyz_copy[si * 3 + 0];
            h_xyz_sorted[i * 3 + 1] = h_xyz_copy[si * 3 + 1];
            h_xyz_sorted[i * 3 + 2] = h_xyz_copy[si * 3 + 2];
        }
        CUDA_CHECK(cudaMemcpy(d_xyz_sorted, h_xyz_sorted.data(), N * 3 * sizeof(double), cudaMemcpyHostToDevice));
    }

    // ---- Step 3: Find cell boundaries ----
    findCellBoundsKernel<<<gridSize, blockSize>>>(d_cellIds, N, d_cellStart, d_cellEnd);
    CUDA_CHECK(cudaGetLastError());

    // ---- Step 4: Compute features ----
    computeFeaturesKernel<<<gridSize, blockSize>>>(
        d_xyz_sorted, d_sortedIdx, d_isCore, N,
        numScales, d_scales, gp,
        d_cellStart, d_cellEnd,
        d_features);
    CUDA_CHECK(cudaGetLastError());
    CUDA_CHECK(cudaDeviceSynchronize());

    // ---- Copy results back ----
    CUDA_CHECK(cudaMemcpy(h_features, d_features, featureSize * sizeof(float), cudaMemcpyDeviceToHost));

    // ---- Cleanup ----
    cudaFree(d_xyz);
    cudaFree(d_xyz_sorted);
    cudaFree(d_isCore);
    cudaFree(d_cellIds);
    cudaFree(d_sortedIdx);
    cudaFree(d_cellStart);
    cudaFree(d_cellEnd);
    cudaFree(d_scales);
    cudaFree(d_features);

    return 0;
}
