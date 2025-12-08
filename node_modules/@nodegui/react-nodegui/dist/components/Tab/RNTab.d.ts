import { QTabWidget, QTabWidgetSignals, TabPosition } from "@nodegui/nodegui";
import { ViewProps } from "../View/RNView";
import { RNComponent } from "../config";
import { RNTabItem } from "../TabItem/RNTabItem";
export interface TabProps extends ViewProps<QTabWidgetSignals> {
    tabPosition?: TabPosition;
}
/**
 * @ignore
 */
export declare const setTabProps: (widget: RNTab, newProps: TabProps, oldProps: TabProps) => void;
/**
 * @ignore
 */
export declare class RNTab extends QTabWidget implements RNComponent {
    setProps(newProps: TabProps, oldProps: TabProps): void;
    appendInitialChild(tabItem: RNTabItem): void;
    appendChild(child: RNTabItem): void;
    insertBefore(child: RNTabItem, beforeChild: RNTabItem): void;
    removeChild(child: RNTabItem): void;
    static tagName: string;
}
