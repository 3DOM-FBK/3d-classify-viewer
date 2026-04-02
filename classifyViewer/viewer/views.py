from django.shortcuts import render

# Create your views here.

def main_viewer(request):
    return render(request, "viewer/viewer_page.html")

def documentation(request):
    return render(request, "viewer/docs_page.html") 

