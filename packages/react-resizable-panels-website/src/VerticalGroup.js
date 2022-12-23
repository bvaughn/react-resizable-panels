var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";
import PanelGroup from "./AutoSizedPanelGroup";
import styles from "./styles.module.css";
export var GROUP_ID = "vertical";
export function VerticalGroup() {
    var _a = useState(false), isPanelHidden = _a[0], setIsPanelHidden = _a[1];
    var hidePanel = function () { return setIsPanelHidden(true); };
    var showPanel = function () { return setIsPanelHidden(false); };
    return (_jsxs(PanelGroup, __assign({ autoSaveId: GROUP_ID, direction: "vertical" }, { children: [_jsx(Panel, __assign({ className: styles.PanelRow, defaultSize: 0.35, id: "top", minSize: 0.25 }, { children: _jsxs("div", __assign({ className: styles.VerticalFillerTop, style: { backgroundColor: "var(--color-vertical)" } }, { children: [_jsxs("p", __assign({ className: styles.ParagraphOfText }, { children: ["This is a \"", _jsx("em", { children: "vertical" }), "\" ", _jsx("code", { children: "PanelGroup" }), "."] })), _jsx("p", __assign({ className: styles.ParagraphOfText }, { children: "It has a solid resize bar, similar to Chrome devtools or VS Code." })), _jsxs("p", __assign({ className: styles.ParagraphOfText }, { children: ["It uses the ", _jsx("code", { children: "minSize" }), " prop to prevent it from shrinking to less than 35% of the total height."] })), isPanelHidden && (_jsx("p", __assign({ className: styles.ParagraphOfText }, { children: _jsx("button", __assign({ className: styles.Button, onClick: showPanel }, { children: "Show the bottom panel" })) })))] })) })), isPanelHidden || (_jsxs(Panel, __assign({ className: styles.PanelColumn, defaultSize: 0.65, id: "bottom", minSize: 0.35 }, { children: [_jsx(PanelResizeHandle, __assign({ panelBefore: "top", panelAfter: "bottom" }, { children: _jsx("div", { className: styles.VerticalResizeBar }) })), _jsxs("div", __assign({ className: styles.VerticalFillerBottom, style: { backgroundColor: "var(--color-vertical)" } }, { children: [_jsx("p", __assign({ className: styles.ParagraphOfText }, { children: "This panel's visibility can be toggled on or off." })), _jsx("p", __assign({ className: styles.ParagraphOfText }, { children: _jsx("button", __assign({ className: styles.Button, onClick: hidePanel }, { children: "Hide this panel" })) }))] }))] })))] })));
}
