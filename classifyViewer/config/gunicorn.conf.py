"""
Gunicorn Configuration for 3D Classify Viewer
==============================================

This file contains the configuration settings for the Gunicorn server
that hosts the Django 3D Classify Viewer application.
"""

# Server binding address and port
# 0.0.0.0 allows connections from any IP address
# 8000 is the port on which the server will listen
bind = "0.0.0.0:8000"

# Number of worker processes handling requests
# One worker for a lightweight configuration (development/testing)
workers = 1

# Number of threads per worker
# 2 threads per worker to handle concurrent requests
threads = 2

# Request timeout in seconds (0 = disabled)
# Useful for classification operations that may take a long time
timeout = 0