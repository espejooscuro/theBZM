"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuBar = void 0;
const config_1 = require("../config");
const RNMenuBar_1 = require("./RNMenuBar");
class MenuBarConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNMenuBar_1.RNMenuBar.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNMenuBar_1.RNMenuBar();
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
exports.MenuBar = (0, config_1.registerComponent)(new MenuBarConfig());
