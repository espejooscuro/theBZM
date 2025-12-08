"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxView = void 0;
const config_1 = require("../config");
const RNBoxView_1 = require("./RNBoxView");
class BoxViewConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNBoxView_1.RNBoxView.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNBoxView_1.RNBoxView();
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
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
exports.BoxView = (0, config_1.registerComponent)(new BoxViewConfig());
