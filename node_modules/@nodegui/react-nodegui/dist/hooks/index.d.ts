import { DependencyList } from "react";
import { WidgetEventListeners } from "../components/View/RNView";
export declare function useEventHandler<Signals>(eventHandlerMap: Partial<WidgetEventListeners | Signals>, deps: DependencyList): Partial<WidgetEventListeners | Signals>;
