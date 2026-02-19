# TODO: remove these lines
# import open3d as o3d
# import trimesh
# import numpy as np
# import torch
# from PIL import Image
# import argparse
# import time
# import io
# from pygltflib import GLTF2
# from pathlib import Path
# import laspy
# from laspy import ExtraBytesParams

# def extract_textures_from_glb(glb_path):
#     """Estrae le texture embeded dal GLB come lista di PIL.Image"""
    
#     gltf = GLTF2().load(glb_path)
#     textures = []

#     bin_blob = gltf.binary_blob()
#     if bin_blob is None:
#         print("❌ Nessun blob binario trovato nel GLB")
#         return []

#     for i, img in enumerate(gltf.images):
#         buffer_view = gltf.bufferViews[img.bufferView]
#         start = buffer_view.byteOffset or 0
#         end = start + buffer_view.byteLength
#         img_bytes = bin_blob[start:end]

#         pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
#         # print(f"   ➜ Texture [{i}] size: {pil_img.size}, mode: {pil_img.mode}")  # 👈 print debug info
#         # pil_img.show()  # 👉 se vuoi vederle aprirsi graficamente, decommenta questa riga
#         textures.append(pil_img)

#     print(f"[Extract {len(textures)} textures from GLB]")
#     return textures



# def main(mesh_path, num_points=5000000, sampling_method="uniform"):
   
#     print(f"[Loading mesh  from {mesh_path}]")
#     start_time = time.time()

#     # Carica come Scene, per non perdere i materiali
#     scene = trimesh.load(mesh_path, force='scene')

#     # estrazione texture
#     textures = extract_textures_from_glb(mesh_path)
#     if len(textures) == 0:
#         print("--- No textures found, point cloud will be gray")
#         textures = [Image.new("RGBA", (1,1), (128,128,128,255))]

#     all_points = []
#     all_colors = []

#     geom_items = list(scene.geometry.items())
#     print(f"[Iterate {len(geom_items)} submeshes]")

#     for i, (name, geom) in enumerate(geom_items):
#         print(f"--- Submesh {i}: {name}, faces={len(geom.faces)}")

#         # Converti in Open3D per sampling
#         mesh_o3d = o3d.geometry.TriangleMesh(
#             o3d.utility.Vector3dVector(geom.vertices),
#             o3d.utility.Vector3iVector(geom.faces)
#         )
#         if sampling_method == "uniform":
#             pcd = mesh_o3d.sample_points_uniformly(number_of_points=num_points // len(geom_items))
#         elif sampling_method == "poisson":
#             pcd = mesh_o3d.sample_points_poisson_disk(number_of_points=num_points // len(geom_items))
#         points = np.asarray(pcd.points)

#         # Trova triangoli più vicini
#         closest_points, distances, triangle_id = geom.nearest.on_surface(points)

#         # UV per la submesh
#         if hasattr(geom.visual, 'uv') and geom.visual.uv is not None:
#             face_uvs = geom.visual.uv[geom.faces[triangle_id]]
#         else:
#             face_uvs = np.zeros((len(triangle_id),3,2), dtype=np.float32)

#         bary_coords = trimesh.triangles.points_to_barycentric(
#             geom.triangles[triangle_id],
#             closest_points
#         )

#         # Texture corretta (una per submesh)
#         mat_idx = i if i < len(textures) else 0
#         tex_img = textures[mat_idx]
#         # print(f"   Using texture {mat_idx} for submesh {i}: size {tex_img.size}, mode {tex_img.mode}")
#         tex_np = np.array(tex_img)
#         # print(f"   🔍 Texture array shape: {tex_np.shape}")

#         # Interpolazione UV → colore
#         uvs_interp = (face_uvs * bary_coords[:,:,None]).sum(axis=1)
#         uvs_interp = np.clip(uvs_interp, 0, 1)
#         px = (uvs_interp[:,0] * (tex_img.width - 1)).astype(int)
#         py = ((1 - uvs_interp[:,1]) * (tex_img.height - 1)).astype(int)
#         colors = tex_np[py, px, :3] / 255.0

#         all_points.append(points)
#         all_colors.append(colors)

#     # === Merge di tutti i punti colorati
#     print("[Merging submeshes into final point cloud]")
#     points_final = np.vstack(all_points)
#     colors_final = np.vstack(all_colors)

#     # Costruisci point cloud Open3D
#     pcd_final = o3d.geometry.PointCloud()
#     pcd_final.points = o3d.utility.Vector3dVector(points_final)
#     pcd_final.colors = o3d.utility.Vector3dVector(colors_final)

#     # === Calcolo normali ===
#     print("[Computing normals]")
#     pcd_final.estimate_normals(
#         search_param=o3d.geometry.KDTreeSearchParamHybrid(
#             radius=0.02,
#             max_nn=30
#         )
#     )
#     pcd_final.orient_normals_consistent_tangent_plane(30)

#     normals = np.asarray(pcd_final.normals)

#     # Save
#     # print("[Saving PLY point cloud]")
#     # out_file = mesh_path.replace(".glb","_pc.ply")
#     # o3d.io.write_point_cloud(out_file, pcd_final)

#     print("[Saving LAS point cloud]")
#     # Crea header LAS
#     header = laspy.LasHeader(point_format=3, version="1.2")
#     # Extra dimensions per normali
#     header.add_extra_dim(ExtraBytesParams(name="normal_x", type=np.float32))
#     header.add_extra_dim(ExtraBytesParams(name="normal_y", type=np.float32))
#     header.add_extra_dim(ExtraBytesParams(name="normal_z", type=np.float32))
#     las = laspy.LasData(header)

#     # Coordinate
#     las.x = points_final[:, 0]
#     las.y = points_final[:, 1]
#     las.z = points_final[:, 2]

#     # Colori (LAS usa uint16 [0–65535])
#     colors_uint16 = (colors_final * 65535).astype(np.uint16)
#     las.red   = colors_uint16[:, 0]
#     las.green = colors_uint16[:, 1]
#     las.blue  = colors_uint16[:, 2]

#     # Normali
#     las.normal_x = normals[:, 0].astype(np.float32)
#     las.normal_y = normals[:, 1].astype(np.float32)
#     las.normal_z = normals[:, 2].astype(np.float32)

#     # Scrittura file
#     out_file = mesh_path.replace(".glb", "_pc.las")
#     las.write(out_file)


#     end_time = time.time()
#     tot_sec = round(end_time - start_time, 2)
#     minutes = int(tot_sec // 60)
#     seconds = int(tot_sec % 60)
#     print(f"Point cloud saved as: {out_file}, with {len(points_final)} points")
#     if minutes > 0:
#         print(f'Processing time: {minutes} min {seconds} sec')
#     else:
#         print(f'Processing time: {seconds} sec')
    


# if __name__ == "__main__":
#     main()

import open3d as o3d
import trimesh
import numpy as np
from PIL import Image
import time
import io
from pygltflib import GLTF2
import laspy
from laspy import ExtraBytesParams
from concurrent.futures import ThreadPoolExecutor


def extract_textures_from_glb(glb_path):
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
        textures.append(pil_img)

    print(f"[Extract {len(textures)} textures from GLB]")
    return textures


def process_submesh(args):
    i, name, geom, points_per_mesh, sampling_method, textures = args

    print(f"--- Submesh {i}: {name}, faces={len(geom.faces)}")

    # Sampling
    t = time.time()
    mesh_o3d = o3d.geometry.TriangleMesh(
        o3d.utility.Vector3dVector(geom.vertices),
        o3d.utility.Vector3iVector(geom.faces)
    )
    if sampling_method == "uniform":
        pcd = mesh_o3d.sample_points_uniformly(number_of_points=points_per_mesh)
    elif sampling_method == "poisson":
        pcd = mesh_o3d.sample_points_poisson_disk(number_of_points=points_per_mesh)
    points = np.asarray(pcd.points)
    print(f"  [{i}] Sampling: {time.time()-t:.1f}s  ({len(points)} points)")

    # Nearest triangle via KDTree sui centroidi (molto più veloce di trimesh BVH)
    t = time.time()
    triangle_centroids = np.mean(geom.vertices[geom.faces], axis=1)
    centroid_pcd = o3d.geometry.PointCloud()
    centroid_pcd.points = o3d.utility.Vector3dVector(triangle_centroids)
    kdtree = o3d.geometry.KDTreeFlann(centroid_pcd)
    triangle_id = np.array([kdtree.search_knn_vector_3d(p, 1)[1][0] for p in points])
    closest_points = triangle_centroids[triangle_id]
    print(f"  [{i}] Nearest triangle (KDTree): {time.time()-t:.1f}s")

    # UV + barycentric
    t = time.time()
    if hasattr(geom.visual, 'uv') and geom.visual.uv is not None:
        face_uvs = geom.visual.uv[geom.faces[triangle_id]]
    else:
        face_uvs = np.zeros((len(triangle_id), 3, 2), dtype=np.float32)

    bary_coords = trimesh.triangles.points_to_barycentric(
        geom.triangles[triangle_id],
        closest_points
    )
    print(f"  [{i}] Barycentric + UV: {time.time()-t:.1f}s")

    # Color interpolation
    t = time.time()
    mat_idx = i if i < len(textures) else 0
    tex_img = textures[mat_idx]
    tex_np = np.array(tex_img)

    uvs_interp = (face_uvs * bary_coords[:, :, None]).sum(axis=1)
    uvs_interp = np.clip(uvs_interp, 0, 1)
    px = (uvs_interp[:, 0] * (tex_img.width - 1)).astype(int)
    py = ((1 - uvs_interp[:, 1]) * (tex_img.height - 1)).astype(int)
    colors = tex_np[py, px, :3] / 255.0
    print(f"  [{i}] Color interpolation: {time.time()-t:.1f}s")

    return points, colors


def main(mesh_path, num_points=5000000, sampling_method="uniform"):

    print(f"[Loading mesh from {mesh_path}]")
    start_time = time.time()

    t = time.time()
    scene = trimesh.load(mesh_path, force='scene')
    print(f"  Load mesh: {time.time()-t:.1f}s")

    t = time.time()
    textures = extract_textures_from_glb(mesh_path)
    print(f"  Extract textures: {time.time()-t:.1f}s")

    if len(textures) == 0:
        print("--- No textures found, point cloud will be gray")
        textures = [Image.new("RGBA", (1, 1), (128, 128, 128, 255))]

    geom_items = list(scene.geometry.items())
    print(f"[Iterate {len(geom_items)} submeshes in parallel]")
    points_per_mesh = num_points // len(geom_items)

    args_list = [
        (i, name, geom, points_per_mesh, sampling_method, textures)
        for i, (name, geom) in enumerate(geom_items)
    ]

    # Processa submesh in parallelo
    with ThreadPoolExecutor(max_workers=len(geom_items)) as executor:
        results = list(executor.map(process_submesh, args_list))

    all_points = [r[0] for r in results]
    all_colors = [r[1] for r in results]

    print("[Merging submeshes into final point cloud]")
    points_final = np.vstack(all_points)
    colors_final = np.vstack(all_colors)

    pcd_final = o3d.geometry.PointCloud()
    pcd_final.points = o3d.utility.Vector3dVector(points_final)
    pcd_final.colors = o3d.utility.Vector3dVector(colors_final)

    # Normali veloci — senza orient_normals_consistent_tangent_plane
    t = time.time()
    print("[Computing normals]")
    pcd_final.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.02, max_nn=30)
    )
    pcd_final.orient_normals_towards_camera_location()
    normals = np.asarray(pcd_final.normals)
    print(f"  Normals: {time.time()-t:.1f}s")

    t = time.time()
    print("[Saving LAS point cloud]")
    header = laspy.LasHeader(point_format=3, version="1.2")
    header.add_extra_dim(ExtraBytesParams(name="normal_x", type=np.float32))
    header.add_extra_dim(ExtraBytesParams(name="normal_y", type=np.float32))
    header.add_extra_dim(ExtraBytesParams(name="normal_z", type=np.float32))
    las = laspy.LasData(header)

    las.x = points_final[:, 0]
    las.y = points_final[:, 1]
    las.z = points_final[:, 2]

    colors_uint16 = (colors_final * 65535).astype(np.uint16)
    las.red   = colors_uint16[:, 0]
    las.green = colors_uint16[:, 1]
    las.blue  = colors_uint16[:, 2]

    las.normal_x = normals[:, 0].astype(np.float32)
    las.normal_y = normals[:, 1].astype(np.float32)
    las.normal_z = normals[:, 2].astype(np.float32)

    out_file = mesh_path.replace(".glb", "_pc.las")
    las.write(out_file)
    print(f"  Write LAS: {time.time()-t:.1f}s")

    end_time = time.time()
    tot_sec = round(end_time - start_time, 2)
    minutes = int(tot_sec // 60)
    seconds = int(tot_sec % 60)
    print(f"Point cloud saved as: {out_file}, with {len(points_final)} points")
    if minutes > 0:
        print(f'Processing time: {minutes} min {seconds} sec')
    else:
        print(f'Processing time: {seconds} sec')

    return out_file


if __name__ == "__main__":
    main()