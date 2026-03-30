from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .functions import launch_training_RF, launch_classify_RF, subsampling_point_cloud, stop_processes, get_voxel_size
from .functions import mesh_to_point_cloud, ply_to_las, feature_extraction, Potree, split_las_by_binary, las_to_feature_bin, extract_segment_las
import base64
import os
import json
import traceback


@csrf_exempt
def launch_RF_training(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] Launch RF training: ", request.body[:200])
            data = json.loads(request.body)
            launch_training_RF(data)
            print("\n")
            return JsonResponse({"status": 'success', "message": "RF training launched successfully."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Launch RF training ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def launch_RF_classify(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] Launch RF classify", request.body[:200]) 
            data = json.loads(request.body)
            launch_classify_RF(data)
            print("\n")
            return JsonResponse({"status": 'success', "message": "RF classify launched successfully."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Launch RF classify ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def subsample_pc(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] Subsample Point Cloud:", request.body[:200]) 
            data = json.loads(request.body)

            file_path = data['file_path']
            voxel_size = data['voxel_size'] 

            output_file_path = subsampling_point_cloud(file_path, voxel_size)
            print("\n")

            return JsonResponse({"status": 'success', "message": "Subsampling completed.", "output_file_path": output_file_path})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Subsample Point Cloud ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405) 

@csrf_exempt
def get_model_voxel_size(request):
    """Retrieve the voxel distance value from a model's report file."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            model_dir = data.get('model_dir', '')
            if not model_dir:
                return JsonResponse({"status": 'error', "message": "Missing 'model_dir'."}, status=400)
            
            voxel_size = get_voxel_size(model_dir)
            
            return JsonResponse({
                "status": 'success',
                "voxel_size": voxel_size
            })

        except Exception as e:
            print("\n[REQUEST FUNCTION] get_model_voxel_size ERROR " + str(e))
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def mesh2pc(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] Mesh to Point Cloud:", request.body[:200]) 
            data = json.loads(request.body)

            file_path = data['file_path']
            out_path = data['out_path']
            num_points = data['num_points']
            # sampling_method = data['sampling_method']

            mesh_to_point_cloud(file_path, out_path, num_points=num_points)
            print("\n")

            return JsonResponse({"status": 'success', "message": "Mesh to Point Cloud completed."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Mesh to Point Cloud ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405) 

@csrf_exempt
def ply2las(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] PLY to LAS:", request.body[:200]) 
            data = json.loads(request.body)

            file_path = data['file_path']
            out_path = data['out_path']

            ply_to_las(file_path, out_path=out_path)
            print("\n")

            return JsonResponse({"status": 'success', "message": "PLY to LAS completed."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] PLY to LAS ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405) 

@csrf_exempt
def feat_extraction(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] FEATURE EXTRACTION:", request.body[:200]) 
            data = json.loads(request.body)

            input_filepath = data['input_filepath']
            output_filepath = data['output_filepath']
            feature_list = data['feature_list']
            radius_list = data['radius_list']
            sampling = data.get('sampling', 0)  # Optional, default to 0 if not provided
        
            feature_extraction(input_filepath, output_filepath, feature_list, radius_list, sampling)
            print("\n")

            return JsonResponse({"status": 'success', "message": "Feature extraction completed."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Feature extraction ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def potree_converter(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] POTREE CONVERTER:", request.body[:200]) 
            data = json.loads(request.body)

            input_filepath = data['input_filepath']
            output_filepath = data['output_filepath']
        
            Potree(input_filepath, output_filepath)
            print("\n")

            return JsonResponse({"status": 'success', "message": "Potree conversion completed."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Potree conversion ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def stop_process(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] STOP PROCESS:") 

            stop_processes()

            return JsonResponse({"status": 'success', "message": "Process stopped successfully."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Stop process ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def save_file(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] Save file: ", request.body[:200]) 
            
            data = json.loads(request.body)
            filepath = data['filepath']
            
            # print("📂 Filepath:", filepath)
            # print("📊 Data size:", len(data['data']), "bytes (base64)")
            
            file_data = base64.b64decode(data['data'])
            
            # 🔧 Control path is absolute
            if not os.path.isabs(filepath):
                # If filepath is relative, use it in the project folder
                from django.conf import settings
                filepath = os.path.join(settings.BASE_DIR, filepath)
            
            # print("[Save file] Full path:", filepath)
            
            # Create folder if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, 'wb') as f:
                f.write(file_data)
            
            print(f"[REQUEST FUNCTION] File saved: {filepath} ({len(file_data)} bytes)")
            
            return JsonResponse({'status': 'success', 'filepath': filepath})
            
        except Exception as e:
            # 🔍 Stampa l'errore completo
            print("\n[REQUEST FUNCTION] Save file ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def _split_las_by_binary(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] SPLIT LAS BY BINARY:", request.body[:200]) 
            data = json.loads(request.body)

            las_path = data['las_path']
            bin_path = data['bin_path']
            meta_path = data['meta_path']
            output_dir = data['output_dir']

            split_las_by_binary(las_path, bin_path, meta_path, output_dir)
            print("\n")

            return JsonResponse({"status": 'success', "message": "Split LAS by binary completed."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Split LAS by binary ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def las_to_feature_bin_view(request):
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] LAS TO FEATURE BIN:", request.body[:200])
            data = json.loads(request.body)

            las_path = data['las_path']
            bin_path = data['bin_path']

            las_to_feature_bin(las_path, bin_path)
            print("\n")

            return JsonResponse({"status": 'success', "message": "Feature bin generated successfully."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] LAS TO FEATURE BIN ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

def models_list(request):
    """Return a list of all trained models found in viewer/static/viewer/data/models/."""
    if request.method == 'GET':
        try:
            from django.conf import settings
            models_root = os.path.join(settings.BASE_DIR, 'viewer', 'static', 'viewer', 'data', 'models')
            result = []

            if os.path.isdir(models_root):
                for name in sorted(os.listdir(models_root)):
                    model_dir = os.path.join(models_root, name)
                    pkl_path  = os.path.join(model_dir, 'model.pkl')
                    if not os.path.isdir(model_dir) or not os.path.isfile(pkl_path):
                        continue
                    stat = os.stat(pkl_path)
                    import datetime
                    created = datetime.datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M')
                    size_mb = round(stat.st_size / (1024 * 1024), 2)
                    result.append({
                        'name': name,
                        'path': f'viewer/static/viewer/data/models/{name}/model.pkl',
                        'created': created,
                        'size_mb': size_mb,
                    })

            return JsonResponse({'status': 'success', 'models': result})

        except Exception as e:
            print("\n[REQUEST FUNCTION] models_list ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


def model_exists(request):
    """Check whether a model folder already exists under /data/models/{name}/."""
    if request.method == 'GET':
        try:
            name = request.GET.get('name', '').strip()
            if not name:
                return JsonResponse({'exists': False})

            from django.conf import settings
            model_dir = os.path.join(settings.BASE_DIR, 'viewer', 'static', 'viewer', 'data', 'models', name)
            exists = os.path.isdir(model_dir) and os.path.isfile(os.path.join(model_dir, 'model.pkl'))

            return JsonResponse({'exists': exists})

        except Exception as e:
            print("\n[REQUEST FUNCTION] model_exists ERROR " + str(e))
            return JsonResponse({'exists': False})

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_model(request):
    """Delete a trained model folder from /data/models/{name}/."""
    if request.method == 'POST':
        try:
            import shutil
            data = json.loads(request.body)
            name = data.get('name', '').strip()

            if not name:
                return JsonResponse({'status': 'error', 'message': 'No model name provided'}, status=400)

            # Prevent path traversal
            if '/' in name or '\\' in name or '..' in name:
                return JsonResponse({'status': 'error', 'message': 'Invalid model name'}, status=400)

            from django.conf import settings
            model_dir = os.path.join(
                settings.BASE_DIR, 'viewer', 'static', 'viewer', 'data', 'models', name
            )

            if not os.path.isdir(model_dir):
                return JsonResponse({'status': 'error', 'message': 'Model not found'}, status=404)

            shutil.rmtree(model_dir)
            print(f"\n[REQUEST FUNCTION] Model '{name}' deleted: {model_dir}")

            return JsonResponse({'status': 'success', 'message': f"Model '{name}' deleted successfully."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] delete_model ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def extract_segment_las_view(request):
    """
    Extract all points for a single segment from features.las into a new .las
    file suitable for classification (no 'labels' dim added).

    POST body (JSON):
        las_path  - path to features.las
        bin_path  - path to the .bin buffer (2 bytes/point: [seg_id, class_id])
        seg_id    - integer segment ID to extract
        out_path  - destination .las path
    """
    if request.method == 'POST':
        try:
            print("\n[REQUEST FUNCTION] EXTRACT SEGMENT LAS:", request.body[:200])
            data = json.loads(request.body)

            las_path = data['las_path']
            bin_path = data['bin_path']
            seg_id   = int(data['seg_id'])
            out_path = data['out_path']

            extract_segment_las(las_path, bin_path, seg_id, out_path)
            print("\n")

            return JsonResponse({"status": 'success', "message": "Segment extraction completed."})

        except Exception as e:
            print("\n[REQUEST FUNCTION] EXTRACT SEGMENT LAS ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


def read_text_file(request):
    """Read a text file from the server and return its content."""
    if request.method == 'GET':
        try:
            file_path = request.GET.get('path', '')
            if not file_path:
                return JsonResponse({'status': 'error', 'message': 'No path provided'}, status=400)

            # Make absolute path relative to project root
            if not os.path.isabs(file_path):
                from django.conf import settings
                file_path = os.path.join(settings.BASE_DIR, file_path)

            if not os.path.exists(file_path):
                return JsonResponse({'status': 'error', 'message': 'File not found'}, status=404)

            # If it's a directory, find the first .txt file inside it
            if os.path.isdir(file_path):
                txt_files = [f for f in os.listdir(file_path) if f.lower().endswith(".txt")]
                if txt_files:
                    file_path = os.path.join(file_path, txt_files[0])
                else:
                    return JsonResponse({'status': 'error', 'message': 'No .txt file found in directory'}, status=404)

            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            return JsonResponse({'status': 'success', 'content': content})

        except Exception as e:
            print("\n[REQUEST FUNCTION] Read text file ERROR " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)