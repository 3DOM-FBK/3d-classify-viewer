
declare module BABYLON.Accessibility {




    /**
     * The scene tree of the HTML twin. It contain all the top level nodes
     * @param props
     * @returns
     */
    export function HTMLTwinSceneTree(props: {
        scene: BABYLON.Scene;
        options: IHTMLTwinRendererOptions;
    }): JSX.Element;


    /**
     * Context used to update a scene when an entity is added or removed from the accessibility tree.
     */
    export interface ISceneContext {
        updateScene: () => void;
    }
    export var SceneContext: import("react").Context<ISceneContext>;


    /**
     * Options for the HTMLTwinRenderer.
     */
    export interface IHTMLTwinRendererOptions {
        /**
         * If this is true, all GUI controls will be added to the twin tree, regardless if they have
         * a defined accessibility tag or not. If it's false, only controls with an accessibility tag
         * will be added. True by default.
         */
        addAllControls: boolean;
    }
    /**
     * This class is the main entry point for the HTML twin renderer. To render a twin for a scene,
     * simply call HTMLTwinRenderer.Render(scene).
     */
    export class HTMLTwinRenderer {
        /**
         * Render the HTML twin for the given scene.
         * @param scene the scene to render the twin for
         * @param options options for the renderer
         */
        static Render(scene: BABYLON.Scene, options?: IHTMLTwinRendererOptions): void;
    }


    /**
     * A abstract layer to store the html twin tree structure. It is constructed from the BabylonJS scene entities that need to be accessible. It informs the parent-children relationship of html twin tree, and informs how to render: description, isActionable, onclick/onrightclick/onfocus/onblur.
     */
    export class HTMLTwinNodeItem extends HTMLTwinItem {
        /**
         * The corresponding BabylonJS entity. Can be a BABYLON.Node or a Control.
         */
        entity: BABYLON.Node;
        constructor(entity: BABYLON.Node, scene: BABYLON.Scene);
        /**
         * If this entity is actionable (can be clicked).
         */
        get isActionable(): boolean;
        /**
         * If this entity is focusable (can be focused by tab key pressing).
         */
        get isFocusable(): boolean;
        /**
         * Callback when the HTML element is focused. Show visual indication on BabylonJS entity.
         */
        focus(): void;
        /**
         * Callback when the HTML element is blured. Dismiss visual indication on BabylonJS entity.
         */
        blur(): void;
        /**
         * Callback when an event (e.g. click/right click) happens on the HTML element.
         * Implemented by child classes
         * @param eventType - Which event is triggered. E.g. "click", "contextmenu"
         */
        triggerEvent(eventType: string): void;
        private _getTriggerActions;
    }


    /**
     * An adapter that transforms a Accessible entity in a React element. Contains observables for the events that can
     * change the state of the entity or the accesible tree.
     * @param props the props of the adapter
     * @returns
     */
    export function HTMLTwinItemAdapter(props: {
        node: AccessibilityEntity;
        scene: BABYLON.Scene;
        options: IHTMLTwinRendererOptions;
    }): JSX.Element | null;


    /**
     * The BabylonJS entities that can be accessible. It can be a BABYLON.Node or a BABYLON.GUI.Control.
     */
    export type AccessibilityEntity = BABYLON.Node | BABYLON.GUI.Control;
    /**
     * Retrieve an instance of texture with accessible elements (AdvancedDynamicTexture)
     * @param item the item to retrieve the texture from
     * @returns an accessible texture if found, undefined otherwise
     */
    export function getAccessibleTexture(item: AccessibilityEntity): BABYLON.GUI.AdvancedDynamicTexture | undefined;
    /**
     * Get the direct children of an accessible item.
     * @param item an accessible item
     * @returns a list of accessible items
     */
    export function getDirectChildrenOf(item: AccessibilityEntity): AccessibilityEntity[];
    /**
     * Given an accessible item, return if it's visible or not.
     * @param item an accessible item
     * @returns its visibility status
     */
    export function isVisible(item: AccessibilityEntity): boolean;
    /**
     * A abstract layer to store the html twin tree structure. It is constructed from the BabylonJS scene entities that need to be accessible. It informs the parent-children relationship of html twin tree, and informs how to render: description, isActionable, onclick/onrightclick/onfocus/onblur.
     */
    export class HTMLTwinItem {
        /**
         * The corresponding BabylonJS entity. Can be a BABYLON.Node or a BABYLON.GUI.Control.
         */
        entity: AccessibilityEntity;
        /**
         * The BabylonJS scene that the corresponding BabylonJS entity is in.
         */
        scene: BABYLON.Scene;
        /**
         * Constructor of HTMLTwinItem.
         * @param entity - The corresponding BabylonJS entity. Can be a BABYLON.Node or a BABYLON.GUI.Control.
         * @param scene - The BabylonJS scene that the corresponding BabylonJS entity is in.
         */
        constructor(entity: AccessibilityEntity, scene: BABYLON.Scene);
        /**
         * The text content displayed in HTML element.
         * Returns the description in accessibilityTag, if defined (returns "" by default).
         * @param _options - The options to render the HTML twin tree where this item is contained. Not used in this class, but in its children.
         * @returns the text content displayed in HTML element
         */
        getDescription(_options: IHTMLTwinRendererOptions): string;
        /**
         * If this entity is actionable (can be clicked).
         * Implemented by child classes
         */
        get isActionable(): boolean;
        /**
         * If this entity is focusable (can be focused by tab key pressing).
         * Implemented by child classes
         */
        get isFocusable(): boolean;
        /**
         * Callback when the HTML element is focused. Show visual indication on BabylonJS entity.
         * Implemented by child classes
         */
        focus(): void;
        /**
         * Callback when the HTML element is blured. Dismiss visual indication on BabylonJS entity.
         * Implemented by child classes
         */
        blur(): void;
        /**
         * Callback when an event (e.g. click/right click) happens on the HTML element.
         * Implemented by child classes
         * @param _eventType - Which event is triggered. E.g. "click", "contextmenu"
         */
        triggerEvent(_eventType: string): void;
        protected _isActionable: boolean;
        protected _isFocusable: boolean;
    }


    interface IHTMLTwinHostComponentProps {
        scene: BABYLON.Scene;
        options?: IHTMLTwinRendererOptions;
    }
    interface IHTMLTwinHostComponentState {
        a11yTreeItems: HTMLTwinItem[];
    }
    export class HTMLTwinHostComponent extends React.Component<IHTMLTwinHostComponentProps, IHTMLTwinHostComponentState> {
        private _options;
        constructor(props: IHTMLTwinHostComponentProps);
        render(): import("react/jsx-runtime").JSX.Element;
    }


    /**
     * A abstract layer to store the html twin tree structure. It is constructed from the BabylonJS scene entities that need to be accessible. It informs the parent-children relationship of html twin tree, and informs how to render: description, isActionable, onclick/onrightclick/onfocus/onblur.
     */
    export class HTMLTwinGUIItem extends HTMLTwinItem {
        /**
         * The corresponding BabylonJS entity. Can be a Node or a BABYLON.GUI.Control.
         */
        entity: BABYLON.GUI.Control;
        constructor(entity: BABYLON.GUI.Control, scene: BABYLON.Scene);
        /**
         * The text content displayed in HTML element.
         * @param options - Options to render HTML twin tree where this element is contained.
         * @returns The text content displayed in HTML element.
         */
        getDescription(options: IHTMLTwinRendererOptions): string;
        /**
         * If this entity is actionable (can be clicked).
         */
        get isActionable(): boolean;
        /**
         * If this entity is focusable (can be focused by tab key pressing).
         */
        get isFocusable(): boolean;
        /**
         * Callback when the HTML element is focused. Show visual indication on BabylonJS entity.
         */
        focus(): void;
        /**
         * Callback when the HTML element is blured. Dismiss visual indication on BabylonJS entity.
         */
        blur(): void;
        /**
         * Callback when an event (e.g. click/right click) happens on the HTML element.
         * Implemented by child classes
         * @param eventType - Which event is triggered. E.g. "click", "contextmenu"
         */
        triggerEvent(eventType: string): void;
    }


    export interface IHTMLTwinItemComponentProps {
        description: string | undefined;
        children: React.ReactElement[];
        a11yItem: HTMLTwinItem;
    }
    export function HTMLTwinAccessibilityItem(props: IHTMLTwinItemComponentProps): import("react/jsx-runtime").JSX.Element;



}


                