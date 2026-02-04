
declare module BABYLON.NodeGeometryEditor {
    export class SerializationTools {
        static UpdateLocations(geometry: BABYLON.NodeGeometry, globalState: GlobalState, frame?: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame>): void;
        static Serialize(geometry: BABYLON.NodeGeometry, globalState: GlobalState, frame?: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame>): string;
        static Deserialize(serializationObject: any, globalState: GlobalState): void;
        static AddFrameToGeometry(serializationObject: any, globalState: GlobalState, currentGeometry: BABYLON.NodeGeometry): void;
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
        nodeGeometry: BABYLON.NodeGeometry;
        hostScene?: BABYLON.Scene;
        hostMesh?: BABYLON.Mesh;
        hostElement?: HTMLElement;
        customSave?: {
            label: string;
            action: (data: string) => Promise<void>;
        };
        customLoadObservable?: BABYLON.Observable<any>;
        backgroundColor?: BABYLON.Color4;
    }
    /**
     * Class used to create a node editor
     */
    export class NodeGeometryEditor {
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
        private _historyStack;
        private _previewManager;
        private _mouseLocationX;
        private _mouseLocationY;
        private _onWidgetKeyUpPointer;
        private _previewHost;
        private _popUpWindow;
        appendBlock(dataToAppend: BABYLON.NodeGeometryBlock | BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, recursion?: boolean): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        addValueNode(type: string): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        prepareHistoryStack(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        constructor(props: IGraphEditorProps);
        zoomToFit(): void;
        buildGeometry(): void;
        build(ignoreEditorData?: boolean): void;
        loadGraph(): void;
        showWaitScreen(): void;
        hideWaitScreen(): void;
        reOrganize(editorData?: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IEditorData>, isImportingAFrame?: boolean): void;
        onWheel: (evt: WheelEvent) => void;
        emitNewBlock(blockType: string, targetX: number, targetY: number): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode | undefined;
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
        private _previewMode;
        nodeGeometry: BABYLON.NodeGeometry;
        hostElement: HTMLElement;
        hostDocument: Document;
        hostWindow: Window;
        stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
        onBuiltObservable: BABYLON.Observable<void>;
        onResetRequiredObservable: BABYLON.Observable<boolean>;
        onClearUndoStack: BABYLON.Observable<void>;
        onZoomToFitRequiredObservable: BABYLON.Observable<void>;
        onReOrganizedRequiredObservable: BABYLON.Observable<void>;
        onPreviewModeChanged: BABYLON.Observable<void>;
        onLogRequiredObservable: BABYLON.Observable<LogEntry>;
        onIsLoadingChanged: BABYLON.Observable<boolean>;
        onPreviewBackgroundChanged: BABYLON.Observable<void>;
        onFrame: BABYLON.Observable<void>;
        onAxis: BABYLON.Observable<void>;
        onAnimationCommandActivated: BABYLON.Observable<void>;
        onImportFrameObservable: BABYLON.Observable<any>;
        onPopupClosedObservable: BABYLON.Observable<void>;
        onGetNodeFromBlock: (block: BABYLON.NodeGeometryBlock) => BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        listOfCustomPreviewFiles: File[];
        rotatePreview: boolean;
        backgroundColor: BABYLON.Color4;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        pointerOverCanvas: boolean;
        onRefreshPreviewMeshControlComponentRequiredObservable: BABYLON.Observable<void>;
        onExportToGLBRequired: BABYLON.Observable<void>;
        customSave?: {
            label: string;
            action: (data: string) => Promise<void>;
        };
        resyncHandler?: () => void;
        get previewMode(): PreviewMode;
        set previewMode(value: PreviewMode);
        constructor();
        storeEditorData(serializationObject: any, frame?: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame>): void;
    }


    /**
     * Static class for BlockTools
     */
    export class BlockTools {
        static GetBlockFromString(data: string): BABYLON.GeometryEaseBlock | BABYLON.SubdivideBlock | BABYLON.PointListBlock | BABYLON.CleanGeometryBlock | BABYLON.AggregatorBlock | BABYLON.LatticeBlock | BABYLON.GeometryInterceptorBlock | BABYLON.GeometryRotate2dBlock | BABYLON.GeometryLengthBlock | BABYLON.GeometryDistanceBlock | BABYLON.GeometryDotBlock | BABYLON.GeometryPosterizeBlock | BABYLON.GeometryReplaceColorBlock | BABYLON.GeometryDesaturateBlock | BABYLON.GeometryCurveBlock | BABYLON.GeometryCrossBlock | BABYLON.GeometryClampBlock | BABYLON.BooleanGeometryBlock | BABYLON.GeometryTextureFetchBlock | BABYLON.GeometryTextureBlock | BABYLON.BoundingBlock | BABYLON.MatrixComposeBlock | BABYLON.GeometryInfoBlock | BABYLON.GeometryCollectionBlock | BABYLON.GeometryOptimizeBlock | BABYLON.NullBlock | BABYLON.TeleportInBlock | BABYLON.TeleportOutBlock | BABYLON.DebugBlock | BABYLON.IntFloatConverterBlock | BABYLON.ConditionBlock | BABYLON.GeometryLerpBlock | BABYLON.GeometryNLerpBlock | BABYLON.GeometrySmoothStepBlock | BABYLON.GeometryStepBlock | BABYLON.MappingBlock | BABYLON.SetMaterialIDBlock | BABYLON.InstantiateOnVolumeBlock | BABYLON.InstantiateOnFacesBlock | BABYLON.InstantiateOnVerticesBlock | BABYLON.InstantiateBlock | BABYLON.MapRangeBlock | BABYLON.NormalizeVectorBlock | BABYLON.MeshBlock | BABYLON.VectorConverterBlock | BABYLON.TranslationBlock | BABYLON.ScalingBlock | BABYLON.AlignBlock | BABYLON.RotationXBlock | BABYLON.RotationYBlock | BABYLON.RotationZBlock | BABYLON.ComputeNormalsBlock | BABYLON.SetPositionsBlock | BABYLON.SetNormalsBlock | BABYLON.SetColorsBlock | BABYLON.SetTangentsBlock | BABYLON.SetUVsBlock | BABYLON.NoiseBlock | BABYLON.RandomBlock | BABYLON.GeometryOutputBlock | BABYLON.GridBlock | BABYLON.DiscBlock | BABYLON.IcoSphereBlock | BABYLON.BoxBlock | BABYLON.TorusBlock | BABYLON.SphereBlock | BABYLON.CylinderBlock | BABYLON.CapsuleBlock | BABYLON.PlaneBlock | BABYLON.GeometryElbowBlock | BABYLON.MergeGeometryBlock | BABYLON.GeometryTransformBlock | BABYLON.GeometryModBlock | BABYLON.GeometryPowBlock | BABYLON.GeometryInputBlock | BABYLON.MathBlock | BABYLON.GeometryTrigonometryBlock | BABYLON.GeometryArcTan2Block | BABYLON.InstantiateLinearBlock | BABYLON.InstantiateRadialBlock | null;
        static GetColorFromConnectionNodeType(type: BABYLON.NodeGeometryBlockConnectionPointTypes): string;
        static GetConnectionNodeTypeFromString(type: string): BABYLON.NodeGeometryBlockConnectionPointTypes.Int | BABYLON.NodeGeometryBlockConnectionPointTypes.Float | BABYLON.NodeGeometryBlockConnectionPointTypes.Vector2 | BABYLON.NodeGeometryBlockConnectionPointTypes.Vector3 | BABYLON.NodeGeometryBlockConnectionPointTypes.Vector4 | BABYLON.NodeGeometryBlockConnectionPointTypes.Matrix | BABYLON.NodeGeometryBlockConnectionPointTypes.AutoDetect;
        static GetStringFromConnectionNodeType(type: BABYLON.NodeGeometryBlockConnectionPointTypes): "" | "Int" | "Float" | "Vector2" | "Vector3" | "Vector4" | "Matrix";
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


    export interface ICheckBoxLineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        isSelected?: () => boolean;
        onSelect?: (value: boolean) => void;
        onValueChanged?: () => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        disabled?: boolean;
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


    export const RegisterNodePortDesign: (stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager) => void;


    export const RegisterExportData: (stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager) => void;


    export const RegisterElbowSupport: (stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager) => void;


    export const RegisterDefaultInput: (stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager) => void;


    export const RegisterDebugSupport: (stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager) => void;


    export class ConnectionPointPortData implements BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData {
        private _connectedPort;
        private _nodeContainer;
        data: NodeGeometryConnectionPoint;
        get name(): string;
        get internalName(): string;
        get isExposedOnFrame(): boolean;
        set isExposedOnFrame(value: boolean);
        get exposedPortPosition(): number;
        set exposedPortPosition(value: number);
        get isConnected(): boolean;
        get isInactive(): boolean;
        get connectedPort(): BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData>;
        set connectedPort(value: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData>);
        get directValueDefinition(): {
            source: NodeGeometryConnectionPoint;
            propertyName: string;
            valueMin: any;
            valueMax: any;
            valueType: BABYLON.NodeGeometryEditor.SharedUIComponents.PortDirectValueTypes;
        } | undefined;
        get direction(): BABYLON.NodeGeometryEditor.SharedUIComponents.PortDataDirection;
        get ownerData(): BABYLON.NodeGeometryBlock;
        get needDualDirectionValidation(): boolean;
        get hasEndpoints(): boolean;
        get endpoints(): BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData[];
        constructor(connectionPoint: NodeGeometryConnectionPoint, nodeContainer: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeContainer);
        updateDisplayName(newName: string): void;
        connectTo(port: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): void;
        canConnectTo(port: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): boolean;
        disconnectFrom(port: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): void;
        checkCompatibilityState(port: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): 0 | BABYLON.NodeGeometryConnectionPointCompatibilityStates.TypeIncompatible | BABYLON.NodeGeometryConnectionPointCompatibilityStates.HierarchyIssue;
        getCompatibilityIssueMessage(issue: number, targetNode: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, targetPort: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): string;
    }


    export class BlockNodeData implements BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData {
        data: BABYLON.NodeGeometryBlock;
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
        get inputs(): BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData[];
        get outputs(): BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData[];
        get comments(): string;
        set comments(value: string);
        get executionTime(): number;
        getPortByName(name: string): BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData | null;
        isConnectedToOutput(): boolean;
        dispose(): void;
        prepareHeaderIcon(iconDiv: HTMLDivElement, img: HTMLImageElement): void;
        get invisibleEndpoints(): BABYLON.TeleportOutBlock[] | null;
        constructor(data: BABYLON.NodeGeometryBlock, nodeContainer: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeContainer);
    }


    export class TexturePropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        loadTextureData(file: File): Promise<void>;
        removeData(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class TeleportOutPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        private _onUpdateRequiredObserver;
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class PointListPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        addPoint(): void;
        removePoint(index: number): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class OutputPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        private _onUpdateRequiredObserver;
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IFrameNodePortPropertyTabComponentProps {
        stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
        nodePort: BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort;
    }
    export class NodePortPropertyTabComponent extends React.Component<IFrameNodePortPropertyTabComponentProps> {
        constructor(props: IFrameNodePortPropertyTabComponentProps);
        toggleExposeOnFrame(value: boolean): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class MeshPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps, {
        isLoading: boolean;
    }> {
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        loadMesh(file: File): Promise<void>;
        removeData(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class InputPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        private _onValueChangedObserver;
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        renderValue(globalState: GlobalState): import("react/jsx-runtime").JSX.Element | null;
        setDefaultValue(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class GenericPropertyComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }
    export class GeneralPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        processUpdate(): void;
        renderConnectionPoint(point: BABYLON.NodeGeometryConnectionPoint): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element;
    }
    export class GenericPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IFramePropertyTabComponentProps {
        globalState: GlobalState;
        frame: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame;
    }
    export class FramePropertyTabComponent extends React.Component<IFramePropertyTabComponentProps> {
        private _onFrameExpandStateChangedObserver;
        constructor(props: IFramePropertyTabComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export interface IFrameNodePortPropertyTabComponentProps {
        stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
        globalState: GlobalState;
        frameNodePort: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort;
        frame: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame;
    }
    export class FrameNodePortPropertyTabComponent extends React.Component<IFrameNodePortPropertyTabComponentProps, {
        port: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort;
    }> {
        private _onFramePortPositionChangedObserver;
        private _onSelectionChangedObserver;
        constructor(props: IFrameNodePortPropertyTabComponentProps);
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class DebugPropertyTabComponent extends React.Component<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps> {
        private _onUpdateRequiredObserver;
        constructor(props: BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class TextureDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        private _previewCanvas;
        private _previewImage;
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
    }


    export class TeleportOutDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        private _hasHighlights;
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        onSelectionChanged(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData>, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
        onDispose(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
    }


    export class TeleportInDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        private _hasHighlights;
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        onSelectionChanged(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData>, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
        onDispose(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
    }


    export class SourceDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(): string;
        updatePreviewContent(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
    }


    export class OutputDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(): string;
        updatePreviewContent(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
    }


    export class InputDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        private _hasHighlights;
        getHeaderClass(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        shouldDisplayPortLabels(): boolean;
        static GetBaseType(type: BABYLON.NodeGeometryBlockConnectionPointTypes): string;
        getBackgroundColor(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        onSelectionChanged(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData>, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
        onDispose(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
    }


    export class ElbowDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(_nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, _contentArea: HTMLDivElement): void;
        updateFullVisualContent(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, visualContent: BABYLON.NodeGeometryEditor.SharedUIComponents.VisualContentDescription): void;
    }


    export class DebugDisplayManager implements BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager {
        getHeaderClass(): string;
        shouldDisplayPortLabels(): boolean;
        getHeaderText(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getBackgroundColor(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        updatePreviewContent(_nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, _contentArea: HTMLDivElement): void;
        updateFullVisualContent(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, visualContent: BABYLON.NodeGeometryEditor.SharedUIComponents.VisualContentDescription): void;
    }


    interface IPropertyTabComponentProps {
        globalState: GlobalState;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    interface IPropertyTabComponentState {
        currentNode: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>;
        currentFrame: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame>;
        currentFrameNodePort: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort>;
        currentNodePort: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort>;
        uploadInProgress: boolean;
    }
    export class PropertyTabComponent extends React.Component<IPropertyTabComponentProps, IPropertyTabComponentState> {
        private _onBuiltObserver;
        constructor(props: IPropertyTabComponentProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        processInputBlockUpdate(): void;
        load(file: File): void;
        loadFrame(file: File): void;
        save(): void;
        customSave(): void;
        saveToSnippetServer(): void;
        loadFromSnippet(): void;
        exportAsGLB(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IInputsPropertyTabComponentProps {
        globalState: GlobalState;
        inputs: BABYLON.GeometryInputBlock[];
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    export class InputsPropertyTabComponent extends React.Component<IInputsPropertyTabComponentProps> {
        constructor(props: IInputsPropertyTabComponentProps);
        processInputBlockUpdate(): void;
        renderInputBlock(block: BABYLON.GeometryInputBlock): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IVector4PropertyTabComponentProps {
        globalState: GlobalState;
        inputBlock: BABYLON.GeometryInputBlock;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    export class Vector4PropertyTabComponent extends React.Component<IVector4PropertyTabComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IVector3PropertyTabComponentProps {
        globalState: GlobalState;
        inputBlock: BABYLON.GeometryInputBlock;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    export class Vector3PropertyTabComponent extends React.Component<IVector3PropertyTabComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IVector2PropertyTabComponentProps {
        globalState: GlobalState;
        inputBlock: BABYLON.GeometryInputBlock;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    export class Vector2PropertyTabComponent extends React.Component<IVector2PropertyTabComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    interface IFloatPropertyTabComponentProps {
        globalState: GlobalState;
        inputBlock: BABYLON.GeometryInputBlock;
    }
    export class FloatPropertyTabComponent extends React.Component<IFloatPropertyTabComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export enum PreviewMode {
        Normal = 0,
        MatCap = 1,
        Wireframe = 2,
        VertexColor = 3,
        Textured = 4,
        Normals = 5
    }


    interface IPreviewMeshControlComponent {
        globalState: GlobalState;
        togglePreviewAreaComponent: () => void;
        onMounted?: () => void;
    }
    interface IPreviewMeshControlComponentState {
        center: boolean;
    }
    export class PreviewMeshControlComponent extends React.Component<IPreviewMeshControlComponent, IPreviewMeshControlComponentState> {
        private _colorInputRef;
        private _onResetRequiredObserver;
        private _onRefreshPreviewMeshControlComponentRequiredObserver;
        constructor(props: IPreviewMeshControlComponent);
        componentWillUnmount(): void;
        componentDidMount(): void;
        onPopUp(): void;
        changeAnimation(): void;
        changeBackground(value: string): void;
        changeBackgroundClick(): void;
        frame(): void;
        axis(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }


    export class PreviewManager {
        private _nodeGeometry;
        private _onBuildObserver;
        private _onFrameObserver;
        private _onAxisObserver;
        private _onExportToGLBObserver;
        private _onAnimationCommandActivatedObserver;
        private _onUpdateRequiredObserver;
        private _onPreviewBackgroundChangedObserver;
        private _onPreviewChangedObserver;
        private _engine;
        private _scene;
        private _mesh;
        private _camera;
        private _light;
        private _globalState;
        private _matTexture;
        private _matCap;
        private _matStd;
        private _matNME;
        private _matVertexColor;
        private _matNormals;
        private _axis;
        private _toDelete;
        constructor(targetCanvas: HTMLCanvasElement, globalState: GlobalState);
        private _updateStandardMaterial;
        private _handleAnimations;
        private _frameCamera;
        private _prepareScene;
        private _refreshPreviewMesh;
        private _setMaterial;
        private _updatePreview;
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
        changeWireframe(): void;
        changeVertexColor(): void;
        changeMatCap(): void;
        changeTexture(): void;
        changeNormals(): void;
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
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class PropertyChangedEvent {
        object: any;
        property: string;
        value: any;
        initialValue: any;
        allowNullValue?: boolean;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export function copyCommandToClipboard(strCommand: string): void;
    export function getClassNameWithNamespace(obj: any): {
        className: string;
        babylonNamespace: string;
    };



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface ITextBlockPropertyGridComponentProps {
        textBlock: BABYLON.GUI.TextBlock;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class TextBlockPropertyGridComponent extends React.Component<ITextBlockPropertyGridComponentProps> {
        constructor(props: ITextBlockPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IStackPanelPropertyGridComponentProps {
        stackPanel: BABYLON.GUI.StackPanel;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class StackPanelPropertyGridComponent extends React.Component<IStackPanelPropertyGridComponentProps> {
        constructor(props: IStackPanelPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface ISliderPropertyGridComponentProps {
        slider: BABYLON.GUI.Slider;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class SliderPropertyGridComponent extends React.Component<ISliderPropertyGridComponentProps> {
        constructor(props: ISliderPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IScrollViewerPropertyGridComponentProps {
        scrollViewer: BABYLON.GUI.ScrollViewer;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ScrollViewerPropertyGridComponent extends React.Component<IScrollViewerPropertyGridComponentProps> {
        constructor(props: IScrollViewerPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IRectanglePropertyGridComponentProps {
        rectangle: BABYLON.GUI.Rectangle;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class RectanglePropertyGridComponent extends React.Component<IRectanglePropertyGridComponentProps> {
        constructor(props: IRectanglePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IRadioButtonPropertyGridComponentProps {
        radioButtons: BABYLON.GUI.RadioButton[];
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class RadioButtonPropertyGridComponent extends React.Component<IRadioButtonPropertyGridComponentProps> {
        constructor(props: IRadioButtonPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface ILinePropertyGridComponentProps {
        line: BABYLON.GUI.Line;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class LinePropertyGridComponent extends React.Component<ILinePropertyGridComponentProps> {
        constructor(props: ILinePropertyGridComponentProps);
        onDashChange(value: string): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IInputTextPropertyGridComponentProps {
        inputText: BABYLON.GUI.InputText;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class InputTextPropertyGridComponent extends React.Component<IInputTextPropertyGridComponentProps> {
        constructor(props: IInputTextPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IImagePropertyGridComponentProps {
        image: BABYLON.GUI.Image;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ImagePropertyGridComponent extends React.Component<IImagePropertyGridComponentProps> {
        constructor(props: IImagePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IImageBasedSliderPropertyGridComponentProps {
        imageBasedSlider: BABYLON.GUI.ImageBasedSlider;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ImageBasedSliderPropertyGridComponent extends React.Component<IImageBasedSliderPropertyGridComponentProps> {
        constructor(props: IImageBasedSliderPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IGridPropertyGridComponentProps {
        grid: BABYLON.GUI.Grid;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class GridPropertyGridComponent extends React.Component<IGridPropertyGridComponentProps> {
        constructor(props: IGridPropertyGridComponentProps);
        renderRows(): import("react/jsx-runtime").JSX.Element[];
        renderColumns(): import("react/jsx-runtime").JSX.Element[];
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IEllipsePropertyGridComponentProps {
        ellipse: BABYLON.GUI.Ellipse;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class EllipsePropertyGridComponent extends React.Component<IEllipsePropertyGridComponentProps> {
        constructor(props: IEllipsePropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IControlPropertyGridComponentProps {
        control: BABYLON.GUI.Control;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ControlPropertyGridComponent extends React.Component<IControlPropertyGridComponentProps> {
        constructor(props: IControlPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface ICommonControlPropertyGridComponentProps {
        controls?: BABYLON.GUI.Control[];
        control?: BABYLON.GUI.Control;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class CommonControlPropertyGridComponent extends React.Component<ICommonControlPropertyGridComponentProps> {
        constructor(props: ICommonControlPropertyGridComponentProps);
        renderGridInformation(control: BABYLON.GUI.Control): import("react/jsx-runtime").JSX.Element | null;
        render(): import("react/jsx-runtime").JSX.Element | undefined;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IColorPickerPropertyGridComponentProps {
        colorPicker: BABYLON.GUI.ColorPicker;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class ColorPickerPropertyGridComponent extends React.Component<IColorPickerPropertyGridComponentProps> {
        constructor(props: IColorPickerPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface ICheckboxPropertyGridComponentProps {
        checkbox: BABYLON.GUI.Checkbox;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
    }
    export class CheckboxPropertyGridComponent extends React.Component<ICheckboxPropertyGridComponentProps> {
        constructor(props: ICheckboxPropertyGridComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        controlledSide: BABYLON.NodeGeometryEditor.SharedUIComponents.ControlledSize;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        direction: BABYLON.NodeGeometryEditor.SharedUIComponents.SplitDirection;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class TypeLedger {
        static PortDataBuilder: (port: BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort, nodeContainer: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeContainer) => BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData;
        static NodeDataBuilder: (data: any, nodeContainer: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeContainer) => BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export const IsFramePortData: (variableToCheck: any) => variableToCheck is BABYLON.NodeGeometryEditor.SharedUIComponents.FramePortData;
    export const RefreshNode: (node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, visitedNodes?: Set<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>, visitedLinks?: Set<BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink>, canvas?: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphCanvasComponent) => void;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class StateManager {
        data: any;
        hostDocument: Document;
        lockObject: any;
        modalIsDisplayed: boolean;
        historyStack: BABYLON.NodeGeometryEditor.SharedUIComponents.HistoryStack;
        activeNode: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>;
        onSearchBoxRequiredObservable: BABYLON.Observable<{
            x: number;
            y: number;
        }>;
        onSelectionChangedObservable: BABYLON.Observable<BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.ISelectionChangedOptions>>;
        onFrameCreatedObservable: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame>;
        onUpdateRequiredObservable: BABYLON.Observable<any>;
        onGraphNodeRemovalObservable: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>;
        onSelectionBoxMoved: BABYLON.Observable<ClientRect | DOMRect>;
        onCandidateLinkMoved: BABYLON.Observable<BABYLON.Nullable<BABYLON.Vector2>>;
        onCandidatePortSelectedObservable: BABYLON.Observable<BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort>>;
        onNewNodeCreatedObservable: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>;
        onRebuildRequiredObservable: BABYLON.Observable<void>;
        onNodeMovedObservable: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>;
        onErrorMessageDialogRequiredObservable: BABYLON.Observable<string>;
        onExposePortOnFrameObservable: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>;
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
        exportData: (data: any, frame?: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame>) => string;
        isElbowConnectionAllowed: (nodeA: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort, nodeB: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort) => boolean;
        isDebugConnectionAllowed: (nodeA: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort, nodeB: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort) => boolean;
        applyNodePortDesign: (data: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData, element: HTMLElement, imgHost: HTMLImageElement, pip: HTMLDivElement) => boolean;
        getPortColor: (portData: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData) => string;
        storeEditorData: (serializationObject: any, frame?: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame>) => void;
        getEditorDataMap: () => {
            [key: number]: number;
        };
        getScene?: () => BABYLON.Scene;
        createDefaultInputData: (rootData: any, portData: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData, nodeContainer: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeContainer) => BABYLON.Nullable<{
            data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData;
            name: string;
        }>;
        private _isRebuildQueued;
        queueRebuildCommand(): void;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface ISearchBoxComponentProps {
        stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class PropertyLedger {
        static DefaultControl: React.ComponentClass<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps>;
        static RegisteredControls: {
            [key: string]: React.ComponentClass<BABYLON.NodeGeometryEditor.SharedUIComponents.IPropertyComponentProps>;
        };
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class NodePort {
        portData: IPortData;
        node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        protected _element: HTMLDivElement;
        protected _portContainer: HTMLElement;
        protected _imgHost: HTMLImageElement;
        protected _pip: HTMLDivElement;
        protected _stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
        protected _portLabelElement: Element;
        protected _onCandidateLinkMovedObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.Nullable<BABYLON.Vector2>>>;
        protected _onSelectionChangedObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.ISelectionChangedOptions>>>;
        protected _exposedOnFrame: boolean;
        protected _portUIcontainer?: HTMLDivElement;
        delegatedPort: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort>;
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
        constructor(portContainer: HTMLElement, portData: IPortData, node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager, portUIcontainer?: HTMLDivElement);
        dispose(): void;
        static CreatePortElement(portData: IPortData, node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, root: HTMLElement, displayManager: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager>, stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): NodePort;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        get portA(): BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort;
        get portB(): BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort | undefined;
        get nodeA(): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        get nodeB(): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode | undefined;
        intersectsWith(rect: DOMRect): boolean;
        update(endX?: number, endY?: number, straight?: boolean): void;
        get path(): SVGPathElement;
        get selectionPath(): SVGPathElement;
        constructor(graphCanvas: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphCanvasComponent, portA: BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort, nodeA: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, portB?: BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort, nodeB?: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode);
        onClick(evt: MouseEvent): void;
        dispose(notify?: boolean): void;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class NodeLedger {
        static RegisteredNodeNames: string[];
        static NameFormatter: (name: string) => string;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class GraphNode {
        content: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData;
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
        get outputPorts(): BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort[];
        get inputPorts(): BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort[];
        get links(): BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink[];
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
        constructor(content: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager);
        isOverlappingFrame(frame: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame): boolean;
        getPortForPortData(portData: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort | null;
        getPortDataForPortDataContent(data: any): BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData | null;
        getLinksForPortDataContent(data: any): BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink[];
        getLinksForPortData(portData: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink[];
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
        appendVisual(root: HTMLDivElement, owner: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphCanvasComponent): void;
        dispose(): void;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        get nodes(): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[];
        get ports(): BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort[];
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
        constructor(candidate: BABYLON.Nullable<HTMLDivElement>, canvas: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphCanvasComponent, doNotCaptureNodes?: boolean);
        private _isFocused;
        /**
         * Enter/leave focus mode
         */
        switchFocusMode(): void;
        refresh(): void;
        addNode(node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode): void;
        removeNode(node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode): void;
        syncNode(node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode): void;
        cleanAccumulation(): void;
        private _onDown;
        move(newX: number, newY: number, align?: boolean): void;
        private _onUp;
        _moveFrame(offsetX: number, offsetY: number): void;
        private _onMove;
        moveFramePortUp(nodePort: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort): void;
        private _movePortUp;
        moveFramePortDown(nodePort: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort): void;
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
        serialize(saveCollapsedState: boolean): BABYLON.NodeGeometryEditor.SharedUIComponents.IFrameData;
        export(): void;
        adjustPorts(): void;
        static Parse(serializationData: BABYLON.NodeGeometryEditor.SharedUIComponents.IFrameData, canvas: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphCanvasComponent, map?: {
            [key: number]: number;
        }): GraphFrame;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IGraphCanvasComponentProps {
        stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
        onEmitNewNode: (nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData) => BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
    }
    export class GraphCanvasComponent extends React.Component<IGraphCanvasComponentProps> implements BABYLON.NodeGeometryEditor.SharedUIComponents.INodeContainer {
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
        _targetLinkCandidate: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink>;
        private _isCopyingOrPasting;
        private _copiedNodes;
        private _copiedFrames;
        get gridSize(): number;
        set gridSize(value: number);
        get stateManager(): BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
        get nodes(): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[];
        get links(): BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink[];
        get frames(): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame[];
        get zoom(): number;
        set zoom(value: number);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get selectedNodes(): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[];
        get selectedLink(): BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink>;
        get selectedFrames(): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame[];
        get selectedPort(): BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort>;
        get canvasContainer(): HTMLDivElement;
        get hostCanvas(): HTMLDivElement;
        get svgCanvas(): HTMLElement;
        get selectionContainer(): HTMLDivElement;
        get frameContainer(): HTMLDivElement;
        private _selectedFrameAndNodesConflict;
        constructor(props: IGraphCanvasComponentProps);
        populateConnectedEntriesBeforeRemoval(item: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, items: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[], inputs: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData>[], outputs: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData>[]): void;
        automaticRewire(inputs: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData>[], outputs: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData>[], firstOnly?: boolean): void;
        smartAddOverLink(node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, link: BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink): void;
        smartAddOverNode(node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, source: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode): void;
        deleteSelection(onRemove: (nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData) => void, autoReconnect?: boolean): void;
        handleKeyDownAsync(evt: KeyboardEvent, onRemove: (nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData) => void, mouseLocationX: number, mouseLocationY: number, dataGenerator: (nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData) => Promise<BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>>, rootElement: HTMLDivElement): Promise<void>;
        pasteSelectionAsync(copiedNodes: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[], currentX: number, currentY: number, dataGenerator: (nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData) => Promise<BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode>>, selectNew?: boolean): Promise<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[]>;
        reconnectNewNodes(nodeIndex: number, newNodes: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[], sourceNodes: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[], done: boolean[]): void;
        getCachedData(): any[];
        removeDataFromCache(data: any): void;
        createNodeFromObject(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, onNodeCreated: (data: any) => void, recursion?: boolean): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        getGridPosition(position: number, useCeil?: boolean): number;
        getGridPositionCeil(position: number): number;
        updateTransform(): void;
        onKeyUp(): void;
        findNodeFromData(data: any): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        reset(): void;
        connectPorts(pointA: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData, pointB: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): void;
        removeLink(link: BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink): void;
        appendNode(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        distributeGraph(): void;
        componentDidMount(): void;
        onMove(evt: React.PointerEvent): void;
        onDown(evt: React.PointerEvent<HTMLElement>): void;
        onUp(evt: React.PointerEvent): void;
        onWheel(evt: React.WheelEvent): void;
        zoomToFit(): void;
        processCandidatePort(): void;
        connectNodes(nodeA: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, pointA: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData, nodeB: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, pointB: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): void;
        drop(newNode: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, targetX: number, targetY: number, offsetX: number, offsetY: number): void;
        processEditorData(editorData: BABYLON.NodeGeometryEditor.SharedUIComponents.IEditorData): void;
        reOrganize(editorData?: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IEditorData>, isImportingAFrame?: boolean): void;
        addFrame(frameData: BABYLON.NodeGeometryEditor.SharedUIComponents.IFrameData): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class FrameNodePort extends BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort {
        portData: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData;
        node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
        private _parentFrameId;
        private _isInput;
        private _framePortPosition;
        private _framePortId;
        private _onFramePortPositionChangedObservable;
        get parentFrameId(): number;
        get onFramePortPositionChangedObservable(): BABYLON.Observable<FrameNodePort>;
        get isInput(): boolean;
        get framePortId(): number;
        get framePortPosition(): BABYLON.NodeGeometryEditor.SharedUIComponents.FramePortPosition;
        set framePortPosition(position: BABYLON.NodeGeometryEditor.SharedUIComponents.FramePortPosition);
        constructor(portContainer: HTMLElement, portData: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData, node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager, isInput: boolean, framePortId: number, parentFrameId: number);
        static CreateFrameNodePortElement(portData: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData, node: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, root: HTMLElement, displayManager: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IDisplayManager>, stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager, isInput: boolean, framePortId: number, parentFrameId: number): FrameNodePort;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export class DisplayLedger {
        static RegisteredControls: {
            [key: string]: any;
        };
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Function used to force a rebuild of the node system
     * @param source source object
     * @param stateManager defines the state manager to use
     * @param propertyName name of the property that has been changed
     * @param notifiers list of notifiers to use
     * @param engageActiveRefresh if active refresh should be engaged
     */
    export function ForceRebuild(source: any, stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager, propertyName: string, notifiers?: BABYLON.IEditablePropertyOption["notifiers"], engageActiveRefresh?: boolean): void;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type FramePortData = {
        frame: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame;
        port: BABYLON.NodeGeometryEditor.SharedUIComponents.FrameNodePort;
    };



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface ISelectionChangedOptions {
        selection: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode | BABYLON.NodeGeometryEditor.SharedUIComponents.NodeLink | BABYLON.NodeGeometryEditor.SharedUIComponents.GraphFrame | BABYLON.NodeGeometryEditor.SharedUIComponents.NodePort | BABYLON.NodeGeometryEditor.SharedUIComponents.FramePortData>;
        forceKeepSelection?: boolean;
        marqueeSelection?: boolean;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IPropertyComponentProps {
        stateManager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager;
        nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        getCompatibilityIssueMessage(issue: number, targetNode: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode, targetPort: IPortData): string;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        getPortByName: (name: string) => BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData>;
        inputs: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData[];
        outputs: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData[];
        invisibleEndpoints?: BABYLON.Nullable<any[]>;
        isConnectedToOutput?: () => boolean;
        isActive?: boolean;
        setIsActive?: (value: boolean) => void;
        canBeActivated?: boolean;
        onInputCountChanged?: () => void;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface INodeContainer {
        nodes: BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode[];
        appendNode(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): BABYLON.NodeGeometryEditor.SharedUIComponents.GraphNode;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface VisualContentDescription {
        [key: string]: HTMLElement;
    }
    export interface IDisplayManager {
        getHeaderClass(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        shouldDisplayPortLabels(data: BABYLON.NodeGeometryEditor.SharedUIComponents.IPortData): boolean;
        updatePreviewContent(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, contentArea: HTMLDivElement): void;
        updateFullVisualContent?(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, visualContent: VisualContentDescription): void;
        getBackgroundColor(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        getHeaderText(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData): string;
        onSelectionChanged?(data: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, selectedData: BABYLON.Nullable<BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData>, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
        onDispose?(nodeData: BABYLON.NodeGeometryEditor.SharedUIComponents.INodeData, manager: BABYLON.NodeGeometryEditor.SharedUIComponents.StateManager): void;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IVector4LineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector4) => void;
        useEuler?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        icon?: string;
        iconLabel?: string;
        value?: BABYLON.Vector4;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IVector3LineComponentProps {
        label: string;
        target?: any;
        propertyName?: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector3) => void;
        useEuler?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        noSlider?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IVector2LineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        step?: number;
        onChange?: (newvalue: BABYLON.Vector2) => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IUnitButtonProps {
        unit: string;
        locked?: boolean;
        onClick?: (unit: string) => void;
    }
    export function UnitButton(props: IUnitButtonProps): import("react/jsx-runtime").JSX.Element;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface ITextInputLineComponentProps {
        label?: string;
        lockObject?: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        target?: any;
        propertyName?: string;
        value?: string;
        onChange?: (value: string) => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export const conflictingValuesPlaceholder = "\u2014";
    /**
     *
     * @param targets a list of selected targets
     * @param onPropertyChangedObservable
     * @param getProperty
     * @returns a proxy object that can be passed as a target into the input
     */
    export function makeTargetsProxy<Type>(targets: Type[], onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>, getProperty?: (target: Type, property: keyof Type) => any): any;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        decimalCount?: number;
        margin?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export var Null_Value: number;
    export interface IOptionsLineProps {
        label: string;
        target: any;
        propertyName: string;
        options: readonly BABYLON.IInspectableOptions[];
        noDirectUpdate?: boolean;
        onSelect?: (value: number | string) => void;
        extractValue?: (target: any) => number | string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface INumericInputProps {
        label: string;
        labelTooltip?: string;
        value: number;
        step?: number;
        onChange: (value: number) => void;
        precision?: number;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IMatrixLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        step?: number;
        onChange?: (newValue: BABYLON.Matrix) => void;
        onModeChange?: (mode: number) => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        mode?: number;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface ILineContainerComponentProps {
        selection?: BABYLON.NodeGeometryEditor.SharedUIComponents.ISelectedLineContainer;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IIconComponentProps {
        icon: string;
        label?: string;
    }
    export class IconComponent extends React.Component<IIconComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface ISelectedLineContainer {
        selectedLineContainerTitles: Array<string>;
        selectedLineContainerTitlesNoFocus: Array<string>;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IHexLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        lockObject?: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onChange?: (newValue: number) => void;
        isInteger?: boolean;
        replaySourceReplacement?: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface IFloatLineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        onChange?: (newValue: number) => void;
        isInteger?: boolean;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type DraggableLineComponentProps = Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.DraggableLineProps, "label">;
    export var DraggableLineComponent: React.FunctionComponent<DraggableLineComponentProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IColorPickerLineProps {
        value: BABYLON.Color4 | BABYLON.Color3;
        linearHint?: boolean;
        onColorChanged: (newOne: string) => void;
        icon?: string;
        iconLabel?: string;
        shouldPopRight?: boolean;
        lockObject?: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IColorLineProps {
        label: string;
        target?: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        onChange?: () => void;
        isLinear?: boolean;
        icon?: string;
        iconLabel?: string;
        disableAlpha?: boolean;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IColor4LineComponentProps {
        label: string;
        target?: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        onChange?: () => void;
        isLinear?: boolean;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    export class Color4LineComponent extends React.Component<IColor4LineComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IColor3LineComponentProps {
        label: string;
        target: any;
        propertyName: string;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
        isLinear?: boolean;
        icon?: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
        iconLabel?: string;
        onChange?: () => void;
    }
    export class Color3LineComponent extends React.Component<IColor3LineComponentProps> {
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface ICheckBoxLineComponentProps {
        label?: string;
        target?: any;
        propertyName?: string;
        isSelected?: boolean | (() => boolean);
        onSelect?: (value: boolean) => void;
        onValueChanged?: () => void;
        onPropertyChangedObservable?: BABYLON.Observable<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyChangedEvent>;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export var MeshIcon: import("@fluentui/react-icons").FluentIcon;
    export var TranslateIcon: import("@fluentui/react-icons").FluentIcon;
    export var MaterialIcon: import("@fluentui/react-icons").FluentIcon;
    export var FlatTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var LinearTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var BreakTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var UnifyTangentIcon: import("@fluentui/react-icons").FluentIcon;
    export var StepTangentIcon: import("@fluentui/react-icons").FluentIcon;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type UploadButtonProps = Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.ButtonProps, "onClick" | "icon"> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type TooltipProps = {
        content?: BABYLON.Nullable<string>;
        children: React.ReactElement;
    };
    export var Tooltip: import("react").ForwardRefExoticComponent<TooltipProps & import("react").RefAttributes<HTMLElement>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type ToggleButtonProps = Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.ButtonProps, "icon" | "onClick"> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type TextureSelectorProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.BaseTexture>> & {
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
    } & Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.EntitySelectorProps<BABYLON.BaseTexture>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene textures
     * and a button for uploading new texture files.
     * @param props TextureSelectorProps
     * @returns TextureSelector component
     */
    export var TextureSelector: React.FunctionComponent<TextureSelectorProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type TextareaProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<string> & {
        placeholder?: string;
    };
    /**
     * This is a texarea box that stops propagation of change/keydown events
     * @param props
     * @returns
     */
    export var Textarea: React.FunctionComponent<TextareaProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type TextInputProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<string> & {
        validator?: (value: string) => boolean;
        validateOnlyOnBlur?: boolean;
    };
    export var TextInput: React.FunctionComponent<TextInputProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type SyncedSliderProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<number> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type SwitchProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<boolean>;
    /**
     * This is a primitive fluent boolean switch component whose only knowledge is the shared styling across all tools
     * @param props
     * @returns Switch component
     */
    export var Switch: React.FunctionComponent<SwitchProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type SpinButtonProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<number> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type SkeletonSelectorProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Skeleton>> & {
        /**
         * The scene to get skeletons from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which skeletons are shown
         */
        filter?: (skeleton: BABYLON.Skeleton) => boolean;
    } & Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.EntitySelectorProps<BABYLON.Skeleton>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene skeletons.
     * @param props SkeletonSelectorProps
     * @returns SkeletonSelector component
     */
    export var SkeletonSelector: React.FunctionComponent<SkeletonSelectorProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type SearchProps = {
        onChange: (val: string) => void;
        placeholder?: string;
    };
    export var SearchBar: import("react").ForwardRefExoticComponent<SearchProps & import("react").RefAttributes<HTMLInputElement>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        infoLabel?: BABYLON.NodeGeometryEditor.SharedUIComponents.InfoLabelParentProps;
    };
    export type PrimitiveProps<T> = ImmutablePrimitiveProps<T> & {
        /**
         * Called when the primitive value changes
         */
        onChange: (value: T) => void;
    };



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type NodeSelectorProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Node>> & {
        /**
         * The scene to get nodes from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which nodes are shown
         */
        filter?: (node: BABYLON.Node) => boolean;
    } & Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.EntitySelectorProps<BABYLON.Node>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene nodes.
     * @param props NodeSelectorProps
     * @returns NodeSelector component
     */
    export var NodeSelector: React.FunctionComponent<NodeSelectorProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type MessageBarProps = {
        message: string;
        title?: string;
        docLink?: string;
        intent: "info" | "success" | "warning" | "error";
    };
    export var MessageBar: React.FunctionComponent<MessageBarProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type MaterialSelectorProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.Nullable<BABYLON.Material>> & {
        /**
         * The scene to get materials from
         */
        scene: BABYLON.Scene;
        /**
         * Optional filter function to filter which materials are shown
         */
        filter?: (material: BABYLON.Material) => boolean;
    } & Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.EntitySelectorProps<BABYLON.Material>, "getEntities" | "getName">;
    /**
     * A primitive component with a ComboBox for selecting from existing scene materials.
     * @param props MaterialSelectorProps
     * @returns MaterialSelector component
     */
    export var MaterialSelector: React.FunctionComponent<MaterialSelectorProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type LinkProps = BABYLON.NodeGeometryEditor.SharedUIComponents.ImmutablePrimitiveProps<string> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Component wrapper for BABYLON.FactorGradient that provides slider inputs for factor1, factor2, and gradient step
     * @param props - Component props containing BABYLON.FactorGradient value and change handler
     * @returns A React component
     */
    export var FactorGradientComponent: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.FactorGradient>>;
    /**
     * Component wrapper for BABYLON.Color3Gradient that provides color picker and gradient step slider
     * @param props - Component props containing BABYLON.Color3Gradient value and change handler
     * @returns A React component
     */
    export var Color3GradientComponent: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.Color3Gradient>>;
    /**
     * Component wrapper for BABYLON.ColorGradient that provides color pickers for color1, color2, and gradient step slider
     * @param props - Component props containing BABYLON.ColorGradient value and change handler
     * @returns A React component
     */
    export var Color4GradientComponent: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.ColorGradient>>;
    /**
     * Component wrapper for BABYLON.GradientBlockColorStep that provides color picker and step slider
     * @param props - Component props containing BABYLON.GradientBlockColorStep value and change handler
     * @returns A React component
     */
    export var ColorStepGradientComponent: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.GradientBlockColorStep>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type Entity = {
        uniqueId: number;
    };
    /**
     * Props for the EntitySelector component
     */
    export type EntitySelectorProps<T extends Entity> = (PrimitiveProps<BABYLON.Nullable<T>> | BABYLON.NodeGeometryEditor.SharedUIComponents.ImmutablePrimitiveProps<BABYLON.Nullable<T>>) & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
    export type DropdownProps<V extends AcceptedDropdownValue> = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<V> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type DraggableLineProps = {
        format: string;
        data: string;
        tooltip: string;
        label: string;
        onDelete?: () => void;
    };
    export var DraggableLine: React.FunctionComponent<DraggableLineProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
    export type ContextMenuProps = BABYLON.NodeGeometryEditor.SharedUIComponents.BasePrimitiveProps & (ContextMenuWithIconProps | ContextMenuWithTriggerProps) & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
    export type ComboBoxProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<string> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type ColorPickerProps<C extends BABYLON.Color3 | BABYLON.Color4> = {
        isLinearMode?: boolean;
    } & BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<C>;
    export var ColorPickerPopup: import("react").ForwardRefExoticComponent<{
        isLinearMode?: boolean;
    } & BasePrimitiveProps & {
        value: BABYLON.Color3 | BABYLON.Color4;
        infoLabel?: InfoLabelParentProps;
    } & {
        onChange: (value: BABYLON.Color3 | BABYLON.Color4) => void;
    } & import("react").RefAttributes<HTMLButtonElement>>;
    export type InputHexProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.Color3 | BABYLON.Color4> & {
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
    type InputHsvFieldProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<BABYLON.Color3 | BABYLON.Color4> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * This is a primitive fluent checkbox that can both read and write checked state
     * @param props
     * @returns Checkbox component
     */
    export var Checkbox: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<boolean>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type ButtonProps = BABYLON.NodeGeometryEditor.SharedUIComponents.BasePrimitiveProps & {
        onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
        icon?: any;
        appearance?: "subtle" | "transparent" | "primary" | "secondary";
        label?: string;
    };
    export var Button: import("react").ForwardRefExoticComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.BasePrimitiveProps & {
        onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
        icon?: any;
        appearance?: "subtle" | "transparent" | "primary" | "secondary";
        label?: string;
    } & import("react").RefAttributes<HTMLButtonElement>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type PaneProps = {
        title: string;
        icon?: any;
    };
    export var Pane: React.FunctionComponent<React.PropsWithChildren<PaneProps>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type FileUploadLineProps = Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.ButtonProps, "onClick" | "label"> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type ButtonLineProps = Omit<BABYLON.NodeGeometryEditor.SharedUIComponents.ButtonProps, "label"> & {
        label: string;
    };
    /**
     * Wraps a button with a label in a line container
     * @param props Button props plus a label
     * @returns A button inside a line
     */
    export var ButtonLine: React.FunctionComponent<ButtonLineProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type TensorPropertyLineProps<V extends BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Vector4 | BABYLON.Quaternion> = BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<V> & BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<V> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Wraps text in a property line
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps and TextProps
     * @returns property-line wrapped text
     */
    export var TextPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<string> & BABYLON.NodeGeometryEditor.SharedUIComponents.ImmutablePrimitiveProps<string>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Wraps textarea in a property line
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps and TextProps
     * @returns property-line wrapped text
     */
    export var TextAreaPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<string> & BABYLON.NodeGeometryEditor.SharedUIComponents.TextareaProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type SyncedSliderPropertyProps = BABYLON.NodeGeometryEditor.SharedUIComponents.SyncedSliderProps & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<number>;
    /**
     * Renders a simple wrapper around the SyncedSliderInput
     * @param props
     * @returns
     */
    export var SyncedSliderPropertyLine: import("react").ForwardRefExoticComponent<SyncedSliderPropertyProps & import("react").RefAttributes<HTMLDivElement>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Wraps a switch in a property line
     * @param props - The properties for the switch and property line
     * @returns A React element representing the property line with a switch
     */
    export var SwitchPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<boolean> & BABYLON.NodeGeometryEditor.SharedUIComponents.SwitchProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type StringifiedPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<number> & BABYLON.NodeGeometryEditor.SharedUIComponents.ImmutablePrimitiveProps<number> & {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export var SpinButtonPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<number> & BABYLON.NodeGeometryEditor.SharedUIComponents.SpinButtonProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
    export var PlaceholderPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<any> & PropertyLineProps<any>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Wraps a link in a property line
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps and BABYLON.NodeGeometryEditor.SharedUIComponents.LinkProps
     * @returns property-line wrapped link
     */
    export var LinkPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<string> & BABYLON.NodeGeometryEditor.SharedUIComponents.LinkProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Wraps a text input in a property line
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps and InputProps
     * @returns property-line wrapped input component
     */
    export var TextInputPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.TextInputProps & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<string>>;
    export type NumberInputPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.SpinButtonProps & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<number>;
    /**
     * Wraps a number input in a property line
     * To force integer values, use forceInt param (this is distinct from the 'step' param, which will still allow submitting an integer value. forceInt will not)
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps and InputProps
     * @returns property-line wrapped input component
     */
    export var NumberInputPropertyLine: React.FunctionComponent<NumberInputPropertyLineProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type HexPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.NumberInputPropertyLineProps & {
        numBits?: 32 | 24 | 16 | 8;
    };
    /**
     * Takes a number representing a Hex value and converts it to a hex string then wraps the TextInput in a PropertyLine
     * @param props - PropertyLineProps
     * @returns property-line wrapped textbox that converts to/from hex number representation
     */
    export var HexPropertyLine: React.FunctionComponent<HexPropertyLineProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type NodeSelectorPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Node>> & BABYLON.NodeGeometryEditor.SharedUIComponents.NodeSelectorProps;
    type MaterialSelectorPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Material>> & BABYLON.NodeGeometryEditor.SharedUIComponents.MaterialSelectorProps;
    type TextureSelectorPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.BaseTexture>> & BABYLON.NodeGeometryEditor.SharedUIComponents.TextureSelectorProps;
    type SkeletonSelectorPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<BABYLON.Nullable<BABYLON.Skeleton>> & BABYLON.NodeGeometryEditor.SharedUIComponents.SkeletonSelectorProps;
    export const NodeSelectorPropertyLine: (props: NodeSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const MaterialSelectorPropertyLine: (props: MaterialSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const TextureSelectorPropertyLine: (props: TextureSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;
    export const SkeletonSelectorPropertyLine: (props: SkeletonSelectorPropertyLineProps) => import("react/jsx-runtime").JSX.Element;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type DropdownPropertyLineProps<V extends BABYLON.NodeGeometryEditor.SharedUIComponents.AcceptedDropdownValue> = BABYLON.NodeGeometryEditor.SharedUIComponents.DropdownProps<V> & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<V>;
    /**
     * Wraps a dropdown in a property line
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps and BABYLON.NodeGeometryEditor.SharedUIComponents.DropdownProps
     * @returns property-line wrapped dropdown
     */
    export var DropdownPropertyLine: import("react").ForwardRefExoticComponent<DropdownPropertyLineProps<BABYLON.NodeGeometryEditor.SharedUIComponents.AcceptedDropdownValue> & import("react").RefAttributes<HTMLDivElement>>;
    /**
     * Dropdown component for number values.
     */
    export var NumberDropdownPropertyLine: React.FunctionComponent<DropdownPropertyLineProps<number>>;
    /**
     * Dropdown component for string values
     */
    export var StringDropdownPropertyLine: React.FunctionComponent<DropdownPropertyLineProps<string>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        type ComboBoxPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.ComboBoxProps & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<string>;
    /**
     * A property line with a filterable ComboBox
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.ComboBoxProps & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps
     * @returns property-line wrapped ComboBox component
     */
    export var ComboBoxPropertyLine: React.FunctionComponent<ComboBoxPropertyLineProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type ColorPropertyLineProps = BABYLON.NodeGeometryEditor.SharedUIComponents.ColorPickerProps<BABYLON.Color3 | BABYLON.Color4> & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<BABYLON.Color3 | BABYLON.Color4>;
    export var Color3PropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.ColorPickerProps<BABYLON.Color3> & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<BABYLON.Color3>>;
    export var Color4PropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.ColorPickerProps<BABYLON.Color4> & BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<BABYLON.Color4>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Wraps a checkbox in a property line
     * @param props - BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps and CheckboxProps
     * @returns property-line wrapped checkbox
     */
    export var CheckboxPropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<boolean> & BABYLON.NodeGeometryEditor.SharedUIComponents.PrimitiveProps<boolean>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Displays an icon indicating enabled (green check) or disabled (red cross) state
     * @param props - The properties for the PropertyLine, including the boolean value to display.
     * @returns A PropertyLine component with a PresenceBadge indicating the boolean state.
     */
    export var BooleanBadgePropertyLine: React.FunctionComponent<BABYLON.NodeGeometryEditor.SharedUIComponents.PropertyLineProps<boolean> & BABYLON.NodeGeometryEditor.SharedUIComponents.ImmutablePrimitiveProps<boolean>>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * A wrapper component for the property tab that provides a consistent layout and styling.
     * It uses a Pane and an Accordion to organize the content, so its direct children
     * must have 'title' props to be compatible with the Accordion structure.
     * @param props The props to pass to the component.
     * @returns The rendered component.
     */
    export var PropertyTabComponentBase: React.FunctionComponent<React.PropsWithChildren>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export function ClassNames(names: any, styleObject: any): string;
    export function JoinClassNames(styleObject: any, ...names: string[]): string;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type ToggleProps = {
        toggled: "on" | "mixed" | "off";
        onToggle?: () => void;
        padded?: boolean;
        color?: "dark" | "light";
    };
    export var Toggle: React.FC<ToggleProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface MessageDialogProps {
        message: string;
        isError: boolean;
        onClose?: () => void;
    }
    export var MessageDialog: React.FC<MessageDialogProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type LabelProps = {
        text: string;
        children?: React.ReactChild;
        color?: "dark" | "light";
    };
    export var Label: React.FC<LabelProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export type IconProps = {
        color?: "dark" | "light";
        icon: string;
    };
    export var Icon: React.FC<IconProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * utility hook to assist using the graph context
     * @returns
     */
    export const useGraphContext: () => IGraphContext;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        interface INumericInputComponentProps {
        label: string;
        labelTooltip?: string;
        value: number;
        step?: number;
        onChange: (value: number) => void;
        precision?: number;
        icon?: string;
        iconLabel?: string;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IColorPickerLineComponentProps {
        value: BABYLON.Color4 | BABYLON.Color3;
        linearHint?: boolean;
        onColorChanged: (newOne: string) => void;
        icon?: string;
        iconLabel?: string;
        shouldPopRight?: boolean;
        lockObject?: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Given a column and row number in the layout, return the corresponding column/row
     * @param layout
     * @param column
     * @param row
     * @returns
     */
    export const getPosInLayout: (layout: BABYLON.NodeGeometryEditor.SharedUIComponents.Layout, column: number, row?: number) => BABYLON.NodeGeometryEditor.SharedUIComponents.LayoutColumn | BABYLON.NodeGeometryEditor.SharedUIComponents.LayoutTabsRow;
    /**
     * Remove a row in position row, column from the layout, and redistribute heights of remaining rows
     * @param layout
     * @param column
     * @param row
     */
    export const removeLayoutRowAndRedistributePercentages: (layout: BABYLON.NodeGeometryEditor.SharedUIComponents.Layout, column: number, row: number) => void;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export var LayoutContext: import("react").Context<{
        /**
         * The layout object
         */
        layout: BABYLON.NodeGeometryEditor.SharedUIComponents.Layout;
        /**
         * Function to set the layout object in the context
         */
        setLayout: (layout: BABYLON.NodeGeometryEditor.SharedUIComponents.Layout) => void;
    }>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Arguments for the TabsContainer component.
     */
    export interface IFlexibleTabsContainerProps {
        /**
         * The tabs to display
         */
        tabs: BABYLON.NodeGeometryEditor.SharedUIComponents.LayoutTab[];
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        item: BABYLON.NodeGeometryEditor.SharedUIComponents.TabDrag;
        /**
         * What happens when the user drops another tab after this one
         */
        onTabDroppedAction: (item: BABYLON.NodeGeometryEditor.SharedUIComponents.TabDrag) => void;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        direction: BABYLON.NodeGeometryEditor.SharedUIComponents.ResizeDirections;
    }
    /**
     * The item that will be sent to the drag event
     */
    export type ResizeItem = {
        /**
         * If the resizing happens in row or column direction
         */
        direction: BABYLON.NodeGeometryEditor.SharedUIComponents.ResizeDirections;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Arguments for the BABYLON.NodeGeometryEditor.SharedUIComponents.Layout component.
     */
    export interface IFlexibleGridLayoutProps {
        /**
         * A definition of the layout which can be changed by the user
         */
        layoutDefinition: BABYLON.NodeGeometryEditor.SharedUIComponents.Layout;
    }
    /**
     * This component represents a grid layout that can be resized and rearranged
     * by the user.
     * @param props properties
     * @returns layout element
     */
    export var FlexibleGridLayout: React.FC<IFlexibleGridLayoutProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
        item: BABYLON.NodeGeometryEditor.SharedUIComponents.TabDrag;
        /**
         * Type of drag event
         */
        type: BABYLON.NodeGeometryEditor.SharedUIComponents.ElementTypes;
    }
    /**
     * An icon that can be dragged by the user
     * @param props properties
     * @returns draggable icon element
     */
    export var DraggableIcon: React.FC<IDraggableIconProps>;



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IHexColorProps {
        value: string;
        expectedLength: number;
        onChange: (value: string) => void;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerComponentProps {
        color: BABYLON.Color3 | BABYLON.Color4;
        linearhint?: boolean;
        debugMode?: boolean;
        onColorChanged?: (color: BABYLON.Color3 | BABYLON.Color4) => void;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IColorComponentEntryProps {
        value: number;
        label: string;
        max?: number;
        min?: number;
        onChange: (value: number) => void;
        disabled?: boolean;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    export class ColorComponentComponentEntry extends React.Component<IColorComponentEntryProps> {
        constructor(props: IColorComponentEntryProps);
        updateValue(valueString: string): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IHexColorProps {
        value: string;
        expectedLength: number;
        onChange: (value: string) => void;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        /**
     * Interface used to specify creation options for color picker
     */
    export interface IColorPickerProps {
        color: BABYLON.Color3 | BABYLON.Color4;
        linearhint?: boolean;
        debugMode?: boolean;
        onColorChanged?: (color: BABYLON.Color3 | BABYLON.Color4) => void;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
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
declare module BABYLON.NodeGeometryEditor {


}
declare module BABYLON.NodeGeometryEditor.SharedUIComponents {
        export interface IColorComponentEntryProps {
        value: number;
        label: string;
        max?: number;
        min?: number;
        onChange: (value: number) => void;
        disabled?: boolean;
        lockObject: BABYLON.NodeGeometryEditor.SharedUIComponents.LockObject;
    }
    export class ColorComponentEntry extends React.Component<IColorComponentEntryProps> {
        constructor(props: IColorComponentEntryProps);
        updateValue(valueString: string): void;
        lock(): void;
        unlock(): void;
        render(): import("react/jsx-runtime").JSX.Element;
    }



}
declare module BABYLON.NodeGeometryEditor {


}


                