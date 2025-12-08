"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Window = void 0;
const config_1 = require("../config");
const RNWindow_1 = require("./RNWindow");
class WindowConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNWindow_1.RNWindow.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const window = new RNWindow_1.RNWindow();
        window.setProps(newProps, {});
        return window;
    }
    finalizeInitialChildren(instance, newProps, rootContainerInstance, context) {
        return true;
    }
    commitMount(instance, newProps, internalInstanceHandle) {
        if (newProps.visible !== false) {
            instance.show();
        }
        return;
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
exports.Window = (0, config_1.registerComponent)(new WindowConfig());
