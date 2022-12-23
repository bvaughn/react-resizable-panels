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
import { useCallback, useState } from "react";
import HorizontalGroup from "./HorizontalGroup";
import styles from "./styles.module.css";
export default function DemoApp() {
    var _a = useState(0), key = _a[0], setKey = _a[1];
    var clearSavedSizes = useCallback(function () {
        var groupIds = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            groupIds[_i] = arguments[_i];
        }
        groupIds.forEach(function (groupId) {
            localStorage.removeItem("PanelGroup:sizes:".concat(groupId));
        });
        setKey(function (prevKey) { return prevKey + 1; });
    }, []);
    return (_jsx("div", __assign({ className: styles.FullHeightAndWidth }, { children: _jsx(HorizontalGroup, { clearSavedSizes: clearSavedSizes }, key) })));
}
