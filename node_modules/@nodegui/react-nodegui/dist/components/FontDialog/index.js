"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontDialog = void 0;
const config_1 = require("../config");
const RNFontDialog_1 = require("./RNFontDialog");
class FontDialogConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNFontDialog_1.RNFontDialog.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNFontDialog_1.RNFontDialog();
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
 * Pop up FontDialog inheriting the functionality of nodegui's `QFontDialog`
 * @example
 * ```javascript
 * function FontDialogExample(props){
 *  const [open, setOpen] = useState(false);
 *  const events = useEventHandler<QFontDialogSignals>({
 *    fontSelected(font){
 *        //....do whatever
 *    }
 *  }, [....deps])
 *  return (
 *    <View>
 *      <FontDialog open={open} on={events}/>
 *      <Button text="open dialog" on={{clicked:()=>setOpen(true)}}/>
 *    </View>
 *  )
 * }
 * ```
 */
exports.FontDialog = (0, config_1.registerComponent)(new FontDialogConfig());
