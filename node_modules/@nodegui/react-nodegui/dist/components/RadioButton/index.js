"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButton = void 0;
const config_1 = require("../config");
const RNRadioButton_1 = require("./RNRadioButton");
class RadioButtonConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNRadioButton_1.RNRadioButton.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNRadioButton_1.RNRadioButton();
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
exports.RadioButton = (0, config_1.registerComponent)(new RadioButtonConfig());
