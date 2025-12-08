import { FunctionComponentElement } from "react";
import { GridColumnProps, RNGridColumn } from "../GridColumn/RNGridColumn";
import { Component } from "@nodegui/nodegui";
import { RNComponent } from "../../config";
import { RNGridView } from "../RNGridView";
import { DataWithOffset } from "../utils";
export declare type GridRowProps = {
    children: Array<FunctionComponentElement<GridColumnProps>> | FunctionComponentElement<GridColumnProps>;
    /**
     * The number of vertical units to occupy
     */
    height?: number;
};
export declare class RNGridRow extends Component implements RNComponent {
    native: any;
    parentGrid?: RNGridView;
    latestProps?: GridRowProps;
    prevProps?: GridRowProps;
    childColumns: Array<DataWithOffset<RNGridColumn>>;
    rowIndex?: number;
    height?: number;
    setParentGridAndUpdateProps(parentGrid: RNGridView, index: number): void;
    updateChildren(startIndex?: number): void;
    remove(): void;
    setProps(newProps: GridRowProps, oldProps: GridRowProps): void;
    appendInitialChild(child: RNGridColumn): void;
    appendChild(child: RNGridColumn): void;
    insertBefore(child: RNGridColumn, beforeChild: RNGridColumn): void;
    removeChild(child: RNGridColumn): void;
    static tagName: string;
}
