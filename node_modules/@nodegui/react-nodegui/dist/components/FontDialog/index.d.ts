/// <reference types="react" />
import { FontDialogProps } from "./RNFontDialog";
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
export declare const FontDialog: string | import("react").ComponentType<FontDialogProps>;
