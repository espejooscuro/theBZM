"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNCheckBox = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNAbstractButton_1 = require("../AbstractComponents/RNAbstractButton");
const setCheckBoxProps = (widget, newProps, oldProps) => {
    const setter = {
        set checked(isChecked) {
            widget.setChecked(isChecked);
        }
    };
    Object.assign(setter, newProps);
    (0, RNAbstractButton_1.setAbstractButtonProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNCheckBox extends nodegui_1.QCheckBox {
    setProps(newProps, oldProps) {
        setCheckBoxProps(this, newProps, oldProps);
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
exports.RNCheckBox = RNCheckBox;
RNCheckBox.tagName = "checkbox";
