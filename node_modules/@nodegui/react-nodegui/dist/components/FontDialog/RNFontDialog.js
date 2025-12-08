"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNFontDialog = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNDialog_1 = require("../Dialog/RNDialog");
function setFontDialogProps(widget, newProps, oldProps) {
    const setter = {
        set currentFont(currentFont) {
            widget.setCurrentFont(currentFont);
        },
        set option({ option, on }) {
            widget.setOption(option, on);
        },
        set options(options) {
            widget.setOptions(options);
        },
    };
    Object.assign(setter, newProps);
    (0, RNDialog_1.setDialogProps)(widget, newProps, oldProps);
}
class RNFontDialog extends nodegui_1.QFontDialog {
    setProps(newProps, oldProps) {
        setFontDialogProps(this, newProps, oldProps);
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
exports.RNFontDialog = RNFontDialog;
RNFontDialog.tagName = "font-dialog";
