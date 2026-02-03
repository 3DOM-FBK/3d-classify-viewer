from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, this is your first view!")

def test_babylon(request):
    return render(request, "viewer/viewer_page.html")