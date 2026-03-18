import time
import pickle
import argparse
import numpy as np
import struct
try:
    import cupy as cp
    from cuml.ensemble import RandomForestClassifier as cuRF
    GPU_AVAILABLE = True
except Exception:
    cp = None
    cuRF = None
    GPU_AVAILABLE = False
from sklearn.ensemble import RandomForestClassifier
import laspy
import re


# ─────────────────────────────────────────────────────────────────────────────
#  Raw VLR reader — reads Extra Bytes dim names directly from binary,
#  bypassing laspy's broken UTF-8 parsing of non-ASCII VLR names.
# ─────────────────────────────────────────────────────────────────────────────

def _read_vlr_extra_names(filepath):
    """
    Returns an ordered list of (name, data_type) for every Extra Bytes VLR entry.
    Names are read as raw bytes and decoded as latin-1 (never fails).
    Returns [] if no Extra Bytes VLR is found.
    """
    result = []
    with open(filepath, 'rb') as f:
        f.seek(94);  hdr_size, = struct.unpack('<H', f.read(2))
        f.seek(100); num_vlrs, = struct.unpack('<I', f.read(4))

        f.seek(hdr_size)
        for _ in range(num_vlrs):
            hdr = f.read(54)
            if len(hdr) < 54:
                break
            user_id   = hdr[2:18].rstrip(b'\x00').decode('latin-1')
            record_id = struct.unpack_from('<H', hdr, 18)[0]
            rec_len   = struct.unpack_from('<H', hdr, 20)[0]
            if user_id == 'LASF_Spec' and record_id == 4:
                data = f.read(rec_len)
                for i in range(rec_len // 192):
                    rec      = data[i*192:(i+1)*192]
                    dtype    = rec[2]
                    # name field: bytes 4-35, null-padded
                    raw_name = rec[4:36].rstrip(b'\x00')
                    name     = raw_name.decode('latin-1').strip()
                    if name:
                        result.append((name, dtype))
                return result
            else:
                f.seek(rec_len, 1)
    return result


# ─────────────────────────────────────────────────────────────────────────────
#  Data I/O
# ─────────────────────────────────────────────────────────────────────────────

def get_feature_indices(full_header, selected_features):
    indices = []
    for feat in selected_features:
        if feat in full_header:
            indices.append(full_header.index(feat))
        else:
            print(f"Warning: feature '{feat}' not found in header")
    return indices

def read_model(filepath):
    try:
        return pickle.load(open(filepath, 'rb'))
    except Exception as e:
        if 'cuml' in str(e) or 'cuml' in getattr(e, 'name', ''):
            raise RuntimeError(
                'Failed to unpickle model — cuML objects require RAPIDS/cuML to be installed.'
            ) from e
        raise

def read_las_data(filepath):
    """
    Read LAS file and return feature matrix + header.

    Strategy:
      1. Read raw VLR names (always correct, even with non-UTF8 encoding).
      2. Read point data via laspy (correct values regardless of name issues).
      3. Map laspy's unnamed/misnamed dims to the correct VLR names positionally.
      4. POINT_ID is included in the header so it is preserved in the output.
    """
    # Step 1 — get authoritative names from raw VLR
    vlr_names = _read_vlr_extra_names(filepath)   # [(name, dtype), ...]
    vlr_name_list = [n for n, _ in vlr_names]
    print(f"  VLR extra dims ({len(vlr_name_list)}): {vlr_name_list}")

    # Step 2 — read via laspy
    las = laspy.read(filepath)

    # Standard dims always present
    STANDARD = {
        'X', 'Y', 'Z', 'x', 'y', 'z',
        'intensity', 'return_number', 'number_of_returns',
        'scan_direction_flag', 'edge_of_flight_line',
        'classification', 'scan_angle_rank', 'scan_angle',
        'user_data', 'point_source_id', 'gps_time',
        'red', 'green', 'blue',
        'scanner_channel', 'scan_channel', 'classification_flags',
        'synthetic', 'key_point', 'withheld', 'overlap',
        'normal_x', 'normal_y', 'normal_z',
    }

    # Step 3 — collect extra dims from laspy in their natural order
    laspy_extra = [
        d for d in las.point_format.dimension_names
        if d.lower() not in {s.lower() for s in STANDARD}
    ]
    print(f"  laspy extra dims ({len(laspy_extra)}): {laspy_extra}")

    # Build final column list using VLR names where possible (positional match)
    columns = []
    header  = []

    # Standard coordinate dims first
    for dim, col in [('x', las.x), ('y', las.y), ('z', las.z)]:
        columns.append(np.array(col, dtype=np.float64))
        header.append(dim)

    # Extra dims: align laspy order with VLR name list positionally
    n_match = min(len(laspy_extra), len(vlr_name_list))
    for i, laspy_dim in enumerate(laspy_extra):
        # Use VLR name if available, else fall back to laspy's name
        col_name = vlr_name_list[i] if i < len(vlr_name_list) else laspy_dim
        try:
            col = np.array(getattr(las, laspy_dim), dtype=np.float64)
            columns.append(col)
            header.append(col_name)
        except Exception as e:
            print(f"  Skipping dim '{laspy_dim}' -> '{col_name}': {e}")

    # Append 'prediction' placeholder slot
    header.append('prediction')

    X = np.column_stack(columns)
    print(f"  Final header ({len(header)}): {header}")
    return np.asarray(X, dtype=np.float32), header


def write_classification_las(X, Y, filename, header):
    """
    Write the classified point cloud as a LAS file.
    All input dims are preserved; 'prediction' is added as uint8 extra dim.
    POINT_ID is always written as uint32 — read from input data if present,
    otherwise generated as sequential indices.
    """
    X   = np.array(X)
    Y   = np.array(Y).flatten()

    if isinstance(header, str):
        header = header.strip().lstrip('/').strip().split()

    # LAS built-in dims — handled natively, not as extra bytes
    LAS_BUILTIN = {
        'x', 'y', 'z', 'red', 'r', 'green', 'g', 'blue', 'b',
        'intensity', 'classification',
        'return_number', 'number_of_returns',
        'scan_direction_flag', 'edge_of_flight_line',
        'synthetic', 'key_point', 'withheld', 'overlap',
        'scan_angle_rank', 'scan_angle', 'user_data', 'point_source_id',
        'gps_time', 'scanner_channel', 'scan_channel', 'classification_flags',
        'normal_x', 'normal_y', 'normal_z',
    }

    n_points = len(X)

    # Build LAS header
    las_header = laspy.LasHeader(point_format=7, version="1.4")
    # Find X/Y/Z columns for offset
    xi = next((i for i, h in enumerate(header) if h.lower() == 'x'), None)
    yi = next((i for i, h in enumerate(header) if h.lower() == 'y'), None)
    zi = next((i for i, h in enumerate(header) if h.lower() == 'z'), None)
    if xi is not None and yi is not None and zi is not None:
        las_header.offsets = np.array([X[:, xi].min(), X[:, yi].min(), X[:, zi].min()])
    else:
        las_header.offsets = np.zeros(3)
    las_header.scales = np.array([0.0001, 0.0001, 0.0001])

    # Register extra dims (everything that is not a LAS builtin)
    extra_dim_defs = []
    for col_name in header:
        cl = col_name.lower()
        if cl in LAS_BUILTIN or cl == 'prediction':
            continue
        if cl == 'point_id' or cl == 'pointid':
            # Always uint32
            extra_dim_defs.append(laspy.ExtraBytesParams(name=col_name, type=np.uint32))
        else:
            extra_dim_defs.append(laspy.ExtraBytesParams(name=col_name, type=np.float32))

    # Add prediction as uint8
    extra_dim_defs.append(laspy.ExtraBytesParams(name='prediction', type=np.uint8))

    las_header.add_extra_dims(extra_dim_defs)
    las = laspy.LasData(header=las_header)

    # Write standard dims
    if xi is not None: las.x = X[:, xi].astype(np.float64)
    if yi is not None: las.y = X[:, yi].astype(np.float64)
    if zi is not None: las.z = X[:, zi].astype(np.float64)

    # Find POINT_ID column; if missing, use sequential indices
    pid_col = next(
        (i for i, h in enumerate(header) if h.lower() in ('point_id', 'pointid')),
        None
    )
    if pid_col is not None:
        point_ids = X[:, pid_col].astype(np.uint32)
    else:
        print("  POINT_ID not found in data — using sequential indices.")
        point_ids = np.arange(n_points, dtype=np.uint32)

    # Write extra dims
    for col_name in header:
        cl = col_name.lower()
        if cl in LAS_BUILTIN:
            continue
        col_idx = header.index(col_name)
        if cl in ('point_id', 'pointid'):
            las[col_name] = point_ids
        elif cl == 'prediction':
            las['prediction'] = Y.astype(np.uint8)
        else:
            las[col_name] = X[:, col_idx].astype(np.float32)

    las.write(filename)
    print(f"  Written {n_points} points → {filename}")


# ─────────────────────────────────────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--selected_features', nargs="+", required=True)
    parser.add_argument('--model',             required=True)
    parser.add_argument('--test_filepath',     required=True)
    parser.add_argument('--output_classify_name', required=True)
    parser.add_argument('--use_gpu',           action='store_true')
    args = parser.parse_args()

    t0 = time.time()
    print('\nLoading model ...')
    model = read_model(args.model)

    print('Loading testing data ...')
    X, header = read_las_data(args.test_filepath)

    feat_to_use = get_feature_indices(header, args.selected_features)

    t1 = time.time()
    print(f'---> Loading time {int((t1-t0)//60)} min {int((t1-t0)%60)} sec')
    print(f"\nTesting samples: {len(X)}")
    print(f"Using features: {args.selected_features}")

    print('\nClassifying ...')
    if args.use_gpu and GPU_AVAILABLE and cuRF is not None and isinstance(model, cuRF):
        Y_pred = cp.asnumpy(model.predict(cp.asarray(X[:, feat_to_use])))
    else:
        if args.use_gpu and not GPU_AVAILABLE:
            print('Warning: --use_gpu requested but cuML not available; using CPU.')
        Y_pred = model.predict(X[:, feat_to_use])

    t2 = time.time()
    print(f'---> Classification time {int((t2-t1)//60)} min {int((t2-t1)%60)} sec')

    print('\nSaving ...')
    write_classification_las(X, Y_pred, args.output_classify_name, header)

    t3 = time.time()
    print(f'---> Saving time {int((t3-t2)//60)} min {int((t3-t2)%60)} sec')
    print(f'\nTotal time {int((t3-t0)//60)} min {int((t3-t0)%60)} sec\n')


if __name__ == '__main__':
    main()