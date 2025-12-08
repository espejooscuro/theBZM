"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNSlider = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setSliderProps = (widget, newProps, oldProps) => {
    const setter = {
        set tickInterval(tickInterval) {
            widget.setTickInterval(tickInterval);
        },
        set tickPosition(tickPosition) {
            widget.setTickPosition(tickPosition);
        },
        set invertedAppearance(inverted) {
            widget.setInvertedAppearance(inverted);
        },
        set invertedControls(inverted) {
            widget.setInvertedControls(inverted);
        },
        set maximum(maximum) {
            widget.setMaximum(maximum);
        },
        set minimum(minimum) {
            widget.setMinimum(minimum);
        },
        set orientation(orientation) {
            widget.setOrientation(orientation);
        },
        set pageStep(step) {
            widget.setPageStep(step);
        },
        set singleStep(step) {
            widget.setSingleStep(step);
        },
        set isSliderDown(down) {
            widget.setSliderDown(down);
        },
        set sliderPosition(position) {
            widget.setSliderPosition(position);
        },
        set hasTracking(enable) {
            widget.setTracking(enable);
        },
        set value(value) {
            widget.setValue(value);
        },
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNSlider extends nodegui_1.QSlider {
    setProps(newProps, oldProps) {
        setSliderProps(this, newProps, oldProps);
    }
    appendInitialChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
    appendChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
    insertBefore(child, beforeChild) {
        (0, helpers_1.throwUnsupported)(this);
    }
    removeChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
}
exports.RNSlider = RNSlider;
RNSlider.tagName = 'slider';
