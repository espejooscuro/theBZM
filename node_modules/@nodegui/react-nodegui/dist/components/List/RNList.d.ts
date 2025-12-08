import { QListWidget, QListWidgetSignals } from "@nodegui/nodegui";
import { ViewProps } from "../View/RNView";
import { RNComponent } from "../config";
import { RNListItem } from "../ListItem/RNListItem";
export interface ListProps extends ViewProps<QListWidgetSignals> {
}
declare type CustomListProps = ListProps;
/**
 * @ignore
  */
export declare const setListProps: (widget: RNList, newProps: CustomListProps, oldProps: CustomListProps) => void;
/**
 * @ignore
  */
export declare class RNList extends QListWidget implements RNComponent {
    setProps(newProps: CustomListProps, oldProps: CustomListProps): void;
    removeChild(child: RNListItem): void;
    appendInitialChild(child: RNListItem): void;
    appendChild(child: RNListItem): void;
    insertBefore(child: RNListItem, beforeChild: RNListItem): void;
    static tagName: string;
}
export {};
