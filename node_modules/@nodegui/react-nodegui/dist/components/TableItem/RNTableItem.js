"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNTableItem = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const setTableItemProps = (widget, newProps, oldProps) => {
    const setter = {
        set text(text) {
            widget.setText(text);
        },
        set flags(flags) {
            widget.setFlags(flags);
        },
        set checkState(checkState) {
            widget.setCheckState(checkState);
        },
        set data({ role, value }) {
            widget.setData(role, value);
        },
        set background(background) {
            widget.setBackground(background);
        },
        set foreground(foreground) {
            widget.setForeground(foreground);
        },
        set icon(icon) {
            widget.setIcon(icon);
        },
        set selected(selected) {
            widget.setSelected(selected);
        },
        set font(font) {
            widget.setFont(font);
        },
        set hintSize(hintSize) {
            widget.setSizeHint(hintSize);
        },
        set statusTip(statusTip) {
            widget.setStatusTip(statusTip);
        },
        set textAlignment(textAlignment) {
            widget.setTextAlignment(textAlignment);
        },
        set toolTip(toolTip) {
            widget.setToolTip(toolTip);
        },
        set whatsThis(whatsThis) {
            widget.setWhatsThis(whatsThis);
        },
    };
    Object.assign(setter, newProps);
};
/**
 * @ignore
 */
class RNTableItem extends nodegui_1.QTableWidgetItem {
    setProps(newProps, oldProps) {
        this.cellPosition = newProps.cellPosition;
        setTableItemProps(this, newProps, oldProps);
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
exports.RNTableItem = RNTableItem;
RNTableItem.tagName = "table-item";
