"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hot = exports.appProxy = void 0;
const react_proxy_1 = __importDefault(require("react-proxy"));
require("./types");
function hot(Component) {
    if (exports.appProxy) {
        exports.appProxy.update(Component);
    }
    else {
        exports.appProxy = (0, react_proxy_1.default)(Component);
    }
    return exports.appProxy.get();
}
exports.hot = hot;
