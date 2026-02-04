
declare module "babylonjs-inspector/tools" {
export class Tools {
    static LookForItem(item: any, selectedEntity: any): boolean;
    private static _RecursiveRemoveHiddenMeshesAndHoistChildren;
    static GetNameString(obj: any): any;
    static SortAndFilter(parent: any, items: any[]): any[];
}

}
declare module "babylonjs-inspector/textureHelper" {
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { GlobalState } from "babylonjs-inspector/components/globalState";
/**
 * Defines which channels of the texture to retrieve with {@link TextureHelper.GetTextureDataAsync}.
 */
export interface TextureChannelsToDisplay {
    /**
     * True if the red channel should be included.
     */
    R: boolean;
    /**
     * True if the green channel should be included.
     */
    G: boolean;
    /**
     * True if the blue channel should be included.
     */
    B: boolean;
    /**
     * True if the alpha channel should be included.
     */
    A: boolean;
}
/**
 * Helper class for retrieving texture data.
 */
export class TextureHelper {
    /**
     * Gets the data of the specified texture by rendering it to an intermediate RGBA texture and retrieving the bytes from it.
     * This is convienent to get 8-bit RGBA values for a texture in a GPU compressed format.
     * @param texture the source texture
     * @param width the width of the result, which does not have to match the source texture width
     * @param height the height of the result, which does not have to match the source texture height
     * @param face if the texture has multiple faces, the face index to use for the source
     * @param channels a filter for which of the RGBA channels to return in the result
     * @param globalState the global state to use for rendering the texture
     * @param lod if the texture has multiple LODs, the lod index to use for the source
     * @returns the 8-bit texture data
     */
    static GetTextureDataAsync(texture: BaseTexture, width: number, height: number, face: number, channels: TextureChannelsToDisplay, globalState?: GlobalState, lod?: number): Promise<Uint8Array>;
}

}
declare module "babylonjs-inspector/inspectorGizmoManager" {
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { GizmoManager } from "babylonjs/Gizmos/gizmoManager";
export function GetInspectorGizmoManager(scene: Nullable<Scene> | undefined, create: true): GizmoManager;
export function GetInspectorGizmoManager(scene: Nullable<Scene> | undefined, create: false): Nullable<GizmoManager>;
export function DisposeInspectorGizmoManager(scene: Nullable<Scene> | undefined): void;

}
declare module "babylonjs-inspector/inspector" {
import * as React from "react";
import { IInspectorOptions } from "babylonjs/Debug/debugLayer";
import { Observable } from "babylonjs/Misc/observable";
import { Scene } from "babylonjs/scene";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { IPopupComponentProps } from "babylonjs-inspector/components/popupComponent";
export interface IPersistentPopupConfiguration {
    props: IPopupComponentProps;
    children: React.ReactNode;
    closeWhenSceneExplorerCloses?: boolean;
    closeWhenActionTabsCloses?: boolean;
}
export class Inspector {
    private static _SceneExplorerHost;
    private static _ActionTabsHost;
    private static _EmbedHost;
    private static _PersistentPopupHost;
    private static _SceneExplorerRoot;
    private static _ActionTabsRoot;
    private static _EmbedHostRoot;
    private static _PersistentPopupRoot;
    private static _NewCanvasContainer;
    private static _SceneExplorerWindow;
    private static _ActionTabsWindow;
    private static _EmbedHostWindow;
    private static _Scene;
    private static _OpenedPane;
    private static _OnBeforeRenderObserver;
    private static _OnSceneExplorerClosedObserver;
    private static _OnActionTabsClosedObserver;
    static OnSelectionChangeObservable: Observable<any>;
    static OnPropertyChangedObservable: Observable<PropertyChangedEvent>;
    private static _GlobalState;
    static MarkLineContainerTitleForHighlighting(title: string): void;
    static MarkMultipleLineContainerTitlesForHighlighting(titles: string[]): void;
    private static _SceneExplorerOptions;
    private static _InspectorOptions;
    private static _EmbedOptions;
    static PopupEmbed(): void;
    static PopupSceneExplorer(): void;
    static PopupInspector(): void;
    private static _CreateSceneExplorer;
    private static _CreateActionTabs;
    private static _CreateEmbedHost;
    static get IsVisible(): boolean;
    static EarlyAttachToLoader(): void;
    static Show(scene: Scene, userOptions: Partial<IInspectorOptions>): void;
    static _SetNewScene(scene: Scene): void;
    static _CreateCanvasContainer(parentControl: HTMLElement): void;
    private static _DestroyCanvasContainer;
    private static _Cleanup;
    private static _RemoveElementFromDOM;
    static Hide(): void;
    static _CreatePersistentPopup(config: IPersistentPopupConfiguration, hostElement: HTMLElement): void;
    static _ClosePersistentPopup(): void;
}

}
declare module "babylonjs-inspector/index" {
export * from "babylonjs-inspector/inspector";
export * from "babylonjs-inspector/components/sceneExplorer/entities/gui/guiTools";

}
declare module "babylonjs-inspector/legacy/legacy" {
export * from "babylonjs-inspector/index";

}
declare module "babylonjs-inspector/components/replayRecorder" {
import { Scene } from "babylonjs/scene";
export class ReplayRecorder {
    private _sceneRecorder;
    private _isRecording;
    get isRecording(): boolean;
    cancel(): void;
    trackScene(scene: Scene): void;
    applyDelta(json: any, scene: Scene): void;
    export(): void;
}

}
declare module "babylonjs-inspector/components/propertyChangedEvent" {
export class PropertyChangedEvent {
    object: any;
    property: string;
    value: any;
    initialValue: any;
    allowNullValue?: boolean;
}

}
declare module "babylonjs-inspector/components/popupComponent" {
import * as React from "react";
import { PropsWithChildren } from "react";
export interface IPopupComponentProps {
    id: string;
    title: string;
    size: {
        width: number;
        height: number;
    };
    onOpen?: (window: Window) => void;
    onClose: (window: Window) => void;
    onResize?: (window: Window) => void;
    onKeyUp?: (evt: KeyboardEvent) => void;
    onKeyDown?: (evt: KeyboardEvent) => void;
}
export class PopupComponent extends React.Component<PropsWithChildren<IPopupComponentProps>, {
    isComponentMounted: boolean;
    blockedByBrowser: boolean;
}> {
    private _container;
    private _window;
    private _host;
    constructor(props: IPopupComponentProps);
    componentDidMount(): void;
    onBeforeUnloadListener: () => void;
    openPopup(): void;
    componentWillUnmount(): void;
    getWindow(): Window | null;
    render(): React.ReactPortal | null;
}

}
declare module "babylonjs-inspector/components/headerComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
export interface IHeaderComponentProps {
    title: string;
    handleBack?: boolean;
    noExpand?: boolean;
    noClose?: boolean;
    noCommands?: boolean;
    onPopup: () => void;
    onClose: () => void;
    onSelectionChangedObservable?: Observable<any>;
}
export class HeaderComponent extends React.Component<IHeaderComponentProps, {
    isBackVisible: boolean;
}> {
    private _backStack;
    private _onSelectionChangeObserver;
    constructor(props: IHeaderComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    goBack(): void;
    renderLogo(): import("react/jsx-runtime").JSX.Element | null;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/globalState" {
import { IGLTFValidationResults } from "babylonjs-gltf2interface";
import { Nullable } from "babylonjs/types";
import { Observer } from "babylonjs/Misc/observable";
import { Observable } from "babylonjs/Misc/observable";
import { ISceneLoaderPlugin, ISceneLoaderPluginAsync } from "babylonjs/Loading/sceneLoader";
import { Scene } from "babylonjs/scene";
import { Light } from "babylonjs/Lights/light";
import { Camera } from "babylonjs/Cameras/camera";
import { LightGizmo } from "babylonjs/Gizmos/lightGizmo";
import { CameraGizmo } from "babylonjs/Gizmos/cameraGizmo";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { ReplayRecorder } from "babylonjs-inspector/components/replayRecorder";
import { IGLTFLoaderExtension, GLTFFileLoader } from "babylonjs-loaders/glTF/index";
export class GlobalState {
    onSelectionChangedObservable: Observable<any>;
    onPropertyChangedObservable: Observable<PropertyChangedEvent>;
    onInspectorClosedObservable: Observable<Scene>;
    onTabChangedObservable: Observable<number>;
    onSelectionRenamedObservable: Observable<void>;
    onPluginActivatedObserver: Nullable<Observer<ISceneLoaderPlugin | ISceneLoaderPluginAsync>>;
    onNewSceneObservable: Observable<Scene>;
    sceneImportDefaults: {
        [key: string]: any;
    };
    validationResults: Nullable<IGLTFValidationResults>;
    onValidationResultsUpdatedObservable: Observable<Nullable<IGLTFValidationResults>>;
    onExtensionLoadedObservable: Observable<IGLTFLoaderExtension>;
    glTFLoaderOverrideExtensionsConfig: boolean;
    glTFLoaderExtensionDefaults: {
        [name: string]: {
            [key: string]: any;
        };
    };
    glTFLoaderOverrideConfig: boolean;
    glTFLoaderDefaults: {
        [key: string]: any;
    };
    glTFLoaderExtensions: {
        [key: string]: IGLTFLoaderExtension;
    };
    blockMutationUpdates: boolean;
    selectedLineContainerTitles: Array<string>;
    selectedLineContainerTitlesNoFocus: Array<string>;
    recorder: ReplayRecorder;
    private _onlyUseEulers;
    get onlyUseEulers(): boolean;
    set onlyUseEulers(value: boolean);
    private _ignoreBackfacesForPicking;
    get ignoreBackfacesForPicking(): boolean;
    set ignoreBackfacesForPicking(value: boolean);
    init(propertyChangedObservable: Observable<PropertyChangedEvent>): void;
    prepareGLTFPlugin(loader: GLTFFileLoader): void;
    resetGLTFValidationResults(): void;
    lightGizmos: Array<LightGizmo>;
    enableLightGizmo(light: Light, enable?: boolean, gizmoCamera?: Nullable<Camera>): void;
    cameraGizmos: Array<CameraGizmo>;
    enableCameraGizmo(camera: Camera, enable?: boolean, gizmoCamera?: Nullable<Camera>): void;
    onSceneExplorerClosedObservable: Observable<void>;
    onActionTabsClosedObservable: Observable<void>;
}

}
declare module "babylonjs-inspector/components/sceneExplorer/treeNodeDebugger" {
export function setDebugNode(node: any): void;

}
declare module "babylonjs-inspector/components/sceneExplorer/treeItemSpecializedComponent" {
import { Camera } from "babylonjs/Cameras/camera";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ITreeItemSpecializedComponentProps {
    label: string;
    entity?: any;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    globalState: GlobalState;
    gizmoCamera?: Camera;
    onClick?: () => void;
}
export class TreeItemSpecializedComponent extends React.Component<ITreeItemSpecializedComponentProps> {
    constructor(props: ITreeItemSpecializedComponentProps);
    onClick(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/treeItemSelectableComponent" {
import { Nullable } from "babylonjs/types";
import { Camera } from "babylonjs/Cameras/camera";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
export interface ITreeItemSelectableComponentProps {
    entity: any;
    selectedEntity?: any;
    mustExpand?: boolean;
    offset: number;
    globalState: GlobalState;
    gizmoCamera?: Camera;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    filter: Nullable<string>;
}
export class TreeItemSelectableComponent extends React.Component<ITreeItemSelectableComponentProps, {
    isExpanded: boolean;
    mustExpand: boolean;
    isSelected: boolean;
}> {
    private _wasSelected;
    private _thisRef;
    constructor(props: ITreeItemSelectableComponentProps);
    switchExpandedState(mustExpand: boolean): void;
    shouldComponentUpdate(nextProps: ITreeItemSelectableComponentProps, nextState: {
        isExpanded: boolean;
        isSelected: boolean;
    }): boolean;
    scrollIntoView(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    onSelect(): void;
    renderChildren(): import("react/jsx-runtime").JSX.Element[] | null;
    render(): import("react/jsx-runtime").JSX.Element | null;
}

}
declare module "babylonjs-inspector/components/sceneExplorer/treeItemLabelComponent" {
import * as React from "react";

interface ITreeItemLabelComponentProps {
    label: string;
    onClick?: () => void;
    icon?: any;
    iconBase64?: string;
    color: string;
}
export class TreeItemLabelComponent extends React.Component<ITreeItemLabelComponentProps> {
    constructor(props: ITreeItemLabelComponentProps);
    onClick(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/treeItemComponent" {
import * as React from "react";
import { Nullable } from "babylonjs/types";
import { IInspectorContextMenuItem, IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Camera } from "babylonjs/Cameras/camera";
export interface ITreeItemComponentProps {
    items?: Nullable<any[]>;
    label: string;
    offset: number;
    filter: Nullable<string>;
    forceSubitems?: boolean;
    globalState: GlobalState;
    gizmoCamera?: Camera;
    entity?: any;
    selectedEntity: any;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    contextMenuItems?: IInspectorContextMenuItem[];
}
export class TreeItemComponent extends React.Component<ITreeItemComponentProps, {
    isExpanded: boolean;
    mustExpand: boolean;
}> {
    static _ContextMenuUniqueIdGenerator: number;
    constructor(props: ITreeItemComponentProps);
    switchExpandedState(): void;
    shouldComponentUpdate(nextProps: ITreeItemComponentProps, nextState: {
        isExpanded: boolean;
    }): boolean;
    expandAll(expand: boolean): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/sceneExplorer/sceneExplorerComponent" {
import * as React from "react";
import { Nullable } from "babylonjs/types";
import { IExplorerAdditionalNode, IExplorerExtensibilityGroup, IInspectorOptions } from "babylonjs/Debug/debugLayer";
import { Scene } from "babylonjs/scene";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Camera } from "babylonjs/Cameras/camera";
import "babylonjs/Sprites/spriteSceneComponent";
import "babylonjs/Audio/audioSceneComponent";
import "babylonjs/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent";
import "babylonjs-inspector/components/sceneExplorer/sceneExplorer.scss";
interface ISceneExplorerFilterComponentProps {
    onFilter: (filter: string) => void;
}
export class SceneExplorerFilterComponent extends React.Component<ISceneExplorerFilterComponentProps> {
    constructor(props: ISceneExplorerFilterComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
interface ISceneExplorerComponentProps {
    scene: Scene;
    contextMenu?: IInspectorOptions["contextMenu"];
    contextMenuOverride?: IInspectorOptions["contextMenuOverride"];
    gizmoCamera?: Camera;
    noCommands?: boolean;
    noHeader?: boolean;
    noExpand?: boolean;
    noClose?: boolean;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    additionalNodes?: IExplorerAdditionalNode[];
    globalState: GlobalState;
    popupMode?: boolean;
    onPopup?: () => void;
    onClose?: () => void;
}
export class SceneExplorerComponent extends React.Component<ISceneExplorerComponentProps, {
    filter: Nullable<string>;
    selectedEntity: any;
    scene: Scene;
}> {
    private _onSelectionChangeObserver;
    private _onSelectionRenamedObserver;
    private _onNewSceneAddedObserver;
    private _onNewSceneObserver;
    private _sceneExplorerRef;
    private _mutationTimeout;
    private _once;
    private _hooked;
    private _sceneMutationFunc;
    constructor(props: ISceneExplorerComponentProps);
    processMutation(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    filterContent(filter: string): void;
    findSiblings(parent: any, items: any[], target: any, goNext: boolean, data: {
        previousOne?: any;
        found?: boolean;
    }): boolean;
    processKeys(keyEvent: React.KeyboardEvent<HTMLDivElement>, allNodes: any[]): void;
    private _getPipelineContextMenus;
    private _getNodeContextMenus;
    private _getMaterialsContextMenus;
    private _getSpriteManagersContextMenus;
    private _getParticleSystemsContextMenus;
    private _getFrameGraphsContextMenus;
    renderContent(allNodes: any[]): import("react/jsx-runtime").JSX.Element | null;
    onClose(): void;
    onPopup(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/extensionsComponent" {
import * as React from "react";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
interface IExtensionsComponentProps {
    target: any;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
}
export class ExtensionsComponent extends React.Component<IExtensionsComponentProps, {
    popupVisible: boolean;
}> {
    private _popup;
    private _extensionRef;
    constructor(props: IExtensionsComponentProps);
    showPopup(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/transformNodeTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { TransformNode } from "babylonjs/Meshes/transformNode";
import * as React from "react";
interface ITransformNodeItemComponentProps {
    transformNode: TransformNode;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class TransformNodeItemComponent extends React.Component<ITransformNodeItemComponentProps> {
    constructor(props: ITransformNodeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/textureTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { Texture } from "babylonjs/Materials/Textures/texture";
import * as React from "react";
interface ITextureTreeItemComponentProps {
    texture: Texture;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class TextureTreeItemComponent extends React.Component<ITextureTreeItemComponentProps> {
    constructor(props: ITextureTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/targetedAnimationTreeItemComponent" {
import { TargetedAnimation } from "babylonjs/Animations/animationGroup";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
interface ITargetedAnimationItemComponentProps {
    targetedAnimation: TargetedAnimation;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class TargetedAnimationItemComponent extends React.Component<ITargetedAnimationItemComponentProps> {
    constructor(props: ITargetedAnimationItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/spriteTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { Sprite } from "babylonjs/Sprites/sprite";
interface ISpriteTreeItemComponentProps {
    sprite: Sprite;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class SpriteTreeItemComponent extends React.Component<ISpriteTreeItemComponentProps> {
    constructor(props: ISpriteTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/spriteManagerTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { SpriteManager } from "babylonjs/Sprites/spriteManager";
interface ISpriteManagerTreeItemComponentProps {
    spriteManager: SpriteManager;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class SpriteManagerTreeItemComponent extends React.Component<ISpriteManagerTreeItemComponentProps> {
    constructor(props: ISpriteManagerTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/soundTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { Sound } from "babylonjs/Audio/sound";
interface ISoundTreeItemComponentProps {
    sound: Sound;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class SoundTreeItemComponent extends React.Component<ISoundTreeItemComponentProps> {
    constructor(props: ISoundTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/skeletonTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { Skeleton } from "babylonjs/Bones/skeleton";
interface ISkeletonTreeItemComponentProps {
    skeleton: Skeleton;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class SkeletonTreeItemComponent extends React.Component<ISkeletonTreeItemComponentProps> {
    constructor(props: ISkeletonTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/sceneTreeItemComponent" {
import { Observable } from "babylonjs/Misc/observable";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { Scene } from "babylonjs/scene";
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Camera } from "babylonjs/Cameras/camera";
interface ISceneTreeItemComponentProps {
    scene: Scene;
    gizmoCamera?: Camera;
    onRefresh: () => void;
    selectedEntity?: any;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onSelectionChangedObservable?: Observable<any>;
    globalState: GlobalState;
}
export class SceneTreeItemComponent extends React.Component<ISceneTreeItemComponentProps, {
    isSelected: boolean;
    isInPickingMode: boolean;
    gizmoMode: number;
    isInWorldCoodinatesMode: boolean;
}> {
    private _gizmoLayerOnPointerObserver;
    private _onPointerObserver;
    private _onSelectionChangeObserver;
    private _selectedEntity;
    private _posDragEnd;
    private _scaleDragEnd;
    private _rotateDragEnd;
    constructor(props: ISceneTreeItemComponentProps);
    shouldComponentUpdate(nextProps: ISceneTreeItemComponentProps, nextState: {
        isSelected: boolean;
        isInPickingMode: boolean;
    }): boolean;
    updateGizmoAutoPicking(isInPickingMode: boolean): void;
    componentDidMount(): void;
    private _getMeshFromBone;
    componentWillUnmount(): void;
    onSelect(): void;
    onCoordinatesMode(): void;
    onPickingMode(): void;
    setGizmoMode(mode: number): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/renderingPipelineTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { PostProcessRenderPipeline } from "babylonjs/PostProcesses/RenderPipeline/postProcessRenderPipeline";
import * as React from "react";
interface IRenderPipelineItemComponenttProps {
    renderPipeline: PostProcessRenderPipeline;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class RenderingPipelineItemComponent extends React.Component<IRenderPipelineItemComponenttProps> {
    constructor(props: IRenderPipelineItemComponenttProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/postProcessTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { PostProcess } from "babylonjs/PostProcesses/postProcess";
import * as React from "react";
interface IPostProcessItemComponentProps {
    postProcess: PostProcess;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class PostProcessItemComponent extends React.Component<IPostProcessItemComponentProps> {
    constructor(props: IPostProcessItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/particleSystemTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
interface IParticleSystemTreeItemComponentProps {
    system: IParticleSystem;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class ParticleSystemTreeItemComponent extends React.Component<IParticleSystemTreeItemComponentProps> {
    constructor(props: IParticleSystemTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/meshTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs/Rendering/boundingBoxRenderer";
interface IMeshTreeItemComponentProps {
    mesh: AbstractMesh;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
    globalState: GlobalState;
}
export class MeshTreeItemComponent extends React.Component<IMeshTreeItemComponentProps, {
    isBoundingBoxEnabled: boolean;
    isVisible: boolean;
}> {
    constructor(props: IMeshTreeItemComponentProps);
    showBoundingBox(): void;
    switchVisibility(): void;
    private _getNameForLabel;
    private _editGeometry;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/materialTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { Material } from "babylonjs/Materials/material";
import * as React from "react";
import { NodeMaterial } from "babylonjs/Materials/Node/nodeMaterial";
interface IMaterialTreeItemComponentProps {
    material: Material | NodeMaterial;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class MaterialTreeItemComponent extends React.Component<IMaterialTreeItemComponentProps> {
    constructor(props: IMaterialTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/lightTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { Light } from "babylonjs/Lights/light";
import { Camera } from "babylonjs/Cameras/camera";
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ILightTreeItemComponentProps {
    light: Light;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
    globalState: GlobalState;
    gizmoCamera?: Camera;
}
export class LightTreeItemComponent extends React.Component<ILightTreeItemComponentProps, {
    isEnabled: boolean;
    isGizmoEnabled: boolean;
}> {
    constructor(props: ILightTreeItemComponentProps);
    switchIsEnabled(): void;
    toggleGizmo(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/frameGraphTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { FrameGraph } from "babylonjs/FrameGraph/frameGraph";
interface IFrameGraphItemComponenttProps {
    frameGraph: FrameGraph;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class FrameGraphTreeItemComponent extends React.Component<IFrameGraphItemComponenttProps> {
    constructor(props: IFrameGraphItemComponenttProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/effectLayerPipelineTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { EffectLayer } from "babylonjs/Layers/effectLayer";
interface IEffectLayerItemComponenttProps {
    layer: EffectLayer;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class EffectLayerItemComponent extends React.Component<IEffectLayerItemComponenttProps> {
    constructor(props: IEffectLayerItemComponenttProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/cameraTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { Camera } from "babylonjs/Cameras/camera";
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICameraTreeItemComponentProps {
    camera: Camera;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
    globalState: GlobalState;
    gizmoCamera?: Camera;
}
export class CameraTreeItemComponent extends React.Component<ICameraTreeItemComponentProps, {
    isActive: boolean;
    isGizmoEnabled: boolean;
}> {
    private _onBeforeRenderObserver;
    constructor(props: ICameraTreeItemComponentProps);
    setActive(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    toggleGizmo(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/boneTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
import { Bone } from "babylonjs/Bones/bone";
interface IBoneTreeItemComponentProps {
    bone: Bone;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class BoneTreeItemComponent extends React.Component<IBoneTreeItemComponentProps> {
    constructor(props: IBoneTreeItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/animationGroupTreeItemComponent" {
import { AnimationGroup } from "babylonjs/Animations/animationGroup";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import * as React from "react";
interface IAnimationGroupItemComponentProps {
    animationGroup: AnimationGroup;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class AnimationGroupItemComponent extends React.Component<IAnimationGroupItemComponentProps> {
    constructor(props: IAnimationGroupItemComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/gui/guiTools" {
import { AdvancedDynamicTexture } from "babylonjs-gui/2D/advancedDynamicTexture";
/**
 * Used to pass in the gui-editor package.
 * @param guiEditorPackage
 */
export function InjectGUIEditor(guiEditorPackage: any): void;
/**
 * Change the URL that the GUI editor loads from
 * @param guiEditorURL
 */
export function SetGUIEditorURL(guiEditorURL: string): void;
/**
 * Opens an ADT in the GUI editor
 * if you are in an ES6 environment, you must first call InjectGUIEditor to provide the gui-editor package
 * If you are in a UMD environment, it will load the package from a URL
 * @param adt
 * @param embed defines whether editor is being opened from the Playground
 * @returns a promise that resolves when the editor is opened
 */
export function EditAdvancedDynamicTexture(adt: AdvancedDynamicTexture, embed?: boolean): Promise<void>;

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/gui/controlTreeItemComponent" {
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { Control } from "babylonjs-gui/2D/controls/control";
import * as React from "react";
interface IControlTreeItemComponentProps {
    control: Control;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
}
export class ControlTreeItemComponent extends React.Component<IControlTreeItemComponentProps, {
    isActive: boolean;
    isVisible: boolean;
}> {
    constructor(props: IControlTreeItemComponentProps);
    highlight(): void;
    switchVisibility(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/sceneExplorer/entities/gui/advancedDynamicTextureTreeItemComponent" {
import { Observable } from "babylonjs/Misc/observable";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { AdvancedDynamicTexture } from "babylonjs-gui/2D/advancedDynamicTexture";
import * as React from "react";
interface IAdvancedDynamicTextureTreeItemComponentProps {
    texture: AdvancedDynamicTexture;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onSelectionChangedObservable?: Observable<any>;
    onClick: () => void;
}
export class AdvancedDynamicTextureTreeItemComponent extends React.Component<IAdvancedDynamicTextureTreeItemComponentProps, {
    isInPickingMode: boolean;
}> {
    private _onControlPickedObserver;
    constructor(props: IAdvancedDynamicTextureTreeItemComponentProps);
    componentWillUnmount(): void;
    onPickingMode(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/graph/graphSupportingTypes" {
import { IPerfDatasets } from "babylonjs/Misc/interfaces/iPerfViewer";
import { Observable } from "babylonjs/Misc/observable";
/**
 * Defines a structure to hold max, min and a optional current.
 */
export interface IPerfMinMax {
    min: number;
    max: number;
    current?: number;
}
/**
 * Defines structure of the object which contains information related to panning.
 */
export interface IPerfMousePanningPosition {
    xPos: number;
    delta: number;
}
/**
 * Defines structure of the object which contains information regarding the bounds of each dataset we want to consider.
 */
export interface IPerfIndexBounds {
    start: number;
    end: number;
}
export interface IPerfLayoutSize {
    width: number;
    height: number;
}
/**
 * Defines the structure of the meta object for the tooltip that appears when hovering over a performance graph!
 */
export interface IPerfTooltip {
    text: string;
    color: string;
}
/**
 * Defines the structure of a cache object used to store the result of measureText().
 */
export interface IPerfTextMeasureCache {
    text: string;
    width: number;
}
/**
 * Defines a structure defining the available space in a drawable area.
 */
export interface IGraphDrawableArea {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
/**
 * Defines the structure representing necessary ticker information.
 */
export interface IPerfTicker extends IPerfMinMax {
    id: string;
    text: string;
}
export interface IVisibleRangeChangedObservableProps {
    valueMap: Map<string, IPerfMinMax>;
}
/**
 * Defines what settings our canvas graphing service accepts
 */
export interface ICanvasGraphServiceSettings {
    datasets: IPerfDatasets;
    onVisibleRangeChangedObservable?: Observable<IVisibleRangeChangedObservableProps>;
}
/**
 * Defines the structure representing the preprocessable tooltip information.
 */
export interface ITooltipPreprocessedInformation {
    xForActualTimestamp: number;
    numberOfTooltipItems: number;
    longestText: string;
    focusedId: string;
}
export interface IPerfTooltipHoverPosition {
    xPos: number;
    yPos: number;
}
/**
 * Defines the supported timestamp units.
 */
export enum TimestampUnit {
    Milliseconds = 0,
    Seconds = 1,
    Minutes = 2,
    Hours = 3
}

}
declare module "babylonjs-inspector/components/graph/canvasGraphService" {
import { ICanvasGraphServiceSettings, IPerfLayoutSize } from "babylonjs-inspector/components/graph/graphSupportingTypes";
import { IPerfDatasets, IPerfMetadata } from "babylonjs/Misc/interfaces/iPerfViewer";
export class CanvasGraphService {
    private _ctx;
    private _width;
    private _height;
    private _sizeOfWindow;
    private _ticks;
    private _panPosition;
    private _position;
    private _datasetBounds;
    private _globalTimeMinMax;
    private _hoverPosition;
    private _drawableArea;
    private _axisHeight;
    private _tooltipItems;
    private _tooltipTextCache;
    private _tickerTextCache;
    private _tickerItems;
    private _preprocessedTooltipInfo;
    private _numberOfTickers;
    private _onVisibleRangeChangedObservable?;
    private readonly _addonFontLineHeight;
    private readonly _defaultLineHeight;
    readonly datasets: IPerfDatasets;
    metadata: Map<string, IPerfMetadata>;
    /**
     * Creates an instance of CanvasGraphService.
     *
     * @param canvas a pointer to the canvas dom element we would like to write to.
     * @param settings settings for our service.
     */
    constructor(canvas: HTMLCanvasElement, settings: ICanvasGraphServiceSettings);
    /**
     * This method lets the service know it should get ready to update what it is displaying.
     */
    update: (...args: any[]) => void;
    /**
     * Update the canvas graph service with the new height and width of the canvas.
     * @param size The new size of the canvas.
     */
    resize(size: IPerfLayoutSize): void;
    /**
     * Force resets the position in the data, effectively returning to the most current data.
     */
    resetDataPosition(): void;
    private _prevPointById;
    private _prevValueById;
    /**
     * This method draws the data and sets up the appropriate scales.
     */
    private _draw;
    private _drawTickers;
    /**
     * Returns the index of the closest time for the datasets.
     * Uses a modified binary search to get value.
     *
     * @param targetTime the time we want to get close to.
     * @returns index of the item with the closest time to the targetTime
     */
    private _getClosestPointToTimestamp;
    /**
     * This is a convenience method to get the number of collected slices.
     * @returns the total number of collected slices.
     */
    private _getNumberOfSlices;
    /**
     * Draws the time axis, adjusts the drawable area for the graph.
     *
     * @param timeMinMax the minimum and maximum for the time axis.
     * @param drawableArea the current allocated drawable area.
     */
    private _drawTimeAxis;
    /**
     * Given a timestamp (should be the maximum timestamp in view), this function returns the maximum unit the timestamp contains.
     * This information can be used for formatting purposes.
     * @param timestamp the maximum timestamp to find the maximum timestamp unit for.
     * @returns The maximum unit the timestamp has.
     */
    private _getTimestampUnit;
    /**
     * Given a timestamp and the interval unit, this function will parse the timestamp to the appropriate format.
     * @param timestamp The timestamp to parse
     * @param intervalUnit The maximum unit of the maximum timestamp in an interval.
     * @returns a string representing the parsed timestamp.
     */
    private _parseTimestamp;
    /**
     * Generates a list of ticks given the min and max of the axis, and the space available in the axis.
     *
     * @param minMax the minimum and maximum values of the axis
     * @param spaceAvailable the total amount of space we have allocated to our axis
     */
    private _generateTicks;
    /**
     * Nice number algorithm based on psueudo code defined in "Graphics Gems" by Andrew S. Glassner.
     * This will find a "nice" number approximately equal to num.
     *
     * @param num The number we want to get close to.
     * @param shouldRound if true we will round the number, otherwise we will get the ceiling.
     * @returns a "nice" number approximately equal to num.
     */
    private _niceNumber;
    /**
     * Gets the min and max as a single object from an array of numbers.
     * @param bounds
     * @param offset
     * @returns the min and max of the array.
     */
    private _getMinMax;
    /**
     * Converts a single number to a pixel coordinate in a single axis by normalizing the data to a [0, 1] scale using the minimum and maximum values.
     *
     * @param num the number we want to get the pixel coordinate for
     * @param minMax the min and max of the dataset in the axis we want the pixel coordinate for.
     * @param startingPixel the starting pixel coordinate (this means it takes account for any offset).
     * @param spaceAvailable the total space available in this axis.
     * @param shouldFlipValue if we should use a [1, 0] scale instead of a [0, 1] scale.
     * @returns the pixel coordinate of the value in a single axis.
     */
    private _getPixelForNumber;
    /**
     * Add in any necessary event listeners.
     *
     * @param canvas The canvas we want to attach listeners to.
     */
    private _attachEventListeners;
    /**
     * We remove all event listeners we added.
     *
     * @param canvas The canvas we want to remove listeners from.
     */
    private _removeEventListeners;
    /**
     * Handles what to do when we are hovering over the canvas and not panning.
     *
     * @param event A reference to the event to be handled.
     */
    private _handleDataHover;
    /**
     * Debounced processing and drawing of tooltip.
     */
    private _debouncedTooltip;
    /**
     * Handles what to do when we stop hovering over the canvas.
     */
    private _handleStopHover;
    /**
     * Given a line defined by P1: (x1, y1) and P2: (x2, y2) get the distance of P0 (x0, y0) from the line.
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
     * @param x1 x position of point P1
     * @param y1 y position of point P1
     * @param x2 x position of point P2
     * @param y2 y position of point P2
     * @param x0 x position of point P0
     * @param y0 y position of point P0
     * @returns distance of P0 from the line defined by P1 and P2
     */
    private _getDistanceFromLine;
    /**
     * This method does preprocessing calculations for the tooltip.
     * @param pos the position of our mouse.
     * @param drawableArea the remaining drawable area.
     */
    private _preprocessTooltip;
    /**
     * Draws the tooltip given the area it is allowed to draw in and the current pixel position.
     *
     * @param pos the position of the mouse cursor in pixels (x, y).
     * @param drawableArea  the available area we can draw in.
     */
    private _drawTooltip;
    /**
     * Gets the number from a pixel position given the minimum and maximum value in range, and the starting pixel and the ending pixel.
     *
     * @param pixel current pixel position we want to get the number for.
     * @param minMax the minimum and maximum number in the range.
     * @param startingPixel position of the starting pixel in range.
     * @param endingPixel position of ending pixel in range.
     * @param shouldFlip if we should use a [1, 0] scale instead of a [0, 1] scale.
     * @returns number corresponding to pixel position
     */
    private _getNumberFromPixel;
    /**
     * The handler for when we want to zoom in and out of the graph.
     *
     * @param event a mouse wheel event.
     */
    private _handleZoom;
    /**
     * Initializes the panning object and attaches appropriate listener.
     *
     * @param event the mouse event containing positional information.
     */
    private _handlePanStart;
    /**
     * While panning this event will keep track of the delta and update the "positions".
     *
     * @param event The mouse event that contains positional information.
     */
    private _handlePan;
    /**
     * Clears the panning object and removes the appropriate listener.
     */
    private _handlePanStop;
    /**
     * Method which returns true if the data should become realtime, false otherwise.
     *
     * @returns if the data should become realtime or not.
     */
    private _shouldBecomeRealtime;
    /**
     * Will generate a playhead with a futurebox that takes up (1-scalefactor)*100% of the canvas.
     *
     * @param drawableArea The remaining drawable area.
     * @param scaleFactor The Percentage between 0.0 and 1.0 of the canvas the data gets drawn on.
     */
    private _drawPlayheadRegion;
    /**
     *  Method to do cleanup when the object is done being used.
     *
     */
    destroy(): void;
    /**
     * This method clears the canvas
     */
    clear(): void;
}

}
declare module "babylonjs-inspector/components/graph/canvasGraphComponent" {
import { PerformanceViewerCollector } from "babylonjs/Misc/PerformanceViewer/performanceViewerCollector";
import { Observable } from "babylonjs/Misc/observable";
import { Vector2 } from "babylonjs/Maths/math.vector";
import * as React from "react";
import { IPerfLayoutSize, IVisibleRangeChangedObservableProps } from "babylonjs-inspector/components/graph/graphSupportingTypes";
import { Scene } from "babylonjs/scene";
interface ICanvasGraphComponentProps {
    id: string;
    scene: Scene;
    collector: PerformanceViewerCollector;
    layoutObservable?: Observable<IPerfLayoutSize>;
    returnToPlayheadObservable?: Observable<void>;
    onVisibleRangeChangedObservable?: Observable<IVisibleRangeChangedObservableProps>;
    initialGraphSize?: Vector2;
}
export const CanvasGraphComponent: React.FC<ICanvasGraphComponentProps>;
export {};

}
declare module "babylonjs-inspector/components/embedHost/embedHostComponent" {
import * as React from "react";
import { Scene } from "babylonjs/scene";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { IExplorerExtensibilityGroup, DebugLayerTab, IExplorerAdditionalNode } from "babylonjs/Debug/debugLayer";
import "babylonjs-inspector/components/embedHost/embedHost.scss";
interface IEmbedHostComponentProps {
    scene: Scene;
    globalState: GlobalState;
    popupMode: boolean;
    noClose?: boolean;
    noExpand?: boolean;
    onClose: () => void;
    onPopup: () => void;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    additionalNodes?: IExplorerAdditionalNode[];
    initialTab?: DebugLayerTab;
}
export class EmbedHostComponent extends React.Component<IEmbedHostComponentProps> {
    private _once;
    private _splitRef;
    private _topPartRef;
    private _bottomPartRef;
    constructor(props: IEmbedHostComponentProps);
    componentDidMount(): void;
    renderContent(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabsComponent" {
import * as React from "react";
import { PaneComponent } from "babylonjs-inspector/components/actionTabs/paneComponent";
interface ITabsComponentProps {
    children: any[];
    selectedIndex: number;
    onSelectedIndexChange: (value: number) => void;
}
export class TabsComponent extends React.Component<ITabsComponentProps> {
    constructor(props: ITabsComponentProps);
    onSelect(index: number): void;
    renderLabel(child: PaneComponent, index: number): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/paneComponent" {
import * as React from "react";

import { Observable } from "babylonjs/Misc/observable";
import { Scene } from "babylonjs/scene";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { GlobalState } from "babylonjs-inspector/components/globalState";
export interface IPaneComponentProps {
    title: string;
    icon: any;
    scene: Scene;
    selectedEntity?: any;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    globalState: GlobalState;
}
export class PaneComponent extends React.Component<IPaneComponentProps, {
    tag: any;
}> {
    constructor(props: IPaneComponentProps);
    render(): JSX.Element | null;
}

}
declare module "babylonjs-inspector/components/actionTabs/actionTabsComponent" {
import * as React from "react";
import { Scene } from "babylonjs/scene";
import { DebugLayerTab } from "babylonjs/Debug/debugLayer";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs-inspector/components/actionTabs/actionTabs.scss";
interface IActionTabsComponentProps {
    scene?: Scene;
    noCommands?: boolean;
    noHeader?: boolean;
    noExpand?: boolean;
    noClose?: boolean;
    popupMode?: boolean;
    onPopup?: () => void;
    onClose?: () => void;
    globalState?: GlobalState;
    initialTab?: DebugLayerTab;
}
export class ActionTabsComponent extends React.Component<IActionTabsComponentProps, {
    selectedEntity: any;
    selectedIndex: number;
}> {
    private _onSelectionChangeObserver;
    private _onTabChangedObserver;
    private _once;
    constructor(props: IActionTabsComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    changeSelectedTab(index: number): void;
    renderContent(): import("react/jsx-runtime").JSX.Element | null;
    onClose(): void;
    onPopup(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/toolsTabComponent" {
import { IPaneComponentProps } from "babylonjs-inspector/components/actionTabs/paneComponent";
import { PaneComponent } from "babylonjs-inspector/components/actionTabs/paneComponent";
export class ToolsTabComponent extends PaneComponent {
    private _lockObject;
    private _videoRecorder;
    private _screenShotSize;
    private _gifOptions;
    private _useWidthHeight;
    private _isExportingGltf;
    private _gltfExportOptions;
    private _gifWorkerBlob;
    private _gifRecorder;
    private _previousRenderingScale;
    private _crunchingGIF;
    private _reflectorHostname;
    private _reflectorPort;
    private _reflector;
    private _envOptions;
    constructor(props: IPaneComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    captureScreenshot(): void;
    captureEquirectangular(): void;
    captureRender(): void;
    recordVideo(): void;
    recordGIFInternal(): void;
    recordGIF(): void;
    importAnimations(event: any): void;
    exportGLTF(): void;
    exportBabylon(): void;
    createEnvTexture(): void;
    exportReplay(): void;
    startRecording(): void;
    applyDelta(file: File): void;
    connectReflector(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/statisticsTabComponent" {
import { IPaneComponentProps } from "babylonjs-inspector/components/actionTabs/paneComponent";
import { PaneComponent } from "babylonjs-inspector/components/actionTabs/paneComponent";
export class StatisticsTabComponent extends PaneComponent {
    private _sceneInstrumentation;
    private _engineInstrumentation;
    private _timerIntervalId;
    constructor(props: IPaneComponentProps);
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/settingsTabComponent" {
import { IPaneComponentProps } from "babylonjs-inspector/components/actionTabs/paneComponent";
import { PaneComponent } from "babylonjs-inspector/components/actionTabs/paneComponent";
export class SettingsTabComponent extends PaneComponent {
    constructor(props: IPaneComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGridTabComponent" {
import { IPaneComponentProps } from "babylonjs-inspector/components/actionTabs/paneComponent";
import { PaneComponent } from "babylonjs-inspector/components/actionTabs/paneComponent";
export class PropertyGridTabComponent extends PaneComponent {
    private _timerIntervalId;
    private _lockObject;
    constructor(props: IPaneComponentProps);
    timerRefresh(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    renderContent(): import("react/jsx-runtime").JSX.Element | null;
    renderTags(): import("react/jsx-runtime").JSX.Element[];
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyComponentProps" {
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { NodeMaterialBlock } from "babylonjs/Materials/Node/nodeMaterialBlock";
export interface IPropertyComponentProps {
    globalState: GlobalState;
    block: NodeMaterialBlock;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/gradientStepComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { GradientBlockColorStep } from "babylonjs/Materials/Node/Blocks/gradientBlock";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IGradientStepComponentProps {
    globalState: GlobalState;
    step: GradientBlockColorStep;
    lineIndex: number;
    lockObject?: LockObject;
    onDelete: () => void;
    onUpdateStep: () => void;
    onCheckForReOrder: () => void;
    onCopy?: () => void;
}
export class GradientStepComponent extends React.Component<IGradientStepComponentProps, {
    gradient: number;
}> {
    constructor(props: IGradientStepComponentProps);
    updateColor(color: string): void;
    updateStep(gradient: number): void;
    onPointerUp(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/gradientNodePropertyComponent" {
import * as React from "react";
import { GradientBlockColorStep } from "babylonjs/Materials/Node/Blocks/gradientBlock";
import { IPropertyComponentProps } from "babylonjs-inspector/components/actionTabs/tabs/propertyComponentProps";
export class GradientPropertyTabComponent extends React.Component<IPropertyComponentProps> {
    private _gradientBlock;
    constructor(props: IPropertyComponentProps);
    forceRebuild(): void;
    deleteStep(step: GradientBlockColorStep): void;
    copyStep(step: GradientBlockColorStep): void;
    addNewStep(): void;
    checkForReOrder(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/debugTabComponent" {
import { IPaneComponentProps } from "babylonjs-inspector/components/actionTabs/paneComponent";
import { PaneComponent } from "babylonjs-inspector/components/actionTabs/paneComponent";
import "babylonjs/Physics/physicsEngineComponent";
import "babylonjs/Physics/v1/physicsEngineComponent";
import "babylonjs/Physics/v2/physicsEngineComponent";
export class DebugTabComponent extends PaneComponent {
    private _physicsViewersEnabled;
    private _namesViewerEnabled;
    constructor(props: IPaneComponentProps);
    switchPhysicsViewers(): void;
    switchNameViewerAsync(): Promise<void>;
    render(): import("react/jsx-runtime").JSX.Element | null;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/tools/gltfComponent" {
import * as React from "react";
import { Scene } from "babylonjs/scene";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IGLTFComponentProps {
    scene: Scene;
    globalState: GlobalState;
    lockObject: LockObject;
}
interface IGLTFComponentState {
    showGLTFLoaderOptions: boolean;
    showGLTFExtensionOptions: boolean;
}
export class GLTFComponent extends React.Component<IGLTFComponentProps, IGLTFComponentState> {
    private _onValidationResultsUpdatedObserver;
    constructor(props: IGLTFComponentProps);
    openValidationDetails(): void;
    prepareText(singularForm: string, count: number): string;
    componentDidMount(): void;
    componentWillUnmount(): void;
    renderValidation(): import("react/jsx-runtime").JSX.Element | null;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/variantsPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IVariantsPropertyGridComponentProps {
    globalState: GlobalState;
    host: any;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class VariantsPropertyGridComponent extends React.Component<IVariantsPropertyGridComponentProps> {
    constructor(props: IVariantsPropertyGridComponentProps);
    private _getVariantsExtension;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/scenePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Vector3 } from "babylonjs/Maths/math.vector";
import { Scene } from "babylonjs/scene";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs/Physics/physicsEngineComponent";
import "babylonjs/Physics/v1/physicsEngineComponent";
import "babylonjs/Physics/v1/physicsEngineComponent";
interface IScenePropertyGridComponentProps {
    globalState: GlobalState;
    scene: Scene;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    onSelectionChangedObservable?: Observable<any>;
}
export class ScenePropertyGridComponent extends React.Component<IScenePropertyGridComponentProps> {
    private _storedEnvironmentTexture;
    private _renderingModeGroupObservable;
    constructor(props: IScenePropertyGridComponentProps);
    setRenderingModes(point: boolean, wireframe: boolean): void;
    switchIBL(): void;
    updateEnvironmentTexture(file: File): void;
    updateGravity(newValue: Vector3): void;
    updateTimeStep(newValue: number): void;
    normalizeScene(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/renderGridPropertyGridComponent" {
import * as React from "react";
import { Scene } from "babylonjs/scene";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IRenderGridPropertyGridComponentProps {
    globalState: GlobalState;
    scene: Scene;
}
export class RenderGridPropertyGridComponent extends React.Component<IRenderGridPropertyGridComponentProps, {
    isEnabled: boolean;
}> {
    private _gridMesh;
    constructor(props: IRenderGridPropertyGridComponentProps);
    componentDidMount(): void;
    addOrRemoveGrid(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/parentPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Node } from "babylonjs/node";
interface IParentPropertyGridComponentProps {
    globalState: GlobalState;
    lockObject: LockObject;
    node: Node;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ParentPropertyGridComponent extends React.Component<IParentPropertyGridComponentProps> {
    constructor(props: IParentPropertyGridComponentProps);
    private _getNameForSortingAndDisplay;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/fogPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Scene } from "babylonjs/scene";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IFogPropertyGridComponentProps {
    globalState: GlobalState;
    scene: Scene;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class FogPropertyGridComponent extends React.Component<IFogPropertyGridComponentProps, {
    mode: number;
}> {
    constructor(props: IFogPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/emptyPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IEmptyPropertyGridComponentProps {
    globalState: GlobalState;
    item: {
        inspectableCustomProperties: any;
    };
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class EmptyPropertyGridComponent extends React.Component<IEmptyPropertyGridComponentProps> {
    constructor(props: IEmptyPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/customPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { IInspectable } from "babylonjs/Misc/iInspectable";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface ICustomPropertyGridComponentProps {
    globalState: GlobalState;
    target: any;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CustomPropertyGridComponent extends React.Component<ICustomPropertyGridComponentProps, {
    mode: number;
}> {
    constructor(props: ICustomPropertyGridComponentProps);
    renderInspectable(inspectable: IInspectable): import("react/jsx-runtime").JSX.Element | null;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/commonPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICommonPropertyGridComponentProps {
    globalState: GlobalState;
    host: {
        metadata: any;
    };
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonPropertyGridComponent extends React.Component<ICommonPropertyGridComponentProps> {
    constructor(props: ICommonPropertyGridComponentProps);
    renderLevel(jsonObject: any): import("react/jsx-runtime").JSX.Element[];
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/sprites/spritePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Sprite } from "babylonjs/Sprites/sprite";
interface ISpritePropertyGridComponentProps {
    globalState: GlobalState;
    sprite: Sprite;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    onSelectionChangedObservable?: Observable<any>;
}
export class SpritePropertyGridComponent extends React.Component<ISpritePropertyGridComponentProps> {
    private _canvasRef;
    private _imageData;
    private _cachedCellIndex;
    constructor(props: ISpritePropertyGridComponentProps);
    onManagerLink(): void;
    switchPlayStopState(): void;
    disposeSprite(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    shouldComponentUpdate(nextProps: ISpritePropertyGridComponentProps): boolean;
    updatePreview(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/sprites/spriteManagerPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { SpriteManager } from "babylonjs/Sprites/spriteManager";
interface ISpriteManagerPropertyGridComponentProps {
    globalState: GlobalState;
    spriteManager: SpriteManager;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SpriteManagerPropertyGridComponent extends React.Component<ISpriteManagerPropertyGridComponentProps> {
    private _snippetUrl;
    constructor(props: ISpriteManagerPropertyGridComponentProps);
    addNewSprite(): void;
    disposeManager(): void;
    saveToFile(): void;
    loadFromFile(file: File): void;
    loadFromSnippet(): void;
    saveToSnippet(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/sounds/soundPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Sound } from "babylonjs/Audio/sound";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
interface ISoundPropertyGridComponentProps {
    globalState: GlobalState;
    sound: Sound;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SoundPropertyGridComponent extends React.Component<ISoundPropertyGridComponentProps> {
    constructor(props: ISoundPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/ssrRenderingPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { SSRRenderingPipeline } from "babylonjs/PostProcesses/RenderPipeline/Pipelines/ssrRenderingPipeline";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ISSRRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: SSRRenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SSRRenderingPipelinePropertyGridComponent extends React.Component<ISSRRenderingPipelinePropertyGridComponentProps> {
    constructor(props: ISSRRenderingPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/ssaoRenderingPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { SSAORenderingPipeline } from "babylonjs/PostProcesses/RenderPipeline/Pipelines/ssaoRenderingPipeline";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ISSAORenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: SSAORenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SSAORenderingPipelinePropertyGridComponent extends React.Component<ISSAORenderingPipelinePropertyGridComponentProps> {
    constructor(props: ISSAORenderingPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/ssao2RenderingPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { SSAO2RenderingPipeline } from "babylonjs/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ISSAO2RenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: SSAO2RenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SSAO2RenderingPipelinePropertyGridComponent extends React.Component<ISSAO2RenderingPipelinePropertyGridComponentProps> {
    constructor(props: ISSAO2RenderingPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/renderingPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PostProcessRenderPipeline } from "babylonjs/PostProcesses/RenderPipeline/postProcessRenderPipeline";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: PostProcessRenderPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class RenderingPipelinePropertyGridComponent extends React.Component<IRenderingPipelinePropertyGridComponentProps> {
    constructor(props: IRenderingPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/postProcessPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PostProcess } from "babylonjs/PostProcesses/postProcess";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IPostProcessPropertyGridComponentProps {
    globalState: GlobalState;
    postProcess: PostProcess;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class PostProcessPropertyGridComponent extends React.Component<IPostProcessPropertyGridComponentProps> {
    constructor(props: IPostProcessPropertyGridComponentProps);
    edit(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/lensRenderingPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { LensRenderingPipeline } from "babylonjs/PostProcesses/RenderPipeline/Pipelines/lensRenderingPipeline";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ILenstRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: LensRenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class LensRenderingPipelinePropertyGridComponent extends React.Component<ILenstRenderingPipelinePropertyGridComponentProps> {
    constructor(props: ILenstRenderingPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/iblShadowsRenderPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { IblShadowsRenderPipeline } from "babylonjs/Rendering/IBLShadows/iblShadowsRenderPipeline";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IIblShadowsRenderPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: IblShadowsRenderPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class IblShadowsRenderPipelinePropertyGridComponent extends React.Component<IIblShadowsRenderPipelinePropertyGridComponentProps> {
    constructor(props: IIblShadowsRenderPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/defaultRenderingPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { DefaultRenderingPipeline } from "babylonjs/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IDefaultRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: DefaultRenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class DefaultRenderingPipelinePropertyGridComponent extends React.Component<IDefaultRenderingPipelinePropertyGridComponentProps> {
    constructor(props: IDefaultRenderingPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/commonRenderingPipelinePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { PostProcessRenderPipeline } from "babylonjs/PostProcesses/RenderPipeline/postProcessRenderPipeline";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICommonRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: PostProcessRenderPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonRenderingPipelinePropertyGridComponent extends React.Component<ICommonRenderingPipelinePropertyGridComponentProps> {
    constructor(props: ICommonRenderingPipelinePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/postProcesses/commonPostProcessPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { PostProcess } from "babylonjs/PostProcesses/postProcess";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICommonPostProcessPropertyGridComponentProps {
    globalState: GlobalState;
    postProcess: PostProcess;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonPostProcessPropertyGridComponent extends React.Component<ICommonPostProcessPropertyGridComponentProps> {
    constructor(props: ICommonPostProcessPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/valueGradientGridComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { IValueGradient } from "babylonjs/Misc/gradients";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Nullable } from "babylonjs/types";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
export enum GradientGridMode {
    Factor = 0,
    Color3 = 1,
    Color4 = 2
}
interface IValueGradientGridComponent {
    globalState: GlobalState;
    label: string;
    gradients: Nullable<Array<IValueGradient>>;
    lockObject: LockObject;
    docLink?: string;
    mode: GradientGridMode;
    host: IParticleSystem;
    codeRecorderPropertyName: string;
    onCreateRequired: () => void;
    onRemoveRequired: (step: IValueGradient) => void;
}
export class ValueGradientGridComponent extends React.Component<IValueGradientGridComponent> {
    constructor(props: IValueGradientGridComponent);
    deleteStep(step: IValueGradient): void;
    addNewStep(): void;
    checkForReOrder(): void;
    updateAndSync(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/sphereEmitterGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { SphereParticleEmitter } from "babylonjs/Particles/EmitterTypes/sphereParticleEmitter";
interface ISphereEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: SphereParticleEmitter;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SphereEmitterGridComponent extends React.Component<ISphereEmitterGridComponentProps> {
    constructor(props: ISphereEmitterGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/pointEmitterGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { PointParticleEmitter } from "babylonjs/Particles/EmitterTypes/pointParticleEmitter";
interface IPointEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: PointParticleEmitter;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class PointEmitterGridComponent extends React.Component<IPointEmitterGridComponentProps> {
    constructor(props: IPointEmitterGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/particleSystemPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
interface IParticleSystemPropertyGridComponentProps {
    globalState: GlobalState;
    system: IParticleSystem;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ParticleSystemPropertyGridComponent extends React.Component<IParticleSystemPropertyGridComponentProps> {
    private _snippetUrl;
    constructor(props: IParticleSystemPropertyGridComponentProps);
    renderEmitter(): import("react/jsx-runtime").JSX.Element | null;
    raiseOnPropertyChanged(property: string, newValue: any, previousValue: any): void;
    renderControls(): import("react/jsx-runtime").JSX.Element;
    saveToFile(): void;
    loadFromFile(file: File): void;
    loadFromSnippet(): void;
    saveToSnippet(): void;
    updateTexture(file: File): void;
    viewAsync(): Promise<void>;
    edit(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/meshEmitterGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { MeshParticleEmitter } from "babylonjs/Particles/EmitterTypes/meshParticleEmitter";
import { Scene } from "babylonjs/scene";
interface IMeshEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: MeshParticleEmitter;
    scene: Scene;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class MeshEmitterGridComponent extends React.Component<IMeshEmitterGridComponentProps> {
    constructor(props: IMeshEmitterGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/hemisphericEmitterGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { HemisphericParticleEmitter } from "babylonjs/Particles/EmitterTypes/hemisphericParticleEmitter";
interface IHemisphericEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: HemisphericParticleEmitter;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class HemisphericEmitterGridComponent extends React.Component<IHemisphericEmitterGridComponentProps> {
    constructor(props: IHemisphericEmitterGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/factorGradientStepGridComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { FactorGradient } from "babylonjs/Misc/gradients";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
interface IFactorGradientStepGridComponent {
    globalState: GlobalState;
    gradient: FactorGradient;
    lockObject: LockObject;
    lineIndex: number;
    onDelete: () => void;
    onUpdateGradient: () => void;
    onCheckForReOrder: () => void;
    host: IParticleSystem;
    codeRecorderPropertyName: string;
}
export class FactorGradientStepGridComponent extends React.Component<IFactorGradientStepGridComponent, {
    gradient: number;
    factor1: string;
    factor2?: string;
}> {
    constructor(props: IFactorGradientStepGridComponent);
    shouldComponentUpdate(nextProps: IFactorGradientStepGridComponent, nextState: {
        gradient: number;
        factor1: string;
        factor2?: string;
    }): boolean;
    updateFactor1(valueString: string): void;
    updateFactor2(valueString: string): void;
    updateGradient(gradient: number): void;
    onPointerUp(): void;
    lock(): void;
    unlock(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/cylinderEmitterGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { CylinderParticleEmitter } from "babylonjs/Particles/EmitterTypes/cylinderParticleEmitter";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface ICylinderEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: CylinderParticleEmitter;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CylinderEmitterGridComponent extends React.Component<ICylinderEmitterGridComponentProps> {
    constructor(props: ICylinderEmitterGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/coneEmitterGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { ConeParticleEmitter } from "babylonjs/Particles/EmitterTypes/coneParticleEmitter";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IConeEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: ConeParticleEmitter;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ConeEmitterGridComponent extends React.Component<IConeEmitterGridComponentProps> {
    constructor(props: IConeEmitterGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/colorGradientStepGridComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { ColorGradient, Color3Gradient } from "babylonjs/Misc/gradients";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
interface IColorGradientStepGridComponent {
    globalState: GlobalState;
    gradient: ColorGradient | Color3Gradient;
    lockObject: LockObject;
    lineIndex: number;
    isColor3: boolean;
    onDelete: () => void;
    onUpdateGradient: () => void;
    onCheckForReOrder: () => void;
    host: IParticleSystem;
    codeRecorderPropertyName: string;
}
export class ColorGradientStepGridComponent extends React.Component<IColorGradientStepGridComponent, {
    gradient: number;
}> {
    constructor(props: IColorGradientStepGridComponent);
    updateColor1(color: string): void;
    updateColor2(color: string): void;
    updateGradient(gradient: number): void;
    onPointerUp(): void;
    lock(): void;
    unlock(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/boxEmitterGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { BoxParticleEmitter } from "babylonjs/Particles/EmitterTypes/boxParticleEmitter";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IBoxEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: BoxParticleEmitter;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    lockObject: LockObject;
}
export class BoxEmitterGridComponent extends React.Component<IBoxEmitterGridComponentProps> {
    constructor(props: IBoxEmitterGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/attractorsGridComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { ParticleSystem } from "babylonjs/Particles/particleSystem";
import { Attractor } from "babylonjs/Particles/attractor";
import { Color3 } from "babylonjs/Maths/math.color";
interface IAttractorsGridComponent {
    globalState: GlobalState;
    lockObject: LockObject;
    docLink?: string;
    host: ParticleSystem;
}
export class AttractorsGridComponent extends React.Component<IAttractorsGridComponent, {
    impostorScale: number;
    color: Color3;
}> {
    private _impostorMaterial;
    private _gizmoManager;
    private _sceneOnAfterRenderObserver;
    private _fontAsset;
    constructor(props: IAttractorsGridComponent);
    addNewAttractor(): void;
    updateImpostorScale(value: number): void;
    removeImpostor(attractor: Attractor): void;
    addImpostor(attractor: Attractor, index: number): void;
    addLabelAsync(attractor: Attractor, index: number): Promise<void>;
    controlImpostor(attractor: Attractor, index: number): void;
    shouldComponentUpdate(nextProps: Readonly<IAttractorsGridComponent>, nextState: Readonly<{
        impostorScale: number;
        color: Color3;
    }>, nextContext: any): boolean;
    componentWillUnmount(): void;
    cleanup(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/particleSystems/attractorGridComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
import { Attractor } from "babylonjs/Particles/attractor";
interface IAttractorGridComponent {
    globalState: GlobalState;
    attractor: Attractor;
    lockObject: LockObject;
    lineIndex: number;
    host: IParticleSystem;
    codeRecorderPropertyName: string;
    onDelete: (attractor: Attractor) => void;
    removeImpostor: (attractor: Attractor) => void;
    addImpostor: (attractor: Attractor, index: number) => void;
    onControl: (attractor: Attractor, index: number) => void;
    isControlled: (attractor: Attractor) => boolean;
}
export class AttractorGridComponent extends React.Component<IAttractorGridComponent, {
    strength: number;
}> {
    constructor(props: IAttractorGridComponent);
    lock(): void;
    unlock(): void;
    updateStrength(strength: number): void;
    onView(): void;
    onControl(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/metadata/metadataPropertyGridComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/metadata/metadataPropertyGrid.scss";
interface IMetadataComponentProps {
    globalState: GlobalState;
    entity: any;
}
enum MetadataTypes {
    UNDEFINED = "undefined",
    NULL = "null",
    STRING = "string",
    OBJECT = "Object",
    JSON = "JSON"
}
/** Metadata Grid Component */
export class MetadataGridComponent extends React.Component<IMetadataComponentProps, {
    selectedEntityMetadata: string;
    dirty: boolean;
    prettyJson: boolean;
    preventObjCorruption: boolean;
    metadataPropType: MetadataTypes;
    statusMessage: string | null;
    isValidJson: boolean;
}> {
    private readonly _textAreaHost;
    /**
     * @param props - component props
     */
    constructor(props: IMetadataComponentProps);
    /** @ignorenaming */
    componentDidMount(): void;
    /**
     * @param prevProps - previous component props
     */
    componentDidUpdate(prevProps: Readonly<IMetadataComponentProps>): void;
    /** on entity refresh */
    refreshSelected(): void;
    /**
     * @param disabled - is disabled
     */
    setTextAreaDisabled(disabled: boolean): void;
    /**
     * @returns class name
     */
    getClassName(): string;
    /**
     * Determines the Metadata type
     * @param entity Picked entity
     * @returns MetadataTypes
     */
    getEntityType(entity: any): MetadataTypes;
    /**
     * @param input - any input
     * @returns is string
     */
    isString(input: any): boolean;
    /**
     * @param object - any object
     * @returns is parsable
     */
    parsableJson(object: object): boolean;
    /**
     * @param string - any string
     * @returns parsable string
     */
    parsableString(string: string): JSON | null;
    /**
     * @param validJson - a valid json
     * @param metadata - any metadata
     * @returns parsed metadata
     */
    parseMetaObject(validJson: boolean, metadata: any): any;
    /**
     * Recurse through an object to check for any Functions, returns False if found at least one
     * @param o Any Object, String or number
     * @returns Boolean
     */
    objectCanSafelyStringify(o: object | string | number | boolean): boolean;
    copyToClipboard(): void;
    /** Safely checks if valid JSON then appends necessary props without overwriting existing */
    populateGltfExtras(): void;
    /** render
     * @returns the component
     */
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/meshes/transformNodePropertyGridComponent" {
import * as React from "react";
import { TransformNode } from "babylonjs/Meshes/transformNode";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ITransformNodePropertyGridComponentProps {
    globalState: GlobalState;
    transformNode: TransformNode;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class TransformNodePropertyGridComponent extends React.Component<ITransformNodePropertyGridComponentProps> {
    constructor(props: ITransformNodePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/meshes/skeletonPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Skeleton } from "babylonjs/Bones/skeleton";
interface ISkeletonPropertyGridComponentProps {
    globalState: GlobalState;
    skeleton: Skeleton;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SkeletonPropertyGridComponent extends React.Component<ISkeletonPropertyGridComponentProps> {
    private _skeletonViewersEnabled;
    private _skeletonViewerDisplayOptions;
    private _skeletonViewers;
    constructor(props: ISkeletonPropertyGridComponentProps);
    switchSkeletonViewers(): void;
    checkSkeletonViewerState(props: ISkeletonPropertyGridComponentProps): void;
    changeDisplayMode(): void;
    changeDisplayOptions(option: string, value: number): void;
    shouldComponentUpdate(nextProps: ISkeletonPropertyGridComponentProps): boolean;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/meshes/meshPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Mesh } from "babylonjs/Meshes/mesh";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs/Physics/physicsEngineComponent";
import "babylonjs/Physics/v1/physicsEngineComponent";
interface IMeshPropertyGridComponentProps {
    globalState: GlobalState;
    mesh: Mesh;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class MeshPropertyGridComponent extends React.Component<IMeshPropertyGridComponentProps, {
    displayNormals: boolean;
    displayVertexColors: boolean;
    displayBoneWeights: boolean;
    displayBoneIndex: number;
    displaySkeletonMap: boolean;
}> {
    constructor(props: IMeshPropertyGridComponentProps);
    renderWireframeOver(): void;
    renderNormalVectors(): void;
    displayNormals(): void;
    displayVertexColors(): void;
    displayBoneWeights(): void;
    displaySkeletonMap(): void;
    onBoneDisplayIndexChange(value: number): void;
    onMaterialLink(): void;
    onSourceMeshLink(): void;
    onSkeletonLink(): void;
    convertPhysicsTypeToString(): string;
    private _getIdForDisplay;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/meshes/bonePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Bone } from "babylonjs/Bones/bone";
interface IBonePropertyGridComponentProps {
    globalState: GlobalState;
    bone: Bone;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class BonePropertyGridComponent extends React.Component<IBonePropertyGridComponentProps> {
    constructor(props: IBonePropertyGridComponentProps);
    onTransformNodeLink(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/meshes/physics/physicsMaterialGridComponent" {
import { Observable } from "babylonjs/Misc/observable";
import { PhysicsBody } from "babylonjs/Physics/v2/physicsBody";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
/**
 * Properties of the physics material grid component.
 */
export interface IPhysicsMaterialGridComponentProps {
    /**
     * Lock object
     */
    lockObject: LockObject;
    /**
     * Callback raised on the property changed event
     */
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    /**
     * Physics body to edit
     */
    body: PhysicsBody;
    /**
     * Global state
     */
    globalState: GlobalState;
}
/**
 * Component that displays the physic material properties of a physics body.
 * @param props the component props
 * @returns the component
 */
export function PhysicsMaterialGridComponent(props: IPhysicsMaterialGridComponentProps): import("react/jsx-runtime").JSX.Element;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/meshes/physics/physicsMassPropertiesGridComponent" {
import { Observable } from "babylonjs/Misc/observable";
import { PhysicsBody } from "babylonjs/Physics/v2/physicsBody";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
/**
 * Properties of the physics mass properties grid component.
 */
export interface IPhysicsMassPropertiesGridComponentProps {
    /**
     * Lock object
     */
    lockObject: LockObject;
    /**
     * Callback raised on the property changed event
     */
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    /**
     * Physics body to edit
     */
    body: PhysicsBody;
    /**
     * Global state
     */
    globalState: GlobalState;
    /**
     * Index of the instance to edit
     */
    instanceIndex?: number;
}
/**
 * Component that displays the mass properties of a physics body.
 * @param props the component props
 * @returns the component
 */
export function PhysicsMassPropertiesGridComponent(props: IPhysicsMassPropertiesGridComponentProps): import("react/jsx-runtime").JSX.Element;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/meshes/physics/physicsBodyGridComponent" {
import { Observable } from "babylonjs/Misc/observable";
import { PhysicsBody } from "babylonjs/Physics/v2/physicsBody";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
/**
 * Properties of the physics body grid component.
 */
export interface IPhysicsBodyGridComponentProps {
    /**
     * Lock object
     */
    lockObject: LockObject;
    /**
     * Callback raised on the property changed event
     */
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    /**
     * Physics body to edit
     */
    body: PhysicsBody;
    /**
     * Global state
     */
    globalState: GlobalState;
}
/**
 * Component that allows displaying and tweaking a physics body's properties.
 * @param props the component props
 * @returns the component
 */
export function PhysicsBodyGridComponent(props: IPhysicsBodyGridComponentProps): import("react/jsx-runtime").JSX.Element;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/texturePropertyGridComponent" {
import * as React from "react";
import { Nullable } from "babylonjs/types";
import { Observable } from "babylonjs/Misc/observable";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ITexturePropertyGridComponentProps {
    texture: BaseTexture;
    lockObject: LockObject;
    globalState: GlobalState;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
interface ITexturePropertyGridComponentState {
    isTextureEditorOpen: boolean;
    textureEditing: Nullable<BaseTexture>;
}
/**
 *
 */
export class TexturePropertyGridComponent extends React.Component<ITexturePropertyGridComponentProps, ITexturePropertyGridComponentState> {
    private _adtInstrumentation;
    private _popoutWindowRef;
    private _textureLineRef;
    private _textureInspectorSize;
    constructor(props: ITexturePropertyGridComponentProps);
    componentWillUnmount(): void;
    updateTexture(file: File): void;
    openTextureEditor(): void;
    onOpenTextureEditor(): void;
    onCloseTextureEditor(callback?: {
        (): void;
    }): void;
    forceRefresh(): void;
    findTextureFormat(format: number): {
        label: string;
        normalizable: number;
        value: number;
        hideType?: undefined;
        compressed?: undefined;
    } | {
        label: string;
        normalizable: number;
        hideType: boolean;
        value: number;
        compressed?: undefined;
    } | {
        label: string;
        normalizable: number;
        compressed: boolean;
        value: number;
        hideType?: undefined;
    } | null;
    findTextureType(type: number): {
        label: string;
        normalizable: number;
        value: number;
    } | null;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/standardMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { StandardMaterial } from "babylonjs/Materials/standardMaterial";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs/Materials/material.decalMap";
interface IStandardMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: StandardMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class StandardMaterialPropertyGridComponent extends React.Component<IStandardMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable;
    constructor(props: IStandardMaterialPropertyGridComponentProps);
    renderTextures(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/skyMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { SkyMaterial } from "babylonjs-materials/sky/skyMaterial";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ISkyMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: SkyMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
/**
 * Property grid component for the SkyMaterial
 */
export class SkyMaterialPropertyGridComponent extends React.Component<ISkyMaterialPropertyGridComponentProps> {
    constructor(props: ISkyMaterialPropertyGridComponentProps);
    renderSky(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/pbrSpecularGlossinessMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PBRSpecularGlossinessMaterial } from "babylonjs/Materials/PBR/pbrSpecularGlossinessMaterial";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IPBRSpecularGlossinessMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: PBRSpecularGlossinessMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class PBRSpecularGlossinessMaterialPropertyGridComponent extends React.Component<IPBRSpecularGlossinessMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable;
    constructor(props: IPBRSpecularGlossinessMaterialPropertyGridComponentProps);
    renderTextures(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/pbrMetallicRoughnessMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PBRMetallicRoughnessMaterial } from "babylonjs/Materials/PBR/pbrMetallicRoughnessMaterial";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IPBRMetallicRoughnessMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: PBRMetallicRoughnessMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class PBRMetallicRoughnessMaterialPropertyGridComponent extends React.Component<IPBRMetallicRoughnessMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable;
    constructor(props: IPBRMetallicRoughnessMaterialPropertyGridComponentProps);
    renderTextures(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/pbrMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PBRMaterial } from "babylonjs/Materials/PBR/pbrMaterial";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { TextureLinkLineComponent } from "babylonjs-inspector/components/actionTabs/lines/textureLinkLineComponent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs/Materials/material.decalMap";
import "babylonjs/Rendering/prePassRendererSceneComponent";
import "babylonjs/Rendering/subSurfaceSceneComponent";
interface IPBRMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: PBRMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
/**
 * @internal
 */
export class PBRMaterialPropertyGridComponent extends React.Component<IPBRMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable;
    constructor(props: IPBRMaterialPropertyGridComponentProps);
    switchAmbientMode(state: boolean): void;
    renderTextures(onDebugSelectionChangeObservable: Observable<TextureLinkLineComponent>): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/openpbrMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { TextureLinkLineComponent } from "babylonjs-inspector/components/actionTabs/lines/textureLinkLineComponent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import "babylonjs/Materials/material.decalMap";
import "babylonjs/Rendering/prePassRendererSceneComponent";
import "babylonjs/Rendering/subSurfaceSceneComponent";
import { OpenPBRMaterial } from "babylonjs/Materials/PBR/openpbrMaterial";
interface IOpenPBRMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: OpenPBRMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
/**
 * @internal
 */
export class OpenPBRMaterialPropertyGridComponent extends React.Component<IOpenPBRMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable;
    constructor(props: IOpenPBRMaterialPropertyGridComponentProps);
    switchAmbientMode(state: boolean): void;
    renderTextures(onDebugSelectionChangeObservable: Observable<TextureLinkLineComponent>): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/nodeMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { NodeMaterial } from "babylonjs/Materials/Node/nodeMaterial";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { InputBlock } from "babylonjs/Materials/Node/Blocks/Input/inputBlock";
interface INodeMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: NodeMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class NodeMaterialPropertyGridComponent extends React.Component<INodeMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable;
    constructor(props: INodeMaterialPropertyGridComponentProps);
    edit(): void;
    renderTextures(): import("react/jsx-runtime").JSX.Element | null;
    renderInputBlock(block: InputBlock): import("react/jsx-runtime").JSX.Element | null;
    renderInputValues(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/multiMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Material } from "babylonjs/Materials/material";
import { MultiMaterial } from "babylonjs/Materials/multiMaterial";
interface IMultiMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: MultiMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class MultiMaterialPropertyGridComponent extends React.Component<IMultiMaterialPropertyGridComponentProps> {
    constructor(props: IMultiMaterialPropertyGridComponentProps);
    onMaterialLink(mat: Material): void;
    renderChildMaterial(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/materialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Material } from "babylonjs/Materials/material";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: Material;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class MaterialPropertyGridComponent extends React.Component<IMaterialPropertyGridComponentProps> {
    constructor(props: IMaterialPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/commonMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Material } from "babylonjs/Materials/material";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICommonMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: Material;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonMaterialPropertyGridComponent extends React.Component<ICommonMaterialPropertyGridComponentProps> {
    constructor(props: ICommonMaterialPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/backgroundMaterialPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { BackgroundMaterial } from "babylonjs/Materials/Background/backgroundMaterial";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IBackgroundMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: BackgroundMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class BackgroundMaterialPropertyGridComponent extends React.Component<IBackgroundMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable;
    constructor(props: IBackgroundMaterialPropertyGridComponentProps);
    renderTextures(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/toolSettings" {
import * as React from "react";
import { ITool } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/toolBar";
interface IToolSettingsProps {
    tool: ITool | undefined;
}
export class ToolSettings extends React.Component<IToolSettingsProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/toolBar" {
import * as React from "react";
import { IToolData, IToolType, IMetadata } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent";
import { Color4 } from "babylonjs/Maths/math.color";
export interface ITool extends IToolData {
    instance: IToolType;
}
interface IToolBarProps {
    tools: ITool[];
    addTool(url: string): void;
    changeTool(toolIndex: number): void;
    activeToolIndex: number;
    metadata: IMetadata;
    setMetadata(data: any): void;
    pickerOpen: boolean;
    setPickerOpen(open: boolean): void;
    pickerRef: React.RefObject<HTMLDivElement>;
    hasAlpha: boolean;
}
interface IToolBarState {
    toolURL: string;
    addOpen: boolean;
}
export class ToolBar extends React.Component<IToolBarProps, IToolBarState> {
    private _lockObject;
    constructor(props: IToolBarProps);
    computeRGBAColor(): Color4;
    shouldComponentUpdate(nextProps: IToolBarProps): boolean;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent" {
import * as React from "react";
import { IPixelData } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureCanvasManager";
import { ITool } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/toolBar";
import { IChannel } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/channelsBar";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { Scene } from "babylonjs/scene";
import { ISize } from "babylonjs/Maths/math.size";
import { Vector2 } from "babylonjs/Maths/math.vector";
import { PointerInfo } from "babylonjs/Events/pointerEvents";
import { PopupComponent } from "babylonjs-inspector/components/popupComponent";
import "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditor.scss";
interface ITextureEditorComponentProps {
    texture: BaseTexture;
    url: string;
    window: React.RefObject<PopupComponent>;
    onUpdate: () => void;
}
interface ITextureEditorComponentState {
    tools: ITool[];
    activeToolIndex: number;
    metadata: IMetadata;
    channels: IChannel[];
    pixelData: IPixelData;
    face: number;
    mipLevel: number;
    pickerOpen: boolean;
}
export interface IToolParameters {
    /** The visible scene in the editor. Useful for adding pointer and keyboard events. */
    scene: Scene;
    /** The 2D canvas which you can sample pixel data from. Tools should not paint directly on this canvas. */
    canvas2D: HTMLCanvasElement;
    /** The 3D scene which tools can add post processes to. */
    scene3D: Scene;
    /** The size of the texture. */
    size: ISize;
    /** Pushes the editor texture back to the original scene. This should be called every time a tool makes any modification to a texture. */
    updateTexture: () => void;
    /** The metadata object which is shared between all tools. Feel free to store any information here. Do not set this directly: instead call setMetadata. */
    metadata: IMetadata;
    /** Call this when you want to mutate the metadata. */
    setMetadata: (data: any) => void;
    /** Returns the texture coordinates under the cursor */
    getMouseCoordinates: (pointerInfo: PointerInfo) => Vector2;
    /** Provides a canvas that you can use the canvas API to paint on. */
    startPainting: () => Promise<CanvasRenderingContext2D>;
    /** After you have painted on your canvas, call this method to push the updates back to the texture. */
    updatePainting: () => void;
    /** Call this when you are finished painting. */
    stopPainting: () => void;
    /** Returns whether the tool should be allowed to interact */
    interactionEnabled: () => boolean;
}
export interface IToolGUIProps {
    instance: IToolType;
}
/** An interface representing the definition of a tool */
export interface IToolData {
    /** Name to display on the toolbar */
    name: string;
    /** A class definition for the tool including setup and cleanup methods */
    type: IToolConstructable;
    /**  An SVG icon encoded in Base64 */
    icon: string;
    /** Whether the tool uses postprocesses */
    is3D?: boolean;
    cursor?: string;
    settingsComponent?: React.ComponentType<IToolGUIProps>;
}
export interface IToolType {
    /** Called when the tool is selected. */
    setup: () => void;
    /** Called when the tool is deselected. */
    cleanup: () => void;
    /** Optional. Called when the user resets the texture or uploads a new texture. Tools may want to reset their state when this happens. */
    onReset?: () => void;
}
/** For constructable types, TS requires that you define a separate interface which constructs your actual interface */
interface IToolConstructable {
    new (getParameters: () => IToolParameters): IToolType;
}
export interface IMetadata {
    color: string;
    alpha: number;
    select: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    [key: string]: any;
}
export class TextureEditorComponent extends React.Component<ITextureEditorComponentProps, ITextureEditorComponentState> {
    private _textureCanvasManager;
    private _uiCanvas;
    private _2DCanvas;
    private _3DCanvas;
    private _pickerRef;
    private _timer;
    private static _PREVIEW_UPDATE_DELAY_MS;
    constructor(props: ITextureEditorComponentProps);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    textureDidUpdate(): void;
    loadToolFromURL(url: string): void;
    addTools(tools: IToolData[]): void;
    getToolParameters(): IToolParameters;
    changeTool(index: number): void;
    setMetadata(newMetadata: any): void;
    setPickerOpen(open: boolean): void;
    onPointerDown(evt: React.PointerEvent): void;
    saveTexture(): void;
    resetTexture(): void;
    resizeTexture(width: number, height: number): void;
    uploadTexture(file: File): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureCanvasManager" {
import { Scene } from "babylonjs/scene";
import { Vector2 } from "babylonjs/Maths/math.vector";
import { Nullable } from "babylonjs/types";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { ISize } from "babylonjs/Maths/math.size";
import { PointerInfo } from "babylonjs/Events/pointerEvents";
import { ITool } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/toolBar";
import { IChannel } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/channelsBar";
import { IMetadata } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent";
export interface IPixelData {
    x?: number;
    y?: number;
    r?: number;
    g?: number;
    b?: number;
    a?: number;
}
export class TextureCanvasManager {
    private _engine;
    private _scene;
    private _camera;
    private _cameraPos;
    private _scale;
    private _isPanning;
    private _mouseX;
    private _mouseY;
    private _uiCanvas;
    private _size;
    /** The canvas we paint onto using the canvas API */
    private _2DCanvas;
    /** The canvas we apply post processes to */
    private _3DCanvas;
    /** The canvas which handles channel filtering */
    private _channelsTexture;
    private _3DEngine;
    private _3DPlane;
    private _3DCanvasTexture;
    private _3DScene;
    private _channels;
    private _face;
    private _mipLevel;
    /** The texture from the original engine that we invoked the editor on */
    private _originalTexture;
    /** This is a hidden texture which is only responsible for holding the actual texture memory in the original engine */
    private _target;
    private _originalTextureProperties;
    /** Keeps track of whether we have modified the texture */
    private _didEdit;
    private _plane;
    private _planeMaterial;
    /** Tracks which keys are currently pressed */
    private _keyMap;
    /** Tracks which mouse buttons are currently pressed */
    private _buttonsPressed;
    private readonly ZOOM_MOUSE_SPEED;
    private readonly ZOOM_KEYBOARD_SPEED;
    private readonly ZOOM_IN_KEY;
    private readonly ZOOM_OUT_KEY;
    private readonly PAN_SPEED;
    private readonly PAN_KEY;
    private readonly MIN_SCALE;
    private readonly GRID_SCALE;
    private readonly MAX_SCALE;
    private readonly SELECT_ALL_KEY;
    private readonly SAVE_KEY;
    private readonly RESET_KEY;
    private readonly DESELECT_KEY;
    /** The number of milliseconds between texture updates */
    private readonly PUSH_FREQUENCY;
    private _tool;
    private _setPixelData;
    private _setMipLevel;
    private _window;
    private _metadata;
    private _editing3D;
    private _onUpdate;
    private _setMetadata;
    private _imageData;
    private _canPush;
    private _shouldPush;
    private _paintCanvas;
    constructor(texture: BaseTexture, window: Window, canvasUI: HTMLCanvasElement, canvas2D: HTMLCanvasElement, canvas3D: HTMLCanvasElement, setPixelData: (pixelData: IPixelData) => void, metadata: IMetadata, onUpdate: () => void, setMetadata: (metadata: any) => void, setMipLevel: (level: number) => void);
    updateTexture(): Promise<void>;
    private pushTexture;
    startPainting(): Promise<CanvasRenderingContext2D>;
    updatePainting(): void;
    stopPainting(): void;
    private updateDisplay;
    set channels(channels: IChannel[]);
    paintPixelsOnCanvas(pixelData: Uint8Array, canvas: HTMLCanvasElement): void;
    grabOriginalTexture(): Promise<Uint8Array<ArrayBufferLike>>;
    getMouseCoordinates(pointerInfo: PointerInfo): Vector2;
    get scene(): Scene;
    get canvas2D(): HTMLCanvasElement;
    get size(): ISize;
    set tool(tool: Nullable<ITool>);
    get tool(): Nullable<ITool>;
    set face(face: number);
    set mipLevel(mipLevel: number);
    /** Returns the 3D scene used for postprocesses */
    get scene3D(): Scene;
    set metadata(metadata: IMetadata);
    private makePlane;
    reset(): void;
    resize(newSize: ISize): Promise<void>;
    setSize(size: ISize): void;
    upload(file: File): void;
    saveTexture(): void;
    toolInteractionEnabled(): boolean;
    dispose(): void;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureCanvasComponent" {
import * as React from "react";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
interface ITextureCanvasComponentProps {
    canvasUI: React.RefObject<HTMLCanvasElement>;
    canvas2D: React.RefObject<HTMLCanvasElement>;
    canvas3D: React.RefObject<HTMLCanvasElement>;
    texture: BaseTexture;
}
export class TextureCanvasComponent extends React.Component<ITextureCanvasComponentProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/propertiesBar" {
import * as React from "react";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { IPixelData } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureCanvasManager";
import { ISize } from "babylonjs/Maths/math.size";
interface IPropertiesBarProps {
    texture: BaseTexture;
    size: ISize;
    saveTexture(): void;
    pixelData: IPixelData;
    face: number;
    setFace(face: number): void;
    resetTexture(): void;
    resizeTexture(width: number, height: number): void;
    uploadTexture(file: File): void;
    mipLevel: number;
    setMipLevel: (mipLevel: number) => void;
}
interface IPropertiesBarState {
    width: number;
    height: number;
}
export class PropertiesBar extends React.PureComponent<IPropertiesBarProps, IPropertiesBarState> {
    private _faces;
    constructor(props: IPropertiesBarProps);
    private _pixelData;
    private _getNewDimension;
    componentWillUpdate(nextProps: IPropertiesBarProps): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/channelsBar" {
import * as React from "react";
export interface IChannel {
    visible: boolean;
    editable: boolean;
    name: string;
    id: "R" | "G" | "B" | "A";
    icon: any;
}
interface IChannelsBarProps {
    channels: IChannel[];
    setChannels(channelState: IChannel[]): void;
}
export class ChannelsBar extends React.PureComponent<IChannelsBarProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/canvasShader" {
export const canvasShader: {
    path: {
        vertexSource: string;
        fragmentSource: string;
    };
    options: {
        attributes: string[];
        uniforms: string[];
    };
};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/bottomBar" {
import * as React from "react";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
interface IBottomBarProps {
    texture: BaseTexture;
    mipLevel: number;
}
export class BottomBar extends React.PureComponent<IBottomBarProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/defaultTools/rectangleSelect" {
import { IToolData } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent";
export const RectangleSelect: IToolData;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/defaultTools/paintbrush" {
import { IToolData } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent";
export const Paintbrush: IToolData;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/defaultTools/floodfill" {
import { IToolData } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent";
export const Floodfill: IToolData;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/defaultTools/eyedropper" {
import { IToolData } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent";
export const Eyedropper: IToolData;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/defaultTools/defaultTools" {
const _default: import("babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent").IToolData[];
export default _default;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/defaultTools/contrast" {
import { IToolData } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/materials/textures/textureEditorComponent";
export const Contrast: IToolData;

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/lights/spotLightPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { SpotLight } from "babylonjs/Lights/spotLight";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ISpotLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: SpotLight;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    onSelectionChangedObservable?: Observable<any>;
}
export class SpotLightPropertyGridComponent extends React.Component<ISpotLightPropertyGridComponentProps> {
    constructor(props: ISpotLightPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/lights/rectAreaLightPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { RectAreaLight } from "babylonjs/Lights/rectAreaLight";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IRectAreaLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: RectAreaLight;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    onSelectionChangedObservable?: Observable<any>;
}
export class RectAreaLightPropertyGridComponent extends React.Component<IRectAreaLightPropertyGridComponentProps> {
    constructor(props: IRectAreaLightPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/lights/pointLightPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PointLight } from "babylonjs/Lights/pointLight";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IPointLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: PointLight;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class PointLightPropertyGridComponent extends React.Component<IPointLightPropertyGridComponentProps> {
    constructor(props: IPointLightPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/lights/hemisphericLightPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { HemisphericLight } from "babylonjs/Lights/hemisphericLight";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IHemisphericLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: HemisphericLight;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class HemisphericLightPropertyGridComponent extends React.Component<IHemisphericLightPropertyGridComponentProps> {
    constructor(props: IHemisphericLightPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/lights/directionalLightPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { DirectionalLight } from "babylonjs/Lights/directionalLight";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IDirectionalLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: DirectionalLight;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class DirectionalLightPropertyGridComponent extends React.Component<IDirectionalLightPropertyGridComponentProps> {
    constructor(props: IDirectionalLightPropertyGridComponentProps);
    displayFrustum(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/lights/commonShadowLightPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { IShadowLight } from "babylonjs/Lights/shadowLight";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICommonShadowLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: IShadowLight;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonShadowLightPropertyGridComponent extends React.Component<ICommonShadowLightPropertyGridComponentProps> {
    private _internals;
    constructor(props: ICommonShadowLightPropertyGridComponentProps);
    createShadowGenerator(): void;
    disposeShadowGenerator(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/lights/commonLightPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Light } from "babylonjs/Lights/light";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICommonLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: Light;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonLightPropertyGridComponent extends React.Component<ICommonLightPropertyGridComponentProps> {
    constructor(props: ICommonLightPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/layers/layerPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { EffectLayer } from "babylonjs/Layers/effectLayer";
interface ILayerPropertyGridComponentProps {
    globalState: GlobalState;
    layer: EffectLayer;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class LayerPropertyGridComponent extends React.Component<ILayerPropertyGridComponentProps> {
    constructor(props: ILayerPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/frameGraphs/frameGraphPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { IExplorerExtensibilityGroup } from "babylonjs/Debug/debugLayer";
import { FrameGraph } from "babylonjs/FrameGraph/frameGraph";
interface IFrameGraphPropertyGridComponentProps {
    globalState: GlobalState;
    frameGraph: FrameGraph;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class FrameGraphPropertyGridComponent extends React.Component<IFrameGraphPropertyGridComponentProps> {
    constructor(props: IFrameGraphPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/cameras/freeCameraPropertyGridComponent" {
import * as React from "react";
import { FreeCamera } from "babylonjs/Cameras/freeCamera";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IFreeCameraPropertyGridComponentProps {
    globalState: GlobalState;
    camera: FreeCamera;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class FreeCameraPropertyGridComponent extends React.Component<IFreeCameraPropertyGridComponentProps> {
    constructor(props: IFreeCameraPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/cameras/followCameraPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { FollowCamera } from "babylonjs/Cameras/followCamera";
interface IFollowCameraPropertyGridComponentProps {
    globalState: GlobalState;
    camera: FollowCamera;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class FollowCameraPropertyGridComponent extends React.Component<IFollowCameraPropertyGridComponentProps> {
    constructor(props: IFollowCameraPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/cameras/commonCameraPropertyGridComponent" {
import * as React from "react";
import { Camera } from "babylonjs/Cameras/camera";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ICommonCameraPropertyGridComponentProps {
    globalState: GlobalState;
    camera: Camera;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonCameraPropertyGridComponent extends React.Component<ICommonCameraPropertyGridComponentProps, {
    mode: number;
}> {
    constructor(props: ICommonCameraPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/cameras/arcRotateCameraPropertyGridComponent" {
import * as React from "react";
import { ArcRotateCamera } from "babylonjs/Cameras/arcRotateCamera";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IArcRotateCameraPropertyGridComponentProps {
    globalState: GlobalState;
    camera: ArcRotateCamera;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ArcRotateCameraPropertyGridComponent extends React.Component<IArcRotateCameraPropertyGridComponentProps> {
    constructor(props: IArcRotateCameraPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/targetedAnimationPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { TargetedAnimation } from "babylonjs/Animations/animationGroup";
import { Scene } from "babylonjs/scene";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface ITargetedAnimationGridComponentProps {
    globalState: GlobalState;
    targetedAnimation: TargetedAnimation;
    scene: Scene;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class TargetedAnimationGridComponent extends React.Component<ITargetedAnimationGridComponentProps> {
    private _animationGroup;
    private _animationCurveEditorContext;
    constructor(props: ITargetedAnimationGridComponentProps);
    findAnimationGroup: () => void;
    playOrPause: () => void;
    deleteAnimation: () => void;
    updateContextFromProps: () => void;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<ITargetedAnimationGridComponentProps>, prevState: Readonly<{}>, snapshot?: any): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/animationPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Scene } from "babylonjs/scene";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { IAnimatable } from "babylonjs/Animations/animatable.interface";
interface IAnimationGridComponentProps {
    globalState: GlobalState;
    animatable: IAnimatable;
    scene: Scene;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class AnimationGridComponent extends React.Component<IAnimationGridComponentProps, {
    currentFrame: number;
}> {
    private _animations;
    private _ranges;
    private _mainAnimatable;
    private _onBeforeRenderObserver;
    private _isPlaying;
    private _timelineRef;
    private _animationCurveEditorContext;
    private _animationControl;
    constructor(props: IAnimationGridComponentProps);
    playOrPause(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    onCurrentFrameChange(value: number): void;
    onChangeFromOrTo(): void;
    componentDidUpdate(prevProps: IAnimationGridComponentProps): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/animationGroupPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { AnimationGroup } from "babylonjs/Animations/animationGroup";
import { Scene } from "babylonjs/scene";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { GlobalState } from "babylonjs-inspector/components/globalState";
interface IAnimationGroupGridComponentProps {
    globalState: GlobalState;
    animationGroup: AnimationGroup;
    scene: Scene;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class AnimationGroupGridComponent extends React.Component<IAnimationGroupGridComponentProps, {
    playButtonText: string;
    currentFrame: number;
}> {
    private _onAnimationGroupPlayObserver;
    private _onAnimationGroupPauseObserver;
    private _onBeforeRenderObserver;
    private _timelineRef;
    private _animationCurveEditorContext;
    constructor(props: IAnimationGroupGridComponentProps);
    componentDidMount(): void;
    disconnect(animationGroup: AnimationGroup): void;
    connect(animationGroup: AnimationGroup): void;
    updateCurrentFrame(animationGroup: AnimationGroup): void;
    shouldComponentUpdate(nextProps: IAnimationGroupGridComponentProps): boolean;
    componentWillUnmount(): void;
    playOrPause(): void;
    onCurrentFrameChange(value: number): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/topBarComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/scss/topBar.scss";
interface ITopBarComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface ITopBarComponentState {
    keyFrameValue: string;
    keyValue: string;
    frameControlEnabled: boolean;
    valueControlEnabled: boolean;
}
export class TopBarComponent extends React.Component<ITopBarComponentProps, ITopBarComponentState> {
    private _onFrameSetObserver;
    private _onValueSetObserver;
    private _onActiveAnimationChangedObserver;
    private _onActiveKeyPointChanged;
    constructor(props: ITopBarComponentProps);
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context" {
import { Nullable } from "babylonjs/types";
import { Animation } from "babylonjs/Animations/animation";
import { Observable } from "babylonjs/Misc/observable";
import { KeyPointComponent } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/keyPoint";
import { Scene } from "babylonjs/scene";
import { IAnimatable } from "babylonjs/Animations/animatable.interface";
import { AnimationGroup, TargetedAnimation } from "babylonjs/Animations/animationGroup";
import { AnimationKeyInterpolation } from "babylonjs/Animations/animationKey";
export interface IActiveAnimationChangedOptions {
    evaluateKeys?: boolean;
    frame?: boolean;
    range?: boolean;
}
export class Context {
    title: string;
    animations: Nullable<Animation[] | TargetedAnimation[]>;
    scene: Scene;
    target: Nullable<IAnimatable>;
    rootAnimationGroup: Nullable<AnimationGroup>;
    activeAnimations: Animation[];
    activeChannels: {
        [key: number]: string;
    };
    activeKeyPoints: Nullable<KeyPointComponent[]>;
    mainKeyPoint: Nullable<KeyPointComponent>;
    snippetId: string;
    useTargetAnimations: boolean;
    activeFrame: number;
    fromKey: number;
    toKey: number;
    useExistingPlayRange: boolean;
    forwardAnimation: boolean;
    isPlaying: boolean;
    clipLength: number;
    referenceMinFrame: number;
    referenceMaxFrame: number;
    focusedInput: boolean;
    onActiveAnimationChanged: Observable<IActiveAnimationChangedOptions>;
    onActiveKeyPointChanged: Observable<void>;
    onHostWindowResized: Observable<void>;
    onSelectAllKeys: Observable<void>;
    onActiveKeyFrameChanged: Observable<number>;
    onFrameSet: Observable<number>;
    onFrameManuallyEntered: Observable<number>;
    onMainKeyPointSet: Observable<void>;
    onMainKeyPointMoved: Observable<void>;
    onValueSet: Observable<number>;
    onValueManuallyEntered: Observable<number>;
    onFrameRequired: Observable<void>;
    onCreateOrUpdateKeyPointRequired: Observable<void>;
    onFlattenTangentRequired: Observable<void>;
    onLinearTangentRequired: Observable<void>;
    onBreakTangentRequired: Observable<void>;
    onUnifyTangentRequired: Observable<void>;
    onStepTangentRequired: Observable<void>;
    onDeleteAnimation: Observable<Animation>;
    onGraphMoved: Observable<number>;
    onGraphScaled: Observable<number>;
    onRangeUpdated: Observable<void>;
    onMoveToFrameRequired: Observable<number>;
    onAnimationStateChanged: Observable<void>;
    onDeleteKeyActiveKeyPoints: Observable<void>;
    onSelectionRectangleMoved: Observable<DOMRect>;
    onAnimationsLoaded: Observable<void>;
    onEditAnimationRequired: Observable<Animation>;
    onEditAnimationUIClosed: Observable<void>;
    onClipLengthIncreased: Observable<number>;
    onClipLengthDecreased: Observable<number>;
    onInterpolationModeSet: Observable<{
        keyId: number;
        value: AnimationKeyInterpolation;
    }>;
    onSelectToActivated: Observable<{
        from: number;
        to: number;
    }>;
    onRangeFrameBarResized: Observable<number>;
    onPlayheadMoved: Observable<number>;
    lockLastFrameValue: boolean;
    lockLastFrameFrame: boolean;
    onActiveKeyDataChanged: Observable<number>;
    prepare(): void;
    play(forward: boolean): void;
    stop(): void;
    moveToFrame(frame: number): void;
    refreshTarget(): void;
    clearSelection(): void;
    enableChannel(animation: Animation, color: string): void;
    disableChannel(animation: Animation): void;
    isChannelEnabled(animation: Animation, color: string): boolean;
    getActiveChannel(animation: Animation): string;
    resetAllActiveChannels(): void;
    getAnimationSortIndex(animation: Animation): number;
    getPrevKey(): Nullable<number>;
    getNextKey(): Nullable<number>;
    /**
     * If any current active animation has a key at the received frameNumber,
     * return the index of the animation in the active animation array, and
     * the index of the frame on the animation.
     * @param frameNumber the frame number to look for
     * @returns null if no key was found, or an object with the animation index and key index
     */
    getKeyAtAnyFrameIndex(frameNumber: number): {
        animationIndex: number;
        keyIndex: number;
    } | null;
    /**
     * @returns true if any active animation has a quaternion animation
     */
    hasActiveQuaternionAnimationKeyPoints(): boolean;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/animationCurveEditorComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/scss/curveEditor.scss";
interface IAnimationCurveEditorComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IAnimationCurveEditorComponentState {
    isOpen: boolean;
}
export class AnimationCurveEditorComponent extends React.Component<IAnimationCurveEditorComponentProps, IAnimationCurveEditorComponentState> {
    constructor(props: IAnimationCurveEditorComponentProps);
    onCloseAnimationCurveEditor(window: Window | null): void;
    shouldComponentUpdate(newProps: IAnimationCurveEditorComponentProps, newState: IAnimationCurveEditorComponentState): boolean;
    private _onKeyDown;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/sideBarComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/scss/sideBar.scss";
interface ISideBarComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface ISideBarComponentState {
    mode: Mode;
}
enum Mode {
    Edit = 0,
    Add = 1,
    Load = 2,
    Save = 3
}
export class SideBarComponent extends React.Component<ISideBarComponentProps, ISideBarComponentState> {
    constructor(props: ISideBarComponentProps);
    private _onAddAnimation;
    private _onLoadAnimation;
    private _onSaveAnimation;
    private _onEditAnimation;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/saveAnimationComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface ISaveAnimationComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface ISaveAnimationComponentState {
}
export class SaveAnimationComponent extends React.Component<ISaveAnimationComponentProps, ISaveAnimationComponentState> {
    private _selectedAnimations;
    private _root;
    constructor(props: ISaveAnimationComponentProps);
    private _getJson;
    saveToSnippetServer(): void;
    saveToFile(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/loadAnimationComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface ILoadAnimationComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface ILoadAnimationComponentState {
}
export class LoadAnimationComponent extends React.Component<ILoadAnimationComponentProps, ILoadAnimationComponentState> {
    private _root;
    private _textInput;
    constructor(props: ILoadAnimationComponentProps);
    loadFromFile(evt: React.ChangeEvent<HTMLInputElement>): void;
    loadFromSnippetServer(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/editAnimationComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import { Animation } from "babylonjs/Animations/animation";
import { Nullable } from "babylonjs/types";
interface IEditAnimationComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IEditAnimationComponentState {
    isVisible: boolean;
    animation: Nullable<Animation>;
}
export class EditAnimationComponent extends React.Component<IEditAnimationComponentProps, IEditAnimationComponentState> {
    private _root;
    private _displayName;
    private _property;
    private _loopModeElement;
    private _onEditAnimationRequiredObserver;
    constructor(props: IEditAnimationComponentProps);
    componentWillUnmount(): void;
    close(): void;
    validate(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/animationSubEntryComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import { Animation } from "babylonjs/Animations/animation";
interface IAnimationSubEntryComponentProps {
    globalState: GlobalState;
    context: Context;
    animation: Animation;
    color: string;
    subName: string;
}
interface IAnimationSubEntryComponentState {
    isSelected: boolean;
}
export class AnimationSubEntryComponent extends React.Component<IAnimationSubEntryComponentProps, IAnimationSubEntryComponentState> {
    private _onActiveAnimationChangedObserver;
    private _onActiveKeyPointChangedObserver;
    constructor(props: IAnimationSubEntryComponentProps);
    componentWillUnmount(): void;
    private _activate;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/animationListComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IAnimationListComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IAnimationListComponentState {
    isVisible: boolean;
}
export class AnimationListComponent extends React.Component<IAnimationListComponentProps, IAnimationListComponentState> {
    private _onEditAnimationRequiredObserver;
    private _onEditAnimationUIClosedObserver;
    private _onDeleteAnimationObserver;
    constructor(props: IAnimationListComponentProps);
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/animationEntryComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import { Animation } from "babylonjs/Animations/animation";
interface IAnimationEntryComponentProps {
    globalState: GlobalState;
    context: Context;
    animation: Animation;
}
interface IAnimationEntryComponentState {
    isExpanded: boolean;
    isSelected: boolean;
}
export class AnimationEntryComponent extends React.Component<IAnimationEntryComponentProps, IAnimationEntryComponentState> {
    private _onActiveAnimationChangedObserver;
    private _onActiveKeyPointChangedObserver;
    private _onSelectToActivatedObserver;
    private _unmount;
    constructor(props: IAnimationEntryComponentProps);
    private _onGear;
    private _onDelete;
    componentWillUnmount(): void;
    private _activate;
    private _expandOrCollapse;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/sideBar/addAnimationComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IAddAnimationComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IAddAnimationComponentState {
    customPropertyMode: boolean;
}
export class AddAnimationComponent extends React.Component<IAddAnimationComponentProps, IAddAnimationComponentState> {
    private _root;
    private _displayName;
    private _property;
    private _typeElement;
    private _propertylement;
    private _loopModeElement;
    constructor(props: IAddAnimationComponentProps);
    createNew(): void;
    getInferredType(activeProperty?: string): any;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/rangeFrameBarComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IRangeFrameBarComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IRangeFrameBarComponentState {
}
export class RangeFrameBarComponent extends React.Component<IRangeFrameBarComponentProps, IRangeFrameBarComponentState> {
    private _svgHost;
    private _viewWidth;
    private _offsetX;
    private _isMounted;
    private _onActiveAnimationChangedObserver;
    private _onPlayheadMovedObserver;
    private _onFrameManuallyEnteredObserver;
    constructor(props: IRangeFrameBarComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _computeSizes;
    private _dropKeyFrames;
    private _buildActiveFrame;
    private _buildFrames;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/playHeadComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IPlayHeadComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IPlayHeadComponentState {
}
export class PlayHeadComponent extends React.Component<IPlayHeadComponentProps, IPlayHeadComponentState> {
    private readonly _graphAbsoluteWidth;
    private _playHead;
    private _playHeadCircle;
    private _onBeforeRenderObserver;
    private _onActiveAnimationChangedObserver;
    private _onRangeFrameBarResizedObserver;
    private _onMoveToFrameRequiredObserver;
    private _onGraphMovedObserver;
    private _onGraphScaledObserver;
    private _viewScale;
    private _offsetX;
    private _offsetRange;
    private _viewWidth;
    private readonly _rangeWidthToPlayheadWidth;
    private _pointerIsDown;
    constructor(props: IPlayHeadComponentProps);
    private _moveHead;
    private _frameToPixel;
    private _pixelToFrame;
    componentWillUnmount(): void;
    private _getPixelValues;
    private _onPointerDown;
    private _onPointerMove;
    private _onPointerUp;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/keyPoint" {
import { Nullable } from "babylonjs/types";
import * as React from "react";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import { Curve } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/curve";
interface IKeyPointComponentProps {
    x: number;
    y: number;
    getPreviousX: () => Nullable<number>;
    getNextX: () => Nullable<number>;
    invertX: (x: number) => number;
    invertY: (y: number) => number;
    convertX: (x: number) => number;
    convertY: (y: number) => number;
    nextX?: number;
    scale: number;
    keyId: number;
    curve: Curve;
    context: Context;
    channel: string;
    onFrameValueChanged: (value: number) => void;
    onKeyValueChanged: (value: number) => void;
}
interface IKeyPointComponentState {
    selectedState: SelectionState;
    tangentSelectedIndex: number;
    x: number;
    y: number;
}
export enum SelectionState {
    None = 0,
    Selected = 1,
    Siblings = 2
}
export class KeyPointComponent extends React.Component<IKeyPointComponentProps, IKeyPointComponentState> {
    private _onActiveKeyPointChangedObserver;
    private _onActiveKeyFrameChangedObserver;
    private _onFrameManuallyEnteredObserver;
    private _onValueManuallyEnteredObserver;
    private _onMainKeyPointSetObserver;
    private _onMainKeyPointMovedObserver;
    private _onSelectionRectangleMovedObserver;
    private _onFlattenTangentRequiredObserver;
    private _onLinearTangentRequiredObserver;
    private _onBreakTangentRequiredObserver;
    private _onUnifyTangentRequiredObserver;
    private _onStepTangentRequiredObserver;
    private _onSelectAllKeysObserver;
    private _pointerIsDown;
    private _sourcePointerX;
    private _sourcePointerY;
    private _offsetXToMain;
    private _offsetYToMain;
    private _svgHost;
    private _keyPointSVG;
    private _controlMode;
    private _storedLengthIn;
    private _storedLengthOut;
    private _inVec;
    private _outVec;
    private _lockX;
    private _lockY;
    private _accumulatedX;
    private _accumulatedY;
    constructor(props: IKeyPointComponentProps);
    componentWillUnmount(): void;
    shouldComponentUpdate(newProps: IKeyPointComponentProps, newState: IKeyPointComponentState): boolean;
    private _breakTangent;
    private _unifyTangent;
    private _flattenTangent;
    private _linearTangent;
    private _stepTangent;
    private _select;
    private _onPointerDown;
    private _extractSlope;
    private _processTangentMove;
    private _onPointerMove;
    private _onPointerUp;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/graphComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IGraphComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IGraphComponentState {
}
export class GraphComponent extends React.Component<IGraphComponentProps, IGraphComponentState> {
    private readonly _minScale;
    private readonly _maxScale;
    private readonly _graphAbsoluteWidth;
    private readonly _graphAbsoluteHeight;
    private _viewWidth;
    private _viewCurveWidth;
    private _viewHeight;
    private _viewScale;
    private _offsetX;
    private _offsetY;
    private _inSelectionMode;
    private _graphOffsetX;
    private _minValue;
    private _maxValue;
    private _minFrame;
    private _maxFrame;
    private _svgHost;
    private _svgHost2;
    private _selectionRectangle;
    private _curves;
    private _pointerIsDown;
    private _sourcePointerX;
    private _sourcePointerY;
    private _selectionMade;
    private _selectionStartX;
    private _selectionStartY;
    private _onActiveAnimationChangedObserver;
    constructor(props: IGraphComponentProps);
    componentWillUnmount(): void;
    private _computeSizes;
    private _setDefaultInTangent;
    private _setDefaultOutTangent;
    private _evaluateKeys;
    private _extractValuesFromKeys;
    private _convertX;
    private _invertX;
    private _convertY;
    private _invertY;
    private _buildFrameIntervalAxis;
    private _buildYAxis;
    private _frameFromActiveKeys;
    private _dropKeyFrames;
    private _onPointerDown;
    private _onPointerMove;
    private _onPointerUp;
    private _onWheel;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/frameBarComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IFrameBarComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IFrameBarComponentState {
}
export class FrameBarComponent extends React.Component<IFrameBarComponentProps, IFrameBarComponentState> {
    private readonly _graphAbsoluteWidth;
    private _svgHost;
    private _viewWidth;
    private _viewScale;
    private _offsetX;
    private _onActiveAnimationChangedObserver;
    constructor(props: IFrameBarComponentProps);
    componentWillUnmount(): void;
    private _computeSizes;
    private _buildFrames;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/curveComponent" {
import * as React from "react";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import { Curve } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/curve";
interface ICurveComponentProps {
    curve: Curve;
    convertX: (x: number) => number;
    convertY: (x: number) => number;
    context: Context;
}
interface ICurveComponentState {
    isSelected: boolean;
}
export class CurveComponent extends React.Component<ICurveComponentProps, ICurveComponentState> {
    private _onDataUpdatedObserver;
    private _onActiveAnimationChangedObserver;
    private _onInterpolationModeSetObserver;
    constructor(props: ICurveComponentProps);
    componentWillUnmount(): void;
    componentDidUpdate(): boolean;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/curve" {
import { Animation } from "babylonjs/Animations/animation";
import { AnimationKeyInterpolation } from "babylonjs/Animations/animationKey";
import { Observable } from "babylonjs/Misc/observable";
export interface KeyEntry {
    frame: number;
    value: number;
    inTangent?: number;
    outTangent?: number;
    lockedTangent: boolean;
    interpolation?: AnimationKeyInterpolation;
}
export class Curve {
    static readonly SampleRate: number;
    keys: KeyEntry[];
    animation: Animation;
    color: string;
    onDataUpdatedObservable: Observable<void>;
    property?: string;
    tangentBuilder?: () => any;
    setDefaultInTangent?: (keyId: number) => any;
    setDefaultOutTangent?: (keyId: number) => any;
    static readonly TangentLength: number;
    constructor(color: string, animation: Animation, property?: string, tangentBuilder?: () => any, setDefaultInTangent?: (keyId: number) => any, setDefaultOutTangent?: (keyId: number) => any);
    getPathData(convertX: (x: number) => number, convertY: (y: number) => number): string;
    updateLockedTangentMode(keyIndex: number, enabled: boolean): void;
    updateInterpolationMode(keyIndex: number, interpolationMode: AnimationKeyInterpolation): void;
    getInControlPoint(keyIndex: number): number | undefined;
    getOutControlPoint(keyIndex: number): number | undefined;
    hasDefinedOutTangent(keyIndex: number): boolean;
    evaluateOutTangent(keyIndex: number): number;
    hasDefinedInTangent(keyIndex: number): boolean;
    evaluateInTangent(keyIndex: number): number;
    storeDefaultInTangent(keyIndex: number): void;
    storeDefaultOutTangent(keyIndex: number): void;
    updateInTangentFromControlPoint(keyId: number, slope: number): void;
    updateOutTangentFromControlPoint(keyId: number, slope: number): void;
    updateKeyFrame(keyId: number, frame: number): void;
    updateKeyValue(keyId: number, value: number): void;
}

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/graph/canvasComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/scss/canvas.scss";
interface ICanvasComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface ICanvasComponentState {
}
export class CanvasComponent extends React.Component<ICanvasComponentProps, ICanvasComponentState> {
    private _onActiveAnimationChangedObserver;
    constructor(props: ICanvasComponentProps);
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/controls/textInputComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface ITextInputComponentProps {
    globalState: GlobalState;
    context: Context;
    id?: string;
    className?: string;
    tooltip?: string;
    value: string;
    isNumber?: boolean;
    complement?: string;
    onValueAsNumberChanged?: (value: number, isFocused: boolean) => void;
    disabled?: boolean;
}
interface ITextInputComponentState {
    value: string;
    isFocused: boolean;
}
export class TextInputComponent extends React.Component<ITextInputComponentProps, ITextInputComponentState> {
    private _lastKnownGoodValue;
    constructor(props: ITextInputComponentProps);
    private _onChange;
    private _onBlur;
    private _onFocus;
    shouldComponentUpdate(newProps: ITextInputComponentProps, newState: ITextInputComponentState): boolean;
    private _onKeyPress;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/controls/pushButtonComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IPushButtonComponentProps {
    globalState: GlobalState;
    context: Context;
    icon: string;
    id?: string;
    className?: string;
    isPushed?: boolean;
    onClick: (state: boolean) => void;
    tooltip?: string;
}
interface IPushButtonComponentState {
    isPushed: boolean;
}
export class PushButtonComponent extends React.Component<IPushButtonComponentProps, IPushButtonComponentState> {
    constructor(props: IPushButtonComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/controls/controlButtonComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IControlButtonComponentProps {
    globalState: GlobalState;
    context: Context;
    icon: string;
    hoverIcon: string;
    id?: string;
    className?: string;
    onClick: () => void;
    tooltip?: string;
}
interface IControlButtonComponentState {
}
export class ControlButtonComponent extends React.Component<IControlButtonComponentProps, IControlButtonComponentState> {
    constructor(props: IControlButtonComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/controls/actionButtonComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IActionButtonComponentProps {
    globalState: GlobalState;
    context: Context;
    icon: string;
    id?: string;
    className?: string;
    isActive?: boolean;
    onClick: () => void;
    tooltip?: string;
}
interface IActionButtonComponentState {
}
export class ActionButtonComponent extends React.Component<IActionButtonComponentProps, IActionButtonComponentState> {
    constructor(props: IActionButtonComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/bottomBar/rangeSelectorComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IRangeSelectorComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IRangeSelectorComponentState {
}
export class RangeSelectorComponent extends React.Component<IRangeSelectorComponentProps, IRangeSelectorComponentState> {
    private _rangeHost;
    private _rangeScrollbarHost;
    private _viewWidth;
    private _pointerIsDown;
    private _minFrame;
    private _maxFrame;
    private _leftHandleIsActive;
    private _bothHandleIsActive;
    private _currentOffset;
    private _currentFrom;
    private _currentTo;
    constructor(props: IRangeSelectorComponentProps);
    private _computeSizes;
    private _onPointerDown;
    private _onPointerMove;
    private _updateLimits;
    private _onPointerUp;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/bottomBar/mediaPlayerComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
interface IMediaPlayerComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IMediaPlayerComponentState {
}
export class MediaPlayerComponent extends React.Component<IMediaPlayerComponentProps, IMediaPlayerComponentState> {
    private _isMounted;
    constructor(props: IMediaPlayerComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _onFirstKey;
    private _onPrevKey;
    private _onRewind;
    private _onForward;
    private _onPrevFrame;
    private _onNextFrame;
    private _onNextKey;
    private _onEndKey;
    private _onStop;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/bottomBar/bottomBarComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Context } from "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/context";
import "babylonjs-inspector/components/actionTabs/tabs/propertyGrids/animations/curveEditor/scss/bottomBar.scss";
interface IBottomBarComponentProps {
    globalState: GlobalState;
    context: Context;
}
interface IBottomBarComponentState {
    clipLength: string;
}
export class BottomBarComponent extends React.Component<IBottomBarComponentProps, IBottomBarComponentState> {
    private _onAnimationsLoadedObserver;
    private _onActiveAnimationChangedObserver;
    private _onClipLengthIncreasedObserver;
    private _onClipLengthDecreasedObserver;
    constructor(props: IBottomBarComponentProps);
    private _changeClipLength;
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/performanceViewer/performanceViewerSidebarComponent" {
import { PerformanceViewerCollector } from "babylonjs/Misc/PerformanceViewer/performanceViewerCollector";
import { Observable } from "babylonjs/Misc/observable";
import { IVisibleRangeChangedObservableProps } from "babylonjs-inspector/components/graph/graphSupportingTypes";
interface IPerformanceViewerSidebarComponentProps {
    collector: PerformanceViewerCollector;
    onVisibleRangeChangedObservable?: Observable<IVisibleRangeChangedObservableProps>;
}
export const PerformanceViewerSidebarComponent: (props: IPerformanceViewerSidebarComponentProps) => import("react/jsx-runtime").JSX.Element;
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/performanceViewer/performanceViewerPopupComponent" {
import * as React from "react";
import { Scene } from "babylonjs/scene";
import { Vector2 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PerformanceViewerCollector } from "babylonjs/Misc/PerformanceViewer/performanceViewerCollector";
import { IPerfLayoutSize } from "babylonjs-inspector/components/graph/graphSupportingTypes";
interface IPerformanceViewerPopupComponentProps {
    scene: Scene;
    layoutObservable: Observable<IPerfLayoutSize>;
    returnToLiveObservable: Observable<void>;
    performanceCollector: PerformanceViewerCollector;
    initialGraphSize?: Vector2;
}
export const PerformanceViewerPopupComponent: React.FC<IPerformanceViewerPopupComponentProps>;
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/performanceViewer/performanceViewerComponent" {
import { Scene } from "babylonjs/scene";
import * as React from "react";
import "babylonjs/Misc/PerformanceViewer/performanceViewerSceneExtension";
import "babylonjs-inspector/components/actionTabs/tabs/performanceViewer/scss/performanceViewer.scss";
interface IPerformanceViewerComponentProps {
    scene: Scene;
}
export enum IPerfMetadataCategory {
    Count = "Count",
    FrameSteps = "Frame Steps Duration"
}
export const PerformanceViewerComponent: React.FC<IPerformanceViewerComponentProps>;
export {};

}
declare module "babylonjs-inspector/components/actionTabs/tabs/performanceViewer/performancePlayheadButtonComponent" {
import { Observable } from "babylonjs/Misc/observable";
import * as React from "react";
interface IPerformancePlayheadButtonProps {
    returnToPlayhead: Observable<void>;
}
export const PerformancePlayheadButtonComponent: React.FC<IPerformancePlayheadButtonProps>;
export {};

}
declare module "babylonjs-inspector/components/actionTabs/lines/textureLinkLineComponent" {
import * as React from "react";
import { Nullable } from "babylonjs/types";
import { Observable } from "babylonjs/Misc/observable";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { Material } from "babylonjs/Materials/material";
import { Scene } from "babylonjs/scene";
export interface ITextureLinkLineComponentProps {
    label: string;
    texture: Nullable<BaseTexture>;
    material?: Material;
    texturedObject?: {
        getScene: () => Scene;
    };
    onSelectionChangedObservable?: Observable<any>;
    onDebugSelectionChangeObservable?: Observable<TextureLinkLineComponent>;
    propertyName?: string;
    onTextureCreated?: (texture: BaseTexture) => void;
    customDebugAction?: (state: boolean) => void;
    onTextureRemoved?: () => void;
    fileFormats?: string;
    cubeOnly?: boolean;
}
export class TextureLinkLineComponent extends React.Component<ITextureLinkLineComponentProps, {
    isDebugSelected: boolean;
}> {
    private _onDebugSelectionChangeObserver;
    constructor(props: ITextureLinkLineComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    debugTexture(): void;
    onLink(): void;
    onLinkTexture(texture: BaseTexture): void;
    updateTexture(file: File): void;
    removeTexture(): void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}

}
declare module "babylonjs-inspector/components/actionTabs/lines/textureLineComponent" {
import * as React from "react";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { TextureChannelsToDisplay } from "babylonjs-inspector/textureHelper";
interface ITextureLineComponentProps {
    texture: BaseTexture;
    width: number;
    height: number;
    globalState?: GlobalState;
    hideChannelSelect?: boolean;
}
export class TextureLineComponent extends React.Component<ITextureLineComponentProps, {
    channels: TextureChannelsToDisplay;
    face: number;
}> {
    private _canvasRef;
    private static _TextureChannelStates;
    constructor(props: ITextureLineComponentProps);
    shouldComponentUpdate(nextProps: ITextureLineComponentProps, nextState: {
        channels: TextureChannelsToDisplay;
        face: number;
    }): boolean;
    componentDidMount(): void;
    componentDidUpdate(): void;
    updatePreview(): Promise<void>;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/lines/quaternionLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Quaternion, Vector3 } from "babylonjs/Maths/math.vector";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IQuaternionLineComponentProps {
    label: string;
    target: any;
    useEuler?: boolean;
    propertyName: string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    lockObject: LockObject;
}
export class QuaternionLineComponent extends React.Component<IQuaternionLineComponentProps, {
    isExpanded: boolean;
    value: Quaternion;
    eulerValue: Vector3;
}> {
    private _localChange;
    constructor(props: IQuaternionLineComponentProps);
    _checkRoundCircle(a: number, b: number): boolean;
    shouldComponentUpdate(nextProps: IQuaternionLineComponentProps, nextState: {
        isExpanded: boolean;
        value: Quaternion;
        eulerValue: Vector3;
    }): boolean;
    switchExpandState(): void;
    raiseOnPropertyChanged(currentValue: Quaternion, previousValue: Quaternion): void;
    updateQuaternion(): void;
    updateStateX(value: number): void;
    updateStateY(value: number): void;
    updateStateZ(value: number): void;
    updateStateW(value: number): void;
    updateQuaternionFromEuler(): void;
    updateStateEulerX(value: number): void;
    updateStateEulerY(value: number): void;
    updateStateEulerZ(value: number): void;
    onCopyClick(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/actionTabs/lines/meshPickerComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-inspector/components/globalState";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/components/propertyChangedEvent";
import { Scene } from "babylonjs/scene";
interface IMeshPickerComponentProps {
    globalState: GlobalState;
    target: any;
    property: string;
    scene: Scene;
    label: string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class MeshPickerComponent extends React.Component<IMeshPickerComponentProps> {
    constructor(props: IMeshPickerComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/styleHelper" {
/**
 * Copy all styles from a document to another document or shadow root
 * @param source document to copy styles from
 * @param target document or shadow root to copy styles to
 */
export function CopyStyles(source: Document, target: DocumentOrShadowRoot): void;
/**
 * Merges classNames by array of strings or conditions
 * @param classNames Array of className strings or truthy conditions
 * @returns A concatenated string, suitable for the className attribute
 */
export function MergeClassNames(classNames: ClassNameCondition[]): string;
/**
 * className (replicating React type) or a tuple with the second member being any truthy value ["className", true]
 */
type ClassNameCondition = string | undefined | [string, any];
export {};

}
declare module "babylonjs-inspector/stringTools" {
export class StringTools {
    private static _SaveAs;
    private static _Click;
    /**
     * Download a string into a file that will be saved locally by the browser
     * @param document
     * @param content defines the string to download locally as a file
     * @param filename
     */
    static DownloadAsFile(document: HTMLDocument, content: string, filename: string): void;
}

}
declare module "babylonjs-inspector/propertyChangedEvent" {
export class PropertyChangedEvent {
    object: any;
    property: string;
    value: any;
    initialValue: any;
    allowNullValue?: boolean;
}

}
declare module "babylonjs-inspector/popupHelper" {
/**
 * Create a popup window
 * @param title default title for the popup
 * @param options options for the popup
 * @returns the parent control of the popup
 */
export function CreatePopup(title: string, options: Partial<{
    onParentControlCreateCallback?: (parentControl: HTMLDivElement) => void;
    onWindowCreateCallback?: (newWindow: Window) => void;
    width?: number;
    height?: number;
}>): HTMLDivElement | null;

}
declare module "babylonjs-inspector/historyStack" {
import { IDisposable } from "babylonjs/scene";
/**
 * Class handling undo / redo operations
 */
export class HistoryStack implements IDisposable {
    private _historyStack;
    private _redoStack;
    private _activeData;
    private readonly _maxHistoryLength;
    private _locked;
    private _dataProvider;
    private _applyUpdate;
    /**
     * Gets or sets a boolean indicating if the stack is enabled
     */
    isEnabled: boolean;
    /**
     * Constructor
     * @param dataProvider defines the data provider function
     * @param applyUpdate defines the code to execute when undo/redo operation is required
     */
    constructor(dataProvider: () => any, applyUpdate: (data: any) => void);
    /**
     * Process key event to handle undo / redo
     * @param evt defines the keyboard event to process
     * @returns true if the event was processed
     */
    processKeyEvent(evt: KeyboardEvent): boolean;
    /**
     * Resets the stack
     */
    reset(): void;
    /**
     * Remove the n-1 element of the stack
     */
    collapseLastTwo(): void;
    private _generateJSONDiff;
    private _applyJSONDiff;
    private _copy;
    /**
     * Stores the current state
     */
    storeAsync(): Promise<void>;
    /**
     * Checks if there is any data in the history stack
     */
    get hasData(): boolean;
    /**
     * Undo the latest operation
     */
    undo(): void;
    /**
     * Redo the latest undo operation
     */
    redo(): void;
    /**
     * Disposes the stack
     */
    dispose(): void;
}

}
declare module "babylonjs-inspector/copyCommandToClipboard" {
export function copyCommandToClipboard(strCommand: string): void;
export function getClassNameWithNamespace(obj: any): {
    className: string;
    babylonNamespace: string;
};

}
declare module "babylonjs-inspector/constToOptionsMaps" {
/**
 * Used by both particleSystem and alphaBlendModes
 */
export const CommonBlendModes: {
    label: string;
    value: number;
}[];
/**
 * Used to populated the blendMode dropdown in our various tools (Node Editor, Inspector, etc.)
 * The below ParticleSystem consts were defined before new Engine alpha blend modes were added, so we have to reference
 * the ParticleSystem.FOO consts explicitly (as the underlying const values are different - they get mapped to engine consts within baseParticleSystem.ts)
 */
export const BlendModeOptions: {
    label: string;
    value: number;
}[];
/**
 * Used to populated the alphaMode dropdown in our various tools (Node Editor, Inspector, etc.)
 */
export const AlphaModeOptions: {
    label: string;
    value: number;
}[];
/**
 * Used to populate the billboardMode dropdown for particle systems.
 */
export const ParticleBillboardModeOptions: {
    label: string;
    value: number;
}[];

}
declare module "babylonjs-inspector/tabs/propertyGrids/lockObject" {
/**
 * Class used to provide lock mechanism
 */
export class LockObject {
    /**
     * Gets or set if the lock is engaged
     */
    lock: boolean;
}

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/textBlockPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { TextBlock } from "babylonjs-gui/2D/controls/textBlock";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface ITextBlockPropertyGridComponentProps {
    textBlock: TextBlock;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class TextBlockPropertyGridComponent extends React.Component<ITextBlockPropertyGridComponentProps> {
    constructor(props: ITextBlockPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/stackPanelPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { StackPanel } from "babylonjs-gui/2D/controls/stackPanel";
interface IStackPanelPropertyGridComponentProps {
    stackPanel: StackPanel;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class StackPanelPropertyGridComponent extends React.Component<IStackPanelPropertyGridComponentProps> {
    constructor(props: IStackPanelPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/sliderPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Slider } from "babylonjs-gui/2D/controls/sliders/slider";
interface ISliderPropertyGridComponentProps {
    slider: Slider;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class SliderPropertyGridComponent extends React.Component<ISliderPropertyGridComponentProps> {
    constructor(props: ISliderPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/scrollViewerPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { ScrollViewer } from "babylonjs-gui/2D/controls/scrollViewers/scrollViewer";
interface IScrollViewerPropertyGridComponentProps {
    scrollViewer: ScrollViewer;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ScrollViewerPropertyGridComponent extends React.Component<IScrollViewerPropertyGridComponentProps> {
    constructor(props: IScrollViewerPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/rectanglePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Rectangle } from "babylonjs-gui/2D/controls/rectangle";
interface IRectanglePropertyGridComponentProps {
    rectangle: Rectangle;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class RectanglePropertyGridComponent extends React.Component<IRectanglePropertyGridComponentProps> {
    constructor(props: IRectanglePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/radioButtonPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { RadioButton } from "babylonjs-gui/2D/controls/radioButton";
interface IRadioButtonPropertyGridComponentProps {
    radioButtons: RadioButton[];
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class RadioButtonPropertyGridComponent extends React.Component<IRadioButtonPropertyGridComponentProps> {
    constructor(props: IRadioButtonPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/linePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Line } from "babylonjs-gui/2D/controls/line";
interface ILinePropertyGridComponentProps {
    line: Line;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class LinePropertyGridComponent extends React.Component<ILinePropertyGridComponentProps> {
    constructor(props: ILinePropertyGridComponentProps);
    onDashChange(value: string): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/inputTextPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { InputText } from "babylonjs-gui/2D/controls/inputText";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IInputTextPropertyGridComponentProps {
    inputText: InputText;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class InputTextPropertyGridComponent extends React.Component<IInputTextPropertyGridComponentProps> {
    constructor(props: IInputTextPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/imagePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Image } from "babylonjs-gui/2D/controls/image";
interface IImagePropertyGridComponentProps {
    image: Image;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ImagePropertyGridComponent extends React.Component<IImagePropertyGridComponentProps> {
    constructor(props: IImagePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/imageBasedSliderPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { ImageBasedSlider } from "babylonjs-gui/2D/controls/sliders/imageBasedSlider";
interface IImageBasedSliderPropertyGridComponentProps {
    imageBasedSlider: ImageBasedSlider;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ImageBasedSliderPropertyGridComponent extends React.Component<IImageBasedSliderPropertyGridComponentProps> {
    constructor(props: IImageBasedSliderPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/gridPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Grid } from "babylonjs-gui/2D/controls/grid";
interface IGridPropertyGridComponentProps {
    grid: Grid;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class GridPropertyGridComponent extends React.Component<IGridPropertyGridComponentProps> {
    constructor(props: IGridPropertyGridComponentProps);
    renderRows(): import("react/jsx-runtime").JSX.Element[];
    renderColumns(): import("react/jsx-runtime").JSX.Element[];
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/ellipsePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Ellipse } from "babylonjs-gui/2D/controls/ellipse";
interface IEllipsePropertyGridComponentProps {
    ellipse: Ellipse;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class EllipsePropertyGridComponent extends React.Component<IEllipsePropertyGridComponentProps> {
    constructor(props: IEllipsePropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/controlPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { Control } from "babylonjs-gui/2D/controls/control";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IControlPropertyGridComponentProps {
    control: Control;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ControlPropertyGridComponent extends React.Component<IControlPropertyGridComponentProps> {
    constructor(props: IControlPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/commonControlPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { Control } from "babylonjs-gui/2D/controls/control";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface ICommonControlPropertyGridComponentProps {
    controls?: Control[];
    control?: Control;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CommonControlPropertyGridComponent extends React.Component<ICommonControlPropertyGridComponentProps> {
    constructor(props: ICommonControlPropertyGridComponentProps);
    renderGridInformation(control: Control): import("react/jsx-runtime").JSX.Element | null;
    render(): import("react/jsx-runtime").JSX.Element | undefined;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/colorPickerPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { ColorPicker } from "babylonjs-gui/2D/controls/colorpicker";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IColorPickerPropertyGridComponentProps {
    colorPicker: ColorPicker;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class ColorPickerPropertyGridComponent extends React.Component<IColorPickerPropertyGridComponentProps> {
    constructor(props: IColorPickerPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/tabs/propertyGrids/gui/checkboxPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import { Checkbox } from "babylonjs-gui/2D/controls/checkbox";
interface ICheckboxPropertyGridComponentProps {
    checkbox: Checkbox;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}
export class CheckboxPropertyGridComponent extends React.Component<ICheckboxPropertyGridComponentProps> {
    constructor(props: ICheckboxPropertyGridComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/split/splitter" {
import { ControlledSize } from "babylonjs-inspector/split/splitContext";
/**
 * Splitter component properties
 */
export interface ISplitterProps {
    /**
     * Unique identifier
     */
    id?: string;
    /**
     * Splitter size
     */
    size: number;
    /**
     * Minimum size for the controlled element
     */
    minSize?: number;
    /**
     * Maximum size for the controlled element
     */
    maxSize?: number;
    /**
     * Initial size for the controlled element
     */
    initialSize?: number;
    /**
     * Defines the controlled side
     */
    controlledSide: ControlledSize;
    /**
     * refObject to the splitter element
     */
    refObject?: React.RefObject<HTMLDivElement>;
}
/**
 * Creates a splitter component
 * @param props defines the splitter properties
 * @returns the splitter component
 */
export const Splitter: React.FC<ISplitterProps>;

}
declare module "babylonjs-inspector/split/splitContext" {
export enum ControlledSize {
    First = 0,
    Second = 1
}
export enum SplitDirection {
    Horizontal = 0,
    Vertical = 1
}
/**
 * Context used to share data with splitters
 */
export interface ISplitContext {
    /**
     * Split direction
     */
    direction: SplitDirection;
    /**
     * Function called by splitters to update the offset
     * @param offset new offet
     * @param source source element
     * @param controlledSide defined controlled element
     */
    drag: (offset: number, source: HTMLElement, controlledSide: ControlledSize) => void;
    /**
     * Function called by splitters to begin dragging
     */
    beginDrag: () => void;
    /**
     * Function called by splitters to end dragging
     */
    endDrag: () => void;
    /**
     * Sync sizes for the elements
     * @param source source element
     * @param controlledSide defined controlled element
     * @param size size of the controlled element
     * @param minSize minimum size for the controlled element
     * @param maxSize maximum size for the controlled element
     */
    sync: (source: HTMLElement, controlledSide: ControlledSize, size?: number, minSize?: number, maxSize?: number) => void;
}
export const SplitContext: import("react").Context<ISplitContext>;

}
declare module "babylonjs-inspector/split/splitContainer" {
import { PropsWithChildren } from "react";
import { SplitDirection } from "babylonjs-inspector/split/splitContext";
/**
 * Split container properties
 */
export interface ISplitContainerProps {
    /**
     * Unique identifier
     */
    id?: string;
    /**
     * Split direction
     */
    direction: SplitDirection;
    /**
     * Minimum size for the floating elements
     */
    floatingMinSize?: number;
    /**
     * RefObject to the root div element
     */
    containerRef?: React.RefObject<HTMLDivElement>;
    /**
     * Optional class name
     */
    className?: string;
    /**
     * Pointer down
     * @param event pointer events
     */
    onPointerDown?: (event: React.PointerEvent) => void;
    /**
     * Pointer move
     * @param event pointer events
     */
    onPointerMove?: (event: React.PointerEvent) => void;
    /**
     * Pointer up
     * @param event pointer events
     */
    onPointerUp?: (event: React.PointerEvent) => void;
    /**
     * Drop
     * @param event drag events
     */
    onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
    /**
     * Drag over
     * @param event drag events
     */
    onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
}
/**
 * Creates a split container component
 * @param props defines the split container properties
 * @returns the split container component
 */
export const SplitContainer: React.FC<PropsWithChildren<ISplitContainerProps>>;

}
declare module "babylonjs-inspector/nodeGraphSystem/typeLedger" {
import { INodeContainer } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeContainer";
import { INodeData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
import { NodePort } from "babylonjs-inspector/nodeGraphSystem/nodePort";
export class TypeLedger {
    static PortDataBuilder: (port: NodePort, nodeContainer: INodeContainer) => IPortData;
    static NodeDataBuilder: (data: any, nodeContainer: INodeContainer) => INodeData;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/tools" {
import { GraphCanvasComponent } from "babylonjs-inspector/nodeGraphSystem/graphCanvas";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { NodeLink } from "babylonjs-inspector/nodeGraphSystem/nodeLink";
import { FramePortData } from "babylonjs-inspector/nodeGraphSystem/types/framePortData";
export const IsFramePortData: (variableToCheck: any) => variableToCheck is FramePortData;
export const RefreshNode: (node: GraphNode, visitedNodes?: Set<GraphNode>, visitedLinks?: Set<NodeLink>, canvas?: GraphCanvasComponent) => void;
export const BuildFloatUI: (container: HTMLDivElement, document: Document, displayName: string, isInteger: boolean, source: any, propertyName: string, onChange: () => void, min?: number, max?: number, visualPropertiesRefresh?: Array<() => void>, additionalClassName?: string) => void;
export function GetListOfAcceptedTypes<T extends Record<string, string | number>>(types: T, allValue: number, autoDetectValue: number, port: {
    acceptedConnectionPointTypes: number[];
    excludedConnectionPointTypes: number[];
    type: number;
}, skips?: number[]): string[];
export function GetConnectionErrorMessage<T extends Record<string, string | number>>(sourceType: number, types: T, allValue: number, autoDetectValue: number, port: {
    acceptedConnectionPointTypes: number[];
    excludedConnectionPointTypes: number[];
    type: number;
}, skips?: number[]): string;

}
declare module "babylonjs-inspector/nodeGraphSystem/stateManager" {
import { Vector2 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { Nullable } from "babylonjs/types";
import { FrameNodePort } from "babylonjs-inspector/nodeGraphSystem/frameNodePort";
import { GraphFrame } from "babylonjs-inspector/nodeGraphSystem/graphFrame";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { INodeContainer } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeContainer";
import { INodeData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
import { ISelectionChangedOptions } from "babylonjs-inspector/nodeGraphSystem/interfaces/selectionChangedOptions";
import { NodePort } from "babylonjs-inspector/nodeGraphSystem/nodePort";
import { HistoryStack } from "babylonjs-inspector/historyStack";
import { Scene } from "babylonjs/scene";
export class StateManager {
    data: any;
    hostDocument: Document;
    lockObject: any;
    modalIsDisplayed: boolean;
    historyStack: HistoryStack;
    activeNode: Nullable<GraphNode>;
    onSearchBoxRequiredObservable: Observable<{
        x: number;
        y: number;
    }>;
    onSelectionChangedObservable: Observable<Nullable<ISelectionChangedOptions>>;
    onFrameCreatedObservable: Observable<GraphFrame>;
    onUpdateRequiredObservable: Observable<any>;
    onGraphNodeRemovalObservable: Observable<GraphNode>;
    onSelectionBoxMoved: Observable<ClientRect | DOMRect>;
    onCandidateLinkMoved: Observable<Nullable<Vector2>>;
    onCandidatePortSelectedObservable: Observable<Nullable<FrameNodePort | NodePort>>;
    onNewNodeCreatedObservable: Observable<GraphNode>;
    onRebuildRequiredObservable: Observable<void>;
    onNodeMovedObservable: Observable<GraphNode>;
    onErrorMessageDialogRequiredObservable: Observable<string>;
    onExposePortOnFrameObservable: Observable<GraphNode>;
    onGridSizeChanged: Observable<void>;
    onNewBlockRequiredObservable: Observable<{
        type: string;
        targetX: number;
        targetY: number;
        needRepositioning?: boolean;
        smartAdd?: boolean;
    }>;
    onHighlightNodeObservable: Observable<{
        data: any;
        active: boolean;
    }>;
    onPreviewCommandActivated: Observable<boolean>;
    exportData: (data: any, frame?: Nullable<GraphFrame>) => string;
    isElbowConnectionAllowed: (nodeA: FrameNodePort | NodePort, nodeB: FrameNodePort | NodePort) => boolean;
    isDebugConnectionAllowed: (nodeA: FrameNodePort | NodePort, nodeB: FrameNodePort | NodePort) => boolean;
    applyNodePortDesign: (data: IPortData, element: HTMLElement, imgHost: HTMLImageElement, pip: HTMLDivElement) => boolean;
    getPortColor: (portData: IPortData) => string;
    storeEditorData: (serializationObject: any, frame?: Nullable<GraphFrame>) => void;
    getEditorDataMap: () => {
        [key: number]: number;
    };
    getScene?: () => Scene;
    createDefaultInputData: (rootData: any, portData: IPortData, nodeContainer: INodeContainer) => Nullable<{
        data: INodeData;
        name: string;
    }>;
    private _isRebuildQueued;
    queueRebuildCommand(): void;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/searchBox" {
import * as React from "react";
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
import "babylonjs-inspector/nodeGraphSystem/searchBox.scss";
export interface ISearchBoxComponentProps {
    stateManager: StateManager;
}
/**
 * The search box component.
 */
export class SearchBoxComponent extends React.Component<ISearchBoxComponentProps, {
    isVisible: boolean;
    filter: string;
    selectedIndex: number;
}> {
    private _handleEscKey;
    private _targetX;
    private _targetY;
    private _nodes;
    constructor(props: ISearchBoxComponentProps);
    hide(): void;
    onFilterChange(evt: React.ChangeEvent<HTMLInputElement>): void;
    onNewNodeRequested(name: string): void;
    onKeyDown(evt: React.KeyboardEvent): void;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element | null;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/propertyLedger" {
import { ComponentClass } from "react";
import { IPropertyComponentProps } from "babylonjs-inspector/nodeGraphSystem/interfaces/propertyComponentProps";
export class PropertyLedger {
    static DefaultControl: ComponentClass<IPropertyComponentProps>;
    static RegisteredControls: {
        [key: string]: ComponentClass<IPropertyComponentProps>;
    };
}

}
declare module "babylonjs-inspector/nodeGraphSystem/nodePort" {
import { Nullable } from "babylonjs/types";
import { Observer } from "babylonjs/Misc/observable";
import { Vector2 } from "babylonjs/Maths/math.vector";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
import { ISelectionChangedOptions } from "babylonjs-inspector/nodeGraphSystem/interfaces/selectionChangedOptions";
import { FrameNodePort } from "babylonjs-inspector/nodeGraphSystem/frameNodePort";
import { IDisplayManager } from "babylonjs-inspector/nodeGraphSystem/interfaces/displayManager";
import { type IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
export class NodePort {
    portData: IPortData;
    node: GraphNode;
    protected _element: HTMLDivElement;
    protected _portContainer: HTMLElement;
    protected _imgHost: HTMLImageElement;
    protected _pip: HTMLDivElement;
    protected _stateManager: StateManager;
    protected _portLabelElement: Element;
    protected _onCandidateLinkMovedObserver: Nullable<Observer<Nullable<Vector2>>>;
    protected _onSelectionChangedObserver: Nullable<Observer<Nullable<ISelectionChangedOptions>>>;
    protected _exposedOnFrame: boolean;
    protected _portUIcontainer?: HTMLDivElement;
    delegatedPort: Nullable<FrameNodePort>;
    get element(): HTMLDivElement;
    get container(): HTMLElement;
    get portName(): string;
    set portName(newName: string);
    get disabled(): boolean;
    hasLabel(): boolean;
    get exposedOnFrame(): boolean;
    set exposedOnFrame(value: boolean);
    get exposedPortPosition(): number;
    set exposedPortPosition(value: number);
    private _isConnectedToNodeOutsideOfFrame;
    refresh(): void;
    constructor(portContainer: HTMLElement, portData: IPortData, node: GraphNode, stateManager: StateManager, portUIcontainer?: HTMLDivElement);
    dispose(): void;
    static CreatePortElement(portData: IPortData, node: GraphNode, root: HTMLElement, displayManager: Nullable<IDisplayManager>, stateManager: StateManager): NodePort;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/nodeLink" {
import { Observable } from "babylonjs/Misc/observable";
import { FrameNodePort } from "babylonjs-inspector/nodeGraphSystem/frameNodePort";
import { NodePort } from "babylonjs-inspector/nodeGraphSystem/nodePort";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { GraphCanvasComponent } from "babylonjs-inspector/nodeGraphSystem/graphCanvas";
export class NodeLink {
    private _graphCanvas;
    private _portA;
    private _portB?;
    private _nodeA;
    private _nodeB?;
    private _path;
    private _selectionPath;
    private _onSelectionChangedObserver;
    private _isVisible;
    private _isTargetCandidate;
    private _gradient;
    onDisposedObservable: Observable<NodeLink>;
    get isTargetCandidate(): boolean;
    set isTargetCandidate(value: boolean);
    get isVisible(): boolean;
    set isVisible(value: boolean);
    get portA(): FrameNodePort | NodePort;
    get portB(): FrameNodePort | NodePort | undefined;
    get nodeA(): GraphNode;
    get nodeB(): GraphNode | undefined;
    intersectsWith(rect: DOMRect): boolean;
    update(endX?: number, endY?: number, straight?: boolean): void;
    get path(): SVGPathElement;
    get selectionPath(): SVGPathElement;
    constructor(graphCanvas: GraphCanvasComponent, portA: NodePort, nodeA: GraphNode, portB?: NodePort, nodeB?: GraphNode);
    onClick(evt: MouseEvent): void;
    dispose(notify?: boolean): void;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/nodeLedger" {
export class NodeLedger {
    static RegisteredNodeNames: string[];
    static NameFormatter: (name: string) => string;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/graphNode" {
import { Nullable } from "babylonjs/types";
import { GraphCanvasComponent } from "babylonjs-inspector/nodeGraphSystem/graphCanvas";
import { NodePort } from "babylonjs-inspector/nodeGraphSystem/nodePort";
import { GraphFrame } from "babylonjs-inspector/nodeGraphSystem/graphFrame";
import { NodeLink } from "babylonjs-inspector/nodeGraphSystem/nodeLink";
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
import { IEditablePropertyOption } from "babylonjs/Decorators/nodeDecorator";
export class GraphNode {
    content: INodeData;
    private static _IdGenerator;
    private _visual;
    private _headerContainer;
    private _headerIcon;
    private _headerIconImg;
    private _headerCollapseImg;
    private _header;
    private _headerCollapse;
    private _connections;
    private _optionsContainer;
    private _inputsContainer;
    private _outputsContainer;
    private _content;
    private _comments;
    private _executionTime;
    private _selectionBorder;
    private _inputPorts;
    private _outputPorts;
    private _links;
    private _x;
    private _y;
    private _gridAlignedX;
    private _gridAlignedY;
    private _mouseStartPointX;
    private _mouseStartPointY;
    private _stateManager;
    private _onSelectionChangedObserver;
    private _onSelectionBoxMovedObserver;
    private _onFrameCreatedObserver;
    private _onUpdateRequiredObserver;
    private _onHighlightNodeObserver;
    private _ownerCanvas;
    private _displayManager;
    private _isVisible;
    private _enclosingFrameId;
    private _lastClick;
    _visualPropertiesRefresh: Array<() => void>;
    addClassToVisual(className: string): void;
    removeClassFromVisual(className: string): void;
    get isCollapsed(): boolean;
    get isVisible(): boolean;
    set isVisible(value: boolean);
    private _upateNodePortNames;
    get outputPorts(): NodePort[];
    get inputPorts(): NodePort[];
    get links(): NodeLink[];
    get gridAlignedX(): number;
    get gridAlignedY(): number;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get width(): number;
    get height(): number;
    get id(): number;
    get name(): string;
    get enclosingFrameId(): number;
    set enclosingFrameId(value: number);
    setIsSelected(value: boolean, marqueeSelection: boolean): void;
    get rootElement(): HTMLDivElement;
    constructor(content: INodeData, stateManager: StateManager);
    isOverlappingFrame(frame: GraphFrame): boolean;
    getPortForPortData(portData: IPortData): NodePort | null;
    getPortDataForPortDataContent(data: any): IPortData | null;
    getLinksForPortDataContent(data: any): NodeLink[];
    getLinksForPortData(portData: IPortData): NodeLink[];
    private _refreshFrames;
    _refreshLinks(): void;
    refresh(): void;
    private _expand;
    private _searchMiddle;
    private _onDown;
    cleanAccumulation(useCeil?: boolean): void;
    private _onUp;
    private _onMove;
    renderProperties(): Nullable<JSX.Element>;
    _forceRebuild(source: any, propertyName: string, notifiers?: IEditablePropertyOption["notifiers"]): void;
    private _isCollapsed;
    /**
     * Collapse the node
     */
    collapse(): void;
    /**
     * Expand the node
     */
    expand(): void;
    private _portUICount;
    private _buildInputPorts;
    appendVisual(root: HTMLDivElement, owner: GraphCanvasComponent): void;
    dispose(): void;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/graphFrame" {
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { GraphCanvasComponent } from "babylonjs-inspector/nodeGraphSystem/graphCanvas";
import { Nullable } from "babylonjs/types";
import { Observable } from "babylonjs/Misc/observable";
import { Color3 } from "babylonjs/Maths/math.color";
import { FrameNodePort } from "babylonjs-inspector/nodeGraphSystem/frameNodePort";
import { IFrameData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeLocationInfo";
export enum FramePortPosition {
    Top = 0,
    Middle = 1,
    Bottom = 2
}
export class GraphFrame {
    private readonly _collapsedWidth;
    private static _FrameCounter;
    private static _FramePortCounter;
    private _name;
    private _color;
    private _x;
    private _y;
    private _gridAlignedX;
    private _gridAlignedY;
    private _width;
    private _height;
    element: HTMLDivElement;
    private _borderElement;
    private _headerElement;
    private _headerTextElement;
    private _headerCollapseElement;
    private _headerCloseElement;
    private _headerFocusElement;
    private _commentsElement;
    private _portContainer;
    private _outputPortContainer;
    private _inputPortContainer;
    private _nodes;
    private _ownerCanvas;
    private _mouseStartPointX;
    private _mouseStartPointY;
    private _onSelectionChangedObserver;
    private _onGraphNodeRemovalObserver;
    private _onExposePortOnFrameObserver;
    private _onNodeLinkDisposedObservers;
    private _isCollapsed;
    private _frameInPorts;
    private _frameOutPorts;
    private _controlledPorts;
    private _exposedInPorts;
    private _exposedOutPorts;
    private _id;
    private _comments;
    private _frameIsResizing;
    private _resizingDirection;
    private _minFrameHeight;
    private _minFrameWidth;
    private _mouseXLimit;
    onExpandStateChanged: Observable<GraphFrame>;
    private readonly _closeSVG;
    private readonly _expandSVG;
    private readonly _collapseSVG;
    private readonly _focusSVG;
    get id(): number;
    get isCollapsed(): boolean;
    private _createInputPort;
    private _markFramePortPositions;
    private _createFramePorts;
    private _removePortFromExposedWithNode;
    private _removePortFromExposedWithLink;
    private _createInputPorts;
    private _createOutputPorts;
    redrawFramePorts(): void;
    set isCollapsed(value: boolean);
    get nodes(): GraphNode[];
    get ports(): FrameNodePort[];
    get name(): string;
    set name(value: string);
    get color(): Color3;
    set color(value: Color3);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    get comments(): string;
    set comments(comments: string);
    constructor(candidate: Nullable<HTMLDivElement>, canvas: GraphCanvasComponent, doNotCaptureNodes?: boolean);
    private _isFocused;
    /**
     * Enter/leave focus mode
     */
    switchFocusMode(): void;
    refresh(): void;
    addNode(node: GraphNode): void;
    removeNode(node: GraphNode): void;
    syncNode(node: GraphNode): void;
    cleanAccumulation(): void;
    private _onDown;
    move(newX: number, newY: number, align?: boolean): void;
    private _onUp;
    _moveFrame(offsetX: number, offsetY: number): void;
    private _onMove;
    moveFramePortUp(nodePort: FrameNodePort): void;
    private _movePortUp;
    moveFramePortDown(nodePort: FrameNodePort): void;
    private _movePortDown;
    private _initResizing;
    private _cleanUpResizing;
    private _updateMinHeightWithComments;
    private _isResizingTop;
    private _isResizingRight;
    private _isResizingBottom;
    private _isResizingLeft;
    private _onRightHandlePointerDown;
    private _onRightHandlePointerMove;
    private _moveRightHandle;
    private _onRightHandlePointerUp;
    private _onBottomHandlePointerDown;
    private _onBottomHandlePointerMove;
    private _moveBottomHandle;
    private _onBottomHandlePointerUp;
    private _onLeftHandlePointerDown;
    private _onLeftHandlePointerMove;
    private _moveLeftHandle;
    private _onLeftHandlePointerUp;
    private _onTopHandlePointerDown;
    private _onTopHandlePointerMove;
    private _moveTopHandle;
    private _onTopHandlePointerUp;
    private _onTopRightHandlePointerDown;
    private _onTopRightHandlePointerMove;
    private _moveTopRightHandle;
    private _onTopRightHandlePointerUp;
    private _onBottomRightHandlePointerDown;
    private _onBottomRightHandlePointerMove;
    private _moveBottomRightHandle;
    private _onBottomRightHandlePointerUp;
    private _onBottomLeftHandlePointerDown;
    private _onBottomLeftHandlePointerMove;
    private _moveBottomLeftHandle;
    private _onBottomLeftHandlePointerUp;
    private _onTopLeftHandlePointerDown;
    private _onTopLeftHandlePointerMove;
    private _moveTopLeftHandle;
    private _onTopLeftHandlePointerUp;
    private _expandLeft;
    private _expandTop;
    private _expandRight;
    private _expandBottom;
    dispose(): void;
    private _serializePortData;
    serialize(saveCollapsedState: boolean): IFrameData;
    export(): void;
    adjustPorts(): void;
    static Parse(serializationData: IFrameData, canvas: GraphCanvasComponent, map?: {
        [key: number]: number;
    }): GraphFrame;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/graphCanvas" {
import * as React from "react";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { Nullable } from "babylonjs/types";
import { NodeLink } from "babylonjs-inspector/nodeGraphSystem/nodeLink";
import { NodePort } from "babylonjs-inspector/nodeGraphSystem/nodePort";
import { GraphFrame } from "babylonjs-inspector/nodeGraphSystem/graphFrame";
import { IEditorData, IFrameData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeLocationInfo";
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
import { INodeContainer } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeContainer";
export interface IGraphCanvasComponentProps {
    stateManager: StateManager;
    onEmitNewNode: (nodeData: INodeData) => GraphNode;
}
export class GraphCanvasComponent extends React.Component<IGraphCanvasComponentProps> implements INodeContainer {
    static readonly NodeWidth: number;
    private readonly _minZoom;
    private readonly _maxZoom;
    private _hostCanvasRef;
    private _hostCanvas;
    private _graphCanvasRef;
    private _graphCanvas;
    private _selectionContainerRef;
    private _selectionContainer;
    private _frameContainerRef;
    private _frameContainer;
    private _svgCanvasRef;
    private _svgCanvas;
    private _rootContainerRef;
    private _rootContainer;
    private _nodes;
    private _links;
    private _mouseStartPointX;
    private _mouseStartPointY;
    private _dropPointX;
    private _dropPointY;
    private _selectionStartX;
    private _selectionStartY;
    private _candidateLinkedHasMoved;
    private _x;
    private _y;
    private _lastx;
    private _lasty;
    private _zoom;
    private _selectedNodes;
    private _selectedLink;
    private _selectedPort;
    private _candidateLink;
    private _candidatePort;
    private _gridSize;
    private _selectionBox;
    private _selectedFrames;
    private _frameCandidate;
    private _frames;
    private _nodeDataContentList;
    private _altKeyIsPressed;
    private _shiftKeyIsPressed;
    private _multiKeyIsPressed;
    private _oldY;
    _frameIsMoving: boolean;
    _isLoading: boolean;
    _targetLinkCandidate: Nullable<NodeLink>;
    private _isCopyingOrPasting;
    private _copiedNodes;
    private _copiedFrames;
    get gridSize(): number;
    set gridSize(value: number);
    get stateManager(): StateManager;
    get nodes(): GraphNode[];
    get links(): NodeLink[];
    get frames(): GraphFrame[];
    get zoom(): number;
    set zoom(value: number);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get selectedNodes(): GraphNode[];
    get selectedLink(): Nullable<NodeLink>;
    get selectedFrames(): GraphFrame[];
    get selectedPort(): Nullable<NodePort>;
    get canvasContainer(): HTMLDivElement;
    get hostCanvas(): HTMLDivElement;
    get svgCanvas(): HTMLElement;
    get selectionContainer(): HTMLDivElement;
    get frameContainer(): HTMLDivElement;
    private _selectedFrameAndNodesConflict;
    constructor(props: IGraphCanvasComponentProps);
    populateConnectedEntriesBeforeRemoval(item: GraphNode, items: GraphNode[], inputs: Nullable<IPortData>[], outputs: Nullable<IPortData>[]): void;
    automaticRewire(inputs: Nullable<IPortData>[], outputs: Nullable<IPortData>[], firstOnly?: boolean): void;
    smartAddOverLink(node: GraphNode, link: NodeLink): void;
    smartAddOverNode(node: GraphNode, source: GraphNode): void;
    deleteSelection(onRemove: (nodeData: INodeData) => void, autoReconnect?: boolean): void;
    handleKeyDownAsync(evt: KeyboardEvent, onRemove: (nodeData: INodeData) => void, mouseLocationX: number, mouseLocationY: number, dataGenerator: (nodeData: INodeData) => Promise<Nullable<GraphNode>>, rootElement: HTMLDivElement): Promise<void>;
    pasteSelectionAsync(copiedNodes: GraphNode[], currentX: number, currentY: number, dataGenerator: (nodeData: INodeData) => Promise<Nullable<GraphNode>>, selectNew?: boolean): Promise<GraphNode[]>;
    reconnectNewNodes(nodeIndex: number, newNodes: GraphNode[], sourceNodes: GraphNode[], done: boolean[]): void;
    getCachedData(): any[];
    removeDataFromCache(data: any): void;
    createNodeFromObject(nodeData: INodeData, onNodeCreated: (data: any) => void, recursion?: boolean): GraphNode;
    getGridPosition(position: number, useCeil?: boolean): number;
    getGridPositionCeil(position: number): number;
    updateTransform(): void;
    onKeyUp(): void;
    findNodeFromData(data: any): GraphNode;
    reset(): void;
    connectPorts(pointA: IPortData, pointB: IPortData): void;
    removeLink(link: NodeLink): void;
    appendNode(nodeData: INodeData): GraphNode;
    distributeGraph(): void;
    componentDidMount(): void;
    onMove(evt: React.PointerEvent): void;
    onDown(evt: React.PointerEvent<HTMLElement>): void;
    onUp(evt: React.PointerEvent): void;
    onWheel(evt: React.WheelEvent): void;
    zoomToFit(): void;
    processCandidatePort(): void;
    connectNodes(nodeA: GraphNode, pointA: IPortData, nodeB: GraphNode, pointB: IPortData): void;
    drop(newNode: GraphNode, targetX: number, targetY: number, offsetX: number, offsetY: number): void;
    processEditorData(editorData: IEditorData): void;
    reOrganize(editorData?: Nullable<IEditorData>, isImportingAFrame?: boolean): void;
    addFrame(frameData: IFrameData): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/frameNodePort" {
import { IDisplayManager } from "babylonjs-inspector/nodeGraphSystem/interfaces/displayManager";
import { Observable } from "babylonjs/Misc/observable";
import { Nullable } from "babylonjs/types";
import { IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
import { NodePort } from "babylonjs-inspector/nodeGraphSystem/nodePort";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { FramePortPosition } from "babylonjs-inspector/nodeGraphSystem/graphFrame";
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
export class FrameNodePort extends NodePort {
    portData: IPortData;
    node: GraphNode;
    private _parentFrameId;
    private _isInput;
    private _framePortPosition;
    private _framePortId;
    private _onFramePortPositionChangedObservable;
    get parentFrameId(): number;
    get onFramePortPositionChangedObservable(): Observable<FrameNodePort>;
    get isInput(): boolean;
    get framePortId(): number;
    get framePortPosition(): FramePortPosition;
    set framePortPosition(position: FramePortPosition);
    constructor(portContainer: HTMLElement, portData: IPortData, node: GraphNode, stateManager: StateManager, isInput: boolean, framePortId: number, parentFrameId: number);
    static CreateFrameNodePortElement(portData: IPortData, node: GraphNode, root: HTMLElement, displayManager: Nullable<IDisplayManager>, stateManager: StateManager, isInput: boolean, framePortId: number, parentFrameId: number): FrameNodePort;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/displayLedger" {
export class DisplayLedger {
    static RegisteredControls: {
        [key: string]: any;
    };
}

}
declare module "babylonjs-inspector/nodeGraphSystem/automaticProperties" {
import { IEditablePropertyOption } from "babylonjs/Decorators/nodeDecorator";
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
/**
 * Function used to force a rebuild of the node system
 * @param source source object
 * @param stateManager defines the state manager to use
 * @param propertyName name of the property that has been changed
 * @param notifiers list of notifiers to use
 * @param engageActiveRefresh if active refresh should be engaged
 */
export function ForceRebuild(source: any, stateManager: StateManager, propertyName: string, notifiers?: IEditablePropertyOption["notifiers"], engageActiveRefresh?: boolean): void;

}
declare module "babylonjs-inspector/nodeGraphSystem/types/framePortData" {
import { GraphFrame } from "babylonjs-inspector/nodeGraphSystem/graphFrame";
import { FrameNodePort } from "babylonjs-inspector/nodeGraphSystem/frameNodePort";
export type FramePortData = {
    frame: GraphFrame;
    port: FrameNodePort;
};

}
declare module "babylonjs-inspector/nodeGraphSystem/interfaces/selectionChangedOptions" {
import { Nullable } from "babylonjs/types";
import { GraphFrame } from "babylonjs-inspector/nodeGraphSystem/graphFrame";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { NodeLink } from "babylonjs-inspector/nodeGraphSystem/nodeLink";
import { NodePort } from "babylonjs-inspector/nodeGraphSystem/nodePort";
import { FramePortData } from "babylonjs-inspector/nodeGraphSystem/types/framePortData";
export interface ISelectionChangedOptions {
    selection: Nullable<GraphNode | NodeLink | GraphFrame | NodePort | FramePortData>;
    forceKeepSelection?: boolean;
    marqueeSelection?: boolean;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/interfaces/propertyComponentProps" {
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData";
export interface IPropertyComponentProps {
    stateManager: StateManager;
    nodeData: INodeData;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/interfaces/portData" {
import { Nullable } from "babylonjs/types";
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
export enum PortDataDirection {
    /** Input */
    Input = 0,
    /** Output */
    Output = 1
}
export enum PortDirectValueTypes {
    Float = 0,
    Int = 1
}
export interface IPortDirectValueDefinition {
    /**
     * Gets the source object
     */
    source: any;
    /**
     * Gets the property name used to store the value
     */
    propertyName: string;
    /**
     * Gets or sets the min value accepted for this point if nothing is connected
     */
    valueMin: Nullable<any>;
    /**
     * Gets or sets the max value accepted for this point if nothing is connected
     */
    valueMax: Nullable<any>;
    /**
     * Gets or sets the type of the value
     */
    valueType: PortDirectValueTypes;
}
export interface IPortData {
    data: any;
    name: string;
    internalName: string;
    isExposedOnFrame: boolean;
    exposedPortPosition: number;
    isConnected: boolean;
    isInactive: boolean;
    direction: PortDataDirection;
    ownerData: any;
    connectedPort: Nullable<IPortData>;
    needDualDirectionValidation: boolean;
    hasEndpoints: boolean;
    endpoints: Nullable<IPortData[]>;
    directValueDefinition?: IPortDirectValueDefinition;
    updateDisplayName: (newName: string) => void;
    canConnectTo: (port: IPortData) => boolean;
    connectTo: (port: IPortData) => void;
    disconnectFrom: (port: IPortData) => void;
    checkCompatibilityState(port: IPortData): number;
    getCompatibilityIssueMessage(issue: number, targetNode: GraphNode, targetPort: IPortData): string;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/interfaces/nodeLocationInfo" {
export interface INodeLocationInfo {
    blockId: number;
    x: number;
    y: number;
    isCollapsed: boolean;
}
export interface IFrameData {
    x: number;
    y: number;
    width: number;
    height: number;
    color: number[];
    name: string;
    isCollapsed: boolean;
    blocks: number[];
    comments: string;
}
export interface IEditorData {
    locations: INodeLocationInfo[];
    x: number;
    y: number;
    zoom: number;
    frames?: IFrameData[];
    map?: {
        [key: number]: number;
    };
}

}
declare module "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData" {
import { Nullable } from "babylonjs/types";
import { IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
export interface INodeData {
    data: any;
    name: string;
    uniqueId: number;
    isInput: boolean;
    comments: string;
    executionTime?: number;
    refreshCallback?: () => void;
    prepareHeaderIcon: (iconDiv: HTMLDivElement, img: HTMLImageElement) => void;
    getClassName: () => string;
    dispose: () => void;
    getPortByName: (name: string) => Nullable<IPortData>;
    inputs: IPortData[];
    outputs: IPortData[];
    invisibleEndpoints?: Nullable<any[]>;
    isConnectedToOutput?: () => boolean;
    isActive?: boolean;
    setIsActive?: (value: boolean) => void;
    canBeActivated?: boolean;
    onInputCountChanged?: () => void;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/interfaces/nodeContainer" {
import { GraphNode } from "babylonjs-inspector/nodeGraphSystem/graphNode";
import { INodeData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData";
export interface INodeContainer {
    nodes: GraphNode[];
    appendNode(data: INodeData): GraphNode;
}

}
declare module "babylonjs-inspector/nodeGraphSystem/interfaces/displayManager" {
import { Nullable } from "babylonjs/types";
import { StateManager } from "babylonjs-inspector/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-inspector/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-inspector/nodeGraphSystem/interfaces/portData";
export interface VisualContentDescription {
    [key: string]: HTMLElement;
}
export interface IDisplayManager {
    getHeaderClass(data: INodeData): string;
    shouldDisplayPortLabels(data: IPortData): boolean;
    updatePreviewContent(data: INodeData, contentArea: HTMLDivElement): void;
    updateFullVisualContent?(data: INodeData, visualContent: VisualContentDescription): void;
    getBackgroundColor(data: INodeData): string;
    getHeaderText(data: INodeData): string;
    onSelectionChanged?(data: INodeData, selectedData: Nullable<INodeData>, manager: StateManager): void;
    onDispose?(nodeData: INodeData, manager: StateManager): void;
}

}
declare module "babylonjs-inspector/lines/vector4LineComponent" {
import * as React from "react";
import { Vector4 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IVector4LineComponentProps {
    label: string;
    target?: any;
    propertyName?: string;
    step?: number;
    onChange?: (newvalue: Vector4) => void;
    useEuler?: boolean;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    icon?: string;
    iconLabel?: string;
    value?: Vector4;
    lockObject: LockObject;
}
export class Vector4LineComponent extends React.Component<IVector4LineComponentProps, {
    isExpanded: boolean;
    value: Vector4;
}> {
    static defaultProps: {
        step: number;
    };
    private _localChange;
    constructor(props: IVector4LineComponentProps);
    getCurrentValue(): any;
    shouldComponentUpdate(nextProps: IVector4LineComponentProps, nextState: {
        isExpanded: boolean;
        value: Vector4;
    }): boolean;
    switchExpandState(): void;
    raiseOnPropertyChanged(previousValue: Vector4): void;
    updateVector4(): void;
    updateStateX(value: number): void;
    updateStateY(value: number): void;
    updateStateZ(value: number): void;
    updateStateW(value: number): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/vector3LineComponent" {
import * as React from "react";
import { Vector3 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IVector3LineComponentProps {
    label: string;
    target?: any;
    propertyName?: string;
    step?: number;
    onChange?: (newvalue: Vector3) => void;
    useEuler?: boolean;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    noSlider?: boolean;
    icon?: string;
    iconLabel?: string;
    lockObject: LockObject;
    directValue?: Vector3;
    additionalCommands?: JSX.Element[];
}
export class Vector3LineComponent extends React.Component<IVector3LineComponentProps, {
    isExpanded: boolean;
    value: Vector3;
}> {
    static defaultProps: {
        step: number;
    };
    private _localChange;
    constructor(props: IVector3LineComponentProps);
    getCurrentValue(): any;
    shouldComponentUpdate(nextProps: IVector3LineComponentProps, nextState: {
        isExpanded: boolean;
        value: Vector3;
    }): boolean;
    switchExpandState(): void;
    raiseOnPropertyChanged(previousValue: Vector3): void;
    updateVector3(): void;
    updateStateX(value: number): void;
    updateStateY(value: number): void;
    updateStateZ(value: number): void;
    onCopyClick(): string;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/vector2LineComponent" {
import * as React from "react";
import { Vector2 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IVector2LineComponentProps {
    label: string;
    target: any;
    propertyName: string;
    step?: number;
    onChange?: (newvalue: Vector2) => void;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    icon?: string;
    iconLabel?: string;
    lockObject: LockObject;
}
export class Vector2LineComponent extends React.Component<IVector2LineComponentProps, {
    isExpanded: boolean;
    value: Vector2;
}> {
    static defaultProps: {
        step: number;
    };
    private _localChange;
    constructor(props: IVector2LineComponentProps);
    shouldComponentUpdate(nextProps: IVector2LineComponentProps, nextState: {
        isExpanded: boolean;
        value: Vector2;
    }): boolean;
    switchExpandState(): void;
    raiseOnPropertyChanged(previousValue: Vector2): void;
    updateStateX(value: number): void;
    updateStateY(value: number): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/valueLineComponent" {
import * as React from "react";
interface IValueLineComponentProps {
    label: string;
    value: number;
    color?: string;
    fractionDigits?: number;
    units?: string;
    icon?: string;
    iconLabel?: string;
}
export class ValueLineComponent extends React.Component<IValueLineComponentProps> {
    constructor(props: IValueLineComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/unitButton" {
interface IUnitButtonProps {
    unit: string;
    locked?: boolean;
    onClick?: (unit: string) => void;
}
export function UnitButton(props: IUnitButtonProps): import("react/jsx-runtime").JSX.Element;
export {};

}
declare module "babylonjs-inspector/lines/textureButtonLineComponent" {
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { Scene } from "babylonjs/scene";
import * as React from "react";
interface ITextureButtonLineProps {
    label: string;
    scene: Scene;
    onClick: (file: File) => void;
    onLink: (texture: BaseTexture) => void;
    accept: string;
}
interface ITextureButtonLineState {
    isOpen: boolean;
}
export class TextureButtonLine extends React.Component<ITextureButtonLineProps, ITextureButtonLineState> {
    private static _IdGenerator;
    private _id;
    private _uploadInputRef;
    constructor(props: ITextureButtonLineProps);
    onChange(evt: any): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/textLineComponent" {
import * as React from "react";
interface ITextLineComponentProps {
    label?: string;
    value?: string;
    color?: string;
    underline?: boolean;
    onLink?: () => void;
    url?: string;
    ignoreValue?: boolean;
    additionalClass?: string;
    icon?: string;
    iconLabel?: string;
    tooltip?: string;
    onCopy?: true | (() => string);
}
export class TextLineComponent extends React.Component<ITextLineComponentProps> {
    constructor(props: ITextLineComponentProps);
    onLink(): void;
    copyFn(): (() => string) | undefined;
    renderContent(isLink: boolean, tooltip: string): import("react/jsx-runtime").JSX.Element | null;
    renderOriginal(isLink: boolean, tooltip: string): import("react/jsx-runtime").JSX.Element;
    renderFluent(isLink: boolean, tooltip: string): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/textInputLineComponent" {
import { ReactNode, KeyboardEvent } from "react";
import { Component } from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface ITextInputLineComponentProps {
    label?: string;
    lockObject?: LockObject;
    target?: any;
    propertyName?: string;
    value?: string;
    onChange?: (value: string) => void;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    icon?: string;
    iconLabel?: string;
    noUnderline?: boolean;
    numbersOnly?: boolean;
    delayInput?: boolean;
    arrows?: boolean;
    arrowsIncrement?: (amount: number) => void;
    step?: number;
    numeric?: boolean;
    roundValues?: boolean;
    min?: number;
    max?: number;
    placeholder?: string;
    unit?: ReactNode;
    validator?: (value: string) => boolean;
    multilines?: boolean;
    throttlePropertyChangedNotification?: boolean;
    throttlePropertyChangedNotificationDelay?: number;
    disabled?: boolean;
}
export class TextInputLineComponent extends Component<ITextInputLineComponentProps, {
    value: string;
    dragging: boolean;
}> {
    private _localChange;
    constructor(props: ITextInputLineComponentProps);
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: ITextInputLineComponentProps, nextState: {
        value: string;
        dragging: boolean;
    }): boolean;
    raiseOnPropertyChanged(newValue: string, previousValue: string): void;
    getCurrentNumericValue(value: string): number;
    updateValue(value: string, valueToValidate?: string): void;
    incrementValue(amount: number): void;
    onKeyDown(event: KeyboardEvent): void;
    renderFluent(value: string, placeholder: string, step: number): import("react/jsx-runtime").JSX.Element;
    renderOriginal(value: string, placeholder: string, step: number): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/lines/targetsProxy" {
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { Observable } from "babylonjs/Misc/observable";
export const conflictingValuesPlaceholder = "\u2014";
/**
 *
 * @param targets a list of selected targets
 * @param onPropertyChangedObservable
 * @param getProperty
 * @returns a proxy object that can be passed as a target into the input
 */
export function makeTargetsProxy<Type>(targets: Type[], onPropertyChangedObservable?: Observable<PropertyChangedEvent>, getProperty?: (target: Type, property: keyof Type) => any): any;

}
declare module "babylonjs-inspector/lines/sliderLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface ISliderLineComponentProps {
    label: string;
    target?: any;
    propertyName?: string;
    minimum: number;
    maximum: number;
    step: number;
    directValue?: number;
    useEuler?: boolean;
    onChange?: (value: number) => void;
    onInput?: (value: number) => void;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    decimalCount?: number;
    margin?: boolean;
    icon?: string;
    iconLabel?: string;
    lockObject: LockObject;
    unit?: React.ReactNode;
    allowOverflow?: boolean;
}
export class SliderLineComponent extends React.Component<ISliderLineComponentProps, {
    value: number;
}> {
    private _localChange;
    constructor(props: ISliderLineComponentProps);
    shouldComponentUpdate(nextProps: ISliderLineComponentProps, nextState: {
        value: number;
    }): boolean;
    onChange(newValueString: any): void;
    onInput(newValueString: any): void;
    prepareDataToRead(value: number): number;
    onCopyClick(): void;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/radioLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
interface IRadioButtonLineComponentProps {
    onSelectionChangedObservable: Observable<RadioButtonLineComponent>;
    label: string;
    isSelected: () => boolean;
    onSelect: () => void;
    icon?: string;
    iconLabel?: string;
}
export class RadioButtonLineComponent extends React.Component<IRadioButtonLineComponentProps, {
    isSelected: boolean;
}> {
    private _onSelectionChangedObserver;
    constructor(props: IRadioButtonLineComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    onChange(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/optionsLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { IInspectableOptions } from "babylonjs/Misc/iInspectable";
export const Null_Value: number;
export interface IOptionsLineProps {
    label: string;
    target: any;
    propertyName: string;
    options: readonly IInspectableOptions[];
    noDirectUpdate?: boolean;
    onSelect?: (value: number | string) => void;
    extractValue?: (target: any) => number | string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    allowNullValue?: boolean;
    icon?: string;
    iconLabel?: string;
    className?: string;
    valuesAreStrings?: boolean;
    defaultIfNull?: number;
}
export class OptionsLine extends React.Component<IOptionsLineProps, {
    value: number | string;
}> {
    private _localChange;
    private _remapValueIn;
    private _remapValueOut;
    private _getValue;
    constructor(props: IOptionsLineProps);
    shouldComponentUpdate(nextProps: IOptionsLineProps, nextState: {
        value: number;
    }): boolean;
    raiseOnPropertyChanged(newValue: number, previousValue: number): void;
    setValue(value: string | number): void;
    updateValue(valueString: string): void;
    onCopyClickStr(): string;
    private _renderFluent;
    private _renderOriginal;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/lines/numericInputComponent" {
import * as React from "react";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface INumericInputProps {
    label: string;
    labelTooltip?: string;
    value: number;
    step?: number;
    onChange: (value: number) => void;
    precision?: number;
    icon?: string;
    iconLabel?: string;
    lockObject: LockObject;
}
export class NumericInput extends React.Component<INumericInputProps, {
    value: string;
}> {
    static defaultProps: {
        step: number;
    };
    private _localChange;
    constructor(props: INumericInputProps);
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: INumericInputProps, nextState: {
        value: string;
    }): boolean;
    updateValue(valueString: string): void;
    onBlur(): void;
    incrementValue(amount: number): void;
    onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/messageLineComponent" {
import * as React from "react";

interface IMessageLineComponentProps {
    text: string;
    color?: string;
    icon?: any;
}
export class MessageLineComponent extends React.Component<IMessageLineComponentProps> {
    constructor(props: IMessageLineComponentProps);
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/matrixLineComponent" {
import * as React from "react";
import { Vector3, Vector4 } from "babylonjs/Maths/math.vector";
import { Matrix } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IMatrixLineComponentProps {
    label: string;
    target: any;
    propertyName: string;
    step?: number;
    onChange?: (newValue: Matrix) => void;
    onModeChange?: (mode: number) => void;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    mode?: number;
    lockObject: LockObject;
}
export class MatrixLineComponent extends React.Component<IMatrixLineComponentProps, {
    value: Matrix;
    mode: number;
    angle: number;
}> {
    private _localChange;
    constructor(props: IMatrixLineComponentProps);
    shouldComponentUpdate(nextProps: IMatrixLineComponentProps, nextState: {
        value: Matrix;
        mode: number;
        angle: number;
    }): boolean;
    raiseOnPropertyChanged(previousValue: Vector3): void;
    updateMatrix(): void;
    updateRow(value: Vector4, row: number): void;
    updateBasedOnMode(value: number): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/linkButtonComponent" {
import * as React from "react";

interface ILinkButtonComponentProps {
    label: string;
    buttonLabel: string;
    url?: string;
    onClick: () => void;
    icon?: any;
    onIconClick?: () => void;
}
export class LinkButtonComponent extends React.Component<ILinkButtonComponentProps> {
    constructor(props: ILinkButtonComponentProps);
    onLink(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/lineWithFileButtonComponent" {
import * as React from "react";
interface ILineWithFileButtonComponentProps {
    title: string;
    closed?: boolean;
    multiple?: boolean;
    label: string;
    iconImage: any;
    onIconClick: (file: File) => void;
    accept: string;
    uploadName?: string;
}
export class LineWithFileButtonComponent extends React.Component<ILineWithFileButtonComponentProps, {
    isExpanded: boolean;
}> {
    private _uploadRef;
    constructor(props: ILineWithFileButtonComponentProps);
    onChange(evt: any): void;
    switchExpandedState(): void;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/lineContainerComponent" {
import * as React from "react";
import { ISelectedLineContainer } from "babylonjs-inspector/lines/iSelectedLineContainer";
interface ILineContainerComponentProps {
    selection?: ISelectedLineContainer;
    title: string;
    children: any[] | any;
    closed?: boolean;
}
export class LineContainerComponent extends React.Component<ILineContainerComponentProps, {
    isExpanded: boolean;
    isHighlighted: boolean;
}> {
    constructor(props: ILineContainerComponentProps);
    switchExpandedState(): void;
    renderHeader(): import("react/jsx-runtime").JSX.Element;
    componentDidMount(): void;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/inputArrowsComponent" {
import * as React from "react";
interface IInputArrowsComponentProps {
    incrementValue: (amount: number) => void;
    setDragging: (dragging: boolean) => void;
}
export class InputArrowsComponent extends React.Component<IInputArrowsComponentProps> {
    private _arrowsRef;
    private _drag;
    private _releaseListener;
    private _lockChangeListener;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/indentedTextLineComponent" {
import * as React from "react";
interface IIndentedTextLineComponentProps {
    value?: string;
    color?: string;
    underline?: boolean;
    onLink?: () => void;
    url?: string;
    additionalClass?: string;
}
export class IndentedTextLineComponent extends React.Component<IIndentedTextLineComponentProps> {
    constructor(props: IIndentedTextLineComponentProps);
    onLink(): void;
    renderContent(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/iconComponent" {
import * as React from "react";
interface IIconComponentProps {
    icon: string;
    label?: string;
}
export class IconComponent extends React.Component<IIconComponentProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/iSelectedLineContainer" {
export interface ISelectedLineContainer {
    selectedLineContainerTitles: Array<string>;
    selectedLineContainerTitlesNoFocus: Array<string>;
}

}
declare module "babylonjs-inspector/lines/hexLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IHexLineComponentProps {
    label: string;
    target: any;
    propertyName: string;
    lockObject?: LockObject;
    onChange?: (newValue: number) => void;
    isInteger?: boolean;
    replaySourceReplacement?: string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    additionalClass?: string;
    step?: string;
    digits?: number;
    useEuler?: boolean;
    min?: number;
    icon?: string;
    iconLabel?: string;
}
export class HexLineComponent extends React.Component<IHexLineComponentProps, {
    value: string;
}> {
    private _localChange;
    private _store;
    private _propertyChange;
    constructor(props: IHexLineComponentProps);
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: IHexLineComponentProps, nextState: {
        value: string;
    }): boolean;
    raiseOnPropertyChanged(newValue: number, previousValue: number): void;
    convertToHexString(valueString: string): string;
    updateValue(valueString: string, raisePropertyChanged: boolean): void;
    lock(): void;
    unlock(): void;
    onCopyClick(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/floatLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface IFloatLineComponentProps {
    label: string;
    target: any;
    propertyName: string;
    lockObject: LockObject;
    onChange?: (newValue: number) => void;
    isInteger?: boolean;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    additionalClass?: string;
    step?: string;
    digits?: number;
    useEuler?: boolean;
    min?: number;
    max?: number;
    smallUI?: boolean;
    onEnter?: (newValue: number) => void;
    icon?: string;
    iconLabel?: string;
    defaultValue?: number;
    arrows?: boolean;
    unit?: React.ReactNode;
    onDragStart?: (newValue: number) => void;
    onDragStop?: (newValue: number) => void;
    disabled?: boolean;
}
export class FloatLineComponent extends React.Component<IFloatLineComponentProps, {
    value: string;
    dragging: boolean;
}> {
    private _localChange;
    private _store;
    constructor(props: IFloatLineComponentProps);
    componentWillUnmount(): void;
    getValueString(value: any, props: IFloatLineComponentProps): string;
    shouldComponentUpdate(nextProps: IFloatLineComponentProps, nextState: {
        value: string;
        dragging: boolean;
    }): boolean;
    raiseOnPropertyChanged(newValue: number, previousValue: number): void;
    updateValue(valueString: string): void;
    lock(): void;
    unlock(): void;
    incrementValue(amount: number, processStep?: boolean): void;
    onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void;
    onCopyClick(): void;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/fileMultipleButtonLineComponent" {
import * as React from "react";
interface IFileMultipleButtonLineComponentProps {
    label: string;
    onClick: (event: any) => void;
    accept: string;
    icon?: string;
    iconLabel?: string;
}
export class FileMultipleButtonLineComponent extends React.Component<IFileMultipleButtonLineComponentProps> {
    private static _IdGenerator;
    private _id;
    private _uploadInputRef;
    constructor(props: IFileMultipleButtonLineComponentProps);
    onChange(evt: any): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/fileButtonLineComponent" {
import * as React from "react";
interface IFileButtonLineProps {
    label: string;
    onClick: (file: File) => void;
    accept: string;
    icon?: string;
    iconLabel?: string;
}
export class FileButtonLine extends React.Component<IFileButtonLineProps> {
    private static _IdGenerator;
    private _id;
    private _uploadInputRef;
    constructor(props: IFileButtonLineProps);
    onChange(evt: any): void;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/draggableLineWithButtonComponent" {
export type DraggableLineWithButtonProps = {
    format: string;
    data: string;
    tooltip: string;
    iconImage: any;
    onIconClick: (value: string) => void;
    iconTitle: string;
    lenSuffixToRemove?: number;
};
export const DraggableLineWithButtonComponent: React.FunctionComponent<DraggableLineWithButtonProps>;

}
declare module "babylonjs-inspector/lines/draggableLineComponent" {
import { DraggableLineProps } from "babylonjs-inspector/fluent/primitives/draggable";
type DraggableLineComponentProps = Omit<DraggableLineProps, "label">;
export const DraggableLineComponent: React.FunctionComponent<DraggableLineComponentProps>;
export {};

}
declare module "babylonjs-inspector/lines/colorPickerComponent" {
import * as React from "react";
import { Color4, Color3 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IColorPickerLineProps {
    value: Color4 | Color3;
    linearHint?: boolean;
    onColorChanged: (newOne: string) => void;
    icon?: string;
    iconLabel?: string;
    shouldPopRight?: boolean;
    lockObject?: LockObject;
}
interface IColorPickerComponentState {
    pickerEnabled: boolean;
    color: Color3 | Color4;
    hex: string;
}
export class ColorPickerLine extends React.Component<IColorPickerLineProps, IColorPickerComponentState> {
    private _floatRef;
    private _floatHostRef;
    constructor(props: IColorPickerLineProps);
    syncPositions(): void;
    shouldComponentUpdate(nextProps: IColorPickerLineProps, nextState: IColorPickerComponentState): boolean;
    getHexString(props?: Readonly<IColorPickerLineProps>): string;
    componentDidUpdate(): void;
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/colorLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Color4 } from "babylonjs/Maths/math.color";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IColorLineProps {
    label: string;
    target?: any;
    propertyName: string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    onChange?: () => void;
    isLinear?: boolean;
    icon?: string;
    iconLabel?: string;
    disableAlpha?: boolean;
    lockObject: LockObject;
}
interface IColorLineComponentState {
    isExpanded: boolean;
    color: Color4;
}
export class ColorLine extends React.Component<IColorLineProps, IColorLineComponentState> {
    constructor(props: IColorLineProps);
    shouldComponentUpdate(nextProps: IColorLineProps, nextState: IColorLineComponentState): boolean;
    getValue(props?: Readonly<IColorLineProps>): Color4;
    setColorFromString(colorString: string): void;
    setColor(newColor: Color4): void;
    switchExpandState(): void;
    updateStateR(value: number): void;
    updateStateG(value: number): void;
    updateStateB(value: number): void;
    updateStateA(value: number): void;
    private _convertToColor;
    private _toColor3;
    onCopyClick(): void;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/lines/color4LineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IColor4LineComponentProps {
    label: string;
    target?: any;
    propertyName: string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    onChange?: () => void;
    isLinear?: boolean;
    icon?: string;
    iconLabel?: string;
    lockObject: LockObject;
}
export class Color4LineComponent extends React.Component<IColor4LineComponentProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/lines/color3LineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IColor3LineComponentProps {
    label: string;
    target: any;
    propertyName: string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    isLinear?: boolean;
    icon?: string;
    lockObject: LockObject;
    iconLabel?: string;
    onChange?: () => void;
}
export class Color3LineComponent extends React.Component<IColor3LineComponentProps> {
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/lines/checkBoxLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-inspector/propertyChangedEvent";

export interface ICheckBoxLineComponentProps {
    label?: string;
    target?: any;
    propertyName?: string;
    isSelected?: boolean | (() => boolean);
    onSelect?: (value: boolean) => void;
    onValueChanged?: () => void;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    disabled?: boolean;
    icon?: string;
    iconLabel?: string;
    faIcons?: {
        enabled: any;
        disabled: any;
    };
    large?: boolean;
}
export class CheckBoxLineComponent extends React.Component<ICheckBoxLineComponentProps, {
    isSelected: boolean;
    isDisabled?: boolean;
    isConflict: boolean;
}> {
    private _localChange;
    constructor(props: ICheckBoxLineComponentProps);
    shouldComponentUpdate(nextProps: ICheckBoxLineComponentProps, nextState: {
        isSelected: boolean;
        isDisabled: boolean;
        isConflict: boolean;
    }): boolean;
    onChange(): void;
    onCopyClick(): void;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/lines/buttonLineComponent" {
import * as React from "react";
export interface IButtonLineComponentProps {
    label: string;
    onClick: () => void;
    icon?: string;
    iconLabel?: string;
    isDisabled?: boolean;
}
export class ButtonLineComponent extends React.Component<IButtonLineComponentProps> {
    constructor(props: IButtonLineComponentProps);
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/lines/booleanLineComponent" {
import * as React from "react";
export interface IBooleanLineComponentProps {
    label: string;
    value: boolean;
    icon?: string;
    iconLabel?: string;
}
export class BooleanLineComponent extends React.Component<IBooleanLineComponentProps> {
    constructor(props: IBooleanLineComponentProps);
    renderFluent(): import("react/jsx-runtime").JSX.Element;
    renderOriginal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/fluent/icons" {









}
declare module "babylonjs-inspector/fluent/primitives/utils" {

import { KeyboardEvent, FocusEvent } from "react";
export const TokenMap: {
    px2: string;
    px4: string;
    px6: string;
    px8: string;
    px10: string;
    px12: string;
    px14: string;
    px16: string;
    px20: string;
    px24: string;
    px28: string;
    px32: string;
    px36: string;
    px40: string;
};
export const CustomTokens: {
    inputWidth: string;
    lineHeight: string;
    lineHeightSmall: string;
    dividerGap: string;
    dividerGapSmall: string;
    labelMinWidth: string;
    sliderMinWidth: string;
    sliderMaxWidth: string;
    rightAlignOffset: string;
};
export const UniformWidthStyling: any;
export const useInputStyles: () => Record<"input" | "container" | "invalid" | "inputSlot", string>;
export function HandleOnBlur(event: FocusEvent<HTMLInputElement>): void;
export function HandleKeyDown(event: KeyboardEvent<HTMLInputElement>): void;
/**
 * Fluent's CalculatePrecision function
 * https://github.com/microsoft/fluentui/blob/dcbf775d37938eacffa37922fc0b43a3cdd5753f/packages/utilities/src/math.ts#L91C1
 *
 * Calculates a number's precision based on the number of trailing
 * zeros if the number does not have a decimal indicated by a negative
 * precision. Otherwise, it calculates the number of digits after
 * the decimal point indicated by a positive precision.
 *
 * @param value - the value to determine the precision of
 * @returns the calculated precision
 */
export function CalculatePrecision(value: number): number;
export function ValidateColorHex(val: string): boolean;

}
declare module "babylonjs-inspector/fluent/primitives/uploadButton" {
import { FunctionComponent } from "react";
import { ButtonProps } from "babylonjs-inspector/fluent/primitives/button";
type UploadButtonProps = Omit<ButtonProps, "onClick" | "icon"> & {
    /**
     * Callback when files are selected
     */
    onUpload: (files: FileList) => void;
    /**
     * File types to accept (e.g., ".jpg, .png, .dds")
     */
    accept?: string;
    /**
     * Text label to display on the button (optional)
     */
    label?: string;
};
/**
 * A button that triggers a file upload dialog.
 * Combines a Button with a hidden file input.
 * @param props UploadButtonProps
 * @returns UploadButton component
 */
export const UploadButton: FunctionComponent<UploadButtonProps>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/tooltip" {
import { Nullable } from "babylonjs/index";
import { ReactElement } from "react";
export type TooltipProps = {
    content?: Nullable<string>;
    children: ReactElement;
};
export const Tooltip: import("react").ForwardRefExoticComponent<TooltipProps & import("react").RefAttributes<HTMLElement>>;

}
declare module "babylonjs-inspector/fluent/primitives/toggleButton" {
import { ButtonProps } from "babylonjs-inspector/fluent/primitives/button";
import { FunctionComponent } from "react";

type ToggleButtonProps = Omit<ButtonProps, "icon" | "onClick"> & {
    value: boolean;
    checkedIcon: any;
    uncheckedIcon?: any;
    onChange: (checked: boolean) => void;
};
/**
 * Toggles between two states using a button with icons.
 * If no disabledIcon is provided, the button will toggle between visual enabled/disabled states without an icon change
 *
 * @param props
 * @returns
 */
export const ToggleButton: FunctionComponent<ToggleButtonProps>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/toast" {
import { FunctionComponent, PropsWithChildren } from "react";
type ToastContextType = {
    showToast: (message: string) => void;
};
export const ToastProvider: FunctionComponent<PropsWithChildren>;
/**
 * Hook to show toast notifications.
 * @returns Object with showToast function that accepts a message string
 */
export function useToast(): ToastContextType;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/textureSelector" {
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-inspector/fluent/primitives/entitySelector";
export type TextureSelectorProps = PrimitiveProps<Nullable<BaseTexture>> & {
    /**
     * The scene to get textures from
     */
    scene: Scene;
    /**
     * File types to accept for upload
     */
    accept?: string;
    /**
     * Whether to only allow cube textures
     */
    cubeOnly?: boolean;
} & Omit<EntitySelectorProps<BaseTexture>, "getEntities" | "getName">;
/**
 * A primitive component with a ComboBox for selecting from existing scene textures
 * and a button for uploading new texture files.
 * @param props TextureSelectorProps
 * @returns TextureSelector component
 */
export const TextureSelector: FunctionComponent<TextureSelectorProps>;

}
declare module "babylonjs-inspector/fluent/primitives/textarea" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type TextareaProps = PrimitiveProps<string> & {
    placeholder?: string;
};
/**
 * This is a texarea box that stops propagation of change/keydown events
 * @param props
 * @returns
 */
export const Textarea: FunctionComponent<TextareaProps>;

}
declare module "babylonjs-inspector/fluent/primitives/textInput" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type TextInputProps = PrimitiveProps<string> & {
    validator?: (value: string) => boolean;
    validateOnlyOnBlur?: boolean;
};
export const TextInput: FunctionComponent<TextInputProps>;

}
declare module "babylonjs-inspector/fluent/primitives/syncedSlider" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type SyncedSliderProps = PrimitiveProps<number> & {
    /** Minimum value for the slider */
    min?: number;
    /** Maximum value for the slider */
    max?: number;
    /** Step size for the slider */
    step?: number;
    /** Displayed in the ux to indicate unit of measurement */
    unit?: string;
    /** When true, onChange is only called when the user releases the slider, not during drag */
    notifyOnlyOnRelease?: boolean;
    /** When true, slider grows to fill space and SpinButton is fixed at 65px */
    compact?: boolean;
    /** When true, slider grows to fill all available space (no maxWidth constraint) */
    growSlider?: boolean;
};
/**
 * Component which synchronizes a slider and an input field, allowing the user to change the value using either control
 * @param props
 * @returns SyncedSlider component
 */
export const SyncedSliderInput: FunctionComponent<SyncedSliderProps>;

}
declare module "babylonjs-inspector/fluent/primitives/switch" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type SwitchProps = PrimitiveProps<boolean>;
/**
 * This is a primitive fluent boolean switch component whose only knowledge is the shared styling across all tools
 * @param props
 * @returns Switch component
 */
export const Switch: FunctionComponent<SwitchProps>;

}
declare module "babylonjs-inspector/fluent/primitives/spinButton" {
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type SpinButtonProps = PrimitiveProps<number> & {
    min?: number;
    max?: number;
    /** Determines how much the spinbutton increments with the arrow keys. Note this also determines the precision value (# of decimals in display value)
     * i.e. if step = 1, precision = 0. step = 0.0089, precision = 4. step = 300, precision = 2. step = 23.00, precision = 2. */
    step?: number;
    unit?: string;
    forceInt?: boolean;
    validator?: (value: number) => boolean;
    /** Optional className for the input element */
    inputClassName?: string;
};
export const SpinButton: import("react").ForwardRefExoticComponent<import("babylonjs-inspector/fluent/primitives/primitive").BasePrimitiveProps & {
    value: number;
    infoLabel?: import("babylonjs-inspector/fluent/primitives/infoLabel").InfoLabelParentProps;
} & {
    onChange: (value: number) => void;
} & {
    min?: number;
    max?: number;
    /** Determines how much the spinbutton increments with the arrow keys. Note this also determines the precision value (# of decimals in display value)
     * i.e. if step = 1, precision = 0. step = 0.0089, precision = 4. step = 300, precision = 2. step = 23.00, precision = 2. */
    step?: number;
    unit?: string;
    forceInt?: boolean;
    validator?: (value: number) => boolean;
    /** Optional className for the input element */
    inputClassName?: string;
} & import("react").RefAttributes<HTMLInputElement>>;

}
declare module "babylonjs-inspector/fluent/primitives/skeletonSelector" {
import { FunctionComponent } from "react";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { Skeleton } from "babylonjs/Bones/skeleton";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-inspector/fluent/primitives/entitySelector";
export type SkeletonSelectorProps = PrimitiveProps<Nullable<Skeleton>> & {
    /**
     * The scene to get skeletons from
     */
    scene: Scene;
    /**
     * Optional filter function to filter which skeletons are shown
     */
    filter?: (skeleton: Skeleton) => boolean;
} & Omit<EntitySelectorProps<Skeleton>, "getEntities" | "getName">;
/**
 * A primitive component with a ComboBox for selecting from existing scene skeletons.
 * @param props SkeletonSelectorProps
 * @returns SkeletonSelector component
 */
export const SkeletonSelector: FunctionComponent<SkeletonSelectorProps>;

}
declare module "babylonjs-inspector/fluent/primitives/searchBox" {
import { FunctionComponent } from "react";
type SearchBoxProps = {
    items: string[];
    onItemSelected: (item: string) => void;
    title?: string;
};
/**
 * SearchBox component that displays a popup with search functionality
 * @param props - The component props
 * @returns The search box component
 */
export const SearchBox: FunctionComponent<SearchBoxProps>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/searchBar" {
type SearchProps = {
    onChange: (val: string) => void;
    placeholder?: string;
};
export const SearchBar: import("react").ForwardRefExoticComponent<SearchProps & import("react").RefAttributes<HTMLInputElement>>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/primitive" {
import { InfoLabelParentProps } from "babylonjs-inspector/fluent/primitives/infoLabel";
export type BasePrimitiveProps = {
    /**
     * Optional flag to disable the component, preventing any interaction.
     */
    disabled?: boolean;
    /**
     * Optional class name to apply custom styles to the component.
     */
    className?: string;
    /**
     * Optional style object to apply custom inline styles to the top-level HTML element.
     */
    style?: React.CSSProperties;
    /**
     * Optional title for the component, used for tooltips or accessibility.
     */
    title?: string;
};
export type ImmutablePrimitiveProps<ValueT> = BasePrimitiveProps & {
    /**
     * The value of the property to be displayed and modified.
     */
    value: ValueT;
    /**
     * Optional information to display as an infoLabel popup aside the component.
     */
    infoLabel?: InfoLabelParentProps;
};
export type PrimitiveProps<T> = ImmutablePrimitiveProps<T> & {
    /**
     * Called when the primitive value changes
     */
    onChange: (value: T) => void;
};

}
declare module "babylonjs-inspector/fluent/primitives/positionedPopover" {
import { FunctionComponent, PropsWithChildren } from "react";
type PositionedPopoverProps = {
    x: number;
    y: number;
    visible: boolean;
    hide: () => void;
};
/**
 * PositionedPopover component that shows a popover at specific coordinates
 * @param props - The component props
 * @returns The positioned popover component
 */
export const PositionedPopover: FunctionComponent<PropsWithChildren<PositionedPopoverProps>>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/popover" {
import { PropsWithChildren, ReactElement } from "react";


type PopoverWithIconProps = {
    icon: any;
    trigger?: never;
};
type PopoverWithTriggerProps = {
    icon?: never;
    trigger: ReactElement;
};
type PopoverBaseProps = {
    /** Controlled open state */
    open?: boolean;
    /** Callback when open state changes */
    onOpenChange?: (open: boolean) => void;
    /** Positioning of the popover */
    positioning?: any;
    /** Custom class for the surface */
    surfaceClassName?: string;
};
type PopoverProps = PopoverBaseProps & (PopoverWithIconProps | PopoverWithTriggerProps);
export const Popover: import("react").ForwardRefExoticComponent<PropsWithChildren<PopoverProps> & import("react").RefAttributes<HTMLButtonElement>>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/nodeSelector" {
import { FunctionComponent } from "react";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { Node } from "babylonjs/node";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-inspector/fluent/primitives/entitySelector";
export type NodeSelectorProps = PrimitiveProps<Nullable<Node>> & {
    /**
     * The scene to get nodes from
     */
    scene: Scene;
    /**
     * Optional filter function to filter which nodes are shown
     */
    filter?: (node: Node) => boolean;
} & Omit<EntitySelectorProps<Node>, "getEntities" | "getName">;
/**
 * A primitive component with a ComboBox for selecting from existing scene nodes.
 * @param props NodeSelectorProps
 * @returns NodeSelector component
 */
export const NodeSelector: FunctionComponent<NodeSelectorProps>;

}
declare module "babylonjs-inspector/fluent/primitives/messageBar" {
import { FunctionComponent } from "react";
type MessageBarProps = {
    message: string;
    title?: string;
    docLink?: string;
    intent: "info" | "success" | "warning" | "error";
};
export const MessageBar: FunctionComponent<MessageBarProps>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/materialSelector" {
import { FunctionComponent } from "react";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { Material } from "babylonjs/Materials/material";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-inspector/fluent/primitives/entitySelector";
export type MaterialSelectorProps = PrimitiveProps<Nullable<Material>> & {
    /**
     * The scene to get materials from
     */
    scene: Scene;
    /**
     * Optional filter function to filter which materials are shown
     */
    filter?: (material: Material) => boolean;
} & Omit<EntitySelectorProps<Material>, "getEntities" | "getName">;
/**
 * A primitive component with a ComboBox for selecting from existing scene materials.
 * @param props MaterialSelectorProps
 * @returns MaterialSelector component
 */
export const MaterialSelector: FunctionComponent<MaterialSelectorProps>;

}
declare module "babylonjs-inspector/fluent/primitives/list" {
import { ReactElement, ReactNode } from "react";
/**
 * Represents an item in a list
 */
export type ListItem<T> = {
    /** Unique identifier for the item */
    id: number;
    /** The data associated with the item */
    data: T;
    /** Value to use for sorting the list */
    sortBy: number;
};
type ListProps<T> = {
    items: ListItem<T>[];
    renderItem: (item: ListItem<T>, index: number) => ReactNode;
    onDelete?: (item: ListItem<T>, index: number) => void;
    onAdd?: (item?: ListItem<T>) => void;
    addButtonLabel?: string;
};
/**
 * For cases where you may want to add / remove items from a list via a trash can button / copy button, this HOC can be used
 * @returns A React component that renders a list of items with add/delete functionality
 * @param props - The properties for the List component
 */
export function List<T>(props: ListProps<T>): ReactElement;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/link" {
import { ImmutablePrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type LinkProps = ImmutablePrimitiveProps<string> & {
    /**
     * Used if you want to handle the link click yourself
     */
    onLink?: () => void;
    /**
     * The URL the link points to
     */
    url?: string;
    /**
     * Defines whether to open the link in current tab or new tab. Default is new
     */
    target?: "current" | "new";
    /**Force link size */
    size?: "small" | "medium";
};
export const Link: import("react").ForwardRefExoticComponent<import("babylonjs-inspector/fluent/primitives/primitive").BasePrimitiveProps & {
    value: string;
    infoLabel?: import("babylonjs-inspector/fluent/primitives/infoLabel").InfoLabelParentProps;
} & {
    /**
     * Used if you want to handle the link click yourself
     */
    onLink?: () => void;
    /**
     * The URL the link points to
     */
    url?: string;
    /**
     * Defines whether to open the link in current tab or new tab. Default is new
     */
    target?: "current" | "new";
    /**Force link size */
    size?: "small" | "medium";
} & {
    children?: import("react").ReactNode | undefined;
} & import("react").RefAttributes<HTMLAnchorElement>>;

}
declare module "babylonjs-inspector/fluent/primitives/lazyComponent" {

import { ComponentProps, ComponentType, ElementRef } from "react";
type LazyComponentProps = {
    spinnerSize?: any;
    spinnerLabel?: string;
};
/**
 * Creates a lazy component wrapper that only calls the async function to get the underlying component when the lazy component is actually mounted.
 * This allows deferring imports until they are needed. While the underlying component is being loaded, a spinner is displayed.
 * @param getComponentAsync A function that returns a promise resolving to the component.
 * @param defaultProps Options for the loading spinner.
 * @returns A React component that displays a spinner while loading the async component.
 */

export {};

}
declare module "babylonjs-inspector/fluent/primitives/infoLabel" {
import { FunctionComponent, MouseEventHandler } from "react";
export type InfoLabelProps = {
    htmlFor: string;
    info?: JSX.Element;
    label: string;
    className?: string;
    /**
     * When true, applies flex layout styling to the label slot for proper truncation in flex containers
     */
    flexLabel?: boolean;
    /**
     * Handler for right-click context menu. Also triggers on Ctrl+click.
     */
    onContextMenu?: MouseEventHandler;
};
export type InfoLabelParentProps = Omit<InfoLabelProps, "htmlFor">;
/**
 * Renders a label with an optional popup containing more info
 * @param props
 * @returns
 */
export const InfoLabel: FunctionComponent<InfoLabelProps>;

}
declare module "babylonjs-inspector/fluent/primitives/gradient" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { Color3Gradient, ColorGradient as Color4Gradient, FactorGradient } from "babylonjs/Misc/gradients";
import { GradientBlockColorStep } from "babylonjs/Materials/Node/Blocks/gradientBlock";
/**
 * Component wrapper for FactorGradient that provides slider inputs for factor1, factor2, and gradient step
 * @param props - Component props containing FactorGradient value and change handler
 * @returns A React component
 */
export const FactorGradientComponent: FunctionComponent<PrimitiveProps<FactorGradient>>;
/**
 * Component wrapper for Color3Gradient that provides color picker and gradient step slider
 * @param props - Component props containing Color3Gradient value and change handler
 * @returns A React component
 */
export const Color3GradientComponent: FunctionComponent<PrimitiveProps<Color3Gradient>>;
/**
 * Component wrapper for Color4Gradient that provides color pickers for color1, color2, and gradient step slider
 * @param props - Component props containing Color4Gradient value and change handler
 * @returns A React component
 */
export const Color4GradientComponent: FunctionComponent<PrimitiveProps<Color4Gradient>>;
/**
 * Component wrapper for GradientBlockColorStep that provides color picker and step slider
 * @param props - Component props containing GradientBlockColorStep value and change handler
 * @returns A React component
 */
export const ColorStepGradientComponent: FunctionComponent<PrimitiveProps<GradientBlockColorStep>>;

}
declare module "babylonjs-inspector/fluent/primitives/entitySelector" {
import { Nullable } from "babylonjs/types";
import { ImmutablePrimitiveProps, PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
type Entity = {
    uniqueId: number;
};
/**
 * Props for the EntitySelector component
 */
export type EntitySelectorProps<T extends Entity> = (PrimitiveProps<Nullable<T>> | ImmutablePrimitiveProps<Nullable<T>>) & {
    /**
     * Function to get the list of entities to choose from
     */
    getEntities: () => T[];
    /**
     * Function to get the display name from an entity
     */
    getName: (entity: T) => string;
    /**
     * Optional filter function to filter which entities are shown
     */
    filter?: (entity: T) => boolean;
    /**
     * Callback when the entity link is clicked
     */
    onLink: (entity: T) => void;
    /**
     * Optional default value that enables clearing the current linked entity
     */
    defaultValue?: T;
};
/**
 * A generic primitive component with a ComboBox for selecting from a list of entities.
 * Supports entities with duplicate names by using uniqueId for identity.
 * @param props ChooseEntityProps
 * @returns EntitySelector component
 */
export function EntitySelector<T extends Entity>(props: EntitySelectorProps<T>): JSX.Element;
export namespace EntitySelector {
    var displayName: string;
}
export {};

}
declare module "babylonjs-inspector/fluent/primitives/dropdown" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type AcceptedDropdownValue = string | number;
export type DropdownOption<T extends AcceptedDropdownValue> = {
    /**
     * Defines the visible part of the option
     */
    label: string;
    /**
     * Defines the value part of the option
     */
    value: T;
};
export type DropdownProps<V extends AcceptedDropdownValue> = PrimitiveProps<V> & {
    options: readonly DropdownOption<V>[];
};
/**
 * Renders a fluent UI dropdown component for the options passed in, and an additional 'Not Defined' option if null is set to true
 * This component can handle both null and undefined values
 * @param props
 * @returns dropdown component
 */
export const Dropdown: FunctionComponent<DropdownProps<AcceptedDropdownValue>>;
export const NumberDropdown: FunctionComponent<DropdownProps<number>>;
export const StringDropdown: FunctionComponent<DropdownProps<string>>;

}
declare module "babylonjs-inspector/fluent/primitives/draggable" {
export type DraggableLineProps = {
    format: string;
    data: string;
    tooltip: string;
    label: string;
    onDelete?: () => void;
};
export const DraggableLine: React.FunctionComponent<DraggableLineProps>;

}
declare module "babylonjs-inspector/fluent/primitives/contextMenu" {
import { ReactElement } from "react";


import { BasePrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
/**
 * Represents a single menu item in the context menu.
 */
export type ContextMenuItemProps = {
    /**
     * Unique key for the menu item.
     */
    key: string;
    /**
     * The text label displayed for the menu item.
     */
    label: string;
    /**
     * Optional icon to display alongside the menu item.
     */
    icon?: any;
    /**
     * Called when the menu item is clicked.
     */
    onClick?: () => void;
    /**
     * Whether the menu item is disabled.
     */
    disabled?: boolean;
    /**
     * Optional secondary text displayed alongside the label.
     */
    secondaryContent?: string;
};
/**
 * Represents a divider in the context menu.
 */
export type ContextMenuDividerProps = {
    /**
     * Unique key for the divider.
     */
    key: string;
    /**
     * Indicates this is a divider item.
     */
    type: "divider";
};
/**
 * Represents a group of menu items with an optional header.
 */
export type ContextMenuGroupProps = {
    /**
     * Unique key for the group.
     */
    key: string;
    /**
     * Indicates this is a group item.
     */
    type: "group";
    /**
     * Optional header text for the group.
     */
    header?: string;
    /**
     * The menu items within the group.
     */
    items: ContextMenuItem[];
};
/**
 * Union type representing all possible menu items.
 */
export type ContextMenuItem = ContextMenuItemProps | ContextMenuDividerProps | ContextMenuGroupProps;
type ContextMenuWithIconProps = {
    /**
     * Icon to use as the trigger button.
     */
    icon: any;
    trigger?: never;
};
type ContextMenuWithTriggerProps = {
    icon?: never;
    /**
     * Custom trigger element for opening the menu.
     */
    trigger: ReactElement;
};
export type ContextMenuProps = BasePrimitiveProps & (ContextMenuWithIconProps | ContextMenuWithTriggerProps) & {
    /**
     * Array of menu items to display.
     */
    items: ContextMenuItem[];
    /**
     * Positioning of the menu relative to the trigger.
     */
    positioning?: any;
    /**
     * Called when the menu open state changes.
     */
    onOpenChange?: (open: boolean) => void;
};
/**
 * A wrapper around Fluent UI's Menu component providing a simplified API for context menus.
 * Supports menu items with icons, dividers, and grouped items.
 */
export const ContextMenu: import("react").ForwardRefExoticComponent<ContextMenuProps & import("react").RefAttributes<HTMLButtonElement>>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/comboBox" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
/**
 * An option object for the ComboBox with separate label and value.
 */
export type ComboBoxOption = {
    /**
     * Defines the visible part of the option
     */
    label: string;
    /**
     * Defines the value part of the option
     */
    value: string;
};
export type ComboBoxProps = PrimitiveProps<string> & {
    /**
     * Label for the ComboBox
     */
    label: string;
    /**
     * Options to display as label/value pairs
     */
    options: ComboBoxOption[];
};
/**
 * Wrapper around a Fluent ComboBox that allows for filtering options.
 * @param props
 * @returns
 */
export const ComboBox: FunctionComponent<ComboBoxProps>;

}
declare module "babylonjs-inspector/fluent/primitives/colorPicker" {
import { FunctionComponent } from "react";
import { Color3, Color4 } from "babylonjs/Maths/math.color";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type ColorPickerProps<C extends Color3 | Color4> = {
    isLinearMode?: boolean;
} & PrimitiveProps<C>;
export const ColorPickerPopup: import("react").ForwardRefExoticComponent<{
    isLinearMode?: boolean;
} & import("babylonjs-inspector/fluent/primitives/primitive").BasePrimitiveProps & {
    value: Color3 | Color4;
    infoLabel?: import("babylonjs-inspector/fluent/primitives/infoLabel").InfoLabelParentProps;
} & {
    onChange: (value: Color3 | Color4) => void;
} & import("react").RefAttributes<HTMLButtonElement>>;
export type InputHexProps = PrimitiveProps<Color3 | Color4> & {
    linearHex?: boolean;
    isLinearMode?: boolean;
};
/**
 * Component which displays the passed in color's HEX value, either in linearSpace (if linearHex is true) or in gamma space
 * When the hex color is changed by user, component calculates the new Color3/4 value and calls onChange
 *
 * Component uses the isLinearMode boolean to display an informative label regarding linear / gamma space
 * @param props - The properties for the InputHexField component.
 * @returns
 */
export const InputHexField: FunctionComponent<InputHexProps>;
type HsvKey = "h" | "s" | "v";
type InputHsvFieldProps = PrimitiveProps<Color3 | Color4> & {
    hsvKey: HsvKey;
    max: number;
    scale?: number;
};
/**
 * In the HSV (Hue, Saturation, Value) color model, Hue (H) ranges from 0 to 360 degrees, representing the color's position on the color wheel.
 * Saturation (S) ranges from 0 to 100%, indicating the intensity or purity of the color, with 0 being shades of gray and 100 being a fully saturated color.
 * Value (V) ranges from 0 to 100%, representing the brightness of the color, with 0 being black and 100 being the brightest.
 * @param props - The properties for the InputHsvField component.
 */
export const InputHsvField: FunctionComponent<InputHsvFieldProps>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/collapse" {
import { FunctionComponent, PropsWithChildren } from "react";
type CollapseProps = {
    visible: boolean;
    orientation?: "horizontal" | "vertical";
};
/**
 * Wraps the passed in children with a fluent collapse component, handling smooth animation when visible prop changes
 * NOTE: When passing in children, prefer react fragment over empty div to avoid bloating the react tree with an unnecessary div
 * @param props
 * @returns
 */
export const Collapse: FunctionComponent<PropsWithChildren<CollapseProps>>;
export {};

}
declare module "babylonjs-inspector/fluent/primitives/checkbox" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
/**
 * This is a primitive fluent checkbox that can both read and write checked state
 * @param props
 * @returns Checkbox component
 */
export const Checkbox: FunctionComponent<PrimitiveProps<boolean>>;

}
declare module "babylonjs-inspector/fluent/primitives/button" {
import { MouseEvent } from "react";

import { BasePrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
export type ButtonProps = BasePrimitiveProps & {
    onClick?: (e?: MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
    icon?: any;
    appearance?: "subtle" | "transparent" | "primary" | "secondary";
    label?: string;
};
export const Button: import("react").ForwardRefExoticComponent<BasePrimitiveProps & {
    onClick?: (e?: MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
    icon?: any;
    appearance?: "subtle" | "transparent" | "primary" | "secondary";
    label?: string;
} & import("react").RefAttributes<HTMLButtonElement>>;

}
declare module "babylonjs-inspector/fluent/primitives/accordion" {
import { ForwardRefExoticComponent, FunctionComponent, PropsWithChildren, RefAttributes } from "react";
export type AccordionSectionProps = {
    title: string;
    collapseByDefault?: boolean;
};
export const AccordionSection: FunctionComponent<PropsWithChildren<AccordionSectionProps>>;
export type AccordionProps = {
    highlightSections?: readonly string[];
};
export const Accordion: ForwardRefExoticComponent<AccordionProps & {
    children?: import("react").ReactNode | undefined;
} & RefAttributes<HTMLDivElement>>;

}
declare module "babylonjs-inspector/fluent/hoc/textureUpload" {
import { FunctionComponent } from "react";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { Scene } from "babylonjs/scene";
type TextureUploadUpdateProps = {
    /**
     * Existing texture to update via updateURL
     */
    texture: BaseTexture;
    /**
     * Callback after texture is updated
     */
    onChange?: (texture: BaseTexture) => void;
    scene?: never;
    cubeOnly?: never;
};
type TextureUploadCreateProps = {
    /**
     * The scene to create the texture in
     */
    scene: Scene;
    /**
     * Callback when a new texture is created
     */
    onChange: (texture: BaseTexture) => void;
    /**
     * Whether to create cube textures
     */
    cubeOnly?: boolean;
    texture?: never;
};
type TextureUploadProps = TextureUploadUpdateProps | TextureUploadCreateProps;
/**
 * A button that uploads a file and either:
 * - Updates an existing Texture or CubeTexture via updateURL (if texture prop is provided)
 * - Creates a new Texture or CubeTexture (if scene/onChange props are provided)
 * @param props TextureUploadProps
 * @returns UploadButton component that handles texture upload
 */
export const TextureUpload: FunctionComponent<TextureUploadProps>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/pane" {

import { FunctionComponent, PropsWithChildren } from "react";
export type PaneProps = {
    title: string;
    icon?: any;
};
export const Pane: FunctionComponent<PropsWithChildren<PaneProps>>;

}
declare module "babylonjs-inspector/fluent/hoc/gradientList" {
import { FunctionComponent } from "react";
import { Color3Gradient, ColorGradient as Color4Gradient, FactorGradient } from "babylonjs/Misc/gradients";
import { Nullable } from "babylonjs/types";
type GradientListProps<T extends FactorGradient | Color3Gradient | Color4Gradient> = {
    label: string;
    gradients: Nullable<Array<T>>;
    addGradient: (step?: T) => void;
    removeGradient: (step: T, index: number) => void;
    onChange: (newGradient: T, index: number) => void;
};
export const FactorGradientList: FunctionComponent<GradientListProps<FactorGradient>>;
export const Color3GradientList: FunctionComponent<GradientListProps<Color3Gradient>>;
export const Color4GradientList: FunctionComponent<GradientListProps<Color4Gradient>>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/fluentToolWrapper" {
import { PropsWithChildren, FunctionComponent } from "react";

export type UiSize = "small" | "medium";
export type ToolHostProps = {
    /**
     * Will ensure all of the controls within the tool are of the same scale
     */
    size?: UiSize;
    /**
     * Allows host to pass in a theme
     */
    customTheme?: any;
    /**
     * Can be set to true to disable the copy button in the tool's property lines. Default is false (copy enabled)
     */
    disableCopy?: boolean;
    /**
     * Name of the tool displayed in the UX
     */
    toolName: string;
    /**
     * Override the qsp detection for fluent
     */
    useFluent?: boolean;
};
export const ToolContext: import("react").Context<{
    readonly useFluent: boolean;
    readonly disableCopy: boolean;
    readonly toolName: string;
    readonly size: UiSize | undefined;
}>;
/**
 * For tools which are ready to move over the fluent, wrap the root of the tool (or the panel which you want fluentized) with this component
 * Today we will only enable fluent if the URL has the `newUX` query parameter is truthy
 * @param props
 * @returns
 */
export const FluentToolWrapper: FunctionComponent<PropsWithChildren<ToolHostProps>>;

}
declare module "babylonjs-inspector/fluent/hoc/fileUploadLine" {
import { FunctionComponent } from "react";
import { ButtonProps } from "babylonjs-inspector/fluent/primitives/button";
type FileUploadLineProps = Omit<ButtonProps, "onClick" | "label"> & {
    onClick: (files: FileList) => void;
    label: string;
    accept: string;
};
/**
 * A full-width line with an upload button.
 * For just the button without the line wrapper, use UploadButton directly.
 * @returns An UploadButton wrapped in a LineContainer
 */
export const FileUploadLine: FunctionComponent<FileUploadLineProps>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/childWindow" {
import { FunctionComponent, PropsWithChildren, Ref } from "react";
export type ChildWindowOptions = {
    /**
     * The default width of the child window in pixels.
     * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
     */
    defaultWidth?: number;
    /**
     * The default height of the child window in pixels.
     * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
     */
    defaultHeight?: number;
    /**
     * The default left position of the child window in pixels.
     * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
     */
    defaultLeft?: number;
    /**
     * The default top position of the child window in pixels.
     * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
     */
    defaultTop?: number;
    /**
     * The title of the child window.
     * @remarks If not provided, the id will be used instead (if any).
     */
    title?: string;
};
export type ChildWindow = {
    /**
     * Opens the child window.
     * @param options Options for opening the child window.
     */
    open: (options?: ChildWindowOptions) => void;
    /**
     * Closes the child window.
     */
    close: () => void;
};
export type ChildWindowProps = {
    /**
     * An optional unique identity for the child window.
     * @remarks If provided, the child window's bounds will be saved/restored using this identity.
     */
    id?: string;
    /**
     * Called when the open state of the child window changes.
     * @param isOpen Whether the child window is open.
     */
    onOpenChange?: (isOpen: boolean) => void;
    /**
     * A ref that exposes the ChildWindow imperative API.
     */
    imperativeRef?: Ref<ChildWindow>;
};
/**
 * Allows displaying a child window that can contain child components.
 * @param props Props for the child window.
 * @returns The child window component.
 */
export const ChildWindow: FunctionComponent<PropsWithChildren<ChildWindowProps>>;

}
declare module "babylonjs-inspector/fluent/hoc/buttonLine" {
import { FunctionComponent } from "react";
import { ButtonProps } from "babylonjs-inspector/fluent/primitives/button";
type ButtonLineProps = Omit<ButtonProps, "label"> & {
    label: string;
};
/**
 * Wraps a button with a label in a line container
 * @param props Button props plus a label
 * @returns A button inside a line
 */
export const ButtonLine: FunctionComponent<ButtonLineProps>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/vectorPropertyLine" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { Vector3 } from "babylonjs/Maths/math.vector";
import { Quaternion, Vector2, Vector4 } from "babylonjs/Maths/math.vector";
export type TensorPropertyLineProps<V extends Vector2 | Vector3 | Vector4 | Quaternion> = PropertyLineProps<V> & PrimitiveProps<V> & {
    /**
     * If passed, all sliders will use this for the min value
     */
    min?: number;
    /**
     * If passed, all sliders will use this for the max value
     */
    max?: number;
    /**
     * Will be displayed in the input UI to indicate the unit of measurement
     */
    unit?: string;
    /**
     * Internal spinbutton's step
     */
    step?: number;
    /**
     * If passed, the UX will use the conversion functions to display/update values
     */
    valueConverter?: {
        /**
         * Will call from(val) before displaying in the UX
         */
        from: (val: number) => number;
        /**
         * Will call to(val) before calling onChange
         */
        to: (val: number) => number;
    };
};
type RotationVectorPropertyLineProps = TensorPropertyLineProps<Vector3> & {
    /**
     * Display angles as degrees instead of radians
     */
    useDegrees?: boolean;
};
export const RotationVectorPropertyLine: FunctionComponent<RotationVectorPropertyLineProps>;
type QuaternionPropertyLineProps = TensorPropertyLineProps<Quaternion> & {
    /**
     * Display angles as degrees instead of radians
     */
    useDegrees?: boolean;
    /**
     * Display angles as Euler angles instead of quaternions
     */
    useEuler?: boolean;
};
export const QuaternionPropertyLine: FunctionComponent<QuaternionPropertyLineProps>;
export const Vector2PropertyLine: FunctionComponent<TensorPropertyLineProps<Vector2>>;
export const Vector3PropertyLine: FunctionComponent<TensorPropertyLineProps<Vector3>>;
export const Vector4PropertyLine: FunctionComponent<TensorPropertyLineProps<Vector4>>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/textPropertyLine" {
import { ImmutablePrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
/**
 * Wraps text in a property line
 * @param props - PropertyLineProps and TextProps
 * @returns property-line wrapped text
 */
export const TextPropertyLine: FunctionComponent<PropertyLineProps<string> & ImmutablePrimitiveProps<string>>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/textAreaPropertyLine" {
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { TextareaProps } from "babylonjs-inspector/fluent/primitives/textarea";
/**
 * Wraps textarea in a property line
 * @param props - PropertyLineProps and TextProps
 * @returns property-line wrapped text
 */
export const TextAreaPropertyLine: FunctionComponent<PropertyLineProps<string> & TextareaProps>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/syncedSliderPropertyLine" {
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { SyncedSliderProps } from "babylonjs-inspector/fluent/primitives/syncedSlider";
type SyncedSliderPropertyProps = SyncedSliderProps & PropertyLineProps<number>;
/**
 * Renders a simple wrapper around the SyncedSliderInput
 * @param props
 * @returns
 */
export const SyncedSliderPropertyLine: import("react").ForwardRefExoticComponent<SyncedSliderPropertyProps & import("react").RefAttributes<HTMLDivElement>>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/switchPropertyLine" {
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { SwitchProps } from "babylonjs-inspector/fluent/primitives/switch";
/**
 * Wraps a switch in a property line
 * @param props - The properties for the switch and property line
 * @returns A React element representing the property line with a switch
 */
export const SwitchPropertyLine: FunctionComponent<PropertyLineProps<boolean> & SwitchProps>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/stringifiedPropertyLine" {
import { ImmutablePrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
type StringifiedPropertyLineProps = PropertyLineProps<number> & ImmutablePrimitiveProps<number> & {
    precision?: number;
    units?: string;
};
/**
 * Expects a numerical value and converts it toFixed(if precision is supplied) or toLocaleString
 * Can pass optional units to be appending to the end of the string
 * @param props
 * @returns
 */
export const StringifiedPropertyLine: FunctionComponent<StringifiedPropertyLineProps>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/spinButtonPropertyLine" {
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { SpinButtonProps } from "babylonjs-inspector/fluent/primitives/spinButton";
export const SpinButtonPropertyLine: FunctionComponent<PropertyLineProps<number> & SpinButtonProps>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine" {
import { FunctionComponent, HTMLProps, PropsWithChildren } from "react";
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
type BasePropertyLineProps = {
    /**
     * The name of the property to display in the property line.
     */
    label: string;
    /**
     * Optional description for the property, shown on hover of the info icon
     */
    description?: string;
    /**
     * Optional function returning a string to copy to clipboard.
     */
    onCopy?: () => string;
    /**
     * Link to the documentation for this property, available from the info icon either linked from the description (if provided) or default 'docs' text
     */
    docLink?: string;
};
type NullableProperty<ValueT> = {
    nullable: true;
    ignoreNullable: false;
    value: ValueT;
    onChange: (value: ValueT) => void;
    defaultValue?: ValueT;
};
type IgnoreNullable<ValueT> = {
    ignoreNullable: true;
    nullable: false;
    value: ValueT;
    onChange: (value: ValueT) => void;
    defaultValue: ValueT;
};
type NonNullableProperty = {
    nullable?: false;
    ignoreNullable?: false;
};
type ExpandableProperty = {
    /**
     * If supplied, an 'expand' icon will be shown which, when clicked, renders this component within the property line.
     */
    expandedContent: JSX.Element;
    /**
     * If true, the expanded content will be shown by default.
     */
    expandByDefault?: boolean;
};
type NonExpandableProperty = {
    expandedContent?: undefined;
};
export type PropertyLineProps<ValueT> = BasePropertyLineProps & (NullableProperty<ValueT> | NonNullableProperty | IgnoreNullable<ValueT>) & (ExpandableProperty | NonExpandableProperty);
/**
 * A reusable component that renders a property line with a label and child content, and an optional description, copy button, and expandable section.
 *
 * @param props - The properties for the PropertyLine component.
 * @returns A React element representing the property line.
 *
 */
export const PropertyLine: import("react").ForwardRefExoticComponent<PropsWithChildren<PropertyLineProps<any>> & import("react").RefAttributes<HTMLDivElement>>;
export const LineContainer: import("react").ForwardRefExoticComponent<Omit<PropsWithChildren<HTMLProps<HTMLDivElement>>, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export const PlaceholderPropertyLine: FunctionComponent<PrimitiveProps<any> & PropertyLineProps<any>>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/linkPropertyLine" {
import { LinkProps } from "babylonjs-inspector/fluent/primitives/link";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
/**
 * Wraps a link in a property line
 * @param props - PropertyLineProps and LinkProps
 * @returns property-line wrapped link
 */
export const LinkPropertyLine: FunctionComponent<PropertyLineProps<string> & LinkProps>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/inputPropertyLine" {
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { TextInputProps } from "babylonjs-inspector/fluent/primitives/textInput";
import { SpinButtonProps } from "babylonjs-inspector/fluent/primitives/spinButton";
/**
 * Wraps a text input in a property line
 * @param props - PropertyLineProps and InputProps
 * @returns property-line wrapped input component
 */
export const TextInputPropertyLine: FunctionComponent<TextInputProps & PropertyLineProps<string>>;
export type NumberInputPropertyLineProps = SpinButtonProps & PropertyLineProps<number>;
/**
 * Wraps a number input in a property line
 * To force integer values, use forceInt param (this is distinct from the 'step' param, which will still allow submitting an integer value. forceInt will not)
 * @param props - PropertyLineProps and InputProps
 * @returns property-line wrapped input component
 */
export const NumberInputPropertyLine: FunctionComponent<NumberInputPropertyLineProps>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/hexPropertyLine" {
import { FunctionComponent } from "react";
import { NumberInputPropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/inputPropertyLine";
export type HexPropertyLineProps = NumberInputPropertyLineProps & {
    numBits?: 32 | 24 | 16 | 8;
};
/**
 * Takes a number representing a Hex value and converts it to a hex string then wraps the TextInput in a PropertyLine
 * @param props - PropertyLineProps
 * @returns property-line wrapped textbox that converts to/from hex number representation
 */
export const HexPropertyLine: FunctionComponent<HexPropertyLineProps>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/entitySelectorPropertyLine" {
import { Node } from "babylonjs/node";
import { Nullable } from "babylonjs/types";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { NodeSelectorProps } from "babylonjs-inspector/fluent/primitives/nodeSelector";
import { MaterialSelectorProps } from "babylonjs-inspector/fluent/primitives/materialSelector";
import { TextureSelectorProps } from "babylonjs-inspector/fluent/primitives/textureSelector";
import { SkeletonSelectorProps } from "babylonjs-inspector/fluent/primitives/skeletonSelector";
import { Material } from "babylonjs/Materials/material";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { Skeleton } from "babylonjs/Bones/skeleton";
type NodeSelectorPropertyLineProps = PropertyLineProps<Nullable<Node>> & NodeSelectorProps;
type MaterialSelectorPropertyLineProps = PropertyLineProps<Nullable<Material>> & MaterialSelectorProps;
type TextureSelectorPropertyLineProps = PropertyLineProps<Nullable<BaseTexture>> & TextureSelectorProps;
type SkeletonSelectorPropertyLineProps = PropertyLineProps<Nullable<Skeleton>> & SkeletonSelectorProps;
export const NodeSelectorPropertyLine: (props: NodeSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
export const MaterialSelectorPropertyLine: (props: MaterialSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
export const TextureSelectorPropertyLine: (props: TextureSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
export const SkeletonSelectorPropertyLine: (props: SkeletonSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/dropdownPropertyLine" {
import { AcceptedDropdownValue, DropdownProps } from "babylonjs-inspector/fluent/primitives/dropdown";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
type DropdownPropertyLineProps<V extends AcceptedDropdownValue> = DropdownProps<V> & PropertyLineProps<V>;
/**
 * Wraps a dropdown in a property line
 * @param props - PropertyLineProps and DropdownProps
 * @returns property-line wrapped dropdown
 */
export const DropdownPropertyLine: import("react").ForwardRefExoticComponent<DropdownPropertyLineProps<AcceptedDropdownValue> & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Dropdown component for number values.
 */
export const NumberDropdownPropertyLine: FunctionComponent<DropdownPropertyLineProps<number>>;
/**
 * Dropdown component for string values
 */
export const StringDropdownPropertyLine: FunctionComponent<DropdownPropertyLineProps<string>>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/comboBoxPropertyLine" {
import { FunctionComponent } from "react";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { ComboBoxProps } from "babylonjs-inspector/fluent/primitives/comboBox";
type ComboBoxPropertyLineProps = ComboBoxProps & PropertyLineProps<string>;
/**
 * A property line with a filterable ComboBox
 * @param props - ComboBoxProps & PropertyLineProps
 * @returns property-line wrapped ComboBox component
 */
export const ComboBoxPropertyLine: FunctionComponent<ComboBoxPropertyLineProps>;
export {};

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/colorPropertyLine" {
import { FunctionComponent } from "react";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { Color3 } from "babylonjs/Maths/math.color";
import { Color4 } from "babylonjs/Maths/math.color";
import { ColorPickerProps } from "babylonjs-inspector/fluent/primitives/colorPicker";
export type ColorPropertyLineProps = ColorPickerProps<Color3 | Color4> & PropertyLineProps<Color3 | Color4>;
export const Color3PropertyLine: FunctionComponent<ColorPickerProps<Color3> & PropertyLineProps<Color3>>;
export const Color4PropertyLine: FunctionComponent<ColorPickerProps<Color4> & PropertyLineProps<Color4>>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/checkboxPropertyLine" {
import { PrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
/**
 * Wraps a checkbox in a property line
 * @param props - PropertyLineProps and CheckboxProps
 * @returns property-line wrapped checkbox
 */
export const CheckboxPropertyLine: FunctionComponent<PropertyLineProps<boolean> & PrimitiveProps<boolean>>;

}
declare module "babylonjs-inspector/fluent/hoc/propertyLines/booleanBadgePropertyLine" {
import { FunctionComponent } from "react";
import { ImmutablePrimitiveProps } from "babylonjs-inspector/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-inspector/fluent/hoc/propertyLines/propertyLine";
/**
 * Displays an icon indicating enabled (green check) or disabled (red cross) state
 * @param props - The properties for the PropertyLine, including the boolean value to display.
 * @returns A PropertyLine component with a PresenceBadge indicating the boolean state.
 */
export const BooleanBadgePropertyLine: FunctionComponent<PropertyLineProps<boolean> & ImmutablePrimitiveProps<boolean>>;

}
declare module "babylonjs-inspector/components/propertyTabComponentBase" {
import { FunctionComponent, PropsWithChildren } from "react";
/**
 * A wrapper component for the property tab that provides a consistent layout and styling.
 * It uses a Pane and an Accordion to organize the content, so its direct children
 * must have 'title' props to be compatible with the Accordion structure.
 * @param props The props to pass to the component.
 * @returns The rendered component.
 */
export const PropertyTabComponentBase: FunctionComponent<PropsWithChildren>;

}
declare module "babylonjs-inspector/components/classNames" {
export function ClassNames(names: any, styleObject: any): string;
export function JoinClassNames(styleObject: any, ...names: string[]): string;

}
declare module "babylonjs-inspector/components/Toggle" {
export type ToggleProps = {
    toggled: "on" | "mixed" | "off";
    onToggle?: () => void;
    padded?: boolean;
    color?: "dark" | "light";
};
export const Toggle: React.FC<ToggleProps>;

}
declare module "babylonjs-inspector/components/TextInputWithSubmit" {
export interface ITextInputProps {
    label?: string;
    placeholder?: string;
    submitValue: (newValue: string) => void;
    validateValue?: (value: string) => boolean;
    cancelSubmit?: () => void;
}
/**
 * This component represents a text input that can be submitted or cancelled on buttons
 * @param props properties
 * @returns TextInputWithSubmit element
 */
export const TextInputWithSubmit: (props: ITextInputProps) => import("react/jsx-runtime").JSX.Element;

}
declare module "babylonjs-inspector/components/MessageDialog" {
import * as React from "react";
export interface MessageDialogProps {
    message: string;
    isError: boolean;
    onClose?: () => void;
}
export const MessageDialog: React.FC<MessageDialogProps>;

}
declare module "babylonjs-inspector/components/Label" {
import { ReactChild } from "react";
export type LabelProps = {
    text: string;
    children?: ReactChild;
    color?: "dark" | "light";
};
export const Label: React.FC<LabelProps>;

}
declare module "babylonjs-inspector/components/Icon" {
export type IconProps = {
    color?: "dark" | "light";
    icon: string;
};
export const Icon: React.FC<IconProps>;

}
declare module "babylonjs-inspector/components/Button" {
import { PropsWithChildren } from "react";
export type ButtonComponentProps = {
    disabled?: boolean;
    active?: boolean;
    onClick?: () => void;
    color: "light" | "dark";
    size: "default" | "small" | "wide" | "smaller";
    title?: string;
    backgroundColor?: string;
};
export const ButtonComponent: React.FC<PropsWithChildren<ButtonComponentProps>>;

}
declare module "babylonjs-inspector/components/reactGraphSystem/useGraphContext" {
/**
 * utility hook to assist using the graph context
 * @returns
 */
export const useGraphContext: () => import("babylonjs-inspector/components/reactGraphSystem/GraphContextManager").IGraphContext;

}
declare module "babylonjs-inspector/components/reactGraphSystem/NodeRenderer" {
import { ComponentType, PropsWithChildren } from "react";
import { Nullable } from "babylonjs/types";
export type IVisualRecordsType = Record<string, {
    x: number;
    y: number;
}>;
export type IConnectionType = {
    id: string;
    sourceId: string;
    targetId: string;
};
export type ICustomDataType = {
    type: string;
    value: any;
};
export type INodeType = {
    id: string;
    label: string;
    customData?: ICustomDataType;
};
/**
 * props for the node renderer
 */
export interface INodeRendererProps {
    /**
     * array of connections between nodes
     */
    connections: IConnectionType[];
    /**
     * function called when a new connection is created
     */
    updateConnections: (sourceId: string, targetId: string) => void;
    /**
     * function called when a connection is deleted
     */
    deleteLine: (lineId: string) => void;
    /**
     * function called when a node is deleted
     */
    deleteNode: (nodeId: string) => void;
    /**
     * array of all nodes
     */
    nodes: INodeType[];
    /**
     * id of the node to highlight
     */
    highlightedNode?: Nullable<string>;
    /**
     * function to be called if a node is selected
     */
    selectNode?: (nodeId: Nullable<string>) => void;
    /**
     * id of this renderer
     */
    id: string;
    /**
     * optional list of custom components to be rendered inside nodes of
     * a certain type
     */
    customComponents?: Record<string, ComponentType<any>>;
}
/**
 * This component is a bridge between the app logic related to the graph, and the actual rendering
 * of it. It manages the nodes' positions and selection states.
 * @param props
 * @returns
 */
export const NodeRenderer: (props: PropsWithChildren<INodeRendererProps>) => import("react/jsx-runtime").JSX.Element;

}
declare module "babylonjs-inspector/components/reactGraphSystem/GraphNodesContainer" {
import { FC, PropsWithChildren } from "react";
export interface IGraphContainerProps {
    onNodeMoved: (id: string, x: number, y: number) => void;
    id: string;
}
/**
 * This component contains all the nodes and handles their dragging
 * @param props properties
 * @returns graph node container element
 */
export const GraphNodesContainer: FC<PropsWithChildren<IGraphContainerProps>>;

}
declare module "babylonjs-inspector/components/reactGraphSystem/GraphNode" {
import { FC, PropsWithChildren } from "react";
export interface IGraphNodeProps {
    id: string;
    name: string;
    x: number;
    y: number;
    selected?: boolean;
    width?: number;
    height?: number;
    highlighted?: boolean;
    parentContainerId: string;
}
export const SingleGraphNode: FC<PropsWithChildren<IGraphNodeProps>>;

}
declare module "babylonjs-inspector/components/reactGraphSystem/GraphLinesContainer" {
import { FC, PropsWithChildren } from "react";
/**
 * props for the GraphLineContainer
 */
export interface IGraphLinesContainerProps {
    /**
     * id of the container
     */
    id: string;
}
/**
 * this component handles the dragging of new connections
 * @param props
 * @returns
 */
export const GraphLinesContainer: FC<PropsWithChildren<IGraphLinesContainerProps>>;

}
declare module "babylonjs-inspector/components/reactGraphSystem/GraphLine" {
import { FC } from "react";
/**
 * props for the GraphLine component
 */
export interface IGraphLineProps {
    /**
     * id of the line. temporary lines can have no id
     */
    id?: string;
    /**
     * starting x pos of the line
     */
    x1: number;
    /**
     * ending x pos of the line
     */
    x2: number;
    /**
     * starting y pos of the line
     */
    y1: number;
    /**
     * ending y pos of the line
     */
    y2: number;
    /**
     * is the line selected
     */
    selected?: boolean;
    /**
     * does the line have a direction
     */
    directional?: boolean;
}
export const MarkerArrowId = "arrow";
/**
 * This component draws a SVG line between two points, with an optional marker
 * indicating direction
 * @param props properties
 * @returns graph line element
 */
export const GraphLine: FC<IGraphLineProps>;

}
declare module "babylonjs-inspector/components/reactGraphSystem/GraphContextManager" {
/**
 * this context is used to pass callbacks to the graph nodes and connections
 */
export interface IGraphContext {
    onNodesConnected?: (sourceId: string, targetId: string) => void;
    onLineSelected?: (lineId: string) => void;
    onNodeSelected?: (nodeId: string) => void;
}
export const GraphContextManager: import("react").Context<IGraphContext>;

}
declare module "babylonjs-inspector/components/reactGraphSystem/GraphContainer" {
import { FC, PropsWithChildren } from "react";
export interface IGraphContainerProps {
}
/**
 * This component is just a simple container to keep the nodes and lines containers
 * together
 * @param props
 * @returns
 */
export const GraphContainer: FC<PropsWithChildren<IGraphContainerProps>>;

}
declare module "babylonjs-inspector/components/reactGraphSystem/GraphConnectorHandle" {
import { FC, PropsWithChildren } from "react";
/**
 * Props for the connector
 */
export interface IGraphConnectorHandlerProps {
    /**
     * id of the parent node
     */
    parentId: string;
    /**
     * x position of the parent node
     */
    parentX: number;
    /**
     * y position of the parent node
     */
    parentY: number;
    /**
     * x position of the connector relative to the parent node
     */
    offsetX?: number;
    /**
     * y position of the connector relative to the parent node
     */
    offsetY?: number;
    /**
     * width of the parent node
     */
    parentWidth: number;
    /**
     * height of the parent node
     */
    parentHeight: number;
    /**
     * id of the container where its parent node is
     */
    parentContainerId: string;
}
/**
 * This component is used to initiate a connection between two nodes. Simply
 * drag the handle in a node and drop it in another node to create a connection.
 * @returns connector element
 */
export const GraphConnectorHandler: FC<PropsWithChildren<IGraphConnectorHandlerProps>>;

}
declare module "babylonjs-inspector/components/lines/OptionsLineComponent" {
/**
 * This components represents an options menu with optional
 * customizable properties. Option IDs should be unique.
 */
export interface IOption {
    label: string;
    value: string;
    id: string;
}
export interface IOptionsLineComponentProps {
    options: IOption[];
    addOptionPlaceholder?: string;
    onOptionAdded?: (newOption: IOption) => void;
    onOptionSelected: (selectedOptionValue: string) => void;
    selectedOptionValue: string;
    validateNewOptionValue?: (newOptionValue: string) => boolean;
    addOptionText?: string;
}
export const OptionsLineComponent: (props: IOptionsLineComponentProps) => import("react/jsx-runtime").JSX.Element;

}
declare module "babylonjs-inspector/components/lines/NumericInputComponent" {
import * as React from "react";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
interface INumericInputComponentProps {
    label: string;
    labelTooltip?: string;
    value: number;
    step?: number;
    onChange: (value: number) => void;
    precision?: number;
    icon?: string;
    iconLabel?: string;
    lockObject: LockObject;
}
export class NumericInputComponent extends React.Component<INumericInputComponentProps, {
    value: string;
}> {
    static defaultProps: {
        step: number;
    };
    private _localChange;
    constructor(props: INumericInputComponentProps);
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: INumericInputComponentProps, nextState: {
        value: string;
    }): boolean;
    updateValue(valueString: string): void;
    onBlur(): void;
    incrementValue(amount: number): void;
    onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/lines/FileButtonLineComponent" {
import * as React from "react";
export interface IFileButtonLineComponentProps {
    label: string;
    onClick: (file: File) => void;
    accept: string;
    icon?: string;
    iconLabel?: string;
}
export class FileButtonLineComponent extends React.Component<IFileButtonLineComponentProps> {
    private static _IdGenerator;
    private _id;
    private _uploadInputRef;
    constructor(props: IFileButtonLineComponentProps);
    onChange(evt: any): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/lines/ColorPickerLineComponent" {
import * as React from "react";
import { Color4, Color3 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IColorPickerLineComponentProps {
    value: Color4 | Color3;
    linearHint?: boolean;
    onColorChanged: (newOne: string) => void;
    icon?: string;
    iconLabel?: string;
    shouldPopRight?: boolean;
    lockObject?: LockObject;
    backgroundColor?: string;
}
interface IColorPickerComponentState {
    pickerEnabled: boolean;
    color: Color3 | Color4;
    hex: string;
}
export class ColorPickerLineComponent extends React.Component<IColorPickerLineComponentProps, IColorPickerComponentState> {
    private _floatRef;
    private _floatHostRef;
    private _coverRef;
    constructor(props: IColorPickerLineComponentProps);
    syncPositions(): void;
    shouldComponentUpdate(nextProps: IColorPickerLineComponentProps, nextState: IColorPickerComponentState): boolean;
    getHexString(props?: Readonly<IColorPickerLineComponentProps>): string;
    componentDidUpdate(): void;
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/layout/utils" {
import { Layout, LayoutColumn, LayoutTabsRow } from "babylonjs-inspector/components/layout/types";
/**
 * Given a column and row number in the layout, return the corresponding column/row
 * @param layout
 * @param column
 * @param row
 * @returns
 */
export const getPosInLayout: (layout: Layout, column: number, row?: number) => LayoutColumn | LayoutTabsRow;
/**
 * Remove a row in position row, column from the layout, and redistribute heights of remaining rows
 * @param layout
 * @param column
 * @param row
 */
export const removeLayoutRowAndRedistributePercentages: (layout: Layout, column: number, row: number) => void;
/**
 * Add a percentage string to a number
 * @param p1 the percentage string
 * @param p2 the number
 * @returns the sum of the percentage string and the number
 */
export const addPercentageStringToNumber: (p1: string, p2: number) => number;
/**
 * Parses a percentage string into a number
 * @param p the percentage string
 * @returns the parsed number
 */
export const parsePercentage: (p: string) => number;

}
declare module "babylonjs-inspector/components/layout/types" {
import { ReactElement } from "react";
export type LayoutTab = {
    /**
     * Tab id
     */
    id: string;
    /**
     * React component rendered by tab
     */
    component: ReactElement;
    /**
     * Tab title
     */
    title: string;
};
export type LayoutTabsRow = {
    /**
     * row id
     */
    id: string;
    /**
     * row height in its containing column
     */
    height: string;
    /**
     * selected tab in row
     */
    selectedTab: string;
    /**
     * list of tabs contained in row
     */
    tabs: LayoutTab[];
};
export type LayoutColumn = {
    /**
     * column id
     */
    id: string;
    /**
     * column width in the grid
     */
    width: string;
    /**
     * column rows
     */
    rows: LayoutTabsRow[];
};
export type Layout = {
    /**
     * layout columns
     */
    columns?: LayoutColumn[];
};
export type TabDrag = {
    /**
     * row number of the tab being dragged
     */
    rowNumber: number;
    /**
     * column number of the tab being dragged
     */
    columnNumber: number;
    /**
     * the tabs being dragged
     */
    tabs: {
        /**
         * id of tab being dragged
         */
        id: string;
    }[];
};
export enum ElementTypes {
    RESIZE_BAR = "0",
    TAB = "1",
    TAB_GROUP = "2",
    NONE = "2"
}
export enum ResizeDirections {
    ROW = "row",
    COLUMN = "column"
}

}
declare module "babylonjs-inspector/components/layout/LayoutContext" {
import { Layout } from "babylonjs-inspector/components/layout/types";
export const LayoutContext: import("react").Context<{
    /**
     * The layout object
     */
    layout: Layout;
    /**
     * Function to set the layout object in the context
     */
    setLayout: (layout: Layout) => void;
}>;

}
declare module "babylonjs-inspector/components/layout/FlexibleTabsContainer" {
import { FC } from "react";
import { LayoutTab } from "babylonjs-inspector/components/layout/types";
/**
 * Arguments for the TabsContainer component.
 */
export interface IFlexibleTabsContainerProps {
    /**
     * The tabs to display
     */
    tabs: LayoutTab[];
    /**
     * Row index of component in layout
     */
    rowIndex: number;
    /**
     * Column index of component in layout
     */
    columnIndex: number;
    /**
     * Which tab is selected in the layout
     */
    selectedTab?: string;
}
/**
 * This component contains a set of tabs of which only one is visible at a time.
 * The tabs can also be dragged from and to different containers.
 * @param props properties
 * @returns tabs container element
 */
export const FlexibleTabsContainer: FC<IFlexibleTabsContainerProps>;

}
declare module "babylonjs-inspector/components/layout/FlexibleTab" {
import { FC } from "react";
import { TabDrag } from "babylonjs-inspector/components/layout/types";
/**
 * Arguments for the FlexibleTab component.
 */
export interface IFlexibleTabProps {
    /**
     * The tab's title.
     */
    title: string;
    /**
     * If the tab is currently selected or not
     */
    selected: boolean;
    /**
     * What happens when the user clicks on the tab
     */
    onClick: () => void;
    /**
     * The object that will be sent to the drag event
     */
    item: TabDrag;
    /**
     * What happens when the user drops another tab after this one
     */
    onTabDroppedAction: (item: TabDrag) => void;
}
/**
 * A component that renders a tab that the user can click
 * to activate or drag to reorder. It also listens for
 * drop events if the user wants to drop another tab
 * after it.
 * @param props properties
 * @returns FlexibleTab element
 */
export const FlexibleTab: FC<IFlexibleTabProps>;

}
declare module "babylonjs-inspector/components/layout/FlexibleResizeBar" {
import { FC } from "react";
import { ResizeDirections } from "babylonjs-inspector/components/layout/types";
/**
 * Arguments for the ResizeBar component.
 */
export interface IFlexibleRowResizerProps {
    /**
     * Row number of the component that is being resized
     */
    rowNumber: number;
    /**
     * Column number of the component being resized
     */
    columnNumber: number;
    /**
     * If the resizing happens in row or column direction
     */
    direction: ResizeDirections;
}
/**
 * The item that will be sent to the drag event
 */
export type ResizeItem = {
    /**
     * If the resizing happens in row or column direction
     */
    direction: ResizeDirections;
    /**
     * The row number of the component that is being resized
     */
    rowNumber: number;
    /**
     * the column number of the component being resized
     */
    columnNumber: number;
};
/**
 * A component that renders a bar that the user can drag to resize.
 * @param props properties
 * @returns resize bar element
 */
export const FlexibleResizeBar: FC<IFlexibleRowResizerProps>;

}
declare module "babylonjs-inspector/components/layout/FlexibleGridLayout" {
import { FC } from "react";
import { Layout } from "babylonjs-inspector/components/layout/types";
/**
 * Arguments for the Layout component.
 */
export interface IFlexibleGridLayoutProps {
    /**
     * A definition of the layout which can be changed by the user
     */
    layoutDefinition: Layout;
}
/**
 * This component represents a grid layout that can be resized and rearranged
 * by the user.
 * @param props properties
 * @returns layout element
 */
export const FlexibleGridLayout: FC<IFlexibleGridLayoutProps>;

}
declare module "babylonjs-inspector/components/layout/FlexibleGridContainer" {
import { FC } from "react";
/**
 * Arguments for the GridContainer component.
 */
export interface IFlexibleGridContainerProps {
}
/**
 * Component responsible for mapping the layout to the actual components
 * @returns GridContainer element
 */
export const FlexibleGridContainer: FC<IFlexibleGridContainerProps>;

}
declare module "babylonjs-inspector/components/layout/FlexibleDropZone" {
import { FC, PropsWithChildren } from "react";
/**
 * Arguments for the FlexibleDropZone component.
 */
export interface IFlexibleDropZoneProps {
    /**
     * The row number of the component in the layout
     */
    rowNumber: number;
    /**
     * The column number of the component in the layout
     */
    columnNumber: number;
}
/**
 * This component contains the drag and drop zone for the resize bars that
 * allow redefining width and height of layout elements
 * @param props properties
 * @returns drop zone element
 */
export const FlexibleDropZone: FC<PropsWithChildren<IFlexibleDropZoneProps>>;

}
declare module "babylonjs-inspector/components/layout/FlexibleDragHandler" {
import { FC, PropsWithChildren } from "react";
/**
 * Arguments for the DragHandler component.
 */
export interface IFlexibleDragHandlerProps {
    /**
     * The size of the containing element. Used to calculate the percentage of
     * space occupied by the component
     */
    containerSize: {
        width: number;
        height: number;
    };
}
/**
 * This component receives the drop events and updates the layout accordingly
 * @param props properties
 * @returns DragHandler element
 */
export const FlexibleDragHandler: FC<PropsWithChildren<IFlexibleDragHandlerProps>>;

}
declare module "babylonjs-inspector/components/layout/FlexibleColumn" {
import { FC, PropsWithChildren } from "react";
/**
 * Arguments for the Column component.
 */
export interface IFlexibleColumnProps {
    /**
     * Width of column
     */
    width: string;
}
/**
 * This component represents a single column in the layout. It receives a width
 * that it occupies and the content to display
 * @param props
 * @returns
 */
export const FlexibleColumn: FC<PropsWithChildren<IFlexibleColumnProps>>;

}
declare module "babylonjs-inspector/components/layout/DraggableIcon" {
import { FC } from "react";
import { ElementTypes, TabDrag } from "babylonjs-inspector/components/layout/types";
/**
 * Arguments for the DraggableIcon component.
 */
export interface IDraggableIconProps {
    /**
     * Icon source
     */
    src: string;
    /**
     * Object that will be passed to the drag event
     */
    item: TabDrag;
    /**
     * Type of drag event
     */
    type: ElementTypes;
}
/**
 * An icon that can be dragged by the user
 * @param props properties
 * @returns draggable icon element
 */
export const DraggableIcon: FC<IDraggableIconProps>;

}
declare module "babylonjs-inspector/components/colorPicker/HexColor" {
import * as React from "react";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IHexColorProps {
    value: string;
    expectedLength: number;
    onChange: (value: string) => void;
    lockObject: LockObject;
}
export class HexColorComponent extends React.Component<IHexColorProps, {
    hex: string;
}> {
    constructor(props: IHexColorProps);
    shouldComponentUpdate(nextProps: IHexColorProps, nextState: {
        hex: string;
    }): boolean;
    lock(): void;
    unlock(): void;
    updateHexValue(valueString: string): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/colorPicker/ColorPicker" {
import * as React from "react";
import { Color3, Color4 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
/**
 * Interface used to specify creation options for color picker
 */
export interface IColorPickerComponentProps {
    color: Color3 | Color4;
    linearhint?: boolean;
    debugMode?: boolean;
    onColorChanged?: (color: Color3 | Color4) => void;
    lockObject: LockObject;
    backgroundColor?: string;
}
/**
 * Interface used to specify creation options for color picker
 */
export interface IColorPickerState {
    color: Color3;
    alpha: number;
}
/**
 * Class used to create a color picker
 */
export class ColorPickerComponent extends React.Component<IColorPickerComponentProps, IColorPickerState> {
    private _saturationRef;
    private _hueRef;
    private _isSaturationPointerDown;
    private _isHuePointerDown;
    constructor(props: IColorPickerComponentProps);
    shouldComponentUpdate(nextProps: IColorPickerComponentProps, nextState: IColorPickerState): boolean;
    onSaturationPointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
    onSaturationPointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
    onSaturationPointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
    onHuePointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
    onHuePointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
    onHuePointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
    private _evaluateSaturation;
    private _evaluateHue;
    componentDidUpdate(): void;
    raiseOnColorChanged(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/colorPicker/ColorComponentEntry" {
import * as React from "react";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IColorComponentEntryProps {
    value: number;
    label: string;
    max?: number;
    min?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    lockObject: LockObject;
}
export class ColorComponentComponentEntry extends React.Component<IColorComponentEntryProps> {
    constructor(props: IColorComponentEntryProps);
    updateValue(valueString: string): void;
    lock(): void;
    unlock(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/components/bars/CommandDropdownComponent" {
import * as React from "react";
interface ICommandDropdownComponentProps {
    icon?: string;
    tooltip: string;
    defaultValue?: string;
    items: {
        label: string;
        icon?: string;
        fileButton?: boolean;
        onClick?: () => void;
        onCheck?: (value: boolean) => void;
        storeKey?: string;
        isActive?: boolean;
        defaultValue?: boolean | string;
        subItems?: string[];
    }[];
    toRight?: boolean;
}
export class CommandDropdownComponent extends React.Component<ICommandDropdownComponentProps, {
    isExpanded: boolean;
    activeState: string;
}> {
    constructor(props: ICommandDropdownComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-inspector/components/bars/CommandButtonComponent" {
import * as React from "react";
export interface ICommandButtonComponentProps {
    tooltip: string;
    shortcut?: string;
    icon: string;
    iconLabel?: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}
export const CommandButtonComponent: React.FC<ICommandButtonComponentProps>;

}
declare module "babylonjs-inspector/components/bars/CommandBarComponent" {
import { FC, PropsWithChildren } from "react";
export interface ICommandBarComponentProps {
    onSaveButtonClicked?: () => void;
    onSaveToSnippetButtonClicked?: () => void;
    onLoadFromSnippetButtonClicked?: () => void;
    onHelpButtonClicked?: () => void;
    onGiveFeedbackButtonClicked?: () => void;
    onSelectButtonClicked?: () => void;
    onPanButtonClicked?: () => void;
    onZoomButtonClicked?: () => void;
    onFitButtonClicked?: () => void;
    onArtboardColorChanged?: (newColor: string) => void;
    artboardColor?: string;
    artboardColorPickerColor?: string;
}
export const CommandBarComponent: FC<PropsWithChildren<ICommandBarComponentProps>>;

}
declare module "babylonjs-inspector/colorPicker/hexColor" {
import * as React from "react";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IHexColorProps {
    value: string;
    expectedLength: number;
    onChange: (value: string) => void;
    lockObject: LockObject;
}
export class HexColor extends React.Component<IHexColorProps, {
    hex: string;
}> {
    constructor(props: IHexColorProps);
    shouldComponentUpdate(nextProps: IHexColorProps, nextState: {
        hex: string;
    }): boolean;
    lock(): void;
    unlock(): void;
    updateHexValue(valueString: string): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/colorPicker/colorPicker" {
import * as React from "react";
import { Color3, Color4 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
import "babylonjs-inspector/colorPicker/colorPicker.scss";
/**
 * Interface used to specify creation options for color picker
 */
export interface IColorPickerProps {
    color: Color3 | Color4;
    linearhint?: boolean;
    debugMode?: boolean;
    onColorChanged?: (color: Color3 | Color4) => void;
    lockObject: LockObject;
}
/**
 * Interface used to specify creation options for color picker
 */
export interface IColorPickerState {
    color: Color3;
    alpha: number;
}
/**
 * Class used to create a color picker
 */
export class ColorPicker extends React.Component<IColorPickerProps, IColorPickerState> {
    private _saturationRef;
    private _hueRef;
    private _isSaturationPointerDown;
    private _isHuePointerDown;
    constructor(props: IColorPickerProps);
    shouldComponentUpdate(nextProps: IColorPickerProps, nextState: IColorPickerState): boolean;
    onSaturationPointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
    onSaturationPointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
    onSaturationPointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
    onHuePointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
    onHuePointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
    onHuePointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
    private _evaluateSaturation;
    private _evaluateHue;
    componentDidUpdate(): void;
    raiseOnColorChanged(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-inspector/colorPicker/colorComponentEntry" {
import * as React from "react";
import { LockObject } from "babylonjs-inspector/tabs/propertyGrids/lockObject";
export interface IColorComponentEntryProps {
    value: number;
    label: string;
    max?: number;
    min?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    lockObject: LockObject;
}
export class ColorComponentEntry extends React.Component<IColorComponentEntryProps> {
    constructor(props: IColorComponentEntryProps);
    updateValue(valueString: string): void;
    lock(): void;
    unlock(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}

declare module "babylonjs-inspector" {
    export * from "babylonjs-inspector/legacy/legacy";
}


declare module INSPECTOR {
    export class Tools {
        static LookForItem(item: any, selectedEntity: any): boolean;
        private static _RecursiveRemoveHiddenMeshesAndHoistChildren;
        static GetNameString(obj: any): any;
        static SortAndFilter(parent: any, items: any[]): any[];
    }


    /**
     * Defines which channels of the texture to retrieve with {@link TextureHelper.GetTextureDataAsync}.
     */
    export interface TextureChannelsToDisplay {
        /**
         * True if the red channel should be included.
         */
        R: boolean;
        /**
         * True if the green channel should be included.
         */
        G: boolean;
        /**
         * True if the blue channel should be included.
         */
        B: boolean;
        /**
         * True if the alpha channel should be included.
         */
        A: boolean;
    }
    /**
     * Helper class for retrieving texture data.
     */
    export class TextureHelper {
        /**
         * Gets the data of the specified texture by rendering it to an intermediate RGBA texture and retrieving the bytes from it.
         * This is convienent to get 8-bit RGBA values for a texture in a GPU compressed format.
         * @param texture the source texture
         * @param width the width of the result, which does not have to match the source texture width
         * @param height the height of the result, which does not have to match the source texture height
         * @param face if the texture has multiple faces, the face index to use for the source
         * @param channels a filter for which of the RGBA channels to return in the result
         * @param globalState the global state to use for rendering the texture
         * @param lod if the texture has multiple LODs, the lod index to use for the source
         * @returns the 8-bit texture data
         */
        static GetTextureDataAsync(texture: BABYLON.BaseTexture, width: number, height: number, face: number, channels: TextureChannelsToDisplay, globalState?: GlobalState, lod?: number): Promise<Uint8Array>;
    }


    export function GetInspectorGizmoManager(scene: BABYLON.Nullable<BABYLON.Scene> | undefined, create: true): BABYLON.GizmoManager;
    export function GetInspectorGizmoManager(scene: BABYLON.Nullable<BABYLON.Scene> | undefined, create: false): BABYLON.Nullable<BABYLON.GizmoManager>;
    export function DisposeInspectorGizmoManager(scene: BABYLON.Nullable<BABYLON.Scene> | undefined): void;


    export interface IPersistentPopupConfiguration {
        props: IPopupComponentProps;
        children: React.ReactNode;
        closeWhenSceneExplorerCloses?: boolean;
        closeWhenActionTabsCloses?: boolean;
    }
    export class Inspector {
        private static _SceneExplorerHost;
        private static _ActionTabsHost;
        private static _EmbedHost;
        private static _PersistentPopupHost;
        private static _SceneExplorerRoot;
        private static _ActionTabsRoot;
        private static _EmbedHostRoot;
        private static _PersistentPopupRoot;
        private static _NewCanvasContainer;
        private static _SceneExplorerWindow;
        private static _ActionTabsWindow;
        private static _EmbedHostWindow;
        private static _Scene;
        private static _OpenedPane;
        private static _OnBeforeRenderObserver;
        private static _OnSceneExplorerClosedObserver;
        private static _OnActionTabsClosedObserver;
        static OnSelectionChangeObservable: BABYLON.Observable<any>;
        static OnPropertyChangedObservable: BABYLON.Observable<PropertyChangedEvent>;
        private static _GlobalState;
        static MarkLineContainerTitleForHighlighting(title: string): void;
        static MarkMultipleLineContainerTitlesForHighlighting(titles: string[]): void;
        private static _SceneExplorerOptions;
        private static _InspectorOptions;
        private static _EmbedOptions;
        static PopupEmbed(): void;
        static PopupSceneExplorer(): void;
        static PopupInspector(): void;
        private static _CreateSceneExplorer;
        private static _CreateActionTabs;
        private static _CreateEmbedHost;
        static get IsVisible(): boolean;
        static EarlyAttachToLoader(): void;
        static Show(scene: BABYLON.Scene, userOptions: Partial<BABYLON.IInspectorOptions>): void;
        static _SetNewScene(scene: BABYLON.Scene): void;
        static _CreateCanvasContainer(parentControl: HTMLElement): void;
        private static _DestroyCanvasContainer;
        private static _Cleanup;
        private static _RemoveElementFromDOM;
        static Hide(): void;
        static _CreatePersistentPopup(config: IPersistentPopupConfiguration, hostElement: HTMLElement): void;
        static _ClosePersistentPopup(): void;
    }




    export class ReplayRecorder {
        private _sceneRecorder;
        private _isRecording;
        get isRecording(): boolean;
        cancel(): void;
        trackScene(scene: BABYLON.Scene): void;
        applyDelta(json: any, scene: BABYLON.Scene): void;
        export(): void;
    }


    export class PropertyChangedEvent {
        object: any;
        property: string;
        value: any;
        initialValue: any;
        allowNullValue?: boolean;
    }


    export interface IPopupComponentProps {
        id: string;
        title: string;
        size: {
            width: number;
            height: number;
        };
        onOpen?: (window: Window) => void;
        onClose: (window: Window) => void;
        onResize?: (window: Window) => void;
        onKeyUp?: (evt: KeyboardEvent) => void;
        onKeyDown?: (evt: KeyboardEvent) => void;
    }
    export class PopupComponent extends React.Component<React.PropsWithChildren<IPopupComponentProps>, {
        isComponentMounted: boolean;
        blockedByBrowser: boolean;
    }> {
        private _container;
        private _window;
        private _host;
        constructor(props: IPopupComponentProps);
        componentDidMount(): void;
        onBeforeUnloadListener: () => void;
        openPopup(): void;
        componentWillUnmount(): void;
        getWindow(): Window | null;
        render(): React.ReactPortal | null;
    }


    export interface IHeaderComponentProps {
        title: string;
        handleBack?: boolean;
        noExpand?: boolean;
        noClose?: boolean;
        noCommands?: boolean;
        onPopup: () => void;
        onClose: () => void;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
    }
    export class HeaderComponent extends React.Component<IHeaderComponentProps, {
        isBackVisible: boolean;
    }> {
        private _backStack;
        private _onSelectionChangeObserver;
        constructor(props: IHeaderComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        goBack(): void;
        renderLogo(): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class GlobalState {
        onSelectionChangedObservable: BABYLON.Observable<any>;
        onPropertyChangedObservable: BABYLON.Observable<PropertyChangedEvent>;
        onInspectorClosedObservable: BABYLON.Observable<BABYLON.Scene>;
        onTabChangedObservable: BABYLON.Observable<number>;
        onSelectionRenamedObservable: BABYLON.Observable<void>;
        onPluginActivatedObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.ISceneLoaderPlugin | BABYLON.ISceneLoaderPluginAsync>>;
        onNewSceneObservable: BABYLON.Observable<BABYLON.Scene>;
        sceneImportDefaults: {
            [key: string]: any;
        };
        validationResults: BABYLON.Nullable<BABYLON.GLTF2.IGLTFValidationResults>;
        onValidationResultsUpdatedObservable: BABYLON.Observable<BABYLON.Nullable<BABYLON.GLTF2.IGLTFValidationResults>>;
        onExtensionLoadedObservable: BABYLON.Observable<BABYLON.IGLTFLoaderExtension>;
        glTFLoaderOverrideExtensionsConfig: boolean;
        glTFLoaderExtensionDefaults: {
            [name: string]: {
                [key: string]: any;
            };
        };
        glTFLoaderOverrideConfig: boolean;
        glTFLoaderDefaults: {
            [key: string]: any;
        };
        glTFLoaderExtensions: {
            [key: string]: BABYLON.IGLTFLoaderExtension;
        };
        blockMutationUpdates: boolean;
        selectedLineContainerTitles: Array<string>;
        selectedLineContainerTitlesNoFocus: Array<string>;
        recorder: ReplayRecorder;
        private _onlyUseEulers;
        get onlyUseEulers(): boolean;
        set onlyUseEulers(value: boolean);
        private _ignoreBackfacesForPicking;
        get ignoreBackfacesForPicking(): boolean;
        set ignoreBackfacesForPicking(value: boolean);
        init(propertyChangedObservable: BABYLON.Observable<PropertyChangedEvent>): void;
        prepareGLTFPlugin(loader: BABYLON.GLTFFileLoader): void;
        resetGLTFValidationResults(): void;
        lightGizmos: Array<BABYLON.LightGizmo>;
        enableLightGizmo(light: BABYLON.Light, enable?: boolean, gizmoCamera?: BABYLON.Nullable<BABYLON.Camera>): void;
        cameraGizmos: Array<BABYLON.CameraGizmo>;
        enableCameraGizmo(camera: BABYLON.Camera, enable?: boolean, gizmoCamera?: BABYLON.Nullable<BABYLON.Camera>): void;
        onSceneExplorerClosedObservable: BABYLON.Observable<void>;
        onActionTabsClosedObservable: BABYLON.Observable<void>;
    }


    export function setDebugNode(node: any): void;


    interface ITreeItemSpecializedComponentProps {
        label: string;
        entity?: any;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        globalState: GlobalState;
        gizmoCamera?: BABYLON.Camera;
        onClick?: () => void;
    }
    export class TreeItemSpecializedComponent extends React.Component<ITreeItemSpecializedComponentProps> {
        constructor(props: ITreeItemSpecializedComponentProps);
        onClick(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface ITreeItemSelectableComponentProps {
        entity: any;
        selectedEntity?: any;
        mustExpand?: boolean;
        offset: number;
        globalState: GlobalState;
        gizmoCamera?: BABYLON.Camera;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        filter: BABYLON.Nullable<string>;
    }
    export class TreeItemSelectableComponent extends React.Component<ITreeItemSelectableComponentProps, {
        isExpanded: boolean;
        mustExpand: boolean;
        isSelected: boolean;
    }> {
        private _wasSelected;
        private _thisRef;
        constructor(props: ITreeItemSelectableComponentProps);
        switchExpandedState(mustExpand: boolean): void;
        shouldComponentUpdate(nextProps: ITreeItemSelectableComponentProps, nextState: {
            isExpanded: boolean;
            isSelected: boolean;
        }): boolean;
        scrollIntoView(): void;
        componentDidMount(): void;
        componentDidUpdate(): void;
        onSelect(): void;
        renderChildren(): import("react/jsx-runtime").JSX.Element[] | null;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface ITreeItemLabelComponentProps {
        label: string;
        onClick?: () => void;
        icon?: any;
        iconBase64?: string;
        color: string;
    }
    export class TreeItemLabelComponent extends React.Component<ITreeItemLabelComponentProps> {
        constructor(props: ITreeItemLabelComponentProps);
        onClick(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface ITreeItemComponentProps {
        items?: BABYLON.Nullable<any[]>;
        label: string;
        offset: number;
        filter: BABYLON.Nullable<string>;
        forceSubitems?: boolean;
        globalState: GlobalState;
        gizmoCamera?: BABYLON.Camera;
        entity?: any;
        selectedEntity: any;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        contextMenuItems?: BABYLON.IInspectorContextMenuItem[];
    }
    export class TreeItemComponent extends React.Component<ITreeItemComponentProps, {
        isExpanded: boolean;
        mustExpand: boolean;
    }> {
        static _ContextMenuUniqueIdGenerator: number;
        constructor(props: ITreeItemComponentProps);
        switchExpandedState(): void;
        shouldComponentUpdate(nextProps: ITreeItemComponentProps, nextState: {
            isExpanded: boolean;
        }): boolean;
        expandAll(expand: boolean): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISceneExplorerFilterComponentProps {
        onFilter: (filter: string) => void;
    }
    export class SceneExplorerFilterComponent extends React.Component<ISceneExplorerFilterComponentProps> {
        constructor(props: ISceneExplorerFilterComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }
    interface ISceneExplorerComponentProps {
        scene: BABYLON.Scene;
        contextMenu?: BABYLON.IInspectorOptions["contextMenu"];
        contextMenuOverride?: BABYLON.IInspectorOptions["contextMenuOverride"];
        gizmoCamera?: BABYLON.Camera;
        noCommands?: boolean;
        noHeader?: boolean;
        noExpand?: boolean;
        noClose?: boolean;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        additionalNodes?: BABYLON.IExplorerAdditionalNode[];
        globalState: GlobalState;
        popupMode?: boolean;
        onPopup?: () => void;
        onClose?: () => void;
    }
    export class SceneExplorerComponent extends React.Component<ISceneExplorerComponentProps, {
        filter: BABYLON.Nullable<string>;
        selectedEntity: any;
        scene: BABYLON.Scene;
    }> {
        private _onSelectionChangeObserver;
        private _onSelectionRenamedObserver;
        private _onNewSceneAddedObserver;
        private _onNewSceneObserver;
        private _sceneExplorerRef;
        private _mutationTimeout;
        private _once;
        private _hooked;
        private _sceneMutationFunc;
        constructor(props: ISceneExplorerComponentProps);
        processMutation(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        filterContent(filter: string): void;
        findSiblings(parent: any, items: any[], target: any, goNext: boolean, data: {
            previousOne?: any;
            found?: boolean;
        }): boolean;
        processKeys(keyEvent: React.KeyboardEvent<HTMLDivElement>, allNodes: any[]): void;
        private _getPipelineContextMenus;
        private _getNodeContextMenus;
        private _getMaterialsContextMenus;
        private _getSpriteManagersContextMenus;
        private _getParticleSystemsContextMenus;
        private _getFrameGraphsContextMenus;
        renderContent(allNodes: any[]): import("react/jsx-runtime").JSX.Element | null;
        onClose(): void;
        onPopup(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IExtensionsComponentProps {
        target: any;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
    }
    export class ExtensionsComponent extends React.Component<IExtensionsComponentProps, {
        popupVisible: boolean;
    }> {
        private _popup;
        private _extensionRef;
        constructor(props: IExtensionsComponentProps);
        showPopup(): void;
        componentDidMount(): void;
        componentDidUpdate(): void;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface ITransformNodeItemComponentProps {
        transformNode: BABYLON.TransformNode;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class TransformNodeItemComponent extends React.Component<ITransformNodeItemComponentProps> {
        constructor(props: ITransformNodeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITextureTreeItemComponentProps {
        texture: BABYLON.Texture;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class TextureTreeItemComponent extends React.Component<ITextureTreeItemComponentProps> {
        constructor(props: ITextureTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITargetedAnimationItemComponentProps {
        targetedAnimation: BABYLON.TargetedAnimation;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class TargetedAnimationItemComponent extends React.Component<ITargetedAnimationItemComponentProps> {
        constructor(props: ITargetedAnimationItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISpriteTreeItemComponentProps {
        sprite: BABYLON.Sprite;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class SpriteTreeItemComponent extends React.Component<ISpriteTreeItemComponentProps> {
        constructor(props: ISpriteTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISpriteManagerTreeItemComponentProps {
        spriteManager: BABYLON.SpriteManager;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class SpriteManagerTreeItemComponent extends React.Component<ISpriteManagerTreeItemComponentProps> {
        constructor(props: ISpriteManagerTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISoundTreeItemComponentProps {
        sound: BABYLON.Sound;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class SoundTreeItemComponent extends React.Component<ISoundTreeItemComponentProps> {
        constructor(props: ISoundTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISkeletonTreeItemComponentProps {
        skeleton: BABYLON.Skeleton;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class SkeletonTreeItemComponent extends React.Component<ISkeletonTreeItemComponentProps> {
        constructor(props: ISkeletonTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISceneTreeItemComponentProps {
        scene: BABYLON.Scene;
        gizmoCamera?: BABYLON.Camera;
        onRefresh: () => void;
        selectedEntity?: any;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        globalState: GlobalState;
    }
    export class SceneTreeItemComponent extends React.Component<ISceneTreeItemComponentProps, {
        isSelected: boolean;
        isInPickingMode: boolean;
        gizmoMode: number;
        isInWorldCoodinatesMode: boolean;
    }> {
        private _gizmoLayerOnPointerObserver;
        private _onPointerObserver;
        private _onSelectionChangeObserver;
        private _selectedEntity;
        private _posDragEnd;
        private _scaleDragEnd;
        private _rotateDragEnd;
        constructor(props: ISceneTreeItemComponentProps);
        shouldComponentUpdate(nextProps: ISceneTreeItemComponentProps, nextState: {
            isSelected: boolean;
            isInPickingMode: boolean;
        }): boolean;
        updateGizmoAutoPicking(isInPickingMode: boolean): void;
        componentDidMount(): void;
        private _getMeshFromBone;
        componentWillUnmount(): void;
        onSelect(): void;
        onCoordinatesMode(): void;
        onPickingMode(): void;
        setGizmoMode(mode: number): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IRenderPipelineItemComponenttProps {
        renderPipeline: BABYLON.PostProcessRenderPipeline;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class RenderingPipelineItemComponent extends React.Component<IRenderPipelineItemComponenttProps> {
        constructor(props: IRenderPipelineItemComponenttProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPostProcessItemComponentProps {
        postProcess: BABYLON.PostProcess;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class PostProcessItemComponent extends React.Component<IPostProcessItemComponentProps> {
        constructor(props: IPostProcessItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IParticleSystemTreeItemComponentProps {
        system: BABYLON.IParticleSystem;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class ParticleSystemTreeItemComponent extends React.Component<IParticleSystemTreeItemComponentProps> {
        constructor(props: IParticleSystemTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMeshTreeItemComponentProps {
        mesh: BABYLON.AbstractMesh;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
        globalState: GlobalState;
    }
    export class MeshTreeItemComponent extends React.Component<IMeshTreeItemComponentProps, {
        isBoundingBoxEnabled: boolean;
        isVisible: boolean;
    }> {
        constructor(props: IMeshTreeItemComponentProps);
        showBoundingBox(): void;
        switchVisibility(): void;
        private _getNameForLabel;
        private _editGeometry;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMaterialTreeItemComponentProps {
        material: BABYLON.Material | BABYLON.NodeMaterial;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class MaterialTreeItemComponent extends React.Component<IMaterialTreeItemComponentProps> {
        constructor(props: IMaterialTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ILightTreeItemComponentProps {
        light: BABYLON.Light;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
        globalState: GlobalState;
        gizmoCamera?: BABYLON.Camera;
    }
    export class LightTreeItemComponent extends React.Component<ILightTreeItemComponentProps, {
        isEnabled: boolean;
        isGizmoEnabled: boolean;
    }> {
        constructor(props: ILightTreeItemComponentProps);
        switchIsEnabled(): void;
        toggleGizmo(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFrameGraphItemComponenttProps {
        frameGraph: BABYLON.FrameGraph;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class FrameGraphTreeItemComponent extends React.Component<IFrameGraphItemComponenttProps> {
        constructor(props: IFrameGraphItemComponenttProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IEffectLayerItemComponenttProps {
        layer: BABYLON.EffectLayer;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class EffectLayerItemComponent extends React.Component<IEffectLayerItemComponenttProps> {
        constructor(props: IEffectLayerItemComponenttProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICameraTreeItemComponentProps {
        camera: BABYLON.Camera;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
        globalState: GlobalState;
        gizmoCamera?: BABYLON.Camera;
    }
    export class CameraTreeItemComponent extends React.Component<ICameraTreeItemComponentProps, {
        isActive: boolean;
        isGizmoEnabled: boolean;
    }> {
        private _onBeforeRenderObserver;
        constructor(props: ICameraTreeItemComponentProps);
        setActive(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        toggleGizmo(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IBoneTreeItemComponentProps {
        bone: BABYLON.Bone;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class BoneTreeItemComponent extends React.Component<IBoneTreeItemComponentProps> {
        constructor(props: IBoneTreeItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAnimationGroupItemComponentProps {
        animationGroup: BABYLON.AnimationGroup;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class AnimationGroupItemComponent extends React.Component<IAnimationGroupItemComponentProps> {
        constructor(props: IAnimationGroupItemComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    /**
     * Used to pass in the gui-editor package.
     * @param guiEditorPackage
     */
    export function InjectGUIEditor(guiEditorPackage: any): void;
    /**
     * Change the URL that the GUI editor loads from
     * @param guiEditorURL
     */
    export function SetGUIEditorURL(guiEditorURL: string): void;
    /**
     * Opens an ADT in the GUI editor
     * if you are in an ES6 environment, you must first call InjectGUIEditor to provide the gui-editor package
     * If you are in a UMD environment, it will load the package from a URL
     * @param adt
     * @param embed defines whether editor is being opened from the Playground
     * @returns a promise that resolves when the editor is opened
     */
    export function EditAdvancedDynamicTexture(adt: BABYLON.GUI.AdvancedDynamicTexture, embed?: boolean): Promise<void>;


    interface IControlTreeItemComponentProps {
        control: BABYLON.GUI.Control;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onClick: () => void;
    }
    export class ControlTreeItemComponent extends React.Component<IControlTreeItemComponentProps, {
        isActive: boolean;
        isVisible: boolean;
    }> {
        constructor(props: IControlTreeItemComponentProps);
        highlight(): void;
        switchVisibility(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAdvancedDynamicTextureTreeItemComponentProps {
        texture: BABYLON.GUI.AdvancedDynamicTexture;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onClick: () => void;
    }
    export class AdvancedDynamicTextureTreeItemComponent extends React.Component<IAdvancedDynamicTextureTreeItemComponentProps, {
        isInPickingMode: boolean;
    }> {
        private _onControlPickedObserver;
        constructor(props: IAdvancedDynamicTextureTreeItemComponentProps);
        componentWillUnmount(): void;
        onPickingMode(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    /**
     * Defines a structure to hold max, min and a optional current.
     */
    export interface IPerfMinMax {
        min: number;
        max: number;
        current?: number;
    }
    /**
     * Defines structure of the object which contains information related to panning.
     */
    export interface IPerfMousePanningPosition {
        xPos: number;
        delta: number;
    }
    /**
     * Defines structure of the object which contains information regarding the bounds of each dataset we want to consider.
     */
    export interface IPerfIndexBounds {
        start: number;
        end: number;
    }
    export interface IPerfLayoutSize {
        width: number;
        height: number;
    }
    /**
     * Defines the structure of the meta object for the tooltip that appears when hovering over a performance graph!
     */
    export interface IPerfTooltip {
        text: string;
        color: string;
    }
    /**
     * Defines the structure of a cache object used to store the result of measureText().
     */
    export interface IPerfTextMeasureCache {
        text: string;
        width: number;
    }
    /**
     * Defines a structure defining the available space in a drawable area.
     */
    export interface IGraphDrawableArea {
        top: number;
        left: number;
        bottom: number;
        right: number;
    }
    /**
     * Defines the structure representing necessary ticker information.
     */
    export interface IPerfTicker extends IPerfMinMax {
        id: string;
        text: string;
    }
    export interface IVisibleRangeChangedObservableProps {
        valueMap: Map<string, IPerfMinMax>;
    }
    /**
     * Defines what settings our canvas graphing service accepts
     */
    export interface ICanvasGraphServiceSettings {
        datasets: BABYLON.IPerfDatasets;
        onVisibleRangeChangedObservable?: BABYLON.Observable<IVisibleRangeChangedObservableProps>;
    }
    /**
     * Defines the structure representing the preprocessable tooltip information.
     */
    export interface ITooltipPreprocessedInformation {
        xForActualTimestamp: number;
        numberOfTooltipItems: number;
        longestText: string;
        focusedId: string;
    }
    export interface IPerfTooltipHoverPosition {
        xPos: number;
        yPos: number;
    }
    /**
     * Defines the supported timestamp units.
     */
    export enum TimestampUnit {
        Milliseconds = 0,
        Seconds = 1,
        Minutes = 2,
        Hours = 3
    }


    export class CanvasGraphService {
        private _ctx;
        private _width;
        private _height;
        private _sizeOfWindow;
        private _ticks;
        private _panPosition;
        private _position;
        private _datasetBounds;
        private _globalTimeMinMax;
        private _hoverPosition;
        private _drawableArea;
        private _axisHeight;
        private _tooltipItems;
        private _tooltipTextCache;
        private _tickerTextCache;
        private _tickerItems;
        private _preprocessedTooltipInfo;
        private _numberOfTickers;
        private _onVisibleRangeChangedObservable?;
        private readonly _addonFontLineHeight;
        private readonly _defaultLineHeight;
        readonly datasets: BABYLON.IPerfDatasets;
        metadata: Map<string, BABYLON.IPerfMetadata>;
        /**
         * Creates an instance of CanvasGraphService.
         *
         * @param canvas a pointer to the canvas dom element we would like to write to.
         * @param settings settings for our service.
         */
        constructor(canvas: HTMLCanvasElement, settings: ICanvasGraphServiceSettings);
        /**
         * This method lets the service know it should get ready to update what it is displaying.
         */
        update: (...args: any[]) => void;
        /**
         * Update the canvas graph service with the new height and width of the canvas.
         * @param size The new size of the canvas.
         */
        resize(size: IPerfLayoutSize): void;
        /**
         * Force resets the position in the data, effectively returning to the most current data.
         */
        resetDataPosition(): void;
        private _prevPointById;
        private _prevValueById;
        /**
         * This method draws the data and sets up the appropriate scales.
         */
        private _draw;
        private _drawTickers;
        /**
         * Returns the index of the closest time for the datasets.
         * Uses a modified binary search to get value.
         *
         * @param targetTime the time we want to get close to.
         * @returns index of the item with the closest time to the targetTime
         */
        private _getClosestPointToTimestamp;
        /**
         * This is a convenience method to get the number of collected slices.
         * @returns the total number of collected slices.
         */
        private _getNumberOfSlices;
        /**
         * Draws the time axis, adjusts the drawable area for the graph.
         *
         * @param timeMinMax the minimum and maximum for the time axis.
         * @param drawableArea the current allocated drawable area.
         */
        private _drawTimeAxis;
        /**
         * Given a timestamp (should be the maximum timestamp in view), this function returns the maximum unit the timestamp contains.
         * This information can be used for formatting purposes.
         * @param timestamp the maximum timestamp to find the maximum timestamp unit for.
         * @returns The maximum unit the timestamp has.
         */
        private _getTimestampUnit;
        /**
         * Given a timestamp and the interval unit, this function will parse the timestamp to the appropriate format.
         * @param timestamp The timestamp to parse
         * @param intervalUnit The maximum unit of the maximum timestamp in an interval.
         * @returns a string representing the parsed timestamp.
         */
        private _parseTimestamp;
        /**
         * Generates a list of ticks given the min and max of the axis, and the space available in the axis.
         *
         * @param minMax the minimum and maximum values of the axis
         * @param spaceAvailable the total amount of space we have allocated to our axis
         */
        private _generateTicks;
        /**
         * Nice number algorithm based on psueudo code defined in "Graphics Gems" by Andrew S. Glassner.
         * This will find a "nice" number approximately equal to num.
         *
         * @param num The number we want to get close to.
         * @param shouldRound if true we will round the number, otherwise we will get the ceiling.
         * @returns a "nice" number approximately equal to num.
         */
        private _niceNumber;
        /**
         * Gets the min and max as a single object from an array of numbers.
         * @param bounds
         * @param offset
         * @returns the min and max of the array.
         */
        private _getMinMax;
        /**
         * Converts a single number to a pixel coordinate in a single axis by normalizing the data to a [0, 1] scale using the minimum and maximum values.
         *
         * @param num the number we want to get the pixel coordinate for
         * @param minMax the min and max of the dataset in the axis we want the pixel coordinate for.
         * @param startingPixel the starting pixel coordinate (this means it takes account for any offset).
         * @param spaceAvailable the total space available in this axis.
         * @param shouldFlipValue if we should use a [1, 0] scale instead of a [0, 1] scale.
         * @returns the pixel coordinate of the value in a single axis.
         */
        private _getPixelForNumber;
        /**
         * Add in any necessary event listeners.
         *
         * @param canvas The canvas we want to attach listeners to.
         */
        private _attachEventListeners;
        /**
         * We remove all event listeners we added.
         *
         * @param canvas The canvas we want to remove listeners from.
         */
        private _removeEventListeners;
        /**
         * Handles what to do when we are hovering over the canvas and not panning.
         *
         * @param event A reference to the event to be handled.
         */
        private _handleDataHover;
        /**
         * Debounced processing and drawing of tooltip.
         */
        private _debouncedTooltip;
        /**
         * Handles what to do when we stop hovering over the canvas.
         */
        private _handleStopHover;
        /**
         * Given a line defined by P1: (x1, y1) and P2: (x2, y2) get the distance of P0 (x0, y0) from the line.
         * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
         * @param x1 x position of point P1
         * @param y1 y position of point P1
         * @param x2 x position of point P2
         * @param y2 y position of point P2
         * @param x0 x position of point P0
         * @param y0 y position of point P0
         * @returns distance of P0 from the line defined by P1 and P2
         */
        private _getDistanceFromLine;
        /**
         * This method does preprocessing calculations for the tooltip.
         * @param pos the position of our mouse.
         * @param drawableArea the remaining drawable area.
         */
        private _preprocessTooltip;
        /**
         * Draws the tooltip given the area it is allowed to draw in and the current pixel position.
         *
         * @param pos the position of the mouse cursor in pixels (x, y).
         * @param drawableArea  the available area we can draw in.
         */
        private _drawTooltip;
        /**
         * Gets the number from a pixel position given the minimum and maximum value in range, and the starting pixel and the ending pixel.
         *
         * @param pixel current pixel position we want to get the number for.
         * @param minMax the minimum and maximum number in the range.
         * @param startingPixel position of the starting pixel in range.
         * @param endingPixel position of ending pixel in range.
         * @param shouldFlip if we should use a [1, 0] scale instead of a [0, 1] scale.
         * @returns number corresponding to pixel position
         */
        private _getNumberFromPixel;
        /**
         * The handler for when we want to zoom in and out of the graph.
         *
         * @param event a mouse wheel event.
         */
        private _handleZoom;
        /**
         * Initializes the panning object and attaches appropriate listener.
         *
         * @param event the mouse event containing positional information.
         */
        private _handlePanStart;
        /**
         * While panning this event will keep track of the delta and update the "positions".
         *
         * @param event The mouse event that contains positional information.
         */
        private _handlePan;
        /**
         * Clears the panning object and removes the appropriate listener.
         */
        private _handlePanStop;
        /**
         * Method which returns true if the data should become realtime, false otherwise.
         *
         * @returns if the data should become realtime or not.
         */
        private _shouldBecomeRealtime;
        /**
         * Will generate a playhead with a futurebox that takes up (1-scalefactor)*100% of the canvas.
         *
         * @param drawableArea The remaining drawable area.
         * @param scaleFactor The Percentage between 0.0 and 1.0 of the canvas the data gets drawn on.
         */
        private _drawPlayheadRegion;
        /**
         *  Method to do cleanup when the object is done being used.
         *
         */
        destroy(): void;
        /**
         * This method clears the canvas
         */
        clear(): void;
    }


    interface ICanvasGraphComponentProps {
        id: string;
        scene: BABYLON.Scene;
        collector: BABYLON.PerformanceViewerCollector;
        layoutObservable?: BABYLON.Observable<IPerfLayoutSize>;
        returnToPlayheadObservable?: BABYLON.Observable<void>;
        onVisibleRangeChangedObservable?: BABYLON.Observable<IVisibleRangeChangedObservableProps>;
        initialGraphSize?: BABYLON.Vector2;
    }
    export var CanvasGraphComponent: React.FC<ICanvasGraphComponentProps>;


    interface IEmbedHostComponentProps {
        scene: BABYLON.Scene;
        globalState: GlobalState;
        popupMode: boolean;
        noClose?: boolean;
        noExpand?: boolean;
        onClose: () => void;
        onPopup: () => void;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        additionalNodes?: BABYLON.IExplorerAdditionalNode[];
        initialTab?: BABYLON.DebugLayerTab;
    }
    export class EmbedHostComponent extends React.Component<IEmbedHostComponentProps> {
        private _once;
        private _splitRef;
        private _topPartRef;
        private _bottomPartRef;
        constructor(props: IEmbedHostComponentProps);
        componentDidMount(): void;
        renderContent(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITabsComponentProps {
        children: any[];
        selectedIndex: number;
        onSelectedIndexChange: (value: number) => void;
    }
    export class TabsComponent extends React.Component<ITabsComponentProps> {
        constructor(props: ITabsComponentProps);
        onSelect(index: number): void;
        renderLabel(child: PaneComponent, index: number): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IPaneComponentProps {
        title: string;
        icon: any;
        scene: BABYLON.Scene;
        selectedEntity?: any;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        globalState: GlobalState;
    }
    export class PaneComponent extends React.Component<IPaneComponentProps, {
        tag: any;
    }> {
        constructor(props: IPaneComponentProps);
        render(): JSX.Element | null;
    }


    interface IActionTabsComponentProps {
        scene?: BABYLON.Scene;
        noCommands?: boolean;
        noHeader?: boolean;
        noExpand?: boolean;
        noClose?: boolean;
        popupMode?: boolean;
        onPopup?: () => void;
        onClose?: () => void;
        globalState?: GlobalState;
        initialTab?: BABYLON.DebugLayerTab;
    }
    export class ActionTabsComponent extends React.Component<IActionTabsComponentProps, {
        selectedEntity: any;
        selectedIndex: number;
    }> {
        private _onSelectionChangeObserver;
        private _onTabChangedObserver;
        private _once;
        constructor(props: IActionTabsComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        changeSelectedTab(index: number): void;
        renderContent(): import("react/jsx-runtime").JSX.Element | null;
        onClose(): void;
        onPopup(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class ToolsTabComponent extends PaneComponent {
        private _lockObject;
        private _videoRecorder;
        private _screenShotSize;
        private _gifOptions;
        private _useWidthHeight;
        private _isExportingGltf;
        private _gltfExportOptions;
        private _gifWorkerBlob;
        private _gifRecorder;
        private _previousRenderingScale;
        private _crunchingGIF;
        private _reflectorHostname;
        private _reflectorPort;
        private _reflector;
        private _envOptions;
        constructor(props: IPaneComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        captureScreenshot(): void;
        captureEquirectangular(): void;
        captureRender(): void;
        recordVideo(): void;
        recordGIFInternal(): void;
        recordGIF(): void;
        importAnimations(event: any): void;
        exportGLTF(): void;
        exportBabylon(): void;
        createEnvTexture(): void;
        exportReplay(): void;
        startRecording(): void;
        applyDelta(file: File): void;
        connectReflector(): void;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    export class StatisticsTabComponent extends PaneComponent {
        private _sceneInstrumentation;
        private _engineInstrumentation;
        private _timerIntervalId;
        constructor(props: IPaneComponentProps);
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    export class SettingsTabComponent extends PaneComponent {
        constructor(props: IPaneComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class PropertyGridTabComponent extends PaneComponent {
        private _timerIntervalId;
        private _lockObject;
        constructor(props: IPaneComponentProps);
        timerRefresh(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        renderContent(): import("react/jsx-runtime").JSX.Element | null;
        renderTags(): import("react/jsx-runtime").JSX.Element[];
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IPropertyComponentProps {
        globalState: GlobalState;
        block: BABYLON.NodeMaterialBlock;
    }


    interface IGradientStepComponentProps {
        globalState: GlobalState;
        step: BABYLON.GradientBlockColorStep;
        lineIndex: number;
        lockObject?: INSPECTOR.SharedUIComponents.LockObject;
        onDelete: () => void;
        onUpdateStep: () => void;
        onCheckForReOrder: () => void;
        onCopy?: () => void;
    }
    export class GradientStepComponent extends React.Component<IGradientStepComponentProps, {
        gradient: number;
    }> {
        constructor(props: IGradientStepComponentProps);
        updateColor(color: string): void;
        updateStep(gradient: number): void;
        onPointerUp(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class GradientPropertyTabComponent extends React.Component<IPropertyComponentProps> {
        private _gradientBlock;
        constructor(props: IPropertyComponentProps);
        forceRebuild(): void;
        deleteStep(step: BABYLON.GradientBlockColorStep): void;
        copyStep(step: BABYLON.GradientBlockColorStep): void;
        addNewStep(): void;
        checkForReOrder(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class DebugTabComponent extends PaneComponent {
        private _physicsViewersEnabled;
        private _namesViewerEnabled;
        constructor(props: IPaneComponentProps);
        switchPhysicsViewers(): void;
        switchNameViewerAsync(): Promise<void>;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface IGLTFComponentProps {
        scene: BABYLON.Scene;
        globalState: GlobalState;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    interface IGLTFComponentState {
        showGLTFLoaderOptions: boolean;
        showGLTFExtensionOptions: boolean;
    }
    export class GLTFComponent extends React.Component<IGLTFComponentProps, IGLTFComponentState> {
        private _onValidationResultsUpdatedObserver;
        constructor(props: IGLTFComponentProps);
        openValidationDetails(): void;
        prepareText(singularForm: string, count: number): string;
        componentDidMount(): void;
        componentWillUnmount(): void;
        renderValidation(): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IVariantsPropertyGridComponentProps {
        globalState: GlobalState;
        host: any;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class VariantsPropertyGridComponent extends React.Component<IVariantsPropertyGridComponentProps> {
        constructor(props: IVariantsPropertyGridComponentProps);
        private _getVariantsExtension;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface IScenePropertyGridComponentProps {
        globalState: GlobalState;
        scene: BABYLON.Scene;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
    }
    export class ScenePropertyGridComponent extends React.Component<IScenePropertyGridComponentProps> {
        private _storedEnvironmentTexture;
        private _renderingModeGroupObservable;
        constructor(props: IScenePropertyGridComponentProps);
        setRenderingModes(point: boolean, wireframe: boolean): void;
        switchIBL(): void;
        updateEnvironmentTexture(file: File): void;
        updateGravity(newValue: BABYLON.Vector3): void;
        updateTimeStep(newValue: number): void;
        normalizeScene(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IRenderGridPropertyGridComponentProps {
        globalState: GlobalState;
        scene: BABYLON.Scene;
    }
    export class RenderGridPropertyGridComponent extends React.Component<IRenderGridPropertyGridComponentProps, {
        isEnabled: boolean;
    }> {
        private _gridMesh;
        constructor(props: IRenderGridPropertyGridComponentProps);
        componentDidMount(): void;
        addOrRemoveGrid(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IParentPropertyGridComponentProps {
        globalState: GlobalState;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        node: BABYLON.Node;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class ParentPropertyGridComponent extends React.Component<IParentPropertyGridComponentProps> {
        constructor(props: IParentPropertyGridComponentProps);
        private _getNameForSortingAndDisplay;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFogPropertyGridComponentProps {
        globalState: GlobalState;
        scene: BABYLON.Scene;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class FogPropertyGridComponent extends React.Component<IFogPropertyGridComponentProps, {
        mode: number;
    }> {
        constructor(props: IFogPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IEmptyPropertyGridComponentProps {
        globalState: GlobalState;
        item: {
            inspectableCustomProperties: any;
        };
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class EmptyPropertyGridComponent extends React.Component<IEmptyPropertyGridComponentProps> {
        constructor(props: IEmptyPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICustomPropertyGridComponentProps {
        globalState: GlobalState;
        target: any;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CustomPropertyGridComponent extends React.Component<ICustomPropertyGridComponentProps, {
        mode: number;
    }> {
        constructor(props: ICustomPropertyGridComponentProps);
        renderInspectable(inspectable: BABYLON.IInspectable): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface ICommonPropertyGridComponentProps {
        globalState: GlobalState;
        host: {
            metadata: any;
        };
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CommonPropertyGridComponent extends React.Component<ICommonPropertyGridComponentProps> {
        constructor(props: ICommonPropertyGridComponentProps);
        renderLevel(jsonObject: any): import("react/jsx-runtime").JSX.Element[];
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISpritePropertyGridComponentProps {
        globalState: GlobalState;
        sprite: BABYLON.Sprite;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
    }
    export class SpritePropertyGridComponent extends React.Component<ISpritePropertyGridComponentProps> {
        private _canvasRef;
        private _imageData;
        private _cachedCellIndex;
        constructor(props: ISpritePropertyGridComponentProps);
        onManagerLink(): void;
        switchPlayStopState(): void;
        disposeSprite(): void;
        componentDidMount(): void;
        componentDidUpdate(): void;
        shouldComponentUpdate(nextProps: ISpritePropertyGridComponentProps): boolean;
        updatePreview(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISpriteManagerPropertyGridComponentProps {
        globalState: GlobalState;
        spriteManager: BABYLON.SpriteManager;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class SpriteManagerPropertyGridComponent extends React.Component<ISpriteManagerPropertyGridComponentProps> {
        private _snippetUrl;
        constructor(props: ISpriteManagerPropertyGridComponentProps);
        addNewSprite(): void;
        disposeManager(): void;
        saveToFile(): void;
        loadFromFile(file: File): void;
        loadFromSnippet(): void;
        saveToSnippet(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISoundPropertyGridComponentProps {
        globalState: GlobalState;
        sound: BABYLON.Sound;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class SoundPropertyGridComponent extends React.Component<ISoundPropertyGridComponentProps> {
        constructor(props: ISoundPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISSRRenderingPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.SSRRenderingPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class SSRRenderingPipelinePropertyGridComponent extends React.Component<ISSRRenderingPipelinePropertyGridComponentProps> {
        constructor(props: ISSRRenderingPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISSAORenderingPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.SSAORenderingPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class SSAORenderingPipelinePropertyGridComponent extends React.Component<ISSAORenderingPipelinePropertyGridComponentProps> {
        constructor(props: ISSAORenderingPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISSAO2RenderingPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.SSAO2RenderingPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class SSAO2RenderingPipelinePropertyGridComponent extends React.Component<ISSAO2RenderingPipelinePropertyGridComponentProps> {
        constructor(props: ISSAO2RenderingPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IRenderingPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.PostProcessRenderPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class RenderingPipelinePropertyGridComponent extends React.Component<IRenderingPipelinePropertyGridComponentProps> {
        constructor(props: IRenderingPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPostProcessPropertyGridComponentProps {
        globalState: GlobalState;
        postProcess: BABYLON.PostProcess;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class PostProcessPropertyGridComponent extends React.Component<IPostProcessPropertyGridComponentProps> {
        constructor(props: IPostProcessPropertyGridComponentProps);
        edit(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ILenstRenderingPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.LensRenderingPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class LensRenderingPipelinePropertyGridComponent extends React.Component<ILenstRenderingPipelinePropertyGridComponentProps> {
        constructor(props: ILenstRenderingPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IIblShadowsRenderPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.IblShadowsRenderPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class IblShadowsRenderPipelinePropertyGridComponent extends React.Component<IIblShadowsRenderPipelinePropertyGridComponentProps> {
        constructor(props: IIblShadowsRenderPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IDefaultRenderingPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.DefaultRenderingPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class DefaultRenderingPipelinePropertyGridComponent extends React.Component<IDefaultRenderingPipelinePropertyGridComponentProps> {
        constructor(props: IDefaultRenderingPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICommonRenderingPipelinePropertyGridComponentProps {
        globalState: GlobalState;
        renderPipeline: BABYLON.PostProcessRenderPipeline;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CommonRenderingPipelinePropertyGridComponent extends React.Component<ICommonRenderingPipelinePropertyGridComponentProps> {
        constructor(props: ICommonRenderingPipelinePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICommonPostProcessPropertyGridComponentProps {
        globalState: GlobalState;
        postProcess: BABYLON.PostProcess;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CommonPostProcessPropertyGridComponent extends React.Component<ICommonPostProcessPropertyGridComponentProps> {
        constructor(props: ICommonPostProcessPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export enum GradientGridMode {
        Factor = 0,
        Color3 = 1,
        Color4 = 2
    }
    interface IValueGradientGridComponent {
        globalState: GlobalState;
        label: string;
        gradients: BABYLON.Nullable<Array<BABYLON.IValueGradient>>;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        docLink?: string;
        mode: GradientGridMode;
        host: BABYLON.IParticleSystem;
        codeRecorderPropertyName: string;
        onCreateRequired: () => void;
        onRemoveRequired: (step: BABYLON.IValueGradient) => void;
    }
    export class ValueGradientGridComponent extends React.Component<IValueGradientGridComponent> {
        constructor(props: IValueGradientGridComponent);
        deleteStep(step: BABYLON.IValueGradient): void;
        addNewStep(): void;
        checkForReOrder(): void;
        updateAndSync(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISphereEmitterGridComponentProps {
        globalState: GlobalState;
        emitter: BABYLON.SphereParticleEmitter;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class SphereEmitterGridComponent extends React.Component<ISphereEmitterGridComponentProps> {
        constructor(props: ISphereEmitterGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPointEmitterGridComponentProps {
        globalState: GlobalState;
        emitter: BABYLON.PointParticleEmitter;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class PointEmitterGridComponent extends React.Component<IPointEmitterGridComponentProps> {
        constructor(props: IPointEmitterGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IParticleSystemPropertyGridComponentProps {
        globalState: GlobalState;
        system: BABYLON.IParticleSystem;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class ParticleSystemPropertyGridComponent extends React.Component<IParticleSystemPropertyGridComponentProps> {
        private _snippetUrl;
        constructor(props: IParticleSystemPropertyGridComponentProps);
        renderEmitter(): import("react/jsx-runtime").JSX.Element | null;
        raiseOnPropertyChanged(property: string, newValue: any, previousValue: any): void;
        renderControls(): import("react/jsx-runtime").JSX.Element;
        saveToFile(): void;
        loadFromFile(file: File): void;
        loadFromSnippet(): void;
        saveToSnippet(): void;
        updateTexture(file: File): void;
        viewAsync(): Promise<void>;
        edit(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMeshEmitterGridComponentProps {
        globalState: GlobalState;
        emitter: BABYLON.MeshParticleEmitter;
        scene: BABYLON.Scene;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class MeshEmitterGridComponent extends React.Component<IMeshEmitterGridComponentProps> {
        constructor(props: IMeshEmitterGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IHemisphericEmitterGridComponentProps {
        globalState: GlobalState;
        emitter: BABYLON.HemisphericParticleEmitter;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class HemisphericEmitterGridComponent extends React.Component<IHemisphericEmitterGridComponentProps> {
        constructor(props: IHemisphericEmitterGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFactorGradientStepGridComponent {
        globalState: GlobalState;
        gradient: BABYLON.FactorGradient;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        lineIndex: number;
        onDelete: () => void;
        onUpdateGradient: () => void;
        onCheckForReOrder: () => void;
        host: BABYLON.IParticleSystem;
        codeRecorderPropertyName: string;
    }
    export class FactorGradientStepGridComponent extends React.Component<IFactorGradientStepGridComponent, {
        gradient: number;
        factor1: string;
        factor2?: string;
    }> {
        constructor(props: IFactorGradientStepGridComponent);
        shouldComponentUpdate(nextProps: IFactorGradientStepGridComponent, nextState: {
            gradient: number;
            factor1: string;
            factor2?: string;
        }): boolean;
        updateFactor1(valueString: string): void;
        updateFactor2(valueString: string): void;
        updateGradient(gradient: number): void;
        onPointerUp(): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICylinderEmitterGridComponentProps {
        globalState: GlobalState;
        emitter: BABYLON.CylinderParticleEmitter;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CylinderEmitterGridComponent extends React.Component<ICylinderEmitterGridComponentProps> {
        constructor(props: ICylinderEmitterGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IConeEmitterGridComponentProps {
        globalState: GlobalState;
        emitter: BABYLON.ConeParticleEmitter;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class ConeEmitterGridComponent extends React.Component<IConeEmitterGridComponentProps> {
        constructor(props: IConeEmitterGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IColorGradientStepGridComponent {
        globalState: GlobalState;
        gradient: BABYLON.ColorGradient | BABYLON.Color3Gradient;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        lineIndex: number;
        isColor3: boolean;
        onDelete: () => void;
        onUpdateGradient: () => void;
        onCheckForReOrder: () => void;
        host: BABYLON.IParticleSystem;
        codeRecorderPropertyName: string;
    }
    export class ColorGradientStepGridComponent extends React.Component<IColorGradientStepGridComponent, {
        gradient: number;
    }> {
        constructor(props: IColorGradientStepGridComponent);
        updateColor1(color: string): void;
        updateColor2(color: string): void;
        updateGradient(gradient: number): void;
        onPointerUp(): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IBoxEmitterGridComponentProps {
        globalState: GlobalState;
        emitter: BABYLON.BoxParticleEmitter;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class BoxEmitterGridComponent extends React.Component<IBoxEmitterGridComponentProps> {
        constructor(props: IBoxEmitterGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAttractorsGridComponent {
        globalState: GlobalState;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        docLink?: string;
        host: BABYLON.ParticleSystem;
    }
    export class AttractorsGridComponent extends React.Component<IAttractorsGridComponent, {
        impostorScale: number;
        color: BABYLON.Color3;
    }> {
        private _impostorMaterial;
        private _gizmoManager;
        private _sceneOnAfterRenderObserver;
        private _fontAsset;
        constructor(props: IAttractorsGridComponent);
        addNewAttractor(): void;
        updateImpostorScale(value: number): void;
        removeImpostor(attractor: BABYLON.Attractor): void;
        addImpostor(attractor: BABYLON.Attractor, index: number): void;
        addLabelAsync(attractor: BABYLON.Attractor, index: number): Promise<void>;
        controlImpostor(attractor: BABYLON.Attractor, index: number): void;
        shouldComponentUpdate(nextProps: Readonly<IAttractorsGridComponent>, nextState: Readonly<{
            impostorScale: number;
            color: BABYLON.Color3;
        }>, nextContext: any): boolean;
        componentWillUnmount(): void;
        cleanup(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAttractorGridComponent {
        globalState: GlobalState;
        attractor: BABYLON.Attractor;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        lineIndex: number;
        host: BABYLON.IParticleSystem;
        codeRecorderPropertyName: string;
        onDelete: (attractor: BABYLON.Attractor) => void;
        removeImpostor: (attractor: BABYLON.Attractor) => void;
        addImpostor: (attractor: BABYLON.Attractor, index: number) => void;
        onControl: (attractor: BABYLON.Attractor, index: number) => void;
        isControlled: (attractor: BABYLON.Attractor) => boolean;
    }
    export class AttractorGridComponent extends React.Component<IAttractorGridComponent, {
        strength: number;
    }> {
        constructor(props: IAttractorGridComponent);
        lock(): void;
        unlock(): void;
        updateStrength(strength: number): void;
        onView(): void;
        onControl(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMetadataComponentProps {
        globalState: GlobalState;
        entity: any;
    }
    enum MetadataTypes {
        UNDEFINED = "undefined",
        NULL = "null",
        STRING = "string",
        OBJECT = "Object",
        JSON = "JSON"
    }
    /** Metadata Grid Component */
    export class MetadataGridComponent extends React.Component<IMetadataComponentProps, {
        selectedEntityMetadata: string;
        dirty: boolean;
        prettyJson: boolean;
        preventObjCorruption: boolean;
        metadataPropType: MetadataTypes;
        statusMessage: string | null;
        isValidJson: boolean;
    }> {
        private readonly _textAreaHost;
        /**
         * @param props - component props
         */
        constructor(props: IMetadataComponentProps);
        /** @ignorenaming */
        componentDidMount(): void;
        /**
         * @param prevProps - previous component props
         */
        componentDidUpdate(prevProps: Readonly<IMetadataComponentProps>): void;
        /** on entity refresh */
        refreshSelected(): void;
        /**
         * @param disabled - is disabled
         */
        setTextAreaDisabled(disabled: boolean): void;
        /**
         * @returns class name
         */
        getClassName(): string;
        /**
         * Determines the Metadata type
         * @param entity Picked entity
         * @returns MetadataTypes
         */
        getEntityType(entity: any): MetadataTypes;
        /**
         * @param input - any input
         * @returns is string
         */
        isString(input: any): boolean;
        /**
         * @param object - any object
         * @returns is parsable
         */
        parsableJson(object: object): boolean;
        /**
         * @param string - any string
         * @returns parsable string
         */
        parsableString(string: string): JSON | null;
        /**
         * @param validJson - a valid json
         * @param metadata - any metadata
         * @returns parsed metadata
         */
        parseMetaObject(validJson: boolean, metadata: any): any;
        /**
         * Recurse through an object to check for any Functions, returns False if found at least one
         * @param o Any Object, String or number
         * @returns Boolean
         */
        objectCanSafelyStringify(o: object | string | number | boolean): boolean;
        copyToClipboard(): void;
        /** Safely checks if valid JSON then appends necessary props without overwriting existing */
        populateGltfExtras(): void;
        /** render
         * @returns the component
         */
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITransformNodePropertyGridComponentProps {
        globalState: GlobalState;
        transformNode: BABYLON.TransformNode;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class TransformNodePropertyGridComponent extends React.Component<ITransformNodePropertyGridComponentProps> {
        constructor(props: ITransformNodePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISkeletonPropertyGridComponentProps {
        globalState: GlobalState;
        skeleton: BABYLON.Skeleton;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class SkeletonPropertyGridComponent extends React.Component<ISkeletonPropertyGridComponentProps> {
        private _skeletonViewersEnabled;
        private _skeletonViewerDisplayOptions;
        private _skeletonViewers;
        constructor(props: ISkeletonPropertyGridComponentProps);
        switchSkeletonViewers(): void;
        checkSkeletonViewerState(props: ISkeletonPropertyGridComponentProps): void;
        changeDisplayMode(): void;
        changeDisplayOptions(option: string, value: number): void;
        shouldComponentUpdate(nextProps: ISkeletonPropertyGridComponentProps): boolean;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMeshPropertyGridComponentProps {
        globalState: GlobalState;
        mesh: BABYLON.Mesh;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class MeshPropertyGridComponent extends React.Component<IMeshPropertyGridComponentProps, {
        displayNormals: boolean;
        displayVertexColors: boolean;
        displayBoneWeights: boolean;
        displayBoneIndex: number;
        displaySkeletonMap: boolean;
    }> {
        constructor(props: IMeshPropertyGridComponentProps);
        renderWireframeOver(): void;
        renderNormalVectors(): void;
        displayNormals(): void;
        displayVertexColors(): void;
        displayBoneWeights(): void;
        displaySkeletonMap(): void;
        onBoneDisplayIndexChange(value: number): void;
        onMaterialLink(): void;
        onSourceMeshLink(): void;
        onSkeletonLink(): void;
        convertPhysicsTypeToString(): string;
        private _getIdForDisplay;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IBonePropertyGridComponentProps {
        globalState: GlobalState;
        bone: BABYLON.Bone;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class BonePropertyGridComponent extends React.Component<IBonePropertyGridComponentProps> {
        constructor(props: IBonePropertyGridComponentProps);
        onTransformNodeLink(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    /**
     * Properties of the physics material grid component.
     */
    export interface IPhysicsMaterialGridComponentProps {
        /**
         * Lock object
         */
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        /**
         * Callback raised on the property changed event
         */
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        /**
         * Physics body to edit
         */
        body: BABYLON.PhysicsBody;
        /**
         * Global state
         */
        globalState: GlobalState;
    }
    /**
     * Component that displays the physic material properties of a physics body.
     * @param props the component props
     * @returns the component
     */
    export function PhysicsMaterialGridComponent(props: IPhysicsMaterialGridComponentProps): import("react/jsx-runtime").JSX.Element;


    /**
     * Properties of the physics mass properties grid component.
     */
    export interface IPhysicsMassPropertiesGridComponentProps {
        /**
         * Lock object
         */
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        /**
         * Callback raised on the property changed event
         */
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        /**
         * Physics body to edit
         */
        body: BABYLON.PhysicsBody;
        /**
         * Global state
         */
        globalState: GlobalState;
        /**
         * Index of the instance to edit
         */
        instanceIndex?: number;
    }
    /**
     * Component that displays the mass properties of a physics body.
     * @param props the component props
     * @returns the component
     */
    export function PhysicsMassPropertiesGridComponent(props: IPhysicsMassPropertiesGridComponentProps): import("react/jsx-runtime").JSX.Element;


    /**
     * Properties of the physics body grid component.
     */
    export interface IPhysicsBodyGridComponentProps {
        /**
         * Lock object
         */
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        /**
         * Callback raised on the property changed event
         */
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        /**
         * Physics body to edit
         */
        body: BABYLON.PhysicsBody;
        /**
         * Global state
         */
        globalState: GlobalState;
    }
    /**
     * Component that allows displaying and tweaking a physics body's properties.
     * @param props the component props
     * @returns the component
     */
    export function PhysicsBodyGridComponent(props: IPhysicsBodyGridComponentProps): import("react/jsx-runtime").JSX.Element;


    interface ITexturePropertyGridComponentProps {
        texture: BABYLON.BaseTexture;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        globalState: GlobalState;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    interface ITexturePropertyGridComponentState {
        isTextureEditorOpen: boolean;
        textureEditing: BABYLON.Nullable<BABYLON.BaseTexture>;
    }
    /**
     *
     */
    export class TexturePropertyGridComponent extends React.Component<ITexturePropertyGridComponentProps, ITexturePropertyGridComponentState> {
        private _adtInstrumentation;
        private _popoutWindowRef;
        private _textureLineRef;
        private _textureInspectorSize;
        constructor(props: ITexturePropertyGridComponentProps);
        componentWillUnmount(): void;
        updateTexture(file: File): void;
        openTextureEditor(): void;
        onOpenTextureEditor(): void;
        onCloseTextureEditor(callback?: {
            (): void;
        }): void;
        forceRefresh(): void;
        findTextureFormat(format: number): {
            label: string;
            normalizable: number;
            value: number;
            hideType?: undefined;
            compressed?: undefined;
        } | {
            label: string;
            normalizable: number;
            hideType: boolean;
            value: number;
            compressed?: undefined;
        } | {
            label: string;
            normalizable: number;
            compressed: boolean;
            value: number;
            hideType?: undefined;
        } | null;
        findTextureType(type: number): {
            label: string;
            normalizable: number;
            value: number;
        } | null;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IStandardMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.StandardMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class StandardMaterialPropertyGridComponent extends React.Component<IStandardMaterialPropertyGridComponentProps> {
        private _onDebugSelectionChangeObservable;
        constructor(props: IStandardMaterialPropertyGridComponentProps);
        renderTextures(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISkyMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.SkyMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    /**
     * Property grid component for the BABYLON.SkyMaterial
     */
    export class SkyMaterialPropertyGridComponent extends React.Component<ISkyMaterialPropertyGridComponentProps> {
        constructor(props: ISkyMaterialPropertyGridComponentProps);
        renderSky(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPBRSpecularGlossinessMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.PBRSpecularGlossinessMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class PBRSpecularGlossinessMaterialPropertyGridComponent extends React.Component<IPBRSpecularGlossinessMaterialPropertyGridComponentProps> {
        private _onDebugSelectionChangeObservable;
        constructor(props: IPBRSpecularGlossinessMaterialPropertyGridComponentProps);
        renderTextures(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPBRMetallicRoughnessMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.PBRMetallicRoughnessMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class PBRMetallicRoughnessMaterialPropertyGridComponent extends React.Component<IPBRMetallicRoughnessMaterialPropertyGridComponentProps> {
        private _onDebugSelectionChangeObservable;
        constructor(props: IPBRMetallicRoughnessMaterialPropertyGridComponentProps);
        renderTextures(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPBRMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.PBRMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    /**
     * @internal
     */
    export class PBRMaterialPropertyGridComponent extends React.Component<IPBRMaterialPropertyGridComponentProps> {
        private _onDebugSelectionChangeObservable;
        constructor(props: IPBRMaterialPropertyGridComponentProps);
        switchAmbientMode(state: boolean): void;
        renderTextures(onDebugSelectionChangeObservable: BABYLON.Observable<TextureLinkLineComponent>): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IOpenPBRMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.OpenPBRMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    /**
     * @internal
     */
    export class OpenPBRMaterialPropertyGridComponent extends React.Component<IOpenPBRMaterialPropertyGridComponentProps> {
        private _onDebugSelectionChangeObservable;
        constructor(props: IOpenPBRMaterialPropertyGridComponentProps);
        switchAmbientMode(state: boolean): void;
        renderTextures(onDebugSelectionChangeObservable: BABYLON.Observable<TextureLinkLineComponent>): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface INodeMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.NodeMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class NodeMaterialPropertyGridComponent extends React.Component<INodeMaterialPropertyGridComponentProps> {
        private _onDebugSelectionChangeObservable;
        constructor(props: INodeMaterialPropertyGridComponentProps);
        edit(): void;
        renderTextures(): import("react/jsx-runtime").JSX.Element | null;
        renderInputBlock(block: BABYLON.InputBlock): import("react/jsx-runtime").JSX.Element | null;
        renderInputValues(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMultiMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.MultiMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class MultiMaterialPropertyGridComponent extends React.Component<IMultiMaterialPropertyGridComponentProps> {
        constructor(props: IMultiMaterialPropertyGridComponentProps);
        onMaterialLink(mat: BABYLON.Material): void;
        renderChildMaterial(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.Material;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class MaterialPropertyGridComponent extends React.Component<IMaterialPropertyGridComponentProps> {
        constructor(props: IMaterialPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICommonMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.Material;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CommonMaterialPropertyGridComponent extends React.Component<ICommonMaterialPropertyGridComponentProps> {
        constructor(props: ICommonMaterialPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IBackgroundMaterialPropertyGridComponentProps {
        globalState: GlobalState;
        material: BABYLON.BackgroundMaterial;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class BackgroundMaterialPropertyGridComponent extends React.Component<IBackgroundMaterialPropertyGridComponentProps> {
        private _onDebugSelectionChangeObservable;
        constructor(props: IBackgroundMaterialPropertyGridComponentProps);
        renderTextures(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IToolSettingsProps {
        tool: ITool | undefined;
    }
    export class ToolSettings extends React.Component<IToolSettingsProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface ITool extends IToolData {
        instance: IToolType;
    }
    interface IToolBarProps {
        tools: ITool[];
        addTool(url: string): void;
        changeTool(toolIndex: number): void;
        activeToolIndex: number;
        metadata: IMetadata;
        setMetadata(data: any): void;
        pickerOpen: boolean;
        setPickerOpen(open: boolean): void;
        pickerRef: React.RefObject<HTMLDivElement>;
        hasAlpha: boolean;
    }
    interface IToolBarState {
        toolURL: string;
        addOpen: boolean;
    }
    export class ToolBar extends React.Component<IToolBarProps, IToolBarState> {
        private _lockObject;
        constructor(props: IToolBarProps);
        computeRGBAColor(): BABYLON.Color4;
        shouldComponentUpdate(nextProps: IToolBarProps): boolean;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITextureEditorComponentProps {
        texture: BABYLON.BaseTexture;
        url: string;
        window: React.RefObject<PopupComponent>;
        onUpdate: () => void;
    }
    interface ITextureEditorComponentState {
        tools: ITool[];
        activeToolIndex: number;
        metadata: IMetadata;
        channels: IChannel[];
        pixelData: IPixelData;
        face: number;
        mipLevel: number;
        pickerOpen: boolean;
    }
    export interface IToolParameters {
        /** The visible scene in the editor. Useful for adding pointer and keyboard events. */
        scene: BABYLON.Scene;
        /** The 2D canvas which you can sample pixel data from. Tools should not paint directly on this canvas. */
        canvas2D: HTMLCanvasElement;
        /** The 3D scene which tools can add post processes to. */
        scene3D: BABYLON.Scene;
        /** The size of the texture. */
        size: BABYLON.ISize;
        /** Pushes the editor texture back to the original scene. This should be called every time a tool makes any modification to a texture. */
        updateTexture: () => void;
        /** The metadata object which is shared between all tools. Feel free to store any information here. Do not set this directly: instead call setMetadata. */
        metadata: IMetadata;
        /** Call this when you want to mutate the metadata. */
        setMetadata: (data: any) => void;
        /** Returns the texture coordinates under the cursor */
        getMouseCoordinates: (pointerInfo: BABYLON.PointerInfo) => BABYLON.Vector2;
        /** Provides a canvas that you can use the canvas API to paint on. */
        startPainting: () => Promise<CanvasRenderingContext2D>;
        /** After you have painted on your canvas, call this method to push the updates back to the texture. */
        updatePainting: () => void;
        /** Call this when you are finished painting. */
        stopPainting: () => void;
        /** Returns whether the tool should be allowed to interact */
        interactionEnabled: () => boolean;
    }
    export interface IToolGUIProps {
        instance: IToolType;
    }
    /** An interface representing the definition of a tool */
    export interface IToolData {
        /** Name to display on the toolbar */
        name: string;
        /** A class definition for the tool including setup and cleanup methods */
        type: IToolConstructable;
        /**  An SVG icon encoded in Base64 */
        icon: string;
        /** Whether the tool uses postprocesses */
        is3D?: boolean;
        cursor?: string;
        settingsComponent?: React.ComponentType<IToolGUIProps>;
    }
    export interface IToolType {
        /** Called when the tool is selected. */
        setup: () => void;
        /** Called when the tool is deselected. */
        cleanup: () => void;
        /** Optional. Called when the user resets the texture or uploads a new texture. Tools may want to reset their state when this happens. */
        onReset?: () => void;
    }
    /** For constructable types, TS requires that you define a separate interface which constructs your actual interface */
    interface IToolConstructable {
        new (getParameters: () => IToolParameters): IToolType;
    }
    export interface IMetadata {
        color: string;
        alpha: number;
        select: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        };
        [key: string]: any;
    }
    export class TextureEditorComponent extends React.Component<ITextureEditorComponentProps, ITextureEditorComponentState> {
        private _textureCanvasManager;
        private _uiCanvas;
        private _2DCanvas;
        private _3DCanvas;
        private _pickerRef;
        private _timer;
        private static _PREVIEW_UPDATE_DELAY_MS;
        constructor(props: ITextureEditorComponentProps);
        componentDidMount(): void;
        componentDidUpdate(): void;
        componentWillUnmount(): void;
        textureDidUpdate(): void;
        loadToolFromURL(url: string): void;
        addTools(tools: IToolData[]): void;
        getToolParameters(): IToolParameters;
        changeTool(index: number): void;
        setMetadata(newMetadata: any): void;
        setPickerOpen(open: boolean): void;
        onPointerDown(evt: React.PointerEvent): void;
        saveTexture(): void;
        resetTexture(): void;
        resizeTexture(width: number, height: number): void;
        uploadTexture(file: File): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IPixelData {
        x?: number;
        y?: number;
        r?: number;
        g?: number;
        b?: number;
        a?: number;
    }
    export class TextureCanvasManager {
        private _engine;
        private _scene;
        private _camera;
        private _cameraPos;
        private _scale;
        private _isPanning;
        private _mouseX;
        private _mouseY;
        private _uiCanvas;
        private _size;
        /** The canvas we paint onto using the canvas API */
        private _2DCanvas;
        /** The canvas we apply post processes to */
        private _3DCanvas;
        /** The canvas which handles channel filtering */
        private _channelsTexture;
        private _3DEngine;
        private _3DPlane;
        private _3DCanvasTexture;
        private _3DScene;
        private _channels;
        private _face;
        private _mipLevel;
        /** The texture from the original engine that we invoked the editor on */
        private _originalTexture;
        /** This is a hidden texture which is only responsible for holding the actual texture memory in the original engine */
        private _target;
        private _originalTextureProperties;
        /** Keeps track of whether we have modified the texture */
        private _didEdit;
        private _plane;
        private _planeMaterial;
        /** Tracks which keys are currently pressed */
        private _keyMap;
        /** Tracks which mouse buttons are currently pressed */
        private _buttonsPressed;
        private readonly ZOOM_MOUSE_SPEED;
        private readonly ZOOM_KEYBOARD_SPEED;
        private readonly ZOOM_IN_KEY;
        private readonly ZOOM_OUT_KEY;
        private readonly PAN_SPEED;
        private readonly PAN_KEY;
        private readonly MIN_SCALE;
        private readonly GRID_SCALE;
        private readonly MAX_SCALE;
        private readonly SELECT_ALL_KEY;
        private readonly SAVE_KEY;
        private readonly RESET_KEY;
        private readonly DESELECT_KEY;
        /** The number of milliseconds between texture updates */
        private readonly PUSH_FREQUENCY;
        private _tool;
        private _setPixelData;
        private _setMipLevel;
        private _window;
        private _metadata;
        private _editing3D;
        private _onUpdate;
        private _setMetadata;
        private _imageData;
        private _canPush;
        private _shouldPush;
        private _paintCanvas;
        constructor(texture: BABYLON.BaseTexture, window: Window, canvasUI: HTMLCanvasElement, canvas2D: HTMLCanvasElement, canvas3D: HTMLCanvasElement, setPixelData: (pixelData: IPixelData) => void, metadata: IMetadata, onUpdate: () => void, setMetadata: (metadata: any) => void, setMipLevel: (level: number) => void);
        updateTexture(): Promise<void>;
        private pushTexture;
        startPainting(): Promise<CanvasRenderingContext2D>;
        updatePainting(): void;
        stopPainting(): void;
        private updateDisplay;
        set channels(channels: IChannel[]);
        paintPixelsOnCanvas(pixelData: Uint8Array, canvas: HTMLCanvasElement): void;
        grabOriginalTexture(): Promise<Uint8Array<ArrayBufferLike>>;
        getMouseCoordinates(pointerInfo: BABYLON.PointerInfo): BABYLON.Vector2;
        get scene(): BABYLON.Scene;
        get canvas2D(): HTMLCanvasElement;
        get size(): BABYLON.ISize;
        set tool(tool: BABYLON.Nullable<ITool>);
        get tool(): BABYLON.Nullable<ITool>;
        set face(face: number);
        set mipLevel(mipLevel: number);
        /** Returns the 3D scene used for postprocesses */
        get scene3D(): BABYLON.Scene;
        set metadata(metadata: IMetadata);
        private makePlane;
        reset(): void;
        resize(newSize: BABYLON.ISize): Promise<void>;
        setSize(size: BABYLON.ISize): void;
        upload(file: File): void;
        saveTexture(): void;
        toolInteractionEnabled(): boolean;
        dispose(): void;
    }


    interface ITextureCanvasComponentProps {
        canvasUI: React.RefObject<HTMLCanvasElement>;
        canvas2D: React.RefObject<HTMLCanvasElement>;
        canvas3D: React.RefObject<HTMLCanvasElement>;
        texture: BABYLON.BaseTexture;
    }
    export class TextureCanvasComponent extends React.Component<ITextureCanvasComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPropertiesBarProps {
        texture: BABYLON.BaseTexture;
        size: BABYLON.ISize;
        saveTexture(): void;
        pixelData: IPixelData;
        face: number;
        setFace(face: number): void;
        resetTexture(): void;
        resizeTexture(width: number, height: number): void;
        uploadTexture(file: File): void;
        mipLevel: number;
        setMipLevel: (mipLevel: number) => void;
    }
    interface IPropertiesBarState {
        width: number;
        height: number;
    }
    export class PropertiesBar extends React.PureComponent<IPropertiesBarProps, IPropertiesBarState> {
        private _faces;
        constructor(props: IPropertiesBarProps);
        private _pixelData;
        private _getNewDimension;
        componentWillUpdate(nextProps: IPropertiesBarProps): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IChannel {
        visible: boolean;
        editable: boolean;
        name: string;
        id: "R" | "G" | "B" | "A";
        icon: any;
    }
    interface IChannelsBarProps {
        channels: IChannel[];
        setChannels(channelState: IChannel[]): void;
    }
    export class ChannelsBar extends React.PureComponent<IChannelsBarProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export var canvasShader: {
        path: {
            vertexSource: string;
            fragmentSource: string;
        };
        options: {
            attributes: string[];
            uniforms: string[];
        };
    };


    interface IBottomBarProps {
        texture: BABYLON.BaseTexture;
        mipLevel: number;
    }
    export class BottomBar extends React.PureComponent<IBottomBarProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export var RectangleSelect: IToolData;


    export var Paintbrush: IToolData;


    export var Floodfill: IToolData;


    export var Eyedropper: IToolData;


    var _default: IToolData[];


    export var Contrast: IToolData;


    interface ISpotLightPropertyGridComponentProps {
        globalState: GlobalState;
        light: BABYLON.SpotLight;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
    }
    export class SpotLightPropertyGridComponent extends React.Component<ISpotLightPropertyGridComponentProps> {
        constructor(props: ISpotLightPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IRectAreaLightPropertyGridComponentProps {
        globalState: GlobalState;
        light: BABYLON.RectAreaLight;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
    }
    export class RectAreaLightPropertyGridComponent extends React.Component<IRectAreaLightPropertyGridComponentProps> {
        constructor(props: IRectAreaLightPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPointLightPropertyGridComponentProps {
        globalState: GlobalState;
        light: BABYLON.PointLight;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class PointLightPropertyGridComponent extends React.Component<IPointLightPropertyGridComponentProps> {
        constructor(props: IPointLightPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IHemisphericLightPropertyGridComponentProps {
        globalState: GlobalState;
        light: BABYLON.HemisphericLight;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class HemisphericLightPropertyGridComponent extends React.Component<IHemisphericLightPropertyGridComponentProps> {
        constructor(props: IHemisphericLightPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IDirectionalLightPropertyGridComponentProps {
        globalState: GlobalState;
        light: BABYLON.DirectionalLight;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class DirectionalLightPropertyGridComponent extends React.Component<IDirectionalLightPropertyGridComponentProps> {
        constructor(props: IDirectionalLightPropertyGridComponentProps);
        displayFrustum(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICommonShadowLightPropertyGridComponentProps {
        globalState: GlobalState;
        light: BABYLON.IShadowLight;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CommonShadowLightPropertyGridComponent extends React.Component<ICommonShadowLightPropertyGridComponentProps> {
        private _internals;
        constructor(props: ICommonShadowLightPropertyGridComponentProps);
        createShadowGenerator(): void;
        disposeShadowGenerator(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICommonLightPropertyGridComponentProps {
        globalState: GlobalState;
        light: BABYLON.Light;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CommonLightPropertyGridComponent extends React.Component<ICommonLightPropertyGridComponentProps> {
        constructor(props: ICommonLightPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ILayerPropertyGridComponentProps {
        globalState: GlobalState;
        layer: BABYLON.EffectLayer;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class LayerPropertyGridComponent extends React.Component<ILayerPropertyGridComponentProps> {
        constructor(props: ILayerPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFrameGraphPropertyGridComponentProps {
        globalState: GlobalState;
        frameGraph: BABYLON.FrameGraph;
        extensibilityGroups?: BABYLON.IExplorerExtensibilityGroup[];
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class FrameGraphPropertyGridComponent extends React.Component<IFrameGraphPropertyGridComponentProps> {
        constructor(props: IFrameGraphPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFreeCameraPropertyGridComponentProps {
        globalState: GlobalState;
        camera: BABYLON.FreeCamera;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class FreeCameraPropertyGridComponent extends React.Component<IFreeCameraPropertyGridComponentProps> {
        constructor(props: IFreeCameraPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFollowCameraPropertyGridComponentProps {
        globalState: GlobalState;
        camera: BABYLON.FollowCamera;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class FollowCameraPropertyGridComponent extends React.Component<IFollowCameraPropertyGridComponentProps> {
        constructor(props: IFollowCameraPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICommonCameraPropertyGridComponentProps {
        globalState: GlobalState;
        camera: BABYLON.Camera;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class CommonCameraPropertyGridComponent extends React.Component<ICommonCameraPropertyGridComponentProps, {
        mode: number;
    }> {
        constructor(props: ICommonCameraPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IArcRotateCameraPropertyGridComponentProps {
        globalState: GlobalState;
        camera: BABYLON.ArcRotateCamera;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class ArcRotateCameraPropertyGridComponent extends React.Component<IArcRotateCameraPropertyGridComponentProps> {
        constructor(props: IArcRotateCameraPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITargetedAnimationGridComponentProps {
        globalState: GlobalState;
        targetedAnimation: BABYLON.TargetedAnimation;
        scene: BABYLON.Scene;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class TargetedAnimationGridComponent extends React.Component<ITargetedAnimationGridComponentProps> {
        private _animationGroup;
        private _animationCurveEditorContext;
        constructor(props: ITargetedAnimationGridComponentProps);
        findAnimationGroup: () => void;
        playOrPause: () => void;
        deleteAnimation: () => void;
        updateContextFromProps: () => void;
        componentDidMount(): void;
        componentDidUpdate(prevProps: Readonly<ITargetedAnimationGridComponentProps>, prevState: Readonly<{}>, snapshot?: any): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAnimationGridComponentProps {
        globalState: GlobalState;
        animatable: BABYLON.IAnimatable;
        scene: BABYLON.Scene;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class AnimationGridComponent extends React.Component<IAnimationGridComponentProps, {
        currentFrame: number;
    }> {
        private _animations;
        private _ranges;
        private _mainAnimatable;
        private _onBeforeRenderObserver;
        private _isPlaying;
        private _timelineRef;
        private _animationCurveEditorContext;
        private _animationControl;
        constructor(props: IAnimationGridComponentProps);
        playOrPause(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        onCurrentFrameChange(value: number): void;
        onChangeFromOrTo(): void;
        componentDidUpdate(prevProps: IAnimationGridComponentProps): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAnimationGroupGridComponentProps {
        globalState: GlobalState;
        animationGroup: BABYLON.AnimationGroup;
        scene: BABYLON.Scene;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class AnimationGroupGridComponent extends React.Component<IAnimationGroupGridComponentProps, {
        playButtonText: string;
        currentFrame: number;
    }> {
        private _onAnimationGroupPlayObserver;
        private _onAnimationGroupPauseObserver;
        private _onBeforeRenderObserver;
        private _timelineRef;
        private _animationCurveEditorContext;
        constructor(props: IAnimationGroupGridComponentProps);
        componentDidMount(): void;
        disconnect(animationGroup: BABYLON.AnimationGroup): void;
        connect(animationGroup: BABYLON.AnimationGroup): void;
        updateCurrentFrame(animationGroup: BABYLON.AnimationGroup): void;
        shouldComponentUpdate(nextProps: IAnimationGroupGridComponentProps): boolean;
        componentWillUnmount(): void;
        playOrPause(): void;
        onCurrentFrameChange(value: number): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITopBarComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface ITopBarComponentState {
        keyFrameValue: string;
        keyValue: string;
        frameControlEnabled: boolean;
        valueControlEnabled: boolean;
    }
    export class TopBarComponent extends React.Component<ITopBarComponentProps, ITopBarComponentState> {
        private _onFrameSetObserver;
        private _onValueSetObserver;
        private _onActiveAnimationChangedObserver;
        private _onActiveKeyPointChanged;
        constructor(props: ITopBarComponentProps);
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IActiveAnimationChangedOptions {
        evaluateKeys?: boolean;
        frame?: boolean;
        range?: boolean;
    }
    export class Context {
        title: string;
        animations: BABYLON.Nullable<BABYLON.Animation[] | BABYLON.TargetedAnimation[]>;
        scene: BABYLON.Scene;
        target: BABYLON.Nullable<BABYLON.IAnimatable>;
        rootAnimationGroup: BABYLON.Nullable<BABYLON.AnimationGroup>;
        activeAnimations: BABYLON.Animation[];
        activeChannels: {
            [key: number]: string;
        };
        activeKeyPoints: BABYLON.Nullable<KeyPointComponent[]>;
        mainKeyPoint: BABYLON.Nullable<KeyPointComponent>;
        snippetId: string;
        useTargetAnimations: boolean;
        activeFrame: number;
        fromKey: number;
        toKey: number;
        useExistingPlayRange: boolean;
        forwardAnimation: boolean;
        isPlaying: boolean;
        clipLength: number;
        referenceMinFrame: number;
        referenceMaxFrame: number;
        focusedInput: boolean;
        onActiveAnimationChanged: BABYLON.Observable<IActiveAnimationChangedOptions>;
        onActiveKeyPointChanged: BABYLON.Observable<void>;
        onHostWindowResized: BABYLON.Observable<void>;
        onSelectAllKeys: BABYLON.Observable<void>;
        onActiveKeyFrameChanged: BABYLON.Observable<number>;
        onFrameSet: BABYLON.Observable<number>;
        onFrameManuallyEntered: BABYLON.Observable<number>;
        onMainKeyPointSet: BABYLON.Observable<void>;
        onMainKeyPointMoved: BABYLON.Observable<void>;
        onValueSet: BABYLON.Observable<number>;
        onValueManuallyEntered: BABYLON.Observable<number>;
        onFrameRequired: BABYLON.Observable<void>;
        onCreateOrUpdateKeyPointRequired: BABYLON.Observable<void>;
        onFlattenTangentRequired: BABYLON.Observable<void>;
        onLinearTangentRequired: BABYLON.Observable<void>;
        onBreakTangentRequired: BABYLON.Observable<void>;
        onUnifyTangentRequired: BABYLON.Observable<void>;
        onStepTangentRequired: BABYLON.Observable<void>;
        onDeleteAnimation: BABYLON.Observable<BABYLON.Animation>;
        onGraphMoved: BABYLON.Observable<number>;
        onGraphScaled: BABYLON.Observable<number>;
        onRangeUpdated: BABYLON.Observable<void>;
        onMoveToFrameRequired: BABYLON.Observable<number>;
        onAnimationStateChanged: BABYLON.Observable<void>;
        onDeleteKeyActiveKeyPoints: BABYLON.Observable<void>;
        onSelectionRectangleMoved: BABYLON.Observable<DOMRect>;
        onAnimationsLoaded: BABYLON.Observable<void>;
        onEditAnimationRequired: BABYLON.Observable<BABYLON.Animation>;
        onEditAnimationUIClosed: BABYLON.Observable<void>;
        onClipLengthIncreased: BABYLON.Observable<number>;
        onClipLengthDecreased: BABYLON.Observable<number>;
        onInterpolationModeSet: BABYLON.Observable<{
            keyId: number;
            value: BABYLON.AnimationKeyInterpolation;
        }>;
        onSelectToActivated: BABYLON.Observable<{
            from: number;
            to: number;
        }>;
        onRangeFrameBarResized: BABYLON.Observable<number>;
        onPlayheadMoved: BABYLON.Observable<number>;
        lockLastFrameValue: boolean;
        lockLastFrameFrame: boolean;
        onActiveKeyDataChanged: BABYLON.Observable<number>;
        prepare(): void;
        play(forward: boolean): void;
        stop(): void;
        moveToFrame(frame: number): void;
        refreshTarget(): void;
        clearSelection(): void;
        enableChannel(animation: BABYLON.Animation, color: string): void;
        disableChannel(animation: BABYLON.Animation): void;
        isChannelEnabled(animation: BABYLON.Animation, color: string): boolean;
        getActiveChannel(animation: BABYLON.Animation): string;
        resetAllActiveChannels(): void;
        getAnimationSortIndex(animation: BABYLON.Animation): number;
        getPrevKey(): BABYLON.Nullable<number>;
        getNextKey(): BABYLON.Nullable<number>;
        /**
         * If any current active animation has a key at the received frameNumber,
         * return the index of the animation in the active animation array, and
         * the index of the frame on the animation.
         * @param frameNumber the frame number to look for
         * @returns null if no key was found, or an object with the animation index and key index
         */
        getKeyAtAnyFrameIndex(frameNumber: number): {
            animationIndex: number;
            keyIndex: number;
        } | null;
        /**
         * @returns true if any active animation has a quaternion animation
         */
        hasActiveQuaternionAnimationKeyPoints(): boolean;
    }


    interface IAnimationCurveEditorComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IAnimationCurveEditorComponentState {
        isOpen: boolean;
    }
    export class AnimationCurveEditorComponent extends React.Component<IAnimationCurveEditorComponentProps, IAnimationCurveEditorComponentState> {
        constructor(props: IAnimationCurveEditorComponentProps);
        onCloseAnimationCurveEditor(window: Window | null): void;
        shouldComponentUpdate(newProps: IAnimationCurveEditorComponentProps, newState: IAnimationCurveEditorComponentState): boolean;
        private _onKeyDown;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISideBarComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface ISideBarComponentState {
        mode: Mode;
    }
    enum Mode {
        Edit = 0,
        Add = 1,
        Load = 2,
        Save = 3
    }
    export class SideBarComponent extends React.Component<ISideBarComponentProps, ISideBarComponentState> {
        constructor(props: ISideBarComponentProps);
        private _onAddAnimation;
        private _onLoadAnimation;
        private _onSaveAnimation;
        private _onEditAnimation;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ISaveAnimationComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface ISaveAnimationComponentState {
    }
    export class SaveAnimationComponent extends React.Component<ISaveAnimationComponentProps, ISaveAnimationComponentState> {
        private _selectedAnimations;
        private _root;
        constructor(props: ISaveAnimationComponentProps);
        private _getJson;
        saveToSnippetServer(): void;
        saveToFile(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ILoadAnimationComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface ILoadAnimationComponentState {
    }
    export class LoadAnimationComponent extends React.Component<ILoadAnimationComponentProps, ILoadAnimationComponentState> {
        private _root;
        private _textInput;
        constructor(props: ILoadAnimationComponentProps);
        loadFromFile(evt: React.ChangeEvent<HTMLInputElement>): void;
        loadFromSnippetServer(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IEditAnimationComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IEditAnimationComponentState {
        isVisible: boolean;
        animation: BABYLON.Nullable<BABYLON.Animation>;
    }
    export class EditAnimationComponent extends React.Component<IEditAnimationComponentProps, IEditAnimationComponentState> {
        private _root;
        private _displayName;
        private _property;
        private _loopModeElement;
        private _onEditAnimationRequiredObserver;
        constructor(props: IEditAnimationComponentProps);
        componentWillUnmount(): void;
        close(): void;
        validate(): void;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface IAnimationSubEntryComponentProps {
        globalState: GlobalState;
        context: Context;
        animation: BABYLON.Animation;
        color: string;
        subName: string;
    }
    interface IAnimationSubEntryComponentState {
        isSelected: boolean;
    }
    export class AnimationSubEntryComponent extends React.Component<IAnimationSubEntryComponentProps, IAnimationSubEntryComponentState> {
        private _onActiveAnimationChangedObserver;
        private _onActiveKeyPointChangedObserver;
        constructor(props: IAnimationSubEntryComponentProps);
        componentWillUnmount(): void;
        private _activate;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAnimationListComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IAnimationListComponentState {
        isVisible: boolean;
    }
    export class AnimationListComponent extends React.Component<IAnimationListComponentProps, IAnimationListComponentState> {
        private _onEditAnimationRequiredObserver;
        private _onEditAnimationUIClosedObserver;
        private _onDeleteAnimationObserver;
        constructor(props: IAnimationListComponentProps);
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface IAnimationEntryComponentProps {
        globalState: GlobalState;
        context: Context;
        animation: BABYLON.Animation;
    }
    interface IAnimationEntryComponentState {
        isExpanded: boolean;
        isSelected: boolean;
    }
    export class AnimationEntryComponent extends React.Component<IAnimationEntryComponentProps, IAnimationEntryComponentState> {
        private _onActiveAnimationChangedObserver;
        private _onActiveKeyPointChangedObserver;
        private _onSelectToActivatedObserver;
        private _unmount;
        constructor(props: IAnimationEntryComponentProps);
        private _onGear;
        private _onDelete;
        componentWillUnmount(): void;
        private _activate;
        private _expandOrCollapse;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IAddAnimationComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IAddAnimationComponentState {
        customPropertyMode: boolean;
    }
    export class AddAnimationComponent extends React.Component<IAddAnimationComponentProps, IAddAnimationComponentState> {
        private _root;
        private _displayName;
        private _property;
        private _typeElement;
        private _propertylement;
        private _loopModeElement;
        constructor(props: IAddAnimationComponentProps);
        createNew(): void;
        getInferredType(activeProperty?: string): any;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IRangeFrameBarComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IRangeFrameBarComponentState {
    }
    export class RangeFrameBarComponent extends React.Component<IRangeFrameBarComponentProps, IRangeFrameBarComponentState> {
        private _svgHost;
        private _viewWidth;
        private _offsetX;
        private _isMounted;
        private _onActiveAnimationChangedObserver;
        private _onPlayheadMovedObserver;
        private _onFrameManuallyEnteredObserver;
        constructor(props: IRangeFrameBarComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        private _computeSizes;
        private _dropKeyFrames;
        private _buildActiveFrame;
        private _buildFrames;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPlayHeadComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IPlayHeadComponentState {
    }
    export class PlayHeadComponent extends React.Component<IPlayHeadComponentProps, IPlayHeadComponentState> {
        private readonly _graphAbsoluteWidth;
        private _playHead;
        private _playHeadCircle;
        private _onBeforeRenderObserver;
        private _onActiveAnimationChangedObserver;
        private _onRangeFrameBarResizedObserver;
        private _onMoveToFrameRequiredObserver;
        private _onGraphMovedObserver;
        private _onGraphScaledObserver;
        private _viewScale;
        private _offsetX;
        private _offsetRange;
        private _viewWidth;
        private readonly _rangeWidthToPlayheadWidth;
        private _pointerIsDown;
        constructor(props: IPlayHeadComponentProps);
        private _moveHead;
        private _frameToPixel;
        private _pixelToFrame;
        componentWillUnmount(): void;
        private _getPixelValues;
        private _onPointerDown;
        private _onPointerMove;
        private _onPointerUp;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface IKeyPointComponentProps {
        x: number;
        y: number;
        getPreviousX: () => BABYLON.Nullable<number>;
        getNextX: () => BABYLON.Nullable<number>;
        invertX: (x: number) => number;
        invertY: (y: number) => number;
        convertX: (x: number) => number;
        convertY: (y: number) => number;
        nextX?: number;
        scale: number;
        keyId: number;
        curve: Curve;
        context: Context;
        channel: string;
        onFrameValueChanged: (value: number) => void;
        onKeyValueChanged: (value: number) => void;
    }
    interface IKeyPointComponentState {
        selectedState: SelectionState;
        tangentSelectedIndex: number;
        x: number;
        y: number;
    }
    export enum SelectionState {
        None = 0,
        Selected = 1,
        Siblings = 2
    }
    export class KeyPointComponent extends React.Component<IKeyPointComponentProps, IKeyPointComponentState> {
        private _onActiveKeyPointChangedObserver;
        private _onActiveKeyFrameChangedObserver;
        private _onFrameManuallyEnteredObserver;
        private _onValueManuallyEnteredObserver;
        private _onMainKeyPointSetObserver;
        private _onMainKeyPointMovedObserver;
        private _onSelectionRectangleMovedObserver;
        private _onFlattenTangentRequiredObserver;
        private _onLinearTangentRequiredObserver;
        private _onBreakTangentRequiredObserver;
        private _onUnifyTangentRequiredObserver;
        private _onStepTangentRequiredObserver;
        private _onSelectAllKeysObserver;
        private _pointerIsDown;
        private _sourcePointerX;
        private _sourcePointerY;
        private _offsetXToMain;
        private _offsetYToMain;
        private _svgHost;
        private _keyPointSVG;
        private _controlMode;
        private _storedLengthIn;
        private _storedLengthOut;
        private _inVec;
        private _outVec;
        private _lockX;
        private _lockY;
        private _accumulatedX;
        private _accumulatedY;
        constructor(props: IKeyPointComponentProps);
        componentWillUnmount(): void;
        shouldComponentUpdate(newProps: IKeyPointComponentProps, newState: IKeyPointComponentState): boolean;
        private _breakTangent;
        private _unifyTangent;
        private _flattenTangent;
        private _linearTangent;
        private _stepTangent;
        private _select;
        private _onPointerDown;
        private _extractSlope;
        private _processTangentMove;
        private _onPointerMove;
        private _onPointerUp;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface IGraphComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IGraphComponentState {
    }
    export class GraphComponent extends React.Component<IGraphComponentProps, IGraphComponentState> {
        private readonly _minScale;
        private readonly _maxScale;
        private readonly _graphAbsoluteWidth;
        private readonly _graphAbsoluteHeight;
        private _viewWidth;
        private _viewCurveWidth;
        private _viewHeight;
        private _viewScale;
        private _offsetX;
        private _offsetY;
        private _inSelectionMode;
        private _graphOffsetX;
        private _minValue;
        private _maxValue;
        private _minFrame;
        private _maxFrame;
        private _svgHost;
        private _svgHost2;
        private _selectionRectangle;
        private _curves;
        private _pointerIsDown;
        private _sourcePointerX;
        private _sourcePointerY;
        private _selectionMade;
        private _selectionStartX;
        private _selectionStartY;
        private _onActiveAnimationChangedObserver;
        constructor(props: IGraphComponentProps);
        componentWillUnmount(): void;
        private _computeSizes;
        private _setDefaultInTangent;
        private _setDefaultOutTangent;
        private _evaluateKeys;
        private _extractValuesFromKeys;
        private _convertX;
        private _invertX;
        private _convertY;
        private _invertY;
        private _buildFrameIntervalAxis;
        private _buildYAxis;
        private _frameFromActiveKeys;
        private _dropKeyFrames;
        private _onPointerDown;
        private _onPointerMove;
        private _onPointerUp;
        private _onWheel;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFrameBarComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IFrameBarComponentState {
    }
    export class FrameBarComponent extends React.Component<IFrameBarComponentProps, IFrameBarComponentState> {
        private readonly _graphAbsoluteWidth;
        private _svgHost;
        private _viewWidth;
        private _viewScale;
        private _offsetX;
        private _onActiveAnimationChangedObserver;
        constructor(props: IFrameBarComponentProps);
        componentWillUnmount(): void;
        private _computeSizes;
        private _buildFrames;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ICurveComponentProps {
        curve: Curve;
        convertX: (x: number) => number;
        convertY: (x: number) => number;
        context: Context;
    }
    interface ICurveComponentState {
        isSelected: boolean;
    }
    export class CurveComponent extends React.Component<ICurveComponentProps, ICurveComponentState> {
        private _onDataUpdatedObserver;
        private _onActiveAnimationChangedObserver;
        private _onInterpolationModeSetObserver;
        constructor(props: ICurveComponentProps);
        componentWillUnmount(): void;
        componentDidUpdate(): boolean;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    export interface KeyEntry {
        frame: number;
        value: number;
        inTangent?: number;
        outTangent?: number;
        lockedTangent: boolean;
        interpolation?: BABYLON.AnimationKeyInterpolation;
    }
    export class Curve {
        static readonly SampleRate = 50;
        keys: KeyEntry[];
        animation: BABYLON.Animation;
        color: string;
        onDataUpdatedObservable: BABYLON.Observable<void>;
        property?: string;
        tangentBuilder?: () => any;
        setDefaultInTangent?: (keyId: number) => any;
        setDefaultOutTangent?: (keyId: number) => any;
        static readonly TangentLength = 50;
        constructor(color: string, animation: BABYLON.Animation, property?: string, tangentBuilder?: () => any, setDefaultInTangent?: (keyId: number) => any, setDefaultOutTangent?: (keyId: number) => any);
        getPathData(convertX: (x: number) => number, convertY: (y: number) => number): string;
        updateLockedTangentMode(keyIndex: number, enabled: boolean): void;
        updateInterpolationMode(keyIndex: number, interpolationMode: BABYLON.AnimationKeyInterpolation): void;
        getInControlPoint(keyIndex: number): number | undefined;
        getOutControlPoint(keyIndex: number): number | undefined;
        hasDefinedOutTangent(keyIndex: number): boolean;
        evaluateOutTangent(keyIndex: number): number;
        hasDefinedInTangent(keyIndex: number): boolean;
        evaluateInTangent(keyIndex: number): number;
        storeDefaultInTangent(keyIndex: number): void;
        storeDefaultOutTangent(keyIndex: number): void;
        updateInTangentFromControlPoint(keyId: number, slope: number): void;
        updateOutTangentFromControlPoint(keyId: number, slope: number): void;
        updateKeyFrame(keyId: number, frame: number): void;
        updateKeyValue(keyId: number, value: number): void;
    }


    interface ICanvasComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface ICanvasComponentState {
    }
    export class CanvasComponent extends React.Component<ICanvasComponentProps, ICanvasComponentState> {
        private _onActiveAnimationChangedObserver;
        constructor(props: ICanvasComponentProps);
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ITextInputComponentProps {
        globalState: GlobalState;
        context: Context;
        id?: string;
        className?: string;
        tooltip?: string;
        value: string;
        isNumber?: boolean;
        complement?: string;
        onValueAsNumberChanged?: (value: number, isFocused: boolean) => void;
        disabled?: boolean;
    }
    interface ITextInputComponentState {
        value: string;
        isFocused: boolean;
    }
    export class TextInputComponent extends React.Component<ITextInputComponentProps, ITextInputComponentState> {
        private _lastKnownGoodValue;
        constructor(props: ITextInputComponentProps);
        private _onChange;
        private _onBlur;
        private _onFocus;
        shouldComponentUpdate(newProps: ITextInputComponentProps, newState: ITextInputComponentState): boolean;
        private _onKeyPress;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPushButtonComponentProps {
        globalState: GlobalState;
        context: Context;
        icon: string;
        id?: string;
        className?: string;
        isPushed?: boolean;
        onClick: (state: boolean) => void;
        tooltip?: string;
    }
    interface IPushButtonComponentState {
        isPushed: boolean;
    }
    export class PushButtonComponent extends React.Component<IPushButtonComponentProps, IPushButtonComponentState> {
        constructor(props: IPushButtonComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IControlButtonComponentProps {
        globalState: GlobalState;
        context: Context;
        icon: string;
        hoverIcon: string;
        id?: string;
        className?: string;
        onClick: () => void;
        tooltip?: string;
    }
    interface IControlButtonComponentState {
    }
    export class ControlButtonComponent extends React.Component<IControlButtonComponentProps, IControlButtonComponentState> {
        constructor(props: IControlButtonComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IActionButtonComponentProps {
        globalState: GlobalState;
        context: Context;
        icon: string;
        id?: string;
        className?: string;
        isActive?: boolean;
        onClick: () => void;
        tooltip?: string;
    }
    interface IActionButtonComponentState {
    }
    export class ActionButtonComponent extends React.Component<IActionButtonComponentProps, IActionButtonComponentState> {
        constructor(props: IActionButtonComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IRangeSelectorComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IRangeSelectorComponentState {
    }
    export class RangeSelectorComponent extends React.Component<IRangeSelectorComponentProps, IRangeSelectorComponentState> {
        private _rangeHost;
        private _rangeScrollbarHost;
        private _viewWidth;
        private _pointerIsDown;
        private _minFrame;
        private _maxFrame;
        private _leftHandleIsActive;
        private _bothHandleIsActive;
        private _currentOffset;
        private _currentFrom;
        private _currentTo;
        constructor(props: IRangeSelectorComponentProps);
        private _computeSizes;
        private _onPointerDown;
        private _onPointerMove;
        private _updateLimits;
        private _onPointerUp;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMediaPlayerComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IMediaPlayerComponentState {
    }
    export class MediaPlayerComponent extends React.Component<IMediaPlayerComponentProps, IMediaPlayerComponentState> {
        private _isMounted;
        constructor(props: IMediaPlayerComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        private _onFirstKey;
        private _onPrevKey;
        private _onRewind;
        private _onForward;
        private _onPrevFrame;
        private _onNextFrame;
        private _onNextKey;
        private _onEndKey;
        private _onStop;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IBottomBarComponentProps {
        globalState: GlobalState;
        context: Context;
    }
    interface IBottomBarComponentState {
        clipLength: string;
    }
    export class BottomBarComponent extends React.Component<IBottomBarComponentProps, IBottomBarComponentState> {
        private _onAnimationsLoadedObserver;
        private _onActiveAnimationChangedObserver;
        private _onClipLengthIncreasedObserver;
        private _onClipLengthDecreasedObserver;
        constructor(props: IBottomBarComponentProps);
        private _changeClipLength;
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPerformanceViewerSidebarComponentProps {
        collector: BABYLON.PerformanceViewerCollector;
        onVisibleRangeChangedObservable?: BABYLON.Observable<IVisibleRangeChangedObservableProps>;
    }
    export const PerformanceViewerSidebarComponent: (props: IPerformanceViewerSidebarComponentProps) => import("react/jsx-runtime").JSX.Element;


    interface IPerformanceViewerPopupComponentProps {
        scene: BABYLON.Scene;
        layoutObservable: BABYLON.Observable<IPerfLayoutSize>;
        returnToLiveObservable: BABYLON.Observable<void>;
        performanceCollector: BABYLON.PerformanceViewerCollector;
        initialGraphSize?: BABYLON.Vector2;
    }
    export var PerformanceViewerPopupComponent: React.FC<IPerformanceViewerPopupComponentProps>;


    interface IPerformanceViewerComponentProps {
        scene: BABYLON.Scene;
    }
    export enum IPerfMetadataCategory {
        Count = "Count",
        FrameSteps = "Frame Steps Duration"
    }
    export var PerformanceViewerComponent: React.FC<IPerformanceViewerComponentProps>;


    interface IPerformancePlayheadButtonProps {
        returnToPlayhead: BABYLON.Observable<void>;
    }
    export var PerformancePlayheadButtonComponent: React.FC<IPerformancePlayheadButtonProps>;


    export interface ITextureLinkLineComponentProps {
        label: string;
        texture: BABYLON.Nullable<BABYLON.BaseTexture>;
        material?: BABYLON.Material;
        texturedObject?: {
            getScene: () => BABYLON.Scene;
        };
        onSelectionChangedObservable?: BABYLON.Observable<any>;
        onDebugSelectionChangeObservable?: BABYLON.Observable<TextureLinkLineComponent>;
        propertyName?: string;
        onTextureCreated?: (texture: BABYLON.BaseTexture) => void;
        customDebugAction?: (state: boolean) => void;
        onTextureRemoved?: () => void;
        fileFormats?: string;
        cubeOnly?: boolean;
    }
    export class TextureLinkLineComponent extends React.Component<ITextureLinkLineComponentProps, {
        isDebugSelected: boolean;
    }> {
        private _onDebugSelectionChangeObserver;
        constructor(props: ITextureLinkLineComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        debugTexture(): void;
        onLink(): void;
        onLinkTexture(texture: BABYLON.BaseTexture): void;
        updateTexture(file: File): void;
        removeTexture(): void;
        render(): import("react/jsx-runtime").JSX.Element | null;
    }


    interface ITextureLineComponentProps {
        texture: BABYLON.BaseTexture;
        width: number;
        height: number;
        globalState?: GlobalState;
        hideChannelSelect?: boolean;
    }
    export class TextureLineComponent extends React.Component<ITextureLineComponentProps, {
        channels: TextureChannelsToDisplay;
        face: number;
    }> {
        private _canvasRef;
        private static _TextureChannelStates;
        constructor(props: ITextureLineComponentProps);
        shouldComponentUpdate(nextProps: ITextureLineComponentProps, nextState: {
            channels: TextureChannelsToDisplay;
            face: number;
        }): boolean;
        componentDidMount(): void;
        componentDidUpdate(): void;
        updatePreview(): Promise<void>;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IQuaternionLineComponentProps {
        label: string;
        target: any;
        useEuler?: boolean;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class QuaternionLineComponent extends React.Component<IQuaternionLineComponentProps, {
        isExpanded: boolean;
        value: BABYLON.Quaternion;
        eulerValue: BABYLON.Vector3;
    }> {
        private _localChange;
        constructor(props: IQuaternionLineComponentProps);
        _checkRoundCircle(a: number, b: number): boolean;
        shouldComponentUpdate(nextProps: IQuaternionLineComponentProps, nextState: {
            isExpanded: boolean;
            value: BABYLON.Quaternion;
            eulerValue: BABYLON.Vector3;
        }): boolean;
        switchExpandState(): void;
        raiseOnPropertyChanged(currentValue: BABYLON.Quaternion, previousValue: BABYLON.Quaternion): void;
        updateQuaternion(): void;
        updateStateX(value: number): void;
        updateStateY(value: number): void;
        updateStateZ(value: number): void;
        updateStateW(value: number): void;
        updateQuaternionFromEuler(): void;
        updateStateEulerX(value: number): void;
        updateStateEulerY(value: number): void;
        updateStateEulerZ(value: number): void;
        onCopyClick(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IMeshPickerComponentProps {
        globalState: GlobalState;
        target: any;
        property: string;
        scene: BABYLON.Scene;
        label: string;
        onPropertyChangedObservable?: BABYLON.Observable<PropertyChangedEvent>;
    }
    export class MeshPickerComponent extends React.Component<IMeshPickerComponentProps> {
        constructor(props: IMeshPickerComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Copy all styles from a document to another document or shadow root
     * @param source document to copy styles from
     * @param target document or shadow root to copy styles to
     */
    export function CopyStyles(source: Document, target: DocumentOrShadowRoot): void;
    /**
     * Merges classNames by array of strings or conditions
     * @param classNames Array of className strings or truthy conditions
     * @returns A concatenated string, suitable for the className attribute
     */
    export function MergeClassNames(classNames: ClassNameCondition[]): string;
    /**
     * className (replicating React type) or a tuple with the second member being any truthy value ["className", true]
     */
    type ClassNameCondition = string | undefined | [string, any];



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class StringTools {
        private static _SaveAs;
        private static _Click;
        /**
         * Download a string into a file that will be saved locally by the browser
         * @param document
         * @param content defines the string to download locally as a file
         * @param filename
         */
        static DownloadAsFile(document: HTMLDocument, content: string, filename: string): void;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class PropertyChangedEvent {
        object: any;
        property: string;
        value: any;
        initialValue: any;
        allowNullValue?: boolean;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Create a popup window
     * @param title default title for the popup
     * @param options options for the popup
     * @returns the parent control of the popup
     */
    export function CreatePopup(title: string, options: Partial<{
        onParentControlCreateCallback?: (parentControl: HTMLDivElement) => void;
        onWindowCreateCallback?: (newWindow: Window) => void;
        width?: number;
        height?: number;
    }>): HTMLDivElement | null;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Class handling undo / redo operations
     */
    export class HistoryStack implements BABYLON.IDisposable {
        private _historyStack;
        private _redoStack;
        private _activeData;
        private readonly _maxHistoryLength;
        private _locked;
        private _dataProvider;
        private _applyUpdate;
        /**
         * Gets or sets a boolean indicating if the stack is enabled
         */
        isEnabled: boolean;
        /**
         * Constructor
         * @param dataProvider defines the data provider function
         * @param applyUpdate defines the code to execute when undo/redo operation is required
         */
        constructor(dataProvider: () => any, applyUpdate: (data: any) => void);
        /**
         * Process key event to handle undo / redo
         * @param evt defines the keyboard event to process
         * @returns true if the event was processed
         */
        processKeyEvent(evt: KeyboardEvent): boolean;
        /**
         * Resets the stack
         */
        reset(): void;
        /**
         * Remove the n-1 element of the stack
         */
        collapseLastTwo(): void;
        private _generateJSONDiff;
        private _applyJSONDiff;
        private _copy;
        /**
         * Stores the current state
         */
        storeAsync(): Promise<void>;
        /**
         * Checks if there is any data in the history stack
         */
        get hasData(): boolean;
        /**
         * Undo the latest operation
         */
        undo(): void;
        /**
         * Redo the latest undo operation
         */
        redo(): void;
        /**
         * Disposes the stack
         */
        dispose(): void;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export function copyCommandToClipboard(strCommand: string): void;
    export function getClassNameWithNamespace(obj: any): {
        className: string;
        babylonNamespace: string;
    };



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Used by both particleSystem and alphaBlendModes
     */
    export var CommonBlendModes: {
        label: string;
        value: number;
    }[];
    /**
     * Used to populated the blendMode dropdown in our various tools (Node Editor, Inspector, etc.)
     * The below ParticleSystem consts were defined before new Engine alpha blend modes were added, so we have to reference
     * the ParticleSystem.FOO consts explicitly (as the underlying var values are different - they get mapped to engine consts within baseParticleSystem.ts)
     */
    export var BlendModeOptions: {
        label: string;
        value: number;
    }[];
    /**
     * Used to populated the alphaMode dropdown in our various tools (Node Editor, Inspector, etc.)
     */
    export var AlphaModeOptions: {
        label: string;
        value: number;
    }[];
    /**
     * Used to populate the billboardMode dropdown for particle systems.
     */
    export var ParticleBillboardModeOptions: {
        label: string;
        value: number;
    }[];



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Class used to provide lock mechanism
     */
    export class LockObject {
        /**
         * Gets or set if the lock is engaged
         */
        lock: boolean;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ITextBlockPropertyGridComponentProps {
        textBlock: BABYLON.GUI.TextBlock;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class TextBlockPropertyGridComponent extends React.Component<ITextBlockPropertyGridComponentProps> {
        constructor(props: ITextBlockPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IStackPanelPropertyGridComponentProps {
        stackPanel: BABYLON.GUI.StackPanel;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class StackPanelPropertyGridComponent extends React.Component<IStackPanelPropertyGridComponentProps> {
        constructor(props: IStackPanelPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ISliderPropertyGridComponentProps {
        slider: BABYLON.GUI.Slider;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class SliderPropertyGridComponent extends React.Component<ISliderPropertyGridComponentProps> {
        constructor(props: ISliderPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IScrollViewerPropertyGridComponentProps {
        scrollViewer: BABYLON.GUI.ScrollViewer;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ScrollViewerPropertyGridComponent extends React.Component<IScrollViewerPropertyGridComponentProps> {
        constructor(props: IScrollViewerPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IRectanglePropertyGridComponentProps {
        rectangle: BABYLON.GUI.Rectangle;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class RectanglePropertyGridComponent extends React.Component<IRectanglePropertyGridComponentProps> {
        constructor(props: IRectanglePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IRadioButtonPropertyGridComponentProps {
        radioButtons: BABYLON.GUI.RadioButton[];
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class RadioButtonPropertyGridComponent extends React.Component<IRadioButtonPropertyGridComponentProps> {
        constructor(props: IRadioButtonPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ILinePropertyGridComponentProps {
        line: BABYLON.GUI.Line;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class LinePropertyGridComponent extends React.Component<ILinePropertyGridComponentProps> {
        constructor(props: ILinePropertyGridComponentProps);
        onDashChange(value: string): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IInputTextPropertyGridComponentProps {
        inputText: BABYLON.GUI.InputText;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class InputTextPropertyGridComponent extends React.Component<IInputTextPropertyGridComponentProps> {
        constructor(props: IInputTextPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IImagePropertyGridComponentProps {
        image: BABYLON.GUI.Image;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ImagePropertyGridComponent extends React.Component<IImagePropertyGridComponentProps> {
        constructor(props: IImagePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IImageBasedSliderPropertyGridComponentProps {
        imageBasedSlider: BABYLON.GUI.ImageBasedSlider;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ImageBasedSliderPropertyGridComponent extends React.Component<IImageBasedSliderPropertyGridComponentProps> {
        constructor(props: IImageBasedSliderPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IGridPropertyGridComponentProps {
        grid: BABYLON.GUI.Grid;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class GridPropertyGridComponent extends React.Component<IGridPropertyGridComponentProps> {
        constructor(props: IGridPropertyGridComponentProps);
        renderRows(): import("react/jsx-runtime").JSX.Element[];
        renderColumns(): import("react/jsx-runtime").JSX.Element[];
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IEllipsePropertyGridComponentProps {
        ellipse: BABYLON.GUI.Ellipse;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class EllipsePropertyGridComponent extends React.Component<IEllipsePropertyGridComponentProps> {
        constructor(props: IEllipsePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IControlPropertyGridComponentProps {
        control: BABYLON.GUI.Control;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ControlPropertyGridComponent extends React.Component<IControlPropertyGridComponentProps> {
        constructor(props: IControlPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ICommonControlPropertyGridComponentProps {
        controls?: BABYLON.GUI.Control[];
        control?: BABYLON.GUI.Control;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class CommonControlPropertyGridComponent extends React.Component<ICommonControlPropertyGridComponentProps> {
        constructor(props: ICommonControlPropertyGridComponentProps);
        renderGridInformation(control: BABYLON.GUI.Control): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element | undefined;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IColorPickerPropertyGridComponentProps {
        colorPicker: BABYLON.GUI.ColorPicker;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ColorPickerPropertyGridComponent extends React.Component<IColorPickerPropertyGridComponentProps> {
        constructor(props: IColorPickerPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ICheckboxPropertyGridComponentProps {
        checkbox: BABYLON.GUI.Checkbox;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
    }
    export class CheckboxPropertyGridComponent extends React.Component<ICheckboxPropertyGridComponentProps> {
        constructor(props: ICheckboxPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Splitter component properties
     */
    export interface ISplitterProps {
        /**
         * Unique identifier
         */
        id?: string;
        /**
         * Splitter size
         */
        size: number;
        /**
         * Minimum size for the controlled element
         */
        minSize?: number;
        /**
         * Maximum size for the controlled element
         */
        maxSize?: number;
        /**
         * Initial size for the controlled element
         */
        initialSize?: number;
        /**
         * Defines the controlled side
         */
        controlledSide: INSPECTOR.SharedUIComponents.ControlledSize;
        /**
         * refObject to the splitter element
         */
        refObject?: React.RefObject<HTMLDivElement>;
    }
    /**
     * Creates a splitter component
     * @param props defines the splitter properties
     * @returns the splitter component
     */
    export var Splitter: React.FC<ISplitterProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export enum ControlledSize {
        First = 0,
        Second = 1
    }
    export enum SplitDirection {
        Horizontal = 0,
        Vertical = 1
    }
    /**
     * Context used to share data with splitters
     */
    export interface ISplitContext {
        /**
         * Split direction
         */
        direction: SplitDirection;
        /**
         * Function called by splitters to update the offset
         * @param offset new offet
         * @param source source element
         * @param controlledSide defined controlled element
         */
        drag: (offset: number, source: HTMLElement, controlledSide: ControlledSize) => void;
        /**
         * Function called by splitters to begin dragging
         */
        beginDrag: () => void;
        /**
         * Function called by splitters to end dragging
         */
        endDrag: () => void;
        /**
         * Sync sizes for the elements
         * @param source source element
         * @param controlledSide defined controlled element
         * @param size size of the controlled element
         * @param minSize minimum size for the controlled element
         * @param maxSize maximum size for the controlled element
         */
        sync: (source: HTMLElement, controlledSide: ControlledSize, size?: number, minSize?: number, maxSize?: number) => void;
    }
    export var SplitContext: import("react").Context<ISplitContext>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Split container properties
     */
    export interface ISplitContainerProps {
        /**
         * Unique identifier
         */
        id?: string;
        /**
         * Split direction
         */
        direction: INSPECTOR.SharedUIComponents.SplitDirection;
        /**
         * Minimum size for the floating elements
         */
        floatingMinSize?: number;
        /**
         * RefObject to the root div element
         */
        containerRef?: React.RefObject<HTMLDivElement>;
        /**
         * Optional class name
         */
        className?: string;
        /**
         * Pointer down
         * @param event pointer events
         */
        onPointerDown?: (event: React.PointerEvent) => void;
        /**
         * Pointer move
         * @param event pointer events
         */
        onPointerMove?: (event: React.PointerEvent) => void;
        /**
         * Pointer up
         * @param event pointer events
         */
        onPointerUp?: (event: React.PointerEvent) => void;
        /**
         * Drop
         * @param event drag events
         */
        onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
        /**
         * Drag over
         * @param event drag events
         */
        onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
    }
    /**
     * Creates a split container component
     * @param props defines the split container properties
     * @returns the split container component
     */
    export var SplitContainer: React.FC<React.PropsWithChildren<ISplitContainerProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class TypeLedger {
        static PortDataBuilder: (port: INSPECTOR.SharedUIComponents.NodePort, nodeContainer: INSPECTOR.SharedUIComponents.INodeContainer) => INSPECTOR.SharedUIComponents.IPortData;
        static NodeDataBuilder: (data: any, nodeContainer: INSPECTOR.SharedUIComponents.INodeContainer) => INSPECTOR.SharedUIComponents.INodeData;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export const IsFramePortData: (variableToCheck: any) => variableToCheck is INSPECTOR.SharedUIComponents.FramePortData;
    export const RefreshNode: (node: INSPECTOR.SharedUIComponents.GraphNode, visitedNodes?: Set<INSPECTOR.SharedUIComponents.GraphNode>, visitedLinks?: Set<INSPECTOR.SharedUIComponents.NodeLink>, canvas?: INSPECTOR.SharedUIComponents.GraphCanvasComponent) => void;
    export const BuildFloatUI: (container: HTMLDivElement, document: Document, displayName: string, isInteger: boolean, source: any, propertyName: string, onChange: () => void, min?: number, max?: number, visualPropertiesRefresh?: Array<() => void>, additionalClassName?: string) => void;
    export function GetListOfAcceptedTypes<T extends Record<string, string | number>>(types: T, allValue: number, autoDetectValue: number, port: {
        acceptedConnectionPointTypes: number[];
        excludedConnectionPointTypes: number[];
        type: number;
    }, skips?: number[]): string[];
    export function GetConnectionErrorMessage<T extends Record<string, string | number>>(sourceType: number, types: T, allValue: number, autoDetectValue: number, port: {
        acceptedConnectionPointTypes: number[];
        excludedConnectionPointTypes: number[];
        type: number;
    }, skips?: number[]): string;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class StateManager {
        data: any;
        hostDocument: Document;
        lockObject: any;
        modalIsDisplayed: boolean;
        historyStack: INSPECTOR.SharedUIComponents.HistoryStack;
        activeNode: BABYLON.Nullable<INSPECTOR.SharedUIComponents.GraphNode>;
        onSearchBoxRequiredObservable: BABYLON.Observable<{
            x: number;
            y: number;
        }>;
        onSelectionChangedObservable: BABYLON.Observable<BABYLON.Nullable<INSPECTOR.SharedUIComponents.ISelectionChangedOptions>>;
        onFrameCreatedObservable: BABYLON.Observable<INSPECTOR.SharedUIComponents.GraphFrame>;
        onUpdateRequiredObservable: BABYLON.Observable<any>;
        onGraphNodeRemovalObservable: BABYLON.Observable<INSPECTOR.SharedUIComponents.GraphNode>;
        onSelectionBoxMoved: BABYLON.Observable<ClientRect | DOMRect>;
        onCandidateLinkMoved: BABYLON.Observable<BABYLON.Nullable<BABYLON.Vector2>>;
        onCandidatePortSelectedObservable: BABYLON.Observable<BABYLON.Nullable<INSPECTOR.SharedUIComponents.FrameNodePort | INSPECTOR.SharedUIComponents.NodePort>>;
        onNewNodeCreatedObservable: BABYLON.Observable<INSPECTOR.SharedUIComponents.GraphNode>;
        onRebuildRequiredObservable: BABYLON.Observable<void>;
        onNodeMovedObservable: BABYLON.Observable<INSPECTOR.SharedUIComponents.GraphNode>;
        onErrorMessageDialogRequiredObservable: BABYLON.Observable<string>;
        onExposePortOnFrameObservable: BABYLON.Observable<INSPECTOR.SharedUIComponents.GraphNode>;
        onGridSizeChanged: BABYLON.Observable<void>;
        onNewBlockRequiredObservable: BABYLON.Observable<{
            type: string;
            targetX: number;
            targetY: number;
            needRepositioning?: boolean;
            smartAdd?: boolean;
        }>;
        onHighlightNodeObservable: BABYLON.Observable<{
            data: any;
            active: boolean;
        }>;
        onPreviewCommandActivated: BABYLON.Observable<boolean>;
        exportData: (data: any, frame?: BABYLON.Nullable<INSPECTOR.SharedUIComponents.GraphFrame>) => string;
        isElbowConnectionAllowed: (nodeA: INSPECTOR.SharedUIComponents.FrameNodePort | INSPECTOR.SharedUIComponents.NodePort, nodeB: INSPECTOR.SharedUIComponents.FrameNodePort | INSPECTOR.SharedUIComponents.NodePort) => boolean;
        isDebugConnectionAllowed: (nodeA: INSPECTOR.SharedUIComponents.FrameNodePort | INSPECTOR.SharedUIComponents.NodePort, nodeB: INSPECTOR.SharedUIComponents.FrameNodePort | INSPECTOR.SharedUIComponents.NodePort) => boolean;
        applyNodePortDesign: (data: INSPECTOR.SharedUIComponents.IPortData, element: HTMLElement, imgHost: HTMLImageElement, pip: HTMLDivElement) => boolean;
        getPortColor: (portData: INSPECTOR.SharedUIComponents.IPortData) => string;
        storeEditorData: (serializationObject: any, frame?: BABYLON.Nullable<INSPECTOR.SharedUIComponents.GraphFrame>) => void;
        getEditorDataMap: () => {
            [key: number]: number;
        };
        getScene?: () => BABYLON.Scene;
        createDefaultInputData: (rootData: any, portData: INSPECTOR.SharedUIComponents.IPortData, nodeContainer: INSPECTOR.SharedUIComponents.INodeContainer) => BABYLON.Nullable<{
            data: INSPECTOR.SharedUIComponents.INodeData;
            name: string;
        }>;
        private _isRebuildQueued;
        queueRebuildCommand(): void;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ISearchBoxComponentProps {
        stateManager: INSPECTOR.SharedUIComponents.StateManager;
    }
    /**
     * The search box component.
     */
    export class SearchBoxComponent extends React.Component<ISearchBoxComponentProps, {
        isVisible: boolean;
        filter: string;
        selectedIndex: number;
    }> {
        private _handleEscKey;
        private _targetX;
        private _targetY;
        private _nodes;
        constructor(props: ISearchBoxComponentProps);
        hide(): void;
        onFilterChange(evt: React.ChangeEvent<HTMLInputElement>): void;
        onNewNodeRequested(name: string): void;
        onKeyDown(evt: React.KeyboardEvent): void;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class PropertyLedger {
        static DefaultControl: React.ComponentClass<INSPECTOR.SharedUIComponents.IPropertyComponentProps>;
        static RegisteredControls: {
            [key: string]: React.ComponentClass<INSPECTOR.SharedUIComponents.IPropertyComponentProps>;
        };
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class NodePort {
        portData: IPortData;
        node: INSPECTOR.SharedUIComponents.GraphNode;
        protected _element: HTMLDivElement;
        protected _portContainer: HTMLElement;
        protected _imgHost: HTMLImageElement;
        protected _pip: HTMLDivElement;
        protected _stateManager: INSPECTOR.SharedUIComponents.StateManager;
        protected _portLabelElement: Element;
        protected _onCandidateLinkMovedObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.Nullable<BABYLON.Vector2>>>;
        protected _onSelectionChangedObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.Nullable<INSPECTOR.SharedUIComponents.ISelectionChangedOptions>>>;
        protected _exposedOnFrame: boolean;
        protected _portUIcontainer?: HTMLDivElement;
        delegatedPort: BABYLON.Nullable<INSPECTOR.SharedUIComponents.FrameNodePort>;
        get element(): HTMLDivElement;
        get container(): HTMLElement;
        get portName(): string;
        set portName(newName: string);
        get disabled(): boolean;
        hasLabel(): boolean;
        get exposedOnFrame(): boolean;
        set exposedOnFrame(value: boolean);
        get exposedPortPosition(): number;
        set exposedPortPosition(value: number);
        private _isConnectedToNodeOutsideOfFrame;
        refresh(): void;
        constructor(portContainer: HTMLElement, portData: IPortData, node: INSPECTOR.SharedUIComponents.GraphNode, stateManager: INSPECTOR.SharedUIComponents.StateManager, portUIcontainer?: HTMLDivElement);
        dispose(): void;
        static CreatePortElement(portData: IPortData, node: INSPECTOR.SharedUIComponents.GraphNode, root: HTMLElement, displayManager: BABYLON.Nullable<INSPECTOR.SharedUIComponents.IDisplayManager>, stateManager: INSPECTOR.SharedUIComponents.StateManager): NodePort;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class NodeLink {
        private _graphCanvas;
        private _portA;
        private _portB?;
        private _nodeA;
        private _nodeB?;
        private _path;
        private _selectionPath;
        private _onSelectionChangedObserver;
        private _isVisible;
        private _isTargetCandidate;
        private _gradient;
        onDisposedObservable: BABYLON.Observable<NodeLink>;
        get isTargetCandidate(): boolean;
        set isTargetCandidate(value: boolean);
        get isVisible(): boolean;
        set isVisible(value: boolean);
        get portA(): INSPECTOR.SharedUIComponents.FrameNodePort | INSPECTOR.SharedUIComponents.NodePort;
        get portB(): INSPECTOR.SharedUIComponents.FrameNodePort | INSPECTOR.SharedUIComponents.NodePort | undefined;
        get nodeA(): INSPECTOR.SharedUIComponents.GraphNode;
        get nodeB(): INSPECTOR.SharedUIComponents.GraphNode | undefined;
        intersectsWith(rect: DOMRect): boolean;
        update(endX?: number, endY?: number, straight?: boolean): void;
        get path(): SVGPathElement;
        get selectionPath(): SVGPathElement;
        constructor(graphCanvas: INSPECTOR.SharedUIComponents.GraphCanvasComponent, portA: INSPECTOR.SharedUIComponents.NodePort, nodeA: INSPECTOR.SharedUIComponents.GraphNode, portB?: INSPECTOR.SharedUIComponents.NodePort, nodeB?: INSPECTOR.SharedUIComponents.GraphNode);
        onClick(evt: MouseEvent): void;
        dispose(notify?: boolean): void;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class NodeLedger {
        static RegisteredNodeNames: string[];
        static NameFormatter: (name: string) => string;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class GraphNode {
        content: INSPECTOR.SharedUIComponents.INodeData;
        private static _IdGenerator;
        private _visual;
        private _headerContainer;
        private _headerIcon;
        private _headerIconImg;
        private _headerCollapseImg;
        private _header;
        private _headerCollapse;
        private _connections;
        private _optionsContainer;
        private _inputsContainer;
        private _outputsContainer;
        private _content;
        private _comments;
        private _executionTime;
        private _selectionBorder;
        private _inputPorts;
        private _outputPorts;
        private _links;
        private _x;
        private _y;
        private _gridAlignedX;
        private _gridAlignedY;
        private _mouseStartPointX;
        private _mouseStartPointY;
        private _stateManager;
        private _onSelectionChangedObserver;
        private _onSelectionBoxMovedObserver;
        private _onFrameCreatedObserver;
        private _onUpdateRequiredObserver;
        private _onHighlightNodeObserver;
        private _ownerCanvas;
        private _displayManager;
        private _isVisible;
        private _enclosingFrameId;
        private _lastClick;
        _visualPropertiesRefresh: Array<() => void>;
        addClassToVisual(className: string): void;
        removeClassFromVisual(className: string): void;
        get isCollapsed(): boolean;
        get isVisible(): boolean;
        set isVisible(value: boolean);
        private _upateNodePortNames;
        get outputPorts(): INSPECTOR.SharedUIComponents.NodePort[];
        get inputPorts(): INSPECTOR.SharedUIComponents.NodePort[];
        get links(): INSPECTOR.SharedUIComponents.NodeLink[];
        get gridAlignedX(): number;
        get gridAlignedY(): number;
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get width(): number;
        get height(): number;
        get id(): number;
        get name(): string;
        get enclosingFrameId(): number;
        set enclosingFrameId(value: number);
        setIsSelected(value: boolean, marqueeSelection: boolean): void;
        get rootElement(): HTMLDivElement;
        constructor(content: INSPECTOR.SharedUIComponents.INodeData, stateManager: INSPECTOR.SharedUIComponents.StateManager);
        isOverlappingFrame(frame: INSPECTOR.SharedUIComponents.GraphFrame): boolean;
        getPortForPortData(portData: INSPECTOR.SharedUIComponents.IPortData): INSPECTOR.SharedUIComponents.NodePort | null;
        getPortDataForPortDataContent(data: any): INSPECTOR.SharedUIComponents.IPortData | null;
        getLinksForPortDataContent(data: any): INSPECTOR.SharedUIComponents.NodeLink[];
        getLinksForPortData(portData: INSPECTOR.SharedUIComponents.IPortData): INSPECTOR.SharedUIComponents.NodeLink[];
        private _refreshFrames;
        _refreshLinks(): void;
        refresh(): void;
        private _expand;
        private _searchMiddle;
        private _onDown;
        cleanAccumulation(useCeil?: boolean): void;
        private _onUp;
        private _onMove;
        renderProperties(): BABYLON.Nullable<JSX.Element>;
        _forceRebuild(source: any, propertyName: string, notifiers?: BABYLON.IEditablePropertyOption["notifiers"]): void;
        private _isCollapsed;
        /**
         * Collapse the node
         */
        collapse(): void;
        /**
         * Expand the node
         */
        expand(): void;
        private _portUICount;
        private _buildInputPorts;
        appendVisual(root: HTMLDivElement, owner: INSPECTOR.SharedUIComponents.GraphCanvasComponent): void;
        dispose(): void;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export enum FramePortPosition {
        Top = 0,
        Middle = 1,
        Bottom = 2
    }
    export class GraphFrame {
        private readonly _collapsedWidth;
        private static _FrameCounter;
        private static _FramePortCounter;
        private _name;
        private _color;
        private _x;
        private _y;
        private _gridAlignedX;
        private _gridAlignedY;
        private _width;
        private _height;
        element: HTMLDivElement;
        private _borderElement;
        private _headerElement;
        private _headerTextElement;
        private _headerCollapseElement;
        private _headerCloseElement;
        private _headerFocusElement;
        private _commentsElement;
        private _portContainer;
        private _outputPortContainer;
        private _inputPortContainer;
        private _nodes;
        private _ownerCanvas;
        private _mouseStartPointX;
        private _mouseStartPointY;
        private _onSelectionChangedObserver;
        private _onGraphNodeRemovalObserver;
        private _onExposePortOnFrameObserver;
        private _onNodeLinkDisposedObservers;
        private _isCollapsed;
        private _frameInPorts;
        private _frameOutPorts;
        private _controlledPorts;
        private _exposedInPorts;
        private _exposedOutPorts;
        private _id;
        private _comments;
        private _frameIsResizing;
        private _resizingDirection;
        private _minFrameHeight;
        private _minFrameWidth;
        private _mouseXLimit;
        onExpandStateChanged: BABYLON.Observable<GraphFrame>;
        private readonly _closeSVG;
        private readonly _expandSVG;
        private readonly _collapseSVG;
        private readonly _focusSVG;
        get id(): number;
        get isCollapsed(): boolean;
        private _createInputPort;
        private _markFramePortPositions;
        private _createFramePorts;
        private _removePortFromExposedWithNode;
        private _removePortFromExposedWithLink;
        private _createInputPorts;
        private _createOutputPorts;
        redrawFramePorts(): void;
        set isCollapsed(value: boolean);
        get nodes(): INSPECTOR.SharedUIComponents.GraphNode[];
        get ports(): INSPECTOR.SharedUIComponents.FrameNodePort[];
        get name(): string;
        set name(value: string);
        get color(): BABYLON.Color3;
        set color(value: BABYLON.Color3);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get width(): number;
        set width(value: number);
        get height(): number;
        set height(value: number);
        get comments(): string;
        set comments(comments: string);
        constructor(candidate: BABYLON.Nullable<HTMLDivElement>, canvas: INSPECTOR.SharedUIComponents.GraphCanvasComponent, doNotCaptureNodes?: boolean);
        private _isFocused;
        /**
         * Enter/leave focus mode
         */
        switchFocusMode(): void;
        refresh(): void;
        addNode(node: INSPECTOR.SharedUIComponents.GraphNode): void;
        removeNode(node: INSPECTOR.SharedUIComponents.GraphNode): void;
        syncNode(node: INSPECTOR.SharedUIComponents.GraphNode): void;
        cleanAccumulation(): void;
        private _onDown;
        move(newX: number, newY: number, align?: boolean): void;
        private _onUp;
        _moveFrame(offsetX: number, offsetY: number): void;
        private _onMove;
        moveFramePortUp(nodePort: INSPECTOR.SharedUIComponents.FrameNodePort): void;
        private _movePortUp;
        moveFramePortDown(nodePort: INSPECTOR.SharedUIComponents.FrameNodePort): void;
        private _movePortDown;
        private _initResizing;
        private _cleanUpResizing;
        private _updateMinHeightWithComments;
        private _isResizingTop;
        private _isResizingRight;
        private _isResizingBottom;
        private _isResizingLeft;
        private _onRightHandlePointerDown;
        private _onRightHandlePointerMove;
        private _moveRightHandle;
        private _onRightHandlePointerUp;
        private _onBottomHandlePointerDown;
        private _onBottomHandlePointerMove;
        private _moveBottomHandle;
        private _onBottomHandlePointerUp;
        private _onLeftHandlePointerDown;
        private _onLeftHandlePointerMove;
        private _moveLeftHandle;
        private _onLeftHandlePointerUp;
        private _onTopHandlePointerDown;
        private _onTopHandlePointerMove;
        private _moveTopHandle;
        private _onTopHandlePointerUp;
        private _onTopRightHandlePointerDown;
        private _onTopRightHandlePointerMove;
        private _moveTopRightHandle;
        private _onTopRightHandlePointerUp;
        private _onBottomRightHandlePointerDown;
        private _onBottomRightHandlePointerMove;
        private _moveBottomRightHandle;
        private _onBottomRightHandlePointerUp;
        private _onBottomLeftHandlePointerDown;
        private _onBottomLeftHandlePointerMove;
        private _moveBottomLeftHandle;
        private _onBottomLeftHandlePointerUp;
        private _onTopLeftHandlePointerDown;
        private _onTopLeftHandlePointerMove;
        private _moveTopLeftHandle;
        private _onTopLeftHandlePointerUp;
        private _expandLeft;
        private _expandTop;
        private _expandRight;
        private _expandBottom;
        dispose(): void;
        private _serializePortData;
        serialize(saveCollapsedState: boolean): INSPECTOR.SharedUIComponents.IFrameData;
        export(): void;
        adjustPorts(): void;
        static Parse(serializationData: INSPECTOR.SharedUIComponents.IFrameData, canvas: INSPECTOR.SharedUIComponents.GraphCanvasComponent, map?: {
            [key: number]: number;
        }): GraphFrame;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IGraphCanvasComponentProps {
        stateManager: INSPECTOR.SharedUIComponents.StateManager;
        onEmitNewNode: (nodeData: INSPECTOR.SharedUIComponents.INodeData) => INSPECTOR.SharedUIComponents.GraphNode;
    }
    export class GraphCanvasComponent extends React.Component<IGraphCanvasComponentProps> implements INSPECTOR.SharedUIComponents.INodeContainer {
        static readonly NodeWidth = 100;
        private readonly _minZoom;
        private readonly _maxZoom;
        private _hostCanvasRef;
        private _hostCanvas;
        private _graphCanvasRef;
        private _graphCanvas;
        private _selectionContainerRef;
        private _selectionContainer;
        private _frameContainerRef;
        private _frameContainer;
        private _svgCanvasRef;
        private _svgCanvas;
        private _rootContainerRef;
        private _rootContainer;
        private _nodes;
        private _links;
        private _mouseStartPointX;
        private _mouseStartPointY;
        private _dropPointX;
        private _dropPointY;
        private _selectionStartX;
        private _selectionStartY;
        private _candidateLinkedHasMoved;
        private _x;
        private _y;
        private _lastx;
        private _lasty;
        private _zoom;
        private _selectedNodes;
        private _selectedLink;
        private _selectedPort;
        private _candidateLink;
        private _candidatePort;
        private _gridSize;
        private _selectionBox;
        private _selectedFrames;
        private _frameCandidate;
        private _frames;
        private _nodeDataContentList;
        private _altKeyIsPressed;
        private _shiftKeyIsPressed;
        private _multiKeyIsPressed;
        private _oldY;
        _frameIsMoving: boolean;
        _isLoading: boolean;
        _targetLinkCandidate: BABYLON.Nullable<INSPECTOR.SharedUIComponents.NodeLink>;
        private _isCopyingOrPasting;
        private _copiedNodes;
        private _copiedFrames;
        get gridSize(): number;
        set gridSize(value: number);
        get stateManager(): INSPECTOR.SharedUIComponents.StateManager;
        get nodes(): INSPECTOR.SharedUIComponents.GraphNode[];
        get links(): INSPECTOR.SharedUIComponents.NodeLink[];
        get frames(): INSPECTOR.SharedUIComponents.GraphFrame[];
        get zoom(): number;
        set zoom(value: number);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get selectedNodes(): INSPECTOR.SharedUIComponents.GraphNode[];
        get selectedLink(): BABYLON.Nullable<INSPECTOR.SharedUIComponents.NodeLink>;
        get selectedFrames(): INSPECTOR.SharedUIComponents.GraphFrame[];
        get selectedPort(): BABYLON.Nullable<INSPECTOR.SharedUIComponents.NodePort>;
        get canvasContainer(): HTMLDivElement;
        get hostCanvas(): HTMLDivElement;
        get svgCanvas(): HTMLElement;
        get selectionContainer(): HTMLDivElement;
        get frameContainer(): HTMLDivElement;
        private _selectedFrameAndNodesConflict;
        constructor(props: IGraphCanvasComponentProps);
        populateConnectedEntriesBeforeRemoval(item: INSPECTOR.SharedUIComponents.GraphNode, items: INSPECTOR.SharedUIComponents.GraphNode[], inputs: BABYLON.Nullable<INSPECTOR.SharedUIComponents.IPortData>[], outputs: BABYLON.Nullable<INSPECTOR.SharedUIComponents.IPortData>[]): void;
        automaticRewire(inputs: BABYLON.Nullable<INSPECTOR.SharedUIComponents.IPortData>[], outputs: BABYLON.Nullable<INSPECTOR.SharedUIComponents.IPortData>[], firstOnly?: boolean): void;
        smartAddOverLink(node: INSPECTOR.SharedUIComponents.GraphNode, link: INSPECTOR.SharedUIComponents.NodeLink): void;
        smartAddOverNode(node: INSPECTOR.SharedUIComponents.GraphNode, source: INSPECTOR.SharedUIComponents.GraphNode): void;
        deleteSelection(onRemove: (nodeData: INSPECTOR.SharedUIComponents.INodeData) => void, autoReconnect?: boolean): void;
        handleKeyDownAsync(evt: KeyboardEvent, onRemove: (nodeData: INSPECTOR.SharedUIComponents.INodeData) => void, mouseLocationX: number, mouseLocationY: number, dataGenerator: (nodeData: INSPECTOR.SharedUIComponents.INodeData) => Promise<BABYLON.Nullable<INSPECTOR.SharedUIComponents.GraphNode>>, rootElement: HTMLDivElement): Promise<void>;
        pasteSelectionAsync(copiedNodes: INSPECTOR.SharedUIComponents.GraphNode[], currentX: number, currentY: number, dataGenerator: (nodeData: INSPECTOR.SharedUIComponents.INodeData) => Promise<BABYLON.Nullable<INSPECTOR.SharedUIComponents.GraphNode>>, selectNew?: boolean): Promise<INSPECTOR.SharedUIComponents.GraphNode[]>;
        reconnectNewNodes(nodeIndex: number, newNodes: INSPECTOR.SharedUIComponents.GraphNode[], sourceNodes: INSPECTOR.SharedUIComponents.GraphNode[], done: boolean[]): void;
        getCachedData(): any[];
        removeDataFromCache(data: any): void;
        createNodeFromObject(nodeData: INSPECTOR.SharedUIComponents.INodeData, onNodeCreated: (data: any) => void, recursion?: boolean): INSPECTOR.SharedUIComponents.GraphNode;
        getGridPosition(position: number, useCeil?: boolean): number;
        getGridPositionCeil(position: number): number;
        updateTransform(): void;
        onKeyUp(): void;
        findNodeFromData(data: any): INSPECTOR.SharedUIComponents.GraphNode;
        reset(): void;
        connectPorts(pointA: INSPECTOR.SharedUIComponents.IPortData, pointB: INSPECTOR.SharedUIComponents.IPortData): void;
        removeLink(link: INSPECTOR.SharedUIComponents.NodeLink): void;
        appendNode(nodeData: INSPECTOR.SharedUIComponents.INodeData): INSPECTOR.SharedUIComponents.GraphNode;
        distributeGraph(): void;
        componentDidMount(): void;
        onMove(evt: React.PointerEvent): void;
        onDown(evt: React.PointerEvent<HTMLElement>): void;
        onUp(evt: React.PointerEvent): void;
        onWheel(evt: React.WheelEvent): void;
        zoomToFit(): void;
        processCandidatePort(): void;
        connectNodes(nodeA: INSPECTOR.SharedUIComponents.GraphNode, pointA: INSPECTOR.SharedUIComponents.IPortData, nodeB: INSPECTOR.SharedUIComponents.GraphNode, pointB: INSPECTOR.SharedUIComponents.IPortData): void;
        drop(newNode: INSPECTOR.SharedUIComponents.GraphNode, targetX: number, targetY: number, offsetX: number, offsetY: number): void;
        processEditorData(editorData: INSPECTOR.SharedUIComponents.IEditorData): void;
        reOrganize(editorData?: BABYLON.Nullable<INSPECTOR.SharedUIComponents.IEditorData>, isImportingAFrame?: boolean): void;
        addFrame(frameData: INSPECTOR.SharedUIComponents.IFrameData): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class FrameNodePort extends INSPECTOR.SharedUIComponents.NodePort {
        portData: INSPECTOR.SharedUIComponents.IPortData;
        node: INSPECTOR.SharedUIComponents.GraphNode;
        private _parentFrameId;
        private _isInput;
        private _framePortPosition;
        private _framePortId;
        private _onFramePortPositionChangedObservable;
        get parentFrameId(): number;
        get onFramePortPositionChangedObservable(): BABYLON.Observable<FrameNodePort>;
        get isInput(): boolean;
        get framePortId(): number;
        get framePortPosition(): INSPECTOR.SharedUIComponents.FramePortPosition;
        set framePortPosition(position: INSPECTOR.SharedUIComponents.FramePortPosition);
        constructor(portContainer: HTMLElement, portData: INSPECTOR.SharedUIComponents.IPortData, node: INSPECTOR.SharedUIComponents.GraphNode, stateManager: INSPECTOR.SharedUIComponents.StateManager, isInput: boolean, framePortId: number, parentFrameId: number);
        static CreateFrameNodePortElement(portData: INSPECTOR.SharedUIComponents.IPortData, node: INSPECTOR.SharedUIComponents.GraphNode, root: HTMLElement, displayManager: BABYLON.Nullable<INSPECTOR.SharedUIComponents.IDisplayManager>, stateManager: INSPECTOR.SharedUIComponents.StateManager, isInput: boolean, framePortId: number, parentFrameId: number): FrameNodePort;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export class DisplayLedger {
        static RegisteredControls: {
            [key: string]: any;
        };
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Function used to force a rebuild of the node system
     * @param source source object
     * @param stateManager defines the state manager to use
     * @param propertyName name of the property that has been changed
     * @param notifiers list of notifiers to use
     * @param engageActiveRefresh if active refresh should be engaged
     */
    export function ForceRebuild(source: any, stateManager: INSPECTOR.SharedUIComponents.StateManager, propertyName: string, notifiers?: BABYLON.IEditablePropertyOption["notifiers"], engageActiveRefresh?: boolean): void;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type FramePortData = {
        frame: INSPECTOR.SharedUIComponents.GraphFrame;
        port: INSPECTOR.SharedUIComponents.FrameNodePort;
    };



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ISelectionChangedOptions {
        selection: BABYLON.Nullable<INSPECTOR.SharedUIComponents.GraphNode | INSPECTOR.SharedUIComponents.NodeLink | INSPECTOR.SharedUIComponents.GraphFrame | INSPECTOR.SharedUIComponents.NodePort | INSPECTOR.SharedUIComponents.FramePortData>;
        forceKeepSelection?: boolean;
        marqueeSelection?: boolean;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IPropertyComponentProps {
        stateManager: INSPECTOR.SharedUIComponents.StateManager;
        nodeData: INSPECTOR.SharedUIComponents.INodeData;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export enum PortDataDirection {
        /** Input */
        Input = 0,
        /** Output */
        Output = 1
    }
    export enum PortDirectValueTypes {
        Float = 0,
        Int = 1
    }
    export interface IPortDirectValueDefinition {
        /**
         * Gets the source object
         */
        source: any;
        /**
         * Gets the property name used to store the value
         */
        propertyName: string;
        /**
         * Gets or sets the min value accepted for this point if nothing is connected
         */
        valueMin: BABYLON.Nullable<any>;
        /**
         * Gets or sets the max value accepted for this point if nothing is connected
         */
        valueMax: BABYLON.Nullable<any>;
        /**
         * Gets or sets the type of the value
         */
        valueType: PortDirectValueTypes;
    }
    export interface IPortData {
        data: any;
        name: string;
        internalName: string;
        isExposedOnFrame: boolean;
        exposedPortPosition: number;
        isConnected: boolean;
        isInactive: boolean;
        direction: PortDataDirection;
        ownerData: any;
        connectedPort: BABYLON.Nullable<IPortData>;
        needDualDirectionValidation: boolean;
        hasEndpoints: boolean;
        endpoints: BABYLON.Nullable<IPortData[]>;
        directValueDefinition?: IPortDirectValueDefinition;
        updateDisplayName: (newName: string) => void;
        canConnectTo: (port: IPortData) => boolean;
        connectTo: (port: IPortData) => void;
        disconnectFrom: (port: IPortData) => void;
        checkCompatibilityState(port: IPortData): number;
        getCompatibilityIssueMessage(issue: number, targetNode: INSPECTOR.SharedUIComponents.GraphNode, targetPort: IPortData): string;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface INodeLocationInfo {
        blockId: number;
        x: number;
        y: number;
        isCollapsed: boolean;
    }
    export interface IFrameData {
        x: number;
        y: number;
        width: number;
        height: number;
        color: number[];
        name: string;
        isCollapsed: boolean;
        blocks: number[];
        comments: string;
    }
    export interface IEditorData {
        locations: INodeLocationInfo[];
        x: number;
        y: number;
        zoom: number;
        frames?: IFrameData[];
        map?: {
            [key: number]: number;
        };
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface INodeData {
        data: any;
        name: string;
        uniqueId: number;
        isInput: boolean;
        comments: string;
        executionTime?: number;
        refreshCallback?: () => void;
        prepareHeaderIcon: (iconDiv: HTMLDivElement, img: HTMLImageElement) => void;
        getClassName: () => string;
        dispose: () => void;
        getPortByName: (name: string) => BABYLON.Nullable<INSPECTOR.SharedUIComponents.IPortData>;
        inputs: INSPECTOR.SharedUIComponents.IPortData[];
        outputs: INSPECTOR.SharedUIComponents.IPortData[];
        invisibleEndpoints?: BABYLON.Nullable<any[]>;
        isConnectedToOutput?: () => boolean;
        isActive?: boolean;
        setIsActive?: (value: boolean) => void;
        canBeActivated?: boolean;
        onInputCountChanged?: () => void;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface INodeContainer {
        nodes: INSPECTOR.SharedUIComponents.GraphNode[];
        appendNode(data: INSPECTOR.SharedUIComponents.INodeData): INSPECTOR.SharedUIComponents.GraphNode;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface VisualContentDescription {
        [key: string]: HTMLElement;
    }
    export interface IDisplayManager {
        getHeaderClass(data: INSPECTOR.SharedUIComponents.INodeData): string;
        shouldDisplayPortLabels(data: INSPECTOR.SharedUIComponents.IPortData): boolean;
        updatePreviewContent(data: INSPECTOR.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        updateFullVisualContent?(data: INSPECTOR.SharedUIComponents.INodeData, visualContent: VisualContentDescription): void;
        getBackgroundColor(data: INSPECTOR.SharedUIComponents.INodeData): string;
        getHeaderText(data: INSPECTOR.SharedUIComponents.INodeData): string;
        onSelectionChanged?(data: INSPECTOR.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<INSPECTOR.SharedUIComponents.INodeData>, manager: INSPECTOR.SharedUIComponents.StateManager): void;
        onDispose?(nodeData: INSPECTOR.SharedUIComponents.INodeData, manager: INSPECTOR.SharedUIComponents.StateManager): void;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IVector4LineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector4) => void;
        useEuler?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        icon?: string;
        iconLabel?: string;
        value?: BABYLON.Vector4;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class Vector4LineComponent extends React.Component<IVector4LineComponentProps, {
        isExpanded: boolean;
        value: BABYLON.Vector4;
    }> {
        static defaultProps: {
            step: number;
        };
        private _localChange;
        constructor(props: IVector4LineComponentProps);
        getCurrentValue(): any;
        shouldComponentUpdate(nextProps: IVector4LineComponentProps, nextState: {
            isExpanded: boolean;
            value: BABYLON.Vector4;
        }): boolean;
        switchExpandState(): void;
        raiseOnPropertyChanged(previousValue: BABYLON.Vector4): void;
        updateVector4(): void;
        updateStateX(value: number): void;
        updateStateY(value: number): void;
        updateStateZ(value: number): void;
        updateStateW(value: number): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IVector3LineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector3) => void;
        useEuler?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        noSlider?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        directValue?: BABYLON.Vector3;
        additionalCommands?: JSX.Element[];
    }
    export class Vector3LineComponent extends React.Component<IVector3LineComponentProps, {
        isExpanded: boolean;
        value: BABYLON.Vector3;
    }> {
        static defaultProps: {
            step: number;
        };
        private _localChange;
        constructor(props: IVector3LineComponentProps);
        getCurrentValue(): any;
        shouldComponentUpdate(nextProps: IVector3LineComponentProps, nextState: {
            isExpanded: boolean;
            value: BABYLON.Vector3;
        }): boolean;
        switchExpandState(): void;
        raiseOnPropertyChanged(previousValue: BABYLON.Vector3): void;
        updateVector3(): void;
        updateStateX(value: number): void;
        updateStateY(value: number): void;
        updateStateZ(value: number): void;
        onCopyClick(): string;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IVector2LineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector2) => void;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        icon?: string;
        iconLabel?: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class Vector2LineComponent extends React.Component<IVector2LineComponentProps, {
        isExpanded: boolean;
        value: BABYLON.Vector2;
    }> {
        static defaultProps: {
            step: number;
        };
        private _localChange;
        constructor(props: IVector2LineComponentProps);
        shouldComponentUpdate(nextProps: IVector2LineComponentProps, nextState: {
            isExpanded: boolean;
            value: BABYLON.Vector2;
        }): boolean;
        switchExpandState(): void;
        raiseOnPropertyChanged(previousValue: BABYLON.Vector2): void;
        updateStateX(value: number): void;
        updateStateY(value: number): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IValueLineComponentProps {
        label: string;
        value: number;
        color?: string;
        fractionDigits?: number;
        units?: string;
        icon?: string;
        iconLabel?: string;
    }
    export class ValueLineComponent extends React.Component<IValueLineComponentProps> {
        constructor(props: IValueLineComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IUnitButtonProps {
        unit: string;
        locked?: boolean;
        onClick?: (unit: string) => void;
    }
    export function UnitButton(props: IUnitButtonProps): import("react/jsx-runtime").JSX.Element;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ITextureButtonLineProps {
        label: string;
        scene: BABYLON.Scene;
        onClick: (file: File) => void;
        onLink: (texture: BABYLON.BaseTexture) => void;
        accept: string;
    }
    interface ITextureButtonLineState {
        isOpen: boolean;
    }
    export class TextureButtonLine extends React.Component<ITextureButtonLineProps, ITextureButtonLineState> {
        private static _IdGenerator;
        private _id;
        private _uploadInputRef;
        constructor(props: ITextureButtonLineProps);
        onChange(evt: any): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ITextLineComponentProps {
        label?: string;
        value?: string;
        color?: string;
        underline?: boolean;
        onLink?: () => void;
        url?: string;
        ignoreValue?: boolean;
        additionalClass?: string;
        icon?: string;
        iconLabel?: string;
        tooltip?: string;
        onCopy?: true | (() => string);
    }
    export class TextLineComponent extends React.Component<ITextLineComponentProps> {
        constructor(props: ITextLineComponentProps);
        onLink(): void;
        copyFn(): (() => string) | undefined;
        renderContent(isLink: boolean, tooltip: string): import("react/jsx-runtime").JSX.Element | null;
        renderOriginal(isLink: boolean, tooltip: string): import("react/jsx-runtime").JSX.Element;
        renderFluent(isLink: boolean, tooltip: string): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ITextInputLineComponentProps {
        label?: string;
        lockObject?: INSPECTOR.SharedUIComponents.LockObject;
        target?: any;
        propertyName?: string;
        value?: string;
        onChange?: (value: string) => void;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        icon?: string;
        iconLabel?: string;
        noUnderline?: boolean;
        numbersOnly?: boolean;
        delayInput?: boolean;
        arrows?: boolean;
        arrowsIncrement?: (amount: number) => void;
        step?: number;
        numeric?: boolean;
        roundValues?: boolean;
        min?: number;
        max?: number;
        placeholder?: string;
        unit?: React.ReactNode;
        validator?: (value: string) => boolean;
        multilines?: boolean;
        throttlePropertyChangedNotification?: boolean;
        throttlePropertyChangedNotificationDelay?: number;
        disabled?: boolean;
    }
    export class TextInputLineComponent extends React.Component<ITextInputLineComponentProps, {
        value: string;
        dragging: boolean;
    }> {
        private _localChange;
        constructor(props: ITextInputLineComponentProps);
        componentWillUnmount(): void;
        shouldComponentUpdate(nextProps: ITextInputLineComponentProps, nextState: {
            value: string;
            dragging: boolean;
        }): boolean;
        raiseOnPropertyChanged(newValue: string, previousValue: string): void;
        getCurrentNumericValue(value: string): number;
        updateValue(value: string, valueToValidate?: string): void;
        incrementValue(amount: number): void;
        onKeyDown(event: React.KeyboardEvent): void;
        renderFluent(value: string, placeholder: string, step: number): import("react/jsx-runtime").JSX.Element;
        renderOriginal(value: string, placeholder: string, step: number): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export const conflictingValuesPlaceholder = "\u2014";
    /**
     *
     * @param targets a list of selected targets
     * @param onPropertyChangedObservable
     * @param getProperty
     * @returns a proxy object that can be passed as a target into the input
     */
    export function makeTargetsProxy<Type>(targets: Type[], onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>, getProperty?: (target: Type, property: keyof Type) => any): any;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ISliderLineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        minimum: number;
        maximum: number;
        step: number;
        directValue?: number;
        useEuler?: boolean;
        onChange?: (value: number) => void;
        onInput?: (value: number) => void;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        decimalCount?: number;
        margin?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        unit?: React.ReactNode;
        allowOverflow?: boolean;
    }
    export class SliderLineComponent extends React.Component<ISliderLineComponentProps, {
        value: number;
    }> {
        private _localChange;
        constructor(props: ISliderLineComponentProps);
        shouldComponentUpdate(nextProps: ISliderLineComponentProps, nextState: {
            value: number;
        }): boolean;
        onChange(newValueString: any): void;
        onInput(newValueString: any): void;
        prepareDataToRead(value: number): number;
        onCopyClick(): void;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IRadioButtonLineComponentProps {
        onSelectionChangedObservable: BABYLON.Observable<RadioButtonLineComponent>;
        label: string;
        isSelected: () => boolean;
        onSelect: () => void;
        icon?: string;
        iconLabel?: string;
    }
    export class RadioButtonLineComponent extends React.Component<IRadioButtonLineComponentProps, {
        isSelected: boolean;
    }> {
        private _onSelectionChangedObserver;
        constructor(props: IRadioButtonLineComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        onChange(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export var Null_Value: number;
    export interface IOptionsLineProps {
        label: string;
        target: any;
        propertyName: string;
        options: readonly BABYLON.IInspectableOptions[];
        noDirectUpdate?: boolean;
        onSelect?: (value: number | string) => void;
        extractValue?: (target: any) => number | string;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        allowNullValue?: boolean;
        icon?: string;
        iconLabel?: string;
        className?: string;
        valuesAreStrings?: boolean;
        defaultIfNull?: number;
    }
    export class OptionsLine extends React.Component<IOptionsLineProps, {
        value: number | string;
    }> {
        private _localChange;
        private _remapValueIn;
        private _remapValueOut;
        private _getValue;
        constructor(props: IOptionsLineProps);
        shouldComponentUpdate(nextProps: IOptionsLineProps, nextState: {
            value: number;
        }): boolean;
        raiseOnPropertyChanged(newValue: number, previousValue: number): void;
        setValue(value: string | number): void;
        updateValue(valueString: string): void;
        onCopyClickStr(): string;
        private _renderFluent;
        private _renderOriginal;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface INumericInputProps {
        label: string;
        labelTooltip?: string;
        value: number;
        step?: number;
        onChange: (value: number) => void;
        precision?: number;
        icon?: string;
        iconLabel?: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class NumericInput extends React.Component<INumericInputProps, {
        value: string;
    }> {
        static defaultProps: {
            step: number;
        };
        private _localChange;
        constructor(props: INumericInputProps);
        componentWillUnmount(): void;
        shouldComponentUpdate(nextProps: INumericInputProps, nextState: {
            value: string;
        }): boolean;
        updateValue(valueString: string): void;
        onBlur(): void;
        incrementValue(amount: number): void;
        onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IMessageLineComponentProps {
        text: string;
        color?: string;
        icon?: any;
    }
    export class MessageLineComponent extends React.Component<IMessageLineComponentProps> {
        constructor(props: IMessageLineComponentProps);
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IMatrixLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        step?: number;
        onChange?: (newValue: BABYLON.Matrix) => void;
        onModeChange?: (mode: number) => void;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        mode?: number;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class MatrixLineComponent extends React.Component<IMatrixLineComponentProps, {
        value: BABYLON.Matrix;
        mode: number;
        angle: number;
    }> {
        private _localChange;
        constructor(props: IMatrixLineComponentProps);
        shouldComponentUpdate(nextProps: IMatrixLineComponentProps, nextState: {
            value: BABYLON.Matrix;
            mode: number;
            angle: number;
        }): boolean;
        raiseOnPropertyChanged(previousValue: BABYLON.Vector3): void;
        updateMatrix(): void;
        updateRow(value: BABYLON.Vector4, row: number): void;
        updateBasedOnMode(value: number): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ILinkButtonComponentProps {
        label: string;
        buttonLabel: string;
        url?: string;
        onClick: () => void;
        icon?: any;
        onIconClick?: () => void;
    }
    export class LinkButtonComponent extends React.Component<ILinkButtonComponentProps> {
        constructor(props: ILinkButtonComponentProps);
        onLink(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ILineWithFileButtonComponentProps {
        title: string;
        closed?: boolean;
        multiple?: boolean;
        label: string;
        iconImage: any;
        onIconClick: (file: File) => void;
        accept: string;
        uploadName?: string;
    }
    export class LineWithFileButtonComponent extends React.Component<ILineWithFileButtonComponentProps, {
        isExpanded: boolean;
    }> {
        private _uploadRef;
        constructor(props: ILineWithFileButtonComponentProps);
        onChange(evt: any): void;
        switchExpandedState(): void;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ILineContainerComponentProps {
        selection?: INSPECTOR.SharedUIComponents.ISelectedLineContainer;
        title: string;
        children: any[] | any;
        closed?: boolean;
    }
    export class LineContainerComponent extends React.Component<ILineContainerComponentProps, {
        isExpanded: boolean;
        isHighlighted: boolean;
    }> {
        constructor(props: ILineContainerComponentProps);
        switchExpandedState(): void;
        renderHeader(): import("react/jsx-runtime").JSX.Element;
        componentDidMount(): void;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IInputArrowsComponentProps {
        incrementValue: (amount: number) => void;
        setDragging: (dragging: boolean) => void;
    }
    export class InputArrowsComponent extends React.Component<IInputArrowsComponentProps> {
        private _arrowsRef;
        private _drag;
        private _releaseListener;
        private _lockChangeListener;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IIndentedTextLineComponentProps {
        value?: string;
        color?: string;
        underline?: boolean;
        onLink?: () => void;
        url?: string;
        additionalClass?: string;
    }
    export class IndentedTextLineComponent extends React.Component<IIndentedTextLineComponentProps> {
        constructor(props: IIndentedTextLineComponentProps);
        onLink(): void;
        renderContent(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IIconComponentProps {
        icon: string;
        label?: string;
    }
    export class IconComponent extends React.Component<IIconComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ISelectedLineContainer {
        selectedLineContainerTitles: Array<string>;
        selectedLineContainerTitlesNoFocus: Array<string>;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IHexLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        lockObject?: INSPECTOR.SharedUIComponents.LockObject;
        onChange?: (newValue: number) => void;
        isInteger?: boolean;
        replaySourceReplacement?: string;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        additionalClass?: string;
        step?: string;
        digits?: number;
        useEuler?: boolean;
        min?: number;
        icon?: string;
        iconLabel?: string;
    }
    export class HexLineComponent extends React.Component<IHexLineComponentProps, {
        value: string;
    }> {
        private _localChange;
        private _store;
        private _propertyChange;
        constructor(props: IHexLineComponentProps);
        componentWillUnmount(): void;
        shouldComponentUpdate(nextProps: IHexLineComponentProps, nextState: {
            value: string;
        }): boolean;
        raiseOnPropertyChanged(newValue: number, previousValue: number): void;
        convertToHexString(valueString: string): string;
        updateValue(valueString: string, raisePropertyChanged: boolean): void;
        lock(): void;
        unlock(): void;
        onCopyClick(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IFloatLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        onChange?: (newValue: number) => void;
        isInteger?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        additionalClass?: string;
        step?: string;
        digits?: number;
        useEuler?: boolean;
        min?: number;
        max?: number;
        smallUI?: boolean;
        onEnter?: (newValue: number) => void;
        icon?: string;
        iconLabel?: string;
        defaultValue?: number;
        arrows?: boolean;
        unit?: React.ReactNode;
        onDragStart?: (newValue: number) => void;
        onDragStop?: (newValue: number) => void;
        disabled?: boolean;
    }
    export class FloatLineComponent extends React.Component<IFloatLineComponentProps, {
        value: string;
        dragging: boolean;
    }> {
        private _localChange;
        private _store;
        constructor(props: IFloatLineComponentProps);
        componentWillUnmount(): void;
        getValueString(value: any, props: IFloatLineComponentProps): string;
        shouldComponentUpdate(nextProps: IFloatLineComponentProps, nextState: {
            value: string;
            dragging: boolean;
        }): boolean;
        raiseOnPropertyChanged(newValue: number, previousValue: number): void;
        updateValue(valueString: string): void;
        lock(): void;
        unlock(): void;
        incrementValue(amount: number, processStep?: boolean): void;
        onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void;
        onCopyClick(): void;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IFileMultipleButtonLineComponentProps {
        label: string;
        onClick: (event: any) => void;
        accept: string;
        icon?: string;
        iconLabel?: string;
    }
    export class FileMultipleButtonLineComponent extends React.Component<IFileMultipleButtonLineComponentProps> {
        private static _IdGenerator;
        private _id;
        private _uploadInputRef;
        constructor(props: IFileMultipleButtonLineComponentProps);
        onChange(evt: any): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface IFileButtonLineProps {
        label: string;
        onClick: (file: File) => void;
        accept: string;
        icon?: string;
        iconLabel?: string;
    }
    export class FileButtonLine extends React.Component<IFileButtonLineProps> {
        private static _IdGenerator;
        private _id;
        private _uploadInputRef;
        constructor(props: IFileButtonLineProps);
        onChange(evt: any): void;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type DraggableLineWithButtonProps = {
        format: string;
        data: string;
        tooltip: string;
        iconImage: any;
        onIconClick: (value: string) => void;
        iconTitle: string;
        lenSuffixToRemove?: number;
    };
    export var DraggableLineWithButtonComponent: React.FunctionComponent<DraggableLineWithButtonProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type DraggableLineComponentProps = Omit<INSPECTOR.SharedUIComponents.DraggableLineProps, "label">;
    export var DraggableLineComponent: React.FunctionComponent<DraggableLineComponentProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IColorPickerLineProps {
        value: BABYLON.Color4 | BABYLON.Color3;
        linearHint?: boolean;
        onColorChanged: (newOne: string) => void;
        icon?: string;
        iconLabel?: string;
        shouldPopRight?: boolean;
        lockObject?: INSPECTOR.SharedUIComponents.LockObject;
    }
    interface IColorPickerComponentState {
        pickerEnabled: boolean;
        color: BABYLON.Color3 | BABYLON.Color4;
        hex: string;
    }
    export class ColorPickerLine extends React.Component<IColorPickerLineProps, IColorPickerComponentState> {
        private _floatRef;
        private _floatHostRef;
        constructor(props: IColorPickerLineProps);
        syncPositions(): void;
        shouldComponentUpdate(nextProps: IColorPickerLineProps, nextState: IColorPickerComponentState): boolean;
        getHexString(props?: Readonly<IColorPickerLineProps>): string;
        componentDidUpdate(): void;
        componentDidMount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IColorLineProps {
        label: string;
        target?: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        onChange?: () => void;
        isLinear?: boolean;
        icon?: string;
        iconLabel?: string;
        disableAlpha?: boolean;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    interface IColorLineComponentState {
        isExpanded: boolean;
        color: BABYLON.Color4;
    }
    export class ColorLine extends React.Component<IColorLineProps, IColorLineComponentState> {
        constructor(props: IColorLineProps);
        shouldComponentUpdate(nextProps: IColorLineProps, nextState: IColorLineComponentState): boolean;
        getValue(props?: Readonly<IColorLineProps>): BABYLON.Color4;
        setColorFromString(colorString: string): void;
        setColor(newColor: BABYLON.Color4): void;
        switchExpandState(): void;
        updateStateR(value: number): void;
        updateStateG(value: number): void;
        updateStateB(value: number): void;
        updateStateA(value: number): void;
        private _convertToColor;
        private _toColor3;
        onCopyClick(): void;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IColor4LineComponentProps {
        label: string;
        target?: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        onChange?: () => void;
        isLinear?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class Color4LineComponent extends React.Component<IColor4LineComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IColor3LineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        isLinear?: boolean;
        icon?: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        iconLabel?: string;
        onChange?: () => void;
    }
    export class Color3LineComponent extends React.Component<IColor3LineComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ICheckBoxLineComponentProps {
        label?: string;
        target?: any;
        propertyName?: string;
        isSelected?: boolean | (() => boolean);
        onSelect?: (value: boolean) => void;
        onValueChanged?: () => void;
        onPropertyChangedObservable?: BABYLON.Observable<INSPECTOR.SharedUIComponents.PropertyChangedEvent>;
        disabled?: boolean;
        icon?: string;
        iconLabel?: string;
        faIcons?: {
            enabled: any;
            disabled: any;
        };
        large?: boolean;
    }
    export class CheckBoxLineComponent extends React.Component<ICheckBoxLineComponentProps, {
        isSelected: boolean;
        isDisabled?: boolean;
        isConflict: boolean;
    }> {
        private _localChange;
        constructor(props: ICheckBoxLineComponentProps);
        shouldComponentUpdate(nextProps: ICheckBoxLineComponentProps, nextState: {
            isSelected: boolean;
            isDisabled: boolean;
            isConflict: boolean;
        }): boolean;
        onChange(): void;
        onCopyClick(): void;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IButtonLineComponentProps {
        label: string;
        onClick: () => void;
        icon?: string;
        iconLabel?: string;
        isDisabled?: boolean;
    }
    export class ButtonLineComponent extends React.Component<IButtonLineComponentProps> {
        constructor(props: IButtonLineComponentProps);
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IBooleanLineComponentProps {
        label: string;
        value: boolean;
        icon?: string;
        iconLabel?: string;
    }
    export class BooleanLineComponent extends React.Component<IBooleanLineComponentProps> {
        constructor(props: IBooleanLineComponentProps);
        renderFluent(): import("react/jsx-runtime").JSX.Element;
        renderOriginal(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export var MeshIcon: import("@fluentui/react-icons").FluentIcon;
    export var TranslateIcon: import("@fluentui/react-icons").FluentIcon;
    export var MaterialIcon: import("@fluentui/react-icons").FluentIcon;
    export var FlatTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var LinearTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var BreakTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var UnifyTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var StepTangentIcon: import("@fluentui/react-icons").FluentIcon;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export var TokenMap: {
        px2: string;
        px4: string;
        px6: string;
        px8: string;
        px10: string;
        px12: string;
        px14: string;
        px16: string;
        px20: string;
        px24: string;
        px28: string;
        px32: string;
        px36: string;
        px40: string;
    };
    export var CustomTokens: {
        inputWidth: string;
        lineHeight: string;
        lineHeightSmall: string;
        dividerGap: string;
        dividerGapSmall: string;
        labelMinWidth: string;
        sliderMinWidth: string;
        sliderMaxWidth: string;
        rightAlignOffset: string;
    };
    export var UniformWidthStyling: any;
    export const useInputStyles: () => Record<"input" | "container" | "invalid" | "inputSlot", string>;
    export function HandleOnBlur(event: React.FocusEvent<HTMLInputElement>): void;
    export function HandleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void;
    /**
     * Fluent's CalculatePrecision function
     * https://github.com/microsoft/fluentui/blob/dcbf775d37938eacffa37922fc0b43a3cdd5753f/packages/utilities/src/math.ts#L91C1
     *
     * Calculates a number's precision based on the number of trailing
     * zeros if the number does not have a decimal indicated by a negative
     * precision. Otherwise, it calculates the number of digits after
     * the decimal point indicated by a positive precision.
     *
     * @param value - the value to determine the precision of
     * @returns the calculated precision
     */
    export function CalculatePrecision(value: number): number;
    export function ValidateColorHex(val: string): boolean;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type UploadButtonProps = Omit<INSPECTOR.SharedUIComponents.ButtonProps, "onClick" | "icon"> & {
        /**
         * Callback when files are selected
         */
        onUpload: (files: FileList) => void;
        /**
         * File types to accept (e.g., ".jpg, .png, .dds")
         */
        accept?: string;
        /**
         * Text label to display on the button (optional)
         */
        label?: string;
    };
    /**
     * A button that triggers a file upload dialog.
     * Combines a Button with a hidden file input.
     * @param props UploadButtonProps
     * @returns UploadButton component
     */
    export var UploadButton: React.FunctionComponent<UploadButtonProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type TooltipProps = {
        content?: BABYLON.Nullable<string>;
        children: React.ReactElement;
    };
    export var Tooltip: import("react").ForwardRefExoticComponent<TooltipProps & import("react").RefAttributes<HTMLElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type ToggleButtonProps = Omit<INSPECTOR.SharedUIComponents.ButtonProps, "icon" | "onClick"> & {
        value: boolean;
        checkedIcon: any;
        uncheckedIcon?: any;
        onChange: (checked: boolean) => void;
    };
    /**
     * Toggles between two states using a button with icons.
     * If no disabledIcon is provided, the button will toggle between visual enabled/disabled states without an icon change
     *
     * @param props
     * @returns
     */
    export var ToggleButton: React.FunctionComponent<ToggleButtonProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type ToastContextType = {
        showToast: (message: string) => void;
    };
    export var ToastProvider: React.FunctionComponent<React.PropsWithChildren>;
    /**
     * Hook to show toast notifications.
     * @returns Object with showToast function that accepts a message string
     */
    export function useToast(): ToastContextType;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type TextureSelectorProps = INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.BaseTexture>> & {
        /**
         * The scene to get textures from
         */
        scene: BABYLON.Scene;
        /**
         * File types to accept for upload
         */
        accept?: string;
        /**
         * Whether to only allow cube textures
         */
        cubeOnly?: boolean;
    } & Omit<INSPECTOR.SharedUIComponents.EntitySelectorProps<BABYLON.BaseTexture>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene textures
     * and a button for uploading new texture files.
     * @param props TextureSelectorProps
     * @returns TextureSelector component
     */
    export var TextureSelector: React.FunctionComponent<TextureSelectorProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type TextareaProps = INSPECTOR.SharedUIComponents.PrimitiveProps<string> & {
        placeholder?: string;
    };
    /**
     * This is a texarea box that stops propagation of change/keydown events
     * @param props
     * @returns
     */
    export var Textarea: React.FunctionComponent<TextareaProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type TextInputProps = INSPECTOR.SharedUIComponents.PrimitiveProps<string> & {
        validator?: (value: string) => boolean;
        validateOnlyOnBlur?: boolean;
    };
    export var TextInput: React.FunctionComponent<TextInputProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type SyncedSliderProps = INSPECTOR.SharedUIComponents.PrimitiveProps<number> & {
        /** Minimum value for the slider */
        min?: number;
        /** Maximum value for the slider */
        max?: number;
        /** Step size for the slider */
        step?: number;
        /** Displayed in the ux to indicate unit of measurement */
        unit?: string;
        /** When true, onChange is only called when the user releases the slider, not during drag */
        notifyOnlyOnRelease?: boolean;
        /** When true, slider grows to fill space and SpinButton is fixed at 65px */
        compact?: boolean;
        /** When true, slider grows to fill all available space (no maxWidth constraint) */
        growSlider?: boolean;
    };
    /**
     * Component which synchronizes a slider and an input field, allowing the user to change the value using either control
     * @param props
     * @returns SyncedSlider component
     */
    export var SyncedSliderInput: React.FunctionComponent<SyncedSliderProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type SwitchProps = INSPECTOR.SharedUIComponents.PrimitiveProps<boolean>;
    /**
     * This is a primitive fluent boolean switch component whose only knowledge is the shared styling across all tools
     * @param props
     * @returns Switch component
     */
    export var Switch: React.FunctionComponent<SwitchProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type SpinButtonProps = INSPECTOR.SharedUIComponents.PrimitiveProps<number> & {
        min?: number;
        max?: number;
        /** Determines how much the spinbutton increments with the arrow keys. Note this also determines the precision value (# of decimals in display value)
         * i.e. if step = 1, precision = 0. step = 0.0089, precision = 4. step = 300, precision = 2. step = 23.00, precision = 2. */
        step?: number;
        unit?: string;
        forceInt?: boolean;
        validator?: (value: number) => boolean;
        /** Optional className for the input element */
        inputClassName?: string;
    };
    export var SpinButton: import("react").ForwardRefExoticComponent<BasePrimitiveProps & {
        value: number;
        infoLabel?: InfoLabelParentProps;
    } & {
        onChange: (value: number) => void;
    } & {
        min?: number;
        max?: number;
        /** Determines how much the spinbutton increments with the arrow keys. Note this also determines the precision value (# of decimals in display value)
         * i.e. if step = 1, precision = 0. step = 0.0089, precision = 4. step = 300, precision = 2. step = 23.00, precision = 2. */
        step?: number;
        unit?: string;
        forceInt?: boolean;
        validator?: (value: number) => boolean;
        /** Optional className for the input element */
        inputClassName?: string;
    } & import("react").RefAttributes<HTMLInputElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type SkeletonSelectorProps = INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Skeleton>> & {
        /**
         * The scene to get skeletons from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which skeletons are shown
         */
        filter?: (skeleton: BABYLON.Skeleton) => boolean;
    } & Omit<INSPECTOR.SharedUIComponents.EntitySelectorProps<BABYLON.Skeleton>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene skeletons.
     * @param props SkeletonSelectorProps
     * @returns SkeletonSelector component
     */
    export var SkeletonSelector: React.FunctionComponent<SkeletonSelectorProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type SearchBoxProps = {
        items: string[];
        onItemSelected: (item: string) => void;
        title?: string;
    };
    /**
     * SearchBox component that displays a popup with search functionality
     * @param props - The component props
     * @returns The search box component
     */
    export var SearchBox: React.FunctionComponent<SearchBoxProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type SearchProps = {
        onChange: (val: string) => void;
        placeholder?: string;
    };
    export var SearchBar: import("react").ForwardRefExoticComponent<SearchProps & import("react").RefAttributes<HTMLInputElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type BasePrimitiveProps = {
        /**
         * Optional flag to disable the component, preventing any interaction.
         */
        disabled?: boolean;
        /**
         * Optional class name to apply custom styles to the component.
         */
        className?: string;
        /**
         * Optional style object to apply custom inline styles to the top-level HTML element.
         */
        style?: React.CSSProperties;
        /**
         * Optional title for the component, used for tooltips or accessibility.
         */
        title?: string;
    };
    export type ImmutablePrimitiveProps<ValueT> = BasePrimitiveProps & {
        /**
         * The value of the property to be displayed and modified.
         */
        value: ValueT;
        /**
         * Optional information to display as an infoLabel popup aside the component.
         */
        infoLabel?: INSPECTOR.SharedUIComponents.InfoLabelParentProps;
    };
    export type PrimitiveProps<T> = ImmutablePrimitiveProps<T> & {
        /**
         * Called when the primitive value changes
         */
        onChange: (value: T) => void;
    };



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type PositionedPopoverProps = {
        x: number;
        y: number;
        visible: boolean;
        hide: () => void;
    };
    /**
     * PositionedPopover component that shows a popover at specific coordinates
     * @param props - The component props
     * @returns The positioned popover component
     */
    export var PositionedPopover: React.FunctionComponent<React.PropsWithChildren<PositionedPopoverProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type PopoverWithIconProps = {
        icon: any;
        trigger?: never;
    };
    type PopoverWithTriggerProps = {
        icon?: never;
        trigger: React.ReactElement;
    };
    type PopoverBaseProps = {
        /** Controlled open state */
        open?: boolean;
        /** Callback when open state changes */
        onOpenChange?: (open: boolean) => void;
        /** Positioning of the popover */
        positioning?: any;
        /** Custom class for the surface */
        surfaceClassName?: string;
    };
    type PopoverProps = PopoverBaseProps & (PopoverWithIconProps | PopoverWithTriggerProps);
    export var Popover: import("react").ForwardRefExoticComponent<React.PropsWithChildren<PopoverProps> & import("react").RefAttributes<HTMLButtonElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type NodeSelectorProps = INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Node>> & {
        /**
         * The scene to get nodes from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which nodes are shown
         */
        filter?: (node: BABYLON.Node) => boolean;
    } & Omit<INSPECTOR.SharedUIComponents.EntitySelectorProps<BABYLON.Node>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene nodes.
     * @param props NodeSelectorProps
     * @returns NodeSelector component
     */
    export var NodeSelector: React.FunctionComponent<NodeSelectorProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type MessageBarProps = {
        message: string;
        title?: string;
        docLink?: string;
        intent: "info" | "success" | "warning" | "error";
    };
    export var MessageBar: React.FunctionComponent<MessageBarProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type MaterialSelectorProps = INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Material>> & {
        /**
         * The scene to get materials from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which materials are shown
         */
        filter?: (material: BABYLON.Material) => boolean;
    } & Omit<INSPECTOR.SharedUIComponents.EntitySelectorProps<BABYLON.Material>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene materials.
     * @param props MaterialSelectorProps
     * @returns MaterialSelector component
     */
    export var MaterialSelector: React.FunctionComponent<MaterialSelectorProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Represents an item in a list
     */
    export type ListItem<T> = {
        /** Unique identifier for the item */
        id: number;
        /** The data associated with the item */
        data: T;
        /** Value to use for sorting the list */
        sortBy: number;
    };
    type ListProps<T> = {
        items: ListItem<T>[];
        renderItem: (item: ListItem<T>, index: number) => React.ReactNode;
        onDelete?: (item: ListItem<T>, index: number) => void;
        onAdd?: (item?: ListItem<T>) => void;
        addButtonLabel?: string;
    };
    /**
     * For cases where you may want to add / remove items from a list via a trash can button / copy button, this HOC can be used
     * @returns A React component that renders a list of items with add/delete functionality
     * @param props - The properties for the List component
     */
    export function List<T>(props: ListProps<T>): React.ReactElement;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type LinkProps = INSPECTOR.SharedUIComponents.ImmutablePrimitiveProps<string> & {
        /**
         * Used if you want to handle the link click yourself
         */
        onLink?: () => void;
        /**
         * The URL the link points to
         */
        url?: string;
        /**
         * Defines whether to open the link in current tab or new tab. Default is new
         */
        target?: "current" | "new";
        /**Force link size */
        size?: "small" | "medium";
    };
    export var Link: import("react").ForwardRefExoticComponent<BasePrimitiveProps & {
        value: string;
        infoLabel?: InfoLabelParentProps;
    } & {
        /**
         * Used if you want to handle the link click yourself
         */
        onLink?: () => void;
        /**
         * The URL the link points to
         */
        url?: string;
        /**
         * Defines whether to open the link in current tab or new tab. Default is new
         */
        target?: "current" | "new";
        /**Force link size */
        size?: "small" | "medium";
    } & {
        children?: import("react").ReactNode | undefined;
    } & import("react").RefAttributes<HTMLAnchorElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type LazyComponentProps = {
        spinnerSize?: any;
        spinnerLabel?: string;
    };
    /**
     * Creates a lazy component wrapper that only calls the async function to get the underlying component when the lazy component is actually mounted.
     * This allows deferring imports until they are needed. While the underlying component is being loaded, a spinner is displayed.
     * @param getComponentAsync A function that returns a promise resolving to the component.
     * @param defaultProps Options for the loading spinner.
     * @returns A React component that displays a spinner while loading the async component.
     */
    export function MakeLazyComponent<ComponentT extends React.ComponentType<any>>(getComponentAsync: () => Promise<ComponentT>, defaultProps?: LazyComponentProps): import("react").ForwardRefExoticComponent<import("react").PropsWithoutRef<React.ComponentProps<ComponentT> & LazyComponentProps> & import("react").RefAttributes<React.ElementRef<import("@fluentui/react-utilities").ForwardRefComponent<any> | ComponentT>>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type InfoLabelProps = {
        htmlFor: string;
        info?: JSX.Element;
        label: string;
        className?: string;
        /**
         * When true, applies flex layout styling to the label slot for proper truncation in flex containers
         */
        flexLabel?: boolean;
        /**
         * Handler for right-click context menu. Also triggers on Ctrl+click.
         */
        onContextMenu?: React.MouseEventHandler;
    };
    export type InfoLabelParentProps = Omit<InfoLabelProps, "htmlFor">;
    /**
     * Renders a label with an optional popup containing more info
     * @param props
     * @returns
     */
    export var InfoLabel: React.FunctionComponent<InfoLabelProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Component wrapper for BABYLON.FactorGradient that provides slider inputs for factor1, factor2, and gradient step
     * @param props - Component props containing BABYLON.FactorGradient value and change handler
     * @returns A React component
     */
    export var FactorGradientComponent: React.FunctionComponent<INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.FactorGradient>>;
    /**
     * Component wrapper for BABYLON.Color3Gradient that provides color picker and gradient step slider
     * @param props - Component props containing BABYLON.Color3Gradient value and change handler
     * @returns A React component
     */
    export var Color3GradientComponent: React.FunctionComponent<INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.Color3Gradient>>;
    /**
     * Component wrapper for BABYLON.ColorGradient that provides color pickers for color1, color2, and gradient step slider
     * @param props - Component props containing BABYLON.ColorGradient value and change handler
     * @returns A React component
     */
    export var Color4GradientComponent: React.FunctionComponent<INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.ColorGradient>>;
    /**
     * Component wrapper for BABYLON.GradientBlockColorStep that provides color picker and step slider
     * @param props - Component props containing BABYLON.GradientBlockColorStep value and change handler
     * @returns A React component
     */
    export var ColorStepGradientComponent: React.FunctionComponent<INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.GradientBlockColorStep>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type Entity = {
        uniqueId: number;
    };
    /**
     * Props for the EntitySelector component
     */
    export type EntitySelectorProps<T extends Entity> = (PrimitiveProps<BABYLON.Nullable<T>> | INSPECTOR.SharedUIComponents.ImmutablePrimitiveProps<BABYLON.Nullable<T>>) & {
        /**
         * Function to get the list of entities to choose from
         */
        getEntities: () => T[];
        /**
         * Function to get the display name from an entity
         */
        getName: (entity: T) => string;
        /**
         * Optional filter function to filter which entities are shown
         */
        filter?: (entity: T) => boolean;
        /**
         * Callback when the entity link is clicked
         */
        onLink: (entity: T) => void;
        /**
         * Optional default value that enables clearing the current linked entity
         */
        defaultValue?: T;
    };
    /**
     * A generic primitive component with a ComboBox for selecting from a list of entities.
     * Supports entities with duplicate names by using uniqueId for identity.
     * @param props ChooseEntityProps
     * @returns EntitySelector component
     */
    export function EntitySelector<T extends Entity>(props: EntitySelectorProps<T>): JSX.Element;
    export namespace EntitySelector {
        var displayName: string;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type AcceptedDropdownValue = string | number;
    export type DropdownOption<T extends AcceptedDropdownValue> = {
        /**
         * Defines the visible part of the option
         */
        label: string;
        /**
         * Defines the value part of the option
         */
        value: T;
    };
    export type DropdownProps<V extends AcceptedDropdownValue> = INSPECTOR.SharedUIComponents.PrimitiveProps<V> & {
        options: readonly DropdownOption<V>[];
    };
    /**
     * Renders a fluent UI dropdown component for the options passed in, and an additional 'Not Defined' option if null is set to true
     * This component can handle both null and undefined values
     * @param props
     * @returns dropdown component
     */
    export var Dropdown: React.FunctionComponent<DropdownProps<AcceptedDropdownValue>>;
    export var NumberDropdown: React.FunctionComponent<DropdownProps<number>>;
    export var StringDropdown: React.FunctionComponent<DropdownProps<string>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type DraggableLineProps = {
        format: string;
        data: string;
        tooltip: string;
        label: string;
        onDelete?: () => void;
    };
    export var DraggableLine: React.FunctionComponent<DraggableLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Represents a single menu item in the context menu.
     */
    export type ContextMenuItemProps = {
        /**
         * Unique key for the menu item.
         */
        key: string;
        /**
         * The text label displayed for the menu item.
         */
        label: string;
        /**
         * Optional icon to display alongside the menu item.
         */
        icon?: any;
        /**
         * Called when the menu item is clicked.
         */
        onClick?: () => void;
        /**
         * Whether the menu item is disabled.
         */
        disabled?: boolean;
        /**
         * Optional secondary text displayed alongside the label.
         */
        secondaryContent?: string;
    };
    /**
     * Represents a divider in the context menu.
     */
    export type ContextMenuDividerProps = {
        /**
         * Unique key for the divider.
         */
        key: string;
        /**
         * Indicates this is a divider item.
         */
        type: "divider";
    };
    /**
     * Represents a group of menu items with an optional header.
     */
    export type ContextMenuGroupProps = {
        /**
         * Unique key for the group.
         */
        key: string;
        /**
         * Indicates this is a group item.
         */
        type: "group";
        /**
         * Optional header text for the group.
         */
        header?: string;
        /**
         * The menu items within the group.
         */
        items: ContextMenuItem[];
    };
    /**
     * Union type representing all possible menu items.
     */
    export type ContextMenuItem = ContextMenuItemProps | ContextMenuDividerProps | ContextMenuGroupProps;
    type ContextMenuWithIconProps = {
        /**
         * Icon to use as the trigger button.
         */
        icon: any;
        trigger?: never;
    };
    type ContextMenuWithTriggerProps = {
        icon?: never;
        /**
         * Custom trigger element for opening the menu.
         */
        trigger: React.ReactElement;
    };
    export type ContextMenuProps = INSPECTOR.SharedUIComponents.BasePrimitiveProps & (ContextMenuWithIconProps | ContextMenuWithTriggerProps) & {
        /**
         * Array of menu items to display.
         */
        items: ContextMenuItem[];
        /**
         * Positioning of the menu relative to the trigger.
         */
        positioning?: any;
        /**
         * Called when the menu open state changes.
         */
        onOpenChange?: (open: boolean) => void;
    };
    /**
     * A wrapper around Fluent UI's Menu component providing a simplified API for context menus.
     * Supports menu items with icons, dividers, and grouped items.
     */
    export var ContextMenu: import("react").ForwardRefExoticComponent<ContextMenuProps & import("react").RefAttributes<HTMLButtonElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * An option object for the ComboBox with separate label and value.
     */
    export type ComboBoxOption = {
        /**
         * Defines the visible part of the option
         */
        label: string;
        /**
         * Defines the value part of the option
         */
        value: string;
    };
    export type ComboBoxProps = INSPECTOR.SharedUIComponents.PrimitiveProps<string> & {
        /**
         * Label for the ComboBox
         */
        label: string;
        /**
         * Options to display as label/value pairs
         */
        options: ComboBoxOption[];
    };
    /**
     * Wrapper around a Fluent ComboBox that allows for filtering options.
     * @param props
     * @returns
     */
    export var ComboBox: React.FunctionComponent<ComboBoxProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type ColorPickerProps<C extends BABYLON.Color3 | BABYLON.Color4> = {
        isLinearMode?: boolean;
    } & INSPECTOR.SharedUIComponents.PrimitiveProps<C>;
    export var ColorPickerPopup: import("react").ForwardRefExoticComponent<{
        isLinearMode?: boolean;
    } & BasePrimitiveProps & {
        value: BABYLON.Color3 | BABYLON.Color4;
        infoLabel?: InfoLabelParentProps;
    } & {
        onChange: (value: BABYLON.Color3 | BABYLON.Color4) => void;
    } & import("react").RefAttributes<HTMLButtonElement>>;
    export type InputHexProps = INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.Color3 | BABYLON.Color4> & {
        linearHex?: boolean;
        isLinearMode?: boolean;
    };
    /**
     * Component which displays the passed in color's HEX value, either in linearSpace (if linearHex is true) or in gamma space
     * When the hex color is changed by user, component calculates the new BABYLON.Color3/4 value and calls onChange
     *
     * Component uses the isLinearMode boolean to display an informative label regarding linear / gamma space
     * @param props - The properties for the InputHexField component.
     * @returns
     */
    export var InputHexField: React.FunctionComponent<InputHexProps>;
    type HsvKey = "h" | "s" | "v";
    type InputHsvFieldProps = INSPECTOR.SharedUIComponents.PrimitiveProps<BABYLON.Color3 | BABYLON.Color4> & {
        hsvKey: HsvKey;
        max: number;
        scale?: number;
    };
    /**
     * In the HSV (Hue, Saturation, Value) color model, Hue (H) ranges from 0 to 360 degrees, representing the color's position on the color wheel.
     * Saturation (S) ranges from 0 to 100%, indicating the intensity or purity of the color, with 0 being shades of gray and 100 being a fully saturated color.
     * Value (V) ranges from 0 to 100%, representing the brightness of the color, with 0 being black and 100 being the brightest.
     * @param props - The properties for the InputHsvField component.
     */
    export var InputHsvField: React.FunctionComponent<InputHsvFieldProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type CollapseProps = {
        visible: boolean;
        orientation?: "horizontal" | "vertical";
    };
    /**
     * Wraps the passed in children with a fluent collapse component, handling smooth animation when visible prop changes
     * NOTE: When passing in children, prefer react fragment over empty div to avoid bloating the react tree with an unnecessary div
     * @param props
     * @returns
     */
    export var Collapse: React.FunctionComponent<React.PropsWithChildren<CollapseProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * This is a primitive fluent checkbox that can both read and write checked state
     * @param props
     * @returns Checkbox component
     */
    export var Checkbox: React.FunctionComponent<INSPECTOR.SharedUIComponents.PrimitiveProps<boolean>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type ButtonProps = INSPECTOR.SharedUIComponents.BasePrimitiveProps & {
        onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
        icon?: any;
        appearance?: "subtle" | "transparent" | "primary" | "secondary";
        label?: string;
    };
    export var Button: import("react").ForwardRefExoticComponent<INSPECTOR.SharedUIComponents.BasePrimitiveProps & {
        onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
        icon?: any;
        appearance?: "subtle" | "transparent" | "primary" | "secondary";
        label?: string;
    } & import("react").RefAttributes<HTMLButtonElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type AccordionSectionProps = {
        title: string;
        collapseByDefault?: boolean;
    };
    export var AccordionSection: React.FunctionComponent<React.PropsWithChildren<AccordionSectionProps>>;
    export type AccordionProps = {
        highlightSections?: readonly string[];
    };
    export var Accordion: React.ForwardRefExoticComponent<AccordionProps & {
        children?: import("react").ReactNode | undefined;
    } & React.RefAttributes<HTMLDivElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type TextureUploadUpdateProps = {
        /**
         * Existing texture to update via updateURL
         */
        texture: BABYLON.BaseTexture;
        /**
         * Callback after texture is updated
         */
        onChange?: (texture: BABYLON.BaseTexture) => void;
        scene?: never;
        cubeOnly?: never;
    };
    type TextureUploadCreateProps = {
        /**
         * The scene to create the texture in
         */
        scene: BABYLON.Scene;
        /**
         * Callback when a new texture is created
         */
        onChange: (texture: BABYLON.BaseTexture) => void;
        /**
         * Whether to create cube textures
         */
        cubeOnly?: boolean;
        texture?: never;
    };
    type TextureUploadProps = TextureUploadUpdateProps | TextureUploadCreateProps;
    /**
     * A button that uploads a file and either:
     * - Updates an existing Texture or CubeTexture via updateURL (if texture prop is provided)
     * - Creates a new Texture or CubeTexture (if scene/onChange props are provided)
     * @param props TextureUploadProps
     * @returns UploadButton component that handles texture upload
     */
    export var TextureUpload: React.FunctionComponent<TextureUploadProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type PaneProps = {
        title: string;
        icon?: any;
    };
    export var Pane: React.FunctionComponent<React.PropsWithChildren<PaneProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type GradientListProps<T extends BABYLON.FactorGradient | BABYLON.Color3Gradient | BABYLON.ColorGradient> = {
        label: string;
        gradients: BABYLON.Nullable<Array<T>>;
        addGradient: (step?: T) => void;
        removeGradient: (step: T, index: number) => void;
        onChange: (newGradient: T, index: number) => void;
    };
    export var FactorGradientList: React.FunctionComponent<GradientListProps<BABYLON.FactorGradient>>;
    export var Color3GradientList: React.FunctionComponent<GradientListProps<BABYLON.Color3Gradient>>;
    export var Color4GradientList: React.FunctionComponent<GradientListProps<BABYLON.ColorGradient>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type UiSize = "small" | "medium";
    export type ToolHostProps = {
        /**
         * Will ensure all of the controls within the tool are of the same scale
         */
        size?: UiSize;
        /**
         * Allows host to pass in a theme
         */
        customTheme?: any;
        /**
         * Can be set to true to disable the copy button in the tool's property lines. Default is false (copy enabled)
         */
        disableCopy?: boolean;
        /**
         * Name of the tool displayed in the UX
         */
        toolName: string;
        /**
         * Override the qsp detection for fluent
         */
        useFluent?: boolean;
    };
    export var ToolContext: import("react").Context<{
        readonly useFluent: boolean;
        readonly disableCopy: boolean;
        readonly toolName: string;
        readonly size: UiSize | undefined;
    }>;
    /**
     * For tools which are ready to move over the fluent, wrap the root of the tool (or the panel which you want fluentized) with this component
     * Today we will only enable fluent if the URL has the `newUX` query parameter is truthy
     * @param props
     * @returns
     */
    export var FluentToolWrapper: React.FunctionComponent<React.PropsWithChildren<ToolHostProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type FileUploadLineProps = Omit<INSPECTOR.SharedUIComponents.ButtonProps, "onClick" | "label"> & {
        onClick: (files: FileList) => void;
        label: string;
        accept: string;
    };
    /**
     * A full-width line with an upload button.
     * For just the button without the line wrapper, use UploadButton directly.
     * @returns An UploadButton wrapped in a LineContainer
     */
    export var FileUploadLine: React.FunctionComponent<FileUploadLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type ChildWindowOptions = {
        /**
         * The default width of the child window in pixels.
         * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
         */
        defaultWidth?: number;
        /**
         * The default height of the child window in pixels.
         * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
         */
        defaultHeight?: number;
        /**
         * The default left position of the child window in pixels.
         * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
         */
        defaultLeft?: number;
        /**
         * The default top position of the child window in pixels.
         * @remarks Ignored if the ChildWindow was passed an id and previous bounds were saved.
         */
        defaultTop?: number;
        /**
         * The title of the child window.
         * @remarks If not provided, the id will be used instead (if any).
         */
        title?: string;
    };
    export type ChildWindow = {
        /**
         * Opens the child window.
         * @param options Options for opening the child window.
         */
        open: (options?: ChildWindowOptions) => void;
        /**
         * Closes the child window.
         */
        close: () => void;
    };
    export type ChildWindowProps = {
        /**
         * An optional unique identity for the child window.
         * @remarks If provided, the child window's bounds will be saved/restored using this identity.
         */
        id?: string;
        /**
         * Called when the open state of the child window changes.
         * @param isOpen Whether the child window is open.
         */
        onOpenChange?: (isOpen: boolean) => void;
        /**
         * A ref that exposes the ChildWindow imperative API.
         */
        imperativeRef?: React.Ref<ChildWindow>;
    };
    /**
     * Allows displaying a child window that can contain child components.
     * @param props Props for the child window.
     * @returns The child window component.
     */
    export var ChildWindow: React.FunctionComponent<React.PropsWithChildren<ChildWindowProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type ButtonLineProps = Omit<INSPECTOR.SharedUIComponents.ButtonProps, "label"> & {
        label: string;
    };
    /**
     * Wraps a button with a label in a line container
     * @param props Button props plus a label
     * @returns A button inside a line
     */
    export var ButtonLine: React.FunctionComponent<ButtonLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type TensorPropertyLineProps<V extends BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Vector4 | BABYLON.Quaternion> = INSPECTOR.SharedUIComponents.PropertyLineProps<V> & INSPECTOR.SharedUIComponents.PrimitiveProps<V> & {
        /**
         * If passed, all sliders will use this for the min value
         */
        min?: number;
        /**
         * If passed, all sliders will use this for the max value
         */
        max?: number;
        /**
         * Will be displayed in the input UI to indicate the unit of measurement
         */
        unit?: string;
        /**
         * Internal spinbutton's step
         */
        step?: number;
        /**
         * If passed, the UX will use the conversion functions to display/update values
         */
        valueConverter?: {
            /**
             * Will call from(val) before displaying in the UX
             */
            from: (val: number) => number;
            /**
             * Will call to(val) before calling onChange
             */
            to: (val: number) => number;
        };
    };
    type RotationVectorPropertyLineProps = TensorPropertyLineProps<BABYLON.Vector3> & {
        /**
         * Display angles as degrees instead of radians
         */
        useDegrees?: boolean;
    };
    export var RotationVectorPropertyLine: React.FunctionComponent<RotationVectorPropertyLineProps>;
    type QuaternionPropertyLineProps = TensorPropertyLineProps<BABYLON.Quaternion> & {
        /**
         * Display angles as degrees instead of radians
         */
        useDegrees?: boolean;
        /**
         * Display angles as Euler angles instead of quaternions
         */
        useEuler?: boolean;
    };
    export var QuaternionPropertyLine: React.FunctionComponent<QuaternionPropertyLineProps>;
    export var Vector2PropertyLine: React.FunctionComponent<TensorPropertyLineProps<BABYLON.Vector2>>;
    export var Vector3PropertyLine: React.FunctionComponent<TensorPropertyLineProps<BABYLON.Vector3>>;
    export var Vector4PropertyLine: React.FunctionComponent<TensorPropertyLineProps<BABYLON.Vector4>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Wraps text in a property line
     * @param props - INSPECTOR.SharedUIComponents.PropertyLineProps and TextProps
     * @returns property-line wrapped text
     */
    export var TextPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PropertyLineProps<string> & INSPECTOR.SharedUIComponents.ImmutablePrimitiveProps<string>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Wraps textarea in a property line
     * @param props - INSPECTOR.SharedUIComponents.PropertyLineProps and TextProps
     * @returns property-line wrapped text
     */
    export var TextAreaPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PropertyLineProps<string> & INSPECTOR.SharedUIComponents.TextareaProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type SyncedSliderPropertyProps = INSPECTOR.SharedUIComponents.SyncedSliderProps & INSPECTOR.SharedUIComponents.PropertyLineProps<number>;
    /**
     * Renders a simple wrapper around the SyncedSliderInput
     * @param props
     * @returns
     */
    export var SyncedSliderPropertyLine: import("react").ForwardRefExoticComponent<SyncedSliderPropertyProps & import("react").RefAttributes<HTMLDivElement>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Wraps a switch in a property line
     * @param props - The properties for the switch and property line
     * @returns A React element representing the property line with a switch
     */
    export var SwitchPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PropertyLineProps<boolean> & INSPECTOR.SharedUIComponents.SwitchProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type StringifiedPropertyLineProps = INSPECTOR.SharedUIComponents.PropertyLineProps<number> & INSPECTOR.SharedUIComponents.ImmutablePrimitiveProps<number> & {
        precision?: number;
        units?: string;
    };
    /**
     * Expects a numerical value and converts it toFixed(if precision is supplied) or toLocaleString
     * Can pass optional units to be appending to the end of the string
     * @param props
     * @returns
     */
    export var StringifiedPropertyLine: React.FunctionComponent<StringifiedPropertyLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export var SpinButtonPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PropertyLineProps<number> & INSPECTOR.SharedUIComponents.SpinButtonProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type BasePropertyLineProps = {
        /**
         * The name of the property to display in the property line.
         */
        label: string;
        /**
         * Optional description for the property, shown on hover of the info icon
         */
        description?: string;
        /**
         * Optional function returning a string to copy to clipboard.
         */
        onCopy?: () => string;
        /**
         * Link to the documentation for this property, available from the info icon either linked from the description (if provided) or default 'docs' text
         */
        docLink?: string;
    };
    type NullableProperty<ValueT> = {
        nullable: true;
        ignoreNullable: false;
        value: ValueT;
        onChange: (value: ValueT) => void;
        defaultValue?: ValueT;
    };
    type IgnoreNullable<ValueT> = {
        ignoreNullable: true;
        nullable: false;
        value: ValueT;
        onChange: (value: ValueT) => void;
        defaultValue: ValueT;
    };
    type NonNullableProperty = {
        nullable?: false;
        ignoreNullable?: false;
    };
    type ExpandableProperty = {
        /**
         * If supplied, an 'expand' icon will be shown which, when clicked, renders this component within the property line.
         */
        expandedContent: JSX.Element;
        /**
         * If true, the expanded content will be shown by default.
         */
        expandByDefault?: boolean;
    };
    type NonExpandableProperty = {
        expandedContent?: undefined;
    };
    export type PropertyLineProps<ValueT> = BasePropertyLineProps & (NullableProperty<ValueT> | NonNullableProperty | IgnoreNullable<ValueT>) & (ExpandableProperty | NonExpandableProperty);
    /**
     * A reusable component that renders a property line with a label and child content, and an optional description, copy button, and expandable section.
     *
     * @param props - The properties for the PropertyLine component.
     * @returns A React element representing the property line.
     *
     */
    export var PropertyLine: import("react").ForwardRefExoticComponent<React.PropsWithChildren<PropertyLineProps<any>> & import("react").RefAttributes<HTMLDivElement>>;
    export var LineContainer: import("react").ForwardRefExoticComponent<Omit<React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
    export var PlaceholderPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PrimitiveProps<any> & PropertyLineProps<any>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Wraps a link in a property line
     * @param props - INSPECTOR.SharedUIComponents.PropertyLineProps and INSPECTOR.SharedUIComponents.LinkProps
     * @returns property-line wrapped link
     */
    export var LinkPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PropertyLineProps<string> & INSPECTOR.SharedUIComponents.LinkProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Wraps a text input in a property line
     * @param props - INSPECTOR.SharedUIComponents.PropertyLineProps and InputProps
     * @returns property-line wrapped input component
     */
    export var TextInputPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.TextInputProps & INSPECTOR.SharedUIComponents.PropertyLineProps<string>>;
    export type NumberInputPropertyLineProps = INSPECTOR.SharedUIComponents.SpinButtonProps & INSPECTOR.SharedUIComponents.PropertyLineProps<number>;
    /**
     * Wraps a number input in a property line
     * To force integer values, use forceInt param (this is distinct from the 'step' param, which will still allow submitting an integer value. forceInt will not)
     * @param props - INSPECTOR.SharedUIComponents.PropertyLineProps and InputProps
     * @returns property-line wrapped input component
     */
    export var NumberInputPropertyLine: React.FunctionComponent<NumberInputPropertyLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type HexPropertyLineProps = INSPECTOR.SharedUIComponents.NumberInputPropertyLineProps & {
        numBits?: 32 | 24 | 16 | 8;
    };
    /**
     * Takes a number representing a Hex value and converts it to a hex string then wraps the TextInput in a PropertyLine
     * @param props - PropertyLineProps
     * @returns property-line wrapped textbox that converts to/from hex number representation
     */
    export var HexPropertyLine: React.FunctionComponent<HexPropertyLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type NodeSelectorPropertyLineProps = INSPECTOR.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Node>> & INSPECTOR.SharedUIComponents.NodeSelectorProps;
    type MaterialSelectorPropertyLineProps = INSPECTOR.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Material>> & INSPECTOR.SharedUIComponents.MaterialSelectorProps;
    type TextureSelectorPropertyLineProps = INSPECTOR.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.BaseTexture>> & INSPECTOR.SharedUIComponents.TextureSelectorProps;
    type SkeletonSelectorPropertyLineProps = INSPECTOR.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Skeleton>> & INSPECTOR.SharedUIComponents.SkeletonSelectorProps;
    export const NodeSelectorPropertyLine: (props: NodeSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const MaterialSelectorPropertyLine: (props: MaterialSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const TextureSelectorPropertyLine: (props: TextureSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const SkeletonSelectorPropertyLine: (props: SkeletonSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type DropdownPropertyLineProps<V extends INSPECTOR.SharedUIComponents.AcceptedDropdownValue> = INSPECTOR.SharedUIComponents.DropdownProps<V> & INSPECTOR.SharedUIComponents.PropertyLineProps<V>;
    /**
     * Wraps a dropdown in a property line
     * @param props - INSPECTOR.SharedUIComponents.PropertyLineProps and INSPECTOR.SharedUIComponents.DropdownProps
     * @returns property-line wrapped dropdown
     */
    export var DropdownPropertyLine: import("react").ForwardRefExoticComponent<DropdownPropertyLineProps<INSPECTOR.SharedUIComponents.AcceptedDropdownValue> & import("react").RefAttributes<HTMLDivElement>>;
    /**
     * Dropdown component for number values.
     */
    export var NumberDropdownPropertyLine: React.FunctionComponent<DropdownPropertyLineProps<number>>;
    /**
     * Dropdown component for string values
     */
    export var StringDropdownPropertyLine: React.FunctionComponent<DropdownPropertyLineProps<string>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        type ComboBoxPropertyLineProps = INSPECTOR.SharedUIComponents.ComboBoxProps & INSPECTOR.SharedUIComponents.PropertyLineProps<string>;
    /**
     * A property line with a filterable ComboBox
     * @param props - INSPECTOR.SharedUIComponents.ComboBoxProps & INSPECTOR.SharedUIComponents.PropertyLineProps
     * @returns property-line wrapped ComboBox component
     */
    export var ComboBoxPropertyLine: React.FunctionComponent<ComboBoxPropertyLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type ColorPropertyLineProps = INSPECTOR.SharedUIComponents.ColorPickerProps<BABYLON.Color3 | BABYLON.Color4> & INSPECTOR.SharedUIComponents.PropertyLineProps<BABYLON.Color3 | BABYLON.Color4>;
    export var Color3PropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.ColorPickerProps<BABYLON.Color3> & INSPECTOR.SharedUIComponents.PropertyLineProps<BABYLON.Color3>>;
    export var Color4PropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.ColorPickerProps<BABYLON.Color4> & INSPECTOR.SharedUIComponents.PropertyLineProps<BABYLON.Color4>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Wraps a checkbox in a property line
     * @param props - INSPECTOR.SharedUIComponents.PropertyLineProps and CheckboxProps
     * @returns property-line wrapped checkbox
     */
    export var CheckboxPropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PropertyLineProps<boolean> & INSPECTOR.SharedUIComponents.PrimitiveProps<boolean>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Displays an icon indicating enabled (green check) or disabled (red cross) state
     * @param props - The properties for the PropertyLine, including the boolean value to display.
     * @returns A PropertyLine component with a PresenceBadge indicating the boolean state.
     */
    export var BooleanBadgePropertyLine: React.FunctionComponent<INSPECTOR.SharedUIComponents.PropertyLineProps<boolean> & INSPECTOR.SharedUIComponents.ImmutablePrimitiveProps<boolean>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * A wrapper component for the property tab that provides a consistent layout and styling.
     * It uses a Pane and an Accordion to organize the content, so its direct children
     * must have 'title' props to be compatible with the Accordion structure.
     * @param props The props to pass to the component.
     * @returns The rendered component.
     */
    export var PropertyTabComponentBase: React.FunctionComponent<React.PropsWithChildren>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export function ClassNames(names: any, styleObject: any): string;
    export function JoinClassNames(styleObject: any, ...names: string[]): string;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type ToggleProps = {
        toggled: "on" | "mixed" | "off";
        onToggle?: () => void;
        padded?: boolean;
        color?: "dark" | "light";
    };
    export var Toggle: React.FC<ToggleProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ITextInputProps {
        label?: string;
        placeholder?: string;
        submitValue: (newValue: string) => void;
        validateValue?: (value: string) => boolean;
        cancelSubmit?: () => void;
    }
    /**
     * This component represents a text input that can be submitted or cancelled on buttons
     * @param props properties
     * @returns TextInputWithSubmit element
     */
    export const TextInputWithSubmit: (props: ITextInputProps) => import("react/jsx-runtime").JSX.Element;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface MessageDialogProps {
        message: string;
        isError: boolean;
        onClose?: () => void;
    }
    export var MessageDialog: React.FC<MessageDialogProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type LabelProps = {
        text: string;
        children?: React.ReactChild;
        color?: "dark" | "light";
    };
    export var Label: React.FC<LabelProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type IconProps = {
        color?: "dark" | "light";
        icon: string;
    };
    export var Icon: React.FC<IconProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type ButtonComponentProps = {
        disabled?: boolean;
        active?: boolean;
        onClick?: () => void;
        color: "light" | "dark";
        size: "default" | "small" | "wide" | "smaller";
        title?: string;
        backgroundColor?: string;
    };
    export var ButtonComponent: React.FC<React.PropsWithChildren<ButtonComponentProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * utility hook to assist using the graph context
     * @returns
     */
    export const useGraphContext: () => IGraphContext;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type IVisualRecordsType = Record<string, {
        x: number;
        y: number;
    }>;
    export type IConnectionType = {
        id: string;
        sourceId: string;
        targetId: string;
    };
    export type ICustomDataType = {
        type: string;
        value: any;
    };
    export type INodeType = {
        id: string;
        label: string;
        customData?: ICustomDataType;
    };
    /**
     * props for the node renderer
     */
    export interface INodeRendererProps {
        /**
         * array of connections between nodes
         */
        connections: IConnectionType[];
        /**
         * function called when a new connection is created
         */
        updateConnections: (sourceId: string, targetId: string) => void;
        /**
         * function called when a connection is deleted
         */
        deleteLine: (lineId: string) => void;
        /**
         * function called when a node is deleted
         */
        deleteNode: (nodeId: string) => void;
        /**
         * array of all nodes
         */
        nodes: INodeType[];
        /**
         * id of the node to highlight
         */
        highlightedNode?: BABYLON.Nullable<string>;
        /**
         * function to be called if a node is selected
         */
        selectNode?: (nodeId: BABYLON.Nullable<string>) => void;
        /**
         * id of this renderer
         */
        id: string;
        /**
         * optional list of custom components to be rendered inside nodes of
         * a certain type
         */
        customComponents?: Record<string, React.ComponentType<any>>;
    }
    /**
     * This component is a bridge between the app logic related to the graph, and the actual rendering
     * of it. It manages the nodes' positions and selection states.
     * @param props
     * @returns
     */
    export const NodeRenderer: (props: React.PropsWithChildren<INodeRendererProps>) => import("react/jsx-runtime").JSX.Element;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IGraphContainerProps {
        onNodeMoved: (id: string, x: number, y: number) => void;
        id: string;
    }
    /**
     * This component contains all the nodes and handles their dragging
     * @param props properties
     * @returns graph node container element
     */
    export var GraphNodesContainer: React.FC<React.PropsWithChildren<IGraphContainerProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IGraphNodeProps {
        id: string;
        name: string;
        x: number;
        y: number;
        selected?: boolean;
        width?: number;
        height?: number;
        highlighted?: boolean;
        parentContainerId: string;
    }
    export var SingleGraphNode: React.FC<React.PropsWithChildren<IGraphNodeProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * props for the GraphLineContainer
     */
    export interface IGraphLinesContainerProps {
        /**
         * id of the container
         */
        id: string;
    }
    /**
     * this component handles the dragging of new connections
     * @param props
     * @returns
     */
    export var GraphLinesContainer: React.FC<React.PropsWithChildren<IGraphLinesContainerProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * props for the GraphLine component
     */
    export interface IGraphLineProps {
        /**
         * id of the line. temporary lines can have no id
         */
        id?: string;
        /**
         * starting x pos of the line
         */
        x1: number;
        /**
         * ending x pos of the line
         */
        x2: number;
        /**
         * starting y pos of the line
         */
        y1: number;
        /**
         * ending y pos of the line
         */
        y2: number;
        /**
         * is the line selected
         */
        selected?: boolean;
        /**
         * does the line have a direction
         */
        directional?: boolean;
    }
    export const MarkerArrowId = "arrow";
    /**
     * This component draws a SVG line between two points, with an optional marker
     * indicating direction
     * @param props properties
     * @returns graph line element
     */
    export var GraphLine: React.FC<IGraphLineProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * this context is used to pass callbacks to the graph nodes and connections
     */
    export interface IGraphContext {
        onNodesConnected?: (sourceId: string, targetId: string) => void;
        onLineSelected?: (lineId: string) => void;
        onNodeSelected?: (nodeId: string) => void;
    }
    export var GraphContextManager: import("react").Context<IGraphContext>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IGraphContainerProps {
    }
    /**
     * This component is just a simple container to keep the nodes and lines containers
     * together
     * @param props
     * @returns
     */
    export var GraphContainer: React.FC<React.PropsWithChildren<IGraphContainerProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Props for the connector
     */
    export interface IGraphConnectorHandlerProps {
        /**
         * id of the parent node
         */
        parentId: string;
        /**
         * x position of the parent node
         */
        parentX: number;
        /**
         * y position of the parent node
         */
        parentY: number;
        /**
         * x position of the connector relative to the parent node
         */
        offsetX?: number;
        /**
         * y position of the connector relative to the parent node
         */
        offsetY?: number;
        /**
         * width of the parent node
         */
        parentWidth: number;
        /**
         * height of the parent node
         */
        parentHeight: number;
        /**
         * id of the container where its parent node is
         */
        parentContainerId: string;
    }
    /**
     * This component is used to initiate a connection between two nodes. Simply
     * drag the handle in a node and drop it in another node to create a connection.
     * @returns connector element
     */
    export var GraphConnectorHandler: React.FC<React.PropsWithChildren<IGraphConnectorHandlerProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * This components represents an options menu with optional
     * customizable properties. Option IDs should be unique.
     */
    export interface IOption {
        label: string;
        value: string;
        id: string;
    }
    export interface IOptionsLineComponentProps {
        options: IOption[];
        addOptionPlaceholder?: string;
        onOptionAdded?: (newOption: IOption) => void;
        onOptionSelected: (selectedOptionValue: string) => void;
        selectedOptionValue: string;
        validateNewOptionValue?: (newOptionValue: string) => boolean;
        addOptionText?: string;
    }
    export const OptionsLineComponent: (props: IOptionsLineComponentProps) => import("react/jsx-runtime").JSX.Element;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface INumericInputComponentProps {
        label: string;
        labelTooltip?: string;
        value: number;
        step?: number;
        onChange: (value: number) => void;
        precision?: number;
        icon?: string;
        iconLabel?: string;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class NumericInputComponent extends React.Component<INumericInputComponentProps, {
        value: string;
    }> {
        static defaultProps: {
            step: number;
        };
        private _localChange;
        constructor(props: INumericInputComponentProps);
        componentWillUnmount(): void;
        shouldComponentUpdate(nextProps: INumericInputComponentProps, nextState: {
            value: string;
        }): boolean;
        updateValue(valueString: string): void;
        onBlur(): void;
        incrementValue(amount: number): void;
        onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IFileButtonLineComponentProps {
        label: string;
        onClick: (file: File) => void;
        accept: string;
        icon?: string;
        iconLabel?: string;
    }
    export class FileButtonLineComponent extends React.Component<IFileButtonLineComponentProps> {
        private static _IdGenerator;
        private _id;
        private _uploadInputRef;
        constructor(props: IFileButtonLineComponentProps);
        onChange(evt: any): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IColorPickerLineComponentProps {
        value: BABYLON.Color4 | BABYLON.Color3;
        linearHint?: boolean;
        onColorChanged: (newOne: string) => void;
        icon?: string;
        iconLabel?: string;
        shouldPopRight?: boolean;
        lockObject?: INSPECTOR.SharedUIComponents.LockObject;
        backgroundColor?: string;
    }
    interface IColorPickerComponentState {
        pickerEnabled: boolean;
        color: BABYLON.Color3 | BABYLON.Color4;
        hex: string;
    }
    export class ColorPickerLineComponent extends React.Component<IColorPickerLineComponentProps, IColorPickerComponentState> {
        private _floatRef;
        private _floatHostRef;
        private _coverRef;
        constructor(props: IColorPickerLineComponentProps);
        syncPositions(): void;
        shouldComponentUpdate(nextProps: IColorPickerLineComponentProps, nextState: IColorPickerComponentState): boolean;
        getHexString(props?: Readonly<IColorPickerLineComponentProps>): string;
        componentDidUpdate(): void;
        componentDidMount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Given a column and row number in the layout, return the corresponding column/row
     * @param layout
     * @param column
     * @param row
     * @returns
     */
    export const getPosInLayout: (layout: INSPECTOR.SharedUIComponents.Layout, column: number, row?: number) => INSPECTOR.SharedUIComponents.LayoutColumn | INSPECTOR.SharedUIComponents.LayoutTabsRow;
    /**
     * Remove a row in position row, column from the layout, and redistribute heights of remaining rows
     * @param layout
     * @param column
     * @param row
     */
    export const removeLayoutRowAndRedistributePercentages: (layout: INSPECTOR.SharedUIComponents.Layout, column: number, row: number) => void;
    /**
     * Add a percentage string to a number
     * @param p1 the percentage string
     * @param p2 the number
     * @returns the sum of the percentage string and the number
     */
    export const addPercentageStringToNumber: (p1: string, p2: number) => number;
    /**
     * Parses a percentage string into a number
     * @param p the percentage string
     * @returns the parsed number
     */
    export const parsePercentage: (p: string) => number;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export type LayoutTab = {
        /**
         * Tab id
         */
        id: string;
        /**
         * React component rendered by tab
         */
        component: React.ReactElement;
        /**
         * Tab title
         */
        title: string;
    };
    export type LayoutTabsRow = {
        /**
         * row id
         */
        id: string;
        /**
         * row height in its containing column
         */
        height: string;
        /**
         * selected tab in row
         */
        selectedTab: string;
        /**
         * list of tabs contained in row
         */
        tabs: LayoutTab[];
    };
    export type LayoutColumn = {
        /**
         * column id
         */
        id: string;
        /**
         * column width in the grid
         */
        width: string;
        /**
         * column rows
         */
        rows: LayoutTabsRow[];
    };
    export type Layout = {
        /**
         * layout columns
         */
        columns?: LayoutColumn[];
    };
    export type TabDrag = {
        /**
         * row number of the tab being dragged
         */
        rowNumber: number;
        /**
         * column number of the tab being dragged
         */
        columnNumber: number;
        /**
         * the tabs being dragged
         */
        tabs: {
            /**
             * id of tab being dragged
             */
            id: string;
        }[];
    };
    export enum ElementTypes {
        RESIZE_BAR = "0",
        TAB = "1",
        TAB_GROUP = "2",
        NONE = "2"
    }
    export enum ResizeDirections {
        ROW = "row",
        COLUMN = "column"
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export var LayoutContext: import("react").Context<{
        /**
         * The layout object
         */
        layout: INSPECTOR.SharedUIComponents.Layout;
        /**
         * Function to set the layout object in the context
         */
        setLayout: (layout: INSPECTOR.SharedUIComponents.Layout) => void;
    }>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the TabsContainer component.
     */
    export interface IFlexibleTabsContainerProps {
        /**
         * The tabs to display
         */
        tabs: INSPECTOR.SharedUIComponents.LayoutTab[];
        /**
         * Row index of component in layout
         */
        rowIndex: number;
        /**
         * Column index of component in layout
         */
        columnIndex: number;
        /**
         * Which tab is selected in the layout
         */
        selectedTab?: string;
    }
    /**
     * This component contains a set of tabs of which only one is visible at a time.
     * The tabs can also be dragged from and to different containers.
     * @param props properties
     * @returns tabs container element
     */
    export var FlexibleTabsContainer: React.FC<IFlexibleTabsContainerProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the FlexibleTab component.
     */
    export interface IFlexibleTabProps {
        /**
         * The tab's title.
         */
        title: string;
        /**
         * If the tab is currently selected or not
         */
        selected: boolean;
        /**
         * What happens when the user clicks on the tab
         */
        onClick: () => void;
        /**
         * The object that will be sent to the drag event
         */
        item: INSPECTOR.SharedUIComponents.TabDrag;
        /**
         * What happens when the user drops another tab after this one
         */
        onTabDroppedAction: (item: INSPECTOR.SharedUIComponents.TabDrag) => void;
    }
    /**
     * A component that renders a tab that the user can click
     * to activate or drag to reorder. It also listens for
     * drop events if the user wants to drop another tab
     * after it.
     * @param props properties
     * @returns FlexibleTab element
     */
    export var FlexibleTab: React.FC<IFlexibleTabProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the ResizeBar component.
     */
    export interface IFlexibleRowResizerProps {
        /**
         * Row number of the component that is being resized
         */
        rowNumber: number;
        /**
         * Column number of the component being resized
         */
        columnNumber: number;
        /**
         * If the resizing happens in row or column direction
         */
        direction: INSPECTOR.SharedUIComponents.ResizeDirections;
    }
    /**
     * The item that will be sent to the drag event
     */
    export type ResizeItem = {
        /**
         * If the resizing happens in row or column direction
         */
        direction: INSPECTOR.SharedUIComponents.ResizeDirections;
        /**
         * The row number of the component that is being resized
         */
        rowNumber: number;
        /**
         * the column number of the component being resized
         */
        columnNumber: number;
    };
    /**
     * A component that renders a bar that the user can drag to resize.
     * @param props properties
     * @returns resize bar element
     */
    export var FlexibleResizeBar: React.FC<IFlexibleRowResizerProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the INSPECTOR.SharedUIComponents.Layout component.
     */
    export interface IFlexibleGridLayoutProps {
        /**
         * A definition of the layout which can be changed by the user
         */
        layoutDefinition: INSPECTOR.SharedUIComponents.Layout;
    }
    /**
     * This component represents a grid layout that can be resized and rearranged
     * by the user.
     * @param props properties
     * @returns layout element
     */
    export var FlexibleGridLayout: React.FC<IFlexibleGridLayoutProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the GridContainer component.
     */
    export interface IFlexibleGridContainerProps {
    }
    /**
     * Component responsible for mapping the layout to the actual components
     * @returns GridContainer element
     */
    export var FlexibleGridContainer: React.FC<IFlexibleGridContainerProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the FlexibleDropZone component.
     */
    export interface IFlexibleDropZoneProps {
        /**
         * The row number of the component in the layout
         */
        rowNumber: number;
        /**
         * The column number of the component in the layout
         */
        columnNumber: number;
    }
    /**
     * This component contains the drag and drop zone for the resize bars that
     * allow redefining width and height of layout elements
     * @param props properties
     * @returns drop zone element
     */
    export var FlexibleDropZone: React.FC<React.PropsWithChildren<IFlexibleDropZoneProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the DragHandler component.
     */
    export interface IFlexibleDragHandlerProps {
        /**
         * The size of the containing element. Used to calculate the percentage of
         * space occupied by the component
         */
        containerSize: {
            width: number;
            height: number;
        };
    }
    /**
     * This component receives the drop events and updates the layout accordingly
     * @param props properties
     * @returns DragHandler element
     */
    export var FlexibleDragHandler: React.FC<React.PropsWithChildren<IFlexibleDragHandlerProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the Column component.
     */
    export interface IFlexibleColumnProps {
        /**
         * Width of column
         */
        width: string;
    }
    /**
     * This component represents a single column in the layout. It receives a width
     * that it occupies and the content to display
     * @param props
     * @returns
     */
    export var FlexibleColumn: React.FC<React.PropsWithChildren<IFlexibleColumnProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Arguments for the DraggableIcon component.
     */
    export interface IDraggableIconProps {
        /**
         * Icon source
         */
        src: string;
        /**
         * Object that will be passed to the drag event
         */
        item: INSPECTOR.SharedUIComponents.TabDrag;
        /**
         * Type of drag event
         */
        type: INSPECTOR.SharedUIComponents.ElementTypes;
    }
    /**
     * An icon that can be dragged by the user
     * @param props properties
     * @returns draggable icon element
     */
    export var DraggableIcon: React.FC<IDraggableIconProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IHexColorProps {
        value: string;
        expectedLength: number;
        onChange: (value: string) => void;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class HexColorComponent extends React.Component<IHexColorProps, {
        hex: string;
    }> {
        constructor(props: IHexColorProps);
        shouldComponentUpdate(nextProps: IHexColorProps, nextState: {
            hex: string;
        }): boolean;
        lock(): void;
        unlock(): void;
        updateHexValue(valueString: string): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerComponentProps {
        color: BABYLON.Color3 | BABYLON.Color4;
        linearhint?: boolean;
        debugMode?: boolean;
        onColorChanged?: (color: BABYLON.Color3 | BABYLON.Color4) => void;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
        backgroundColor?: string;
    }
    /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerState {
        color: BABYLON.Color3;
        alpha: number;
    }
    /**
     * Class used to create a color picker
     */
    export class ColorPickerComponent extends React.Component<IColorPickerComponentProps, IColorPickerState> {
        private _saturationRef;
        private _hueRef;
        private _isSaturationPointerDown;
        private _isHuePointerDown;
        constructor(props: IColorPickerComponentProps);
        shouldComponentUpdate(nextProps: IColorPickerComponentProps, nextState: IColorPickerState): boolean;
        onSaturationPointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
        onSaturationPointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
        onSaturationPointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
        onHuePointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
        onHuePointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
        onHuePointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
        private _evaluateSaturation;
        private _evaluateHue;
        componentDidUpdate(): void;
        raiseOnColorChanged(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IColorComponentEntryProps {
        value: number;
        label: string;
        max?: number;
        min?: number;
        onChange: (value: number) => void;
        disabled?: boolean;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class ColorComponentComponentEntry extends React.Component<IColorComponentEntryProps> {
        constructor(props: IColorComponentEntryProps);
        updateValue(valueString: string): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        interface ICommandDropdownComponentProps {
        icon?: string;
        tooltip: string;
        defaultValue?: string;
        items: {
            label: string;
            icon?: string;
            fileButton?: boolean;
            onClick?: () => void;
            onCheck?: (value: boolean) => void;
            storeKey?: string;
            isActive?: boolean;
            defaultValue?: boolean | string;
            subItems?: string[];
        }[];
        toRight?: boolean;
    }
    export class CommandDropdownComponent extends React.Component<ICommandDropdownComponentProps, {
        isExpanded: boolean;
        activeState: string;
    }> {
        constructor(props: ICommandDropdownComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ICommandButtonComponentProps {
        tooltip: string;
        shortcut?: string;
        icon: string;
        iconLabel?: string;
        isActive: boolean;
        onClick: () => void;
        disabled?: boolean;
    }
    export var CommandButtonComponent: React.FC<ICommandButtonComponentProps>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface ICommandBarComponentProps {
        onSaveButtonClicked?: () => void;
        onSaveToSnippetButtonClicked?: () => void;
        onLoadFromSnippetButtonClicked?: () => void;
        onHelpButtonClicked?: () => void;
        onGiveFeedbackButtonClicked?: () => void;
        onSelectButtonClicked?: () => void;
        onPanButtonClicked?: () => void;
        onZoomButtonClicked?: () => void;
        onFitButtonClicked?: () => void;
        onArtboardColorChanged?: (newColor: string) => void;
        artboardColor?: string;
        artboardColorPickerColor?: string;
    }
    export var CommandBarComponent: React.FC<React.PropsWithChildren<ICommandBarComponentProps>>;



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IHexColorProps {
        value: string;
        expectedLength: number;
        onChange: (value: string) => void;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class HexColor extends React.Component<IHexColorProps, {
        hex: string;
    }> {
        constructor(props: IHexColorProps);
        shouldComponentUpdate(nextProps: IHexColorProps, nextState: {
            hex: string;
        }): boolean;
        lock(): void;
        unlock(): void;
        updateHexValue(valueString: string): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerProps {
        color: BABYLON.Color3 | BABYLON.Color4;
        linearhint?: boolean;
        debugMode?: boolean;
        onColorChanged?: (color: BABYLON.Color3 | BABYLON.Color4) => void;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerState {
        color: BABYLON.Color3;
        alpha: number;
    }
    /**
     * Class used to create a color picker
     */
    export class ColorPicker extends React.Component<IColorPickerProps, IColorPickerState> {
        private _saturationRef;
        private _hueRef;
        private _isSaturationPointerDown;
        private _isHuePointerDown;
        constructor(props: IColorPickerProps);
        shouldComponentUpdate(nextProps: IColorPickerProps, nextState: IColorPickerState): boolean;
        onSaturationPointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
        onSaturationPointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
        onSaturationPointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
        onHuePointerDown(evt: React.PointerEvent<HTMLDivElement>): void;
        onHuePointerUp(evt: React.PointerEvent<HTMLDivElement>): void;
        onHuePointerMove(evt: React.PointerEvent<HTMLDivElement>): void;
        private _evaluateSaturation;
        private _evaluateHue;
        componentDidUpdate(): void;
        raiseOnColorChanged(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}
declare module INSPECTOR.SharedUIComponents {
        export interface IColorComponentEntryProps {
        value: number;
        label: string;
        max?: number;
        min?: number;
        onChange: (value: number) => void;
        disabled?: boolean;
        lockObject: INSPECTOR.SharedUIComponents.LockObject;
    }
    export class ColorComponentEntry extends React.Component<IColorComponentEntryProps> {
        constructor(props: IColorComponentEntryProps);
        updateValue(valueString: string): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module INSPECTOR {


}


