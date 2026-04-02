from django.urls import path
from . import views
from .request_functions import save_file, launch_RF_training, launch_RF_classify, subsample_pc, stop_process, get_model_voxel_size, checking_point_id
from .request_functions import mesh2pc, ply2las, feat_extraction, potree_converter, _split_las_by_binary, las_to_feature_bin_view, read_text_file, model_exists, models_list, delete_model, extract_segment_las_view


urlpatterns = [
    # path('', views.home, name='home'),
    path('', views.test_babylon, name='test_babylon'),
    path('documentation/', views.documentation, name='documentation'),
    # Serve point cloud binary files with Range request support
    path('pointcloud-data/<path:filepath>', views.serve_range_file, name='serve_range_file'),
    # Add more path to launch other functions
    path("save_file/", save_file),
    path("launch_RF_training/", launch_RF_training),
    path("launch_RF_classify/", launch_RF_classify),
    path("api/clear-data/", views.clear_data),
    path("api/upload-data/", views.upload_data),
    path("api/start-training/", views.start_training),
    path("subsample_pc/", subsample_pc),
    path("get_model_voxel_size/", get_model_voxel_size),
    path("mesh2pc/", mesh2pc),
    path("ply2las/", ply2las),
    path("check_point_id/", checking_point_id),
    path("feature_extraction/", feat_extraction), 
    path("potree_converter/", potree_converter),
    path("split_las_by_binary/", _split_las_by_binary),
    path('las_to_feature_bin/', las_to_feature_bin_view),
    path("stop_process/", stop_process),
    path('api/read-file/', read_text_file, name='read_text_file'),
    path('api/model-exists/', model_exists, name='model_exists'),
    path('api/models-list/', models_list, name='models_list'),
    path('api/delete-model/', delete_model, name='delete_model'),
    path('api/extract-segment-las/', extract_segment_las_view, name='extract_segment_las'),
    path('api/download-package/', views.package_download_view, name='package_download'),
    path("api/upload-model/", views.upload_model),
]