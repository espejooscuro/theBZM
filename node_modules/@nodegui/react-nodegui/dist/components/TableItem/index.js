"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableItem = void 0;
const config_1 = require("../config");
const RNTableItem_1 = require("./RNTableItem");
class TableItemConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNTableItem_1.RNTableItem.tagName;
    }
    shouldSetTextContent(nextProps) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNTableItem_1.RNTableItem();
        widget.setProps(newProps, { cellPosition: [0, 0] });
        return widget;
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
/**
 * React implementation of nodegui's [QTableWidgetItem](https://docs.nodegui.org/docs/api/generated/classes/qtablewidgetitem)
 *
 * Can only be used as a child of `<Table/>`
 * @property `cellPosition` valid position of the item in the Table
 */
exports.TableItem = (0, config_1.registerComponent)(new TableItemConfig());
