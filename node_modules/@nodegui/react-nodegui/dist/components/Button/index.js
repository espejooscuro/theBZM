"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const config_1 = require("../config");
const RNButton_1 = require("./RNButton");
class ButtonConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNButton_1.RNButton.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNButton_1.RNButton();
        widget.setProps(newProps, {});
        return widget;
    }
    commitMount(instance, newProps, internalInstanceHandle) {
        if (newProps.visible !== false) {
            instance.show();
        }
        return;
    }
    finalizeInitialChildren(instance, newProps, rootContainerInstance, context) {
        return true;
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
exports.Button = (0, config_1.registerComponent)(new ButtonConfig());
