"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNAction = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const helpers_1 = require("../../utils/helpers");
const setActionProps = (widget, newProps, oldProps) => {
    const setter = {
        set checkable(isCheckable) {
            widget.setCheckable(isCheckable);
        },
        set checked(isChecked) {
            widget.setChecked(isChecked);
        },
        set enabled(isEnabled) {
            widget.setEnabled(isEnabled);
        },
        set font(font) {
            widget.setFont(font);
        },
        set icon(icon) {
            widget.setIcon(icon);
        },
        set id(id) {
            widget.setObjectName(id);
        },
        set on(listenerMap) {
            const listenerMapLatest = Object.assign({}, listenerMap);
            const oldListenerMap = Object.assign({}, oldProps.on);
            Object.entries(oldListenerMap).forEach(([eventType, oldEvtListener]) => {
                const newEvtListener = listenerMapLatest[eventType];
                if (oldEvtListener !== newEvtListener) {
                    widget.removeEventListener(eventType, oldEvtListener);
                }
                else {
                    delete listenerMapLatest[eventType];
                }
            });
            Object.entries(listenerMapLatest).forEach(([eventType, newEvtListener]) => {
                widget.addEventListener(eventType, newEvtListener);
            });
        },
        set separator(isSeparator) {
            widget.setSeparator(isSeparator);
        },
        set shortcut(shortcut) {
            widget.setShortcut(shortcut);
        },
        set shortcutContext(shortcutContext) {
            widget.setShortcutContext(shortcutContext);
        },
        set text(text) {
            widget.setText(text);
        },
    };
    Object.assign(setter, newProps);
};
class RNAction extends nodegui_1.QAction {
    setProps(newProps, oldProps) {
        setActionProps(this, newProps, oldProps);
    }
    appendInitialChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
    appendChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
    insertBefore(child, beforeChild) {
        (0, helpers_1.throwUnsupported)(this);
    }
    removeChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
}
exports.RNAction = RNAction;
RNAction.tagName = "action";
