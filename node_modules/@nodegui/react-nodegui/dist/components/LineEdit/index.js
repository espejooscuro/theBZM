"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineEdit = void 0;
const config_1 = require("../config");
const RNLineEdit_1 = require("./RNLineEdit");
class LineEditConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNLineEdit_1.RNLineEdit.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNLineEdit_1.RNLineEdit();
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
exports.LineEdit = (0, config_1.registerComponent)(new LineEditConfig());
