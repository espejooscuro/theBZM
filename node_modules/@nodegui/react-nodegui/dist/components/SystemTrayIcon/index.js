"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTrayIcon = void 0;
const config_1 = require("../config");
const RNSystemTrayIcon_1 = require("./RNSystemTrayIcon");
class SystemTrayIconConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNSystemTrayIcon_1.RNSystemTrayIcon.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNSystemTrayIcon_1.RNSystemTrayIcon();
        widget.setProps(newProps, {});
        return widget;
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
exports.SystemTrayIcon = (0, config_1.registerComponent)(new SystemTrayIconConfig());
