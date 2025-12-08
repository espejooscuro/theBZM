/// <reference types="react" />
import { ColorDialogProps } from "./RNColorDialog";
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
export declare const ColorDialog: string | import("react").ComponentType<ColorDialogProps>;
