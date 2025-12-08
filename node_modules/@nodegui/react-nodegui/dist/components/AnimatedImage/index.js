"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimatedImage = void 0;
const config_1 = require("../config");
const RNAnimatedImage_1 = require("./RNAnimatedImage");
class AnimatedImageConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNAnimatedImage_1.RNAnimatedImage.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNAnimatedImage_1.RNAnimatedImage();
        widget.setProperty("scaledContents", true);
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
exports.AnimatedImage = (0, config_1.registerComponent)(new AnimatedImageConfig());
