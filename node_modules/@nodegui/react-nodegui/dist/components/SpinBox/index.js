"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinBox = void 0;
const config_1 = require("../config");
const RNSpinBox_1 = require("./RNSpinBox");
class SpinBoxConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNSpinBox_1.RNSpinBox.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNSpinBox_1.RNSpinBox();
        widget.setProps(newProps, {});
        return widget;
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
exports.SpinBox = (0, config_1.registerComponent)(new SpinBoxConfig());
