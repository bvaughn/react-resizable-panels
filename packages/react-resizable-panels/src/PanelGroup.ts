import { isDevelopment } from "#is-development";
import { PanelData } from "./Panel";
import { DragState, PanelGroupContext, ResizeEvent } from "./PanelGroupContext";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicEffect";
import useUniqueId from "./hooks/useUniqueId";
import { useWindowSplitterPanelGroupBehavior } from "./hooks/useWindowSplitterPanelGroupBehavior";
import { DataAttributes, Direction, MixedSizes } from "./types";
import { adjustLayoutByDelta } from "./utils/adjustLayoutByDelta";
import { areEqual } from "./utils/arrays";
import { calculateDeltaPercentage } from "./utils/calculateDeltaPercentage";
import { calculateUnsafeDefaultLayout } from "./utils/calculateUnsafeDefaultLayout";
import { callPanelCallbacks } from "./utils/callPanelCallbacks";
import { compareLayouts } from "./utils/compareLayouts";
import { computePanelFlexBoxStyle } from "./utils/computePanelFlexBoxStyle";
import { computePercentagePanelConstraints } from "./utils/computePercentagePanelConstraints";
import { convertPercentageToPixels } from "./utils/convertPercentageToPixels";
import { resetGlobalCursorStyle, setGlobalCursorStyle } from "./utils/cursor";
import debounce from "./utils/debounce";
import { determinePivotIndices } from "./utils/determinePivotIndices";
import { calculateAvailablePanelSizeInPixels } from "./utils/dom/calculateAvailablePanelSizeInPixels";
import { getPanelElementsForGroup } from "./utils/dom/getPanelElementsForGroup";
import { getPanelGroupElement } from "./utils/dom/getPanelGroupElement";
import { getResizeHandleElement } from "./utils/dom/getResizeHandleElement";
import { isKeyDown, isMouseEvent, isTouchEvent } from "./utils/events";
import { getPercentageSizeFromMixedSizes } from "./utils/getPercentageSizeFromMixedSizes";
import { getResizeEventCursorPosition } from "./utils/getResizeEventCursorPosition";
import { initializeDefaultStorage } from "./utils/initializeDefaultStorage";
import { loadPanelLayout, savePanelGroupLayout } from "./utils/serialization";
import { shouldMonitorPixelBasedConstraints } from "./utils/shouldMonitorPixelBasedConstraints";
import { validatePanelConstraints } from "./utils/validatePanelConstraints";
import { validatePanelGroupLayout } from "./utils/validatePanelGroupLayout";
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
} from "./vendor/react";

const LOCAL_STORAGE_DEBOUNCE_INTERVAL = 100;

export type ImperativePanelGroupHandle = {
  getId: () => string;
  getLayout: () => MixedSizes[];
  setLayout: (layout: Partial<MixedSizes>[]) => void;
};

export type PanelGroupStorage = {
  getItem(name: string): string | null;
  setItem(name: string, value: string): void;
};

export type PanelGroupOnLayout = (layout: MixedSizes[]) => void;

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
  autoSaveId?: string | null;
  className?: string;
  dataAttributes?: DataAttributes;
  direction: Direction;
  id?: string | null;
  keyboardResizeByPercentage?: number | null;
  keyboardResizeByPixels?: number | null;
  onLayout?: PanelGroupOnLayout | null;
  storage?: PanelGroupStorage;
  style?: CSSProperties;
  tagName?: ElementType;
}>;

const debounceMap: {
  [key: string]: typeof savePanelGroupLayout;
} = {};

function PanelGroupWithForwardedRef({
  autoSaveId = null,
  children,
  className: classNameFromProps = "",
  dataAttributes,
  direction,
  forwardedRef,
  id: idFromProps,
  onLayout = null,
  keyboardResizeByPercentage = null,
  keyboardResizeByPixels = null,
  storage = defaultStorage,
  style: styleFromProps,
  tagName: Type = "div",
}: PanelGroupProps & {
  forwardedRef: ForwardedRef<ImperativePanelGroupHandle>;
}) {
  const groupId = useUniqueId(idFromProps);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [layout, setLayout] = useState<number[]>([]);

  const panelIdToLastNotifiedMixedSizesMapRef = useRef<
    Record<string, MixedSizes>
  >({});
  const panelSizeBeforeCollapseRef = useRef<Map<string, number>>(new Map());
  const prevDeltaRef = useRef<number>(0);

  const committedValuesRef = useRef<{
    autoSaveId: string | null;
    direction: Direction;
    dragState: DragState | null;
    id: string;
    keyboardResizeByPercentage: number | null;
    keyboardResizeByPixels: number | null;
    onLayout: PanelGroupOnLayout | null;
    storage: PanelGroupStorage;
  }>({
    autoSaveId,
    direction,
    dragState,
    id: groupId,
    keyboardResizeByPercentage,
    keyboardResizeByPixels,
    onLayout,
    storage,
  });

  const eagerValuesRef = useRef<{
    layout: number[];
    panelDataArray: PanelData[];
  }>({
    layout,
    panelDataArray: [],
  });

  const devWarningsRef = useRef<{
    didLogIdAndOrderWarning: boolean;
    didLogPanelConstraintsWarning: boolean;
    prevPanelIds: string[];
  }>({
    didLogIdAndOrderWarning: false,
    didLogPanelConstraintsWarning: false,
    prevPanelIds: [],
  });

  useImperativeHandle(
    forwardedRef,
    () => ({
      getId: () => committedValuesRef.current.id,
      getLayout: () => {
        const { id: groupId } = committedValuesRef.current;
        const { layout } = eagerValuesRef.current;

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
        const { id: groupId, onLayout } = committedValuesRef.current;
        const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

        const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

        const unsafeLayout = mixedSizes.map(
          (mixedSize) =>
            getPercentageSizeFromMixedSizes(mixedSize, groupSizePixels)!
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

          eagerValuesRef.current.layout = safeLayout;

          if (onLayout) {
            onLayout(
              safeLayout.map((sizePercentage) => ({
                sizePercentage,
                sizePixels: convertPercentageToPixels(
                  sizePercentage,
                  groupSizePixels
                ),
              }))
            );
          }

          callPanelCallbacks(
            groupId,
            panelDataArray,
            safeLayout,
            panelIdToLastNotifiedMixedSizesMapRef.current
          );
        }
      },
    }),
    []
  );

  useIsomorphicLayoutEffect(() => {
    committedValuesRef.current.autoSaveId = autoSaveId;
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.dragState = dragState;
    committedValuesRef.current.id = groupId;
    committedValuesRef.current.onLayout = onLayout;
    committedValuesRef.current.storage = storage;

    // panelDataArray and layout are updated in-sync with scheduled state updates.
    // TODO [217] Move these values into a separate ref
  });

  useWindowSplitterPanelGroupBehavior({
    committedValuesRef,
    eagerValuesRef,
    groupId,
    layout,
    panelDataArray: eagerValuesRef.current.panelDataArray,
    setLayout,
  });

  useEffect(() => {
    const { panelDataArray } = eagerValuesRef.current;

    // If this panel has been configured to persist sizing information, save sizes to local storage.
    if (autoSaveId) {
      if (layout.length === 0 || layout.length !== panelDataArray.length) {
        return;
      }

      // Limit the frequency of localStorage updates.
      if (!debounceMap[autoSaveId]) {
        debounceMap[autoSaveId] = debounce(
          savePanelGroupLayout,
          LOCAL_STORAGE_DEBOUNCE_INTERVAL
        );
      }
      debounceMap[autoSaveId](autoSaveId, panelDataArray, layout, storage);
    }
  }, [autoSaveId, layout, storage]);

  useIsomorphicLayoutEffect(() => {
    const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

    const constraints = panelDataArray.map(({ constraints }) => constraints);
    if (!shouldMonitorPixelBasedConstraints(constraints)) {
      // Avoid the overhead of ResizeObserver if no pixel constraints require monitoring
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      console.warn(
        `WARNING: Pixel based constraints require ResizeObserver but it is not supported by the current browser.`
      );
    } else {
      const resizeObserver = new ResizeObserver(() => {
        const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

        const { onLayout } = committedValuesRef.current;

        const nextLayout = validatePanelGroupLayout({
          groupSizePixels,
          layout: prevLayout,
          panelConstraints: panelDataArray.map(
            (panelData) => panelData.constraints
          ),
        });

        if (!areEqual(prevLayout, nextLayout)) {
          setLayout(nextLayout);

          eagerValuesRef.current.layout = nextLayout;

          if (onLayout) {
            onLayout(
              nextLayout.map((sizePercentage) => ({
                sizePercentage,
                sizePixels: convertPercentageToPixels(
                  sizePercentage,
                  groupSizePixels
                ),
              }))
            );
          }

          callPanelCallbacks(
            groupId,
            panelDataArray,
            nextLayout,
            panelIdToLastNotifiedMixedSizesMapRef.current
          );
        }
      });

      resizeObserver.observe(getPanelGroupElement(groupId)!);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [groupId]);

  // DEV warnings
  useEffect(() => {
    if (isDevelopment) {
      const { panelDataArray } = eagerValuesRef.current;

      const {
        didLogIdAndOrderWarning,
        didLogPanelConstraintsWarning,
        prevPanelIds,
      } = devWarningsRef.current;

      if (!didLogIdAndOrderWarning) {
        const panelIds = panelDataArray.map(({ id }) => id);

        devWarningsRef.current.prevPanelIds = panelIds;

        const panelsHaveChanged =
          prevPanelIds.length > 0 && !areEqual(prevPanelIds, panelIds);
        if (panelsHaveChanged) {
          if (
            panelDataArray.find(
              ({ idIsFromProps, order }) => !idIsFromProps || order == null
            )
          ) {
            devWarningsRef.current.didLogIdAndOrderWarning = true;

            console.warn(
              `WARNING: Panel id and order props recommended when panels are dynamically rendered`
            );
          }
        }
      }

      if (!didLogPanelConstraintsWarning) {
        const panelConstraints = panelDataArray.map(
          (panelData) => panelData.constraints
        );

        const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

        for (
          let panelIndex = 0;
          panelIndex < panelConstraints.length;
          panelIndex++
        ) {
          const isValid = validatePanelConstraints({
            groupSizePixels,
            panelConstraints,
            panelId: panelDataArray[panelIndex].id,
            panelIndex,
          });

          if (!isValid) {
            devWarningsRef.current.didLogPanelConstraintsWarning = true;

            break;
          }
        }
      }
    }
  });

  // External APIs are safe to memoize via committed values ref
  const collapsePanel = useCallback(
    (panelData: PanelData) => {
      const { onLayout } = committedValuesRef.current;
      const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

      if (panelData.constraints.collapsible) {
        const panelConstraintsArray = panelDataArray.map(
          (panelData) => panelData.constraints
        );

        const {
          collapsedSizePercentage,
          panelSizePercentage,
          pivotIndices,
          groupSizePixels,
        } = panelDataHelper(groupId, panelDataArray, panelData, prevLayout);

        if (panelSizePercentage !== collapsedSizePercentage) {
          // Store size before collapse;
          // This is the size that gets restored if the expand() API is used.
          panelSizeBeforeCollapseRef.current.set(
            panelData.id,
            panelSizePercentage
          );

          const isLastPanel =
            panelDataArray.indexOf(panelData) === panelDataArray.length - 1;
          const delta = isLastPanel
            ? panelSizePercentage - collapsedSizePercentage
            : collapsedSizePercentage - panelSizePercentage;

          const nextLayout = adjustLayoutByDelta({
            delta,
            groupSizePixels,
            layout: prevLayout,
            panelConstraints: panelConstraintsArray,
            pivotIndices,
            trigger: "imperative-api",
          });

          if (!compareLayouts(prevLayout, nextLayout)) {
            setLayout(nextLayout);

            eagerValuesRef.current.layout = nextLayout;

            if (onLayout) {
              onLayout(
                nextLayout.map((sizePercentage) => ({
                  sizePercentage,
                  sizePixels: convertPercentageToPixels(
                    sizePercentage,
                    groupSizePixels
                  ),
                }))
              );
            }

            callPanelCallbacks(
              groupId,
              panelDataArray,
              nextLayout,
              panelIdToLastNotifiedMixedSizesMapRef.current
            );
          }
        }
      }
    },
    [groupId]
  );

  // External APIs are safe to memoize via committed values ref
  const expandPanel = useCallback(
    (panelData: PanelData) => {
      const { onLayout } = committedValuesRef.current;
      const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

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
        } = panelDataHelper(groupId, panelDataArray, panelData, prevLayout);

        if (panelSizePercentage === collapsedSizePercentage) {
          // Restore this panel to the size it was before it was collapsed, if possible.
          const prevPanelSizePercentage =
            panelSizeBeforeCollapseRef.current.get(panelData.id);

          const baseSizePercentage =
            prevPanelSizePercentage != null &&
            prevPanelSizePercentage >= minSizePercentage
              ? prevPanelSizePercentage
              : minSizePercentage;

          const isLastPanel =
            panelDataArray.indexOf(panelData) === panelDataArray.length - 1;
          const delta = isLastPanel
            ? panelSizePercentage - baseSizePercentage
            : baseSizePercentage - panelSizePercentage;

          const nextLayout = adjustLayoutByDelta({
            delta,
            groupSizePixels,
            layout: prevLayout,
            panelConstraints: panelConstraintsArray,
            pivotIndices,
            trigger: "imperative-api",
          });

          if (!compareLayouts(prevLayout, nextLayout)) {
            setLayout(nextLayout);

            eagerValuesRef.current.layout = nextLayout;

            if (onLayout) {
              onLayout(
                nextLayout.map((sizePercentage) => ({
                  sizePercentage,
                  sizePixels: convertPercentageToPixels(
                    sizePercentage,
                    groupSizePixels
                  ),
                }))
              );
            }

            callPanelCallbacks(
              groupId,
              panelDataArray,
              nextLayout,
              panelIdToLastNotifiedMixedSizesMapRef.current
            );
          }
        }
      }
    },
    [groupId]
  );

  // External APIs are safe to memoize via committed values ref
  const getPanelSize = useCallback(
    (panelData: PanelData) => {
      const { layout, panelDataArray } = eagerValuesRef.current;

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
      const { panelDataArray } = eagerValuesRef.current;

      const panelIndex = panelDataArray.indexOf(panelData);

      return computePanelFlexBoxStyle({
        dragState,
        layout,
        panelData: panelDataArray,
        panelIndex,
      });
    },
    [dragState, layout]
  );

  // External APIs are safe to memoize via committed values ref
  const isPanelCollapsed = useCallback(
    (panelData: PanelData) => {
      const { layout, panelDataArray } = eagerValuesRef.current;

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
      const { layout, panelDataArray } = eagerValuesRef.current;

      const { collapsedSizePercentage, collapsible, panelSizePercentage } =
        panelDataHelper(groupId, panelDataArray, panelData, layout);

      return !collapsible || panelSizePercentage > collapsedSizePercentage;
    },
    [groupId]
  );

  const registerPanel = useCallback((panelData: PanelData) => {
    const {
      autoSaveId,
      id: groupId,
      onLayout,
      storage,
    } = committedValuesRef.current;
    const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

    panelDataArray.push(panelData);
    panelDataArray.sort((panelA, panelB) => {
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

    // Wait until all panels have registered before we try to compute layout;
    // doing it earlier is both wasteful and may trigger misleading warnings in development mode.
    const panelElements = getPanelElementsForGroup(groupId);
    if (panelElements.length !== panelDataArray.length) {
      return;
    }

    // If this panel has been configured to persist sizing information,
    // default size should be restored from local storage if possible.
    let unsafeLayout: number[] | null = null;
    if (autoSaveId) {
      unsafeLayout = loadPanelLayout(autoSaveId, panelDataArray, storage);
    }

    const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);
    if (groupSizePixels <= 0) {
      if (
        shouldMonitorPixelBasedConstraints(
          panelDataArray.map(({ constraints }) => constraints)
        )
      ) {
        // Wait until the group has rendered a non-zero size before computing layout.
        return;
      }
    }

    if (unsafeLayout == null) {
      unsafeLayout = calculateUnsafeDefaultLayout({
        groupSizePixels,
        panelDataArray,
      });
    }

    // Validate even saved layouts in case something has changed since last render
    // e.g. for pixel groups, this could be the size of the window
    const nextLayout = validatePanelGroupLayout({
      groupSizePixels,
      layout: unsafeLayout,
      panelConstraints: panelDataArray.map(
        (panelData) => panelData.constraints
      ),
    });

    // Offscreen mode makes this a bit weird;
    // Panels unregister when hidden and re-register when shown again,
    // but the overall layout doesn't change between these two cases.
    setLayout(nextLayout);

    eagerValuesRef.current.layout = nextLayout;

    if (!areEqual(prevLayout, nextLayout)) {
      if (onLayout) {
        onLayout(
          nextLayout.map((sizePercentage) => ({
            sizePercentage,
            sizePixels: convertPercentageToPixels(
              sizePercentage,
              groupSizePixels
            ),
          }))
        );
      }

      callPanelCallbacks(
        groupId,
        panelDataArray,
        nextLayout,
        panelIdToLastNotifiedMixedSizesMapRef.current
      );
    }
  }, []);

  const registerResizeHandle = useCallback((dragHandleId: string) => {
    return function resizeHandler(event: ResizeEvent) {
      event.preventDefault();

      const {
        direction,
        dragState,
        id: groupId,
        keyboardResizeByPercentage,
        keyboardResizeByPixels,
        onLayout,
      } = committedValuesRef.current;
      const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

      const { initialLayout } = dragState ?? {};

      const pivotIndices = determinePivotIndices(groupId, dragHandleId);

      let delta = calculateDeltaPercentage(
        event,
        groupId,
        dragHandleId,
        direction,
        dragState!,
        {
          percentage: keyboardResizeByPercentage,
          pixels: keyboardResizeByPixels,
        }
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

        eagerValuesRef.current.layout = nextLayout;

        if (onLayout) {
          onLayout(
            nextLayout.map((sizePercentage) => ({
              sizePercentage,
              sizePixels: convertPercentageToPixels(
                sizePercentage,
                groupSizePixels
              ),
            }))
          );
        }

        callPanelCallbacks(
          groupId,
          panelDataArray,
          nextLayout,
          panelIdToLastNotifiedMixedSizesMapRef.current
        );
      }
    };
  }, []);

  // External APIs are safe to memoize via committed values ref
  const resizePanel = useCallback(
    (panelData: PanelData, mixedSizes: Partial<MixedSizes>) => {
      const { onLayout } = committedValuesRef.current;

      const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

      const panelConstraintsArray = panelDataArray.map(
        (panelData) => panelData.constraints
      );

      const { groupSizePixels, panelSizePercentage, pivotIndices } =
        panelDataHelper(groupId, panelDataArray, panelData, prevLayout);

      const sizePercentage = getPercentageSizeFromMixedSizes(
        mixedSizes,
        groupSizePixels
      )!;

      const isLastPanel =
        panelDataArray.indexOf(panelData) === panelDataArray.length - 1;
      const delta = isLastPanel
        ? panelSizePercentage - sizePercentage
        : sizePercentage - panelSizePercentage;

      const nextLayout = adjustLayoutByDelta({
        delta,
        groupSizePixels,
        layout: prevLayout,
        panelConstraints: panelConstraintsArray,
        pivotIndices,
        trigger: "imperative-api",
      });

      if (!compareLayouts(prevLayout, nextLayout)) {
        setLayout(nextLayout);

        eagerValuesRef.current.layout = nextLayout;

        if (onLayout) {
          onLayout(
            nextLayout.map((sizePercentage) => ({
              sizePercentage,
              sizePixels: convertPercentageToPixels(
                sizePercentage,
                groupSizePixels
              ),
            }))
          );
        }

        callPanelCallbacks(
          groupId,
          panelDataArray,
          nextLayout,
          panelIdToLastNotifiedMixedSizesMapRef.current
        );
      }
    },
    [groupId]
  );

  const startDragging = useCallback(
    (dragHandleId: string, event: ResizeEvent) => {
      const { direction } = committedValuesRef.current;
      const { layout } = eagerValuesRef.current;

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

  const unregisterPanelRef = useRef<{
    pendingPanelIds: Set<string>;
    timeout: NodeJS.Timeout | null;
  }>({
    pendingPanelIds: new Set(),
    timeout: null,
  });
  const unregisterPanel = useCallback((panelData: PanelData) => {
    const { id: groupId, onLayout } = committedValuesRef.current;
    const { layout: prevLayout, panelDataArray } = eagerValuesRef.current;

    const index = panelDataArray.indexOf(panelData);
    if (index >= 0) {
      panelDataArray.splice(index, 1);
      unregisterPanelRef.current.pendingPanelIds.add(panelData.id);
    }

    if (unregisterPanelRef.current.timeout != null) {
      clearTimeout(unregisterPanelRef.current.timeout);
    }

    // Batch panel unmounts so that we only calculate layout once;
    // This is more efficient and avoids misleading warnings in development mode.
    // We can't check the DOM to detect this because Panel elements have not yet been removed.
    unregisterPanelRef.current.timeout = setTimeout(() => {
      const { pendingPanelIds } = unregisterPanelRef.current;
      const map = panelIdToLastNotifiedMixedSizesMapRef.current;

      // TRICKY
      // Strict effects mode
      let unmountDueToStrictMode = false;
      pendingPanelIds.forEach((panelId) => {
        pendingPanelIds.delete(panelId);

        if (panelDataArray.find(({ id }) => id === panelId) == null) {
          unmountDueToStrictMode = true;

          // TRICKY
          // When a panel is removed from the group, we should delete the most recent prev-size entry for it.
          // If we don't do this, then a conditionally rendered panel might not call onResize when it's re-mounted.
          // Strict effects mode makes this tricky though because all panels will be registered, unregistered, then re-registered on mount.
          delete map[panelData.id];
        }
      });

      if (!unmountDueToStrictMode) {
        return;
      }

      if (panelDataArray.length === 0) {
        // The group is unmounting; skip layout calculation.
        return;
      }

      const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

      let unsafeLayout: number[] = calculateUnsafeDefaultLayout({
        groupSizePixels,
        panelDataArray,
      });

      // Validate even saved layouts in case something has changed since last render
      // e.g. for pixel groups, this could be the size of the window
      const nextLayout = validatePanelGroupLayout({
        groupSizePixels,
        layout: unsafeLayout,
        panelConstraints: panelDataArray.map(
          (panelData) => panelData.constraints
        ),
      });

      if (!areEqual(prevLayout, nextLayout)) {
        setLayout(nextLayout);

        eagerValuesRef.current.layout = nextLayout;

        if (onLayout) {
          onLayout(
            nextLayout.map((sizePercentage) => ({
              sizePercentage,
              sizePixels: convertPercentageToPixels(
                sizePercentage,
                groupSizePixels
              ),
            }))
          );
        }

        callPanelCallbacks(
          groupId,
          panelDataArray,
          nextLayout,
          panelIdToLastNotifiedMixedSizesMapRef.current
        );
      }
    }, 0);
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

      ...dataAttributes,

      // CSS selectors
      "data-panel-group": "",
      "data-panel-group-direction": direction,
      "data-panel-group-id": groupId,
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
