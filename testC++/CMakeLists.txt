cmake_minimum_required(VERSION 3.18)
project(point_cloud_tools)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_BUILD_TYPE Release)
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -march=native -DNDEBUG")

# ---- Open3D ----
find_package(Open3D REQUIRED)

# ---- CGAL ----
find_package(CGAL REQUIRED)

# ---- OpenMP ----
find_package(OpenMP REQUIRED)

# RPATH comune
get_target_property(open3d_lib Open3D::Open3D IMPORTED_LOCATION)
get_filename_component(open3d_lib_dir ${open3d_lib} DIRECTORY)

# ---- subsample_pc ----
add_executable(subsample_pc subsample_pc.cpp)
target_link_libraries(subsample_pc Open3D::Open3D)
target_compile_options(subsample_pc PRIVATE -O3 -march=native)
set_target_properties(subsample_pc PROPERTIES
    BUILD_WITH_INSTALL_RPATH TRUE
    INSTALL_RPATH "${open3d_lib_dir}"
    INSTALL_RPATH_USE_LINK_PATH TRUE
)

# ---- mesh2pc ----
add_executable(mesh2pc mesh2pc.cpp)
target_link_libraries(mesh2pc
    Open3D::Open3D
    CGAL::CGAL
    OpenMP::OpenMP_CXX
)
target_compile_options(mesh2pc PRIVATE -O3 -march=native)
set_target_properties(mesh2pc PROPERTIES
    BUILD_WITH_INSTALL_RPATH TRUE
    INSTALL_RPATH "${open3d_lib_dir}"
    INSTALL_RPATH_USE_LINK_PATH TRUE
)

