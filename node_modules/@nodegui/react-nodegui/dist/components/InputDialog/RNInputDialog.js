"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNInputDialog = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNDialog_1 = require("../Dialog/RNDialog");
function setInputDialogProps(widget, newProps, oldProps) {
    const setter = {
        set cancelButtonText(cancelButtonText) {
            widget.setCancelButtonText(cancelButtonText);
        },
        set comboBoxEditable(comboBoxEditable) {
            widget.setComboBoxEditable(comboBoxEditable);
        },
        set doubleDecimals(doubleDecimals) {
            widget.setDoubleDecimals(doubleDecimals);
        },
        set doubleMax(doubleMax) {
            widget.setDoubleMaximum(doubleMax);
        },
        set doubleMin(doubleMin) {
            widget.setDoubleMinimum(doubleMin);
        },
        set doubleStep(doubleStep) {
            widget.setDoubleStep(doubleStep);
        },
        set doubleValue(doubleValue) {
            widget.setDoubleValue(doubleValue);
        },
        set inputMode(inputMode) {
            widget.setInputMode(inputMode);
        },
        set intMax(intMax) {
            widget.setIntMaximum(intMax);
        },
        set intMin(intMi) {
            widget.setIntMinimum(intMi);
        },
        set intStep(intStep) {
            widget.setIntStep(intStep);
        },
        set intValue(intValue) {
            widget.setIntValue(intValue);
        },
        set labelText(labelText) {
            widget.setLabelText(labelText);
        },
        set okButtonText(okButtonText) {
            widget.setOkButtonText(okButtonText);
        },
        set options(options) {
            widget.setOptions(options);
        },
        set textEchoMode(textEchoMode) {
            widget.setTextEchoMode(textEchoMode);
        },
        set textValue(textValue) {
            widget.setTextValue(textValue);
        },
    };
    Object.assign(setter, newProps);
    (0, RNDialog_1.setDialogProps)(widget, newProps, oldProps);
}
class RNInputDialog extends nodegui_1.QInputDialog {
    setProps(newProps, oldProps) {
        setInputDialogProps(this, newProps, oldProps);
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
exports.RNInputDialog = RNInputDialog;
RNInputDialog.tagName = "input-dialog";
