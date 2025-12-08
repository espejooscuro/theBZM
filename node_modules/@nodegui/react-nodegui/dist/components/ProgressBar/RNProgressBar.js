"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNProgressBar = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setProgressBarProps = (widget, newProps, oldProps) => {
    const setter = {
        set value(val) {
            widget.setValue(val);
        },
        set minimum(min) {
            widget.setMinimum(min);
        },
        set maximum(max) {
            widget.setMaximum(max);
        },
        set orientation(orientation) {
            widget.setOrientation(orientation);
        }
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNProgressBar extends nodegui_1.QProgressBar {
    setProps(newProps, oldProps) {
        setProgressBarProps(this, newProps, oldProps);
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
exports.RNProgressBar = RNProgressBar;
RNProgressBar.tagName = "progressbar";
