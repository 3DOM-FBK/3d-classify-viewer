from django.urls import path
from . import views
from .request_functions import save_file, launch_RF_training, launch_RF_classify, subsample_pc
from .request_functions import mesh2pc, ply2las, feat_extraction, potree_converter, _split_las_by_binary

urlpatterns = [
    # path('', views.home, name='home'),
    path('', views.test_babylon, name='test_babylon'),
    # Serve point cloud binary files with Range request support
    path('pointcloud-data/<path:filepath>', views.serve_range_file, name='serve_range_file'),
    # Add more path to launch other functions
    path("save_file/", save_file),
    path("launch_RF_training/", launch_RF_training),
    path("launch_RF_classify/", launch_RF_classify),
    path("subsample_pc/", subsample_pc),
    path("mesh2pc/", mesh2pc),
    path("ply2las/", ply2las),
    path("api/clear-data/", views.clear_data),
    path("api/upload-data/", views.upload_data),
    path("api/start-training/", views.start_training),
    path("feature_extraction/", feat_extraction), 
    path("potree_converter/", potree_converter),
    path("split_las_by_binary/", _split_las_by_binary),
]