# 3D Classify Viewer

A Django-based web application for the visualization and classification of 3D data.

## Features

-   Interactive 3D visualization using **BabylonJS**.
-   Integration with **Scikit-learn** for classification functionality (under development).
-   Containerized environment with Docker for easy deployment.

## Project Structure

The project is organized as follows:

-   `classifyViewer/`: The Django project root.
    -   `classifyViewer/`: Contains project configuration settings (settings, urls, wsgi).
    -   `viewer/`: The main Django application handling the viewer logic.
        -   `static/`: Contains static files (Javascript, CSS, 3D models).
        -   `templates/`: Contains HTML templates.
        -   `views.py`: Handles HTTP requests and visualization logic.
    -   `manage.py`: Django management script for running tasks like migrations and the development server.
-   `Dockerfile`: Configuration for containerizing the development and production environment.
-   `requirements.txt`: List of required Python dependencies.

## Requirements

-   Python 3.11+ (if running locally)
-   Docker (optional, but recommended for environment consistency)

## Installation and Execution

### Option 1: Using Docker (Recommended)

1.  **Build the Docker image:**
    ```bash
    docker build -t 3d-classify-viewer .
    ```

2.  **Run the container:**
    ```bash
    docker run -it -p 8000:8000 -v "$(pwd):/app" 3d-classify-viewer python classifyViewer/manage.py runserver 0.0.0.0:8000
    ```
    *Note: The command above mounts the current directory into the container to reflect code changes in real-time and starts the Django development server.*

### Option 2: Local Installation

1.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Prepare the database (if necessary):**
    ```bash
    cd classifyViewer
    python manage.py migrate
    ```

4.  **Start the development server:**
    ```bash
    python manage.py runserver
    ```
    The application will be accessible at `http://127.0.0.1:8000/`.

## Development Notes

-   Ensure dependencies are updated in the `requirements.txt` file.
-   The 3D viewer uses **BabylonJS** or similar technologies integrated into the templates within the `viewer/templates` folder.