
declare module "babylonjs-node-render-graph-editor/serializationTools" {
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { Nullable } from "babylonjs/types";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { NodeRenderGraph } from "babylonjs/FrameGraph/Node/nodeRenderGraph";
export class SerializationTools {
    static UpdateLocations(renderGraph: NodeRenderGraph, globalState: GlobalState, frame?: Nullable<GraphFrame>): void;
    static Serialize(renderGraph: NodeRenderGraph, globalState: GlobalState, frame?: Nullable<GraphFrame>): string;
    static Deserialize(serializationObject: any, globalState: GlobalState): void;
    static AddFrameToRenderGraph(serializationObject: any, globalState: GlobalState, currentRenderGraph: NodeRenderGraph): void;
}

}
declare module "babylonjs-node-render-graph-editor/portal" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { PropsWithChildren } from "react";
interface IPortalProps {
    globalState: GlobalState;
}
export class Portal extends React.Component<PropsWithChildren<IPortalProps>> {
    render(): React.ReactPortal;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/nodeRenderGraphEditor" {
import { NodeRenderGraph } from "babylonjs/FrameGraph/Node/nodeRenderGraph";
import { Observable } from "babylonjs/Misc/observable";
import { Scene } from "babylonjs/scene";
import { INodeRenderGraphCustomBlockDescription } from "babylonjs/FrameGraph/Node/Types/nodeRenderGraphTypes";
/**
 * Interface used to specify creation options for the node editor
 */
export interface INodeEditorOptions {
    nodeRenderGraph: NodeRenderGraph;
    hostScene?: Scene;
    hostElement?: HTMLElement;
    customSave?: {
        label: string;
        action: (data: string) => Promise<void>;
    };
    customLoadObservable?: Observable<any>;
    customBlockDescriptions?: INodeRenderGraphCustomBlockDescription[];
}
/**
 * Class used to create a node editor
 */
export class NodeRenderGraphEditor {
    private static _CurrentState;
    private static _PopupWindow;
    /**
     * Show the node editor
     * @param options defines the options to use to configure the node editor
     */
    static Show(options: INodeEditorOptions): void;
}

}
declare module "babylonjs-node-render-graph-editor/index" {
export * from "babylonjs-node-render-graph-editor/nodeRenderGraphEditor";

}
declare module "babylonjs-node-render-graph-editor/graphEditor" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { Nullable } from "babylonjs/types";
import { IInspectorOptions } from "babylonjs/Debug/debugLayer";
import "babylonjs-node-render-graph-editor/main.scss";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { IEditorData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeLocationInfo";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { NodeRenderGraphBlock } from "babylonjs/FrameGraph/Node/nodeRenderGraphBlock";
interface IGraphEditorProps {
    globalState: GlobalState;
}
interface IGraphEditorState {
    showPreviewPopUp: boolean;
    message: string;
    isError: boolean;
}
interface IInternalPreviewAreaOptions extends IInspectorOptions {
    popup: boolean;
    original: boolean;
    explorerWidth?: string;
    inspectorWidth?: string;
    embedHostWidth?: string;
}
export class GraphEditor extends React.Component<IGraphEditorProps, IGraphEditorState> {
    private _graphCanvasRef;
    private _diagramContainerRef;
    private _graphCanvas;
    private _previewManager;
    private _mouseLocationX;
    private _mouseLocationY;
    private _onWidgetKeyUpPointer;
    private _historyStack;
    private _previewHost;
    private _popUpWindow;
    private _externalTextures;
    appendBlock(dataToAppend: NodeRenderGraphBlock | INodeData, recursion?: boolean): GraphNode;
    addValueNode(type: string): GraphNode;
    prepareHistoryStack(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    constructor(props: IGraphEditorProps);
    zoomToFit(): void;
    private _setExternalInputs;
    buildRenderGraphAsync(): Promise<void>;
    build(ignoreEditorData?: boolean): void;
    loadGraph(): void;
    showWaitScreen(): void;
    hideWaitScreen(): void;
    reOrganize(editorData?: Nullable<IEditorData>, isImportingAFrame?: boolean): void;
    onWheel: (evt: WheelEvent) => void;
    emitNewBlock(blockType: string, targetX: number, targetY: number): GraphNode | undefined;
    dropNewBlock(event: React.DragEvent<HTMLDivElement>): void;
    handlePopUp: () => void;
    handleClosingPopUp: () => void;
    initiatePreviewArea: (canvas?: HTMLCanvasElement) => void;
    createPopUp: () => void;
    createPreviewMeshControlHostAsync: (options: IInternalPreviewAreaOptions, parentControl: Nullable<HTMLElement>) => Promise<unknown>;
    createPreviewHostAsync: (options: IInternalPreviewAreaOptions, parentControl: Nullable<HTMLElement>) => Promise<unknown>;
    fixPopUpStyles: (document: Document) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/globalState" {
import { NodeRenderGraph } from "babylonjs/FrameGraph/Node/nodeRenderGraph";
import { Observable } from "babylonjs/Misc/observable";
import { LogEntry } from "babylonjs-node-render-graph-editor/components/log/logComponent";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { Nullable } from "babylonjs/types";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { NodeRenderGraphBlock } from "babylonjs/FrameGraph/Node/nodeRenderGraphBlock";
import { FilesInput } from "babylonjs/Misc/filesInput";
import { PreviewType } from "babylonjs-node-render-graph-editor/components/preview/previewType";
import { Scene } from "babylonjs/scene";
import { INodeRenderGraphCustomBlockDescription } from "babylonjs/FrameGraph/Node/Types/nodeRenderGraphTypes";
export class GlobalState {
    hostElement: HTMLElement;
    hostDocument: Document;
    hostWindow: Window;
    hostScene?: Scene;
    stateManager: StateManager;
    onClearUndoStack: Observable<void>;
    onBuiltObservable: Observable<void>;
    onResetRequiredObservable: Observable<boolean>;
    onZoomToFitRequiredObservable: Observable<void>;
    onReOrganizedRequiredObservable: Observable<void>;
    onLogRequiredObservable: Observable<LogEntry>;
    onIsLoadingChanged: Observable<boolean>;
    onLightUpdated: Observable<void>;
    onFrame: Observable<void>;
    onAnimationCommandActivated: Observable<void>;
    onImportFrameObservable: Observable<any>;
    onPopupClosedObservable: Observable<void>;
    onGetNodeFromBlock: (block: NodeRenderGraphBlock) => GraphNode;
    onDropEventReceivedObservable: Observable<DragEvent>;
    previewType: PreviewType;
    previewFile: File;
    envType: PreviewType;
    envFile: File;
    listOfCustomPreviewFiles: File[];
    rotatePreview: boolean;
    lockObject: LockObject;
    hemisphericLight: boolean;
    directionalLight0: boolean;
    directionalLight1: boolean;
    pointerOverCanvas: boolean;
    onRefreshPreviewMeshControlComponentRequiredObservable: Observable<void>;
    filesInput: FilesInput;
    scene: Scene;
    noAutoFillExternalInputs: boolean;
    _engine: number;
    customSave?: {
        label: string;
        action: (data: string) => Promise<void>;
    };
    customBlockDescriptions?: INodeRenderGraphCustomBlockDescription[];
    private _nodeRenderGraph;
    /**
     * Gets the current node render graph
     */
    get nodeRenderGraph(): NodeRenderGraph;
    /**
     * Sets the current node material
     */
    set nodeRenderGraph(nodeRenderGraph: NodeRenderGraph);
    /** Gets the engine */
    get engine(): number;
    /** Sets the engine */
    set engine(e: number);
    constructor(scene: Scene);
    storeEditorData(serializationObject: any, frame?: Nullable<GraphFrame>): void;
}

}
declare module "babylonjs-node-render-graph-editor/blockTools" {
import { Scene } from "babylonjs/scene";
import { FrameGraph } from "babylonjs/FrameGraph/frameGraph";
import { NodeRenderGraphBlockConnectionPointTypes } from "babylonjs/FrameGraph/Node/Types/nodeRenderGraphTypes";
import { NodeRenderGraphOutputBlock } from "babylonjs/FrameGraph/Node/Blocks/outputBlock";
import { NodeRenderGraphInputBlock } from "babylonjs/FrameGraph/Node/Blocks/inputBlock";
import { NodeRenderGraphElbowBlock } from "babylonjs/FrameGraph/Node/Blocks/elbowBlock";
import { NodeRenderGraphTeleportInBlock } from "babylonjs/FrameGraph/Node/Blocks/Teleport/teleportInBlock";
import { NodeRenderGraphTeleportOutBlock } from "babylonjs/FrameGraph/Node/Blocks/Teleport/teleportOutBlock";
import { NodeRenderGraphBlackAndWhitePostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/blackAndWhitePostProcessBlock";
import { NodeRenderGraphBloomPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/bloomPostProcessBlock";
import { NodeRenderGraphBlurPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/blurPostProcessBlock";
import { NodeRenderGraphCircleOfConfusionPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/circleOfConfusionPostProcessBlock";
import { NodeRenderGraphDepthOfFieldPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/depthOfFieldPostProcessBlock";
import { NodeRenderGraphExtractHighlightsPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/extractHighlightsPostProcessBlock";
import { NodeRenderGraphClearBlock } from "babylonjs/FrameGraph/Node/Blocks/Textures/clearBlock";
import { NodeRenderGraphCopyTextureBlock } from "babylonjs/FrameGraph/Node/Blocks/Textures/copyTextureBlock";
import { NodeRenderGraphGenerateMipmapsBlock } from "babylonjs/FrameGraph/Node/Blocks/Textures/generateMipmapsBlock";
import { NodeRenderGraphObjectRendererBlock } from "babylonjs/FrameGraph/Node/Blocks/Rendering/objectRendererBlock";
import { NodeRenderGraphGeometryRendererBlock } from "babylonjs/FrameGraph/Node/Blocks/Rendering/geometryRendererBlock";
import { NodeRenderGraphCullObjectsBlock } from "babylonjs/FrameGraph/Node/Blocks/cullObjectsBlock";
import { NodeRenderGraphGUIBlock } from "babylonjs-gui/2D/FrameGraph/renderGraphGUIBlock";
import { NodeRenderGraphTAAPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/taaPostProcessBlock";
import { NodeRenderGraphResourceContainerBlock } from "babylonjs/FrameGraph/Node/Blocks/resourceContainerBlock";
import { NodeRenderGraphShadowGeneratorBlock } from "babylonjs/FrameGraph/Node/Blocks/Rendering/shadowGeneratorBlock";
import { NodeRenderGraphCascadedShadowGeneratorBlock } from "babylonjs/FrameGraph/Node/Blocks/Rendering/csmShadowGeneratorBlock";
import { NodeRenderGraphExecuteBlock } from "babylonjs/FrameGraph/Node/Blocks/executeBlock";
import { NodeRenderGraphGlowLayerBlock } from "babylonjs/FrameGraph/Node/Blocks/Layers/glowLayerBlock";
import { NodeRenderGraphHighlightLayerBlock } from "babylonjs/FrameGraph/Node/Blocks/Layers/highlightLayerBlock";
import { NodeRenderGraphPassCubePostProcessBlock, NodeRenderGraphPassPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/passPostProcessBlock";
import { NodeRenderGraphUtilityLayerRendererBlock } from "babylonjs/FrameGraph/Node/Blocks/Rendering/utilityLayerRendererBlock";
import { NodeRenderGraphSSRPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/ssrPostProcessBlock";
import { NodeRenderGraphAnaglyphPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/anaglyphPostProcessBlock";
import { NodeRenderGraphChromaticAberrationPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/chromaticAberrationPostProcessBlock";
import { NodeRenderGraphImageProcessingPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/imageProcessingPostProcessBlock";
import { NodeRenderGraphFXAAPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/fxaaPostProcessBlock";
import { NodeRenderGraphGrainPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/grainPostProcessBlock";
import { NodeRenderGraphMotionBlurPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/motionBlurPostProcessBlock";
import { NodeRenderGraphConvolutionPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/convolutionPostProcessBlock";
import { NodeRenderGraphSharpenPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/sharpenPostProcessBlock";
import { NodeRenderGraphScreenSpaceCurvaturePostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/screenSpaceCurvaturePostProcessBlock";
import { NodeRenderGraphColorCorrectionPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/colorCorrectionPostProcessBlock";
import { NodeRenderGraphFilterPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/filterPostProcessBlock";
import { NodeRenderGraphTonemapPostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/tonemapPostProcessBlock";
import { NodeRenderGraphSSAO2PostProcessBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/ssao2PostProcessBlock";
import { NodeRenderGraphComputeShaderBlock } from "babylonjs/FrameGraph/Node/Blocks/computeShaderBlock";
import { NodeRenderGraphVolumetricLightingBlock } from "babylonjs/FrameGraph/Node/Blocks/PostProcesses/volumetricLightingBlock";
import { NodeRenderGraphLightingVolumeBlock } from "babylonjs/FrameGraph/Node/Blocks/lightingVolumeBlock";
/**
 * Static class for BlockTools
 */
export class BlockTools {
    static GetBlockFromString(data: string, frameGraph: FrameGraph, scene: Scene): NodeRenderGraphTeleportInBlock | NodeRenderGraphTeleportOutBlock | NodeRenderGraphOutputBlock | NodeRenderGraphElbowBlock | NodeRenderGraphResourceContainerBlock | NodeRenderGraphExecuteBlock | NodeRenderGraphUtilityLayerRendererBlock | NodeRenderGraphInputBlock | NodeRenderGraphClearBlock | NodeRenderGraphCopyTextureBlock | NodeRenderGraphGenerateMipmapsBlock | NodeRenderGraphBlackAndWhitePostProcessBlock | NodeRenderGraphBloomPostProcessBlock | NodeRenderGraphBlurPostProcessBlock | NodeRenderGraphPassPostProcessBlock | NodeRenderGraphPassCubePostProcessBlock | NodeRenderGraphGUIBlock | NodeRenderGraphObjectRendererBlock | NodeRenderGraphGeometryRendererBlock | NodeRenderGraphTAAPostProcessBlock | NodeRenderGraphCullObjectsBlock | NodeRenderGraphCircleOfConfusionPostProcessBlock | NodeRenderGraphDepthOfFieldPostProcessBlock | NodeRenderGraphExtractHighlightsPostProcessBlock | NodeRenderGraphShadowGeneratorBlock | NodeRenderGraphCascadedShadowGeneratorBlock | NodeRenderGraphGlowLayerBlock | NodeRenderGraphHighlightLayerBlock | NodeRenderGraphSSRPostProcessBlock | NodeRenderGraphAnaglyphPostProcessBlock | NodeRenderGraphChromaticAberrationPostProcessBlock | NodeRenderGraphImageProcessingPostProcessBlock | NodeRenderGraphFXAAPostProcessBlock | NodeRenderGraphGrainPostProcessBlock | NodeRenderGraphMotionBlurPostProcessBlock | NodeRenderGraphConvolutionPostProcessBlock | NodeRenderGraphSharpenPostProcessBlock | NodeRenderGraphScreenSpaceCurvaturePostProcessBlock | NodeRenderGraphColorCorrectionPostProcessBlock | NodeRenderGraphFilterPostProcessBlock | NodeRenderGraphTonemapPostProcessBlock | NodeRenderGraphSSAO2PostProcessBlock | NodeRenderGraphComputeShaderBlock | NodeRenderGraphVolumetricLightingBlock | NodeRenderGraphLightingVolumeBlock | null;
    static GetColorFromConnectionNodeType(type: NodeRenderGraphBlockConnectionPointTypes): string;
    static GetConnectionNodeTypeFromString(type: string): NodeRenderGraphBlockConnectionPointTypes.Texture | NodeRenderGraphBlockConnectionPointTypes.TextureBackBuffer | NodeRenderGraphBlockConnectionPointTypes.TextureBackBufferDepthStencilAttachment | NodeRenderGraphBlockConnectionPointTypes.TextureDepthStencilAttachment | NodeRenderGraphBlockConnectionPointTypes.TextureViewDepth | NodeRenderGraphBlockConnectionPointTypes.TextureViewNormal | NodeRenderGraphBlockConnectionPointTypes.TextureAlbedo | NodeRenderGraphBlockConnectionPointTypes.TextureReflectivity | NodeRenderGraphBlockConnectionPointTypes.TextureWorldPosition | NodeRenderGraphBlockConnectionPointTypes.TextureVelocity | NodeRenderGraphBlockConnectionPointTypes.TextureScreenDepth | NodeRenderGraphBlockConnectionPointTypes.TextureWorldNormal | NodeRenderGraphBlockConnectionPointTypes.TextureLocalPosition | NodeRenderGraphBlockConnectionPointTypes.TextureLinearVelocity | NodeRenderGraphBlockConnectionPointTypes.TextureNormalizedViewDepth | NodeRenderGraphBlockConnectionPointTypes.ResourceContainer | NodeRenderGraphBlockConnectionPointTypes.ShadowGenerator | NodeRenderGraphBlockConnectionPointTypes.ShadowLight | NodeRenderGraphBlockConnectionPointTypes.Camera | NodeRenderGraphBlockConnectionPointTypes.ObjectList | NodeRenderGraphBlockConnectionPointTypes.AutoDetect;
    static GetStringFromConnectionNodeType(type: NodeRenderGraphBlockConnectionPointTypes): "" | "Texture" | "Camera" | "TextureBackBuffer" | "TextureBackBufferDepthStencilAttachment" | "TextureDepthStencilAttachment" | "ObjectList" | "TextureViewDepth" | "TextureNormalizedViewDepth" | "TextureNormal" | "TextureAlbedo" | "TextureReflectivity" | "TexturePosition" | "TextureVelocity" | "TextureScreenDepth" | "TextureLocalPosition" | "TextureWorldNormal" | "TextureLinearVelocity" | "ResourceContainer" | "ShadowGenerator" | "ShadowLight";
}

}
declare module "babylonjs-node-render-graph-editor/sharedComponents/textureLineComponent" {
import * as React from "react";
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
interface ITextureLineComponentProps {
    texture: BaseTexture;
    width: number;
    height: number;
    globalState?: any;
    hideChannelSelect?: boolean;
}
export interface ITextureLineComponentState {
    displayRed: boolean;
    displayGreen: boolean;
    displayBlue: boolean;
    displayAlpha: boolean;
    face: number;
}
export class TextureLineComponent extends React.Component<ITextureLineComponentProps, ITextureLineComponentState> {
    private _canvasRef;
    constructor(props: ITextureLineComponentProps);
    shouldComponentUpdate(): boolean;
    componentDidMount(): void;
    componentDidUpdate(): void;
    updatePreview(): void;
    static UpdatePreview(previewCanvas: HTMLCanvasElement, texture: BaseTexture, width: number, options: ITextureLineComponentState, onReady?: () => void, globalState?: any): Promise<void>;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/sharedComponents/lineWithFileButtonComponent" {
import * as React from "react";
interface ILineWithFileButtonComponentProps {
    title: string;
    closed?: boolean;
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
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/sharedComponents/lineContainerComponent" {
import * as React from "react";
interface ILineContainerComponentProps {
    title: string;
    children: any[] | any;
    closed?: boolean;
}
export class LineContainerComponent extends React.Component<ILineContainerComponentProps, {
    isExpanded: boolean;
}> {
    constructor(props: ILineContainerComponentProps);
    switchExpandedState(): void;
    renderHeader(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/sharedComponents/fileButtonLineComponent" {
import * as React from "react";
interface IFileButtonLineComponentProps {
    label: string;
    onClick: (file: File) => void;
    accept: string;
    uploadName?: string;
}
export class FileButtonLineComponent extends React.Component<IFileButtonLineComponentProps> {
    private _uploadRef;
    constructor(props: IFileButtonLineComponentProps);
    onChange(evt: any): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/sharedComponents/draggableLineWithButtonComponent" {
import * as React from "react";
export interface IDraggableLineWithButtonComponent {
    data: string;
    tooltip: string;
    iconImage: any;
    onIconClick: (value: string) => void;
    iconTitle: string;
    lenSuffixToRemove?: number;
}
export class DraggableLineWithButtonComponent extends React.Component<IDraggableLineWithButtonComponent> {
    constructor(props: IDraggableLineWithButtonComponent);
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/sharedComponents/draggableLineComponent" {
import * as React from "react";
export interface IButtonLineComponentProps {
    data: string;
    tooltip: string;
}
export class DraggableLineComponent extends React.Component<IButtonLineComponentProps> {
    constructor(props: IButtonLineComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/sharedComponents/checkBoxLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
export interface ICheckBoxLineComponentProps {
    label: string;
    target?: any;
    propertyName?: string;
    isSelected?: () => boolean;
    onSelect?: (value: boolean) => void;
    onValueChanged?: () => void;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    disabled?: boolean;
    extractValue?: (target: any) => boolean;
}
export class CheckBoxLineComponent extends React.Component<ICheckBoxLineComponentProps, {
    isSelected: boolean;
    isDisabled?: boolean;
}> {
    private static _UniqueIdSeed;
    private _uniqueId;
    private _localChange;
    constructor(props: ICheckBoxLineComponentProps);
    shouldComponentUpdate(nextProps: ICheckBoxLineComponentProps, nextState: {
        isSelected: boolean;
        isDisabled: boolean;
    }): boolean;
    onChange(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/legacy/legacy" {
export * from "babylonjs-node-render-graph-editor/index";

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerToTypeLedger" {
export const RegisterTypeLedger: () => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerToPropertyLedger" {
export const RegisterToPropertyTabManagers: () => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerToDisplayLedger" {
export const RegisterToDisplayManagers: () => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerNodePortDesign" {
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
export const RegisterNodePortDesign: (stateManager: StateManager) => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerExportData" {
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
export const RegisterExportData: (stateManager: StateManager) => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerElbowSupport" {
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
export const RegisterElbowSupport: (stateManager: StateManager) => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerDefaultInput" {
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
export const RegisterDefaultInput: (stateManager: StateManager) => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/registerDebugSupport" {
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
export const RegisterDebugSupport: (stateManager: StateManager) => void;

}
declare module "babylonjs-node-render-graph-editor/graphSystem/connectionPointPortData" {
import { NodeRenderGraphBlock } from "babylonjs/FrameGraph/Node/nodeRenderGraphBlock";
import { NodeRenderGraphConnectionPoint } from "babylonjs/FrameGraph/Node/nodeRenderGraphBlockConnectionPoint";
import { NodeRenderGraphConnectionPointCompatibilityStates } from "babylonjs/FrameGraph/Node/Types/nodeRenderGraphTypes";
import { Nullable } from "babylonjs/types";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { INodeContainer } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeContainer";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
import { PortDataDirection } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
export class ConnectionPointPortData implements IPortData {
    private _connectedPort;
    private _nodeContainer;
    data: NodeRenderGraphConnectionPoint;
    get name(): string;
    get internalName(): string;
    get isExposedOnFrame(): boolean;
    set isExposedOnFrame(value: boolean);
    get exposedPortPosition(): number;
    set exposedPortPosition(value: number);
    get isConnected(): boolean;
    get isInactive(): boolean;
    get connectedPort(): Nullable<IPortData>;
    set connectedPort(value: Nullable<IPortData>);
    get direction(): PortDataDirection;
    get ownerData(): NodeRenderGraphBlock;
    get needDualDirectionValidation(): boolean;
    get hasEndpoints(): boolean;
    get endpoints(): IPortData[];
    constructor(connectionPoint: NodeRenderGraphConnectionPoint, nodeContainer: INodeContainer);
    updateDisplayName(newName: string): void;
    connectTo(port: IPortData): void;
    canConnectTo(port: IPortData): boolean;
    disconnectFrom(port: IPortData): void;
    checkCompatibilityState(port: IPortData): 0 | NodeRenderGraphConnectionPointCompatibilityStates.TypeIncompatible | NodeRenderGraphConnectionPointCompatibilityStates.HierarchyIssue;
    getCompatibilityIssueMessage(issue: number, targetNode: GraphNode, targetPort: IPortData): string;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/blockNodeData" {
import { INodeContainer } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeContainer";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
import { NodeRenderGraphBlock } from "babylonjs/FrameGraph/Node/nodeRenderGraphBlock";
import { NodeRenderGraphTeleportOutBlock } from "babylonjs/FrameGraph/Node/Blocks/Teleport/teleportOutBlock";
export class BlockNodeData implements INodeData {
    data: NodeRenderGraphBlock;
    private _inputs;
    private _outputs;
    private _onBuildObserver;
    /**
     * Gets or sets a callback used to call node visual refresh
     */
    refreshCallback?: () => void;
    get uniqueId(): number;
    get name(): string;
    getClassName(): string;
    get isInput(): boolean;
    get inputs(): IPortData[];
    get outputs(): IPortData[];
    get comments(): string;
    set comments(value: string);
    get executionTime(): number;
    getPortByName(name: string): IPortData | null;
    isConnectedToOutput(): boolean;
    dispose(): void;
    prepareHeaderIcon(iconDiv: HTMLDivElement, img: HTMLImageElement): void;
    get invisibleEndpoints(): NodeRenderGraphTeleportOutBlock[] | null;
    constructor(data: NodeRenderGraphBlock, nodeContainer: INodeContainer);
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/properties/teleportOutNodePropertyComponent" {
import * as React from "react";
import { IPropertyComponentProps } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/propertyComponentProps";
export class TeleportOutPropertyTabComponent extends React.Component<IPropertyComponentProps> {
    private _onUpdateRequiredObserver;
    constructor(props: IPropertyComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/properties/nodePortPropertyComponent" {
import * as React from "react";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
export interface IFrameNodePortPropertyTabComponentProps {
    stateManager: StateManager;
    nodePort: NodePort;
}
export class NodePortPropertyTabComponent extends React.Component<IFrameNodePortPropertyTabComponentProps> {
    constructor(props: IFrameNodePortPropertyTabComponentProps);
    toggleExposeOnFrame(value: boolean): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/properties/inputNodePropertyComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { IPropertyComponentProps } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/propertyComponentProps";
export class InputPropertyTabComponent extends React.Component<IPropertyComponentProps> {
    private _onValueChangedObserver;
    constructor(props: IPropertyComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    renderValue(_globalState: GlobalState): import("react/jsx-runtime").JSX.Element | null;
    setDefaultValue(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/properties/genericNodePropertyComponent" {
import * as React from "react";
import { IPropertyComponentProps } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/propertyComponentProps";
export const samplingModeList: {
    label: string;
    value: number;
}[];
export const textureFormatList: {
    label: string;
    value: number;
}[];
export const textureTypeList: {
    label: string;
    value: number;
}[];
export const textureDepthStencilFormatList: {
    label: string;
    value: number;
}[];
export const TextureTargetTypeList: {
    label: string;
    value: number;
}[];
export class GenericPropertyComponent extends React.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export class GeneralPropertyTabComponent extends React.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}
export class GenericPropertyTabComponent extends React.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps);
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/properties/framePropertyComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
export interface IFramePropertyTabComponentProps {
    globalState: GlobalState;
    frame: GraphFrame;
}
export class FramePropertyTabComponent extends React.Component<IFramePropertyTabComponentProps> {
    private _onFrameExpandStateChangedObserver;
    constructor(props: IFramePropertyTabComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/properties/frameNodePortPropertyComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { FrameNodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort";
export interface IFrameNodePortPropertyTabComponentProps {
    stateManager: StateManager;
    globalState: GlobalState;
    frameNodePort: FrameNodePort;
    frame: GraphFrame;
}
export class FrameNodePortPropertyTabComponent extends React.Component<IFrameNodePortPropertyTabComponentProps, {
    port: FrameNodePort;
}> {
    private _onFramePortPositionChangedObserver;
    private _onSelectionChangedObserver;
    constructor(props: IFrameNodePortPropertyTabComponentProps);
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/display/textureDisplayManager" {
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
export class TextureDisplayManager implements IDisplayManager {
    getHeaderClass(): string;
    shouldDisplayPortLabels(): boolean;
    getHeaderText(nodeData: INodeData): string;
    getBackgroundColor(): string;
    updatePreviewContent(nodeData: INodeData, contentArea: HTMLDivElement): void;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/display/teleportOutDisplayManager" {
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { Nullable } from "babylonjs/types";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
export class TeleportOutDisplayManager implements IDisplayManager {
    private _hasHighlights;
    getHeaderClass(): string;
    shouldDisplayPortLabels(): boolean;
    getHeaderText(nodeData: INodeData): string;
    getBackgroundColor(nodeData: INodeData): string;
    updatePreviewContent(nodeData: INodeData, contentArea: HTMLDivElement): void;
    onSelectionChanged(nodeData: INodeData, selectedData: Nullable<INodeData>, manager: StateManager): void;
    onDispose(nodeData: INodeData, manager: StateManager): void;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/display/teleportInDisplayManager" {
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { Nullable } from "babylonjs/types";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
export class TeleportInDisplayManager implements IDisplayManager {
    private _hasHighlights;
    getHeaderClass(): string;
    shouldDisplayPortLabels(): boolean;
    getHeaderText(nodeData: INodeData): string;
    getBackgroundColor(nodeData: INodeData): string;
    updatePreviewContent(nodeData: INodeData, contentArea: HTMLDivElement): void;
    onSelectionChanged(nodeData: INodeData, selectedData: Nullable<INodeData>, manager: StateManager): void;
    onDispose(nodeData: INodeData, manager: StateManager): void;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/display/postProcessDisplayManager" {
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
export class PostProcessDisplayManager implements IDisplayManager {
    getHeaderClass(): string;
    shouldDisplayPortLabels(): boolean;
    getHeaderText(nodeData: INodeData): string;
    getBackgroundColor(): string;
    updatePreviewContent(nodeData: INodeData, contentArea: HTMLDivElement): void;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/display/outputDisplayManager" {
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
export class OutputDisplayManager implements IDisplayManager {
    getHeaderClass(): string;
    shouldDisplayPortLabels(): boolean;
    getHeaderText(nodeData: INodeData): string;
    getBackgroundColor(): string;
    updatePreviewContent(nodeData: INodeData, contentArea: HTMLDivElement): void;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/display/inputDisplayManager" {
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { NodeRenderGraphBlockConnectionPointTypes } from "babylonjs/FrameGraph/Node/Types/nodeRenderGraphTypes";
export class InputDisplayManager implements IDisplayManager {
    getHeaderClass(_nodeData: INodeData): string;
    getHeaderText(nodeData: INodeData): string;
    shouldDisplayPortLabels(): boolean;
    static GetBaseType(type: NodeRenderGraphBlockConnectionPointTypes): string;
    getBackgroundColor(nodeData: INodeData): string;
    updatePreviewContent(nodeData: INodeData, contentArea: HTMLDivElement): void;
}

}
declare module "babylonjs-node-render-graph-editor/graphSystem/display/elbowDisplayManager" {
import { IDisplayManager, VisualContentDescription } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
export class ElbowDisplayManager implements IDisplayManager {
    getHeaderClass(): string;
    shouldDisplayPortLabels(): boolean;
    getHeaderText(nodeData: INodeData): string;
    getBackgroundColor(nodeData: INodeData): string;
    updatePreviewContent(_nodeData: INodeData, _contentArea: HTMLDivElement): void;
    updateFullVisualContent(data: INodeData, visualContent: VisualContentDescription): void;
}

}
declare module "babylonjs-node-render-graph-editor/components/propertyTab/textureMemoryUsagePropertyTabComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import "babylonjs-node-render-graph-editor/components/propertyTab/propertyTab.scss";
interface ITextureMemoryUsagePropertyTabComponentProps {
    globalState: GlobalState;
}
export class TextureMemoryUsagePropertyTabComponent extends React.Component<ITextureMemoryUsagePropertyTabComponentProps> {
    constructor(props: ITextureMemoryUsagePropertyTabComponentProps);
    private _formatMemorySize;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/components/propertyTab/propertyTabComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { Nullable } from "babylonjs/types";
import "babylonjs-node-render-graph-editor/components/propertyTab/propertyTab.scss";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
import { FrameNodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
interface IPropertyTabComponentProps {
    globalState: GlobalState;
    lockObject: LockObject;
}
interface IPropertyTabComponentState {
    currentNode: Nullable<GraphNode>;
    currentFrame: Nullable<GraphFrame>;
    currentFrameNodePort: Nullable<FrameNodePort>;
    currentNodePort: Nullable<NodePort>;
    uploadInProgress: boolean;
}
export class PropertyTabComponent extends React.Component<IPropertyTabComponentProps, IPropertyTabComponentState> {
    private _onBuiltObserver;
    constructor(props: IPropertyTabComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    load(file: File): void;
    loadFrame(file: File): void;
    save(): void;
    customSave(): void;
    saveToSnippetServer(): void;
    loadFromSnippet(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/components/preview/previewType" {
export enum PreviewType {
    Sphere = 0,
    Box = 1,
    Cylinder = 2,
    Plane = 3,
    ShaderBall = 4,
    Custom = 5,
    Room = 6
}

}
declare module "babylonjs-node-render-graph-editor/components/preview/previewMeshControlComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import { PreviewType } from "babylonjs-node-render-graph-editor/components/preview/previewType";
interface IPreviewMeshControlComponent {
    globalState: GlobalState;
    togglePreviewAreaComponent: () => void;
    onMounted?: () => void;
}
export class PreviewMeshControlComponent extends React.Component<IPreviewMeshControlComponent> {
    private _filePickerRef;
    private _envPickerRef;
    private _onResetRequiredObserver;
    private _onDropEventObserver;
    private _onRefreshPreviewMeshControlComponentRequiredObserver;
    constructor(props: IPreviewMeshControlComponent);
    componentWillUnmount(): void;
    componentDidMount(): void;
    changeMeshType(newOne: PreviewType): void;
    useCustomMesh(evt: any): void;
    useCustomEnv(evt: any): void;
    onPopUp(): void;
    frame(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/components/preview/previewManager" {
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
export class PreviewManager {
    private _nodeRenderGraph;
    private _onFrameObserver;
    private _onPreviewCommandActivatedObserver;
    private _onUpdateRequiredObserver;
    private _onRebuildRequiredObserver;
    private _onImportFrameObserver;
    private _onResetRequiredObserver;
    private _onLightUpdatedObserver;
    private _engine;
    private _scene;
    private _globalState;
    private _currentType;
    private _lightParent;
    private _hdrTexture;
    private _dummyExternalTexture;
    constructor(targetCanvas: HTMLCanvasElement, globalState: GlobalState);
    private _initAsync;
    private _initSceneAsync;
    private _reset;
    private _prepareLights;
    private _createNodeRenderGraph;
    private _getMesh;
    private _buildGraphAsync;
    private _frameCamera;
    private _prepareBackgroundHDR;
    private _prepareScene;
    static DefaultEnvironmentURL: string;
    private _refreshPreviewMesh;
    dispose(): void;
}

}
declare module "babylonjs-node-render-graph-editor/components/preview/previewAreaComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
interface IPreviewAreaComponentProps {
    globalState: GlobalState;
    onMounted?: () => void;
}
export class PreviewAreaComponent extends React.Component<IPreviewAreaComponentProps, {
    isLoading: boolean;
}> {
    private _onIsLoadingChangedObserver;
    private _onResetRequiredObserver;
    constructor(props: IPreviewAreaComponentProps);
    componentWillUnmount(): void;
    componentDidMount(): void;
    _onPointerOverCanvas: () => void;
    _onPointerOutCanvas: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/components/nodeList/nodeListComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import "babylonjs-node-render-graph-editor/components/nodeList/nodeList.scss";
interface INodeListComponentProps {
    globalState: GlobalState;
}
export class NodeListComponent extends React.Component<INodeListComponentProps, {
    filter: string;
}> {
    private _onResetRequiredObserver;
    private static _Tooltips;
    private _customFrameList;
    constructor(props: INodeListComponentProps);
    componentWillUnmount(): void;
    filterContent(filter: string): void;
    loadCustomFrame(file: File): void;
    removeItem(value: string): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/components/log/logComponent" {
import * as React from "react";
import { GlobalState } from "babylonjs-node-render-graph-editor/globalState";
import "babylonjs-node-render-graph-editor/components/log/log.scss";
interface ILogComponentProps {
    globalState: GlobalState;
}
export class LogEntry {
    message: string;
    isError: boolean;
    time: Date;
    constructor(message: string, isError: boolean);
}
export class LogComponent extends React.Component<ILogComponentProps, {
    logs: LogEntry[];
}> {
    private _logConsoleRef;
    constructor(props: ILogComponentProps);
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};

}
declare module "babylonjs-node-render-graph-editor/styleHelper" {
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
declare module "babylonjs-node-render-graph-editor/stringTools" {
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
declare module "babylonjs-node-render-graph-editor/propertyChangedEvent" {
export class PropertyChangedEvent {
    object: any;
    property: string;
    value: any;
    initialValue: any;
    allowNullValue?: boolean;
}

}
declare module "babylonjs-node-render-graph-editor/popupHelper" {
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
declare module "babylonjs-node-render-graph-editor/historyStack" {
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
declare module "babylonjs-node-render-graph-editor/copyCommandToClipboard" {
export function copyCommandToClipboard(strCommand: string): void;
export function getClassNameWithNamespace(obj: any): {
    className: string;
    babylonNamespace: string;
};

}
declare module "babylonjs-node-render-graph-editor/constToOptionsMaps" {
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject" {
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/textBlockPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { TextBlock } from "babylonjs-gui/2D/controls/textBlock";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/stackPanelPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/sliderPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/scrollViewerPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/rectanglePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/radioButtonPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/linePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/inputTextPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { InputText } from "babylonjs-gui/2D/controls/inputText";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/imagePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/imageBasedSliderPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/gridPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/ellipsePropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/controlPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { Control } from "babylonjs-gui/2D/controls/control";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/commonControlPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { Control } from "babylonjs-gui/2D/controls/control";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/colorPickerPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { ColorPicker } from "babylonjs-gui/2D/controls/colorpicker";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/tabs/propertyGrids/gui/checkboxPropertyGridComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/split/splitter" {
import { ControlledSize } from "babylonjs-node-render-graph-editor/split/splitContext";
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
declare module "babylonjs-node-render-graph-editor/split/splitContext" {
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
declare module "babylonjs-node-render-graph-editor/split/splitContainer" {
import { PropsWithChildren } from "react";
import { SplitDirection } from "babylonjs-node-render-graph-editor/split/splitContext";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/typeLedger" {
import { INodeContainer } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeContainer";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
export class TypeLedger {
    static PortDataBuilder: (port: NodePort, nodeContainer: INodeContainer) => IPortData;
    static NodeDataBuilder: (data: any, nodeContainer: INodeContainer) => INodeData;
}

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/tools" {
import { GraphCanvasComponent } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphCanvas";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { NodeLink } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodeLink";
import { FramePortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/types/framePortData";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager" {
import { Vector2 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { Nullable } from "babylonjs/types";
import { FrameNodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { INodeContainer } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeContainer";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
import { ISelectionChangedOptions } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/selectionChangedOptions";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
import { HistoryStack } from "babylonjs-node-render-graph-editor/historyStack";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/searchBox" {
import * as React from "react";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import "babylonjs-node-render-graph-editor/nodeGraphSystem/searchBox.scss";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/propertyLedger" {
import { ComponentClass } from "react";
import { IPropertyComponentProps } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/propertyComponentProps";
export class PropertyLedger {
    static DefaultControl: ComponentClass<IPropertyComponentProps>;
    static RegisteredControls: {
        [key: string]: ComponentClass<IPropertyComponentProps>;
    };
}

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort" {
import { Nullable } from "babylonjs/types";
import { Observer } from "babylonjs/Misc/observable";
import { Vector2 } from "babylonjs/Maths/math.vector";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { ISelectionChangedOptions } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/selectionChangedOptions";
import { FrameNodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort";
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { type IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/nodeLink" {
import { Observable } from "babylonjs/Misc/observable";
import { FrameNodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { GraphCanvasComponent } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphCanvas";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/nodeLedger" {
export class NodeLedger {
    static RegisteredNodeNames: string[];
    static NameFormatter: (name: string) => string;
}

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode" {
import { Nullable } from "babylonjs/types";
import { GraphCanvasComponent } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphCanvas";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { NodeLink } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodeLink";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame" {
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { GraphCanvasComponent } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphCanvas";
import { Nullable } from "babylonjs/types";
import { Observable } from "babylonjs/Misc/observable";
import { Color3 } from "babylonjs/Maths/math.color";
import { FrameNodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort";
import { IFrameData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeLocationInfo";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/graphCanvas" {
import * as React from "react";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { Nullable } from "babylonjs/types";
import { NodeLink } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodeLink";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { IEditorData, IFrameData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeLocationInfo";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
import { INodeContainer } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeContainer";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort" {
import { IDisplayManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager";
import { Observable } from "babylonjs/Misc/observable";
import { Nullable } from "babylonjs/types";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { FramePortPosition } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/displayLedger" {
export class DisplayLedger {
    static RegisteredControls: {
        [key: string]: any;
    };
}

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/automaticProperties" {
import { IEditablePropertyOption } from "babylonjs/Decorators/nodeDecorator";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/types/framePortData" {
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { FrameNodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/frameNodePort";
export type FramePortData = {
    frame: GraphFrame;
    port: FrameNodePort;
};

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/selectionChangedOptions" {
import { Nullable } from "babylonjs/types";
import { GraphFrame } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphFrame";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { NodeLink } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodeLink";
import { NodePort } from "babylonjs-node-render-graph-editor/nodeGraphSystem/nodePort";
import { FramePortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/types/framePortData";
export interface ISelectionChangedOptions {
    selection: Nullable<GraphNode | NodeLink | GraphFrame | NodePort | FramePortData>;
    forceKeepSelection?: boolean;
    marqueeSelection?: boolean;
}

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/propertyComponentProps" {
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
export interface IPropertyComponentProps {
    stateManager: StateManager;
    nodeData: INodeData;
}

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData" {
import { Nullable } from "babylonjs/types";
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeLocationInfo" {
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData" {
import { Nullable } from "babylonjs/types";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
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
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeContainer" {
import { GraphNode } from "babylonjs-node-render-graph-editor/nodeGraphSystem/graphNode";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
export interface INodeContainer {
    nodes: GraphNode[];
    appendNode(data: INodeData): GraphNode;
}

}
declare module "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/displayManager" {
import { Nullable } from "babylonjs/types";
import { StateManager } from "babylonjs-node-render-graph-editor/nodeGraphSystem/stateManager";
import { INodeData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/nodeData";
import { IPortData } from "babylonjs-node-render-graph-editor/nodeGraphSystem/interfaces/portData";
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
declare module "babylonjs-node-render-graph-editor/lines/vector4LineComponent" {
import * as React from "react";
import { Vector4 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/vector3LineComponent" {
import * as React from "react";
import { Vector3 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/vector2LineComponent" {
import * as React from "react";
import { Vector2 } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/valueLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/unitButton" {
interface IUnitButtonProps {
    unit: string;
    locked?: boolean;
    onClick?: (unit: string) => void;
}
export function UnitButton(props: IUnitButtonProps): import("react/jsx-runtime").JSX.Element;
export {};

}
declare module "babylonjs-node-render-graph-editor/lines/textureButtonLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/textLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/textInputLineComponent" {
import { ReactNode, KeyboardEvent } from "react";
import { Component } from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/targetsProxy" {
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
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
declare module "babylonjs-node-render-graph-editor/lines/sliderLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/radioLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/optionsLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
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
declare module "babylonjs-node-render-graph-editor/lines/numericInputComponent" {
import * as React from "react";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/messageLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/matrixLineComponent" {
import * as React from "react";
import { Vector3, Vector4 } from "babylonjs/Maths/math.vector";
import { Matrix } from "babylonjs/Maths/math.vector";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/linkButtonComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/lineWithFileButtonComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/lineContainerComponent" {
import * as React from "react";
import { ISelectedLineContainer } from "babylonjs-node-render-graph-editor/lines/iSelectedLineContainer";
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
declare module "babylonjs-node-render-graph-editor/lines/inputArrowsComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/indentedTextLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/iconComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/iSelectedLineContainer" {
export interface ISelectedLineContainer {
    selectedLineContainerTitles: Array<string>;
    selectedLineContainerTitlesNoFocus: Array<string>;
}

}
declare module "babylonjs-node-render-graph-editor/lines/hexLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/floatLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/fileMultipleButtonLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/fileButtonLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/draggableLineWithButtonComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/draggableLineComponent" {
import { DraggableLineProps } from "babylonjs-node-render-graph-editor/fluent/primitives/draggable";
type DraggableLineComponentProps = Omit<DraggableLineProps, "label">;
export const DraggableLineComponent: React.FunctionComponent<DraggableLineComponentProps>;
export {};

}
declare module "babylonjs-node-render-graph-editor/lines/colorPickerComponent" {
import * as React from "react";
import { Color4, Color3 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/colorLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { Color4 } from "babylonjs/Maths/math.color";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/color4LineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/color3LineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/lines/checkBoxLineComponent" {
import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "babylonjs-node-render-graph-editor/propertyChangedEvent";

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
declare module "babylonjs-node-render-graph-editor/lines/buttonLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/lines/booleanLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/fluent/icons" {









}
declare module "babylonjs-node-render-graph-editor/fluent/primitives/utils" {

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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/uploadButton" {
import { FunctionComponent } from "react";
import { ButtonProps } from "babylonjs-node-render-graph-editor/fluent/primitives/button";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/tooltip" {
import { Nullable } from "babylonjs/index";
import { ReactElement } from "react";
export type TooltipProps = {
    content?: Nullable<string>;
    children: ReactElement;
};
export const Tooltip: import("react").ForwardRefExoticComponent<TooltipProps & import("react").RefAttributes<HTMLElement>>;

}
declare module "babylonjs-node-render-graph-editor/fluent/primitives/toggleButton" {
import { ButtonProps } from "babylonjs-node-render-graph-editor/fluent/primitives/button";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/toast" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/textureSelector" {
import { BaseTexture } from "babylonjs/Materials/Textures/baseTexture";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/entitySelector";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/textarea" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/textInput" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
export type TextInputProps = PrimitiveProps<string> & {
    validator?: (value: string) => boolean;
    validateOnlyOnBlur?: boolean;
};
export const TextInput: FunctionComponent<TextInputProps>;

}
declare module "babylonjs-node-render-graph-editor/fluent/primitives/syncedSlider" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/switch" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
export type SwitchProps = PrimitiveProps<boolean>;
/**
 * This is a primitive fluent boolean switch component whose only knowledge is the shared styling across all tools
 * @param props
 * @returns Switch component
 */
export const Switch: FunctionComponent<SwitchProps>;

}
declare module "babylonjs-node-render-graph-editor/fluent/primitives/spinButton" {
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
export const SpinButton: import("react").ForwardRefExoticComponent<import("babylonjs-node-render-graph-editor/fluent/primitives/primitive").BasePrimitiveProps & {
    value: number;
    infoLabel?: import("babylonjs-node-render-graph-editor/fluent/primitives/infoLabel").InfoLabelParentProps;
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/skeletonSelector" {
import { FunctionComponent } from "react";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { Skeleton } from "babylonjs/Bones/skeleton";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/entitySelector";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/searchBox" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/searchBar" {
type SearchProps = {
    onChange: (val: string) => void;
    placeholder?: string;
};
export const SearchBar: import("react").ForwardRefExoticComponent<SearchProps & import("react").RefAttributes<HTMLInputElement>>;
export {};

}
declare module "babylonjs-node-render-graph-editor/fluent/primitives/primitive" {
import { InfoLabelParentProps } from "babylonjs-node-render-graph-editor/fluent/primitives/infoLabel";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/positionedPopover" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/popover" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/nodeSelector" {
import { FunctionComponent } from "react";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { Node } from "babylonjs/node";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/entitySelector";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/messageBar" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/materialSelector" {
import { FunctionComponent } from "react";
import { Scene } from "babylonjs/scene";
import { Nullable } from "babylonjs/types";
import { Material } from "babylonjs/Materials/material";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { EntitySelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/entitySelector";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/list" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/link" {
import { ImmutablePrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
export const Link: import("react").ForwardRefExoticComponent<import("babylonjs-node-render-graph-editor/fluent/primitives/primitive").BasePrimitiveProps & {
    value: string;
    infoLabel?: import("babylonjs-node-render-graph-editor/fluent/primitives/infoLabel").InfoLabelParentProps;
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/lazyComponent" {

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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/infoLabel" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/gradient" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/entitySelector" {
import { Nullable } from "babylonjs/types";
import { ImmutablePrimitiveProps, PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/dropdown" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/draggable" {
export type DraggableLineProps = {
    format: string;
    data: string;
    tooltip: string;
    label: string;
    onDelete?: () => void;
};
export const DraggableLine: React.FunctionComponent<DraggableLineProps>;

}
declare module "babylonjs-node-render-graph-editor/fluent/primitives/contextMenu" {
import { ReactElement } from "react";


import { BasePrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/comboBox" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/colorPicker" {
import { FunctionComponent } from "react";
import { Color3, Color4 } from "babylonjs/Maths/math.color";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
export type ColorPickerProps<C extends Color3 | Color4> = {
    isLinearMode?: boolean;
} & PrimitiveProps<C>;
export const ColorPickerPopup: import("react").ForwardRefExoticComponent<{
    isLinearMode?: boolean;
} & import("babylonjs-node-render-graph-editor/fluent/primitives/primitive").BasePrimitiveProps & {
    value: Color3 | Color4;
    infoLabel?: import("babylonjs-node-render-graph-editor/fluent/primitives/infoLabel").InfoLabelParentProps;
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/collapse" {
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/checkbox" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
/**
 * This is a primitive fluent checkbox that can both read and write checked state
 * @param props
 * @returns Checkbox component
 */
export const Checkbox: FunctionComponent<PrimitiveProps<boolean>>;

}
declare module "babylonjs-node-render-graph-editor/fluent/primitives/button" {
import { MouseEvent } from "react";

import { BasePrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/primitives/accordion" {
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/textureUpload" {
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/pane" {

import { FunctionComponent, PropsWithChildren } from "react";
export type PaneProps = {
    title: string;
    icon?: any;
};
export const Pane: FunctionComponent<PropsWithChildren<PaneProps>>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/gradientList" {
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/fluentToolWrapper" {
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/fileUploadLine" {
import { FunctionComponent } from "react";
import { ButtonProps } from "babylonjs-node-render-graph-editor/fluent/primitives/button";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/childWindow" {
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/buttonLine" {
import { FunctionComponent } from "react";
import { ButtonProps } from "babylonjs-node-render-graph-editor/fluent/primitives/button";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/vectorPropertyLine" {
import { FunctionComponent } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/textPropertyLine" {
import { ImmutablePrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
/**
 * Wraps text in a property line
 * @param props - PropertyLineProps and TextProps
 * @returns property-line wrapped text
 */
export const TextPropertyLine: FunctionComponent<PropertyLineProps<string> & ImmutablePrimitiveProps<string>>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/textAreaPropertyLine" {
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { TextareaProps } from "babylonjs-node-render-graph-editor/fluent/primitives/textarea";
/**
 * Wraps textarea in a property line
 * @param props - PropertyLineProps and TextProps
 * @returns property-line wrapped text
 */
export const TextAreaPropertyLine: FunctionComponent<PropertyLineProps<string> & TextareaProps>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/syncedSliderPropertyLine" {
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { SyncedSliderProps } from "babylonjs-node-render-graph-editor/fluent/primitives/syncedSlider";
type SyncedSliderPropertyProps = SyncedSliderProps & PropertyLineProps<number>;
/**
 * Renders a simple wrapper around the SyncedSliderInput
 * @param props
 * @returns
 */
export const SyncedSliderPropertyLine: import("react").ForwardRefExoticComponent<SyncedSliderPropertyProps & import("react").RefAttributes<HTMLDivElement>>;
export {};

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/switchPropertyLine" {
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { SwitchProps } from "babylonjs-node-render-graph-editor/fluent/primitives/switch";
/**
 * Wraps a switch in a property line
 * @param props - The properties for the switch and property line
 * @returns A React element representing the property line with a switch
 */
export const SwitchPropertyLine: FunctionComponent<PropertyLineProps<boolean> & SwitchProps>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/stringifiedPropertyLine" {
import { ImmutablePrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/spinButtonPropertyLine" {
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { SpinButtonProps } from "babylonjs-node-render-graph-editor/fluent/primitives/spinButton";
export const SpinButtonPropertyLine: FunctionComponent<PropertyLineProps<number> & SpinButtonProps>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine" {
import { FunctionComponent, HTMLProps, PropsWithChildren } from "react";
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/linkPropertyLine" {
import { LinkProps } from "babylonjs-node-render-graph-editor/fluent/primitives/link";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
/**
 * Wraps a link in a property line
 * @param props - PropertyLineProps and LinkProps
 * @returns property-line wrapped link
 */
export const LinkPropertyLine: FunctionComponent<PropertyLineProps<string> & LinkProps>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/inputPropertyLine" {
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
import { TextInputProps } from "babylonjs-node-render-graph-editor/fluent/primitives/textInput";
import { SpinButtonProps } from "babylonjs-node-render-graph-editor/fluent/primitives/spinButton";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/hexPropertyLine" {
import { FunctionComponent } from "react";
import { NumberInputPropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/inputPropertyLine";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/entitySelectorPropertyLine" {
import { Node } from "babylonjs/node";
import { Nullable } from "babylonjs/types";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { NodeSelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/nodeSelector";
import { MaterialSelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/materialSelector";
import { TextureSelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/textureSelector";
import { SkeletonSelectorProps } from "babylonjs-node-render-graph-editor/fluent/primitives/skeletonSelector";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/dropdownPropertyLine" {
import { AcceptedDropdownValue, DropdownProps } from "babylonjs-node-render-graph-editor/fluent/primitives/dropdown";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
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
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/comboBoxPropertyLine" {
import { FunctionComponent } from "react";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { ComboBoxProps } from "babylonjs-node-render-graph-editor/fluent/primitives/comboBox";
type ComboBoxPropertyLineProps = ComboBoxProps & PropertyLineProps<string>;
/**
 * A property line with a filterable ComboBox
 * @param props - ComboBoxProps & PropertyLineProps
 * @returns property-line wrapped ComboBox component
 */
export const ComboBoxPropertyLine: FunctionComponent<ComboBoxPropertyLineProps>;
export {};

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/colorPropertyLine" {
import { FunctionComponent } from "react";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { Color3 } from "babylonjs/Maths/math.color";
import { Color4 } from "babylonjs/Maths/math.color";
import { ColorPickerProps } from "babylonjs-node-render-graph-editor/fluent/primitives/colorPicker";
export type ColorPropertyLineProps = ColorPickerProps<Color3 | Color4> & PropertyLineProps<Color3 | Color4>;
export const Color3PropertyLine: FunctionComponent<ColorPickerProps<Color3> & PropertyLineProps<Color3>>;
export const Color4PropertyLine: FunctionComponent<ColorPickerProps<Color4> & PropertyLineProps<Color4>>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/checkboxPropertyLine" {
import { PrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
import { FunctionComponent } from "react";
/**
 * Wraps a checkbox in a property line
 * @param props - PropertyLineProps and CheckboxProps
 * @returns property-line wrapped checkbox
 */
export const CheckboxPropertyLine: FunctionComponent<PropertyLineProps<boolean> & PrimitiveProps<boolean>>;

}
declare module "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/booleanBadgePropertyLine" {
import { FunctionComponent } from "react";
import { ImmutablePrimitiveProps } from "babylonjs-node-render-graph-editor/fluent/primitives/primitive";
import { PropertyLineProps } from "babylonjs-node-render-graph-editor/fluent/hoc/propertyLines/propertyLine";
/**
 * Displays an icon indicating enabled (green check) or disabled (red cross) state
 * @param props - The properties for the PropertyLine, including the boolean value to display.
 * @returns A PropertyLine component with a PresenceBadge indicating the boolean state.
 */
export const BooleanBadgePropertyLine: FunctionComponent<PropertyLineProps<boolean> & ImmutablePrimitiveProps<boolean>>;

}
declare module "babylonjs-node-render-graph-editor/components/propertyTabComponentBase" {
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
declare module "babylonjs-node-render-graph-editor/components/classNames" {
export function ClassNames(names: any, styleObject: any): string;
export function JoinClassNames(styleObject: any, ...names: string[]): string;

}
declare module "babylonjs-node-render-graph-editor/components/Toggle" {
export type ToggleProps = {
    toggled: "on" | "mixed" | "off";
    onToggle?: () => void;
    padded?: boolean;
    color?: "dark" | "light";
};
export const Toggle: React.FC<ToggleProps>;

}
declare module "babylonjs-node-render-graph-editor/components/TextInputWithSubmit" {
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
declare module "babylonjs-node-render-graph-editor/components/MessageDialog" {
import * as React from "react";
export interface MessageDialogProps {
    message: string;
    isError: boolean;
    onClose?: () => void;
}
export const MessageDialog: React.FC<MessageDialogProps>;

}
declare module "babylonjs-node-render-graph-editor/components/Label" {
import { ReactChild } from "react";
export type LabelProps = {
    text: string;
    children?: ReactChild;
    color?: "dark" | "light";
};
export const Label: React.FC<LabelProps>;

}
declare module "babylonjs-node-render-graph-editor/components/Icon" {
export type IconProps = {
    color?: "dark" | "light";
    icon: string;
};
export const Icon: React.FC<IconProps>;

}
declare module "babylonjs-node-render-graph-editor/components/Button" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/useGraphContext" {
/**
 * utility hook to assist using the graph context
 * @returns
 */
export const useGraphContext: () => import("babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphContextManager").IGraphContext;

}
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/NodeRenderer" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphNodesContainer" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphNode" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphLinesContainer" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphLine" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphContextManager" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphContainer" {
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
declare module "babylonjs-node-render-graph-editor/components/reactGraphSystem/GraphConnectorHandle" {
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
declare module "babylonjs-node-render-graph-editor/components/lines/OptionsLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/components/lines/NumericInputComponent" {
import * as React from "react";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/components/lines/FileButtonLineComponent" {
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
declare module "babylonjs-node-render-graph-editor/components/lines/ColorPickerLineComponent" {
import * as React from "react";
import { Color4, Color3 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/components/layout/utils" {
import { Layout, LayoutColumn, LayoutTabsRow } from "babylonjs-node-render-graph-editor/components/layout/types";
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
declare module "babylonjs-node-render-graph-editor/components/layout/types" {
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
declare module "babylonjs-node-render-graph-editor/components/layout/LayoutContext" {
import { Layout } from "babylonjs-node-render-graph-editor/components/layout/types";
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleTabsContainer" {
import { FC } from "react";
import { LayoutTab } from "babylonjs-node-render-graph-editor/components/layout/types";
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleTab" {
import { FC } from "react";
import { TabDrag } from "babylonjs-node-render-graph-editor/components/layout/types";
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleResizeBar" {
import { FC } from "react";
import { ResizeDirections } from "babylonjs-node-render-graph-editor/components/layout/types";
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleGridLayout" {
import { FC } from "react";
import { Layout } from "babylonjs-node-render-graph-editor/components/layout/types";
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleGridContainer" {
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleDropZone" {
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleDragHandler" {
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
declare module "babylonjs-node-render-graph-editor/components/layout/FlexibleColumn" {
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
declare module "babylonjs-node-render-graph-editor/components/layout/DraggableIcon" {
import { FC } from "react";
import { ElementTypes, TabDrag } from "babylonjs-node-render-graph-editor/components/layout/types";
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
declare module "babylonjs-node-render-graph-editor/components/colorPicker/HexColor" {
import * as React from "react";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/components/colorPicker/ColorPicker" {
import * as React from "react";
import { Color3, Color4 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/components/colorPicker/ColorComponentEntry" {
import * as React from "react";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/components/bars/CommandDropdownComponent" {
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
declare module "babylonjs-node-render-graph-editor/components/bars/CommandButtonComponent" {
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
declare module "babylonjs-node-render-graph-editor/components/bars/CommandBarComponent" {
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
declare module "babylonjs-node-render-graph-editor/colorPicker/hexColor" {
import * as React from "react";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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
declare module "babylonjs-node-render-graph-editor/colorPicker/colorPicker" {
import * as React from "react";
import { Color3, Color4 } from "babylonjs/Maths/math.color";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
import "babylonjs-node-render-graph-editor/colorPicker/colorPicker.scss";
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
declare module "babylonjs-node-render-graph-editor/colorPicker/colorComponentEntry" {
import * as React from "react";
import { LockObject } from "babylonjs-node-render-graph-editor/tabs/propertyGrids/lockObject";
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

declare module "babylonjs-node-render-graph-editor" {
    export * from "babylonjs-node-render-graph-editor/legacy/legacy";
}


declare module BABYLON.NodeRenderGraphEditor {
    export class SerializationTools {
        static UpdateLocations(renderGraph: BABYLON.NodeRenderGraph, globalState: GlobalState, frame?: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame>): void;
        static Serialize(renderGraph: BABYLON.NodeRenderGraph, globalState: GlobalState, frame?: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame>): string;
        static Deserialize(serializationObject: any, globalState: GlobalState): void;
        static AddFrameToRenderGraph(serializationObject: any, globalState: GlobalState, currentRenderGraph: BABYLON.NodeRenderGraph): void;
    }


    interface IPortalProps {
        globalState: GlobalState;
    }
    export class Portal extends React.Component<React.PropsWithChildren<IPortalProps>> {
        render(): React.ReactPortal;
    }


    /**
     * Interface used to specify creation options for the node editor
     */
    export interface INodeEditorOptions {
        nodeRenderGraph: BABYLON.NodeRenderGraph;
        hostScene?: BABYLON.Scene;
        hostElement?: HTMLElement;
        customSave?: {
            label: string;
            action: (data: string) => Promise<void>;
        };
        customLoadObservable?: BABYLON.Observable<any>;
        customBlockDescriptions?: BABYLON.INodeRenderGraphCustomBlockDescription[];
    }
    /**
     * Class used to create a node editor
     */
    export class NodeRenderGraphEditor {
        private static _CurrentState;
        private static _PopupWindow;
        /**
         * Show the node editor
         * @param options defines the options to use to configure the node editor
         */
        static Show(options: INodeEditorOptions): void;
    }




    interface IGraphEditorProps {
        globalState: GlobalState;
    }
    interface IGraphEditorState {
        showPreviewPopUp: boolean;
        message: string;
        isError: boolean;
    }
    interface IInternalPreviewAreaOptions extends BABYLON.IInspectorOptions {
        popup: boolean;
        original: boolean;
        explorerWidth?: string;
        inspectorWidth?: string;
        embedHostWidth?: string;
    }
    export class GraphEditor extends React.Component<IGraphEditorProps, IGraphEditorState> {
        private _graphCanvasRef;
        private _diagramContainerRef;
        private _graphCanvas;
        private _previewManager;
        private _mouseLocationX;
        private _mouseLocationY;
        private _onWidgetKeyUpPointer;
        private _historyStack;
        private _previewHost;
        private _popUpWindow;
        private _externalTextures;
        appendBlock(dataToAppend: BABYLON.NodeRenderGraphBlock | BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, recursion?: boolean): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        addValueNode(type: string): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        prepareHistoryStack(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        constructor(props: IGraphEditorProps);
        zoomToFit(): void;
        private _setExternalInputs;
        buildRenderGraphAsync(): Promise<void>;
        build(ignoreEditorData?: boolean): void;
        loadGraph(): void;
        showWaitScreen(): void;
        hideWaitScreen(): void;
        reOrganize(editorData?: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IEditorData>, isImportingAFrame?: boolean): void;
        onWheel: (evt: WheelEvent) => void;
        emitNewBlock(blockType: string, targetX: number, targetY: number): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode | undefined;
        dropNewBlock(event: React.DragEvent<HTMLDivElement>): void;
        handlePopUp: () => void;
        handleClosingPopUp: () => void;
        initiatePreviewArea: (canvas?: HTMLCanvasElement) => void;
        createPopUp: () => void;
        createPreviewMeshControlHostAsync: (options: IInternalPreviewAreaOptions, parentControl: BABYLON.Nullable<HTMLElement>) => Promise<unknown>;
        createPreviewHostAsync: (options: IInternalPreviewAreaOptions, parentControl: BABYLON.Nullable<HTMLElement>) => Promise<unknown>;
        fixPopUpStyles: (document: Document) => void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class GlobalState {
        hostElement: HTMLElement;
        hostDocument: Document;
        hostWindow: Window;
        hostScene?: BABYLON.Scene;
        stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
        onClearUndoStack: BABYLON.Observable<void>;
        onBuiltObservable: BABYLON.Observable<void>;
        onResetRequiredObservable: BABYLON.Observable<boolean>;
        onZoomToFitRequiredObservable: BABYLON.Observable<void>;
        onReOrganizedRequiredObservable: BABYLON.Observable<void>;
        onLogRequiredObservable: BABYLON.Observable<LogEntry>;
        onIsLoadingChanged: BABYLON.Observable<boolean>;
        onLightUpdated: BABYLON.Observable<void>;
        onFrame: BABYLON.Observable<void>;
        onAnimationCommandActivated: BABYLON.Observable<void>;
        onImportFrameObservable: BABYLON.Observable<any>;
        onPopupClosedObservable: BABYLON.Observable<void>;
        onGetNodeFromBlock: (block: BABYLON.NodeRenderGraphBlock) => BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        onDropEventReceivedObservable: BABYLON.Observable<DragEvent>;
        previewType: PreviewType;
        previewFile: File;
        envType: PreviewType;
        envFile: File;
        listOfCustomPreviewFiles: File[];
        rotatePreview: boolean;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        hemisphericLight: boolean;
        directionalLight0: boolean;
        directionalLight1: boolean;
        pointerOverCanvas: boolean;
        onRefreshPreviewMeshControlComponentRequiredObservable: BABYLON.Observable<void>;
        filesInput: BABYLON.FilesInput;
        scene: BABYLON.Scene;
        noAutoFillExternalInputs: boolean;
        _engine: number;
        customSave?: {
            label: string;
            action: (data: string) => Promise<void>;
        };
        customBlockDescriptions?: BABYLON.INodeRenderGraphCustomBlockDescription[];
        private _nodeRenderGraph;
        /**
         * Gets the current node render graph
         */
        get nodeRenderGraph(): BABYLON.NodeRenderGraph;
        /**
         * Sets the current node material
         */
        set nodeRenderGraph(nodeRenderGraph: BABYLON.NodeRenderGraph);
        /** Gets the engine */
        get engine(): number;
        /** Sets the engine */
        set engine(e: number);
        constructor(scene: BABYLON.Scene);
        storeEditorData(serializationObject: any, frame?: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame>): void;
    }


    /**
     * Static class for BlockTools
     */
    export class BlockTools {
        static GetBlockFromString(data: string, frameGraph: BABYLON.FrameGraph, scene: BABYLON.Scene): BABYLON.NodeRenderGraphTeleportInBlock | BABYLON.NodeRenderGraphTeleportOutBlock | BABYLON.NodeRenderGraphOutputBlock | BABYLON.NodeRenderGraphElbowBlock | BABYLON.NodeRenderGraphResourceContainerBlock | BABYLON.NodeRenderGraphExecuteBlock | BABYLON.NodeRenderGraphUtilityLayerRendererBlock | BABYLON.NodeRenderGraphInputBlock | BABYLON.NodeRenderGraphClearBlock | BABYLON.NodeRenderGraphCopyTextureBlock | BABYLON.NodeRenderGraphGenerateMipmapsBlock | BABYLON.NodeRenderGraphBlackAndWhitePostProcessBlock | BABYLON.NodeRenderGraphBloomPostProcessBlock | BABYLON.NodeRenderGraphBlurPostProcessBlock | BABYLON.NodeRenderGraphPassPostProcessBlock | BABYLON.NodeRenderGraphPassCubePostProcessBlock | BABYLON.GUI.NodeRenderGraphGUIBlock | BABYLON.NodeRenderGraphObjectRendererBlock | BABYLON.NodeRenderGraphGeometryRendererBlock | BABYLON.NodeRenderGraphTAAPostProcessBlock | BABYLON.NodeRenderGraphCullObjectsBlock | BABYLON.NodeRenderGraphCircleOfConfusionPostProcessBlock | BABYLON.NodeRenderGraphDepthOfFieldPostProcessBlock | BABYLON.NodeRenderGraphExtractHighlightsPostProcessBlock | BABYLON.NodeRenderGraphShadowGeneratorBlock | BABYLON.NodeRenderGraphCascadedShadowGeneratorBlock | BABYLON.NodeRenderGraphGlowLayerBlock | BABYLON.NodeRenderGraphHighlightLayerBlock | BABYLON.NodeRenderGraphSSRPostProcessBlock | BABYLON.NodeRenderGraphAnaglyphPostProcessBlock | BABYLON.NodeRenderGraphChromaticAberrationPostProcessBlock | BABYLON.NodeRenderGraphImageProcessingPostProcessBlock | BABYLON.NodeRenderGraphFXAAPostProcessBlock | BABYLON.NodeRenderGraphGrainPostProcessBlock | BABYLON.NodeRenderGraphMotionBlurPostProcessBlock | BABYLON.NodeRenderGraphConvolutionPostProcessBlock | BABYLON.NodeRenderGraphSharpenPostProcessBlock | BABYLON.NodeRenderGraphScreenSpaceCurvaturePostProcessBlock | BABYLON.NodeRenderGraphColorCorrectionPostProcessBlock | BABYLON.NodeRenderGraphFilterPostProcessBlock | BABYLON.NodeRenderGraphTonemapPostProcessBlock | BABYLON.NodeRenderGraphSSAO2PostProcessBlock | BABYLON.NodeRenderGraphComputeShaderBlock | BABYLON.NodeRenderGraphVolumetricLightingBlock | BABYLON.NodeRenderGraphLightingVolumeBlock | null;
        static GetColorFromConnectionNodeType(type: BABYLON.NodeRenderGraphBlockConnectionPointTypes): string;
        static GetConnectionNodeTypeFromString(type: string): BABYLON.NodeRenderGraphBlockConnectionPointTypes.Texture | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureBackBuffer | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureBackBufferDepthStencilAttachment | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureDepthStencilAttachment | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureViewDepth | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureViewNormal | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureAlbedo | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureReflectivity | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureWorldPosition | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureVelocity | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureScreenDepth | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureWorldNormal | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureLocalPosition | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureLinearVelocity | BABYLON.NodeRenderGraphBlockConnectionPointTypes.TextureNormalizedViewDepth | BABYLON.NodeRenderGraphBlockConnectionPointTypes.ResourceContainer | BABYLON.NodeRenderGraphBlockConnectionPointTypes.ShadowGenerator | BABYLON.NodeRenderGraphBlockConnectionPointTypes.ShadowLight | BABYLON.NodeRenderGraphBlockConnectionPointTypes.Camera | BABYLON.NodeRenderGraphBlockConnectionPointTypes.ObjectList | BABYLON.NodeRenderGraphBlockConnectionPointTypes.AutoDetect;
        static GetStringFromConnectionNodeType(type: BABYLON.NodeRenderGraphBlockConnectionPointTypes): "" | "Texture" | "Camera" | "TextureBackBuffer" | "TextureBackBufferDepthStencilAttachment" | "TextureDepthStencilAttachment" | "ObjectList" | "TextureViewDepth" | "TextureNormalizedViewDepth" | "TextureNormal" | "TextureAlbedo" | "TextureReflectivity" | "TexturePosition" | "TextureVelocity" | "TextureScreenDepth" | "TextureLocalPosition" | "TextureWorldNormal" | "TextureLinearVelocity" | "ResourceContainer" | "ShadowGenerator" | "ShadowLight";
    }


    interface ITextureLineComponentProps {
        texture: BABYLON.BaseTexture;
        width: number;
        height: number;
        globalState?: any;
        hideChannelSelect?: boolean;
    }
    export interface ITextureLineComponentState {
        displayRed: boolean;
        displayGreen: boolean;
        displayBlue: boolean;
        displayAlpha: boolean;
        face: number;
    }
    export class TextureLineComponent extends React.Component<ITextureLineComponentProps, ITextureLineComponentState> {
        private _canvasRef;
        constructor(props: ITextureLineComponentProps);
        shouldComponentUpdate(): boolean;
        componentDidMount(): void;
        componentDidUpdate(): void;
        updatePreview(): void;
        static UpdatePreview(previewCanvas: HTMLCanvasElement, texture: BABYLON.BaseTexture, width: number, options: ITextureLineComponentState, onReady?: () => void, globalState?: any): Promise<void>;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ILineWithFileButtonComponentProps {
        title: string;
        closed?: boolean;
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
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ILineContainerComponentProps {
        title: string;
        children: any[] | any;
        closed?: boolean;
    }
    export class LineContainerComponent extends React.Component<ILineContainerComponentProps, {
        isExpanded: boolean;
    }> {
        constructor(props: ILineContainerComponentProps);
        switchExpandedState(): void;
        renderHeader(): import("react/jsx-runtime").JSX.Element;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFileButtonLineComponentProps {
        label: string;
        onClick: (file: File) => void;
        accept: string;
        uploadName?: string;
    }
    export class FileButtonLineComponent extends React.Component<IFileButtonLineComponentProps> {
        private _uploadRef;
        constructor(props: IFileButtonLineComponentProps);
        onChange(evt: any): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IDraggableLineWithButtonComponent {
        data: string;
        tooltip: string;
        iconImage: any;
        onIconClick: (value: string) => void;
        iconTitle: string;
        lenSuffixToRemove?: number;
    }
    export class DraggableLineWithButtonComponent extends React.Component<IDraggableLineWithButtonComponent> {
        constructor(props: IDraggableLineWithButtonComponent);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IButtonLineComponentProps {
        data: string;
        tooltip: string;
    }
    export class DraggableLineComponent extends React.Component<IButtonLineComponentProps> {
        constructor(props: IButtonLineComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface ICheckBoxLineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        isSelected?: () => boolean;
        onSelect?: (value: boolean) => void;
        onValueChanged?: () => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        disabled?: boolean;
        extractValue?: (target: any) => boolean;
    }
    export class CheckBoxLineComponent extends React.Component<ICheckBoxLineComponentProps, {
        isSelected: boolean;
        isDisabled?: boolean;
    }> {
        private static _UniqueIdSeed;
        private _uniqueId;
        private _localChange;
        constructor(props: ICheckBoxLineComponentProps);
        shouldComponentUpdate(nextProps: ICheckBoxLineComponentProps, nextState: {
            isSelected: boolean;
            isDisabled: boolean;
        }): boolean;
        onChange(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export const RegisterTypeLedger: () => void;


    export const RegisterToPropertyTabManagers: () => void;


    export const RegisterToDisplayManagers: () => void;


    export const RegisterNodePortDesign: (stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager) => void;


    export const RegisterExportData: (stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager) => void;


    export const RegisterElbowSupport: (stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager) => void;


    export const RegisterDefaultInput: (stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager) => void;


    export const RegisterDebugSupport: (stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager) => void;


    export class ConnectionPointPortData implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData {
        private _connectedPort;
        private _nodeContainer;
        data: BABYLON.NodeRenderGraphConnectionPoint;
        get name(): string;
        get internalName(): string;
        get isExposedOnFrame(): boolean;
        set isExposedOnFrame(value: boolean);
        get exposedPortPosition(): number;
        set exposedPortPosition(value: number);
        get isConnected(): boolean;
        get isInactive(): boolean;
        get connectedPort(): BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData>;
        set connectedPort(value: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData>);
        get direction(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.PortDataDirection;
        get ownerData(): BABYLON.NodeRenderGraphBlock;
        get needDualDirectionValidation(): boolean;
        get hasEndpoints(): boolean;
        get endpoints(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData[];
        constructor(connectionPoint: BABYLON.NodeRenderGraphConnectionPoint, nodeContainer: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeContainer);
        updateDisplayName(newName: string): void;
        connectTo(port: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): void;
        canConnectTo(port: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): boolean;
        disconnectFrom(port: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): void;
        checkCompatibilityState(port: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): 0 | BABYLON.NodeRenderGraphConnectionPointCompatibilityStates.TypeIncompatible | BABYLON.NodeRenderGraphConnectionPointCompatibilityStates.HierarchyIssue;
        getCompatibilityIssueMessage(issue: number, targetNode: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, targetPort: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): string;
    }


    export class BlockNodeData implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData {
        data: BABYLON.NodeRenderGraphBlock;
        private _inputs;
        private _outputs;
        private _onBuildObserver;
        /**
         * Gets or sets a callback used to call node visual refresh
         */
        refreshCallback?: () => void;
        get uniqueId(): number;
        get name(): string;
        getClassName(): string;
        get isInput(): boolean;
        get inputs(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData[];
        get outputs(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData[];
        get comments(): string;
        set comments(value: string);
        get executionTime(): number;
        getPortByName(name: string): BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData | null;
        isConnectedToOutput(): boolean;
        dispose(): void;
        prepareHeaderIcon(iconDiv: HTMLDivElement, img: HTMLImageElement): void;
        get invisibleEndpoints(): BABYLON.NodeRenderGraphTeleportOutBlock[] | null;
        constructor(data: BABYLON.NodeRenderGraphBlock, nodeContainer: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeContainer);
    }


    export class TeleportOutPropertyTabComponent extends React.Component<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps> {
        private _onUpdateRequiredObserver;
        constructor(props: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IFrameNodePortPropertyTabComponentProps {
        stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
        nodePort: BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort;
    }
    export class NodePortPropertyTabComponent extends React.Component<IFrameNodePortPropertyTabComponentProps> {
        constructor(props: IFrameNodePortPropertyTabComponentProps);
        toggleExposeOnFrame(value: boolean): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class InputPropertyTabComponent extends React.Component<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps> {
        private _onValueChangedObserver;
        constructor(props: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        renderValue(_globalState: GlobalState): import("react/jsx-runtime").JSX.Element | null;
        setDefaultValue(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export var samplingModeList: {
        label: string;
        value: number;
    }[];
    export var textureFormatList: {
        label: string;
        value: number;
    }[];
    export var textureTypeList: {
        label: string;
        value: number;
    }[];
    export var textureDepthStencilFormatList: {
        label: string;
        value: number;
    }[];
    export var TextureTargetTypeList: {
        label: string;
        value: number;
    }[];
    export class GenericPropertyComponent extends React.Component<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }
    export class GeneralPropertyTabComponent extends React.Component<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }
    export class GenericPropertyTabComponent extends React.Component<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IFramePropertyTabComponentProps {
        globalState: GlobalState;
        frame: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame;
    }
    export class FramePropertyTabComponent extends React.Component<IFramePropertyTabComponentProps> {
        private _onFrameExpandStateChangedObserver;
        constructor(props: IFramePropertyTabComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IFrameNodePortPropertyTabComponentProps {
        stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
        globalState: GlobalState;
        frameNodePort: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort;
        frame: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame;
    }
    export class FrameNodePortPropertyTabComponent extends React.Component<IFrameNodePortPropertyTabComponentProps, {
        port: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort;
    }> {
        private _onFramePortPositionChangedObserver;
        private _onSelectionChangedObserver;
        constructor(props: IFrameNodePortPropertyTabComponentProps);
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class TextureDisplayManager implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(): string;
        updatePreviewContent(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
    }


    export class TeleportOutDisplayManager implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager {
        private _hasHighlights;
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        onSelectionChanged(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData>, manager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager): void;
        onDispose(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, manager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager): void;
    }


    export class TeleportInDisplayManager implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager {
        private _hasHighlights;
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        onSelectionChanged(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData>, manager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager): void;
        onDispose(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, manager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager): void;
    }


    export class PostProcessDisplayManager implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(): string;
        updatePreviewContent(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
    }


    export class OutputDisplayManager implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(): string;
        updatePreviewContent(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
    }


    export class InputDisplayManager implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(_nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getHeaderText(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        shouldDisplayPortLabels(): boolean;
        static GetBaseType(type: BABYLON.NodeRenderGraphBlockConnectionPointTypes): string;
        getBackgroundColor(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
    }


    export class ElbowDisplayManager implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(_nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, _contentArea: HTMLDivElement): void;
        updateFullVisualContent(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, visualContent: BABYLON.NodeRenderGraphEditor.SharedUIComponents.VisualContentDescription): void;
    }


    interface ITextureMemoryUsagePropertyTabComponentProps {
        globalState: GlobalState;
    }
    export class TextureMemoryUsagePropertyTabComponent extends React.Component<ITextureMemoryUsagePropertyTabComponentProps> {
        constructor(props: ITextureMemoryUsagePropertyTabComponentProps);
        private _formatMemorySize;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IPropertyTabComponentProps {
        globalState: GlobalState;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
    }
    interface IPropertyTabComponentState {
        currentNode: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>;
        currentFrame: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame>;
        currentFrameNodePort: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort>;
        currentNodePort: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort>;
        uploadInProgress: boolean;
    }
    export class PropertyTabComponent extends React.Component<IPropertyTabComponentProps, IPropertyTabComponentState> {
        private _onBuiltObserver;
        constructor(props: IPropertyTabComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        load(file: File): void;
        loadFrame(file: File): void;
        save(): void;
        customSave(): void;
        saveToSnippetServer(): void;
        loadFromSnippet(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export enum PreviewType {
        Sphere = 0,
        Box = 1,
        Cylinder = 2,
        Plane = 3,
        ShaderBall = 4,
        Custom = 5,
        Room = 6
    }


    interface IPreviewMeshControlComponent {
        globalState: GlobalState;
        togglePreviewAreaComponent: () => void;
        onMounted?: () => void;
    }
    export class PreviewMeshControlComponent extends React.Component<IPreviewMeshControlComponent> {
        private _filePickerRef;
        private _envPickerRef;
        private _onResetRequiredObserver;
        private _onDropEventObserver;
        private _onRefreshPreviewMeshControlComponentRequiredObserver;
        constructor(props: IPreviewMeshControlComponent);
        componentWillUnmount(): void;
        componentDidMount(): void;
        changeMeshType(newOne: PreviewType): void;
        useCustomMesh(evt: any): void;
        useCustomEnv(evt: any): void;
        onPopUp(): void;
        frame(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class PreviewManager {
        private _nodeRenderGraph;
        private _onFrameObserver;
        private _onPreviewCommandActivatedObserver;
        private _onUpdateRequiredObserver;
        private _onRebuildRequiredObserver;
        private _onImportFrameObserver;
        private _onResetRequiredObserver;
        private _onLightUpdatedObserver;
        private _engine;
        private _scene;
        private _globalState;
        private _currentType;
        private _lightParent;
        private _hdrTexture;
        private _dummyExternalTexture;
        constructor(targetCanvas: HTMLCanvasElement, globalState: GlobalState);
        private _initAsync;
        private _initSceneAsync;
        private _reset;
        private _prepareLights;
        private _createNodeRenderGraph;
        private _getMesh;
        private _buildGraphAsync;
        private _frameCamera;
        private _prepareBackgroundHDR;
        private _prepareScene;
        static DefaultEnvironmentURL: string;
        private _refreshPreviewMesh;
        dispose(): void;
    }


    interface IPreviewAreaComponentProps {
        globalState: GlobalState;
        onMounted?: () => void;
    }
    export class PreviewAreaComponent extends React.Component<IPreviewAreaComponentProps, {
        isLoading: boolean;
    }> {
        private _onIsLoadingChangedObserver;
        private _onResetRequiredObserver;
        constructor(props: IPreviewAreaComponentProps);
        componentWillUnmount(): void;
        componentDidMount(): void;
        _onPointerOverCanvas: () => void;
        _onPointerOutCanvas: () => void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface INodeListComponentProps {
        globalState: GlobalState;
    }
    export class NodeListComponent extends React.Component<INodeListComponentProps, {
        filter: string;
    }> {
        private _onResetRequiredObserver;
        private static _Tooltips;
        private _customFrameList;
        constructor(props: INodeListComponentProps);
        componentWillUnmount(): void;
        filterContent(filter: string): void;
        loadCustomFrame(file: File): void;
        removeItem(value: string): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface ILogComponentProps {
        globalState: GlobalState;
    }
    export class LogEntry {
        message: string;
        isError: boolean;
        time: Date;
        constructor(message: string, isError: boolean);
    }
    export class LogComponent extends React.Component<ILogComponentProps, {
        logs: LogEntry[];
    }> {
        private _logConsoleRef;
        constructor(props: ILogComponentProps);
        componentDidMount(): void;
        componentDidUpdate(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class PropertyChangedEvent {
        object: any;
        property: string;
        value: any;
        initialValue: any;
        allowNullValue?: boolean;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export function copyCommandToClipboard(strCommand: string): void;
    export function getClassNameWithNamespace(obj: any): {
        className: string;
        babylonNamespace: string;
    };



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface ITextBlockPropertyGridComponentProps {
        textBlock: BABYLON.GUI.TextBlock;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class TextBlockPropertyGridComponent extends React.Component<ITextBlockPropertyGridComponentProps> {
        constructor(props: ITextBlockPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IStackPanelPropertyGridComponentProps {
        stackPanel: BABYLON.GUI.StackPanel;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class StackPanelPropertyGridComponent extends React.Component<IStackPanelPropertyGridComponentProps> {
        constructor(props: IStackPanelPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface ISliderPropertyGridComponentProps {
        slider: BABYLON.GUI.Slider;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class SliderPropertyGridComponent extends React.Component<ISliderPropertyGridComponentProps> {
        constructor(props: ISliderPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IScrollViewerPropertyGridComponentProps {
        scrollViewer: BABYLON.GUI.ScrollViewer;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ScrollViewerPropertyGridComponent extends React.Component<IScrollViewerPropertyGridComponentProps> {
        constructor(props: IScrollViewerPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IRectanglePropertyGridComponentProps {
        rectangle: BABYLON.GUI.Rectangle;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class RectanglePropertyGridComponent extends React.Component<IRectanglePropertyGridComponentProps> {
        constructor(props: IRectanglePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IRadioButtonPropertyGridComponentProps {
        radioButtons: BABYLON.GUI.RadioButton[];
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class RadioButtonPropertyGridComponent extends React.Component<IRadioButtonPropertyGridComponentProps> {
        constructor(props: IRadioButtonPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface ILinePropertyGridComponentProps {
        line: BABYLON.GUI.Line;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class LinePropertyGridComponent extends React.Component<ILinePropertyGridComponentProps> {
        constructor(props: ILinePropertyGridComponentProps);
        onDashChange(value: string): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IInputTextPropertyGridComponentProps {
        inputText: BABYLON.GUI.InputText;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class InputTextPropertyGridComponent extends React.Component<IInputTextPropertyGridComponentProps> {
        constructor(props: IInputTextPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IImagePropertyGridComponentProps {
        image: BABYLON.GUI.Image;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ImagePropertyGridComponent extends React.Component<IImagePropertyGridComponentProps> {
        constructor(props: IImagePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IImageBasedSliderPropertyGridComponentProps {
        imageBasedSlider: BABYLON.GUI.ImageBasedSlider;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ImageBasedSliderPropertyGridComponent extends React.Component<IImageBasedSliderPropertyGridComponentProps> {
        constructor(props: IImageBasedSliderPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IGridPropertyGridComponentProps {
        grid: BABYLON.GUI.Grid;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class GridPropertyGridComponent extends React.Component<IGridPropertyGridComponentProps> {
        constructor(props: IGridPropertyGridComponentProps);
        renderRows(): import("react/jsx-runtime").JSX.Element[];
        renderColumns(): import("react/jsx-runtime").JSX.Element[];
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IEllipsePropertyGridComponentProps {
        ellipse: BABYLON.GUI.Ellipse;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class EllipsePropertyGridComponent extends React.Component<IEllipsePropertyGridComponentProps> {
        constructor(props: IEllipsePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IControlPropertyGridComponentProps {
        control: BABYLON.GUI.Control;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ControlPropertyGridComponent extends React.Component<IControlPropertyGridComponentProps> {
        constructor(props: IControlPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface ICommonControlPropertyGridComponentProps {
        controls?: BABYLON.GUI.Control[];
        control?: BABYLON.GUI.Control;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class CommonControlPropertyGridComponent extends React.Component<ICommonControlPropertyGridComponentProps> {
        constructor(props: ICommonControlPropertyGridComponentProps);
        renderGridInformation(control: BABYLON.GUI.Control): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element | undefined;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IColorPickerPropertyGridComponentProps {
        colorPicker: BABYLON.GUI.ColorPicker;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ColorPickerPropertyGridComponent extends React.Component<IColorPickerPropertyGridComponentProps> {
        constructor(props: IColorPickerPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface ICheckboxPropertyGridComponentProps {
        checkbox: BABYLON.GUI.Checkbox;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class CheckboxPropertyGridComponent extends React.Component<ICheckboxPropertyGridComponentProps> {
        constructor(props: ICheckboxPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        controlledSide: BABYLON.NodeRenderGraphEditor.SharedUIComponents.ControlledSize;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        direction: BABYLON.NodeRenderGraphEditor.SharedUIComponents.SplitDirection;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class TypeLedger {
        static PortDataBuilder: (port: BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort, nodeContainer: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeContainer) => BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData;
        static NodeDataBuilder: (data: any, nodeContainer: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeContainer) => BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export const IsFramePortData: (variableToCheck: any) => variableToCheck is BABYLON.NodeRenderGraphEditor.SharedUIComponents.FramePortData;
    export const RefreshNode: (node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, visitedNodes?: Set<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>, visitedLinks?: Set<BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink>, canvas?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphCanvasComponent) => void;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class StateManager {
        data: any;
        hostDocument: Document;
        lockObject: any;
        modalIsDisplayed: boolean;
        historyStack: BABYLON.NodeRenderGraphEditor.SharedUIComponents.HistoryStack;
        activeNode: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>;
        onSearchBoxRequiredObservable: BABYLON.Observable<{
            x: number;
            y: number;
        }>;
        onSelectionChangedObservable: BABYLON.Observable<BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ISelectionChangedOptions>>;
        onFrameCreatedObservable: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame>;
        onUpdateRequiredObservable: BABYLON.Observable<any>;
        onGraphNodeRemovalObservable: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>;
        onSelectionBoxMoved: BABYLON.Observable<ClientRect | DOMRect>;
        onCandidateLinkMoved: BABYLON.Observable<BABYLON.Nullable<BABYLON.Vector2>>;
        onCandidatePortSelectedObservable: BABYLON.Observable<BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort>>;
        onNewNodeCreatedObservable: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>;
        onRebuildRequiredObservable: BABYLON.Observable<void>;
        onNodeMovedObservable: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>;
        onErrorMessageDialogRequiredObservable: BABYLON.Observable<string>;
        onExposePortOnFrameObservable: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>;
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
        exportData: (data: any, frame?: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame>) => string;
        isElbowConnectionAllowed: (nodeA: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort, nodeB: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort) => boolean;
        isDebugConnectionAllowed: (nodeA: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort, nodeB: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort) => boolean;
        applyNodePortDesign: (data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData, element: HTMLElement, imgHost: HTMLImageElement, pip: HTMLDivElement) => boolean;
        getPortColor: (portData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData) => string;
        storeEditorData: (serializationObject: any, frame?: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame>) => void;
        getEditorDataMap: () => {
            [key: number]: number;
        };
        getScene?: () => BABYLON.Scene;
        createDefaultInputData: (rootData: any, portData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData, nodeContainer: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeContainer) => BABYLON.Nullable<{
            data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData;
            name: string;
        }>;
        private _isRebuildQueued;
        queueRebuildCommand(): void;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface ISearchBoxComponentProps {
        stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class PropertyLedger {
        static DefaultControl: React.ComponentClass<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps>;
        static RegisteredControls: {
            [key: string]: React.ComponentClass<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPropertyComponentProps>;
        };
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class NodePort {
        portData: IPortData;
        node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        protected _element: HTMLDivElement;
        protected _portContainer: HTMLElement;
        protected _imgHost: HTMLImageElement;
        protected _pip: HTMLDivElement;
        protected _stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
        protected _portLabelElement: Element;
        protected _onCandidateLinkMovedObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.Nullable<BABYLON.Vector2>>>;
        protected _onSelectionChangedObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ISelectionChangedOptions>>>;
        protected _exposedOnFrame: boolean;
        protected _portUIcontainer?: HTMLDivElement;
        delegatedPort: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort>;
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
        constructor(portContainer: HTMLElement, portData: IPortData, node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager, portUIcontainer?: HTMLDivElement);
        dispose(): void;
        static CreatePortElement(portData: IPortData, node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, root: HTMLElement, displayManager: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager>, stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager): NodePort;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        get portA(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort;
        get portB(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort | undefined;
        get nodeA(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        get nodeB(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode | undefined;
        intersectsWith(rect: DOMRect): boolean;
        update(endX?: number, endY?: number, straight?: boolean): void;
        get path(): SVGPathElement;
        get selectionPath(): SVGPathElement;
        constructor(graphCanvas: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphCanvasComponent, portA: BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort, nodeA: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, portB?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort, nodeB?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode);
        onClick(evt: MouseEvent): void;
        dispose(notify?: boolean): void;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class NodeLedger {
        static RegisteredNodeNames: string[];
        static NameFormatter: (name: string) => string;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class GraphNode {
        content: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData;
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
        get outputPorts(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort[];
        get inputPorts(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort[];
        get links(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink[];
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
        constructor(content: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager);
        isOverlappingFrame(frame: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame): boolean;
        getPortForPortData(portData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort | null;
        getPortDataForPortDataContent(data: any): BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData | null;
        getLinksForPortDataContent(data: any): BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink[];
        getLinksForPortData(portData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink[];
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
        appendVisual(root: HTMLDivElement, owner: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphCanvasComponent): void;
        dispose(): void;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        get nodes(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[];
        get ports(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort[];
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
        constructor(candidate: BABYLON.Nullable<HTMLDivElement>, canvas: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphCanvasComponent, doNotCaptureNodes?: boolean);
        private _isFocused;
        /**
         * Enter/leave focus mode
         */
        switchFocusMode(): void;
        refresh(): void;
        addNode(node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode): void;
        removeNode(node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode): void;
        syncNode(node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode): void;
        cleanAccumulation(): void;
        private _onDown;
        move(newX: number, newY: number, align?: boolean): void;
        private _onUp;
        _moveFrame(offsetX: number, offsetY: number): void;
        private _onMove;
        moveFramePortUp(nodePort: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort): void;
        private _movePortUp;
        moveFramePortDown(nodePort: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort): void;
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
        serialize(saveCollapsedState: boolean): BABYLON.NodeRenderGraphEditor.SharedUIComponents.IFrameData;
        export(): void;
        adjustPorts(): void;
        static Parse(serializationData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IFrameData, canvas: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphCanvasComponent, map?: {
            [key: number]: number;
        }): GraphFrame;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IGraphCanvasComponentProps {
        stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
        onEmitNewNode: (nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData) => BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
    }
    export class GraphCanvasComponent extends React.Component<IGraphCanvasComponentProps> implements BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeContainer {
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
        _targetLinkCandidate: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink>;
        private _isCopyingOrPasting;
        private _copiedNodes;
        private _copiedFrames;
        get gridSize(): number;
        set gridSize(value: number);
        get stateManager(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
        get nodes(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[];
        get links(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink[];
        get frames(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame[];
        get zoom(): number;
        set zoom(value: number);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get selectedNodes(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[];
        get selectedLink(): BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink>;
        get selectedFrames(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame[];
        get selectedPort(): BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort>;
        get canvasContainer(): HTMLDivElement;
        get hostCanvas(): HTMLDivElement;
        get svgCanvas(): HTMLElement;
        get selectionContainer(): HTMLDivElement;
        get frameContainer(): HTMLDivElement;
        private _selectedFrameAndNodesConflict;
        constructor(props: IGraphCanvasComponentProps);
        populateConnectedEntriesBeforeRemoval(item: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, items: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[], inputs: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData>[], outputs: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData>[]): void;
        automaticRewire(inputs: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData>[], outputs: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData>[], firstOnly?: boolean): void;
        smartAddOverLink(node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, link: BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink): void;
        smartAddOverNode(node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, source: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode): void;
        deleteSelection(onRemove: (nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData) => void, autoReconnect?: boolean): void;
        handleKeyDownAsync(evt: KeyboardEvent, onRemove: (nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData) => void, mouseLocationX: number, mouseLocationY: number, dataGenerator: (nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData) => Promise<BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>>, rootElement: HTMLDivElement): Promise<void>;
        pasteSelectionAsync(copiedNodes: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[], currentX: number, currentY: number, dataGenerator: (nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData) => Promise<BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode>>, selectNew?: boolean): Promise<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[]>;
        reconnectNewNodes(nodeIndex: number, newNodes: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[], sourceNodes: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[], done: boolean[]): void;
        getCachedData(): any[];
        removeDataFromCache(data: any): void;
        createNodeFromObject(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, onNodeCreated: (data: any) => void, recursion?: boolean): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        getGridPosition(position: number, useCeil?: boolean): number;
        getGridPositionCeil(position: number): number;
        updateTransform(): void;
        onKeyUp(): void;
        findNodeFromData(data: any): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        reset(): void;
        connectPorts(pointA: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData, pointB: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): void;
        removeLink(link: BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink): void;
        appendNode(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        distributeGraph(): void;
        componentDidMount(): void;
        onMove(evt: React.PointerEvent): void;
        onDown(evt: React.PointerEvent<HTMLElement>): void;
        onUp(evt: React.PointerEvent): void;
        onWheel(evt: React.WheelEvent): void;
        zoomToFit(): void;
        processCandidatePort(): void;
        connectNodes(nodeA: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, pointA: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData, nodeB: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, pointB: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): void;
        drop(newNode: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, targetX: number, targetY: number, offsetX: number, offsetY: number): void;
        processEditorData(editorData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IEditorData): void;
        reOrganize(editorData?: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IEditorData>, isImportingAFrame?: boolean): void;
        addFrame(frameData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IFrameData): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class FrameNodePort extends BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort {
        portData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData;
        node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
        private _parentFrameId;
        private _isInput;
        private _framePortPosition;
        private _framePortId;
        private _onFramePortPositionChangedObservable;
        get parentFrameId(): number;
        get onFramePortPositionChangedObservable(): BABYLON.Observable<FrameNodePort>;
        get isInput(): boolean;
        get framePortId(): number;
        get framePortPosition(): BABYLON.NodeRenderGraphEditor.SharedUIComponents.FramePortPosition;
        set framePortPosition(position: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FramePortPosition);
        constructor(portContainer: HTMLElement, portData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData, node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager, isInput: boolean, framePortId: number, parentFrameId: number);
        static CreateFrameNodePortElement(portData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData, node: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, root: HTMLElement, displayManager: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IDisplayManager>, stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager, isInput: boolean, framePortId: number, parentFrameId: number): FrameNodePort;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export class DisplayLedger {
        static RegisteredControls: {
            [key: string]: any;
        };
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Function used to force a rebuild of the node system
     * @param source source object
     * @param stateManager defines the state manager to use
     * @param propertyName name of the property that has been changed
     * @param notifiers list of notifiers to use
     * @param engageActiveRefresh if active refresh should be engaged
     */
    export function ForceRebuild(source: any, stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager, propertyName: string, notifiers?: BABYLON.IEditablePropertyOption["notifiers"], engageActiveRefresh?: boolean): void;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type FramePortData = {
        frame: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame;
        port: BABYLON.NodeRenderGraphEditor.SharedUIComponents.FrameNodePort;
    };



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface ISelectionChangedOptions {
        selection: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeLink | BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphFrame | BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodePort | BABYLON.NodeRenderGraphEditor.SharedUIComponents.FramePortData>;
        forceKeepSelection?: boolean;
        marqueeSelection?: boolean;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IPropertyComponentProps {
        stateManager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager;
        nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        getCompatibilityIssueMessage(issue: number, targetNode: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode, targetPort: IPortData): string;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        getPortByName: (name: string) => BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData>;
        inputs: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData[];
        outputs: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData[];
        invisibleEndpoints?: BABYLON.Nullable<any[]>;
        isConnectedToOutput?: () => boolean;
        isActive?: boolean;
        setIsActive?: (value: boolean) => void;
        canBeActivated?: boolean;
        onInputCountChanged?: () => void;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface INodeContainer {
        nodes: BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode[];
        appendNode(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): BABYLON.NodeRenderGraphEditor.SharedUIComponents.GraphNode;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface VisualContentDescription {
        [key: string]: HTMLElement;
    }
    export interface IDisplayManager {
        getHeaderClass(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        shouldDisplayPortLabels(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.IPortData): boolean;
        updatePreviewContent(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        updateFullVisualContent?(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, visualContent: VisualContentDescription): void;
        getBackgroundColor(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        getHeaderText(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData): string;
        onSelectionChanged?(data: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData>, manager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager): void;
        onDispose?(nodeData: BABYLON.NodeRenderGraphEditor.SharedUIComponents.INodeData, manager: BABYLON.NodeRenderGraphEditor.SharedUIComponents.StateManager): void;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IVector4LineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector4) => void;
        useEuler?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        icon?: string;
        iconLabel?: string;
        value?: BABYLON.Vector4;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IVector3LineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector3) => void;
        useEuler?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        noSlider?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IVector2LineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector2) => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IUnitButtonProps {
        unit: string;
        locked?: boolean;
        onClick?: (unit: string) => void;
    }
    export function UnitButton(props: IUnitButtonProps): import("react/jsx-runtime").JSX.Element;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface ITextInputLineComponentProps {
        label?: string;
        lockObject?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        target?: any;
        propertyName?: string;
        value?: string;
        onChange?: (value: string) => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export const conflictingValuesPlaceholder = "\u2014";
    /**
     *
     * @param targets a list of selected targets
     * @param onPropertyChangedObservable
     * @param getProperty
     * @returns a proxy object that can be passed as a target into the input
     */
    export function makeTargetsProxy<Type>(targets: Type[], onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>, getProperty?: (target: Type, property: keyof Type) => any): any;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        decimalCount?: number;
        margin?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export var Null_Value: number;
    export interface IOptionsLineProps {
        label: string;
        target: any;
        propertyName: string;
        options: readonly BABYLON.IInspectableOptions[];
        noDirectUpdate?: boolean;
        onSelect?: (value: number | string) => void;
        extractValue?: (target: any) => number | string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface INumericInputProps {
        label: string;
        labelTooltip?: string;
        value: number;
        step?: number;
        onChange: (value: number) => void;
        precision?: number;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IMatrixLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        step?: number;
        onChange?: (newValue: BABYLON.Matrix) => void;
        onModeChange?: (mode: number) => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        mode?: number;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface ILineContainerComponentProps {
        selection?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.ISelectedLineContainer;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IIconComponentProps {
        icon: string;
        label?: string;
    }
    export class IconComponent extends React.Component<IIconComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface ISelectedLineContainer {
        selectedLineContainerTitles: Array<string>;
        selectedLineContainerTitlesNoFocus: Array<string>;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IHexLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        lockObject?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onChange?: (newValue: number) => void;
        isInteger?: boolean;
        replaySourceReplacement?: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface IFloatLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        onChange?: (newValue: number) => void;
        isInteger?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type DraggableLineComponentProps = Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.DraggableLineProps, "label">;
    export var DraggableLineComponent: React.FunctionComponent<DraggableLineComponentProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IColorPickerLineProps {
        value: BABYLON.Color4 | BABYLON.Color3;
        linearHint?: boolean;
        onColorChanged: (newOne: string) => void;
        icon?: string;
        iconLabel?: string;
        shouldPopRight?: boolean;
        lockObject?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IColorLineProps {
        label: string;
        target?: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        onChange?: () => void;
        isLinear?: boolean;
        icon?: string;
        iconLabel?: string;
        disableAlpha?: boolean;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IColor4LineComponentProps {
        label: string;
        target?: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        onChange?: () => void;
        isLinear?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
    }
    export class Color4LineComponent extends React.Component<IColor4LineComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IColor3LineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
        isLinear?: boolean;
        icon?: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
        iconLabel?: string;
        onChange?: () => void;
    }
    export class Color3LineComponent extends React.Component<IColor3LineComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface ICheckBoxLineComponentProps {
        label?: string;
        target?: any;
        propertyName?: string;
        isSelected?: boolean | (() => boolean);
        onSelect?: (value: boolean) => void;
        onValueChanged?: () => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export var MeshIcon: import("@fluentui/react-icons").FluentIcon;
    export var TranslateIcon: import("@fluentui/react-icons").FluentIcon;
    export var MaterialIcon: import("@fluentui/react-icons").FluentIcon;
    export var FlatTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var LinearTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var BreakTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var UnifyTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var StepTangentIcon: import("@fluentui/react-icons").FluentIcon;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type UploadButtonProps = Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ButtonProps, "onClick" | "icon"> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type TooltipProps = {
        content?: BABYLON.Nullable<string>;
        children: React.ReactElement;
    };
    export var Tooltip: import("react").ForwardRefExoticComponent<TooltipProps & import("react").RefAttributes<HTMLElement>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type ToggleButtonProps = Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ButtonProps, "icon" | "onClick"> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type TextureSelectorProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.BaseTexture>> & {
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
    } & Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.EntitySelectorProps<BABYLON.BaseTexture>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene textures
     * and a button for uploading new texture files.
     * @param props TextureSelectorProps
     * @returns TextureSelector component
     */
    export var TextureSelector: React.FunctionComponent<TextureSelectorProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type TextareaProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<string> & {
        placeholder?: string;
    };
    /**
     * This is a texarea box that stops propagation of change/keydown events
     * @param props
     * @returns
     */
    export var Textarea: React.FunctionComponent<TextareaProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type TextInputProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<string> & {
        validator?: (value: string) => boolean;
        validateOnlyOnBlur?: boolean;
    };
    export var TextInput: React.FunctionComponent<TextInputProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type SyncedSliderProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<number> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type SwitchProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<boolean>;
    /**
     * This is a primitive fluent boolean switch component whose only knowledge is the shared styling across all tools
     * @param props
     * @returns Switch component
     */
    export var Switch: React.FunctionComponent<SwitchProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type SpinButtonProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<number> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type SkeletonSelectorProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Skeleton>> & {
        /**
         * The scene to get skeletons from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which skeletons are shown
         */
        filter?: (skeleton: BABYLON.Skeleton) => boolean;
    } & Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.EntitySelectorProps<BABYLON.Skeleton>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene skeletons.
     * @param props SkeletonSelectorProps
     * @returns SkeletonSelector component
     */
    export var SkeletonSelector: React.FunctionComponent<SkeletonSelectorProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type SearchProps = {
        onChange: (val: string) => void;
        placeholder?: string;
    };
    export var SearchBar: import("react").ForwardRefExoticComponent<SearchProps & import("react").RefAttributes<HTMLInputElement>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        infoLabel?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.InfoLabelParentProps;
    };
    export type PrimitiveProps<T> = ImmutablePrimitiveProps<T> & {
        /**
         * Called when the primitive value changes
         */
        onChange: (value: T) => void;
    };



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type NodeSelectorProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Node>> & {
        /**
         * The scene to get nodes from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which nodes are shown
         */
        filter?: (node: BABYLON.Node) => boolean;
    } & Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.EntitySelectorProps<BABYLON.Node>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene nodes.
     * @param props NodeSelectorProps
     * @returns NodeSelector component
     */
    export var NodeSelector: React.FunctionComponent<NodeSelectorProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type MessageBarProps = {
        message: string;
        title?: string;
        docLink?: string;
        intent: "info" | "success" | "warning" | "error";
    };
    export var MessageBar: React.FunctionComponent<MessageBarProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type MaterialSelectorProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Material>> & {
        /**
         * The scene to get materials from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which materials are shown
         */
        filter?: (material: BABYLON.Material) => boolean;
    } & Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.EntitySelectorProps<BABYLON.Material>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene materials.
     * @param props MaterialSelectorProps
     * @returns MaterialSelector component
     */
    export var MaterialSelector: React.FunctionComponent<MaterialSelectorProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type LinkProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.ImmutablePrimitiveProps<string> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Component wrapper for BABYLON.FactorGradient that provides slider inputs for factor1, factor2, and gradient step
     * @param props - Component props containing BABYLON.FactorGradient value and change handler
     * @returns A React component
     */
    export var FactorGradientComponent: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.FactorGradient>>;
    /**
     * Component wrapper for BABYLON.Color3Gradient that provides color picker and gradient step slider
     * @param props - Component props containing BABYLON.Color3Gradient value and change handler
     * @returns A React component
     */
    export var Color3GradientComponent: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.Color3Gradient>>;
    /**
     * Component wrapper for BABYLON.ColorGradient that provides color pickers for color1, color2, and gradient step slider
     * @param props - Component props containing BABYLON.ColorGradient value and change handler
     * @returns A React component
     */
    export var Color4GradientComponent: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.ColorGradient>>;
    /**
     * Component wrapper for BABYLON.GradientBlockColorStep that provides color picker and step slider
     * @param props - Component props containing BABYLON.GradientBlockColorStep value and change handler
     * @returns A React component
     */
    export var ColorStepGradientComponent: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.GradientBlockColorStep>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type Entity = {
        uniqueId: number;
    };
    /**
     * Props for the EntitySelector component
     */
    export type EntitySelectorProps<T extends Entity> = (PrimitiveProps<BABYLON.Nullable<T>> | BABYLON.NodeRenderGraphEditor.SharedUIComponents.ImmutablePrimitiveProps<BABYLON.Nullable<T>>) & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
    export type DropdownProps<V extends AcceptedDropdownValue> = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<V> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type DraggableLineProps = {
        format: string;
        data: string;
        tooltip: string;
        label: string;
        onDelete?: () => void;
    };
    export var DraggableLine: React.FunctionComponent<DraggableLineProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
    export type ContextMenuProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.BasePrimitiveProps & (ContextMenuWithIconProps | ContextMenuWithTriggerProps) & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
    export type ComboBoxProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<string> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type ColorPickerProps<C extends BABYLON.Color3 | BABYLON.Color4> = {
        isLinearMode?: boolean;
    } & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<C>;
    export var ColorPickerPopup: import("react").ForwardRefExoticComponent<{
        isLinearMode?: boolean;
    } & BasePrimitiveProps & {
        value: BABYLON.Color3 | BABYLON.Color4;
        infoLabel?: InfoLabelParentProps;
    } & {
        onChange: (value: BABYLON.Color3 | BABYLON.Color4) => void;
    } & import("react").RefAttributes<HTMLButtonElement>>;
    export type InputHexProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.Color3 | BABYLON.Color4> & {
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
    type InputHsvFieldProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<BABYLON.Color3 | BABYLON.Color4> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * This is a primitive fluent checkbox that can both read and write checked state
     * @param props
     * @returns Checkbox component
     */
    export var Checkbox: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<boolean>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type ButtonProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.BasePrimitiveProps & {
        onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
        icon?: any;
        appearance?: "subtle" | "transparent" | "primary" | "secondary";
        label?: string;
    };
    export var Button: import("react").ForwardRefExoticComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.BasePrimitiveProps & {
        onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
        icon?: any;
        appearance?: "subtle" | "transparent" | "primary" | "secondary";
        label?: string;
    } & import("react").RefAttributes<HTMLButtonElement>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type PaneProps = {
        title: string;
        icon?: any;
    };
    export var Pane: React.FunctionComponent<React.PropsWithChildren<PaneProps>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type FileUploadLineProps = Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ButtonProps, "onClick" | "label"> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type ButtonLineProps = Omit<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ButtonProps, "label"> & {
        label: string;
    };
    /**
     * Wraps a button with a label in a line container
     * @param props Button props plus a label
     * @returns A button inside a line
     */
    export var ButtonLine: React.FunctionComponent<ButtonLineProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type TensorPropertyLineProps<V extends BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Vector4 | BABYLON.Quaternion> = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<V> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<V> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Wraps text in a property line
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps and TextProps
     * @returns property-line wrapped text
     */
    export var TextPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<string> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.ImmutablePrimitiveProps<string>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Wraps textarea in a property line
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps and TextProps
     * @returns property-line wrapped text
     */
    export var TextAreaPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<string> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.TextareaProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type SyncedSliderPropertyProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.SyncedSliderProps & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<number>;
    /**
     * Renders a simple wrapper around the SyncedSliderInput
     * @param props
     * @returns
     */
    export var SyncedSliderPropertyLine: import("react").ForwardRefExoticComponent<SyncedSliderPropertyProps & import("react").RefAttributes<HTMLDivElement>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Wraps a switch in a property line
     * @param props - The properties for the switch and property line
     * @returns A React element representing the property line with a switch
     */
    export var SwitchPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<boolean> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.SwitchProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type StringifiedPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<number> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.ImmutablePrimitiveProps<number> & {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export var SpinButtonPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<number> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.SpinButtonProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
    export var PlaceholderPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<any> & PropertyLineProps<any>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Wraps a link in a property line
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps and BABYLON.NodeRenderGraphEditor.SharedUIComponents.LinkProps
     * @returns property-line wrapped link
     */
    export var LinkPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<string> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.LinkProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Wraps a text input in a property line
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps and InputProps
     * @returns property-line wrapped input component
     */
    export var TextInputPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.TextInputProps & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<string>>;
    export type NumberInputPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.SpinButtonProps & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<number>;
    /**
     * Wraps a number input in a property line
     * To force integer values, use forceInt param (this is distinct from the 'step' param, which will still allow submitting an integer value. forceInt will not)
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps and InputProps
     * @returns property-line wrapped input component
     */
    export var NumberInputPropertyLine: React.FunctionComponent<NumberInputPropertyLineProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type HexPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.NumberInputPropertyLineProps & {
        numBits?: 32 | 24 | 16 | 8;
    };
    /**
     * Takes a number representing a Hex value and converts it to a hex string then wraps the TextInput in a PropertyLine
     * @param props - PropertyLineProps
     * @returns property-line wrapped textbox that converts to/from hex number representation
     */
    export var HexPropertyLine: React.FunctionComponent<HexPropertyLineProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type NodeSelectorPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Node>> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.NodeSelectorProps;
    type MaterialSelectorPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Material>> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.MaterialSelectorProps;
    type TextureSelectorPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.BaseTexture>> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.TextureSelectorProps;
    type SkeletonSelectorPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Skeleton>> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.SkeletonSelectorProps;
    export const NodeSelectorPropertyLine: (props: NodeSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const MaterialSelectorPropertyLine: (props: MaterialSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const TextureSelectorPropertyLine: (props: TextureSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const SkeletonSelectorPropertyLine: (props: SkeletonSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type DropdownPropertyLineProps<V extends BABYLON.NodeRenderGraphEditor.SharedUIComponents.AcceptedDropdownValue> = BABYLON.NodeRenderGraphEditor.SharedUIComponents.DropdownProps<V> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<V>;
    /**
     * Wraps a dropdown in a property line
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps and BABYLON.NodeRenderGraphEditor.SharedUIComponents.DropdownProps
     * @returns property-line wrapped dropdown
     */
    export var DropdownPropertyLine: import("react").ForwardRefExoticComponent<DropdownPropertyLineProps<BABYLON.NodeRenderGraphEditor.SharedUIComponents.AcceptedDropdownValue> & import("react").RefAttributes<HTMLDivElement>>;
    /**
     * Dropdown component for number values.
     */
    export var NumberDropdownPropertyLine: React.FunctionComponent<DropdownPropertyLineProps<number>>;
    /**
     * Dropdown component for string values
     */
    export var StringDropdownPropertyLine: React.FunctionComponent<DropdownPropertyLineProps<string>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        type ComboBoxPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.ComboBoxProps & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<string>;
    /**
     * A property line with a filterable ComboBox
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.ComboBoxProps & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps
     * @returns property-line wrapped ComboBox component
     */
    export var ComboBoxPropertyLine: React.FunctionComponent<ComboBoxPropertyLineProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type ColorPropertyLineProps = BABYLON.NodeRenderGraphEditor.SharedUIComponents.ColorPickerProps<BABYLON.Color3 | BABYLON.Color4> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<BABYLON.Color3 | BABYLON.Color4>;
    export var Color3PropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ColorPickerProps<BABYLON.Color3> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<BABYLON.Color3>>;
    export var Color4PropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.ColorPickerProps<BABYLON.Color4> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<BABYLON.Color4>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Wraps a checkbox in a property line
     * @param props - BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps and CheckboxProps
     * @returns property-line wrapped checkbox
     */
    export var CheckboxPropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<boolean> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.PrimitiveProps<boolean>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Displays an icon indicating enabled (green check) or disabled (red cross) state
     * @param props - The properties for the PropertyLine, including the boolean value to display.
     * @returns A PropertyLine component with a PresenceBadge indicating the boolean state.
     */
    export var BooleanBadgePropertyLine: React.FunctionComponent<BABYLON.NodeRenderGraphEditor.SharedUIComponents.PropertyLineProps<boolean> & BABYLON.NodeRenderGraphEditor.SharedUIComponents.ImmutablePrimitiveProps<boolean>>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * A wrapper component for the property tab that provides a consistent layout and styling.
     * It uses a Pane and an Accordion to organize the content, so its direct children
     * must have 'title' props to be compatible with the Accordion structure.
     * @param props The props to pass to the component.
     * @returns The rendered component.
     */
    export var PropertyTabComponentBase: React.FunctionComponent<React.PropsWithChildren>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export function ClassNames(names: any, styleObject: any): string;
    export function JoinClassNames(styleObject: any, ...names: string[]): string;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type ToggleProps = {
        toggled: "on" | "mixed" | "off";
        onToggle?: () => void;
        padded?: boolean;
        color?: "dark" | "light";
    };
    export var Toggle: React.FC<ToggleProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface MessageDialogProps {
        message: string;
        isError: boolean;
        onClose?: () => void;
    }
    export var MessageDialog: React.FC<MessageDialogProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type LabelProps = {
        text: string;
        children?: React.ReactChild;
        color?: "dark" | "light";
    };
    export var Label: React.FC<LabelProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export type IconProps = {
        color?: "dark" | "light";
        icon: string;
    };
    export var Icon: React.FC<IconProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * utility hook to assist using the graph context
     * @returns
     */
    export const useGraphContext: () => IGraphContext;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        interface INumericInputComponentProps {
        label: string;
        labelTooltip?: string;
        value: number;
        step?: number;
        onChange: (value: number) => void;
        precision?: number;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IColorPickerLineComponentProps {
        value: BABYLON.Color4 | BABYLON.Color3;
        linearHint?: boolean;
        onColorChanged: (newOne: string) => void;
        icon?: string;
        iconLabel?: string;
        shouldPopRight?: boolean;
        lockObject?: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Given a column and row number in the layout, return the corresponding column/row
     * @param layout
     * @param column
     * @param row
     * @returns
     */
    export const getPosInLayout: (layout: BABYLON.NodeRenderGraphEditor.SharedUIComponents.Layout, column: number, row?: number) => BABYLON.NodeRenderGraphEditor.SharedUIComponents.LayoutColumn | BABYLON.NodeRenderGraphEditor.SharedUIComponents.LayoutTabsRow;
    /**
     * Remove a row in position row, column from the layout, and redistribute heights of remaining rows
     * @param layout
     * @param column
     * @param row
     */
    export const removeLayoutRowAndRedistributePercentages: (layout: BABYLON.NodeRenderGraphEditor.SharedUIComponents.Layout, column: number, row: number) => void;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export var LayoutContext: import("react").Context<{
        /**
         * The layout object
         */
        layout: BABYLON.NodeRenderGraphEditor.SharedUIComponents.Layout;
        /**
         * Function to set the layout object in the context
         */
        setLayout: (layout: BABYLON.NodeRenderGraphEditor.SharedUIComponents.Layout) => void;
    }>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Arguments for the TabsContainer component.
     */
    export interface IFlexibleTabsContainerProps {
        /**
         * The tabs to display
         */
        tabs: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LayoutTab[];
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        item: BABYLON.NodeRenderGraphEditor.SharedUIComponents.TabDrag;
        /**
         * What happens when the user drops another tab after this one
         */
        onTabDroppedAction: (item: BABYLON.NodeRenderGraphEditor.SharedUIComponents.TabDrag) => void;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        direction: BABYLON.NodeRenderGraphEditor.SharedUIComponents.ResizeDirections;
    }
    /**
     * The item that will be sent to the drag event
     */
    export type ResizeItem = {
        /**
         * If the resizing happens in row or column direction
         */
        direction: BABYLON.NodeRenderGraphEditor.SharedUIComponents.ResizeDirections;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Arguments for the BABYLON.NodeRenderGraphEditor.SharedUIComponents.Layout component.
     */
    export interface IFlexibleGridLayoutProps {
        /**
         * A definition of the layout which can be changed by the user
         */
        layoutDefinition: BABYLON.NodeRenderGraphEditor.SharedUIComponents.Layout;
    }
    /**
     * This component represents a grid layout that can be resized and rearranged
     * by the user.
     * @param props properties
     * @returns layout element
     */
    export var FlexibleGridLayout: React.FC<IFlexibleGridLayoutProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
        item: BABYLON.NodeRenderGraphEditor.SharedUIComponents.TabDrag;
        /**
         * Type of drag event
         */
        type: BABYLON.NodeRenderGraphEditor.SharedUIComponents.ElementTypes;
    }
    /**
     * An icon that can be dragged by the user
     * @param props properties
     * @returns draggable icon element
     */
    export var DraggableIcon: React.FC<IDraggableIconProps>;



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IHexColorProps {
        value: string;
        expectedLength: number;
        onChange: (value: string) => void;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerComponentProps {
        color: BABYLON.Color3 | BABYLON.Color4;
        linearhint?: boolean;
        debugMode?: boolean;
        onColorChanged?: (color: BABYLON.Color3 | BABYLON.Color4) => void;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IColorComponentEntryProps {
        value: number;
        label: string;
        max?: number;
        min?: number;
        onChange: (value: number) => void;
        disabled?: boolean;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
    }
    export class ColorComponentComponentEntry extends React.Component<IColorComponentEntryProps> {
        constructor(props: IColorComponentEntryProps);
        updateValue(valueString: string): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IHexColorProps {
        value: string;
        expectedLength: number;
        onChange: (value: string) => void;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerProps {
        color: BABYLON.Color3 | BABYLON.Color4;
        linearhint?: boolean;
        debugMode?: boolean;
        onColorChanged?: (color: BABYLON.Color3 | BABYLON.Color4) => void;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeRenderGraphEditor {


}
declare module BABYLON.NodeRenderGraphEditor.SharedUIComponents {
        export interface IColorComponentEntryProps {
        value: number;
        label: string;
        max?: number;
        min?: number;
        onChange: (value: number) => void;
        disabled?: boolean;
        lockObject: BABYLON.NodeRenderGraphEditor.SharedUIComponents.LockObject;
    }
    export class ColorComponentEntry extends React.Component<IColorComponentEntryProps> {
        constructor(props: IColorComponentEntryProps);
        updateValue(valueString: string): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeRenderGraphEditor {


}


