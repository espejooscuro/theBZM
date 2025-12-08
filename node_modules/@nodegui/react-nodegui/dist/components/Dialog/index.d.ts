/// <reference types="react" />
import { DialogProps } from "./RNDialog";
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
export declare const Dialog: string | import("react").ComponentType<DialogProps<import("@nodegui/nodegui").QDialogSignals>>;
