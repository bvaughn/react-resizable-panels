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
import { useContext, useEffect, useState } from "react";
import { PanelGroupContext } from "./PanelContexts";
export default function PanelResizeHandle(_a) {
    var _b = _a.children, children = _b === void 0 ? null : _b, _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, panelAfter = _a.panelAfter, panelBefore = _a.panelBefore;
    var context = useContext(PanelGroupContext);
    if (context === null) {
        throw Error("PanelResizeHandle components must be rendered within a PanelGroup container");
    }
    var direction = context.direction, registerResizeHandle = context.registerResizeHandle;
    var _e = useState(null), resizeHandler = _e[0], setResizeHandler = _e[1];
    var _f = useState(false), isDragging = _f[0], setIsDragging = _f[1];
    useEffect(function () {
        if (disabled) {
            setResizeHandler(null);
        }
        else {
            setResizeHandler(function () { return registerResizeHandle(panelBefore, panelAfter); });
        }
    }, [disabled, panelAfter, panelBefore, registerResizeHandle]);
    useEffect(function () {
        if (disabled || resizeHandler == null || !isDragging) {
            return;
        }
        document.body.style.cursor =
            direction === "horizontal" ? "ew-resize" : "ns-resize";
        var onMouseLeave = function (_) {
            setIsDragging(false);
        };
        var onMouseMove = function (event) {
            resizeHandler(event);
        };
        var onMouseUp = function (_) {
            setIsDragging(false);
        };
        document.body.addEventListener("mouseleave", onMouseLeave);
        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp);
        return function () {
            document.body.style.cursor = "";
            document.body.removeEventListener("mouseleave", onMouseLeave);
            document.body.removeEventListener("mousemove", onMouseMove);
            document.body.removeEventListener("mouseup", onMouseUp);
        };
    }, [direction, disabled, isDragging, resizeHandler]);
    return (_jsx("div", __assign({ className: className, onMouseDown: function () { return setIsDragging(true); }, onMouseUp: function () { return setIsDragging(false); }, style: {
            cursor: direction === "horizontal" ? "ew-resize" : "ns-resize"
        } }, { children: children })));
}
