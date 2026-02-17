import time
import pickle
import argparse
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import f1_score
from tqdm import tqdm 

feat_to_use = []     # Indices of the features to use. If n is the number of features, from 0 to n-1

def load_features(filepath):
    ''' Load the features indices from a .txt file
       
        Attributes:
            filepath (string)   :  Path to the .txt file
    '''
    with open(filepath, 'r') as f:
        for line_index, line in enumerate(f.readlines()):
            tokens = line.strip().split(' ')
            if line_index == 0:
                global feat_to_use
                feat_to_use = [int(t) for t in tokens]

def read_model(filepath):
    ''' Read the Random Forest model from a .pkl file

        Attributes:
            filepath (string)   :   Path to the .pkl file
    '''
    return pickle.load(open(filepath, 'rb'))

def read_data(filepath):
    ''' Read the point cloud to classify from a .txt file

        Attributes:
            filepath (string)   :   Path to the .txt file
        
        Return:
            X (np.array)   :    Point cloud and features
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
                continue  # Skip processing the header line
            #if 'nan' not in tokens: otherwise this "if" delete useful points   
            else: 
                X.append([float(t) for t_index, t in enumerate(tokens)])
    return np.asarray(X, dtype=np.float32), header

def write_classification(X, Y, filename, header):
    ''' Write a classified point cloud

        Attributes:
            X (np.array)        :   Point cloud and features
            Y (np.array)        :   Classes
            filename (string)   :   Output file path
    '''
    with open('{}.txt'.format(filename), 'w') as out:
        X = X.tolist()
        Y = Y.tolist()
        out.write('{}\n'.format(header))
        for index, x in enumerate(tqdm(X, desc="Writing classified points")):
            x_as_str = " ".join([str(i) for i in x])
            out.write('{} {}\n'.format(x_as_str, str(Y[index])))

def main(features_filepath, model, test_filepath, output_classify_name):
    
    start = time.time() 
    print('Loading features data ...')
    load_features(features_filepath)                   # Load feature indices
    print('Loading model ...')
    model = read_model(model)                          # Load trained model
    print('Loading testing data ...')
    X, header = read_data(test_filepath)                         # Load data to classify
    print(f"Input shape {X.shape}")
    print(f"Header: {header} \n") 

    print ('Classifying the dataset ...')
    Y_pred = model.predict(X[:, feat_to_use])               # Classify the data
    print(f"Output shape {Y_pred.shape}")
    print ('Saving ...')
    write_classification(X, Y_pred, output_classify_name, header)       # Output classification
    end = time.time()
    tot_sec = round(end - start, 2)
    minutes = int(tot_sec // 60)
    seconds = int(tot_sec % 60)
    print(f"Total classification time: {minutes} min {seconds} sec")

if __name__== '__main__':
    main()