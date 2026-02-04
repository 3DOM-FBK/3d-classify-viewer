
declare module "babylonjs-accessibility/index" {
export * from "babylonjs-accessibility/HtmlTwin/index";

}
declare module "babylonjs-accessibility/legacy/legacy" {
export * from "babylonjs-accessibility/index";

}
declare module "babylonjs-accessibility/HtmlTwin/index" {
export * from "babylonjs-accessibility/HtmlTwin/htmlTwinRenderer";

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinSceneTree" {
import { Scene } from "babylonjs/scene";
import { IHTMLTwinRendererOptions } from "babylonjs-accessibility/HtmlTwin/htmlTwinRenderer";
/**
 * The scene tree of the HTML twin. It contain all the top level nodes
 * @param props
 * @returns
 */
export function HTMLTwinSceneTree(props: {
    scene: Scene;
    options: IHTMLTwinRendererOptions;
}): JSX.Element;

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinSceneContext" {
/**
 * Context used to update a scene when an entity is added or removed from the accessibility tree.
 */
export interface ISceneContext {
    updateScene: () => void;
}
export const SceneContext: import("react").Context<ISceneContext>;

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinRenderer" {
import { Scene } from "babylonjs/scene";
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
    static Render(scene: Scene, options?: IHTMLTwinRendererOptions): void;
}

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinNodeItem" {
import { Node } from "babylonjs/node";
import { Scene } from "babylonjs/scene";
import { HTMLTwinItem } from "babylonjs-accessibility/HtmlTwin/htmlTwinItem";
/**
 * A abstract layer to store the html twin tree structure. It is constructed from the BabylonJS scene entities that need to be accessible. It informs the parent-children relationship of html twin tree, and informs how to render: description, isActionable, onclick/onrightclick/onfocus/onblur.
 */
export class HTMLTwinNodeItem extends HTMLTwinItem {
    /**
     * The corresponding BabylonJS entity. Can be a Node or a Control.
     */
    entity: Node;
    constructor(entity: Node, scene: Scene);
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

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinItemAdapter" {
import { AccessibilityEntity } from "babylonjs-accessibility/HtmlTwin/htmlTwinItem";
import { Scene } from "babylonjs/scene";
import { IHTMLTwinRendererOptions } from "babylonjs-accessibility/HtmlTwin/htmlTwinRenderer";
/**
 * An adapter that transforms a Accessible entity in a React element. Contains observables for the events that can
 * change the state of the entity or the accesible tree.
 * @param props the props of the adapter
 * @returns
 */
export function HTMLTwinItemAdapter(props: {
    node: AccessibilityEntity;
    scene: Scene;
    options: IHTMLTwinRendererOptions;
}): JSX.Element | null;

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinItem" {
import { Node } from "babylonjs/node";
import { Scene } from "babylonjs/scene";
import { AdvancedDynamicTexture } from "babylonjs-gui/2D/advancedDynamicTexture";
import { Control } from "babylonjs-gui/2D/controls/control";
import { IHTMLTwinRendererOptions } from "babylonjs-accessibility/HtmlTwin/htmlTwinRenderer";
/**
 * The BabylonJS entities that can be accessible. It can be a Node or a Control.
 */
export type AccessibilityEntity = Node | Control;
/**
 * Retrieve an instance of texture with accessible elements (AdvancedDynamicTexture)
 * @param item the item to retrieve the texture from
 * @returns an accessible texture if found, undefined otherwise
 */
export function getAccessibleTexture(item: AccessibilityEntity): AdvancedDynamicTexture | undefined;
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
     * The corresponding BabylonJS entity. Can be a Node or a Control.
     */
    entity: AccessibilityEntity;
    /**
     * The BabylonJS scene that the corresponding BabylonJS entity is in.
     */
    scene: Scene;
    /**
     * Constructor of HTMLTwinItem.
     * @param entity - The corresponding BabylonJS entity. Can be a Node or a Control.
     * @param scene - The BabylonJS scene that the corresponding BabylonJS entity is in.
     */
    constructor(entity: AccessibilityEntity, scene: Scene);
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

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinHostComponent" {
import * as React from "react";
import { HTMLTwinItem } from "babylonjs-accessibility/HtmlTwin/htmlTwinItem";
import { Scene } from "babylonjs/scene";
import { IHTMLTwinRendererOptions } from "babylonjs-accessibility/HtmlTwin/htmlTwinRenderer";
interface IHTMLTwinHostComponentProps {
    scene: Scene;
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
export {};

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinGUIItem" {
import { Scene } from "babylonjs/scene";
import { Control } from "babylonjs-gui/2D/controls/control";
import { HTMLTwinItem } from "babylonjs-accessibility/HtmlTwin/htmlTwinItem";
import { IHTMLTwinRendererOptions } from "babylonjs-accessibility/HtmlTwin/htmlTwinRenderer";
/**
 * A abstract layer to store the html twin tree structure. It is constructed from the BabylonJS scene entities that need to be accessible. It informs the parent-children relationship of html twin tree, and informs how to render: description, isActionable, onclick/onrightclick/onfocus/onblur.
 */
export class HTMLTwinGUIItem extends HTMLTwinItem {
    /**
     * The corresponding BabylonJS entity. Can be a Node or a Control.
     */
    entity: Control;
    constructor(entity: Control, scene: Scene);
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

}
declare module "babylonjs-accessibility/HtmlTwin/htmlTwinAccessibilityItem" {
import { ReactElement } from "react";
import { HTMLTwinItem } from "babylonjs-accessibility/HtmlTwin/htmlTwinItem";
export interface IHTMLTwinItemComponentProps {
    description: string | undefined;
    children: ReactElement[];
    a11yItem: HTMLTwinItem;
}
export function HTMLTwinAccessibilityItem(props: IHTMLTwinItemComponentProps): import("react/jsx-runtime").JSX.Element;

}

declare module "babylonjs-accessibility" {
    export * from "babylonjs-accessibility/legacy/legacy";
}


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


