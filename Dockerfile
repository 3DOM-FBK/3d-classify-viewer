# ============================================================
# STAGE 1 — builder
# Compila GDAL, PDAL, LASzip, laz-perf da sorgente.
# Questa immagine NON finisce in produzione.
# ============================================================
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
ARG NUM_THREADS=8

# Dipendenze di compilazione (solo quanto serve per build)
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common ca-certificates gnupg && \
    add-apt-repository universe && \
    apt-get update && apt-get install -y --no-install-recommends \
    git build-essential cmake ninja-build \
    libflann-dev libjpeg-dev libpng-dev libtiff-dev \
    libpcl-dev libpq-dev \
    libx11-dev libgl1-mesa-dev libglu1-mesa-dev freeglut3-dev \
    wget curl unzip \
    libgomp1 libomp-dev liblaszip-dev \
    # Solo i moduli Boost necessari a GDAL/PDAL
    libboost-filesystem-dev libboost-iostreams-dev \
    libboost-program-options-dev libboost-system-dev \
    libboost-thread-dev libboost-regex-dev \
    libcgal-dev \
    python3.10 python3.10-dev python3-pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# LASzip
RUN git clone --depth 1 https://github.com/LASzip/LASzip.git /tmp/LASzip && \
    cmake -S /tmp/LASzip -B /tmp/LASzip/build -DCMAKE_BUILD_TYPE=Release && \
    make -C /tmp/LASzip/build -j${NUM_THREADS} install && \
    rm -rf /tmp/LASzip

# laz-perf
RUN git clone --depth 1 https://github.com/hobu/laz-perf.git /tmp/laz-perf && \
    cmake -S /tmp/laz-perf -B /tmp/laz-perf/build -DCMAKE_BUILD_TYPE=Release && \
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
    -DCMAKE_INSTALL_PREFIX=/usr/local \
    -DBUILD_PLUGIN_PCL=ON \
    -DBUILD_PLUGIN_PYTHON=OFF \
    -DBUILD_PLUGIN_PGPOINTCLOUD=OFF \
    -DBUILD_PLUGIN_GREYHOUND=OFF \
    -DBUILD_PLUGIN_ICEBRIDGE=OFF \
    -DWITH_TESTS=OFF && \
    ninja -C /tmp/PDAL/build -j${NUM_THREADS} install && \
    rm -rf /tmp/PDAL

# ============================================================
# STAGE 2 — runtime finale (~20 GB)
# Base runtime (no compiler), copia solo i binari compilati.
# ============================================================
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    CUPY_CACHE_DIR=/tmp/.cupy \
    LD_LIBRARY_PATH=/app/open3d-devel-linux-x86_64-cxx11-abi-0.19.0/lib:/usr/local/lib:/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH

WORKDIR /app

# Solo runtime di sistema — niente *-dev, niente compiler
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common ca-certificates gnupg && \
    add-apt-repository universe && \
    apt-get update && apt-get install -y --no-install-recommends \
    python3.10 python3.10-venv python3-pip \
    libgomp1 libomp5 \
    libgl1 libgl1-mesa-glx libglu1-mesa \
    libglib2.0-0 libsm6 libxrender1 libxext6 libx11-6 \
    libstdc++6 libgcc-s1 \
    # Runtime Boost (solo .so, non gli header -dev)
    libboost-filesystem1.74.0 libboost-iostreams1.74.0 \
    libboost-program-options1.74.0 libboost-system1.74.0 \
    libboost-thread1.74.0 libboost-regex1.74.0 \
    # Runtime GDAL/PDAL/PCL deps
    libflann1.9 libjpeg8 libpng16-16 libtiff5 \
    libpcl-common1.12 libpcl-io1.12 libpcl-filters1.12 \
    libpq5 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Python di default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python  python  /usr/bin/python3.10 1 && \
    python3 -m pip install --upgrade pip --no-cache-dir

# ── Dipendenze Python CPU ──────────────────────────────────
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt && \
    find /usr/local/lib/python3.10 -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# ── PyTorch + CUDA 11.8 (~5 GB) ───────────────────────────
RUN pip install --no-cache-dir \
    torch==2.3.0+cu118 torchvision==0.18.0+cu118 \
    --index-url https://download.pytorch.org/whl/cu118 && \
    find /usr/local/lib/python3.10 -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# ── CuPy ──────────────────────────────────────────────────
RUN pip install --no-cache-dir cupy-cuda11x && \
    find /usr/local/lib/python3.10 -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# ── cuML / RAPIDS (~4 GB) ─────────────────────────────────
# Rimuovi questo blocco se non viene usato in produzione:
# risparmio ~4 GB sull'immagine finale.
RUN pip install --no-cache-dir \
    --extra-index-url https://pypi.anaconda.org/rapidsai-wheels-nightly/simple \
    cuml-cu11 && \
    find /usr/local/lib/python3.10 -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# ── Copia binari compilati dallo stage builder ─────────────
COPY --from=builder /usr/local/lib     /usr/local/lib
COPY --from=builder /usr/local/bin     /usr/local/bin
COPY --from=builder /usr/local/share   /usr/local/share
COPY --from=builder /usr/local/include /usr/local/include

# ── Open3D precompilata ────────────────────────────────────
RUN wget -q https://github.com/isl-org/Open3D/releases/download/v0.19.0/open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    tar -xf open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz && \
    rm    open3d-devel-linux-x86_64-cxx11-abi-0.19.0.tar.xz

# ── tinygltf / stb headers ─────────────────────────────────
RUN mkdir -p /app/tinygltf && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/tiny_gltf.h     -O /app/tinygltf/tiny_gltf.h && \
    wget -q https://raw.githubusercontent.com/syoyo/tinygltf/master/json.hpp        -O /app/tinygltf/json.hpp && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image.h       -O /app/tinygltf/stb_image.h && \
    wget -q https://raw.githubusercontent.com/nothings/stb/master/stb_image_write.h -O /app/tinygltf/stb_image_write.h

# ── PotreeConverter ────────────────────────────────────────
RUN wget -q https://github.com/potree/PotreeConverter/releases/download/2.1.1/PotreeConverter_2.1.1_x64_linux.zip && \
    unzip -q PotreeConverter_2.1.1_x64_linux.zip && \
    rm       PotreeConverter_2.1.1_x64_linux.zip && \
    chmod +x PotreeConverter_linux_x64/PotreeConverter

# Aggiorna cache librerie dinamiche
RUN echo "/usr/local/lib" > /etc/ld.so.conf.d/local.conf && ldconfig

# ── Progetto Django e cartella opt ────────────────────────
COPY classifyViewer/ /webapp/classifyViewer/
COPY opt/            /webapp/opt/

WORKDIR /webapp

EXPOSE 8000

# # Gunicorn — modifica classifyViewer.wsgi se il modulo wsgi è diverso
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", \
#     "--timeout", "120", "classifyViewer.wsgi:application"]