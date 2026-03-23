import laspy
import sys
import os

def fix_las(path):
    print(f"Repairing {path}...")
    try:
        with laspy.open(path) as f:
            las = f.read()
            # laspy automatically updates the header min/max when reading/writing
            # or we can explicitly set them if needed.
            # But usually just reading and writing back with laspy fixes the AABB.
            las.header.update_all() # This is a legacy thing maybe but let's check
            las.write(path)
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        fix_las(sys.argv[1])
