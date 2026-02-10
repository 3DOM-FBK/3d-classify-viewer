import open3d as o3d
import trimesh
import numpy as np
import torch
from PIL import Image
import argparse
import time
import io
from pygltflib import GLTF2
from pathlib import Path

def extract_textures_from_glb(glb_path):
    """Estrae le texture embeded dal GLB come lista di PIL.Image"""
    
    gltf = GLTF2().load(glb_path)
    textures = []

    bin_blob = gltf.binary_blob()
    if bin_blob is None:
        print("❌ Nessun blob binario trovato nel GLB")
        return []

    for i, img in enumerate(gltf.images):
        buffer_view = gltf.bufferViews[img.bufferView]
        start = buffer_view.byteOffset or 0
        end = start + buffer_view.byteLength
        img_bytes = bin_blob[start:end]

        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
        # print(f"   ➜ Texture [{i}] size: {pil_img.size}, mode: {pil_img.mode}")  # 👈 print debug info
        # pil_img.show()  # 👉 se vuoi vederle aprirsi graficamente, decommenta questa riga
        textures.append(pil_img)

    print(f"[Extract {len(textures)} textures from GLB]")
    return textures



def main(mesh_path, num_points=5000000, sampling_method="uniform"):
   
    print(f"[Loading mesh  from {mesh_path}]")
    start_time = time.time()

    # Carica come Scene, per non perdere i materiali
    scene = trimesh.load(mesh_path, force='scene')

    # estrazione texture
    textures = extract_textures_from_glb(mesh_path)
    if len(textures) == 0:
        print("--- No textures found, point cloud will be gray")
        textures = [Image.new("RGBA", (1,1), (128,128,128,255))]

    all_points = []
    all_colors = []

    geom_items = list(scene.geometry.items())
    print(f"[Iterate {len(geom_items)} submeshes]")

    for i, (name, geom) in enumerate(geom_items):
        print(f"--- Submesh {i}: {name}, faces={len(geom.faces)}")

        # Converti in Open3D per sampling
        mesh_o3d = o3d.geometry.TriangleMesh(
            o3d.utility.Vector3dVector(geom.vertices),
            o3d.utility.Vector3iVector(geom.faces)
        )
        if sampling_method == "uniform":
            pcd = mesh_o3d.sample_points_uniformly(number_of_points=num_points // len(geom_items))
        elif sampling_method == "poisson":
            pcd = mesh_o3d.sample_points_poisson_disk(number_of_points=num_points // len(geom_items))
        points = np.asarray(pcd.points)

        # Trova triangoli più vicini
        closest_points, distances, triangle_id = geom.nearest.on_surface(points)

        # UV per la submesh
        if hasattr(geom.visual, 'uv') and geom.visual.uv is not None:
            face_uvs = geom.visual.uv[geom.faces[triangle_id]]
        else:
            face_uvs = np.zeros((len(triangle_id),3,2), dtype=np.float32)

        bary_coords = trimesh.triangles.points_to_barycentric(
            geom.triangles[triangle_id],
            closest_points
        )

        # Texture corretta (una per submesh)
        mat_idx = i if i < len(textures) else 0
        tex_img = textures[mat_idx]
        # print(f"   Using texture {mat_idx} for submesh {i}: size {tex_img.size}, mode {tex_img.mode}")
        tex_np = np.array(tex_img)
        # print(f"   🔍 Texture array shape: {tex_np.shape}")

        # Interpolazione UV → colore
        uvs_interp = (face_uvs * bary_coords[:,:,None]).sum(axis=1)
        uvs_interp = np.clip(uvs_interp, 0, 1)
        px = (uvs_interp[:,0] * (tex_img.width - 1)).astype(int)
        py = ((1 - uvs_interp[:,1]) * (tex_img.height - 1)).astype(int)
        colors = tex_np[py, px, :3] / 255.0

        all_points.append(points)
        all_colors.append(colors)

    # === Merge di tutti i punti colorati
    print("[Merging submeshes into final point cloud]")
    points_final = np.vstack(all_points)
    colors_final = np.vstack(all_colors)

    # Costruisci point cloud Open3D
    pcd_final = o3d.geometry.PointCloud()
    pcd_final.points = o3d.utility.Vector3dVector(points_final)
    pcd_final.colors = o3d.utility.Vector3dVector(colors_final)

    # Save
    out_file = mesh_path.replace(".glb","_pc.ply")
    o3d.io.write_point_cloud(out_file, pcd_final)

    end_time = time.time()
    tot_sec = round(end_time - start_time, 2)
    minutes = int(tot_sec // 60)
    seconds = int(tot_sec % 60)
    print(f"Point cloud saved as: {out_file}, with {len(points_final)} points")
    print(f"Processing time: {minutes} min {seconds} sec")


if __name__ == "__main__":
    main()
