# ============================================================
# STAGE 1 — builder
# Compiles GDAL, PDAL, LASzip, laz-perf, and installs heavy
# dependencies. This image does NOT end up in production.
# ============================================================
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
ARG NUM_THREADS=8

WORKDIR /app

# System dependencies for compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common && \
    add-apt-repository universe && add-apt-repository multiverse && \
    apt-get update && apt-get install -y --no-install-recommends \
    git build-essential cmake ninja-build \
    libflann-dev libjpeg-dev libpng-dev libtiff-dev libpcl-dev \
    clang libc++-dev libc++abi-dev \
    libpq-dev \
    libx11-dev libgl1-mesa-dev libglu1-mesa-dev freeglut3-dev \
    wget curl unzip \
    libgomp1 libomp-dev \
    libcgal-dev libboost-all-dev \
    python3.10 python3.10-dev python3-pip python3.10-venv \
    libgl1 libglib2.0-0 libsm6 libxrender1 libxext6 \
    libstdc++6 libgcc-s1 liblaszip-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Default Python
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python  python  /usr/bin/python3.10 1 && \
    python3 -m pip install --upgrade pip

# Python dependencies (CPU)
COPY requirements.txt .
RUN pip install --no-cache-dir --ignore-installed -r requirements.txt

# PyTorch + CUDA 11.8
RUN pip install --no-cache-dir \
    torch==2.3.0+cu118 torchvision==0.18.0+cu118 \
    --index-url https://download.pytorch.org/whl/cu118

# CuPy
RUN pip install --no-cache-dir cupy-cuda11x

# cuML (rapidsai)
RUN pip install --no-cache-dir \
    --extra-index-url https://pypi.anaconda.org/rapidsai-wheels-nightly/simple \
    cuml-cu11

# Precompiled Open3D
RUN wget -q https://github.com/isl-org/Open3D/releases/download/v0.19.0/open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    tar -xf open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    rm    open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz

# tinygltf / stb headers
RUN mkdir -p /app/tinygltf && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/tiny_gltf.h      -O /app/tinygltf/tiny_gltf.h && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/json.hpp         -O /app/tinygltf/json.hpp && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image.h        -O /app/tinygltf/stb_image.h && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image_write.h  -O /app/tinygltf/stb_image_write.h

# PotreeConverter
RUN wget -q https://github.com/potree/PotreeConverter/releases/download/2.1.1/PotreeConverter_2.1.1_x64_linux.zip && \
    unzip -q PotreeConverter_2.1.1_x64_linux.zip && \
    rm       PotreeConverter_2.1.1_x64_linux.zip && \
    chmod +x PotreeConverter_linux_x64/PotreeConverter

# LASzip
RUN git clone --depth 1 https://github.com/LASzip/LASzip.git /tmp/LASzip && \
    cmake -S /tmp/LASzip -B /tmp/LASzip/build && \
    make -C /tmp/LASzip/build -j${NUM_THREADS} install && \
    rm -rf /tmp/LASzip

# laz-perf
RUN git clone --depth 1 https://github.com/hobu/laz-perf.git /tmp/laz-perf && \
    cmake -S /tmp/laz-perf -B /tmp/laz-perf/build && \
    make -C /tmp/laz-perf/build -j${NUM_THREADS} install && \
    rm -rf /tmp/laz-perf

# GDAL 3.6.2
RUN git clone --depth 1 --branch v3.6.2 https://github.com/OSGeo/gdal.git /tmp/gdal && \
    cmake -S /tmp/gdal -B /tmp/gdal/build -DCMAKE_BUILD_TYPE=Release && \
    make -C /tmp/gdal/build -j${NUM_THREADS} install && \
    rm -rf /tmp/gdal

# PDAL 2.7.1
RUN git clone --depth 1 --branch 2.7.1 https://github.com/PDAL/PDAL.git /tmp/PDAL && \
    cmake -S /tmp/PDAL -B /tmp/PDAL/build \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/usr \
    -DCMAKE_INSTALL_LIBDIR=lib/x86_64-linux-gnu \
    -DBUILD_PLUGIN_PCL=ON \
    -DBUILD_PLUGIN_PYTHON=OFF \
    -DBUILD_PLUGIN_PGPOINTCLOUD=OFF \
    -DBUILD_PLUGIN_GREYHOUND=OFF \
    -DBUILD_PLUGIN_ICEBRIDGE=OFF \
    -DWITH_TESTS=OFF && \
    ninja -C /tmp/PDAL/build -j${NUM_THREADS} install && \
    rm -rf /tmp/PDAL

# ============================================================
# STAGE 2 — runtime
# Final image: CUDA runtime only, no compiler/sources.
# ============================================================
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    CUPY_CACHE_DIR=/tmp/.cupy \
    LD_LIBRARY_PATH=/app/open3d-devel-linux-x86_64-cxx11-abi-0.19.0/lib:/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH

WORKDIR /app

# System runtime (only what is needed at runtime, no compiler)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.10 python3-pip \
    libgomp1 \
    libgl1 libglib2.0-0 libsm6 libxrender1 libxext6 \
    libstdc++6 libgcc-s1 \
    libboost-filesystem1.74.0 libboost-iostreams1.74.0 \
    libboost-program-options1.74.0 libboost-system1.74.0 \
    libflann1.9 libjpeg8 libpng16-16 libtiff5 \
    libx11-6 libgl1-mesa-glx libglu1-mesa \
    libomp5 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Default Python
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python  python  /usr/bin/python3.10 1

# Copy Python packages installed in builder stage
COPY --from=builder /usr/local/lib/python3.10 /usr/local/lib/python3.10
COPY --from=builder /usr/local/bin             /usr/local/bin

# Copy compiled system libraries (GDAL, PDAL, LASzip, laz-perf)
COPY --from=builder /usr/local/lib    /usr/local/lib
COPY --from=builder /usr/local/share  /usr/local/share
COPY --from=builder /usr/lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu

# Precompiled Open3D
COPY --from=builder /app/open3d-devel-linux-x86_64-cxx11-abi-0.19.0 \
    /app/open3d-devel-linux-x86_64-cxx11-abi-0.19.0

# tinygltf / stb headers
COPY --from=builder /app/tinygltf /app/tinygltf

# PotreeConverter
COPY --from=builder /app/PotreeConverter_linux_x64 /app/PotreeConverter_linux_x64

# Update dynamic library cache
RUN echo "/usr/local/lib" > /etc/ld.so.conf.d/local.conf && ldconfig

# ============================================================
# Copy Django project and opt folder
# ============================================================
COPY classifyViewer/ /app/classifyViewer/
COPY opt/            /app/opt/

EXPOSE 8000

# Start with Gunicorn (modify the wsgi module if necessary)
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "classifyViewer.wsgi:application"]