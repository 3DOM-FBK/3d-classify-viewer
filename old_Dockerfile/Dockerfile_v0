# Dockerfile for Python (Django + Scikit-learn)

# Python environment
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    libgl1 \
    libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project
COPY . /app/

# Expose port
EXPOSE 8000

# Command to run the application
# Nota: Sostituisci 'my_project' con il nome effettivo del tuo progetto Django
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "my_project.wsgi:application"]
