/// <reference types="react" />
import { InputDialogProps } from "./RNInputDialog";
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
export declare const InputDialog: string | import("react").ComponentType<InputDialogProps>;
