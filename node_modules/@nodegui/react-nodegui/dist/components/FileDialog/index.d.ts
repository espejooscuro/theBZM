/// <reference types="react" />
import { FileDialogProps } from "./RNFileDialog";
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
export declare const FileDialog: string | import("react").ComponentType<FileDialogProps>;
