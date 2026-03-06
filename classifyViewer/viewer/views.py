from django.shortcuts import render
from django.http import HttpResponse, StreamingHttpResponse, Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import re
import json
import datetime

# Create your views here.

def home(request):
    return HttpResponse("Hello, this is your first view!")

def test_babylon(request):
    return render(request, "viewer/viewer_page.html")

@csrf_exempt
def clear_data(request):
    """
    Clears all files and subdirectories in static/viewer/data/
    """
    if request.method == 'POST':
        try:
            data_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'static', 'viewer', 'data'
            )
            
            if os.path.exists(data_dir):
                import shutil
                for filename in os.listdir(data_dir):
                    # Keep 'clusters' folder if you want, but user said "eliminate all files and folders"
                    # User: "eliminare tutti i file e cartelle se ne esistono"
                    file_path = os.path.join(data_dir, filename)
                    try:
                        if os.path.isfile(file_path) or os.path.islink(file_path):
                            os.unlink(file_path)
                        elif os.path.isdir(file_path):
                            shutil.rmtree(file_path)
                    except Exception as e:
                        print(f'Failed to delete {file_path}. Reason: {e}')

            return JsonResponse({"message": "Data directory cleared successfully"}, status=200)
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

            # Define static data directory
            data_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'static', 'viewer', 'data'
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

            # Save in the same data directory used by the pipeline
            training_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'static', 'viewer', 'data'
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