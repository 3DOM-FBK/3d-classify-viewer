# Base NVIDIA CUDA 11.8 + cuDNN8 su Ubuntu 22.04
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV LD_LIBRARY_PATH=/app/open3d-devel-linux-x86_64-cxx11-abi-0.19.0/lib:/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
ARG NUM_THREADS=8

# Set work directory
WORKDIR /app

# Aggiorna sistema e aggiungi repository universe/multiverse
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y software-properties-common && \
    add-apt-repository universe && add-apt-repository multiverse && \
    apt-get update

# Install system dependencies + Python 3.10 + librerie per compilazioni complesse
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    cmake gdb \
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

# # Aggiorna libstdc++ a GCC 13 per GLIBCXX_3.4.32
# RUN add-apt-repository ppa:ubuntu-toolchain-r/test -y && \
#     apt-get update && apt-get install -y --no-install-recommends \
#     gcc-13 g++-13 libstdc++6 \
#     && apt-get clean && rm -rf /var/lib/apt/lists/*

# Imposta python3.10 come Python di default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3.10 1

# Aggiorna pip
RUN python3 -m pip install --upgrade pip

# ------------------------
# Install Python dependencies (senza torch)
# ------------------------
COPY requirements.txt /app/
RUN pip install --no-cache-dir --ignore-installed -r requirements.txt

# ------------------------
# GPU dependencies coerenti con CUDA 11.8
# ------------------------
RUN pip install --no-cache-dir \
    torch==2.3.0+cu118 torchvision==0.18.0+cu118 \
    --index-url https://download.pytorch.org/whl/cu118

# cupy da PyPI standard
RUN pip install --no-cache-dir cupy-cuda11x

# cuml da rapidsai
RUN pip install --no-cache-dir \
    --extra-index-url https://pypi.anaconda.org/rapidsai-wheels-nightly/simple \
    cuml-cu11

# ------------------------
# Copy the project
# ------------------------
# COPY . /app/

# ------------------------
# Download and extract Open3D
# ------------------------
RUN wget https://github.com/isl-org/Open3D/releases/download/v0.19.0/open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    tar -xf open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    rm open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz

# ------------------------
# Download tinygltf and stb headers
# ------------------------
RUN mkdir -p /app/tinygltf && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/tiny_gltf.h -O /app/tinygltf/tiny_gltf.h && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/json.hpp -O /app/tinygltf/json.hpp && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image.h -O /app/tinygltf/stb_image.h && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image_write.h -O /app/tinygltf/stb_image_write.h

# ------------------------
# Potree Libraries
# ------------------------
RUN wget https://github.com/potree/PotreeConverter/releases/download/2.1.1/PotreeConverter_2.1.1_x64_linux.zip
RUN unzip PotreeConverter_2.1.1_x64_linux.zip
RUN rm PotreeConverter_2.1.1_x64_linux.zip
RUN chmod +x PotreeConverter_linux_x64/PotreeConverter

# ------------------------
# FEATURE EXTRACTION DEPENDENCIES
# ------------------------
WORKDIR /app
RUN git clone https://github.com/LASzip/LASzip.git
WORKDIR /app/LASzip
RUN mkdir build && cd build && cmake .. && make -j${NUM_THREADS} && make install
WORKDIR /app
RUN rm -r LASzip

WORKDIR /app
RUN git clone https://github.com/hobu/laz-perf.git
WORKDIR /app/laz-perf
RUN mkdir build && cd build && cmake .. && make -j${NUM_THREADS} && make install
WORKDIR /app
RUN rm -r laz-perf

# ------------------------
# Install Ninja build
# ------------------------
RUN apt update && apt install -y ninja-build

# ------------------------
# GDAL 3.6.2 da sorgente
# ------------------------
WORKDIR /app
RUN git clone https://github.com/OSGeo/gdal.git
WORKDIR /app/gdal
RUN git checkout v3.6.2
RUN mkdir build && cd build && cmake .. -DCMAKE_BUILD_TYPE=Release
WORKDIR /app/gdal/build
RUN make -j${NUM_THREADS} && make install
RUN ldconfig

# ------------------------
# Compilazione PDAL (v2.7.1)
# ------------------------
WORKDIR /app
RUN git clone https://github.com/PDAL/PDAL.git
WORKDIR /app/PDAL
RUN git checkout tags/2.7.1 -b build-2.7.1
RUN mkdir build
WORKDIR /app/PDAL/build
RUN cmake .. \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/usr \
    -DCMAKE_INSTALL_LIBDIR=lib/x86_64-linux-gnu \
    -DBUILD_PLUGIN_PCL=ON \
    -DBUILD_PLUGIN_PYTHON=OFF \
    -DBUILD_PLUGIN_PGPOINTCLOUD=OFF \
    -DBUILD_PLUGIN_GREYHOUND=OFF \
    -DBUILD_PLUGIN_ICEBRIDGE=OFF \
    -DWITH_TESTS=OFF
RUN ninja -j${NUM_THREADS} && ninja install
RUN echo "/usr/lib" > /etc/ld.so.conf.d/pdal.conf && \
    echo "/usr/local/lib" >> /etc/ld.so.conf.d/pdal.conf && ldconfig

# ------------------------
# Workdir finale
# ------------------------
WORKDIR /app

# Expose port (Django)
EXPOSE 8000