"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainTextEdit = void 0;
const config_1 = require("../config");
const RNPlainTextEdit_1 = require("./RNPlainTextEdit");
class PlainTextEditConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNPlainTextEdit_1.RNPlainTextEdit.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNPlainTextEdit_1.RNPlainTextEdit();
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
exports.PlainTextEdit = (0, config_1.registerComponent)(new PlainTextEditConfig());
