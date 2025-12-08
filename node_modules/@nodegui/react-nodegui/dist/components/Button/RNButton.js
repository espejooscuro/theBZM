"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNButton = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNAbstractButton_1 = require("../AbstractComponents/RNAbstractButton");
const helpers_1 = require("../../utils/helpers");
const setButtonProps = (widget, newProps, oldProps) => {
    const setter = {
        set flat(isFlat) {
            widget.setFlat(isFlat);
        }
    };
    Object.assign(setter, newProps);
    (0, RNAbstractButton_1.setAbstractButtonProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNButton extends nodegui_1.QPushButton {
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
    setProps(newProps, oldProps) {
        setButtonProps(this, newProps, oldProps);
    }
}
exports.RNButton = RNButton;
RNButton.tagName = "button";
