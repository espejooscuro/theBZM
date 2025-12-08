"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const config_1 = require("../config");
const RNAction_1 = require("./RNAction");
class ActionConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNAction_1.RNAction.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNAction_1.RNAction();
        widget.setProps(newProps, {});
        return widget;
    }
    commitMount(instance, newProps, internalInstanceHandle) { }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
exports.Action = (0, config_1.registerComponent)(new ActionConfig());
