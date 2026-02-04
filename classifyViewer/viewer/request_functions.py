from django.shortcuts import render
from django.http import JsonResponse
from viewer.functions import load_point_cloud

def load_points(request):
    # MODIFY WITH THE REAL PATH OF POINT CLOUD FILE
    file_path = "classifyViewer/viewer/data/cloud.txt"
    points, header = load_point_cloud(file_path)
    # Se vuoi, puoi limitare i punti per non mandare troppe coordinate al browser
    points = points[:1000].tolist()  
    print(f"Limited points count: {len(points)}")
    return JsonResponse({"points": points})