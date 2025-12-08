"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const config_1 = require("../config");
const RNTable_1 = require("./RNTable");
class TableConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNTable_1.RNTable.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNTable_1.RNTable(newProps.cellRange.row, newProps.cellRange.column);
        widget.setProps(newProps, {});
        return widget;
    }
    commitMount(instance, newProps, internalInstanceHandle) {
        if (newProps.visible !== false) {
            instance.show();
        }
        return;
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
/**
 * React implementation of nodegui's [QTableWidget](https://docs.nodegui.org/docs/api/generated/classes/qtablewidget/)
 * @property `cellRange` define the number of rows & columns to create
 * @example
 * ```javascriptreact
 * return (
 *    <Table
          cellRange={{ row: 2, column: 2 }} // 2 x 2 = 4 cells
          style="flex: 1;"
          horizontalHeaderLabels={["What", "How", "When"]}
          verticalHeaderLabels={["yes", "this", "later"]}
          hideRows={[0]} //hides 0 indexed rows
        >
          <TableItem cellPosition={[0, 0]} text="1" toolTip="Tooltip"/>
          <TableItem cellPosition={[0, 1]} text="2"/>
          <TableItem cellPosition={[1, 0]} text="3"/>
          <TableItem cellPosition={[1, 1]} text="4"/>
      </Table>
 * )
 * ```
 */
exports.Table = (0, config_1.registerComponent)(new TableConfig());
