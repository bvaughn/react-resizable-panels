import {
  createElement,
  CSSProperties,
  ElementType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PanelGroupContext } from "./PanelContexts";
import {
  Direction,
  PanelData,
  PanelGroupOnLayout,
  ResizeEvent,
  PanelGroupStorage,
} from "./types";
import { loadPanelLayout, savePanelGroupLayout } from "./utils/serialization";
import {
  getDragOffset,
  getMovement,
  isMouseEvent,
  isTouchEvent,
} from "./utils/coordinates";
import {
  adjustByDelta,
  callPanelCallbacks,
  getBeforeAndAfterIds,
  getFlexGrow,
  getPanelGroup,
  getResizeHandle,
  getResizeHandlePanelIds,
  panelsMapToSortedArray,
} from "./utils/group";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicEffect";
import useUniqueId from "./hooks/useUniqueId";
import { useWindowSplitterPanelGroupBehavior } from "./hooks/useWindowSplitterBehavior";
import { resetGlobalCursorStyle, setGlobalCursorStyle } from "./utils/cursor";
import debounce from "./utils/debounce";
import { areEqual } from "./utils/arrays";

// Limit the frequency of localStorage updates.
const savePanelGroupLayoutDebounced = debounce(savePanelGroupLayout, 100);

function throwServerError() {
  throw new Error('PanelGroup "storage" prop required for server rendering.');
}

const defaultStorage: PanelGroupStorage = {
  getItem:
    typeof localStorage !== "undefined"
      ? (name: string) => localStorage.getItem(name)
      : (throwServerError as any),
  setItem:
    typeof localStorage !== "undefined"
      ? (name: string, value: string) => localStorage.setItem(name, value)
      : (throwServerError as any),
};

export type CommittedValues = {
  direction: Direction;
  panels: Map<string, PanelData>;
  sizes: number[];
};

export type PanelDataMap = Map<string, PanelData>;

// Initial drag state serves a few purposes:
// * dragOffset:
//   Resize is calculated by the distance between the current pointer event and the resize handle being "dragged"
//   This value accounts for the initial offset when the touch/click starts, so the handle doesn't appear to "jump"
// * dragHandleRect, sizes:
//   When resizing is done via mouse/touch event– some initial state is stored
//   so that any panels that contract will also expand if drag direction is reversed.
export type InitialDragState = {
  dragHandleRect: DOMRect;
  dragOffset: number;
  sizes: number[];
};

// TODO
// Within an active drag, remember original positions to refine more easily on expand.
// Look at what the Chrome devtools Sources does.

export type PanelGroupProps = {
  autoSaveId?: string;
  children?: ReactNode;
  className?: string;
  direction: Direction;
  disablePointerEventsDuringResize?: boolean;
  id?: string | null;
  onLayout?: PanelGroupOnLayout;
  storage?: PanelGroupStorage;
  style?: CSSProperties;
  tagName?: ElementType;
};

export function PanelGroup({
  autoSaveId,
  children = null,
  className: classNameFromProps = "",
  direction,
  disablePointerEventsDuringResize = false,
  id: idFromProps = null,
  onLayout = null,
  storage = defaultStorage,
  style: styleFromProps = {},
  tagName: Type = "div",
}: PanelGroupProps) {
  const groupId = useUniqueId(idFromProps);

  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);
  const [panels, setPanels] = useState<PanelDataMap>(new Map());

  // When resizing is done via mouse/touch event–
  // We store the initial Panel sizes in this ref, and apply move deltas to them instead of to the current sizes.
  // This has the benefit of causing force-collapsed panels to spring back open if drag is reversed.
  const initialDragStateRef = useRef<InitialDragState | null>(null);

  // Use a ref to guard against users passing inline props
  const callbacksRef = useRef<{
    onLayout: PanelGroupOnLayout | null;
  }>({ onLayout });
  useEffect(() => {
    callbacksRef.current.onLayout = onLayout;
  });

  // 0-1 values representing the relative size of each panel.
  const [sizes, setSizes] = useState<number[]>([]);

  // Used to support imperative collapse/expand API.
  const panelSizeBeforeCollapse = useRef<Map<string, number>>(new Map());

  const prevDeltaRef = useRef<number>(0);

  // Store committed values to avoid unnecessarily re-running memoization/effects functions.
  const committedValuesRef = useRef<CommittedValues>({
    direction,
    panels,
    sizes,
  });

  useIsomorphicLayoutEffect(() => {
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.panels = panels;
    committedValuesRef.current.sizes = sizes;
  });

  useWindowSplitterPanelGroupBehavior({
    committedValuesRef,
    groupId,
    panels,
    setSizes,
    sizes,
    panelSizeBeforeCollapse,
  });

  // Notify external code when sizes have changed.
  useEffect(() => {
    const { onLayout } = callbacksRef.current;
    if (onLayout) {
      const { sizes } = committedValuesRef.current;

      // Don't commit layout until all panels have registered and re-rendered with their actual sizes.
      if (sizes.length > 0) {
        onLayout(sizes);
      }
    }
  }, [sizes]);

  // Notify Panel listeners about their initial sizes and collapsed state after mount.
  // Subsequent changes will be called by the resizeHandler.
  const didNotifyCallbacksAfterMountRef = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (didNotifyCallbacksAfterMountRef.current) {
      return;
    }

    const { panels, sizes } = committedValuesRef.current;
    if (sizes.length > 0) {
      didNotifyCallbacksAfterMountRef.current = true;

      const panelsArray = panelsMapToSortedArray(panels);
      callPanelCallbacks(panelsArray, [], sizes);
    }
  }, [sizes]);

  // Once all panels have registered themselves,
  // Compute the initial sizes based on default weights.
  // This assumes that panels register during initial mount (no conditional rendering)!
  useIsomorphicLayoutEffect(() => {
    const sizes = committedValuesRef.current.sizes;
    if (sizes.length === panels.size) {
      // Only compute (or restore) default sizes once per panel configuration.
      return;
    }

    // If this panel has been configured to persist sizing information,
    // default size should be restored from local storage if possible.
    let defaultSizes: number[] | undefined = undefined;
    if (autoSaveId) {
      const panelsArray = panelsMapToSortedArray(panels);
      defaultSizes = loadPanelLayout(autoSaveId, panelsArray, storage);
    }

    if (defaultSizes != null) {
      setSizes(defaultSizes);
    } else {
      const panelsArray = panelsMapToSortedArray(panels);

      let panelsWithNullDefaultSize = 0;
      let totalDefaultSize = 0;
      let totalMinSize = 0;

      // TODO
      // Implicit default size calculations below do not account for inferred min/max size values.
      // e.g. if Panel A has a maxSize of 40 then Panels A and B can't both have an implicit default size of 50.
      // For now, these logic edge cases are left to the user to handle via props.

      panelsArray.forEach((panel) => {
        totalMinSize += panel.minSize;

        if (panel.defaultSize === null) {
          panelsWithNullDefaultSize++;
        } else {
          totalDefaultSize += panel.defaultSize;
        }
      });

      if (totalDefaultSize > 100) {
        throw new Error(
          `The sum of the defaultSize of all panels in a group cannot exceed 100.`
        );
      } else if (totalMinSize > 100) {
        throw new Error(
          `The sum of the minSize of all panels in a group cannot exceed 100.`
        );
      }

      setSizes(
        panelsArray.map((panel) => {
          if (panel.defaultSize === null) {
            return (100 - totalDefaultSize) / panelsWithNullDefaultSize;
          }

          return panel.defaultSize;
        })
      );
    }
  }, [autoSaveId, panels]);

  useEffect(() => {
    // If this panel has been configured to persist sizing information, save sizes to local storage.
    if (autoSaveId) {
      if (sizes.length === 0 || sizes.length !== panels.size) {
        return;
      }

      const panelsArray = panelsMapToSortedArray(panels);

      savePanelGroupLayoutDebounced(autoSaveId, panelsArray, sizes, storage);
    }
  }, [autoSaveId, panels, sizes]);

  const getPanelStyle = useCallback(
    (id: string): CSSProperties => {
      const { panels } = committedValuesRef.current;

      // Before mounting, Panels will not yet have registered themselves.
      // This includes server rendering.
      // At this point the best we can do is render everything with the same size.
      if (panels.size === 0) {
        return {
          flexBasis: "auto",
          flexGrow: 1,
          flexShrink: 1,

          // Without this, Panel sizes may be unintentionally overridden by their content.
          overflow: "hidden",
        };
      }

      const flexGrow = getFlexGrow(panels, id, sizes);

      return {
        flexBasis: 0,
        flexGrow,
        flexShrink: 1,

        // Without this, Panel sizes may be unintentionally overridden by their content.
        overflow: "hidden",

        // Disable pointer events inside of a panel during resize.
        // This avoid edge cases like nested iframes.
        pointerEvents:
          disablePointerEventsDuringResize && activeHandleId !== null
            ? "none"
            : undefined,
      };
    },
    [activeHandleId, direction, sizes]
  );

  const registerPanel = useCallback((id: string, panel: PanelData) => {
    setPanels((prevPanels) => {
      if (prevPanels.has(id)) {
        return prevPanels;
      }

      const nextPanels = new Map(prevPanels);
      nextPanels.set(id, panel);

      return nextPanels;
    });
  }, []);

  const registerResizeHandle = useCallback(
    (handleId: string) => {
      const resizeHandler = (event: ResizeEvent) => {
        event.preventDefault();

        const {
          direction,
          panels,
          sizes: prevSizes,
        } = committedValuesRef.current;

        const panelsArray = panelsMapToSortedArray(panels);

        const [idBefore, idAfter] = getResizeHandlePanelIds(
          groupId,
          handleId,
          panelsArray
        );
        if (idBefore == null || idAfter == null) {
          return;
        }

        const movement = getMovement(
          event,
          groupId,
          handleId,
          panelsArray,
          direction,
          prevSizes,
          initialDragStateRef.current
        );
        if (movement === 0) {
          return;
        }

        const groupElement = getPanelGroup(groupId);
        const rect = groupElement.getBoundingClientRect();
        const isHorizontal = direction === "horizontal";
        const size = isHorizontal ? rect.width : rect.height;
        const delta = (movement / size) * 100;

        const nextSizes = adjustByDelta(
          event,
          panels,
          idBefore,
          idAfter,
          delta,
          prevSizes,
          panelSizeBeforeCollapse.current,
          initialDragStateRef.current
        );

        const sizesChanged = !areEqual(prevSizes, nextSizes);

        // Don't update cursor for resizes triggered by keyboard interactions.
        if (isMouseEvent(event) || isTouchEvent(event)) {
          // Watch for multiple subsequent deltas; this might occur for tiny cursor movements.
          // In this case, Panel sizes might not change–
          // but updating cursor in this scenario would cause a flicker.
          if (prevDeltaRef.current != delta) {
            if (!sizesChanged) {
              // If the pointer has moved too far to resize the panel any further,
              // update the cursor style for a visual clue.
              // This mimics VS Code behavior.

              if (isHorizontal) {
                setGlobalCursorStyle(
                  movement < 0 ? "horizontal-min" : "horizontal-max"
                );
              } else {
                setGlobalCursorStyle(
                  movement < 0 ? "vertical-min" : "vertical-max"
                );
              }
            } else {
              // Reset the cursor style to the the normal resize cursor.
              setGlobalCursorStyle(isHorizontal ? "horizontal" : "vertical");
            }
          }
        }

        if (sizesChanged) {
          // If resize change handlers have been declared, this is the time to call them.
          callPanelCallbacks(panelsArray, prevSizes, nextSizes);

          setSizes(nextSizes);
        }

        prevDeltaRef.current = delta;
      };

      return resizeHandler;
    },
    [groupId]
  );

  const unregisterPanel = useCallback((id: string) => {
    setPanels((prevPanels) => {
      if (!prevPanels.has(id)) {
        return prevPanels;
      }

      const nextPanels = new Map(prevPanels);
      nextPanels.delete(id);

      return nextPanels;
    });
  }, []);

  const collapsePanel = useCallback((id: string) => {
    const { panels, sizes: prevSizes } = committedValuesRef.current;

    const panel = panels.get(id);
    if (panel == null || !panel.collapsible) {
      return;
    }

    const panelsArray = panelsMapToSortedArray(panels);

    const index = panelsArray.indexOf(panel);
    if (index < 0) {
      return;
    }

    const currentSize = prevSizes[index];
    if (currentSize === 0) {
      // Panel is already collapsed.
      return;
    }

    panelSizeBeforeCollapse.current.set(id, currentSize);

    const [idBefore, idAfter] = getBeforeAndAfterIds(id, panelsArray);
    if (idBefore == null || idAfter == null) {
      return;
    }

    const isLastPanel = index === panelsArray.length - 1;
    const delta = isLastPanel ? currentSize : 0 - currentSize;

    const nextSizes = adjustByDelta(
      null,
      panels,
      idBefore,
      idAfter,
      delta,
      prevSizes,
      panelSizeBeforeCollapse.current,
      null
    );
    if (prevSizes !== nextSizes) {
      // If resize change handlers have been declared, this is the time to call them.
      callPanelCallbacks(panelsArray, prevSizes, nextSizes);

      setSizes(nextSizes);
    }
  }, []);

  const expandPanel = useCallback((id: string) => {
    const { panels, sizes: prevSizes } = committedValuesRef.current;

    const panel = panels.get(id);
    if (panel == null) {
      return;
    }

    const sizeBeforeCollapse =
      panelSizeBeforeCollapse.current.get(id) || panel.minSize;
    if (!sizeBeforeCollapse) {
      return;
    }

    const panelsArray = panelsMapToSortedArray(panels);

    const index = panelsArray.indexOf(panel);
    if (index < 0) {
      return;
    }

    const currentSize = prevSizes[index];
    if (currentSize !== 0) {
      // Panel is already expanded.
      return;
    }

    const [idBefore, idAfter] = getBeforeAndAfterIds(id, panelsArray);
    if (idBefore == null || idAfter == null) {
      return;
    }

    const isLastPanel = index === panelsArray.length - 1;
    const delta = isLastPanel ? 0 - sizeBeforeCollapse : sizeBeforeCollapse;

    const nextSizes = adjustByDelta(
      null,
      panels,
      idBefore,
      idAfter,
      delta,
      prevSizes,
      panelSizeBeforeCollapse.current,
      null
    );
    if (prevSizes !== nextSizes) {
      // If resize change handlers have been declared, this is the time to call them.
      callPanelCallbacks(panelsArray, prevSizes, nextSizes);

      setSizes(nextSizes);
    }
  }, []);

  const resizePanel = useCallback((id: string, nextSize: number) => {
    const { panels, sizes: prevSizes } = committedValuesRef.current;

    const panel = panels.get(id);
    if (panel == null) {
      return;
    }

    const panelsArray = panelsMapToSortedArray(panels);

    const index = panelsArray.indexOf(panel);
    if (index < 0) {
      return;
    }

    const currentSize = prevSizes[index];
    if (currentSize === nextSize) {
      return;
    }

    if (panel.collapsible && nextSize === 0) {
      // This is a valid resize state.
    } else {
      nextSize = Math.min(panel.maxSize, Math.max(panel.minSize, nextSize));
    }

    const [idBefore, idAfter] = getBeforeAndAfterIds(id, panelsArray);
    if (idBefore == null || idAfter == null) {
      return;
    }

    const isLastPanel = index === panelsArray.length - 1;
    const delta = isLastPanel ? currentSize - nextSize : nextSize - currentSize;

    const nextSizes = adjustByDelta(
      null,
      panels,
      idBefore,
      idAfter,
      delta,
      prevSizes,
      panelSizeBeforeCollapse.current,
      null
    );
    if (prevSizes !== nextSizes) {
      // If resize change handlers have been declared, this is the time to call them.
      callPanelCallbacks(panelsArray, prevSizes, nextSizes);

      setSizes(nextSizes);
    }
  }, []);

  const context = useMemo(
    () => ({
      activeHandleId,
      collapsePanel,
      direction,
      expandPanel,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      resizePanel,
      startDragging: (id: string, event: ResizeEvent) => {
        setActiveHandleId(id);

        if (isMouseEvent(event) || isTouchEvent(event)) {
          const handleElement = getResizeHandle(id);

          initialDragStateRef.current = {
            dragHandleRect: handleElement.getBoundingClientRect(),
            dragOffset: getDragOffset(event, id, direction),
            sizes: committedValuesRef.current.sizes,
          };
        }
      },
      stopDragging: () => {
        resetGlobalCursorStyle();
        setActiveHandleId(null);

        initialDragStateRef.current = null;
      },
      unregisterPanel,
    }),
    [
      activeHandleId,
      collapsePanel,
      direction,
      expandPanel,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      resizePanel,
      unregisterPanel,
    ]
  );

  const style: CSSProperties = {
    display: "flex",
    flexDirection: direction === "horizontal" ? "row" : "column",
    height: "100%",
    overflow: "hidden",
    width: "100%",
  };

  return createElement(PanelGroupContext.Provider, {
    children: createElement(Type, {
      children,
      className: classNameFromProps,
      "data-panel-group": "",
      "data-panel-group-direction": direction,
      "data-panel-group-id": groupId,
      style: { ...style, ...styleFromProps },
    }),
    value: context,
  });
}

// Workaround for Parcel scope hoisting (which renames objects/functions).
// Casting to :any is required to avoid corrupting the generated TypeScript types.
// See github.com/parcel-bundler/parcel/issues/8724
(PanelGroup as any).displayName = "PanelGroup";
