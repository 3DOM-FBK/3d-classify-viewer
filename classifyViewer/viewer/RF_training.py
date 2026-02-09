import time
import pickle
import argparse
import itertools
import os
import sys
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, accuracy_score, f1_score, confusion_matrix, jaccard_score
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
                # Store the header (first line) for later use
                header = tokens
                continue  # Skip processing the header line
            if 'nan' not in tokens and not tokens[0].startswith('//') and len(tokens) > class_index:   
                X.append([float(t) for t_index, t in enumerate(tokens) if t_index != class_index])
                Y.append(int(float(tokens[class_index])))
    return np.asarray(X, dtype=np.float32), np.asarray(Y, dtype=np.float32), header


def train_model(X_train, Y_train, n_estimators, max_depth, n_jobs):
    ''' Train the Random Forest model with the specified parameters and return it.

        Attributes:
            X_train         :   numpy array with training features
            Y_train         :   numpy array with training classes
            n_estimators    :   number of trees in the forest
            max_depth       :   maximum depth of each tree
            n_jobs          :   number of threads used to train the model
        
        Return:
            model           :   trained model
    '''
    model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=0, oob_score=True, n_jobs=n_jobs)
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

def main(features_filepath, training_filepath, eval_filepath, n_jobs, n_estimators, max_depth, output_training_name, model_savepath):
    
    # Parameters to test
    # n_estimators = [50, 100, 150, 200]
    # max_depths = [None]
    n_estimators = [int(x) for x in n_estimators.split('-')]
    max_depths = int(max_depth) if max_depth != 'None' else [None]

    start = time.time() 
    print("Loading features data...")
    load_features_and_class(features_filepath)

    print("Loading training data...")
    X_train, Y_train, header = read_data(training_filepath)
    
    print("\nLoading validation data...")
    X_test, Y_test, _ = read_data(eval_filepath)

    print('\nStatistics:\n- Training samples: {}\n- Testing samples: {}\n- Using features with indices: {}'.format(len(Y_train), len(Y_test), feat_to_use))

    # Use the header for feature importance visualization
    if header:
        # Map the feature indices in feat_to_use to the corresponding header names
        headers = [header[i] for i in feat_to_use]  # Select only the headers corresponding to feat_to_use
    else:
        headers = ['Feature_{}'.format(i) for i in feat_to_use]  # Fallback if no header is present

    ''' ***************************************** TRAINING ************************************** '''

    print(f'\nTraining the model n_estimators={n_estimators}, max_depth={max_depths} and n_jobs={n_jobs} ...')  
    start = time.time()                                  
    for ne, md in list(itertools.product(n_estimators, max_depths)):    # Train the model with different parameters and pick the one having the maximum f1-score on the test-set
        model = train_model(X_train, Y_train, ne, md, n_jobs)      # Train the model
        
        Y_test_pred = model.predict(X_test[:, feat_to_use])             # Test the model, using only the specified features
        
     # Compute metrics 
        Precision_pc = precision_score(Y_test, Y_test_pred, average=None)
        Precision = precision_score(Y_test, Y_test_pred, average='weighted')
        Recall_pc = recall_score(Y_test, Y_test_pred, average=None) 
        Recall = recall_score(Y_test, Y_test_pred, average='weighted') 
        f1_pc = f1_score(Y_test, Y_test_pred, average=None)
        f1 = f1_score(Y_test, Y_test_pred, average='weighted')
        IoU_pc= jaccard_score(Y_test, Y_test_pred, average=None)
        IoU = jaccard_score(Y_test, Y_test_pred, average='weighted')
        con_mat = confusion_matrix(Y_test, Y_test_pred)         
        acc = accuracy_score(Y_test, Y_test_pred)                       # Compute metrics and update best model
    
                
    end = time.time()

    # Sort features by importance in descending order
    sorted_features = sorted(zip(headers, model.feature_importances_), key=lambda x: x[1], reverse=True)
    
    # Print results
    #print('---> Best parameters: ne: {}, md: {}'.format(best_conf['ne'], best_conf['md']))
    print('---> Confusion matrix:\n{}'.format(confusion_matrix(Y_test, Y_test_pred)))
    print('---> Feature importance:')
    for header, importance in sorted_features:
        print(f'{header}: {importance:.4f}')
    tot_sec = round(end - start, 2)
    minutes = int(tot_sec // 60)
    seconds = int(tot_sec % 60)
    print(f"---> Training time: {minutes} min {seconds} sec")
    print('Check the complete report in the folder')
    ''' ******************************************************************************************** '''
    #Print report with results
    report_fname = os.path.dirname(features_filepath) + "/report_RF.txt"

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
    file.write("\n\nTime for training\n\n")
    file.write(f'{minutes} min {seconds} sec') 
    file.close() 

# Save model and write the best classification of the test set
    Y_test_pred = model.predict(X_test[:, feat_to_use])
    write_classification(X_test, Y_test_pred, output_training_name, header)
    print(f"Model saved on {model_savepath}")
    save_model(model, model_savepath )

     
    end = time.time()
    tot_sec = round(end - start, 2)
    minutes = int(tot_sec // 60)
    seconds = int(tot_sec % 60)

    print(f'\nTotal training time: {minutes} min {seconds} sec')

if __name__== '__main__':
    main()