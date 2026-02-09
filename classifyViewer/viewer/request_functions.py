from django.shortcuts import render
from django.http import JsonResponse
from viewer.functions import load_point_cloud, launch_training_RF
from django.views.decorators.csrf import csrf_exempt
import base64
import os
import json
import traceback

def load_points(request):
    # MODIFY WITH THE REAL PATH OF POINT CLOUD FILE
    file_path = "classifyViewer/viewer/static/viewer/data/cloud.txt"
    # points, header = load_point_cloud(file_path)
    # # Se vuoi, puoi limitare i punti per non mandare troppe coordinate al browser
    # points = points[:5].tolist()  
    # print(f"Limited points count: {len(points)}")
    return JsonResponse({"filepath": file_path})

def launch_RF_training(request):
    if request.method == 'POST':
        try:
            print("[Launch RF training] Request body:", request.body[:200]) 
            data = json.loads(request.body)
            launch_training_RF(data)
            return JsonResponse({"status": 'success', "message": "RF launched successfully."})

        except Exception as e:
            print("[Launch RF training ERROR] " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    

@csrf_exempt
def save_file(request):
    if request.method == 'POST':
        try:
            print("[Save file] Request body:", request.body[:200]) 
            
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
            
            print(f"[Save file] File salvato: {filepath} ({len(file_data)} bytes)")
            
            return JsonResponse({'status': 'success', 'filepath': filepath})
            
        except Exception as e:
            # 🔍 Stampa l'errore completo
            print("[Save file ERROR] " + str(e))
            print(traceback.format_exc())
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)