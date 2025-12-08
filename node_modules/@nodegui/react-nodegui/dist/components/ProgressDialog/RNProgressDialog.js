"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNProgressDialog = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNDialog_1 = require("../Dialog/RNDialog");
function setProgressDialogProps(widget, newProps, oldProps) {
    const setter = {
        set shouldReset(shouldReset) {
            shouldReset && widget.reset();
        },
        set autoClose(autoClose) {
            widget.setAutoClose(autoClose);
        },
        set autoReset(autoReset) {
            widget.setAutoReset(autoReset);
        },
        set cancelButtonText(cancelButtonText) {
            widget.setCancelButtonText(cancelButtonText);
        },
        set labelText(labelText) {
            widget.setLabelText(labelText);
        },
        set maxValue(maxValue) {
            widget.setMaximum(maxValue);
        },
        set minValue(minValue) {
            widget.setMinimum(minValue);
        },
        set minDuration(minDuration) {
            widget.setMinimumDuration(minDuration);
        },
        set range({ max, min }) {
            widget.setRange(min, max);
        },
        set value(value) {
            widget.setValue(value);
        },
    };
    Object.assign(setter, newProps);
    (0, RNDialog_1.setDialogProps)(widget, newProps, oldProps);
}
class RNProgressDialog extends nodegui_1.QProgressDialog {
    setProps(newProps, oldProps) {
        setProgressDialogProps(this, newProps, oldProps);
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
exports.RNProgressDialog = RNProgressDialog;
RNProgressDialog.tagName = "progress-dialog";
