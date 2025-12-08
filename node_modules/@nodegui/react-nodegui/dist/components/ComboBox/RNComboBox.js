"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNComboBox = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNView_1 = require("../View/RNView");
const helpers_1 = require("../../utils/helpers");
const setComboBoxProps = (widget, newProps, oldProps) => {
    const setter = {
        set items(items) {
            widget.clear();
            items.forEach(item => {
                widget.addItem(item.icon, item.text, item.userData);
            });
        },
        set count(count) {
            widget.setProperty("count", count);
        },
        set iconSize(iconSize) {
            widget.setProperty("iconSize", iconSize.native);
        },
        set frame(frame) {
            widget.setProperty("frame", frame);
        },
        set currentIndex(currentIndex) {
            widget.setProperty("currentIndex", currentIndex);
        },
        set currentData(value) {
            widget.setProperty("currentData", value.native);
        },
        set currentText(text) {
            widget.setProperty("currentText", text);
        },
        set duplicatesEnabled(enabled) {
            widget.setProperty("duplicatesEnabled", enabled);
        },
        set editable(enabled) {
            widget.setProperty("editable", enabled);
        },
        set insertPolicy(policy) {
            widget.setProperty("insertPolicy", policy);
        },
        set maxCount(count) {
            widget.setProperty("maxCount", count);
        },
        set maxVisibleItems(count) {
            widget.setProperty("maxVisibleItems", count);
        },
        set minimumContentsLength(count) {
            widget.setProperty("minimumContentsLength", count);
        },
        set modelColumn(column) {
            widget.setProperty("modelColumn", column);
        },
        set sizeAdjustPolicy(policy) {
            widget.setProperty("sizeAdjustPolicy", policy);
        }
    };
    Object.assign(setter, newProps);
    (0, RNView_1.setViewProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNComboBox extends nodegui_1.QComboBox {
    setProps(newProps, oldProps) {
        setComboBoxProps(this, newProps, oldProps);
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
exports.RNComboBox = RNComboBox;
RNComboBox.tagName = "combobox";
