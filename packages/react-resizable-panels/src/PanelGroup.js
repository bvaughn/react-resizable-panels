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
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { PanelGroupContext } from "./PanelContexts";
var PRECISION = 5;
// TODO [panels]
// Within an active drag, remember original positions to refine more easily on expand.
// Look at what the Chrome devtools Sources does.
export default function PanelGroup(_a) {
    var autoSaveId = _a.autoSaveId, _b = _a.children, children = _b === void 0 ? null : _b, _c = _a.className, className = _c === void 0 ? "" : _c, direction = _a.direction, height = _a.height, width = _a.width;
    var _d = useState(new Map()), panels = _d[0], setPanels = _d[1];
    // 0-1 values representing the relative size of each panel.
    var _e = useState([]), sizes = _e[0], setSizes = _e[1];
    // Store committed values to avoid unnecessarily re-running memoization/effects functions.
    var committedValuesRef = useRef({
        direction: direction,
        height: height,
        panels: panels,
        sizes: sizes,
        width: width
    });
    useLayoutEffect(function () {
        committedValuesRef.current.direction = direction;
        committedValuesRef.current.height = height;
        committedValuesRef.current.panels = panels;
        committedValuesRef.current.sizes = sizes;
        committedValuesRef.current.width = width;
    });
    // Once all panels have registered themselves,
    // Compute the initial sizes based on default weights.
    // This assumes that panels register during initial mount (no conditional rendering)!
    useLayoutEffect(function () {
        var sizes = committedValuesRef.current.sizes;
        if (sizes.length === panels.size) {
            return;
        }
        // TODO [panels]
        // Validate that the total minSize is <= 1.
        // If this panel has been configured to persist sizing information,
        // default size should be restored from local storage if possible.
        var defaultSizes = undefined;
        if (autoSaveId) {
            try {
                var value = localStorage.getItem(createLocalStorageKey(autoSaveId, panels));
                if (value) {
                    defaultSizes = JSON.parse(value);
                }
            }
            catch (error) { }
        }
        if (sizes.length === 0 &&
            defaultSizes != null &&
            defaultSizes.length === panels.size) {
            setSizes(defaultSizes);
        }
        else {
            var panelsArray = Array.from(panels.values());
            var totalWeight_1 = panelsArray.reduce(function (weight, panel) {
                return weight + panel.defaultSize;
            }, 0);
            setSizes(panelsArray.map(function (panel) { return panel.defaultSize / totalWeight_1; }));
        }
    }, [autoSaveId, panels]);
    useEffect(function () {
        if (autoSaveId && sizes.length > 0) {
            // If this panel has been configured to persist sizing information, save sizes to local storage.
            localStorage.setItem(createLocalStorageKey(autoSaveId, panels), JSON.stringify(sizes));
        }
    }, [autoSaveId, panels, sizes]);
    var getPanelStyle = useCallback(function (id) {
        var panels = committedValuesRef.current.panels;
        var offset = getOffset(panels, id, direction, sizes, height, width);
        var size = getSize(panels, id, direction, sizes, height, width);
        if (direction === "horizontal") {
            return {
                height: "100%",
                position: "absolute",
                left: offset,
                top: 0,
                width: size
            };
        }
        else {
            return {
                height: size,
                position: "absolute",
                left: 0,
                top: offset,
                width: "100%"
            };
        }
    }, [direction, height, sizes, width]);
    var registerPanel = useCallback(function (id, panel) {
        setPanels(function (prevPanels) {
            if (prevPanels.has(id)) {
                return prevPanels;
            }
            var nextPanels = new Map(prevPanels);
            nextPanels.set(id, panel);
            return nextPanels;
        });
    }, []);
    var registerResizeHandle = useCallback(function (idBefore, idAfter) {
        return function (event) {
            event.preventDefault();
            var _a = committedValuesRef.current, direction = _a.direction, height = _a.height, panels = _a.panels, prevSizes = _a.sizes, width = _a.width;
            var isHorizontal = direction === "horizontal";
            var movement = isHorizontal ? event.movementX : event.movementY;
            var delta = isHorizontal ? movement / width : movement / height;
            var nextSizes = adjustByDelta(panels, idBefore, idAfter, delta, prevSizes);
            if (prevSizes !== nextSizes) {
                setSizes(nextSizes);
            }
        };
        // TODO [issues/5] Add to Map
    }, []);
    var unregisterPanel = useCallback(function (id) {
        setPanels(function (prevPanels) {
            if (!prevPanels.has(id)) {
                return prevPanels;
            }
            var nextPanels = new Map(prevPanels);
            nextPanels["delete"](id);
            return nextPanels;
        });
    }, []);
    var context = useMemo(function () { return ({
        direction: direction,
        getPanelStyle: getPanelStyle,
        registerPanel: registerPanel,
        registerResizeHandle: registerResizeHandle,
        unregisterPanel: unregisterPanel
    }); }, [
        direction,
        getPanelStyle,
        registerPanel,
        registerResizeHandle,
        unregisterPanel,
    ]);
    return (_jsx(PanelGroupContext.Provider, __assign({ value: context }, { children: _jsx("div", __assign({ className: className }, { children: children })) })));
}
function adjustByDelta(panels, idBefore, idAfter, delta, prevSizes) {
    if (delta === 0) {
        return prevSizes;
    }
    var panelsArray = Array.from(panels.values());
    var nextSizes = prevSizes.concat();
    var deltaApplied = 0;
    // A resizing panel affects the panels before or after it.
    //
    // A negative delta means the panel immediately after the resizer should grow/expand by decreasing its offset.
    // Other panels may also need to shrink/contract (and shift) to make room, depending on the min weights.
    //
    // A positive delta means the panel immediately before the resizer should "expand".
    // This is accomplished by shrinking/contracting (and shifting) one or more of the panels after the resizer.
    var pivotId = delta < 0 ? idBefore : idAfter;
    var index = panelsArray.findIndex(function (panel) { return panel.id === pivotId; });
    while (true) {
        var panel = panelsArray[index];
        var prevSize = prevSizes[index];
        var nextSize = Math.max(prevSize - Math.abs(delta), panel.minSize);
        if (prevSize !== nextSize) {
            deltaApplied += prevSize - nextSize;
            nextSizes[index] = nextSize;
            if (deltaApplied.toPrecision(PRECISION) >= delta.toPrecision(PRECISION)) {
                break;
            }
        }
        if (delta < 0) {
            if (--index < 0) {
                break;
            }
        }
        else {
            if (++index >= panelsArray.length) {
                break;
            }
        }
    }
    // If we were unable to resize any of the panels panels, return the previous state.
    // This will essentially bailout and ignore the "mousemove" event.
    if (deltaApplied === 0) {
        return prevSizes;
    }
    // Adjust the pivot panel before, but only by the amount that surrounding panels were able to shrink/contract.
    pivotId = delta < 0 ? idAfter : idBefore;
    index = panelsArray.findIndex(function (panel) { return panel.id === pivotId; });
    nextSizes[index] = prevSizes[index] + deltaApplied;
    return nextSizes;
}
function createLocalStorageKey(autoSaveId, panels) {
    var panelIds = Array.from(panels.keys()).sort();
    return "PanelGroup:sizes:".concat(autoSaveId).concat(panelIds.join("|"));
}
function getOffset(panels, id, direction, sizes, height, width) {
    var panelsArray = Array.from(panels.values());
    var index = panelsArray.findIndex(function (panel) { return panel.id === id; });
    if (index < 0) {
        return 0;
    }
    var scaledOffset = 0;
    for (index = index - 1; index >= 0; index--) {
        var panel = panelsArray[index];
        scaledOffset += getSize(panels, panel.id, direction, sizes, height, width);
    }
    return Math.round(scaledOffset);
}
function getSize(panels, id, direction, sizes, height, width) {
    var totalSize = direction === "horizontal" ? width : height;
    if (panels.size === 1) {
        return totalSize;
    }
    var panelsArray = Array.from(panels.values());
    var index = panelsArray.findIndex(function (panel) { return panel.id === id; });
    var size = sizes[index];
    if (size == null) {
        return 0;
    }
    return Math.round(size * totalSize);
}
