"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const config_1 = require("../config");
const RNProgressBar_1 = require("./RNProgressBar");
class ProgressBarConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNProgressBar_1.RNProgressBar.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNProgressBar_1.RNProgressBar();
        widget.setProps(newProps, {});
        return widget;
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
exports.ProgressBar = (0, config_1.registerComponent)(new ProgressBarConfig());
