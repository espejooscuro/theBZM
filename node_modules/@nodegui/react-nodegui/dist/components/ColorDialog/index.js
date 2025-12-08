"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorDialog = void 0;
const config_1 = require("../config");
const RNColorDialog_1 = require("./RNColorDialog");
class ColorDialogConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNColorDialog_1.RNColorDialog.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNColorDialog_1.RNColorDialog();
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
 * Pop up ColorDialog inheriting the functionality of nodegui's `QColorDialog`
 * @example
 * ```javascript
 * function ColorDialogExample(props){
 *  const [open, setOpen] = useState(false);
 *  const events = useEventHandler<QColorDialogSignals>({
 *    colorSelected(color){
 *        //....do whatever
 *    }
 *  }, [....deps])
 *  return (
 *    <View>
 *      <ColorDialog open={open} on={events}/>
 *      <Button text="open dialog" on={{clicked:()=>setOpen(true)}}/>
 *    </View>
 *  )
 * }
 * ```
 */
exports.ColorDialog = (0, config_1.registerComponent)(new ColorDialogConfig());
