"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEventHandler = void 0;
const react_1 = require("react");
function useEventHandler(eventHandlerMap, deps) {
    const handler = (0, react_1.useMemo)(() => {
        return eventHandlerMap;
    }, deps);
    return handler;
}
exports.useEventHandler = useEventHandler;
