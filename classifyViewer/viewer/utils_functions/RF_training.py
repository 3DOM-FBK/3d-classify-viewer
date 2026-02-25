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
from tqdm import tqdm 

''' Todo:
    1) Add the binary case of training a model with a single class vs all the others. 
    2) Automatic combination of features
'''

feat_to_use = []           # Indices of the features to use. If n is the number of features, from 0 to n-1. Apply both to train and test sets
class_index = -1           # Index of the class label. Apply both to train and test sets
debug = True

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
                global feat_to_use
                feat_to_use = [int(t) for t in tokens]
            elif line_index == 1:
                global class_index
                class_index= int(tokens[0])


def read_data(filepath):
    ''' Read a labelled point cloud.

        Attributes:
            filepath    :   path to the .txt file containing the point cloud
        
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
        for line_index, line in enumerate(tqdm(lines, desc="Loading points")):
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
        Xg = cp.asarray(X_train[:, feat_to_use])
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
        model.fit(X_train[:, feat_to_use], Y_train)         # Use only the specified features.
        return model


def write_classification(X_test, Y_test_pred, filename, header):
    ''' Write the test set with the predicted labels 
    '''
    with open('{}.txt'.format(filename), 'w') as out:
        X_test = X_test.tolist()
        Y_test_pred = Y_test_pred.tolist()
        out.write('//{}\n'.format(header))
        for index, x_t in enumerate(tqdm(X_test, desc="Writing classified points")):
            x_t_as_str = " ".join([str(x) for x in x_t[0:6]])
            out.write('{} {}\n'.format(x_t_as_str, str(Y_test_pred[index])))


def save_model(model, filename):
    ''' Save the trained machine learning model

        Attribures:
            model       :   model to save
            filename    :   name of the file where the model is saved
    '''
    with open(filename, 'wb') as out:
        pickle.dump(model, out, pickle.HIGHEST_PROTOCOL)

    
def main(features_filepath, training_filepath, val_filepath, n_jobs, n_estimators, max_depth, min_samples_split, max_features, use_gpu, output_training_name, model_savepath):

    # PARAMETERS    
    n_estimators = n_estimators if n_estimators else 200
    max_depths = max_depth if max_depth else 15
    min_samples_split=min_samples_split if hasattr(min_samples_split, 'value') else 20
    max_features=max_features if hasattr(max_features, 'value') else 'sqrt'
    
    total_start = time.time()
    t0 = time.time()
    print("Loading features data...")
    load_features_and_class(features_filepath)

    print("Loading training data...")
    X_train, Y_train, header = read_data(training_filepath)

    print("\nLoading validation data...")
    X_test, Y_test, _ = read_data(val_filepath)

    t1 = time.time()
    tot_sec = round(t1 - t0, 2)
    load_min = int(tot_sec // 60)
    load_sec = int(tot_sec % 60)
    if load_min > 0:
        print(f'---> Loading time {load_min} min {load_sec} sec')
    else:
        print(f'---> Loading time {load_sec} sec')
    print('\nStatistics:\n- Training samples: {}\n- Testing samples: {}\n- Using features with indices: {}'.format(len(Y_train), len(Y_test), feat_to_use))

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
    
    model = train_model(X_train, Y_train, n_jobs=n_jobs, use_gpu=use_gpu,
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
    
    print('\nEvaluating on validation set...')
    # Predict depending on whether we used cuML (GPU) or scikit-learn (CPU)
    if use_gpu and GPU_AVAILABLE and cuRF is not None:
        Y_test_pred = cp.asnumpy(model.predict(cp.asarray(X_test[:, feat_to_use])))
    else:
        Y_test_pred = model.predict(X_test[:, feat_to_use])             # Test the model, using only the specified features

    # Compute metrics
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
        print(f'---> Prediction + metrics time: {metr_min} min {metr_sec} sec')
    else:
        print(f'---> Prediction + metrics time {metr_sec} sec')
    


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
    #print('---> Best parameters: ne: {}, md: {}'.format(best_conf['ne'], best_conf['md']))
    print('---> Confusion matrix:\n{}'.format(confusion_matrix(Y_test, Y_test_pred)))
    print('---> Feature importance:')
    for header, importance in sorted_features:
        print(f'{header}: {importance:.4f}')

    tot_sec = round(t4 - total_start, 2)
    tot_min = int(tot_sec // 60)
    tot_sec = int(tot_sec % 60)
    if tot_min > 0:
        print(f'---> Total time {tot_min} min {tot_sec} sec')
    else:
        print(f'---> Total time {tot_sec} sec')

    print('Check the complete report in the folder')
    ''' ******************************************************************************************** '''
    #Print report with results
    report_fname = os.path.dirname(output_training_name) + "/report_RF.txt"

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
    for header, importance in sorted_features:
        file.write(f'{header}: {importance:.4f}\n')
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
        file.write(f'Prediction + Metrics time:              {metr_min} min {metr_sec} sec\n')
    else:
        file.write(f'Prediction + Metrics time:              {metr_sec} sec\n')

    if tot_min > 0:
        file.write(f'Total time:                {tot_min} min {tot_sec} sec\n')
    else:
        file.write(f'Total time:                {tot_sec} sec\n')

    file.close()

# Save model and write the best classification of the test set
    if use_gpu and GPU_AVAILABLE and cuRF is not None:
        Y_test_pred = cp.asnumpy(model.predict(cp.asarray(X_test[:, feat_to_use])))
    else:
        Y_test_pred = model.predict(X_test[:, feat_to_use])
    write_classification(X_test, Y_test_pred, output_training_name, header)
    print(f"Model saved on {model_savepath}")
    save_model(model, model_savepath )

if __name__== '__main__':
    main()