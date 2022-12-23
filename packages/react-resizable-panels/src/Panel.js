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
import { jsx as _jsx } from "react/jsx-runtime";
import { useContext, useLayoutEffect } from "react";
import { PanelGroupContext } from "./PanelContexts";
// TODO [panels]
// Support min pixel size too.
// PanelGroup should warn if total width is less min pixel widths.
export default function Panel(_a) {
    var _b = _a.children, children = _b === void 0 ? null : _b, _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.defaultSize, defaultSize = _d === void 0 ? 0.1 : _d, id = _a.id, _e = _a.minSize, minSize = _e === void 0 ? 0.1 : _e;
    var context = useContext(PanelGroupContext);
    if (context === null) {
        throw Error("Panel components must be rendered within a PanelGroup container");
    }
    if (minSize > defaultSize) {
        console.error("Panel minSize ".concat(minSize, " cannot be greater than defaultSize ").concat(defaultSize));
        defaultSize = minSize;
    }
    var getPanelStyle = context.getPanelStyle, registerPanel = context.registerPanel, unregisterPanel = context.unregisterPanel;
    useLayoutEffect(function () {
        var panel = {
            defaultSize: defaultSize,
            id: id,
            minSize: minSize
        };
        registerPanel(id, panel);
        return function () {
            unregisterPanel(id);
        };
    }, [defaultSize, id, minSize, registerPanel, unregisterPanel]);
    var style = getPanelStyle(id);
    return (_jsx("div", __assign({ className: className, style: style }, { children: children })));
}
