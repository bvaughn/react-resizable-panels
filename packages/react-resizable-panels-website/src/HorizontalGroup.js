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
import PanelGroup from "./AutoSizedPanelGroup";
import styles from "./styles.module.css";
import { GROUP_ID as GROUP_ID_VERTICAL, VerticalGroup } from "./VerticalGroup";
export var GROUP_ID = "horizontal";
export default function HorizontalGroup(_a) {
    var clearSavedSizes = _a.clearSavedSizes;
    return (_jsxs(PanelGroup, __assign({ autoSaveId: GROUP_ID, direction: "horizontal" }, { children: [_jsx(Panel, __assign({ className: styles.PanelRow, defaultSize: 0.2, id: "left" }, { children: _jsxs("div", __assign({ className: styles.HorizontalFiller, style: { backgroundColor: "var(--color-horizontal)" } }, { children: [_jsxs("p", __assign({ className: styles.ParagraphOfText }, { children: ["This is a \"", _jsx("em", { children: "horizontal" }), "\" ", _jsx("code", { children: "PanelGroup" })] })), _jsxs("p", __assign({ className: styles.ParagraphOfText }, { children: ["It has an empty/implied resize bar, like", " ", _jsx("a", __assign({ href: "https://replay.io", target: "_blank", rel: "noreferrer noopener" }, { children: "Replay.io" })), "."] }))] })) })), _jsxs(Panel, __assign({ className: styles.PanelRow, defaultSize: 0.4, id: "middle", minSize: 0.25 }, { children: [_jsx(PanelResizeHandle, { className: styles.HorizontalResizeHandle, panelBefore: "left", panelAfter: "middle" }), _jsxs("div", __assign({ className: styles.HorizontalFiller, style: { backgroundColor: "var(--color-horizontal)" } }, { children: [_jsx("h2", { children: "Auto Save" }), _jsxs("p", __assign({ className: styles.ParagraphOfText }, { children: ["This demo uses the ", _jsx("code", { children: "autoSaveId" }), " prop to remember sizes."] })), _jsx("p", __assign({ className: styles.ParagraphOfText }, { children: "Reset saved sizes by clicking the buttons below." })), _jsxs("p", __assign({ className: styles.ParagraphOfText }, { children: [_jsxs("button", __assign({ className: styles.Button, onClick: function () { return clearSavedSizes(GROUP_ID); } }, { children: ["reset horizontal sizes", _jsx("div", { className: styles.HorizontalDot })] })), _jsx("br", {}), _jsxs("button", __assign({ className: styles.Button, onClick: function () { return clearSavedSizes(GROUP_ID_VERTICAL); } }, { children: ["reset vertical sizes", _jsx("div", { className: styles.VerticalDot })] })), _jsx("hr", {}), _jsxs("button", __assign({ className: styles.Button, onClick: function () { return clearSavedSizes(GROUP_ID, GROUP_ID_VERTICAL); } }, { children: ["reset both", _jsx("div", { className: styles.HorizontalDot }), _jsx("div", { className: styles.VerticalDot })] }))] })), _jsx("p", __assign({ className: styles.ParagraphOfText }, { children: "It won't shrink beyond 25% of the total width." }))] })), _jsx(PanelResizeHandle, { className: styles.HorizontalResizeHandle, panelBefore: "middle", panelAfter: "stacked" })] })), _jsx(Panel, __assign({ className: styles.PanelRow, defaultSize: 0.3, id: "stacked" }, { children: _jsx("div", __assign({ className: styles.Grower }, { children: _jsx(VerticalGroup, {}) })) })), _jsxs(Panel, __assign({ className: styles.PanelRow, defaultSize: 0.2, id: "right" }, { children: [_jsx(PanelResizeHandle, { className: styles.HorizontalResizeHandle, panelBefore: "stacked", panelAfter: "right" }), _jsx("div", __assign({ className: styles.HorizontalFiller, style: { backgroundColor: "var(--color-horizontal)" } }, { children: _jsxs("p", __assign({ className: styles.ParagraphOfText }, { children: ["Read more on", " ", _jsx("a", __assign({ href: "https://github.com/bvaughn/react-resizable-panels", target: "_blank", rel: "noreferrer noopener" }, { children: "GitHub" })), "."] })) }))] }))] })));
}
