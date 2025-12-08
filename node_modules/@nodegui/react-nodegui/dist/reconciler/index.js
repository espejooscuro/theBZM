"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appContainer = void 0;
const react_reconciler_1 = __importDefault(require("react-reconciler"));
const nodegui_1 = require("@nodegui/nodegui");
const config_1 = require("../components/config");
exports.appContainer = new Set();
const shouldIgnoreChild = (child) => child instanceof nodegui_1.QSystemTrayIcon;
const HostConfig = {
    now: Date.now,
    getRootHostContext: function (nextRootInstance) {
        let context = {
            name: "rootnode"
        };
        return context;
    },
    getChildHostContext: function (parentContext, fiberType, rootInstance) {
        const { getContext } = (0, config_1.getComponentByTagName)(fiberType);
        return getContext(parentContext, rootInstance);
    },
    shouldSetTextContent: function (type, nextProps) {
        const { shouldSetTextContent } = (0, config_1.getComponentByTagName)(type);
        return shouldSetTextContent(nextProps);
    },
    createTextInstance: function (newText, rootContainerInstance, context, workInProgress) {
        // throw new Error(`Can't create text without <Text> for text: ${newText}`);
        console.warn("createTextInstance called in reconciler when platform doesnt have host level text. ");
        console.warn(`Use <Text /> component to add the text: ${newText}`);
    },
    createInstance: function (type, newProps, rootContainerInstance, context, workInProgress) {
        const { createInstance } = (0, config_1.getComponentByTagName)(type);
        return createInstance(newProps, rootContainerInstance, context, workInProgress);
    },
    appendInitialChild: function (parent, child) {
        if (shouldIgnoreChild(child)) {
            return;
        }
        parent.appendInitialChild(child);
    },
    finalizeInitialChildren: function (instance, type, newProps, rootContainerInstance, context) {
        const { finalizeInitialChildren } = (0, config_1.getComponentByTagName)(type);
        return finalizeInitialChildren(instance, newProps, rootContainerInstance, context);
    },
    prepareForCommit: function (rootNode) {
        // noop
    },
    resetAfterCommit: function (rootNode) {
        // noop
    },
    commitMount: function (instance, type, newProps, internalInstanceHandle) {
        const { commitMount } = (0, config_1.getComponentByTagName)(type);
        return commitMount(instance, newProps, internalInstanceHandle);
    },
    appendChildToContainer: function (container, child) {
        container.add(child);
    },
    insertInContainerBefore: (container, child, beforeChild) => {
        container.add(child);
    },
    removeChildFromContainer: (container, child) => {
        container.delete(child);
        if (child.close) {
            child.close();
        }
    },
    prepareUpdate: function (instance, type, oldProps, newProps, rootContainerInstance, hostContext) {
        const { prepareUpdate } = (0, config_1.getComponentByTagName)(type);
        return prepareUpdate(instance, oldProps, newProps, rootContainerInstance, hostContext);
    },
    commitUpdate: function (instance, updatePayload, type, oldProps, newProps, finishedWork) {
        const { commitUpdate } = (0, config_1.getComponentByTagName)(type);
        return commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork);
    },
    appendChild: (parent, child) => {
        if (shouldIgnoreChild(child)) {
            return;
        }
        parent.appendChild(child);
    },
    insertBefore: (parent, child, beforeChild) => {
        if (shouldIgnoreChild(child)) {
            return;
        }
        parent.insertBefore(child, beforeChild);
    },
    removeChild: (parent, child) => {
        if (!shouldIgnoreChild(child)) {
            parent.removeChild(child);
        }
        if (child.close) {
            child.close();
        }
    },
    commitTextUpdate: (textInstance, oldText, newText) => {
        //noop since we manage all text using Text component
        console.warn("commitTextUpdate called when platform doesnt have host level text");
    },
    resetTextContent: instance => {
        console.warn("resetTextContent in reconciler triggered!");
        // noop for now till we find when this method is triggered
    },
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    getPublicInstance: instance => {
        //for supporting refs
        return instance;
    },
    shouldDeprioritizeSubtree: (type, props) => {
        // Use to deprioritize entire subtree based on props and types. For example if you dont need reconciler to calculate for hidden elements
        if (props.visible === false) {
            return true;
        }
        return false;
    },
    //@ts-ignore
    hideInstance: (instance) => {
        instance.hide();
    },
    unhideInstance: (instance, Props) => {
        instance.show();
    },
    hideTextInstance: (instance) => {
        // noop since we dont have any host text
        console.warn("hideTextInstance called when platform doesnt have host level text");
    },
    unhideTextInstance: (instance, Props) => {
        // noop since we dont have any host text
        console.warn("unhideTextInstance called when platform doesnt have host level text");
    },
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    isPrimaryRenderer: true
};
exports.default = (0, react_reconciler_1.default)(HostConfig);
