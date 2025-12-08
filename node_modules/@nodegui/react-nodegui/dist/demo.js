"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const _1 = require(".");
const Button_1 = require("./components/Button");
const View_1 = require("./components/View");
const App = () => {
    return (react_1.default.createElement(_1.Window, { styleSheet: styleSheet },
        react_1.default.createElement(View_1.View, { id: "container" },
            react_1.default.createElement(View_1.View, { id: "textContainer" },
                react_1.default.createElement(_1.Text, null, "Hello")),
            react_1.default.createElement(View_1.View, null,
                react_1.default.createElement(Button_1.Button, { text: "Click me" })))));
};
const styleSheet = `
  #container {
    flex: 1;
    min-height: '100%';
    justify-content: 'center';
  }
  #textContainer {
    flex-direction: 'row';
    justify-content: 'space-around';
    align-items: 'center';
  }
`;
_1.Renderer.render(react_1.default.createElement(App, null));
