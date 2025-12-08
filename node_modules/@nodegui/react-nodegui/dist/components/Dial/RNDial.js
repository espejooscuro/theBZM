"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNDial = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setDialProps = (widget, newProps, oldProps) => {
    const setter = {
        set notchesVisible(notchesVisible) {
            widget.setNotchesVisible(notchesVisible);
        },
        set wrapping(wrapping) {
            widget.setWrapping(wrapping);
        },
        set notchTarget(notchTarget) {
            widget.setNotchTarget(notchTarget);
        },
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNDial extends nodegui_1.QDial {
    setProps(newProps, oldProps) {
        setDialProps(this, newProps, oldProps);
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
exports.RNDial = RNDial;
RNDial.tagName = "dial";
