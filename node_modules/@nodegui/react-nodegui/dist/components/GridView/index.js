"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridView = void 0;
const config_1 = require("../config");
const RNGridView_1 = require("./RNGridView");
class GridViewConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNGridView_1.RNGridView.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNGridView_1.RNGridView();
        widget.setProps(newProps, {
            children: [],
        });
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
exports.GridView = (0, config_1.registerComponent)(new GridViewConfig());
