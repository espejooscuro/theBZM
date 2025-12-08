"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNMenu = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const RNAction_1 = require("../Action/RNAction");
const RNView_1 = require("../View/RNView");
const setMenuProps = (widget, newProps, oldProps) => {
    const setter = {
        set title(title) {
            widget.setTitle(title);
        },
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
class RNMenu extends nodegui_1.QMenu {
    setProps(newProps, oldProps) {
        setMenuProps(this, newProps, oldProps);
    }
    appendInitialChild(child) {
        this.appendChild(child);
    }
    appendChild(child) {
        if (!(child instanceof RNAction_1.RNAction)) {
            console.warn("Menu only supports Action as its children");
            return;
        }
        this.addAction(child);
    }
    insertBefore(child, beforeChild) {
        (0, helpers_1.throwUnsupported)(this);
    }
    removeChild(child) {
        if (child instanceof RNAction_1.RNAction) {
            this.removeAction(child);
        }
    }
}
exports.RNMenu = RNMenu;
RNMenu.tagName = "menu";
