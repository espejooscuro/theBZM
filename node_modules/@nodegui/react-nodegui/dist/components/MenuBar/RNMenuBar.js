"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNMenuBar = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setMenuBarProps = (widget, newProps, oldProps) => {
    const setter = {
        set nativeMenuBar(shouldBeNative) {
            widget.setNativeMenuBar(shouldBeNative);
        },
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
class RNMenuBar extends nodegui_1.QMenuBar {
    setProps(newProps, oldProps) {
        setMenuBarProps(this, newProps, oldProps);
    }
    appendInitialChild(child) {
        if (child instanceof nodegui_1.QMenu) {
            this.addMenu(child);
        }
        else {
            console.warn("MenuBar only supports Menu as its children");
        }
    }
    appendChild(child) {
        this.appendInitialChild(child);
    }
    insertBefore(child, beforeChild) {
        console.warn("Updating menubar is not yet supported. Please help by raising a PR");
        (0, helpers_1.throwUnsupported)(this);
    }
    removeChild(child) {
        console.warn("Updating menubar is not yet supported. Please help by raising a PR");
        (0, helpers_1.throwUnsupported)(this);
    }
}
exports.RNMenuBar = RNMenuBar;
RNMenuBar.tagName = "menubar";
