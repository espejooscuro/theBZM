import { QMenu, QMenuSignals, Component } from "@nodegui/nodegui";
import { RNWidget } from "../config";
import { ViewProps } from "../View/RNView";
export interface MenuProps extends ViewProps<QMenuSignals> {
    title?: string;
}
export declare class RNMenu extends QMenu implements RNWidget {
    setProps(newProps: MenuProps, oldProps: MenuProps): void;
    appendInitialChild(child: Component): void;
    appendChild(child: Component): void;
    insertBefore(child: Component, beforeChild: Component): void;
    removeChild(child: Component): void;
    static tagName: string;
}
