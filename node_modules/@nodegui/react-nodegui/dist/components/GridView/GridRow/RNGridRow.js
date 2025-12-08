"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNGridRow = void 0;
const RNGridColumn_1 = require("../GridColumn/RNGridColumn");
const nodegui_1 = require("@nodegui/nodegui");
const utils_1 = require("../utils");
const setGridRowProps = (widget, parentGrid, newProps, oldProps) => {
    const setter = {
        set height(height) {
            widget.height = height;
        },
    };
    Object.assign(setter, newProps);
};
class RNGridRow extends nodegui_1.Component {
    constructor() {
        super(...arguments);
        this.childColumns = [];
    }
    setParentGridAndUpdateProps(parentGrid, index) {
        var _a, _b;
        this.parentGrid = parentGrid;
        this.rowIndex = index;
        setGridRowProps(this, parentGrid, (_a = this.latestProps) !== null && _a !== void 0 ? _a : {}, (_b = this.prevProps) !== null && _b !== void 0 ? _b : {});
        this.updateChildren();
    }
    updateChildren(startIndex = 0) {
        (0, utils_1.updateDisplacedChildren)(startIndex, this.childColumns, this, "width", "setParentRowAndUpdateProps");
    }
    remove() {
        this.childColumns.forEach(({ data }) => data.remove());
    }
    /* RNComponent */
    setProps(newProps, oldProps) {
        if (this.parentGrid) {
            setGridRowProps(this, this.parentGrid, newProps, oldProps);
        }
        this.latestProps = newProps;
        this.prevProps = oldProps;
    }
    appendInitialChild(child) {
        this.appendChild(child);
    }
    appendChild(child) {
        if (!(child instanceof RNGridColumn_1.RNGridColumn)) {
            throw new Error("GridColumn is the only supported child of GridRow");
        }
        const offset = (0, utils_1.offsetForIndex)(this.childColumns.length, this.childColumns, "width");
        child.setParentRowAndUpdateProps(this, offset);
        this.childColumns.push({
            offset,
            data: child,
        });
    }
    insertBefore(child, beforeChild) {
        const prevIndex = this.childColumns.findIndex(({ data }) => data === beforeChild);
        if (prevIndex === -1) {
            throw new Error("Attempted to insert child GridColumn before nonexistent column");
        }
        const offset = (0, utils_1.offsetForIndex)(prevIndex, this.childColumns, "width");
        this.childColumns.splice(prevIndex, 0, {
            offset,
            data: child,
        });
        // Update displaced children
        this.updateChildren(prevIndex);
    }
    removeChild(child) {
        const prevIndex = this.childColumns.findIndex(({ data }) => data === child);
        if (prevIndex !== -1) {
            this.childColumns.splice(prevIndex, 1);
            this.updateChildren(prevIndex);
        }
        // Actually remove child from layout
        child.remove();
        child.parentRow = undefined;
    }
}
exports.RNGridRow = RNGridRow;
RNGridRow.tagName = "gridrow";
