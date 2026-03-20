from django.shortcuts import render
from django.http import HttpResponse, StreamingHttpResponse, Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import re
import json
import datetime
import zipfile
import tempfile
import shutil

# Create your views here.

def home(request):
    return HttpResponse("Hello, this is your first view!")

def test_babylon(request):
    return render(request, "viewer/viewer_page.html")

def documentation(request):
    return render(request, "viewer/docs_page.html") 

@csrf_exempt
def clear_data(request):
    """
    Clears all files and subdirectories in static/viewer/data/working/
    leaving static/viewer/data/models/ untouched.
    """
    if request.method == 'POST':
        try:
            import shutil
            working_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'static', 'viewer', 'data', 'working'
            )
            if os.path.exists(working_dir):
                shutil.rmtree(working_dir)
            os.makedirs(working_dir, exist_ok=True)

            return JsonResponse({"message": "Working directory cleared successfully"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)


@csrf_exempt
def upload_data(request):
    """
    Endpoint for uploading a point cloud file (.ply, .las, .laz, .glb) 
    to the static/viewer/data directory.
    """
    if request.method == 'POST':
        try:
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return JsonResponse({"error": "No file provided"}, status=400)

            # Define working data directory
            data_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'static', 'viewer', 'data', 'working'
            )
            os.makedirs(data_dir, exist_ok=True)

            file_path = os.path.join(data_dir, uploaded_file.name)
            
            # Save file
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            return JsonResponse({
                "message": "File uploaded successfully",
                "filename": uploaded_file.name,
                "rel_path": uploaded_file.name
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)


@csrf_exempt
@csrf_exempt
def start_training(request):
    """
    Endpoint for receiving training data in binary format.
    Expects FormData with:
    - 'labels': JSON string mapping segmentId -> segmentName
    - 'buffer': Binary file (one byte per point total)
    """
    if request.method == 'POST':
        try:
            label_map_json = request.POST.get('labels')
            buffer_file = request.FILES.get('buffer')

            if not label_map_json:
                return JsonResponse({"error": "Missing 'labels' metadata"}, status=400)
            if not buffer_file:
                return JsonResponse({"error": "Missing 'buffer' binary data"}, status=400)

            # Save in the working directory used by the pipeline
            training_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'static', 'viewer', 'data', 'working'
            )
            os.makedirs(training_dir, exist_ok=True)

            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            bin_filename = f"labels_{timestamp}.bin"
            json_filename = f"meta_{timestamp}.json"

            # Save binary buffer
            bin_path = os.path.join(training_dir, bin_filename)
            with open(bin_path, 'wb') as f:
                for chunk in buffer_file.chunks():
                    f.write(chunk)

            # Save metadata JSON
            json_path = os.path.join(training_dir, json_filename)
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(label_map_json)

            return JsonResponse({
                "message": "Binary data saved successfully",
                "filename": bin_filename,
                "labels_filename": json_filename,
                "bin_path": bin_path,
                "json_path": json_path,
                "size_bytes": os.path.getsize(bin_path)
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)


def serve_range_file(request, filepath):
    """
    Serve binary files (octree.bin, hierarchy.bin) with HTTP Range request support.
    This is critical for Potree 2.0 which needs to fetch small chunks from
    very large files (e.g. 3GB octree.bin).
    
    Without this, Django's dev server returns the entire file for every request,
    which crashes the browser for large files.
    """
    # Security: restrict to specific binary files in the data directory
    ALLOWED_EXTENSIONS = ('.bin', '.json')
    BASE_DATA_DIR = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
        'static', 'viewer', 'data'
    )

    # Normalize and validate path
    # We lstrip('/') to ensure os.path.join doesn't treat it as an absolute path
    full_path = os.path.normpath(os.path.join(BASE_DATA_DIR, filepath.lstrip('/')))

    # Prevent directory traversal
    if not full_path.startswith(os.path.normpath(BASE_DATA_DIR)):
        raise Http404("Access denied")

    if not os.path.isfile(full_path):
        raise Http404(f"File not found: {filepath}")

    _, ext = os.path.splitext(full_path)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise Http404("File type not allowed")

    file_size = os.path.getsize(full_path)

    # Determine content type
    content_type = 'application/octet-stream'
    if ext.lower() == '.json':
        content_type = 'application/json'

    # Check for Range header
    range_header = request.META.get('HTTP_RANGE', '')

    if range_header:
        # Parse Range: bytes=start-end
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1

            # Clamp
            end = min(end, file_size - 1)

            if start > end or start >= file_size:
                response = HttpResponse(status=416)  # Range Not Satisfiable
                response['Content-Range'] = f'bytes */{file_size}'
                return response

            length = end - start + 1

            def file_chunk_iterator():
                with open(full_path, 'rb') as f:
                    f.seek(start)
                    remaining = length
                    chunk_size = 65536  # 64KB chunks
                    while remaining > 0:
                        read_size = min(chunk_size, remaining)
                        data = f.read(read_size)
                        if not data:
                            break
                        remaining -= len(data)
                        yield data

            response = StreamingHttpResponse(
                file_chunk_iterator(),
                status=206,
                content_type=content_type
            )
            response['Content-Length'] = length
            response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
            response['Accept-Ranges'] = 'bytes'
            response['Access-Control-Allow-Origin'] = '*'
            return response

    # No Range header — serve full file (for small files like metadata.json)
    # For large files, stream it
    if file_size > 10 * 1024 * 1024:  # > 10MB: stream
        def full_file_iterator():
            with open(full_path, 'rb') as f:
                chunk_size = 65536
                while True:
                    data = f.read(chunk_size)
                    if not data:
                        break
                    yield data

        response = StreamingHttpResponse(
            full_file_iterator(),
            content_type=content_type
        )
    else:
        with open(full_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)

    response['Content-Length'] = file_size
    response['Accept-Ranges'] = 'bytes'
    response['Access-Control-Allow-Origin'] = '*'
    return response

@csrf_exempt
def upload_model(request):
    """
    Endpoint for uploading a trained model in a ZIP file.
    The ZIP must contain the model files (pkl, json, txt).
    """
    if request.method == 'POST':
        try:
            from django.conf import settings
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return JsonResponse({"error": "No file provided"}, status=400)
            if not uploaded_file.name.endswith('.zip'):
                return JsonResponse({"error": "Only ZIP files are supported"}, status=400)

            model_name = os.path.splitext(uploaded_file.name)[0]
            models_root = os.path.join(settings.BASE_DIR, 'viewer', 'static', 'viewer', 'data', 'models')
            os.makedirs(models_root, exist_ok=True)
            
            model_dir = os.path.join(models_root, model_name)
            if os.path.exists(model_dir):
                shutil.rmtree(model_dir)

            with tempfile.TemporaryDirectory() as temp_dir:
                temp_zip_path = os.path.join(temp_dir, uploaded_file.name)
                with open(temp_zip_path, 'wb+') as f:
                    for chunk in uploaded_file.chunks():
                        f.write(chunk)
                
                # Separate directory for extraction to avoid copying the ZIP itself
                extract_path = os.path.join(temp_dir, "extracted")
                os.makedirs(extract_path, exist_ok=True)

                with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_path)
                    
                    # Logic to handle both flat zip and one-folder-deep zip
                    items = [i for i in os.listdir(extract_path) if not i.startswith('__MACOSX')]
                    extract_target = extract_path
                    if len(items) == 1 and os.path.isdir(os.path.join(extract_path, items[0])):
                        extract_target = os.path.join(extract_path, items[0])

                    # Verify model.pkl
                    if not any(f.endswith('.pkl') for f in os.listdir(extract_target)):
                        return JsonResponse({"error": "ZIP must contain a .pkl model file"}, status=400)

                    # Move content to final folder
                    shutil.copytree(extract_target, model_dir, dirs_exist_ok=True)

            return JsonResponse({"status": "success", "message": f"Model '{model_name}' uploaded successfully", "name": model_name})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def package_download_view(request):
    """
    Creates a ZIP package containing the selected LAS segments and trained models.
    """
    if request.method == 'POST':
        try:
            from django.conf import settings
            from io import BytesIO
            import zipfile
            from .functions import extract_segment_las

            data = json.loads(request.body)
            selected_segments = data.get('segments', []) # list of {id, label}
            selected_models   = data.get('models', [])   # list of model names
            project_las       = data.get('las_path')     # e.g. viewer/static/viewer/data/working/features.las
            project_bin       = data.get('bin_path')     # e.g. viewer/static/viewer/data/working/features.bin
            
            # Convert relative paths to absolute if needed
            if project_las and not os.path.isabs(project_las):
                project_las = os.path.join(settings.BASE_DIR, project_las)
            if project_bin and not os.path.isabs(project_bin):
                project_bin = os.path.join(settings.BASE_DIR, project_bin)
                
            # Fallbacks if paths missing
            working_dir = os.path.join(settings.BASE_DIR, 'viewer', 'static', 'viewer', 'data', 'working')
            if not project_las: project_las = os.path.join(working_dir, 'features.las')
            if not project_bin: project_bin = os.path.join(working_dir, 'features.bin')
            
            models_root = os.path.join(settings.BASE_DIR, 'viewer', 'static', 'viewer', 'data', 'models')
            
            zip_buffer = BytesIO()
            # Gather items
            items_to_zip = [] # list of (archive_path, file_content_or_path, is_content)

            # 1. Process Segments
            for seg in selected_segments:
                seg_id = int(seg['id'])
                label  = seg['label'].replace(' ', '_').replace('.', '_')
                
                if seg_id == 0:
                    if os.path.isfile(project_las):
                        items_to_zip.append((f"segments/{label}.las", project_las, False))
                else:
                    seg_las_name = f"segment_{seg_id}.las"
                    seg_las_path = os.path.join(working_dir, seg_las_name)
                    if not os.path.isfile(seg_las_path):
                        if os.path.isfile(project_las) and os.path.isfile(project_bin):
                            try:
                                extract_segment_las(project_las, project_bin, seg_id, seg_las_path)
                            except Exception as ex:
                                print(f"[DOWNLOAD] Error extracting segment {seg_id}: {ex}")
                    if os.path.isfile(seg_las_path):
                        items_to_zip.append((f"segments/{label}.las", seg_las_path, False))

            # 2. Process Models
            for model_name in selected_models:
                model_dir = os.path.join(models_root, model_name)
                if os.path.isdir(model_dir):
                    model_zip_buf = BytesIO()
                    with zipfile.ZipFile(model_zip_buf, 'w', zipfile.ZIP_DEFLATED) as model_zip:
                        ALLOWED_EXTS = ('.pkl', '.txt', '.json')
                        for root, _, files in os.walk(model_dir):
                            for file in files:
                                if any(file.lower().endswith(ext) for ext in ALLOWED_EXTS):
                                    f_path = os.path.join(root, file)
                                    model_zip.write(f_path, file)
                    
                    model_zip_buf.seek(0)
                    items_to_zip.append((f"models/{model_name}.zip", model_zip_buf.read(), True))

            # Decide on response format
            if len(items_to_zip) == 1 and items_to_zip[0][0].startswith("models/") and items_to_zip[0][2]:
                # Only one model: return its zip directly
                content = items_to_zip[0][1]
                model_filename = os.path.basename(items_to_zip[0][0])
                response = HttpResponse(content, content_type='application/zip')
                response['Content-Disposition'] = f'attachment; filename="{model_filename}"'
                return response

            # Multiple items or segments: create wrapper zip
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for arcname, target, is_content in items_to_zip:
                    if is_content:
                        zip_file.writestr(arcname, target)
                    else:
                        zip_file.write(target, arcname)

            zip_buffer.seek(0)
            response = HttpResponse(zip_buffer.read(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename="download_package.zip"'
            return response

        except Exception as e:
            import traceback
            print(f"[DOWNLOAD ERROR] {e}")
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)