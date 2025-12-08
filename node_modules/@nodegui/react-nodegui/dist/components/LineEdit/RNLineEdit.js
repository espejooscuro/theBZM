"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNLineEdit = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setLineEditProps = (widget, newProps, oldProps) => {
    const setter = {
        set text(text) {
            text ? widget.setText(text) : widget.clear();
        },
        set placeholderText(text) {
            widget.setPlaceholderText(text);
        },
        set readOnly(isReadOnly) {
            widget.setReadOnly(isReadOnly);
        },
        set echoMode(mode) {
            widget.setEchoMode(mode);
        }
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNLineEdit extends nodegui_1.QLineEdit {
    setProps(newProps, oldProps) {
        setLineEditProps(this, newProps, oldProps);
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
exports.RNLineEdit = RNLineEdit;
RNLineEdit.tagName = "linedit";
