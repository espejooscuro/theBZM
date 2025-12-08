"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboBox = void 0;
const config_1 = require("../config");
const RNComboBox_1 = require("./RNComboBox");
class ComboBoxConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNComboBox_1.RNComboBox.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNComboBox_1.RNComboBox();
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
exports.ComboBox = (0, config_1.registerComponent)(new ComboBoxConfig());
