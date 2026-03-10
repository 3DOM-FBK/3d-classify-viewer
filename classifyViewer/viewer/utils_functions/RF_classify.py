import time
import pickle
import argparse
import numpy as np
try:
    import cupy as cp
    from cuml.ensemble import RandomForestClassifier as cuRF
    GPU_AVAILABLE = True
except Exception:
    cp = None
    cuRF = None
    GPU_AVAILABLE = False
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import f1_score
import laspy
import re


def load_features_and_class(filepath):
    ''' Load the features to use from a txt file. Format: 
        f1 f2 ... fn
        c (ignored in this case)

        Attributes:
            filepath    :    path to the .txt file containing the features to use
    '''
    with open(filepath, 'r') as f:
        for line_index, line in enumerate(f.readlines()):
            tokens = line.strip().split(' ')
            if line_index == 0:
                feat_to_use = [int(t) for t in tokens]
    return feat_to_use

def get_feature_indices(full_header, selected_features):
    ''' Get indices of selected features in the full header.
    
        Attributes:
            full_header        : list of all feature names
            selected_features  : list of feature names to find
        
        Return:
            indices : list of indices of selected features in full_header
    '''
    indices = []
    for feat in selected_features:
        if feat in full_header:
            indices.append(full_header.index(feat))
        else:
            print(f"Warning: feature '{feat}' not found in header")
    return indices

def read_model(filepath):
    ''' Read the model from a .pkl file.

        Attributes:
            filepath    :   path to the .pkl file
    '''
    try:
        return pickle.load(open(filepath, 'rb'))
    except Exception as e:
        # If unpickling fails due to missing cuML on this system, give a helpful message
        if 'cuml' in str(e) or 'cuml' in getattr(e, 'name', ''):
            raise RuntimeError('Failed to unpickle model—cuML objects require RAPIDS/cuML to be installed for loading.') from e
        raise


def read_txt_data(filepath):
    ''' Read the point cloud to classify.

        Attributes:
            filepath    :   path to the .txt file containing the point cloud
        
        Return:
            X   :   numpy array with features
    '''
    header = None
    X = []
    with open(filepath, 'r') as f:
        lines = f.readlines()
        total_lines = len(lines)
        for line_index, line in enumerate(lines):
            tokens = line.strip().split(' ')
            if line_index == 0:
                # Store the header (first line) for later use
                tokens.append("prediction") # add class feature predicted
                header = " ".join(tokens)
                continue  # Skip header line (consistent with train script)
            #if 'nan' not in tokens: otherwise this "if" delete useful points   
            else : 
                X.append([float(t) for t_index, t in enumerate(tokens)])
    return np.asarray(X, dtype=np.float32), header

def read_las_data(filepath):
    ''' Read the point cloud to classify from a .las file.
        Attributes:
            filepath    :   path to the .las file containing the point cloud
        
        Return:
            X      :   numpy array with features
            header :   list of feature names (sanitized, with 'pred' appended)
    '''

    def sanitize_name(name):
        clean = re.sub(r'[^a-zA-Z0-9_]', '_', name)
        clean = re.sub(r'_+', '_', clean)
        return clean.strip('_')

    las = laspy.read(filepath)

    all_dims = list(las.point_format.dimension_names)

    # Exclude classification (not present or not needed for inference)
    BUILTIN_SKIP = {'classification'}
    raw_feature_dims = [d for d in all_dims if d not in BUILTIN_SKIP]

    # Build a map: original_name -> sanitized_name (with uniqueness check)
    name_map = {}
    seen = set()
    for col_name in raw_feature_dims:
        clean = sanitize_name(col_name)
        original_clean = clean
        counter = 1
        while clean.lower() in seen:
            clean = f"{original_clean}_{counter}"
            counter += 1
        seen.add(clean.lower())
        name_map[col_name] = clean

    # Build X using original names to access data, sanitized names as header
    columns = []
    valid_header = []
    for original, clean in name_map.items():
        try:
            col = np.array(getattr(las, original), dtype=np.float64)
            columns.append(col)
            valid_header.append(clean)
        except Exception as e:
            print(f"Skipping dimension '{original}' -> '{clean}': {e}")

    X = np.column_stack(columns)

    # Append 'pred' to header, consistent with txt version
    valid_header.append('prediction')
    header = valid_header

    return np.asarray(X, dtype=np.float32), header

def write_classification_txt(X, Y, filename, header):
    ''' Write a classified point cloud
    '''
    with open('{}'.format(filename), 'w') as out:
        X = X.tolist()
        Y_pred = Y.tolist()
        out.write('//{}\n'.format(header))
        for index, x in enumerate(X):
            # x_as_str = " ".join([str(i) for i in x[0:6]])
            x_as_str = " ".join([str(i) for i in x]) # If I want to write all features, not only the first 6 (x,y,z,r,g,b)
            out.write('{} {}\n'.format(x_as_str, str(Y_pred[index])))
def write_classification_las(X, Y, filename, header, source_las_path=None):
    ''' Write the test set with the predicted labels as .las file '''

    X = np.array(X)
    Y = np.array(Y)

    if isinstance(header, str):
        header = header.strip().lstrip('/').strip().split()

    def sanitize_name(name):
        clean = re.sub(r'[^a-zA-Z0-9_]', '_', name)
        clean = re.sub(r'_+', '_', clean)
        return clean.strip('_')

    # Campi built-in LAS: non vanno aggiunti come extra dims
    # LAS_BUILTIN = {'x', 'y', 'z', 'r', 'red', 'g', 'green', 'b', 'blue',
    #                'intensity', 'classification', 'return_number', 'number_of_returns',
    #                'scan_direction_flag', 'edge_of_flight_line', 'synthetic',
    #                'key_point', 'withheld', 'scan_angle_rank', 'scan_angle', 'user_data', 'point_source_id'}
    LAS_BUILTIN = {'x', 'y', 'z', 'r', 'red', 'g', 'green', 'b', 'blue',
               'intensity', 'classification', 'return_number', 'number_of_returns',
               'scan_direction_flag', 'edge_of_flight_line', 'synthetic',
               'key_point', 'withheld', 'scan_angle_rank', 'scan_angle', 'user_data', 'point_source_id',
               'gps_time', 'scanner_channel', 'scan_channel', 'overlap',
               'classification_flags', 'normal_x', 'normal_y', 'normal_z'}

    name_map = {}
    seen = set()
    for col_name in header:
        clean = sanitize_name(col_name)
        original_clean = clean
        counter = 1
        while clean.lower() in seen:
            clean = f"{original_clean}_{counter}"
            counter += 1
        seen.add(clean.lower())
        name_map[col_name] = clean

    if source_las_path:
        source_las = laspy.read(source_las_path)
        las_header = laspy.LasHeader(point_format=source_las.point_format.id,
                                     version=source_las.header.version)
        las_header.offsets = source_las.header.offsets
        las_header.scales  = source_las.header.scales
    else:
        las_header = laspy.LasHeader(point_format=7, version="1.4")
        if any(h.lower() == 'x' for h in header):
            las_header.offsets = np.min(X[:, :3], axis=0)
        las_header.scales = np.array([0.001, 0.001, 0.001])

    # Add only non-builtin dims as extra
    extra_dims = []
    for col_name in header:
        clean = name_map[col_name]
        if clean.lower() not in LAS_BUILTIN:
            extra_dims.append(
                laspy.ExtraBytesParams(name=clean, type=np.float64)
            )
    if extra_dims:
        las_header.add_extra_dims(extra_dims)

    las = laspy.LasData(header=las_header)

    for i, col_name in enumerate(header):
        clean = name_map[col_name]
        clean_lower = clean.lower()
        if clean_lower == 'x':
            las.x = X[:, i]
        elif clean_lower == 'y':
            las.y = X[:, i]
        elif clean_lower == 'z':
            las.z = X[:, i]
        elif clean_lower in ('r', 'red'):
            las.red = (X[:, i] * 257).astype(np.uint16)
        elif clean_lower in ('g', 'green'):
            las.green = (X[:, i] * 257).astype(np.uint16)
        elif clean_lower in ('b', 'blue'):
            las.blue = (X[:, i] * 257).astype(np.uint16)
        elif clean_lower == 'intensity':
            las.intensity = X[:, i].astype(np.uint16)
        elif clean_lower in LAS_BUILTIN:
            try:
                setattr(las, clean_lower, X[:, i])
            except Exception as e:{
                # print(f"Skipping built-in '{clean_lower}': {e}")
            }
        elif clean_lower == 'prediction':
            las[clean] = np.array(Y, dtype=np.uint8).flatten()
        else:
            las[clean] = X[:, i]

    las.write('{}'.format(filename))

def main():
    parser = argparse.ArgumentParser(description='Classify a point cloud with a pretrained model.')
    parser.add_argument('--selected_features',nargs="+", required=True, help='Selected feature for training')
    parser.add_argument('--model', required=True, help='Path to .pkl file containing the trained model.')
    parser.add_argument('--test_filepath', required=True, help='Path to .txt file containing the point cloud to classify.')
    parser.add_argument('--output_classify_name', required=True, help='Name of the predicted test file')
    parser.add_argument('--use_gpu', help='Use GPU for inference when possible (cuML)', action='store_true')
    args = parser.parse_args()

    selected_features = args.selected_features
    model = args.model
    test_filepath = args.test_filepath
    output_classify_name = args.output_classify_name
    use_gpu = args.use_gpu

    feat_to_use = []

    t0 = time.time()
    print('\nLoading model ...')
    model = read_model(model)                          # Load trained model
    print('Loading testing data ...')
    X, header = read_las_data(test_filepath)               # Load data to classify

    # print("\nLoading features data...")
    feat_to_use = get_feature_indices(header, selected_features)

    t1 = time.time()
    tot_sec = round(t1 - t0, 2)
    load_min = int(tot_sec // 60)
    load_sec = int(tot_sec % 60)
    if load_min > 0:
        print(f'\n---> Loading time {load_min} min {load_sec} sec')
    else:
        print(f'\n---> Loading time {load_sec} sec')

    print(f"\nTesting samples: {len(X)} \nUsing features indices: {selected_features}")
    print('\nClassifying the dataset ...')
    # Classify using GPU if requested and available and if the model is a cuML model.
    if use_gpu and GPU_AVAILABLE and cuRF is not None and isinstance(model, cuRF):
        Y_pred = cp.asnumpy(model.predict(cp.asarray(X[:, feat_to_use])))
    else:
        if use_gpu and not GPU_AVAILABLE:
            print('Warning: --use_gpu requested but cuML/cupy not available; falling back to CPU prediction.')
        Y_pred = model.predict(X[:, feat_to_use])               # Classify the data

    t2 = time.time()
    tot_sec = round(t2 - t1, 2)
    class_min = int(tot_sec // 60)
    class_sec = int(tot_sec % 60)
    if class_min > 0:
        print(f'---> Classification time {class_min} min {class_sec} sec')
    else:
        print(f'---> Classification time {class_sec} sec')
    
    print('\nSaving ...')

    # write_classification(X, Y_pred, output_classify_name, header)       # Output classification
    write_classification_las(X, Y_pred, output_classify_name, header)
    t3 = time.time()
    tot_sec = round(t3 - t2, 2)
    sav_min = int(tot_sec // 60)
    sav_sec = int(tot_sec % 60)
    if sav_min > 0:
        print(f'---> Saving time: {sav_min} min {sav_sec} sec')
    else:
        print(f'---> Saving time: {sav_sec} sec')
    
    tot_sec = round(t3 - t0, 2)
    minutes = int(tot_sec // 60)
    seconds = int(tot_sec % 60)
    if minutes > 0:
        print(f'\nTotal time {minutes} min {seconds} sec\n')
    else:
        print(f'\nTotal time {seconds} sec\n')

if __name__== '__main__':
    main()