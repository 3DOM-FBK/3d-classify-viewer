FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    clang libc++-dev libc++abi-dev \
    libx11-dev libgl1-mesa-dev libglu1-mesa-dev freeglut3-dev \
    cmake wget build-essential python3 python3-pip \
    libcgal-dev libboost-all-dev libomp-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN wget https://github.com/isl-org/Open3D/releases/download/v0.19.0/open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    tar -xf open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    rm open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz

ENV LD_LIBRARY_PATH=/app/open3d-devel-linux-x86_64-cxx11-abi-0.19.0/lib:$LD_LIBRARY_PATH

RUN mkdir -p /app/tinygltf && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/tiny_gltf.h \
         -O /app/tinygltf/tiny_gltf.h && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/json.hpp \
         -O /app/tinygltf/json.hpp && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image.h \
         -O /app/tinygltf/stb_image.h && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image_write.h \
         -O /app/tinygltf/stb_image_write.h

RUN mkdir -p /app/build && \
    cd /app/build && \
    cmake \
        -DOpen3D_DIR=/app/open3d-devel-linux-x86_64-cxx11-abi-0.19.0/lib/cmake/Open3D \
        -DCMAKE_C_COMPILER=clang \
        -DCMAKE_CXX_COMPILER=clang++ \
        -DCMAKE_BUILD_TYPE=Release \
        .. && \
    make -j$(nproc) && \
    cp subsample_pc /usr/local/bin/subsample_pc && \
    cp mesh2pc /usr/local/bin/mesh2pc

WORKDIR /app