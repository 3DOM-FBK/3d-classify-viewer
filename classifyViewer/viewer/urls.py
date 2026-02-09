from django.urls import path
from . import views
from .request_functions import load_points, save_file, launch_RF_training, subsample_pc

urlpatterns = [
    # path('', views.home, name='home'),
    path('', views.test_babylon, name='test_babylon'),
    # Add more path to launch other functions
    path("load-points/", load_points),
    path("save_file/", save_file),
    path("launch_RF_training/", launch_RF_training),
    path("subsample_pc/", subsample_pc),
]