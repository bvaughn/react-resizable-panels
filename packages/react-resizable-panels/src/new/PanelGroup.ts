import { isDevelopment } from "#is-development";
import useIsomorphicLayoutEffect from "../hooks/useIsomorphicEffect";
import useUniqueId from "../hooks/useUniqueId";
import { areEqual } from "../utils/arrays";
import { resetGlobalCursorStyle, setGlobalCursorStyle } from "../utils/cursor";
import debounce from "../utils/debounce";
import {
  CSSProperties,
  ElementType,
  ForwardedRef,
  PropsWithChildren,
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "../vendor/react";
import { PanelData } from "./Panel";
import { DragState, PanelGroupContext, ResizeEvent } from "./PanelGroupContext";
import { Direction, MixedSizes } from "./types";
import { adjustLayoutByDelta } from "./utils/adjustLayoutByDelta";
import { calculateDefaultLayout } from "./utils/calculateDefaultLayout";
import { calculateDeltaPercentage } from "./utils/calculateDeltaPercentage";
import { compareLayouts } from "./utils/compareLayouts";
import { computePanelFlexBoxStyle } from "./utils/computePanelFlexBoxStyle";
import { computePercentagePanelConstraints } from "./utils/computePercentagePanelConstraints";
import { convertPercentageToPixels } from "./utils/convertPercentageToPixels";
import { convertPixelsToPercentage } from "./utils/convertPixelsToPercentage";
import { determinePivotIndices } from "./utils/determinePivotIndices";
import { calculateAvailablePanelSizeInPixels } from "./utils/dom/calculateAvailablePanelSizeInPixels";
import { getResizeHandleElement } from "./utils/dom/getResizeHandleElement";
import { isKeyDown, isMouseEvent, isTouchEvent } from "./utils/events";
import { getResizeEventCursorPosition } from "./utils/getResizeEventCursorPosition";
import { initializeDefaultStorage } from "./utils/initializeDefaultStorage";
import { loadPanelLayout, savePanelGroupLayout } from "./utils/serialization";
import { validatePanelGroupLayout } from "./utils/validatePanelGroupLayout";

// TODO Move group/DOM helpers into new package

// TODO Use ResizeObserver (but only if any Panels declare pixels units)

export type ImperativePanelGroupHandle = {
  getId: () => string;
  getLayout: () => MixedSizes[];
  setLayout: (layout: Partial<MixedSizes>[]) => void;
};

export type PanelGroupStorage = {
  getItem(name: string): string | null;
  setItem(name: string, value: string): void;
};

export type PanelGroupOnLayout = (sizes: number[]) => void;
export type PanelOnCollapse = (collapsed: boolean) => void;
export type PanelOnResize = (size: number, prevSize: number) => void;
export type PanelResizeHandleOnDragging = (isDragging: boolean) => void;

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

export type PanelGroupProps = PropsWithChildren<{
  autoSaveId?: string;
  className?: string;
  direction: Direction;
  id?: string | null;
  onLayout?: PanelGroupOnLayout;
  storage?: PanelGroupStorage;
  style?: CSSProperties;
  tagName?: ElementType;
}>;

const debounceMap: {
  [key: string]: typeof savePanelGroupLayout;
} = {};

function PanelGroupWithForwardedRef({
  autoSaveId,
  children,
  className: classNameFromProps = "",
  direction,
  forwardedRef,
  id: idFromProps,
  onLayout,
  storage = defaultStorage,
  style: styleFromProps,
  tagName: Type = "div",
}: PanelGroupProps & {
  forwardedRef: ForwardedRef<ImperativePanelGroupHandle>;
}) {
  const groupId = useUniqueId(idFromProps);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [layout, setLayout] = useState<number[]>([]);
  const [panelDataArray, setPanelDataArray] = useState<PanelData[]>([]);

  const prevDeltaRef = useRef<number>(0);

  const committedValuesRef = useRef<{
    direction: Direction;
    dragState: DragState | null;
    id: string;
    layout: number[];
    panelDataArray: PanelData[];
  }>({
    direction,
    dragState,
    id: groupId,
    layout,
    panelDataArray,
  });

  useImperativeHandle(
    forwardedRef,
    () => ({
      getId: () => committedValuesRef.current.id,
      getLayout: () => {
        const { id: groupId, layout } = committedValuesRef.current;

        const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

        return layout.map((sizePercentage) => {
          return {
            sizePercentage,
            sizePixels: convertPercentageToPixels(
              sizePercentage,
              groupSizePixels
            ),
          };
        });
      },
      setLayout: (mixedSizes: Partial<MixedSizes>[]) => {
        const {
          id: groupId,
          layout: prevLayout,
          panelDataArray,
        } = committedValuesRef.current;

        const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

        const unsafeLayout = mixedSizes.map(
          ({ sizePercentage, sizePixels }) => {
            if (sizePercentage != null) {
              return sizePercentage;
            } else if (sizePixels != null) {
              return convertPixelsToPercentage(sizePixels, groupSizePixels);
            } else {
              throw Error("Invalid layout");
            }
          }
        );

        const safeLayout = validatePanelGroupLayout({
          groupSizePixels,
          layout: unsafeLayout,
          panelConstraints: panelDataArray.map(
            (panelData) => panelData.constraints
          ),
        });

        if (!areEqual(prevLayout, safeLayout)) {
          setLayout(safeLayout);

          // TODO Callbacks
        }
      },
    }),
    []
  );

  useIsomorphicLayoutEffect(() => {
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.dragState = dragState;
    committedValuesRef.current.id = groupId;
    committedValuesRef.current.layout = layout;
    committedValuesRef.current.panelDataArray = panelDataArray;
  });

  // TODO Dev warnings

  useEffect(() => {
    // If this panel has been configured to persist sizing information, save sizes to local storage.
    if (autoSaveId) {
      if (layout.length === 0 || layout.length !== panelDataArray.length) {
        return;
      }

      // Limit the frequency of localStorage updates.
      if (!debounceMap[autoSaveId]) {
        debounceMap[autoSaveId] = debounce(savePanelGroupLayout, 100);
      }
      debounceMap[autoSaveId](autoSaveId, panelDataArray, layout, storage);
    }
  }, [autoSaveId, layout, panelDataArray, storage]);

  // Once all panels have registered themselves,
  // Compute the initial sizes based on default weights.
  // This assumes that panels register during initial mount (no conditional rendering)!
  useIsomorphicLayoutEffect(() => {
    const { id: groupId, layout } = committedValuesRef.current;
    if (layout.length === panelDataArray.length) {
      // Only compute (or restore) default layout once per panel configuration.
      return;
    }

    // If this panel has been configured to persist sizing information,
    // default size should be restored from local storage if possible.
    let unsafeLayout: number[] | null = null;
    if (autoSaveId) {
      unsafeLayout = loadPanelLayout(autoSaveId, panelDataArray, storage);
    }

    const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

    if (unsafeLayout == null) {
      unsafeLayout = calculateDefaultLayout({
        groupSizePixels,
        panelDataArray,
      });
    }

    // Validate even saved layouts in case something has changed since last render
    // e.g. for pixel groups, this could be the size of the window
    const validatedLayout = validatePanelGroupLayout({
      groupSizePixels,
      layout: unsafeLayout,
      panelConstraints: panelDataArray.map(
        (panelData) => panelData.constraints
      ),
    });

    if (!areEqual(layout, validatedLayout)) {
      setLayout(validatedLayout);
    }
  }, [autoSaveId, layout, panelDataArray, storage]);

  // External APIs are safe to memoize via committed values ref
  const collapsePanel = useCallback(
    (panelData: PanelData) => {
      const { layout, panelDataArray } = committedValuesRef.current;

      if (panelData.constraints.collapsible) {
        const panelConstraintsArray = panelDataArray.map(
          (panelData) => panelData.constraints
        );

        const {
          collapsedSizePercentage,
          panelSizePercentage,
          pivotIndices,
          groupSizePixels,
        } = panelDataHelper(groupId, panelDataArray, panelData, layout);

        if (panelSizePercentage !== collapsedSizePercentage) {
          // TODO Store size before collapse

          const nextLayout = adjustLayoutByDelta({
            delta: collapsedSizePercentage - panelSizePercentage,
            groupSizePixels,
            layout,
            panelConstraints: panelConstraintsArray,
            pivotIndices,
            trigger: "imperative-api",
          });

          if (!compareLayouts(layout, nextLayout)) {
            setLayout(nextLayout);

            // TODO Callbacks and stuff (put in helper function that takes prevLayout, nextLayout)
            // onLayout()
          }
        }
      }
    },
    [groupId]
  );

  // External APIs are safe to memoize via committed values ref
  const expandPanel = useCallback(
    (panelData: PanelData) => {
      const { layout, panelDataArray } = committedValuesRef.current;

      if (panelData.constraints.collapsible) {
        const panelConstraintsArray = panelDataArray.map(
          (panelData) => panelData.constraints
        );

        const {
          collapsedSizePercentage,
          panelSizePercentage,
          minSizePercentage,
          pivotIndices,
          groupSizePixels,
        } = panelDataHelper(groupId, panelDataArray, panelData, layout);

        if (panelSizePercentage === collapsedSizePercentage) {
          // TODO Retrieve size before collapse

          const nextLayout = adjustLayoutByDelta({
            delta: minSizePercentage - panelSizePercentage,
            groupSizePixels,
            layout,
            panelConstraints: panelConstraintsArray,
            pivotIndices,
            trigger: "imperative-api",
          });

          if (!compareLayouts(layout, nextLayout)) {
            setLayout(nextLayout);

            // TODO Callbacks and stuff (put in helper function that takes prevLayout, nextLayout)
          }
        }
      }
    },
    [groupId]
  );

  // External APIs are safe to memoize via committed values ref
  const getPanelSize = useCallback(
    (panelData: PanelData) => {
      const { layout, panelDataArray } = committedValuesRef.current;

      const { panelSizePercentage, panelSizePixels } = panelDataHelper(
        groupId,
        panelDataArray,
        panelData,
        layout
      );

      return {
        sizePercentage: panelSizePercentage,
        sizePixels: panelSizePixels,
      };
    },
    [groupId]
  );

  // This API should never read from committedValuesRef
  const getPanelStyle = useCallback(
    (panelData: PanelData) => {
      const panelIndex = panelDataArray.indexOf(panelData);

      return computePanelFlexBoxStyle({
        dragState,
        layout,
        panelData: panelDataArray,
        panelIndex,
      });
    },
    [dragState, layout, panelDataArray]
  );

  // External APIs are safe to memoize via committed values ref
  const isPanelCollapsed = useCallback(
    (panelData: PanelData) => {
      const { layout, panelDataArray } = committedValuesRef.current;

      const { collapsedSizePercentage, collapsible, panelSizePercentage } =
        panelDataHelper(groupId, panelDataArray, panelData, layout);

      return (
        collapsible === true && panelSizePercentage === collapsedSizePercentage
      );
    },
    [groupId]
  );

  // External APIs are safe to memoize via committed values ref
  const isPanelExpanded = useCallback(
    (panelData: PanelData) => {
      const { layout, panelDataArray } = committedValuesRef.current;

      const { collapsedSizePercentage, collapsible, panelSizePercentage } =
        panelDataHelper(groupId, panelDataArray, panelData, layout);

      return !collapsible || panelSizePercentage > collapsedSizePercentage;
    },
    [groupId]
  );

  const registerPanel = useCallback((panelData: PanelData) => {
    setPanelDataArray((prevPanelDataArray) => {
      const nextPanelDataArray = [...prevPanelDataArray, panelData];
      return nextPanelDataArray.sort((panelA, panelB) => {
        const orderA = panelA.order;
        const orderB = panelB.order;
        if (orderA == null && orderB == null) {
          return 0;
        } else if (orderA == null) {
          return -1;
        } else if (orderB == null) {
          return 1;
        } else {
          return orderA - orderB;
        }
      });
    });
  }, []);

  const registerResizeHandle = useCallback((dragHandleId: string) => {
    return function resizeHandler(event: ResizeEvent) {
      event.preventDefault();

      const {
        direction,
        dragState,
        id: groupId,
        panelDataArray,
        layout: prevLayout,
      } = committedValuesRef.current;

      const { initialLayout } = dragState ?? {};

      const pivotIndices = determinePivotIndices(groupId, dragHandleId);

      let delta = calculateDeltaPercentage(
        event,
        groupId,
        dragHandleId,
        direction,
        dragState!
      );
      if (delta === 0) {
        return;
      }

      // Support RTL layouts
      const isHorizontal = direction === "horizontal";
      if (document.dir === "rtl" && isHorizontal) {
        delta = -delta;
      }

      const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);
      const panelConstraints = panelDataArray.map(
        (panelData) => panelData.constraints
      );

      const nextLayout = adjustLayoutByDelta({
        delta,
        groupSizePixels,
        layout: initialLayout ?? prevLayout,
        panelConstraints,
        pivotIndices,
        trigger: isKeyDown(event) ? "keyboard" : "mouse-or-touch",
      });

      const layoutChanged = !compareLayouts(prevLayout, nextLayout);

      // Only update the cursor for layout changes triggered by touch/mouse events (not keyboard)
      // Update the cursor even if the layout hasn't changed (we may need to show an invalid cursor state)
      if (isMouseEvent(event) || isTouchEvent(event)) {
        // Watch for multiple subsequent deltas; this might occur for tiny cursor movements.
        // In this case, Panel sizes might not change–
        // but updating cursor in this scenario would cause a flicker.
        if (prevDeltaRef.current != delta) {
          prevDeltaRef.current = delta;

          if (!layoutChanged) {
            // If the pointer has moved too far to resize the panel any further,
            // update the cursor style for a visual clue.
            // This mimics VS Code behavior.

            if (isHorizontal) {
              setGlobalCursorStyle(
                delta < 0 ? "horizontal-min" : "horizontal-max"
              );
            } else {
              setGlobalCursorStyle(delta < 0 ? "vertical-min" : "vertical-max");
            }
          } else {
            // Reset the cursor style to the the normal resize cursor.
            setGlobalCursorStyle(isHorizontal ? "horizontal" : "vertical");
          }
        }
      }

      if (layoutChanged) {
        setLayout(nextLayout);

        // TODO Callbacks and stuff (put in helper function that takes prevLayout, nextLayout)
      }
    };
  }, []);

  // External APIs are safe to memoize via committed values ref
  const resizePanel = useCallback(
    (panelData: PanelData, sizePercentage: number) => {
      const { layout, panelDataArray } = committedValuesRef.current;

      const panelConstraintsArray = panelDataArray.map(
        (panelData) => panelData.constraints
      );

      const { groupSizePixels, panelSizePercentage, pivotIndices } =
        panelDataHelper(groupId, panelDataArray, panelData, layout);

      const nextLayout = adjustLayoutByDelta({
        delta: sizePercentage - panelSizePercentage,
        groupSizePixels,
        layout,
        panelConstraints: panelConstraintsArray,
        pivotIndices,
        trigger: "imperative-api",
      });

      if (!compareLayouts(layout, nextLayout)) {
        setLayout(nextLayout);

        // TODO Callbacks and stuff (put in helper function that takes prevLayout, nextLayout)
      }
    },
    [groupId]
  );

  const startDragging = useCallback(
    (dragHandleId: string, event: ResizeEvent) => {
      const { direction, layout } = committedValuesRef.current;

      const handleElement = getResizeHandleElement(dragHandleId)!;

      const initialCursorPosition = getResizeEventCursorPosition(
        direction,
        event
      );

      setDragState({
        dragHandleId,
        dragHandleRect: handleElement.getBoundingClientRect(),
        initialCursorPosition,
        initialLayout: layout,
      });
    },
    []
  );

  const stopDragging = useCallback(() => {
    resetGlobalCursorStyle();
    setDragState(null);
  }, []);

  const unregisterPanel = useCallback((panelData: PanelData) => {
    setPanelDataArray((panelDataArray) => {
      const index = panelDataArray.indexOf(panelData);
      if (index >= 0) {
        panelDataArray = [...panelDataArray];
        panelDataArray.splice(index, 1);
      }

      return panelDataArray;
    });
  }, []);

  const context = useMemo(
    () => ({
      collapsePanel,
      direction,
      dragState,
      expandPanel,
      getPanelSize,
      getPanelStyle,
      groupId,
      isPanelCollapsed,
      isPanelExpanded,
      registerPanel,
      registerResizeHandle,
      resizePanel,
      startDragging,
      stopDragging,
      unregisterPanel,
    }),
    [
      collapsePanel,
      dragState,
      direction,
      expandPanel,
      getPanelSize,
      getPanelStyle,
      groupId,
      isPanelCollapsed,
      isPanelExpanded,
      registerPanel,
      registerResizeHandle,
      resizePanel,
      startDragging,
      stopDragging,
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

  return createElement(
    PanelGroupContext.Provider,
    { value: context },
    createElement(Type, {
      children,
      className: classNameFromProps,
      style: {
        ...style,
        ...styleFromProps,
      },

      // CSS selectors
      "data-panel-group": "",

      // e2e test attributes
      "data-panel-group-direction": isDevelopment ? direction : undefined,
      "data-panel-group-id": isDevelopment ? groupId : undefined,
    })
  );
}

export const PanelGroup = forwardRef<
  ImperativePanelGroupHandle,
  PanelGroupProps
>((props: PanelGroupProps, ref: ForwardedRef<ImperativePanelGroupHandle>) =>
  createElement(PanelGroupWithForwardedRef, { ...props, forwardedRef: ref })
);

PanelGroupWithForwardedRef.displayName = "PanelGroup";
PanelGroup.displayName = "forwardRef(PanelGroup)";

function panelDataHelper(
  groupId: string,
  panelDataArray: PanelData[],
  panelData: PanelData,
  layout: number[]
) {
  const panelConstraintsArray = panelDataArray.map(
    (panelData) => panelData.constraints
  );

  const panelIndex = panelDataArray.indexOf(panelData);
  const panelConstraints = panelConstraintsArray[panelIndex];

  const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

  const percentagePanelConstraints = computePercentagePanelConstraints(
    panelConstraintsArray,
    panelIndex,
    groupSizePixels
  );

  const isLastPanel = panelIndex === panelDataArray.length - 1;
  const pivotIndices = isLastPanel
    ? [panelIndex - 1, panelIndex]
    : [panelIndex, panelIndex + 1];

  const panelSizePercentage = layout[panelIndex];
  const panelSizePixels = convertPercentageToPixels(
    panelSizePercentage,
    groupSizePixels
  );

  return {
    ...percentagePanelConstraints,
    collapsible: panelConstraints.collapsible,
    panelSizePercentage,
    panelSizePixels,
    groupSizePixels,
    pivotIndices,
  };
}
