"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = void 0;
const config_1 = require("../config");
const RNText_1 = require("./RNText");
class TextConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNText_1.RNText.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNText_1.RNText();
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
exports.Text = (0, config_1.registerComponent)(new TextConfig());
