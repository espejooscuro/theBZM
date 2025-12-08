"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputDialog = void 0;
const config_1 = require("../config");
const RNInputDialog_1 = require("./RNInputDialog");
class InputDialogConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNInputDialog_1.RNInputDialog.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNInputDialog_1.RNInputDialog();
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
 * Pop up InputDialog inheriting the functionality of nodegui's `QInputDialog`
 * @example
 * ```javascript
 * function DialogExample(props){
 *  const [open, setOpen] = useState(false);
 *  const events = useEventHandler<QInputDialogSignals>({
 *    textValueChanged(value){
 *        //....do whatever
 *    }
 *  }, [....deps])
 *  return (
 *    <View>
 *      <InputDialog open={open} on={events}/>
 *      <Button text="open dialog" on={{clicked:()=>setOpen(true)}}/>
 *    </View>
 *  )
 * }
 * ```
 */
exports.InputDialog = (0, config_1.registerComponent)(new InputDialogConfig());
