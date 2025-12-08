"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menu = void 0;
const config_1 = require("../config");
const RNMenu_1 = require("./RNMenu");
class MenuConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNMenu_1.RNMenu.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNMenu_1.RNMenu();
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
exports.Menu = (0, config_1.registerComponent)(new MenuConfig());
