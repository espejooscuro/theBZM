"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
const config_1 = require("../config");
const RNView_1 = require("./RNView");
class ViewConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNView_1.RNView.tagName;
    }
    shouldSetTextContent() {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNView_1.RNView();
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
exports.View = (0, config_1.registerComponent)(new ViewConfig());
