"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dial = void 0;
const config_1 = require("../config");
const RNDial_1 = require("./RNDial");
class DialConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNDial_1.RNDial.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNDial_1.RNDial();
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
exports.Dial = (0, config_1.registerComponent)(new DialConfig());
