"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
const config_1 = require("../config");
const RNList_1 = require("./RNList");
class ListConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNList_1.RNList.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNList_1.RNList();
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
 * React implementation of nodegui's [QListWidget](https://docs.nodegui.org/docs/api/generated/classes/qlistwidget/)
 * @example
 * ```javascriptreact
 * return (
 *    <List>
        <ListItem text="NodeGui is great" />
        <ListItem text="This item has a child">
          <View>
            <Text>Hello World</Text>
          </View>
        </ListItem>
      </List>
 * )
 * ```
 */
exports.List = (0, config_1.registerComponent)(new ListConfig());
