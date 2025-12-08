"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressDialog = void 0;
const config_1 = require("../config");
const RNProgressDialog_1 = require("./RNProgressDialog");
class ProgressDialogConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNProgressDialog_1.RNProgressDialog.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNProgressDialog_1.RNProgressDialog();
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
 * Pop up ProgressDialog inheriting the functionality of nodegui's `QProgressDialog`
 * @example
 * ```javascript
 * function ProgressDialogExample(props){
 *  const [open, setOpen] = useState(false);
 *  const events = useEventHandler<QProgressDialogSignals>({
 *    canceled(){
 *        setOpen(false);
 *        //....do whatever
 *    }
 *  }, [....deps])
 * const [value, setValue] = useState(0);
 *  return (
 *    <View>
 *      <ProgressDialog
 *        open={open}
 *        on={events}
 *        maxValue={100}
 *        minValue={0}
 *        value={value}
 *      />
 *      <Button text="open dialog" on={{clicked:()=>setOpen(true)}}/>
 *      <Button
 *        text="Progress"
 *        on={{clicked:()=>open && value < 100 &&setValue(value+5)}}
 *      />
 *    </View>
 *  )
 * }
 * ```
 */
exports.ProgressDialog = (0, config_1.registerComponent)(new ProgressDialogConfig());
