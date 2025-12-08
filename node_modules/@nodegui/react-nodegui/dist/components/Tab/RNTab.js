"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNTab = exports.setTabProps = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const RNTabItem_1 = require("../TabItem/RNTabItem");
/**
 * @ignore
 */
const setTabProps = (widget, newProps, oldProps) => {
    const setter = {
        set tabPosition(value) {
            widget.setTabPosition(value);
        }
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
exports.setTabProps = setTabProps;
/**
 * @ignore
 */
class RNTab extends nodegui_1.QTabWidget {
    setProps(newProps, oldProps) {
        (0, exports.setTabProps)(this, newProps, oldProps);
    }
    appendInitialChild(tabItem) {
        if (!(tabItem instanceof RNTabItem_1.RNTabItem)) {
            throw new Error("Children of tab should be of type TabItem");
        }
        if (tabItem.actualTabWidget) {
            this.addTab(tabItem.actualTabWidget, new nodegui_1.QIcon(), "");
            tabItem.parentTab = this;
            (0, RNTabItem_1.setTabItemProps)(tabItem, this, tabItem.initialProps, {});
        }
    }
    appendChild(child) {
        this.appendInitialChild(child);
    }
    insertBefore(child, beforeChild) {
        if (!(child instanceof RNTabItem_1.RNTabItem)) {
            throw new Error("Children of tab should be of type TabItem");
        }
        const index = this.indexOf(beforeChild.actualTabWidget);
        this.insertTab(index, child.actualTabWidget, new nodegui_1.QIcon(), "");
        child.parentTab = this;
        (0, RNTabItem_1.setTabItemProps)(child, this, child.initialProps, {});
    }
    removeChild(child) {
        const childIndex = this.indexOf(child.actualTabWidget);
        this.removeTab(childIndex);
    }
}
exports.RNTab = RNTab;
RNTab.tagName = "tabwidget";
