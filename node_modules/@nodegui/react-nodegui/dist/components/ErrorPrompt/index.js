"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorPrompt = void 0;
const config_1 = require("../config");
const RNErrorPrompt_1 = require("./RNErrorPrompt");
class ErrorPromptConfig extends config_1.ComponentConfig {
    constructor() {
        super(...arguments);
        this.tagName = RNErrorPrompt_1.RNErrorPrompt.tagName;
    }
    shouldSetTextContent(nextProps) {
        return false;
    }
    createInstance(newProps, rootInstance, context, workInProgress) {
        const widget = new RNErrorPrompt_1.RNErrorPrompt();
        widget.setProps(newProps, { message: "" });
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
 * ErrorPrompt inherits the functionality of nodegui's `QErrorMessage`
 * @property `message` the message that needs to be displayed
 * @example
 * ```javascriptreact
 * function ErrorApplet(){
 *  const [open, setOpen] = useState(false);
 *  return (
 *    <View>
 *      <ErrorPrompt open={open} message="Error message!"/>
 *      <Button text="Error" on={{clicked:()=>setOpen(true)}}/>
 *    </View>
 *  )
 * }
 * ```
 */
exports.ErrorPrompt = (0, config_1.registerComponent)(new ErrorPromptConfig());
