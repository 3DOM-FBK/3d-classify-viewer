
declare module BABYLON {


    /**
     * Matrix that converts handedness on the X-axis. Used to convert from LH to RH and vice versa.
     * @internal
     */
    export var ConvertHandednessMatrix: Matrix;
    /**
     * Checks if a node is a "noop" transform node, usually inserted by the glTF loader to correct handedness.
     * @internal
     */
    export function IsNoopNode(node: Node, useRightHandedSystem: boolean): boolean;


    /**
     * Class for generating STL data from a Babylon scene.
     */
    export class STLExport {
        /**
         * Exports the geometry of a Mesh array in .STL file format (ASCII)
         * @param meshes list defines the mesh to serialize
         * @param download triggers the automatic download of the file.
         * @param fileName changes the downloads fileName.
         * @param binary changes the STL to a binary type.
         * @param isLittleEndian toggle for binary type exporter.
         * @param doNotBakeTransform toggle if meshes transforms should be baked or not.
         * @param supportInstancedMeshes toggle to export instanced Meshes. Enabling support for instanced meshes will override doNoBakeTransform as true
         * @param exportIndividualMeshes toggle to export each mesh as an independent mesh. By default, all the meshes are combined into one mesh. This property has no effect when exporting in binary format
         * @returns the STL as UTF8 string
         */
        static CreateSTL(meshes: (Mesh | InstancedMesh)[], download?: boolean, fileName?: string, binary?: boolean, isLittleEndian?: boolean, doNotBakeTransform?: boolean, supportInstancedMeshes?: boolean, exportIndividualMeshes?: boolean): any;
    }






    /** @internal */
    export var __IGLTFExporterExtension: number;
    /**
     * Interface for extending the exporter
     * @internal
     */
    export interface IGLTFExporterExtension {
        /**
         * The name of this extension
         */
        readonly name: string;
        /**
         * Defines whether this extension is enabled
         */
        enabled: boolean;
        /**
         * Defines whether this extension is required
         */
        required: boolean;
    }




    export var DefaultTranslation: DeepImmutableObject<Vector3>;
    export var DefaultRotation: DeepImmutable<Quaternion>;
    export var DefaultScale: DeepImmutableObject<Vector3>;
    /**
     * Get the information necessary for enumerating a vertex buffer.
     * @param vertexBuffer the vertex buffer to enumerate
     * @param meshes the meshes that use the vertex buffer
     * @returns the information necessary to enumerate the vertex buffer
     */
    export function GetVertexBufferInfo(vertexBuffer: VertexBuffer, meshes: AbstractMesh[]): {
        byteOffset: number;
        byteStride: number;
        componentCount: number;
        type: number;
        count: number;
        normalized: boolean;
        totalVertices: number;
        kind: string;
    };
    export function GetAccessorElementCount(accessorType: BABYLON.GLTF2.AccessorType): number;
    export function FloatsNeed16BitInteger(floatArray: FloatArray): boolean;
    export function IsStandardVertexAttribute(type: string): boolean;
    export function GetAccessorType(kind: string, hasVertexColorAlpha: boolean): BABYLON.GLTF2.AccessorType;
    export function GetAttributeType(kind: string): string;
    export function GetPrimitiveMode(fillMode: number): BABYLON.GLTF2.MeshPrimitiveMode;
    export function IsTriangleFillMode(fillMode: number): boolean;
    export function NormalizeTangent(tangent: Vector4 | Vector3): void;
    export function ConvertToRightHandedPosition(value: Vector3): Vector3;
    /** @internal */
    export function ConvertToRightHandedTransformMatrix(matrix: Matrix): Matrix;
    /**
     * Converts, in-place, a left-handed quaternion to a right-handed quaternion via a change of basis.
     * @param value the unit quaternion to convert
     * @returns the converted quaternion
     */
    export function ConvertToRightHandedRotation(value: Quaternion): Quaternion;
    /**
     * Pre-multiplies a 180-degree Y rotation to the quaternion, in order to match glTF's flipped forward direction for cameras.
     * @param rotation Target camera rotation.
     */
    export function Rotate180Y(rotation: Quaternion): void;
    /**
     * Collapses GLTF parent and node into a single node, ignoring scaling.
     * This is useful for removing nodes that were added by the GLTF importer.
     * @param node Original GLTF node (Light or Camera).
     * @param parentNode Target parent node.
     */
    export function CollapseChildIntoParent(node: BABYLON.GLTF2.INode, parentNode: BABYLON.GLTF2.INode): void;
    /**
     * Checks whether a camera or light node is candidate for collapsing with its parent node.
     * This is useful for roundtrips, as the glTF Importer parents a new node to
     * lights and cameras to store their original transformation information.
     * @param babylonNode Babylon light or camera node.
     * @param parentBabylonNode Target Babylon parent node.
     * @returns True if the two nodes can be merged, false otherwise.
     */
    export function IsChildCollapsible(babylonNode: ShadowLight | TargetCamera | AreaLight, parentBabylonNode: Node): boolean;
    /**
     * Converts an IndicesArray into either a Uint32Array or Uint16Array.
     * If the `start` and `count` parameters specify a subset of the array, a new view is created.
     * If the input is a number[], the data is copied into a new buffer.
     * @param indices input array to be converted
     * @param start starting index
     * @param count number of indices
     * @param is32Bits whether the output should be Uint32Array (true) or Uint16Array (false) when indices is an `Array`
     * @returns a Uint32Array or Uint16Array
     * @internal
     */
    export function IndicesArrayToTypedSubarray(indices: IndicesArray, start: number, count: number, is32Bits: boolean): Uint32Array | Uint16Array;
    export function DataArrayToUint8Array(data: DataArray): Uint8Array;
    export function GetMinMax(data: DataArray, vertexBuffer: VertexBuffer, start: number, count: number): {
        min: number[];
        max: number[];
    };
    /**
     * Removes, in-place, object properties which have the same value as the default value.
     * Useful for avoiding unnecessary properties in the glTF JSON.
     * @param object the object to omit default values from
     * @param defaultValues a partial object with default values
     * @returns object with default values omitted
     */
    export function OmitDefaultValues<T extends object>(object: T, defaultValues: Partial<T>): T;


    /**
     * Mesh compression methods.
     */
    export type MeshCompressionMethod = "None" | "Draco";
    /**
     * Holds a collection of exporter options and parameters
     */
    export interface IExportOptions {
        /**
         * Function which indicates whether a babylon node should be exported or not
         * @param node source Babylon node. It is used to check whether it should be exported to glTF or not
         * @returns boolean, which indicates whether the node should be exported (true) or not (false)
         */
        shouldExportNode?(node: Node): boolean;
        /**
         * Function which indicates whether an animation on the scene should be exported or not
         * @param animation source animation
         * @returns boolean, which indicates whether the animation should be exported (true) or not (false)
         */
        shouldExportAnimation?(animation: Animation): boolean;
        /**
         * Function to extract the part of the scene or node's `metadata` that will populate the corresponding
         * glTF object's `extras` field. If not defined, `node.metadata.gltf.extras` will be used.
         * @param metadata source metadata to read from
         * @returns the data to store into the glTF extras field
         */
        metadataSelector?(metadata: any): any;
        /**
         * The sample rate to bake animation curves. Defaults to 1 / 60.
         */
        animationSampleRate?: number;
        /**
         * Begin serialization without waiting for the scene to be ready. Defaults to false.
         */
        exportWithoutWaitingForScene?: boolean;
        /**
         * Indicates if unused vertex uv attributes should be included in export. Defaults to false.
         */
        exportUnusedUVs?: boolean;
        /**
         * Remove no-op root nodes when possible. Defaults to true.
         */
        removeNoopRootNodes?: boolean;
        /**
         * Indicates if coordinate system swapping root nodes should be included in export. Defaults to false.
         * @deprecated Please use removeNoopRootNodes instead
         */
        includeCoordinateSystemConversionNodes?: boolean;
        /**
         * Indicates what compression method to apply to mesh data.
         */
        meshCompressionMethod?: MeshCompressionMethod;
    }
    /**
     * Class for generating glTF data from a Babylon scene.
     */
    export class GLTF2Export {
        /**
         * Exports the scene to .gltf file format
         * @param scene Babylon scene
         * @param fileName Name to use for the .gltf file
         * @param options Exporter options
         * @returns Returns the exported data
         */
        static GLTFAsync(scene: Scene, fileName: string, options?: IExportOptions): Promise<GLTFData>;
        /**
         * Exports the scene to .glb file format
         * @param scene Babylon scene
         * @param fileName Name to use for the .glb file
         * @param options Exporter options
         * @returns Returns the exported data
         */
        static GLBAsync(scene: Scene, fileName: string, options?: IExportOptions): Promise<GLTFData>;
    }


    /**
     * Interface to store morph target information.
     * @internal
     */
    export interface IMorphTargetData {
        attributes: Record<string, number>;
        influence: number;
        name: string;
    }
    export function BuildMorphTargetBuffers(morphTarget: MorphTarget, mesh: AbstractMesh, bufferManager: BufferManager, bufferViews: BABYLON.GLTF2.IBufferView[], accessors: BABYLON.GLTF2.IAccessor[], convertToRightHanded: boolean): IMorphTargetData;


    /**
     * Computes the metallic factor from specular glossiness values.
     * @param diffuse diffused value
     * @param specular specular value
     * @param oneMinusSpecularStrength one minus the specular strength
     * @returns metallic value
     * @internal
     */
    export function _SolveMetallic(diffuse: number, specular: number, oneMinusSpecularStrength: number): number;
    /**
     * Computes the metallic/roughness factors from a Standard Material.
     * @internal
     */
    export function _ConvertToGLTFPBRMetallicRoughness(babylonStandardMaterial: StandardMaterial): BABYLON.GLTF2.IMaterialPbrMetallicRoughness;
    /**
     * Utility methods for working with glTF material conversion properties.
     * @internal
     */
    export class GLTFMaterialExporter {
        private readonly _exporter;
        private _textureMap;
        private _internalTextureToImage;
        constructor(_exporter: GLTFExporter);
        getTextureInfo(babylonTexture: Nullable<BaseTexture>): Nullable<BABYLON.GLTF2.ITextureInfo>;
        exportStandardMaterialAsync(babylonStandardMaterial: StandardMaterial, hasUVs: boolean): Promise<number>;
        private _finishMaterialAsync;
        /**
         * Resizes the two source textures to the same dimensions.  If a texture is null, a default white texture is generated.  If both textures are null, returns null
         * @param texture1 first texture to resize
         * @param texture2 second texture to resize
         * @param scene babylonjs scene
         * @returns resized textures or null
         */
        private _resizeTexturesToSameDimensions;
        /**
         * Convert Specular Glossiness Textures to Metallic Roughness
         * See link below for info on the material conversions from PBR Metallic/Roughness and Specular/Glossiness
         * @see https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Archived/KHR_materials_pbrSpecularGlossiness/examples/convert-between-workflows-bjs/js/babylon.pbrUtilities.js
         * @param diffuseTexture texture used to store diffuse information
         * @param specularGlossinessTexture texture used to store specular and glossiness information
         * @param factors specular glossiness material factors
         * @returns pbr metallic roughness interface or null
         */
        private _convertSpecularGlossinessTexturesToMetallicRoughnessAsync;
        /**
         * Converts specular glossiness material properties to metallic roughness
         * @param specularGlossiness interface with specular glossiness material properties
         * @returns interface with metallic roughness material properties
         */
        private _convertSpecularGlossinessToMetallicRoughness;
        /**
         * Calculates the surface reflectance, independent of lighting conditions
         * @param color Color source to calculate brightness from
         * @returns number representing the perceived brightness, or zero if color is undefined
         */
        private _getPerceivedBrightness;
        /**
         * Returns the maximum color component value
         * @param color
         * @returns maximum color component value, or zero if color is null or undefined
         */
        private _getMaxComponent;
        /**
         * Convert a PBRMaterial (Metallic/Roughness) to Metallic Roughness factors
         * @param baseColor Base color of the material
         * @param metallic Metallic factor of the material
         * @param roughness Roughness factor of the material
         * @param albedoTexture Albedo texture of the material
         * @param metallicTexture Metallic texture of the material
         * @param roughnessTexture Roughness texture of the material
         * @param babylonPBRMaterial BJS PBR Metallic Roughness Material
         * @param glTFPbrMetallicRoughness glTF PBR Metallic Roughness interface
         * @param hasUVs specifies if texture coordinates are present on the submesh to determine if textures should be applied
         * @returns glTF PBR Metallic Roughness factors
         */
        private _convertMetalRoughFactorsToMetallicRoughnessAsync;
        private _getTextureSampler;
        private _getGLTFTextureWrapMode;
        /**
         * Convert a PBRMaterial (Specular/Glossiness) to Metallic Roughness factors
         * @param babylonPBRMaterial BJS PBR Metallic Roughness Material
         * @param pbrMetallicRoughness glTF PBR Metallic Roughness interface
         * @param hasUVs specifies if texture coordinates are present on the submesh to determine if textures should be applied
         * @returns glTF PBR Metallic Roughness factors
         */
        private _convertSpecGlossFactorsToMetallicRoughnessAsync;
        exportPBRMaterialAsync(babylonPBRMaterial: PBRBaseMaterial, hasUVs: boolean): Promise<number>;
        private _setMetallicRoughnessPbrMaterialAsync;
        exportOpenPBRMaterialAsync(babylonOpenPBRMaterial: OpenPBRMaterial, hasUVs: boolean): Promise<number>;
        exportTextureAsync(babylonTexture: BaseTexture, overrideId?: Nullable<number>): Promise<Nullable<BABYLON.GLTF2.ITextureInfo>>;
        private _exportTextureImageAsync;
        private _exportImageAsync;
        private _exportTextureInfo;
        private _exportTextureSampler;
    }


    /** @internal */
    export var __IGLTFExporterExtensionV2: number;
    /**
     * Interface for a glTF exporter extension
     * @internal
     */
    export interface IGLTFExporterExtensionV2 extends IGLTFExporterExtension, IDisposable {
        /**
         * Define this method to get notified when a texture info is created
         * @param context The context when loading the asset
         * @param textureInfo The glTF texture info
         * @param babylonTexture The Babylon.js texture
         */
        postExportTexture?(context: string, textureInfo: BABYLON.GLTF2.ITextureInfo, babylonTexture: BaseTexture): void;
        /**
         * Define this method to get notified when a primitive is created
         * @param primitive glTF mesh primitive
         * @param bufferManager Buffer manager
         * @param accessors List of glTF accessors
         */
        postExportMeshPrimitive?(primitive: BABYLON.GLTF2.IMeshPrimitive, bufferManager: BufferManager, accessors: BABYLON.GLTF2.IAccessor[]): void;
        /**
         * Define this method to modify the default behavior when exporting a node
         * @param context The context when exporting the node
         * @param node glTF node
         * @param babylonNode BabylonJS node
         * @param nodeMap Current node mapping of babylon node to glTF node index. Useful for combining nodes together.
         * @param convertToRightHanded Flag indicating whether to convert values to right-handed
         * @param bufferManager Buffer manager
         * @returns nullable BABYLON.GLTF2.INode promise
         */
        postExportNodeAsync?(context: string, node: BABYLON.GLTF2.INode, babylonNode: Node, nodeMap: Map<Node, number>, convertToRightHanded: boolean, bufferManager: BufferManager): Promise<Nullable<BABYLON.GLTF2.INode>>;
        /**
         * Define this method to modify the default behavior when exporting a material
         * @param context The context when exporting the material
         * @param node glTF material
         * @param babylonMaterial BabylonJS material
         * @returns nullable BABYLON.GLTF2.IMaterial promise
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
        /**
         * Define this method to return additional textures to export from a material
         * @param context The context when exporting the material
         * @param node glTF material
         * @param babylonMaterial BabylonJS material
         * @returns List of textures
         */
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        /**
         * Define this method to modify the glTF buffer data before it is finalized and written
         * @param bufferManager Buffer manager
         */
        preGenerateBinaryAsync?(bufferManager: BufferManager): Promise<void>;
        /** Gets a boolean indicating that this extension was used */
        wasUsed: boolean;
        /** Gets a boolean indicating that this extension is required for the file to work */
        required: boolean;
        /**
         * Called after the exporter state changes to EXPORTING
         */
        onExporting?(): void;
    }


    /** @internal */
    export class GLTFExporter {
        readonly _glTF: BABYLON.GLTF2.IGLTF;
        readonly _animations: BABYLON.GLTF2.IAnimation[];
        readonly _accessors: BABYLON.GLTF2.IAccessor[];
        readonly _bufferViews: BABYLON.GLTF2.IBufferView[];
        readonly _cameras: BABYLON.GLTF2.ICamera[];
        readonly _images: BABYLON.GLTF2.IImage[];
        readonly _materials: BABYLON.GLTF2.IMaterial[];
        readonly _meshes: BABYLON.GLTF2.IMesh[];
        readonly _nodes: BABYLON.GLTF2.INode[];
        readonly _samplers: BABYLON.GLTF2.ISampler[];
        readonly _scenes: BABYLON.GLTF2.IScene[];
        readonly _skins: BABYLON.GLTF2.ISkin[];
        readonly _textures: BABYLON.GLTF2.ITexture[];
        readonly _babylonScene: Scene;
        readonly _imageData: {
            [fileName: string]: Blob;
        };
        /**
         * Baked animation sample rate
         */
        private _animationSampleRate;
        private readonly _options;
        _shouldUseGlb: boolean;
        readonly _materialExporter: GLTFMaterialExporter;
        private readonly _extensions;
        readonly _bufferManager: BufferManager;
        private readonly _shouldExportNodeMap;
        private readonly _nodeMap;
        readonly _materialMap: Map<Material, number>;
        private readonly _camerasMap;
        private readonly _nodesCameraMap;
        private readonly _skinMap;
        private readonly _nodesSkinMap;
        readonly _materialNeedsUVsSet: Set<Material>;
        private static readonly _ExtensionNames;
        private static readonly _ExtensionFactories;
        private static readonly _ExtensionOrders;
        private _ApplyExtension;
        private _ApplyExtensions;
        _extensionsPostExportNodeAsync(context: string, node: BABYLON.GLTF2.INode, babylonNode: Node, nodeMap: Map<Node, number>, convertToRightHanded: boolean): Promise<Nullable<BABYLON.GLTF2.INode>>;
        _extensionsPostExportMaterialAsync(context: string, material: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<Nullable<BABYLON.GLTF2.IMaterial>>;
        /**
         * Get additional textures for a material
         * @param context The context when loading the asset
         * @param material The glTF material
         * @param babylonMaterial The Babylon.js material
         * @returns List of additional textures
         */
        _extensionsPostExportMaterialAdditionalTexturesAsync(context: string, material: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        _extensionsPostExportTextures(context: string, textureInfo: BABYLON.GLTF2.ITextureInfo, babylonTexture: BaseTexture): void;
        _extensionsPostExportMeshPrimitive(primitive: BABYLON.GLTF2.IMeshPrimitive): void;
        _extensionsPreGenerateBinaryAsync(): Promise<void>;
        private _forEachExtensions;
        private _extensionsOnExporting;
        private _loadExtensions;
        constructor(babylonScene?: Nullable<Scene>, options?: IExportOptions);
        dispose(): void;
        get options(): Required<IExportOptions>;
        static RegisterExtension(name: string, factory: (exporter: GLTFExporter) => IGLTFExporterExtensionV2, order?: number): void;
        static UnregisterExtension(name: string): boolean;
        private _generateJSON;
        generateGLTFAsync(glTFPrefix: string): Promise<GLTFData>;
        private _generateBinaryAsync;
        /**
         * Pads the number to a multiple of 4
         * @param num number to pad
         * @returns padded number
         */
        private _getPadding;
        generateGLBAsync(glTFPrefix: string): Promise<GLTFData>;
        private _setNodeTransformation;
        private _setCameraTransformation;
        private _listAvailableCameras;
        private _exportAndAssignCameras;
        private _listAvailableSkeletons;
        private _exportAndAssignSkeletons;
        private _exportSceneAsync;
        private _shouldExportNode;
        private _exportNodesAsync;
        private _collectBuffers;
        private _exportBuffers;
        /**
         * Processes a node to be exported to the glTF file
         * @returns A promise that resolves once the node has been exported
         * @internal
         */
        private _exportNodeAsync;
        /**
         * Creates a glTF node from a Babylon.js node. If skipped, returns null.
         * @internal
         */
        private _createNodeAsync;
        private _exportIndices;
        private _exportVertexBuffer;
        private _exportMaterialAsync;
        private _exportMeshAsync;
    }


    /**
     * Class for holding and downloading glTF file data
     */
    export class GLTFData {
        /**
         * Object which contains the file name as the key and its data as the value
         */
        readonly files: {
            [fileName: string]: string | Blob;
        };
        /**
         * @deprecated Use files instead
         */
        get glTFFiles(): {
            [fileName: string]: string | Blob;
        };
        /**
         * Downloads the glTF data as files based on their names and data
         */
        downloadFiles(): void;
    }


    /**
     * @internal
     * Interface to store animation data.
     */
    export interface _IAnimationData {
        /**
         * Keyframe data.
         */
        inputs: number[];
        /**
         * Value data.
         */
        outputs: number[][];
        /**
         * Animation interpolation data.
         */
        samplerInterpolation: BABYLON.GLTF2.AnimationSamplerInterpolation;
        /**
         * Minimum keyframe value.
         */
        inputsMin: number;
        /**
         * Maximum keyframe value.
         */
        inputsMax: number;
    }
    /**
     * @internal
     */
    export interface _IAnimationInfo {
        /**
         * The target channel for the animation
         */
        animationChannelTargetPath: BABYLON.GLTF2.AnimationChannelTargetPath;
        /**
         * The glTF accessor type for the data.
         */
        dataAccessorType: BABYLON.GLTF2.AccessorType.VEC3 | BABYLON.GLTF2.AccessorType.VEC4 | BABYLON.GLTF2.AccessorType.SCALAR;
        /**
         * Specifies if quaternions should be used.
         */
        useQuaternion: boolean;
    }
    /**
     * @internal
     * Utility class for generating glTF animation data from BabylonJS.
     */
    export class _GLTFAnimation {
        /**
         * Determine if a node is transformable - ie has properties it should be part of animation of transformation.
         * @param babylonNode the node to test
         * @returns true if can be animated, false otherwise. False if the parameter is null or undefined.
         */
        private static _IsTransformable;
        /**
         * @ignore
         *
         * Creates glTF channel animation from BabylonJS animation.
         * @param babylonTransformNode - BabylonJS mesh.
         * @param animation - animation.
         * @param animationChannelTargetPath - The target animation channel.
         * @param useQuaternion - Specifies if quaternions are used.
         * @returns nullable IAnimationData
         */
        static _CreateNodeAnimation(babylonTransformNode: Node, animation: Animation, animationChannelTargetPath: BABYLON.GLTF2.AnimationChannelTargetPath, useQuaternion: boolean, animationSampleRate: number): Nullable<_IAnimationData>;
        private static _DeduceAnimationInfo;
        /**
         * @ignore
         * Create node animations from the transform node animations
         * @param babylonNode
         * @param runtimeGLTFAnimation
         * @param idleGLTFAnimations
         * @param nodeMap
         * @param nodes
         * @param bufferManager
         * @param bufferViews
         * @param accessors
         * @param animationSampleRate
         */
        static _CreateNodeAnimationFromNodeAnimations(babylonNode: Node, runtimeGLTFAnimation: BABYLON.GLTF2.IAnimation, idleGLTFAnimations: BABYLON.GLTF2.IAnimation[], nodeMap: Map<Node, number>, nodes: BABYLON.GLTF2.INode[], bufferManager: BufferManager, bufferViews: BABYLON.GLTF2.IBufferView[], accessors: BABYLON.GLTF2.IAccessor[], animationSampleRate: number, useRightHanded: boolean, shouldExportAnimation?: (animation: Animation) => boolean): void;
        /**
         * @ignore
         * Create individual morph animations from the mesh's morph target animation tracks
         * @param babylonNode
         * @param runtimeGLTFAnimation
         * @param idleGLTFAnimations
         * @param nodeMap
         * @param nodes
         * @param bufferManager
         * @param bufferViews
         * @param accessors
         * @param animationSampleRate
         */
        static _CreateMorphTargetAnimationFromMorphTargetAnimations(babylonNode: Node, runtimeGLTFAnimation: BABYLON.GLTF2.IAnimation, idleGLTFAnimations: BABYLON.GLTF2.IAnimation[], nodeMap: Map<Node, number>, nodes: BABYLON.GLTF2.INode[], bufferManager: BufferManager, bufferViews: BABYLON.GLTF2.IBufferView[], accessors: BABYLON.GLTF2.IAccessor[], animationSampleRate: number, useRightHanded: boolean, shouldExportAnimation?: (animation: Animation) => boolean): void;
        /**
         * @internal
         * Create node and morph animations from the animation groups
         * @param babylonScene
         * @param glTFAnimations
         * @param nodeMap
         * @param nodes
         * @param bufferManager
         * @param bufferViews
         * @param accessors
         * @param animationSampleRate
         */
        static _CreateNodeAndMorphAnimationFromAnimationGroups(babylonScene: Scene, glTFAnimations: BABYLON.GLTF2.IAnimation[], nodeMap: Map<Node, number>, bufferManager: BufferManager, bufferViews: BABYLON.GLTF2.IBufferView[], accessors: BABYLON.GLTF2.IAccessor[], animationSampleRate: number, leftHandedNodes: Set<Node>, shouldExportAnimation?: (animation: Animation) => boolean): void;
        private static _AddAnimation;
        /**
         * Create a baked animation
         * @param babylonTransformNode BabylonJS mesh
         * @param animation BabylonJS animation corresponding to the BabylonJS mesh
         * @param animationChannelTargetPath animation target channel
         * @param minFrame minimum animation frame
         * @param maxFrame maximum animation frame
         * @param fps frames per second of the animation
         * @param sampleRate
         * @param inputs input key frames of the animation
         * @param outputs output key frame data of the animation
         * @param minMaxFrames
         * @param minMaxFrames.min
         * @param minMaxFrames.max
         * @param useQuaternion specifies if quaternions should be used
         */
        private static _CreateBakedAnimation;
        private static _ConvertFactorToVector3OrQuaternion;
        private static _SetInterpolatedValue;
        /**
         * Creates linear animation from the animation key frames
         * @param babylonTransformNode BabylonJS mesh
         * @param animation BabylonJS animation
         * @param animationChannelTargetPath The target animation channel
         * @param inputs Array to store the key frame times
         * @param outputs Array to store the key frame data
         * @param useQuaternion Specifies if quaternions are used in the animation
         */
        private static _CreateLinearOrStepAnimation;
        /**
         * Creates cubic spline animation from the animation key frames
         * @param babylonTransformNode BabylonJS mesh
         * @param animation BabylonJS animation
         * @param animationChannelTargetPath The target animation channel
         * @param inputs Array to store the key frame times
         * @param outputs Array to store the key frame data
         * @param useQuaternion Specifies if quaternions are used in the animation
         */
        private static _CreateCubicSplineAnimation;
        private static _GetBasePositionRotationOrScale;
        /**
         * Adds a key frame value
         * @param keyFrame
         * @param animation
         * @param outputs
         * @param animationChannelTargetPath
         * @param babylonTransformNode
         * @param useQuaternion
         */
        private static _AddKeyframeValue;
        /**
         * @internal
         * Determine the interpolation based on the key frames
         * @param keyFrames
         * @param animationChannelTargetPath
         * @param useQuaternion
         */
        private static _DeduceInterpolation;
        /**
         * Adds an input tangent or output tangent to the output data
         * If an input tangent or output tangent is missing, it uses the zero vector or zero quaternion
         * @param tangentType Specifies which type of tangent to handle (inTangent or outTangent)
         * @param outputs The animation data by keyframe
         * @param animationChannelTargetPath The target animation channel
         * @param interpolation The interpolation type
         * @param keyFrame The key frame with the animation data
         * @param useQuaternion Specifies if quaternions are used
         */
        private static _AddSplineTangent;
        /**
         * Get the minimum and maximum key frames' frame values
         * @param keyFrames animation key frames
         * @returns the minimum and maximum key frame value
         */
        private static _CalculateMinMaxKeyFrames;
    }


    /** @internal */
    export class DataWriter {
        private _data;
        private _dataView;
        private _byteOffset;
        writeTypedArray(value: Exclude<TypedArray, BigInt64Array | BigUint64Array>): void;
        constructor(byteLength: number);
        get byteOffset(): number;
        getOutputData(): Uint8Array<ArrayBuffer>;
        writeUInt8(value: number): void;
        writeInt8(value: number): void;
        writeInt16(entry: number): void;
        writeUInt16(value: number): void;
        writeInt32(entry: number): void;
        writeUInt32(value: number): void;
        writeFloat32(value: number): void;
        writeFloat64(value: number): void;
        private _checkGrowBuffer;
    }


    type TypedArrayForglTF = Exclude<TypedArray, Float64Array | BigInt64Array | BigUint64Array>;
    interface IPropertyWithBufferView {
        bufferView?: number;
    }
    /**
     * Utility class to centralize the management of binary data, bufferViews, and the objects that reference them.
     * @internal
     */
    export class BufferManager {
        /**
         * Maps a bufferView to its data
         */
        private _bufferViewToData;
        /**
         * Maps a bufferView to glTF objects that reference it via a "bufferView" property (e.g. accessors, images)
         */
        private _bufferViewToProperties;
        /**
         * Maps an accessor to its bufferView
         */
        private _accessorToBufferView;
        /**
         * Generates a binary buffer from the stored bufferViews. Also populates the bufferViews list.
         * @param bufferViews The list of bufferViews to be populated while writing the binary
         * @returns The binary buffer
         */
        generateBinary(bufferViews: BABYLON.GLTF2.IBufferView[]): Uint8Array<ArrayBuffer>;
        /**
         * Creates a buffer view based on the supplied arguments
         * @param data a TypedArray to create the bufferView for
         * @param byteStride byte distance between consecutive elements
         * @returns bufferView for glTF
         */
        createBufferView(data: TypedArrayForglTF, byteStride?: number): BABYLON.GLTF2.IBufferView;
        /**
         * Creates an accessor based on the supplied arguments and assigns it to the bufferView
         * @param bufferView The glTF bufferView referenced by this accessor
         * @param type The type of the accessor
         * @param componentType The datatype of components in the attribute
         * @param count The number of attributes referenced by this accessor
         * @param byteOffset The offset relative to the start of the bufferView in bytes
         * @param minMax Minimum and maximum value of each component in this attribute
         * @param normalized Specifies whether integer data values are normalized before usage
         * @returns accessor for glTF
         */
        createAccessor(bufferView: BABYLON.GLTF2.IBufferView, type: BABYLON.GLTF2.AccessorType, componentType: BABYLON.GLTF2.AccessorComponentType, count: number, byteOffset?: number, minMax?: {
            min: number[];
            max: number[];
        }, normalized?: boolean): BABYLON.GLTF2.IAccessor;
        /**
         * Assigns a bufferView to a glTF object that references it
         * @param object The glTF object
         * @param bufferView The bufferView to assign
         */
        setBufferView(object: IPropertyWithBufferView, bufferView: BABYLON.GLTF2.IBufferView): void;
        /**
         * Removes buffer view from the binary data, as well as from all its known references
         * @param bufferView the bufferView to remove
         */
        removeBufferView(bufferView: BABYLON.GLTF2.IBufferView): void;
        getBufferView(accessor: BABYLON.GLTF2.IAccessor): BABYLON.GLTF2.IBufferView;
        getPropertiesWithBufferView(bufferView: BABYLON.GLTF2.IBufferView): IPropertyWithBufferView[];
        getData(bufferView: BABYLON.GLTF2.IBufferView): TypedArrayForglTF;
        private _verifyBufferView;
    }




    /**
     * @internal
     */
    export class KHR_texture_transform implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_texture_transform";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        /** Reference to the glTF exporter */
        private _wasUsed;
        constructor();
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        postExportTexture?(context: string, textureInfo: BABYLON.GLTF2.ITextureInfo, babylonTexture: Texture): void;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_texture_basisu/README.md)
     */
    export class KHR_texture_basisu implements IGLTFExporterExtensionV2 {
        readonly name = "KHR_texture_basisu";
        enabled: boolean;
        required: boolean;
        private _wasUsed;
        get wasUsed(): boolean;
        private _exporter;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        postExportTexture(_: string, textureInfo: BABYLON.GLTF2.ITextureInfo): void;
    }


    /**
     * TODO: In-progress specification
     * [Specification](https://github.com/KhronosGroup/glTF/blob/7ea427ed55d44427e83c0a6d1c87068b1a4151c5/extensions/2.0/Khronos/KHR_materials_volume_scatter/README.md)
     */
    export class KHR_materials_volume_scatter implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_volume_scatter";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material, deal with additional textures
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns array of additional textures to export
         */
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        private _isExtensionEnabled;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise that resolves with the updated node
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_volume/README.md)
     */
    export class KHR_materials_volume implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_volume";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material, deal with additional textures
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns array of additional textures to export
         */
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        private _isExtensionEnabled;
        private _hasTexturesExtension;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise that resolves with the updated node
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_unlit implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_unlit";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _wasUsed;
        constructor();
        /** @internal */
        get wasUsed(): boolean;
        dispose(): void;
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_transmission/README.md)
     */
    export class KHR_materials_transmission implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_transmission";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        /** Dispose */
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material, deal with additional textures
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns array of additional textures to export
         */
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        private _isExtensionEnabled;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns true if successful
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_specular/README.md)
     */
    export class KHR_materials_specular implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_specular";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        /** Dispose */
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material, deal with the additional textures
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns array of additional textures to export
         */
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        private _isExtensionEnabled;
        private _hasTexturesExtension;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise, resolves with the material
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_sheen implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_sheen";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _wasUsed;
        private _exporter;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        postExportMaterialAdditionalTexturesAsync(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        postExportMaterialAsync(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * TODO: Add link to specification. Specification still being drafted.
     * @experimental
     */
    export class KHR_materials_openpbr implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_openpbr";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _wasUsed;
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise that resolves with the updated node
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_iridescence implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_iridescence";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_ior/README.md)
     */
    export class KHR_materials_ior implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_ior";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _wasUsed;
        constructor();
        /** Dispose */
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        private _isExtensionEnabled;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise, resolves with the material
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_fuzz implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_fuzz";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _wasUsed;
        private _exporter;
        constructor(exporter: GLTFExporter);
        /**
         * Cache that holds temporary merged textures created during export
         */
        private _mergedTexturesMap;
        /**
         * Cache that holds internal textures of merged textures created during export
         */
        private _cachedInternalTexturesMap;
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        postExportMaterialAdditionalTexturesAsync(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        postExportMaterialAsync(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md)
     */
    export class KHR_materials_emissive_strength implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_emissive_strength";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _wasUsed;
        /** Dispose */
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise, resolves with the material
         */
        postExportMaterialAsync(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/87bd64a7f5e23c84b6aef2e6082069583ed0ddb4/extensions/2.0/Khronos/KHR_materials_dispersion/README.md)
     * @experimental
     */
    export class KHR_materials_dispersion implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_dispersion";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _wasUsed;
        /** Constructor */
        constructor();
        /** Dispose */
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        private _isExtensionEnabled;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise, resolves with the material
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Proposed Specification](https://github.com/KhronosGroup/glTF/pull/1825)
     * !!! Experimental Extension Subject to Changes !!!
     */
    export class KHR_materials_diffuse_transmission implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_diffuse_transmission";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material, deal with additional textures
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns array of additional textures to export
         */
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        private _isExtensionEnabled;
        /**
         * After exporting a material
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns promise that resolves with the updated node
         */
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_diffuse_roughness implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_diffuse_roughness";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_coat implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_coat";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        /**
         * Cache that holds temporary merged textures created during export
         */
        private _mergedTexturesMap;
        /**
         * Cache that holds internal textures of merged textures created during export
         */
        private _cachedInternalTexturesMap;
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_clearcoat implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_clearcoat";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        /**
         * Cache that holds temporary merged textures created during export
         */
        private _mergedTexturesMap;
        /**
         * Cache that holds internal textures of merged textures created during export
         */
        private _cachedInternalTexturesMap;
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * @internal
     */
    export class KHR_materials_anisotropy implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_materials_anisotropy";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        private _exporter;
        private _wasUsed;
        private _anisoTexturesMap;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After exporting a material, deal with the additional textures
         * @param context GLTF context of the material
         * @param node exported GLTF node
         * @param babylonMaterial corresponding babylon material
         * @returns array of additional textures to export
         */
        postExportMaterialAdditionalTexturesAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BaseTexture[]>;
        postExportMaterialAsync?(context: string, node: BABYLON.GLTF2.IMaterial, babylonMaterial: Material): Promise<BABYLON.GLTF2.IMaterial>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_lights_punctual/README.md)
     */
    export class KHR_lights_punctual implements IGLTFExporterExtensionV2 {
        /** The name of this extension. */
        readonly name = "KHR_lights_punctual";
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        /** Reference to the glTF exporter */
        private _exporter;
        private _lights;
        /**
         * @internal
         */
        constructor(exporter: GLTFExporter);
        /** @internal */
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /** @internal */
        onExporting(): void;
        /**
         * Define this method to modify the default behavior when exporting a node
         * @param context The context when exporting the node
         * @param node glTF node
         * @param babylonNode BabylonJS node
         * @param nodeMap Node mapping of babylon node to glTF node index
         * @param convertToRightHanded Flag to convert the values to right-handed
         * @returns nullable BABYLON.GLTF2.INode promise
         */
        postExportNodeAsync(context: string, node: BABYLON.GLTF2.INode, babylonNode: Node, nodeMap: Map<Node, number>, convertToRightHanded: boolean): Promise<Nullable<BABYLON.GLTF2.INode>>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_draco_mesh_compression/README.md)
     */
    export class KHR_draco_mesh_compression implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "KHR_draco_mesh_compression";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** KHR_draco_mesh_compression is required, as uncompressed fallback data is not yet implemented. */
        required: boolean;
        /** BufferViews used for Draco data, which may be eligible for removal after Draco encoding */
        private _bufferViewsUsed;
        /** Accessors that were replaced with Draco data, which may be eligible for removal after Draco encoding */
        private _accessorsUsed;
        /** Promise pool for Draco encoding work */
        private _encodePromises;
        private _wasUsed;
        /** @internal */
        get wasUsed(): boolean;
        /** @internal */
        constructor(exporter: GLTFExporter);
        /** @internal */
        dispose(): void;
        /** @internal */
        postExportMeshPrimitive(primitive: BABYLON.GLTF2.IMeshPrimitive, bufferManager: BufferManager, accessors: BABYLON.GLTF2.IAccessor[]): void;
        /** @internal */
        preGenerateBinaryAsync(bufferManager: BufferManager): Promise<void>;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/EXT_texture_webp/README.md)
     */
    export class EXT_texture_webp implements IGLTFExporterExtensionV2 {
        readonly name = "EXT_texture_webp";
        enabled: boolean;
        required: boolean;
        private _wasUsed;
        get wasUsed(): boolean;
        private _exporter;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        postExportTexture(_: string, textureInfo: BABYLON.GLTF2.ITextureInfo): void;
    }


    /**
     * [Proposed Specification](https://github.com/KhronosGroup/glTF/blob/5cb7518cf9a1bfb8268320026961b21caf5a4aac/extensions/2.0/Vendor/EXT_texture_avif/README.md)
     * @experimental
     */
    export class EXT_texture_avif implements IGLTFExporterExtensionV2 {
        readonly name = "EXT_texture_avif";
        enabled: boolean;
        required: boolean;
        private _wasUsed;
        get wasUsed(): boolean;
        private _exporter;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        postExportTexture(_: string, textureInfo: BABYLON.GLTF2.ITextureInfo): void;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/EXT_mesh_gpu_instancing/README.md)
     */
    export class EXT_mesh_gpu_instancing implements IGLTFExporterExtensionV2 {
        /** Name of this extension */
        readonly name = "EXT_mesh_gpu_instancing";
        /** Defines whether this extension is enabled */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        /**
         * Internal state to emit warning about instance color alpha once
         */
        private _instanceColorWarned;
        private _exporter;
        private _wasUsed;
        constructor(exporter: GLTFExporter);
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /**
         * After node is exported
         * @param context the GLTF context when loading the asset
         * @param node the node exported
         * @param babylonNode the corresponding babylon node
         * @param nodeMap map from babylon node id to node index
         * @param convertToRightHanded true if we need to convert data from left hand to right hand system.
         * @param bufferManager buffer manager
         * @returns nullable promise, resolves with the node
         */
        postExportNodeAsync(context: string, node: Nullable<BABYLON.GLTF2.INode>, babylonNode: Node, nodeMap: Map<Node, number>, convertToRightHanded: boolean, bufferManager: BufferManager): Promise<Nullable<BABYLON.GLTF2.INode>>;
        private _buildAccessor;
    }


    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/EXT_lights_area/README.md)
     */
    export class EXT_lights_area implements IGLTFExporterExtensionV2 {
        /** The name of this extension. */
        readonly name = "EXT_lights_area";
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        /** Defines whether this extension is required */
        required: boolean;
        /** Reference to the glTF exporter */
        private _exporter;
        private _lights;
        /**
         * @internal
         */
        constructor(exporter: GLTFExporter);
        /** @internal */
        dispose(): void;
        /** @internal */
        get wasUsed(): boolean;
        /** @internal */
        onExporting(): void;
        /**
         * Define this method to modify the default behavior when exporting a node
         * @param context The context when exporting the node
         * @param node glTF node
         * @param babylonNode BabylonJS node
         * @param nodeMap Node mapping of babylon node to glTF node index
         * @param convertToRightHanded Flag to convert the values to right-handed
         * @returns nullable BABYLON.GLTF2.INode promise
         */
        postExportNodeAsync(context: string, node: BABYLON.GLTF2.INode, babylonNode: Node, nodeMap: Map<Node, number>, convertToRightHanded: boolean): Promise<Nullable<BABYLON.GLTF2.INode>>;
    }


    /**
     * Options for the USDZ export
     */
    export interface IUSDZExportOptions {
        /**
         * URL to load the fflate library from
         */
        fflateUrl?: string;
        /**
         * Include anchoring properties in the USDZ file
         */
        includeAnchoringProperties?: boolean;
        /**
         * Anchoring type (plane by default)
         */
        anchoringType?: string;
        /**
         * Plane anchoring alignment (horizontal by default)
         */
        planeAnchoringAlignment?: string;
        /**
         * Model file name (model.usda by default)
         */
        modelFileName?: string;
        /**
         * Precision to use for number (5 by default)
         */
        precision?: number;
        /**
         * Export the camera (false by default)
         */
        exportCamera?: boolean;
        /**
         * Camera sensor width (35 by default)
         */
        cameraSensorWidth?: number;
    }
    /**
     *
     * @param scene scene to export
     * @param options options to configure the export
     * @param meshPredicate predicate to filter the meshes to export
     * @returns a uint8 array containing the USDZ file
     * @see [Simple sphere](https://playground.babylonjs.com/#H2G5XW#6)
     * @see [Red sphere](https://playground.babylonjs.com/#H2G5XW#7)
     * @see [Boombox](https://playground.babylonjs.com/#5N3RWK#5)
     */
    export function USDZExportAsync(scene: Scene, options: Partial<IUSDZExportOptions>, meshPredicate?: (m: Mesh) => boolean): Promise<Uint8Array>;




    /**
     * Class for generating OBJ data from a Babylon scene.
     */
    export class OBJExport {
        /**
         * Exports the geometry of a Mesh array in .OBJ file format (text)
         * @param meshes defines the list of meshes to serialize
         * @param materials defines if materials should be exported
         * @param matlibname defines the name of the associated mtl file
         * @param globalposition defines if the exported positions are globals or local to the exported mesh
         * @returns the OBJ content
         */
        static OBJ(meshes: Mesh[], materials?: boolean, matlibname?: string, globalposition?: boolean): string;
        /**
         * Exports the material(s) of a mesh in .MTL file format (text)
         * @param mesh defines the mesh to extract the material from
         * @returns the mtl content
         */
        static MTL(mesh: Mesh): string;
    }






    export class BVHExporter {
        static Export(skeleton: Skeleton, animationNames?: string[], frameRate?: number): string;
        private static _BuildBoneHierarchy;
        private static _ExportHierarchy;
        private static _IsEndSite;
        private static _GetBoneOffset;
        private static _ExportMotionData;
        private static _CollectFrameValues;
        private static _GetPositionAtFrameIndex;
        private static _GetRotationAtFrameIndex;
        private static _QuaternionToEuler;
    }













}


                