import { isBrowser } from "#is-browser";
import { isDevelopment } from "#is-development";
import {
  createElement,
  CSSProperties,
  ElementType,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "./vendor/react";

import useIsomorphicLayoutEffect from "./hooks/useIsomorphicEffect";
import useUniqueId from "./hooks/useUniqueId";
import { useWindowSplitterPanelGroupBehavior } from "./hooks/useWindowSplitterBehavior";
import { PanelGroupContext } from "./PanelContexts";
import {
  Direction,
  PanelData,
  PanelGroupOnLayout,
  PanelGroupStorage,
  ResizeEvent,
  Units,
} from "./types";
import { areEqual } from "./utils/arrays";
import {
  getDragOffset,
  getMovement,
  isMouseEvent,
  isTouchEvent,
} from "./utils/coordinates";
import { resetGlobalCursorStyle, setGlobalCursorStyle } from "./utils/cursor";
import debounce from "./utils/debounce";
import {
  adjustByDelta,
  calculateDefaultLayout,
  callPanelCallbacks,
  getAvailableGroupSizePixels,
  getBeforeAndAfterIds,
  getFlexGrow,
  getPanelGroup,
  getResizeHandle,
  getResizeHandlePanelIds,
  panelsMapToSortedArray,
  validatePanelGroupLayout,
  validatePanelProps,
} from "./utils/group";
import { loadPanelLayout, savePanelGroupLayout } from "./utils/serialization";

const debounceMap: {
  [key: string]: (
    autoSaveId: string,
    panels: PanelData[],
    sizes: number[],
    storage: PanelGroupStorage
  ) => void;
} = {};

// PanelGroup might be rendering in a server-side environment where localStorage is not available
// or on a browser with cookies/storage disabled.
// In either case, this function avoids accessing localStorage until needed,
// and avoids throwing user-visible errors.
function initializeDefaultStorage(storageObject: PanelGroupStorage) {
  try {
    if (typeof localStorage !== "undefined") {
      // Bypass this check for future calls
      storageObject.getItem = (name: string) => {
        return localStorage.getItem(name);
      };
      storageObject.setItem = (name: string, value: string) => {
        localStorage.setItem(name, value);
      };
    } else {
      throw new Error("localStorage not supported in this environment");
    }
  } catch (error) {
    console.error(error);

    storageObject.getItem = () => null;
    storageObject.setItem = () => {};
  }
}

const defaultStorage: PanelGroupStorage = {
  getItem: (name: string) => {
    initializeDefaultStorage(defaultStorage);
    return defaultStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    initializeDefaultStorage(defaultStorage);
    defaultStorage.setItem(name, value);
  },
};

export type CommittedValues = {
  direction: Direction;
  id: string;
  panels: Map<string, PanelData>;
  sizes: number[];
  units: Units;
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
  units?: Units;
};

export type ImperativePanelGroupHandle = {
  getId: () => string;
  getLayout: (units?: Units) => number[];
  setLayout: (panelSizes: number[], units?: Units) => void;
};

function PanelGroupWithForwardedRef({
  autoSaveId,
  children = null,
  className: classNameFromProps = "",
  direction,
  disablePointerEventsDuringResize = false,
  forwardedRef,
  id: idFromProps = null,
  onLayout,
  storage = defaultStorage,
  style: styleFromProps = {},
  tagName: Type = "div",
  units = "percentages",
}: PanelGroupProps & {
  forwardedRef: ForwardedRef<ImperativePanelGroupHandle>;
}) {
  const groupId = useUniqueId(idFromProps);

  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);
  const [panels, setPanels] = useState<PanelDataMap>(new Map());

  // When resizing is done via mouse/touch event–
  // We store the initial Panel sizes in this ref, and apply move deltas to them instead of to the current sizes.
  // This has the benefit of causing force-collapsed panels to spring back open if drag is reversed.
  const initialDragStateRef = useRef<InitialDragState | null>(null);

  const devWarningsRef = useRef<{
    didLogDefaultSizeWarning: boolean;
    didLogIdAndOrderWarning: boolean;
    didLogInvalidLayoutWarning: boolean;
    prevPanelIds: string[];
  }>({
    didLogDefaultSizeWarning: false,
    didLogIdAndOrderWarning: false,
    didLogInvalidLayoutWarning: false,
    prevPanelIds: [],
  });

  // Use a ref to guard against users passing inline props
  const callbacksRef = useRef<{
    onLayout: PanelGroupOnLayout | undefined;
  }>({ onLayout });
  useEffect(() => {
    callbacksRef.current.onLayout = onLayout;
  });

  const panelIdToLastNotifiedSizeMapRef = useRef<Record<string, number>>({});

  // 0-1 values representing the relative size of each panel.
  const [sizes, setSizes] = useState<number[]>([]);

  // Used to support imperative collapse/expand API.
  const panelSizeBeforeCollapse = useRef<Map<string, number>>(new Map());

  const prevDeltaRef = useRef<number>(0);

  // Store committed values to avoid unnecessarily re-running memoization/effects functions.
  const committedValuesRef = useRef<CommittedValues>({
    direction,
    id: groupId,
    panels,
    sizes,
    units,
  });

  useImperativeHandle(
    forwardedRef,
    () => ({
      getId: () => groupId,
      getLayout: (unitsFromParams?: Units) => {
        const { sizes, units: unitsFromProps } = committedValuesRef.current;

        const units = unitsFromParams ?? unitsFromProps;
        if (units === "pixels") {
          const groupSizePixels = getAvailableGroupSizePixels(groupId);
          return sizes.map((size) => (size / 100) * groupSizePixels);
        } else {
          return sizes;
        }
      },
      setLayout: (sizes: number[], unitsFromParams?: Units) => {
        const {
          id: groupId,
          panels,
          sizes: prevSizes,
          units,
        } = committedValuesRef.current;

        if ((unitsFromParams || units) === "pixels") {
          const groupSizePixels = getAvailableGroupSizePixels(groupId);
          sizes = sizes.map((size) => (size / groupSizePixels) * 100);
        }

        const panelIdToLastNotifiedSizeMap =
          panelIdToLastNotifiedSizeMapRef.current;
        const panelsArray = panelsMapToSortedArray(panels);

        const nextSizes = validatePanelGroupLayout({
          groupId,
          panels,
          nextSizes: sizes,
          prevSizes,
          units,
        });
        if (!areEqual(prevSizes, nextSizes)) {
          setSizes(nextSizes);

          callPanelCallbacks(
            panelsArray,
            nextSizes,
            panelIdToLastNotifiedSizeMap
          );
        }
      },
    }),
    [groupId]
  );

  useIsomorphicLayoutEffect(() => {
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.id = groupId;
    committedValuesRef.current.panels = panels;
    committedValuesRef.current.sizes = sizes;
    committedValuesRef.current.units = units;
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
    const { onLayout } = callbacksRef.current!;
    const { panels, sizes } = committedValuesRef.current;

    // Don't commit layout until all panels have registered and re-rendered with their actual sizes.
    if (sizes.length > 0) {
      if (onLayout) {
        onLayout(sizes);
      }

      const panelIdToLastNotifiedSizeMap =
        panelIdToLastNotifiedSizeMapRef.current;

      // When possible, we notify before the next render so that rendering work can be batched together.
      // Some cases are difficult to detect though,
      // for example– panels that are conditionally rendered can affect the size of neighboring panels.
      // In this case, the best we can do is notify on commit.
      // The callPanelCallbacks() uses its own memoization to avoid notifying panels twice in these cases.
      const panelsArray = panelsMapToSortedArray(panels);
      callPanelCallbacks(panelsArray, sizes, panelIdToLastNotifiedSizeMap);
    }
  }, [sizes]);

  // Once all panels have registered themselves,
  // Compute the initial sizes based on default weights.
  // This assumes that panels register during initial mount (no conditional rendering)!
  useIsomorphicLayoutEffect(() => {
    const { id: groupId, sizes, units } = committedValuesRef.current;
    if (sizes.length === panels.size) {
      // Only compute (or restore) default sizes once per panel configuration.
      return;
    }

    // If this panel has been configured to persist sizing information,
    // default size should be restored from local storage if possible.
    let defaultSizes: number[] | null = null;
    if (autoSaveId) {
      const panelsArray = panelsMapToSortedArray(panels);
      defaultSizes = loadPanelLayout(autoSaveId, panelsArray, storage);
    }

    if (defaultSizes != null) {
      // Validate saved sizes in case something has changed since last render
      // e.g. for pixel groups, this could be the size of the window
      const validatedSizes = validatePanelGroupLayout({
        groupId,
        panels,
        nextSizes: defaultSizes,
        prevSizes: defaultSizes,
        units,
      });

      setSizes(validatedSizes);
    } else {
      const sizes = calculateDefaultLayout({
        groupId,
        panels,
        units,
      });

      setSizes(sizes);
    }
  }, [autoSaveId, panels, storage]);

  useEffect(() => {
    // If this panel has been configured to persist sizing information, save sizes to local storage.
    if (autoSaveId) {
      if (sizes.length === 0 || sizes.length !== panels.size) {
        return;
      }

      const panelsArray = panelsMapToSortedArray(panels);

      // Limit the frequency of localStorage updates.
      if (!debounceMap[autoSaveId]) {
        debounceMap[autoSaveId] = debounce(savePanelGroupLayout, 100);
      }
      debounceMap[autoSaveId](autoSaveId, panelsArray, sizes, storage);
    }

    if (isDevelopment) {
      const { didLogIdAndOrderWarning, prevPanelIds } = devWarningsRef.current;
      if (!didLogIdAndOrderWarning) {
        const { panels } = committedValuesRef.current;

        const panelIds = Array.from(panels.keys());

        devWarningsRef.current.prevPanelIds = panelIds;

        const panelsHaveChanged =
          prevPanelIds.length > 0 && !areEqual(prevPanelIds, panelIds);
        if (panelsHaveChanged) {
          if (
            Array.from(panels.values()).find(
              (panel) =>
                panel.current.idWasAutoGenerated || panel.current.order == null
            )
          ) {
            devWarningsRef.current.didLogIdAndOrderWarning = true;

            console.warn(
              `WARNING: Panel id and order props recommended when panels are dynamically rendered`
            );
          }
        }
      }
    }
  }, [autoSaveId, panels, sizes, storage]);

  useIsomorphicLayoutEffect(() => {
    // Pixel panel constraints need to be reassessed after a group resize
    // We can avoid the ResizeObserver overhead for relative layouts
    if (units === "pixels") {
      const resizeObserver = new ResizeObserver(() => {
        const { panels, sizes: prevSizes } = committedValuesRef.current;

        const nextSizes = validatePanelGroupLayout({
          groupId,
          panels,
          nextSizes: prevSizes,
          prevSizes,
          units,
        });
        if (!areEqual(prevSizes, nextSizes)) {
          setSizes(nextSizes);
        }
      });

      resizeObserver.observe(getPanelGroup(groupId)!);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [groupId, units]);

  const getPanelSize = useCallback(
    (id: string, unitsFromParams?: Units) => {
      const { panels, units: unitsFromProps } = committedValuesRef.current;

      const panelsArray = panelsMapToSortedArray(panels);

      const index = panelsArray.findIndex((panel) => panel.current.id === id);
      const size = sizes[index];

      const units = unitsFromParams ?? unitsFromProps;
      if (units === "pixels") {
        const groupSizePixels = getAvailableGroupSizePixels(groupId);
        return (size / 100) * groupSizePixels;
      } else {
        return size;
      }
    },
    [groupId, sizes]
  );

  const getPanelStyle = useCallback(
    (id: string, defaultSize: number | null): CSSProperties => {
      const { panels } = committedValuesRef.current;

      // Before mounting, Panels will not yet have registered themselves.
      // This includes server rendering.
      // At this point the best we can do is render everything with the same size.
      if (panels.size === 0) {
        if (isDevelopment) {
          if (!devWarningsRef.current.didLogDefaultSizeWarning) {
            if (!isBrowser && defaultSize == null) {
              devWarningsRef.current.didLogDefaultSizeWarning = true;
              console.warn(
                `WARNING: Panel defaultSize prop recommended to avoid layout shift after server rendering`
              );
            }
          }
        }

        return {
          flexBasis: 0,
          flexGrow: defaultSize != null ? defaultSize : undefined,
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
    [activeHandleId, disablePointerEventsDuringResize, sizes]
  );

  const registerPanel = useCallback((id: string, panelRef: PanelData) => {
    const { units } = committedValuesRef.current;

    validatePanelProps(units, panelRef);

    setPanels((prevPanels) => {
      if (prevPanels.has(id)) {
        return prevPanels;
      }

      const nextPanels = new Map(prevPanels);
      nextPanels.set(id, panelRef);

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

        let movement = getMovement(
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

        const groupElement = getPanelGroup(groupId)!;
        const rect = groupElement.getBoundingClientRect();
        const isHorizontal = direction === "horizontal";

        // Support RTL layouts
        if (document.dir === "rtl" && isHorizontal) {
          movement = -movement;
        }

        const size = isHorizontal ? rect.width : rect.height;
        const delta = (movement / size) * 100;

        // If a validateLayout method has been provided
        // it's important to use it before updating the mouse cursor
        const nextSizes = adjustByDelta(
          event,
          committedValuesRef.current,
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
          const panelIdToLastNotifiedSizeMap =
            panelIdToLastNotifiedSizeMapRef.current;

          // It's okay to bypass in this case because we already validated above
          setSizes(nextSizes);

          // If resize change handlers have been declared, this is the time to call them.
          // Trigger user callbacks after updating state, so that user code can override the sizes.
          callPanelCallbacks(
            panelsArray,
            nextSizes,
            panelIdToLastNotifiedSizeMap
          );
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
    if (panel == null) {
      return;
    }

    const { collapsedSize, collapsible } = panel.current;
    if (!collapsible) {
      return;
    }

    const panelsArray = panelsMapToSortedArray(panels);

    const index = panelsArray.indexOf(panel);
    if (index < 0) {
      return;
    }

    const currentSize = prevSizes[index];
    if (currentSize === collapsedSize) {
      // Panel is already collapsed.
      return;
    }

    panelSizeBeforeCollapse.current.set(id, currentSize);

    const [idBefore, idAfter] = getBeforeAndAfterIds(id, panelsArray);
    if (idBefore == null || idAfter == null) {
      return;
    }

    const isLastPanel = index === panelsArray.length - 1;
    const delta = isLastPanel ? currentSize : collapsedSize - currentSize;

    const nextSizes = adjustByDelta(
      null,
      committedValuesRef.current,
      idBefore,
      idAfter,
      delta,
      prevSizes,
      panelSizeBeforeCollapse.current,
      null
    );
    if (prevSizes !== nextSizes) {
      const panelIdToLastNotifiedSizeMap =
        panelIdToLastNotifiedSizeMapRef.current;

      setSizes(nextSizes);

      // If resize change handlers have been declared, this is the time to call them.
      // Trigger user callbacks after updating state, so that user code can override the sizes.
      callPanelCallbacks(panelsArray, nextSizes, panelIdToLastNotifiedSizeMap);
    }
  }, []);

  const expandPanel = useCallback((id: string) => {
    const { panels, sizes: prevSizes } = committedValuesRef.current;

    const panel = panels.get(id);
    if (panel == null) {
      return;
    }

    const { collapsedSize, minSize } = panel.current;

    const sizeBeforeCollapse =
      panelSizeBeforeCollapse.current.get(id) || minSize;
    if (!sizeBeforeCollapse) {
      return;
    }

    const panelsArray = panelsMapToSortedArray(panels);

    const index = panelsArray.indexOf(panel);
    if (index < 0) {
      return;
    }

    const currentSize = prevSizes[index];
    if (currentSize !== collapsedSize) {
      // Panel is already expanded.
      return;
    }

    const [idBefore, idAfter] = getBeforeAndAfterIds(id, panelsArray);
    if (idBefore == null || idAfter == null) {
      return;
    }

    const isLastPanel = index === panelsArray.length - 1;
    const delta = isLastPanel
      ? collapsedSize - sizeBeforeCollapse
      : sizeBeforeCollapse;

    const nextSizes = adjustByDelta(
      null,
      committedValuesRef.current,
      idBefore,
      idAfter,
      delta,
      prevSizes,
      panelSizeBeforeCollapse.current,
      null
    );
    if (prevSizes !== nextSizes) {
      const panelIdToLastNotifiedSizeMap =
        panelIdToLastNotifiedSizeMapRef.current;

      setSizes(nextSizes);

      // If resize change handlers have been declared, this is the time to call them.
      // Trigger user callbacks after updating state, so that user code can override the sizes.
      callPanelCallbacks(panelsArray, nextSizes, panelIdToLastNotifiedSizeMap);
    }
  }, []);

  const resizePanel = useCallback(
    (id: string, nextSize: number, unitsFromParams?: Units) => {
      const {
        id: groupId,
        panels,
        sizes: prevSizes,
        units,
      } = committedValuesRef.current;

      if ((unitsFromParams || units) === "pixels") {
        const groupSizePixels = getAvailableGroupSizePixels(groupId);
        nextSize = (nextSize / groupSizePixels) * 100;
      }

      const panel = panels.get(id);
      if (panel == null) {
        return;
      }

      let { collapsedSize, collapsible, maxSize, minSize } = panel.current;

      if (units === "pixels") {
        const groupSizePixels = getAvailableGroupSizePixels(groupId);
        minSize = (minSize / groupSizePixels) * 100;
        if (maxSize != null) {
          maxSize = (maxSize / groupSizePixels) * 100;
        }
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

      if (collapsible && nextSize === collapsedSize) {
        // This is a valid resize state.
      } else {
        const unsafeNextSize = nextSize;

        nextSize = Math.min(
          maxSize != null ? maxSize : 100,
          Math.max(minSize, nextSize)
        );

        if (isDevelopment) {
          if (unsafeNextSize !== nextSize) {
            console.error(
              `Invalid size (${unsafeNextSize}) specified for Panel "${panel.current.id}" given the panel's min/max size constraints`
            );
          }
        }
      }

      const [idBefore, idAfter] = getBeforeAndAfterIds(id, panelsArray);
      if (idBefore == null || idAfter == null) {
        return;
      }

      const isLastPanel = index === panelsArray.length - 1;
      const delta = isLastPanel
        ? currentSize - nextSize
        : nextSize - currentSize;

      const nextSizes = adjustByDelta(
        null,
        committedValuesRef.current,
        idBefore,
        idAfter,
        delta,
        prevSizes,
        panelSizeBeforeCollapse.current,
        null
      );
      if (prevSizes !== nextSizes) {
        const panelIdToLastNotifiedSizeMap =
          panelIdToLastNotifiedSizeMapRef.current;

        setSizes(nextSizes);

        // If resize change handlers have been declared, this is the time to call them.
        // Trigger user callbacks after updating state, so that user code can override the sizes.
        callPanelCallbacks(
          panelsArray,
          nextSizes,
          panelIdToLastNotifiedSizeMap
        );
      }
    },
    []
  );

  const context = useMemo(
    () => ({
      activeHandleId,
      collapsePanel,
      direction,
      expandPanel,
      getPanelSize,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      resizePanel,
      startDragging: (id: string, event: ResizeEvent) => {
        setActiveHandleId(id);

        if (isMouseEvent(event) || isTouchEvent(event)) {
          const handleElement = getResizeHandle(id)!;

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
      units,
      unregisterPanel,
    }),
    [
      activeHandleId,
      collapsePanel,
      direction,
      expandPanel,
      getPanelSize,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      resizePanel,
      units,
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
      "data-panel-group-units": units,
      style: { ...style, ...styleFromProps },
    }),
    value: context,
  });
}

export const PanelGroup = forwardRef<
  ImperativePanelGroupHandle,
  PanelGroupProps
>((props: PanelGroupProps, ref: ForwardedRef<ImperativePanelGroupHandle>) =>
  createElement(PanelGroupWithForwardedRef, { ...props, forwardedRef: ref })
);

PanelGroupWithForwardedRef.displayName = "PanelGroup";
PanelGroup.displayName = "forwardRef(PanelGroup)";
