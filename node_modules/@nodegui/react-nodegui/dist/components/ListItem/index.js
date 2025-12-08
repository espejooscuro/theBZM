"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListItem = void 0;
const config_1 = require("../config");
const RNListItem_1 = require("./RNListItem");
class ListItemConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNListItem_1.RNListItem.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const item = new RNListItem_1.RNListItem();
        item.setProps(newProps, {});
        return item;
    }
    finalizeInitialChildren(instance, newProps, rootContainerInstance, context) {
        return false;
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
exports.ListItem = (0, config_1.registerComponent)(new ListItemConfig());
