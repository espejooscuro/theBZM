"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAbstractButtonProps = void 0;
const RNView_1 = require("../View/RNView");
function setAbstractButtonProps(widget, newProps, oldProps) {
    const setter = {
        set children(childrenText) {
            widget.setText(childrenText);
        },
        set text(buttonText) {
            widget.setText(buttonText);
        },
        set icon(icon) {
            widget.setIcon(icon);
        },
        set iconSize(iconSize) {
            widget.setIconSize(iconSize);
        },
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
}
exports.setAbstractButtonProps = setAbstractButtonProps;
