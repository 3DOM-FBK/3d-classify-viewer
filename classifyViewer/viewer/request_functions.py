from django.shortcuts import render
from django.http import JsonResponse
from viewer.functions import launch_training_RF, launch_classify_RF, subsampling_point_cloud
from viewer.functions import mesh_to_point_cloud, ply_to_las, feature_extraction, Potree
from django.views.decorators.csrf import csrf_exempt
import base64
import os
import json
import traceback


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