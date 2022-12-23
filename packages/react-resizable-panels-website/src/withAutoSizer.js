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
import { createElement } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
export default function withAutoSizer(Component, autoSizerProps) {
    var AutoSizerWrapper = function (props) {
        return createElement(AutoSizer, __assign(__assign({}, autoSizerProps), { children: function (_a) {
                var height = _a.height, width = _a.width;
                return createElement(Component, __assign(__assign({}, props), { height: height, width: width }));
            } }));
    };
    return AutoSizerWrapper;
}
