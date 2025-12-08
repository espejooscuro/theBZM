"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNErrorPrompt = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNDialog_1 = require("../Dialog/RNDialog");
function setErrorPromptProps(widget, newProps, oldProps) {
    const setter = {
        set message(message) {
            widget.showMessage(message);
            widget.close();
        },
    };
    Object.assign(setter, newProps);
    (0, RNDialog_1.setDialogProps)(widget, newProps, oldProps);
}
class RNErrorPrompt extends nodegui_1.QErrorMessage {
    setProps(newProps, oldProps) {
        setErrorPromptProps(this, newProps, oldProps);
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
exports.RNErrorPrompt = RNErrorPrompt;
RNErrorPrompt.tagName = "error-prompt";
