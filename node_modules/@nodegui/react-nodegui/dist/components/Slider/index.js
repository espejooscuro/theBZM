"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slider = void 0;
const RNSlider_1 = require("./RNSlider");
const config_1 = require("../config");
class SliderConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNSlider_1.RNSlider.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNSlider_1.RNSlider();
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
exports.Slider = (0, config_1.registerComponent)(new SliderConfig());
