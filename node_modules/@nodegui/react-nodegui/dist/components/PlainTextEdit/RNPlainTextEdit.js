"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNPlainTextEdit = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setPlainTextEditProps = (widget, newProps, oldProps) => {
    const setter = {
        set text(text) {
            text ? widget.setPlainText(text) : widget.clear();
        },
        set readOnly(isReadOnly) {
            widget.setReadOnly(isReadOnly);
        },
        set placeholderText(text) {
            widget.setPlaceholderText(text);
        }
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNPlainTextEdit extends nodegui_1.QPlainTextEdit {
    setProps(newProps, oldProps) {
        setPlainTextEditProps(this, newProps, oldProps);
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
exports.RNPlainTextEdit = RNPlainTextEdit;
RNPlainTextEdit.tagName = "plaintextedit";
