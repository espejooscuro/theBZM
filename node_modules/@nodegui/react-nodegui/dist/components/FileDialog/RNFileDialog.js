"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNFileDialog = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNDialog_1 = require("../Dialog/RNDialog");
function setFileDialogProps(widget, newProps, oldProps) {
    const setter = {
        set defaultSuffix(defaultSuffix) {
            widget.setDefaultSuffix(defaultSuffix);
        },
        set supportedSchemes(supportedSchemes) {
            widget.setSupportedSchemes(supportedSchemes);
        },
        set labelText(labelText) {
            widget.setLabelText(labelText.label, labelText.text);
        },
        set option({ option, on }) {
            widget.setOption(option, on);
        },
        set options(options) {
            widget.setOptions(options);
        }
    };
    Object.assign(setter, newProps);
    (0, RNDialog_1.setDialogProps)(widget, newProps, oldProps);
}
class RNFileDialog extends nodegui_1.QFileDialog {
    setProps(newProps, oldProps) {
        setFileDialogProps(this, newProps, oldProps);
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
exports.RNFileDialog = RNFileDialog;
RNFileDialog.tagName = "file-dialog";
