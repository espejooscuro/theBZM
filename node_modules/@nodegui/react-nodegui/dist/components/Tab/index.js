"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = void 0;
const config_1 = require("../config");
const RNTab_1 = require("./RNTab");
class TabsConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNTab_1.RNTab.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNTab_1.RNTab();
        widget.setProps(newProps, {});
        return widget;
    }
    commitMount(instance, newProps, internalInstanceHandle) {
        if (newProps.visible !== false) {
            instance.show();
        }
    }
    finalizeInitialChildren(instance, newProps, rootContainerInstance, context) {
        return true;
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
exports.Tabs = (0, config_1.registerComponent)(new TabsConfig());
