"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDialog = void 0;
const config_1 = require("../config");
const RNFileDialog_1 = require("./RNFileDialog");
class FileDialogConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNFileDialog_1.RNFileDialog.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNFileDialog_1.RNFileDialog();
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
 * Pop up FileDialog inheriting the functionality of nodegui's `QFileDialog`
 * @example
 * ```javascript
 * function DialogExample(props){
 *  const [open, setOpen] = useState(false);
 *  const events = useEventHandler<QFileDialogSignals>({
 *    fileSelected(file){
 *        //....do whatever
 *    }
 *  }, [....deps])
 *  return (
 *    <View>
 *      <FileDialog open={open} on={events}/>
 *      <Button text="open dialog" on={{clicked:()=>setOpen(true)}}/>
 *    </View>
 *  )
 * }
 * ```
 */
exports.FileDialog = (0, config_1.registerComponent)(new FileDialogConfig());
