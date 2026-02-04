from django.urls import path
from . import views
from .request_functions import load_points

urlpatterns = [
    path('', views.home, name='home'),
    path('test/', views.test_babylon, name='test_babylon'),
    # Add more path to launch other functions
    path("load-points/", load_points),
]