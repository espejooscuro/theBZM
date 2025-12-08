"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckBox = void 0;
const config_1 = require("../config");
const RNCheckBox_1 = require("./RNCheckBox");
class CheckBoxConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNCheckBox_1.RNCheckBox.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNCheckBox_1.RNCheckBox();
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
exports.CheckBox = (0, config_1.registerComponent)(new CheckBoxConfig());
