/// <reference types="react" />
import { ErrorPromptProps } from "./RNErrorPrompt";
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
export declare const ErrorPrompt: string | import("react").ComponentType<ErrorPromptProps>;
