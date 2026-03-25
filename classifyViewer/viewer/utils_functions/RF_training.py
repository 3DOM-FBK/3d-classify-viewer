import time
import pickle
import argparse
import os
import sys
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
from sklearn.metrics import precision_score, recall_score, accuracy_score, f1_score, confusion_matrix, jaccard_score
import itertools
import laspy
import re
import copy
from scipy.spatial import KDTree


def load_features_and_class(filepath):
    ''' Load the features to use from a txt file. Format: 
        f1 f2 ... fn
        c

        Attributes:
            filepath    :    path to the .txt file containing the features to use
    '''
    with open(filepath, 'r') as f:
        for line_index, line in enumerate(f.readlines()):
            tokens = line.strip().split(' ')
            if line_index == 0:
                feat_to_use = [int(t) for t in tokens]
            elif line_index == 1:
                class_index= int(tokens[0])
    return feat_to_use, class_index

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

def read_txt_data(filepath, class_index):
    ''' Read a labelled point cloud.

        Attributes:
            filepath    :   path to the .txt file containing the point cloud
            class_index :   index of the class label

        Return:
            X   :   numpy array with features
            Y   :   numpy array with classes
            header :   list of feature names (from the first line)
    '''
    X, Y = [], []
    header = None
    with open(filepath, 'r') as f:
        lines = f.readlines()
        total_lines = len(lines)
        for line_index, line in enumerate(lines):
            tokens = line.strip().split(' ')
            if line_index == 0:
                # Treat first line as header only if it contains non-numeric tokens (actual column names)
                try:
                    [float(t) for t in tokens]
                    # All tokens are numeric — no header present, process as data
                except ValueError:
                    # At least one token is non-numeric — this is a header line
                    header = tokens
                    continue
            if 'nan' not in tokens and not tokens[0].startswith('//') and len(tokens) > class_index:
                X.append([float(t) for t_index, t in enumerate(tokens) if t_index != class_index])
                Y.append(int(float(tokens[class_index])))
    return np.asarray(X, dtype=np.float64), np.asarray(Y, dtype=np.float64), header

def read_las_data(filepath, class_las_index):
    ''' Read a labelled point cloud from a .las file.

        Attributes:
            filepath    :   path to the .las file containing the point cloud
            class_las_index :   index of the class label in the .las file

        Return:
            X   :   numpy array with features
            Y   :   numpy array with classes
            header :   list of feature names (from the las file)
    '''

    def sanitize_name(name):
        clean = re.sub(r'[^a-zA-Z0-9_]', '_', name)
        clean = re.sub(r'_+', '_', clean)
        return clean.strip('_')

    las = laspy.read(filepath)

    all_dims = list(las.point_format.dimension_names)

    # Exclude the class dimension and 'classification' from features
    BUILTIN_SKIP = {class_las_index, 'classification'}
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
    header = valid_header

    # Build Y from the class dimension
    Y = np.array(getattr(las, class_las_index), dtype=np.float64)

    # Filter out rows with NaN values
    valid_mask = ~np.isnan(X).any(axis=1) & ~np.isnan(Y)
    X = X[valid_mask]
    Y = Y[valid_mask]

    return X, Y, header

def train_model(X_train, Y_train, n_jobs, use_gpu=False,
                n_estimators=200, max_depth=15, min_samples_split=20, max_features='sqrt'):
    ''' Train the Random Forest model with the specified parameters and return it.

        Default parameters follow the RF200 configuration:
            - 200 trees (n_estimators)
            - maximum tree depth of d_max = 15
            - minimum samples to split a node of n_min = 20
            - number of features per split = sqrt(n_features)

        Attributes:
            X_train             :   numpy array with training features
            Y_train             :   numpy array with training classes
            n_jobs              :   number of threads used to train the model (CPU only)
            use_gpu             :   whether to use GPU-accelerated training via cuML
            n_estimators        :   number of trees in the forest (default: 200)
            max_depth           :   maximum depth of each tree (default: 15)
            min_samples_split   :   minimum samples required to split a node (default: 20)
            max_features        :   number of features per split (default: 'sqrt')
        
        Return:
            model           :   trained model
    '''
    # If GPU requested and cuML is available, use cuML's RandomForest (requires RAPIDS stack)
    if use_gpu and GPU_AVAILABLE:
        print(f"GPU is AVAILABLE, so use cuml for training.")
        Xg = cp.asarray(X_train)
        yg = cp.asarray(Y_train)
        # cuML requires an explicit integer for max_depth — None is not supported
        model = cuRF(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            max_features=max_features,
            random_state=0
        )
        model.fit(Xg, yg)
        return model
    else :
        print(f"GPU is not AVAILABLE, so use scikit-learn for training.")
        # Fallback to scikit-learn on CPU
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            max_features=max_features,
            random_state=0,
            oob_score=True,
            n_jobs=n_jobs
        )
        model.fit(X_train, Y_train)
        return model


def write_classification_txt(X_test, Y_test_pred, filename, header):
    ''' Write the test set with the predicted labels 
    '''
    with open('{}'.format(filename), 'w') as out:
        X_test = X_test.tolist()
        Y_test_pred = Y_test_pred.tolist()
        out.write('//{}\n'.format(header))
        for index, x_t in enumerate(X_test):
            x_t_as_str = " ".join([str(x) for x in x_t[0:6]])
            out.write('{} {}\n'.format(x_t_as_str, str(Y_test_pred[index])))


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
        elif clean_lower == 'classification':
            pass  # scritto separatamente da Y
        elif clean_lower in LAS_BUILTIN:
            try:
                setattr(las, clean_lower, X[:, i])
            except Exception as e:{
                # print(f"Skipping built-in '{clean_lower}': {e}")
            }
        else:
            las[clean] = X[:, i]

    las.classification = np.array(Y, dtype=np.uint8).flatten()

    las.write('{}'.format(filename))

def save_model(model, filename):
    ''' Save the trained machine learning model

        Attribures:
            model       :   model to save
            filename    :   name of the file where the model is saved
    '''
    with open(filename, 'wb') as out:
        pickle.dump(model, out, pickle.HIGHEST_PROTOCOL)

def get_voxel_size_from_las(filepath, sample_size=10000):
    with laspy.open(filepath) as fh:
        las = fh.read()
        coords = np.vstack((las.x - las.header.offsets[0], 
                            las.y - las.header.offsets[1], 
                            las.z - las.header.offsets[2])).T

    # Calcoliamo su TUTTI i punti
    tree = KDTree(coords)
    # Attenzione: su dataset molto grandi (10M+ punti) questo potrebbe saturare la RAM
    distanze, _ = tree.query(coords, k=2)
    
    return np.median(distanze[:, 1])

    
def main():
    parser = argparse.ArgumentParser(description='Train the random forest model.')
    parser.add_argument('--selected_features', nargs="+", required = True, help='Selected feature for training')
    parser.add_argument('--training_filepath', required = True, help='Path to the training file (.las) [f1, ..., fn, c]')
    parser.add_argument('--val_filepath', required = True, help='Path to the test file (.las) [f1, ..., fn, c]')
    parser.add_argument('--n_jobs', required = True, help='Number of threads used to train the model', type=int)
    parser.add_argument('--n_estimators', required = True, help='Number of trees (e.g. 200)', type=int)
    parser.add_argument('--max_depth', help='Maximum depth of each tree', type=int)
    parser.add_argument('--min_samples_split', help='Minimum samples required to split a node', type=int)
    parser.add_argument('--max_features', help='Number of features per split', type=str)
    parser.add_argument('--use_gpu', help='Try to use GPU-accelerated training (cuML)', action='store_true')
    parser.add_argument('--output_training_name', required = True, help='Name of the predicted test file')
    parser.add_argument('--model_savepath', help='Path to save the model')
    parser.add_argument('--report_savepath', help='Path to save the training report')
    args= parser.parse_args()

    # PARAMETERS 
    selected_features = args.selected_features
    training_filepath = args.training_filepath
    val_filepath = args.val_filepath
    n_jobs = args.n_jobs
    n_estimators = args.n_estimators if args.n_estimators else 200
    max_depths = args.max_depth if args.max_depth else 15
    min_samples_split=args.min_samples_split if args.min_samples_split else 20
    max_features=args.max_features if args.max_features else "sqrt"
    use_gpu = args.use_gpu
    output_training_name = args.output_training_name
    model_savepath = args.model_savepath
    report_savepath = args.report_savepath if args.report_savepath else os.path.join(os.path.dirname(output_training_name), 'report_RF.txt')
    class_las_index = "labels"

    feat_to_use = []
    
    total_start = time.time()
    t0 = time.time()

    print("\nLoading training data...")
    X_train, Y_train, header = read_las_data(training_filepath, class_las_index)

    # Calculate voxel distance
    suggested_voxel = get_voxel_size_from_las(training_filepath)
        
    print("\nLoading validation data...")
    X_test, Y_test, _ = read_las_data(val_filepath, class_las_index)
    
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
    print('\nStatistics:\n- Training samples: {}\n- Testing samples: {}\n- Features selected: {}'.format(len(Y_train), len(Y_test), selected_features))

    # Use the header for feature importance visualization
    if header:
        headers = [header[i] for i in feat_to_use]  # Select only the headers corresponding to feat_to_use
    else:
        headers = ['col_{}'.format(i) for i in feat_to_use]  # Fallback: use column indices from feat_to_use

    ''' ***************************************** TRAINING ************************************** '''
    # Fixed RF200 configuration: 200 trees, max_depth=15, min_samples_split=20, max_features='sqrt'
    print(f'\nTraining the model n_jobs={n_jobs}, n_estimators={n_estimators}, max_depth={max_depths}, min_samples_split={min_samples_split}, max_features={max_features} ...')  
    tot_train_sec = 0
    tot_metrics_sec = 0
    
    t2 = time.time()
    # X_train[:, feat_to_use] specify only feature needed
    model = train_model(X_train[:, feat_to_use], Y_train, n_jobs=n_jobs, use_gpu=use_gpu,
                        n_estimators=n_estimators,
                        max_depth=max_depths,
                        min_samples_split=min_samples_split,
                        max_features=max_features
                        )  # Uses RF200 defaults

    t3 = time.time()
    tot_train_sec = round(t3 - t2, 2)
    train_min = int(tot_train_sec // 60)
    train_sec = int(tot_train_sec % 60)
    if train_min > 0:
        print(f'---> Training time {train_min} min {train_sec} sec')
    else:
        print(f'---> Training time {train_sec} sec')
    
    # print('\nEvaluating on validation set...')
    # Predict depending on whether we used cuML (GPU) or scikit-learn (CPU)
    if use_gpu and GPU_AVAILABLE and cuRF is not None:
        Y_test_pred = cp.asnumpy(model.predict(cp.asarray(X_test[:, feat_to_use])))
    else:
        Y_test_pred = model.predict(X_test[:, feat_to_use])             # Test the model, using only the specified features
    # print(f'\nSaving {output_training_name}')
    # write_classification_las(X_test, Y_test_pred, output_training_name, header)

    # Compute metrics
    print('\nComputing metrics...')
    Precision_pc = precision_score(Y_test, Y_test_pred, average=None)
    Precision = precision_score(Y_test, Y_test_pred, average='weighted')
    Recall_pc = recall_score(Y_test, Y_test_pred, average=None)
    Recall = recall_score(Y_test, Y_test_pred, average='weighted')
    f1_pc = f1_score(Y_test, Y_test_pred, average=None)
    f1 = f1_score(Y_test, Y_test_pred, average='weighted')
    IoU_pc = jaccard_score(Y_test, Y_test_pred, average=None)
    IoU = jaccard_score(Y_test, Y_test_pred, average='weighted')
    con_mat = confusion_matrix(Y_test, Y_test_pred)
    acc = accuracy_score(Y_test, Y_test_pred)
    t4 = time.time()

    tot_metrics_sec = round(t4 - t3, 2)
    metr_min = int(tot_metrics_sec // 60)
    metr_sec = int(tot_metrics_sec % 60)
    if metr_min > 0:
        print(f'---> Computing Metrics time: {metr_min} min {metr_sec} sec')
    else:
        print(f'---> Computing Metrics time {metr_sec} sec')
    
    # Sort features by importance in descending order
    # Try to get feature importances; cuML may expose a similar attribute
    try:
        feats = model.feature_importances_
        # In case cuML returns cupy array
        if GPU_AVAILABLE and cp is not None and isinstance(feats, cp.ndarray):
            feats = cp.asnumpy(feats)
    except Exception:
        feats = np.zeros(len(headers))
    sorted_features = sorted(zip(headers, feats), key=lambda x: x[1], reverse=True)
    
    # Print results
    print('\n- Confusion matrix:\n{}'.format(confusion_matrix(Y_test, Y_test_pred)))
    print('\n- Feature importance:')
    for name, importance in sorted_features:
        print(f'{name}: {importance:.4f}')

    #Print report with results
    report_fname = report_savepath

    print(f'\nCheck the complete report in the folder: {report_fname}')
    ''' ******************************************************************************************** '''

    tot_sec = round(t4 - total_start, 2)
    tot_min = int(tot_sec // 60)
    tot_sec = int(tot_sec % 60)

    np.set_printoptions(precision=4)
    file = open(report_fname,"w") 
    file.write("Overall Accuracy\n\n")
    file.write('{:.4f}'.format(acc))
    file.write("\n\nPrecision per class\n\n")
    file.write(str(Precision_pc))   
    file.write("\n\nAverage Precision\n\n")
    file.write('{:.4f}'.format(Precision_pc.mean()))
    file.write("\n\nWeighted Precision\n\n")
    if np.ndim(Precision) == 0:  # in case is a single value
         file.write('{:.4f}'.format(Precision))
    else:  # otherwise can be computed the mean
        file.write('{:.4f}'.format(Precision.mean()))
    file.write("\n\nRecall per class\n\n")
    file.write(str(Recall_pc))
    file.write("\n\nAverage Recall\n\n")
    file.write('{:.4f}'.format(Recall_pc.mean()))
    file.write("\n\nWeighted Recall\n\n")
    if np.ndim(Recall) == 0:  # in case is a single value
         file.write('{:.4f}'.format(Recall))
    else:  # otherwise can be computed the mean
        file.write('{:.4f}'.format(Recall.mean()))
    file.write("\n\nF1 Scores per class\n\n") 
    file.write(str(f1_pc))
    file.write("\n\nAverage F1 Score\n\n") 
    file.write('{:.4f}'.format(f1_pc.mean()))
    file.write("\n\nWeighted F1 Score\n\n") 
    if np.ndim(f1) == 0:  # in case is a single value
         file.write('{:.4f}'.format(f1))
    else:  # otherwise can be computed the mean
        file.write('{:.4f}'.format(f1.mean()))
    file.write("\n\nIoU per class\n\n")
    file.write(str(IoU_pc))
    file.write("\n\nAverage IoU\n\n")
    file.write('{:.4f}'.format(IoU_pc.mean()))
    file.write("\n\nWeighted IoU\n\n")
    if np.ndim(IoU) == 0:  # in case is a single value
         file.write('{:.4f}'.format(IoU))
    else:  # otherwise can be computed the mean
        file.write('{:.4f}'.format(IoU.mean()))
    file.write("\n\nConfusion Matrix\n\n")
    file.write(str(con_mat))
    file.write("\n\nFeature importance\n\n")
    for name, importance in sorted_features:
        file.write(f'{name}: {importance:.4f}\n')
    file.write(f"\n\nVoxel distance value = {suggested_voxel:.4f} \n")
    file.write("\n\nTiming\n\n")

    if load_min > 0:
        file.write(f'Loading time:              {load_min} min {load_sec} sec\n')
    else:
        file.write(f'Loading time:              {load_sec} sec\n')
    
    if train_min > 0:
        file.write(f'Training time:             {train_min} min {train_sec} sec\n')
    else:
        file.write(f'Training time:             {train_sec} sec\n')

    if metr_min > 0:
        file.write(f'Prediction + Metrics time: {metr_min} min {metr_sec} sec\n')
    else:
        file.write(f'Prediction + Metrics time: {metr_sec} sec\n')

    if tot_min > 0:
        file.write(f'Total time:                {tot_min} min {tot_sec} sec\n')
    else:
        file.write(f'Total time:                {tot_sec} sec\n')

    file.close()

    print(f"Model saved on {model_savepath}")
    save_model(model, model_savepath )
    
    if tot_min > 0:
        print(f'---> Total time {tot_min} min {tot_sec} sec')
    else:
        print(f'---> Total time {tot_sec} sec')

if __name__== '__main__':
    main()