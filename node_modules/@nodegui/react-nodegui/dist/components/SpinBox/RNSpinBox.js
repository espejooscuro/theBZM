"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNSpinBox = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setSpinBoxProps = (widget, newProps, oldProps) => {
    const setter = {
        set prefix(prefix) {
            widget.setPrefix(prefix);
        },
        set suffix(suffix) {
            widget.setSuffix(suffix);
        },
        set singleStep(step) {
            widget.setSingleStep(step);
        },
        set range(range) {
            widget.setRange(range.minimum, range.maximum);
        },
        set value(value) {
            widget.setValue(value);
        }
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNSpinBox extends nodegui_1.QSpinBox {
    setProps(newProps, oldProps) {
        setSpinBoxProps(this, newProps, oldProps);
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
exports.RNSpinBox = RNSpinBox;
RNSpinBox.tagName = "spinbox";
