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
from tqdm import tqdm 

feat_to_use = []     # Indices of the features to use. If n is the number of features, from 0 to n-1


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
                global feat_to_use
                feat_to_use = [int(t) for t in tokens]


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


def read_data(filepath):
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
        for line_index, line in enumerate(tqdm(lines, desc="Loading points")):
            tokens = line.strip().split(' ')
            if line_index == 0:
                # Store the header (first line) for later use
                tokens.append("pred") # add class feature predicted
                header = " ".join(tokens)
                continue  # Skip header line (consistent with train script)
            #if 'nan' not in tokens: otherwise this "if" delete useful points   
            else : 
                X.append([float(t) for t_index, t in enumerate(tokens)])
    return np.asarray(X, dtype=np.float32), header


def write_classification(X, Y, filename, header):
    ''' Write a classified point cloud
    '''
    with open('{}.txt'.format(filename), 'w') as out:
        X = X.tolist()
        Y_pred = Y.tolist()
        out.write('//{}\n'.format(header))
        for index, x in enumerate(tqdm(X, desc="Writing classified points")):
            # x_as_str = " ".join([str(i) for i in x[0:6]])
            x_as_str = " ".join([str(i) for i in x]) # If I want to write all features, not only the first 6 (x,y,z,r,g,b)
            out.write('{} {}\n'.format(x_as_str, str(Y_pred[index])))


def main(features_filepath, model, test_filepath, output_classify_name, use_gpu):

    t0 = time.time()
    print('Loading features data ...')
    load_features_and_class(features_filepath)         # Load feature indices
    print('Loading model ...')
    model = read_model(model)                          # Load trained model
    print('Loading testing data ...')
    X, header = read_data(test_filepath)               # Load data to classify
    t1 = time.time()

    tot_sec = round(t1 - t0, 2)
    load_min = int(tot_sec // 60)
    load_sec = int(tot_sec % 60)
    if load_min > 0:
        print(f'---> Loading time {load_min} min {load_sec} sec')
    else:
        print(f'---> Loading time {load_sec} sec')

    print('Classifying the dataset ...')
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
    
    print('Saving ...')
    write_classification(X, Y_pred, output_classify_name, header)       # Output classification
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
        print(f'---> Total time {minutes} min {seconds} sec')
    else:
        print(f'---> Total time {seconds} sec')

if __name__== '__main__':
    main()