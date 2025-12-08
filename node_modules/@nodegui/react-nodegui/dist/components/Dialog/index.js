"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = void 0;
const config_1 = require("../config");
const RNDialog_1 = require("./RNDialog");
class DialogConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNDialog_1.RNDialog.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    finalizeInitialChildren(instance, newProps, rootContainerInstance, context) {
        return true;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNDialog_1.RNDialog();
        widget.setProps(newProps, {});
        return widget;
    }
    commitMount(instance, newProps, internalInstanceHandle) {
        if (newProps.visible !== false && newProps.open !== false) {
            instance.show();
        }
        return;
    }
    commitUpdate(instance, updatePayload, oldProps, newProps, finishedWork) {
        instance.setProps(newProps, oldProps);
    }
}
/**
 * Pop up Dialog inheriting the functionality of nodegui's `QDialog`
 * @param minSize set minimum height, width to prevent errors
 * @example
 * ```javascript
 * function DialogExample(props){
 *  const [open, setOpen] = useState(false);
 *  return (
 *    <View>
 *      <Dialog open={open}>
 *        <View>{....other components}</View>
 *      </Dialog>
 *      <Button text="open dialog" on={{clicked:()=>setOpen(true)}}/>
 *    </View>
 *  )
 * }
 * ```
 */
exports.Dialog = (0, config_1.registerComponent)(new DialogConfig());
