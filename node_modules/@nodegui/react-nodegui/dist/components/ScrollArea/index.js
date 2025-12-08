"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollArea = void 0;
const config_1 = require("../config");
const RNScrollArea_1 = require("./RNScrollArea");
class ScrollAreaConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNScrollArea_1.RNScrollArea.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNScrollArea_1.RNScrollArea();
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
exports.ScrollArea = (0, config_1.registerComponent)(new ScrollAreaConfig());
