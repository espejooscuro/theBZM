/// <reference types="react" />
import { ProgressDialogProps } from "./RNProgressDialog";
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
export declare const ProgressDialog: string | import("react").ComponentType<ProgressDialogProps>;
