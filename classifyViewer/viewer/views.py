from django.shortcuts import render
from django.http import HttpResponse, StreamingHttpResponse, Http404
import os
import re

# Create your views here.

def home(request):
    return HttpResponse("Hello, this is your first view!")

def test_babylon(request):
    return render(request, "viewer/viewer_page.html")


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
    full_path = os.path.normpath(os.path.join(BASE_DATA_DIR, filepath))

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