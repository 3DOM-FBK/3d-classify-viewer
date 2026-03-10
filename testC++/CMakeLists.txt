cmake_minimum_required(VERSION 3.18)
project(point_cloud_tools)

# --- C++ ---
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_BUILD_TYPE Release)
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -march=native -DNDEBUG")

# --- Dependencies ---
find_package(PCL 1.9 REQUIRED)
find_package(PDAL REQUIRED)
find_package(OpenMP REQUIRED)
find_package(Open3D REQUIRED)
find_package(CGAL REQUIRED)

# --- LASzip & laz-perf (manual includes) ---
# Se hai installato in /usr/local, puoi fare così:
include_directories(/usr/local/include /usr/include)
link_directories(/usr/local/lib)

# --- Common Flags ---
add_compile_options(-O3 -march=native)
add_definitions(${PCL_DEFINITIONS})
add_definitions(${PDAL_DEFINITIONS})

# --- Open3D RPATH ---
get_target_property(open3d_lib Open3D::Open3D IMPORTED_LOCATION)
get_filename_component(open3d_lib_dir ${open3d_lib} DIRECTORY)

# =======================================
# Executables
# =======================================

# --- Feature Extraction Viewer ---
add_executable(feature_extraction_viewer feature_extraction_viewer.cpp)
target_include_directories(feature_extraction_viewer PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(feature_extraction_viewer
    PRIVATE
        ${PCL_LIBRARIES}
        ${PDAL_LIBRARIES}
        OpenMP::OpenMP_CXX
)
target_compile_options(feature_extraction_viewer PRIVATE ${OpenMP_CXX_FLAGS})

# --- Subsample PC ---
add_executable(subsample_pc subsample_pc.cpp)
target_link_libraries(subsample_pc PRIVATE Open3D::Open3D)
set_target_properties(subsample_pc PROPERTIES
    BUILD_WITH_INSTALL_RPATH TRUE
    INSTALL_RPATH "${open3d_lib_dir}"
    INSTALL_RPATH_USE_LINK_PATH TRUE
)

# --- Mesh2PC ---
add_executable(mesh2pc mesh2pc.cpp)
target_include_directories(mesh2pc PRIVATE ${TINYGLTF_INCLUDE_DIR})
target_link_libraries(mesh2pc PRIVATE Open3D::Open3D CGAL::CGAL OpenMP::OpenMP_CXX)
set_target_properties(mesh2pc PROPERTIES
    BUILD_WITH_INSTALL_RPATH TRUE
    INSTALL_RPATH "${open3d_lib_dir}"
    INSTALL_RPATH_USE_LINK_PATH TRUE
)

# --- Ply2LAS ---
add_executable(ply2las ply2las.cpp)
target_link_libraries(ply2las PRIVATE Open3D::Open3D)
set_target_properties(ply2las PROPERTIES
    BUILD_WITH_INSTALL_RPATH TRUE
    INSTALL_RPATH "${open3d_lib_dir}"
    INSTALL_RPATH_USE_LINK_PATH TRUE
)

# --- Split LAS by Binary ---
add_executable(split_las_by_binary split_las_by_binary.cpp)
target_include_directories(split_las_by_binary PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}
    /app/PDAL/vendor/nlohmann
)
target_link_libraries(split_las_by_binary
    PRIVATE
        ${PCL_LIBRARIES}
        ${PDAL_LIBRARIES}
        OpenMP::OpenMP_CXX
)
target_compile_options(split_las_by_binary PRIVATE ${OpenMP_CXX_FLAGS})