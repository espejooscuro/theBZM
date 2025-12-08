"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNTabItem = exports.setTabItemProps = void 0;
const nodegui_1 = require("@nodegui/nodegui");
/**
 * @ignore
 */
const setTabItemProps = (tabItem, parentTab, newProps, oldProps) => {
    if (!tabItem.actualTabWidget) {
        return;
    }
    const tabIndex = parentTab.indexOf(tabItem.actualTabWidget);
    if (tabIndex < 0) {
        console.error("TabItem is not part of the parent tab it references to");
        return;
    }
    const setter = {
        set title(text) {
            parentTab.setTabText(tabIndex, text);
        },
        set icon(qicon) {
            parentTab.setTabIcon(tabIndex, qicon);
        }
    };
    Object.assign(setter, newProps);
};
exports.setTabItemProps = setTabItemProps;
/**
 * @ignore
 */
class RNTabItem extends nodegui_1.Component {
    constructor() {
        super(...arguments);
        this.initialProps = {};
    }
    setProps(newProps, oldProps) {
        if (this.parentTab) {
            (0, exports.setTabItemProps)(this, this.parentTab, newProps, oldProps);
        }
        else {
            this.initialProps = newProps;
        }
    }
    appendInitialChild(child) {
        if (this.actualTabWidget) {
            throw new Error("Tab Item can have only one child");
        }
        this.actualTabWidget = child;
    }
    appendChild(child) {
        this.appendInitialChild(child);
    }
    insertBefore(child, beforeChild) {
        this.appendInitialChild(child);
    }
    removeChild(child) {
        child.close();
        delete this.actualTabWidget;
    }
}
exports.RNTabItem = RNTabItem;
RNTabItem.tagName = "tabitem";
