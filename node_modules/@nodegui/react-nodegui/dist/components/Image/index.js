"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
const config_1 = require("../config");
const RNImage_1 = require("./RNImage");
const nodegui_1 = require("@nodegui/nodegui");
class ImageConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNImage_1.RNImage.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNImage_1.RNImage();
        widget.setProperty("scaledContents", true);
        widget.setProps(newProps, {});
        widget.addEventListener(nodegui_1.WidgetEventTypes.Resize, () => {
            widget.scalePixmap(widget.size());
        });
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
exports.Image = (0, config_1.registerComponent)(new ImageConfig());
