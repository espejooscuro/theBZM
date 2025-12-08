"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNListItem = exports.setListItemProps = void 0;
const nodegui_1 = require("@nodegui/nodegui");
/**
 * @ignore
  */
const setListItemProps = (widget, newProps, oldProps) => {
    const setter = {
        set title(text) {
            widget.setText(text);
        },
        set icon(qicon) {
            widget.setIcon(qicon);
        }
    };
    Object.assign(setter, newProps);
};
exports.setListItemProps = setListItemProps;
/**
 * @ignore
  */
class RNListItem extends nodegui_1.QListWidgetItem {
    setProps(newProps, oldProps) {
        (0, exports.setListItemProps)(this, newProps, oldProps);
    }
    appendInitialChild(child) {
        if (this.actualListItemWidget) {
            throw new Error("ListItem can have only one child");
        }
        this.actualListItemWidget = child;
    }
    appendChild(child) {
        this.appendInitialChild(child);
    }
    insertBefore(child, beforeChild) {
        this.appendInitialChild(child);
    }
    removeChild(child) {
        if (child) {
            child.close();
        }
        if (this.actualListItemWidget) {
            delete this.actualListItemWidget;
        }
    }
}
exports.RNListItem = RNListItem;
RNListItem.tagName = "listitem";
