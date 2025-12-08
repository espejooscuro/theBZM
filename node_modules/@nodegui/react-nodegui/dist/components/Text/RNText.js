"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNText = exports.setTextProps = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
/**
 * @ignore
 */
const setTextProps = (widget, newProps, oldProps) => {
    const setter = {
        set children(text) {
            text = Array.isArray(text) ? text.join('') : text;
            widget.setText(text);
        },
        set wordWrap(shouldWrap) {
            widget.setWordWrap(shouldWrap);
        },
        set scaledContents(scaled) {
            widget.setProperty('scaledContents', scaled);
        },
        set openExternalLinks(shouldOpenExternalLinks) {
            widget.setProperty('openExternalLinks', shouldOpenExternalLinks);
        },
        set textInteractionFlags(interactionFlag) {
            widget.setProperty('textInteractionFlags', interactionFlag);
        }
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
exports.setTextProps = setTextProps;
/**
 * @ignore
 */
class RNText extends nodegui_1.QLabel {
    setProps(newProps, oldProps) {
        (0, exports.setTextProps)(this, newProps, oldProps);
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
exports.RNText = RNText;
RNText.tagName = 'text';
