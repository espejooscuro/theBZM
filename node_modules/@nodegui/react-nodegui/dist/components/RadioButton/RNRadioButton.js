"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNRadioButton = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNAbstractButton_1 = require("../AbstractComponents/RNAbstractButton");
const setRadioButtonProps = (widget, newProps, oldProps) => {
    const setter = {
    // more setters to be added
    };
    Object.assign(setter, newProps);
    (0, RNAbstractButton_1.setAbstractButtonProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNRadioButton extends nodegui_1.QRadioButton {
    setProps(newProps, oldProps) {
        setRadioButtonProps(this, newProps, oldProps);
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
exports.RNRadioButton = RNRadioButton;
RNRadioButton.tagName = "radiobutton";
