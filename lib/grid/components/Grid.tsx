"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useSyncExternalStore
} from "react";
import { calculateGridHitRegions } from "../utils/calculateGridHitRegions";
import { measureGridAxis } from "../utils/measureGridAxis";
import { mountAxis } from "../../global/mountAxis";
import {
  getMountedAxisState,
  getRegisteredAxis,
  subscribeToMountedAxis
} from "../../global/mutable-state/axes";
import { getInteractionState } from "../../global/mutable-state/interactions";
import type {
  Layout,
  RegisteredResizeAxis,
  RegisteredResizeItem,
  RegisteredSeparator
} from "../../global/types";
import { getClientScale } from "../../global/dom/getClientScale";
import { getImperativeAxisMethods } from "../../global/utils/getImperativeAxisMethods";
import { getImperativeItemMethods } from "../../global/utils/getImperativeItemMethods";
import { recordAxisLayoutChange } from "../../global/utils/recordAxisLayoutChange";
import { useForceUpdate } from "../../shared/hooks/useForceUpdate";
import { useId } from "../../shared/hooks/useId";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../shared/hooks/useMergedRefs";
import { useStableCallback } from "../../shared/hooks/useStableCallback";
import { useStableObject } from "../../shared/hooks/useStableObject";
import { assert } from "../../shared/utils/assert";
import { getTestId } from "../../shared/utils/getTestId";
import { GroupContext } from "../../flex/contexts/GroupContext";
import { AXES } from "../constants";
import { GridContext } from "../contexts/GridContext";
import { ParentGridContext } from "../contexts/ParentGridContext";
import { isValidGridlineIndex } from "../utils/gridPlacement";
import type {
  GridAxis,
  GridContextType,
  GridImperativeHandle,
  GridLayout,
  GridProps,
  GridSeparatorPlacement,
  GridTrackImperativeHandle,
  GridTrackProps,
  ParentGrid,
  RegisteredCell
} from "../types";
import { findSeparatorsInChildren } from "../utils/findSeparatorsInChildren";
import { getInitialTrackSizes } from "../utils/getInitialTrackSizes";
import { getPlacementErrors } from "../utils/getPlacementErrors";
import { gridLayoutsEqual } from "../utils/gridLayoutsEqual";

type NormalizedTrack = GridTrackProps & { id: string };

type AxisValues = {
  expandedItemSizes: { [trackId: string]: number };
  layouts: { [trackIds: string]: Layout };
};

const EMPTY_GRID_LAYOUT: GridLayout = { columns: {}, rows: {} };

function GridComponent({
  children,
  className,
  columns,
  defaultLayout,
  disableCursor,
  disabled,
  elementRef: elementRefProp,
  gridRef,
  id: idProp,
  onLayoutChange: onLayoutChangeUnstable,
  onLayoutChanged: onLayoutChangedUnstable,
  resizeTargetMinimumSize = {
    coarse: 20,
    fine: 10
  },
  rows,
  style,
  ...rest
}: GridProps) {
  const id = useId(idProp);

  const getResizeAxisId = useCallback(
    (axis: GridAxis) => (axis === "column" ? `${id}:columns` : `${id}:rows`),
    [id]
  );

  const columnTracks = useNormalizedTracks(columns, "columns");
  const rowTracks = useNormalizedTracks(rows, "rows");
  const getTracks = (axis: GridAxis) =>
    axis === "column" ? columnTracks : rowTracks;

  const prevLayoutRef = useRef<{
    onLayoutChange: GridLayout;
    onLayoutChanged: GridLayout;
  }>({
    onLayoutChange: EMPTY_GRID_LAYOUT,
    onLayoutChanged: EMPTY_GRID_LAYOUT
  });

  const onLayoutChangeStable = useStableCallback((layout: GridLayout) => {
    if (gridLayoutsEqual(prevLayoutRef.current.onLayoutChange, layout)) {
      // Memoize callback
      return;
    }

    prevLayoutRef.current.onLayoutChange = layout;
    onLayoutChangeUnstable?.(layout);
  });

  const onLayoutChangedStable = useStableCallback(
    (
      layout: GridLayout,
      isUserInteraction: boolean,
      requestedLayout: GridLayout
    ) => {
      // Only the validated layout is memoized; requested layout changes alone don't trigger the callback
      if (gridLayoutsEqual(prevLayoutRef.current.onLayoutChanged, layout)) {
        // Memoize callback
        return;
      }

      prevLayoutRef.current.onLayoutChanged = layout;
      onLayoutChangedUnstable?.(layout, { isUserInteraction, requestedLayout });
    }
  );

  const elementRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const [cellOrSeparatorChangeSigil, forceUpdate] = useForceUpdate();

  const inMemoryValuesRef = useRef<{
    cells: RegisteredCell[];
    column: AxisValues;
    loggedErrors: Set<string>;
    row: AxisValues;
    separators: Map<RegisteredSeparator, GridSeparatorPlacement>;
  }>({
    cells: [],
    column: { expandedItemSizes: {}, layouts: {} },
    loggedErrors: new Set(),
    row: { expandedItemSizes: {}, layouts: {} },
    separators: new Map()
  });

  // Separators are rendered within "gutter" tracks, interleaved between the content tracks.
  // Gutters are only added to an axis that contains separators.
  // Separators are detected while rendering (to avoid layout shift when server rendering)
  // as well as once mounted (in case they are rendered by a nested component)
  const gutters = { column: false, row: false };
  for (const placement of inMemoryValuesRef.current.separators.values()) {
    gutters[placement.axis] = true;
  }
  findSeparatorsInChildren(children, gutters);

  const stableProps = useStableObject({
    defaultLayout,
    disableCursor,
    resizeTargetMinimumSize
  });

  const getDisableCursor = useStableCallback(() => !!stableProps.disableCursor);

  const registerCell = useCallback(
    (cell: RegisteredCell) => {
      const inMemoryValues = inMemoryValuesRef.current;
      inMemoryValues.cells = [...inMemoryValues.cells, cell];

      // Cells are only used to calculate hit regions (which is done lazily)
      // but the Grid should still be re-registered when they change (like a Group is when its Panels change).
      // Child effects run before parent effects, so a Grid may be registered before its element is in its final document
      // (e.g. when portaled into a popup window that is attached to the document in a parent effect)
      forceUpdate();

      return () => {
        inMemoryValues.cells = inMemoryValues.cells.filter(
          (current) => current !== cell
        );

        forceUpdate();
      };
    },
    [forceUpdate]
  );

  const registerSeparator = useCallback(
    (placement: GridSeparatorPlacement, separator: RegisteredSeparator) => {
      const inMemoryValues = inMemoryValuesRef.current;
      inMemoryValues.separators = new Map(inMemoryValues.separators);
      inMemoryValues.separators.set(separator, placement);

      forceUpdate();

      return () => {
        inMemoryValues.separators = new Map(inMemoryValues.separators);
        inMemoryValues.separators.delete(separator);

        forceUpdate();
      };
    },
    [forceUpdate]
  );

  const updateSeparatorProps = useCallback(
    (
      separatorId: string,
      {
        disabled,
        disableDoubleClick
      }: {
        disabled: boolean | undefined;
        disableDoubleClick: boolean | undefined;
      }
    ) => {
      for (const separator of inMemoryValuesRef.current.separators.keys()) {
        if (separator.id === separatorId) {
          separator.disabled = disabled;
          separator.disableDoubleClick = disableDoubleClick;
        }
      }
    },
    []
  );

  const separatorPlacements = inMemoryValuesRef.current.separators;

  const context = useMemo<GridContextType>(
    () => ({
      getDisableCursor,
      getResizeAxisId,
      gutters: {
        column: gutters.column,
        row: gutters.row
      },
      id,
      registerCell,
      registerSeparator,
      separatorPlacements,
      trackCounts: {
        column: columnTracks.length,
        row: rowTracks.length
      },
      updateSeparatorProps
    }),
    [
      columnTracks.length,
      getDisableCursor,
      getResizeAxisId,
      gutters.column,
      gutters.row,
      id,
      registerCell,
      registerSeparator,
      rowTracks.length,
      separatorPlacements,
      updateSeparatorProps
    ]
  );

  const registeredAxesRef = useRef<RegisteredResizeAxis[]>([]);

  // Register each axis of the Grid with global state (as if it were a Group)
  // Listen to global state for layout changes related to this Grid
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element === null) {
      return;
    }

    const inMemoryValues = inMemoryValuesRef.current;

    // Cells and gridlines register themselves (in layout effects) before this effect runs,
    // so this is the earliest point at which their placements can be validated (against the Grid and each other)
    // Invalid placements are logged (rather than thrown) because they are easy to create temporarily
    // (e.g. when the number of tracks, cells, and gridlines are conditionally rendered based on different state);
    // each problem is only logged once (until it's been resolved)
    const errors = getPlacementErrors({
      cells: inMemoryValues.cells,
      separatorPlacements: inMemoryValues.separators,
      trackCounts: { column: columnTracks.length, row: rowTracks.length }
    });
    errors.forEach((error) => {
      if (!inMemoryValues.loggedErrors.has(error)) {
        console.error(error);
      }
    });
    inMemoryValues.loggedErrors = new Set(errors);

    const getSeparators = (axis: GridAxis) =>
      Array.from(inMemoryValues.separators.entries())
        .filter(([, placement]) => placement.axis === axis)
        .sort(([, a], [, b]) => a.index - b.index)
        .map(([separator]) => separator);

    const createResizeAxis = (axis: GridAxis): RegisteredResizeAxis => {
      const tracks = axis === "column" ? columnTracks : rowTracks;
      const crossTracks = axis === "column" ? rowTracks : columnTracks;
      const trackIds = tracks.map((track) => track.id);
      const axisId = getResizeAxisId(axis);
      const separators = getSeparators(axis);
      const hasGutters = separators.length > 0;

      const items = tracks.map<RegisteredResizeItem>(
        ({ id: _, ...itemConstraints }, index) => ({
          // Tracks don't have DOM elements of their own;
          // the Grid element is used to resolve relative size constraints (e.g. "em")
          element,
          id: trackIds[index],
          idIsStable: true,
          mutableValues: {
            expandToSize: undefined,
            prevSize: undefined
          },
          onResize: undefined,
          constraintProps: itemConstraints
        })
      );

      const measure = () => {
        const gutterSizes: number[] = [];
        if (hasGutters) {
          for (const [separator, placement] of inMemoryValues.separators) {
            if (
              placement.axis === axis &&
              isValidGridlineIndex(placement.index, tracks.length)
            ) {
              const rect = separator.element.getBoundingClientRect();
              gutterSizes[placement.index] = Math.max(
                gutterSizes[placement.index] ?? 0,
                axis === "column" ? rect.width : rect.height
              );
            }
          }
        }

        return measureGridAxis({
          axis,
          element,
          gutterSizes: gutterSizes.filter((size) => size !== undefined),
          hasGutters,
          layout: getMountedAxisState(axisId)?.layout,
          trackIds
        });
      };

      // Guard against unexpected layout attribute ordering by pre-sorting track ids; see issues/656
      let preSortedDefaultLayout: Layout | undefined = undefined;
      const defaultAxisLayout =
        stableProps.defaultLayout?.[axis === "column" ? "columns" : "rows"];
      if (
        defaultAxisLayout !== undefined &&
        Object.keys(defaultAxisLayout).length === trackIds.length
      ) {
        preSortedDefaultLayout = {};
        for (const trackId of trackIds) {
          const size = defaultAxisLayout[trackId];
          if (size !== undefined) {
            preSortedDefaultLayout[trackId] = size;
          }
        }
      }

      return {
        disabled: !!disabled,
        element,
        id: axisId,
        layoutStrategy: {
          getItemAriaControls: (trackId) => {
            const index = trackIds.indexOf(trackId);
            return (
              inMemoryValues.cells
                .filter((cell) => {
                  const start = axis === "column" ? cell.column : cell.row;
                  const span =
                    axis === "column" ? cell.columnSpan : cell.rowSpan;
                  return start <= index && index < start + span;
                })
                .map((cell) => cell.element.id)
                .filter(Boolean)
                .join(" ") || undefined
            );
          },
          calculateAvailableSize: () => measure().availableSize,
          calculateHitRegions: ({
            expandHitTargets,
            axis: resizeAxis,
            includeDisabled
          }) =>
            calculateGridHitRegions({
              axis,
              cells: inMemoryValues.cells,
              crossTrackCount: crossTracks.length,
              expandHitTargets,
              resizeAxis,
              axisSize:
                measure().availableSize *
                getClientScale(resizeAxis.element, resizeAxis.orientation),
              includeDisabled,
              separatorPlacements: inMemoryValues.separators
            }),
          getItemSizeInPixels: (trackId: string) =>
            measure().trackSizes[trackIds.indexOf(trackId)] ?? 0
        },
        mutableState: {
          defaultLayout: preSortedDefaultLayout,
          disableCursor: !!stableProps.disableCursor,
          expandedItemSizes: inMemoryValues[axis].expandedItemSizes,
          layouts: inMemoryValues[axis].layouts
        },
        orientation: axis === "column" ? "horizontal" : "vertical",
        items,
        resizePreviewMode: "panel",
        get resizeTargetMinimumSize() {
          return stableProps.resizeTargetMinimumSize;
        },
        separators
      };
    };

    const resizeAxes = AXES.map(createResizeAxis);

    registeredAxesRef.current = resizeAxes;

    const unmountAxes = resizeAxes.map((axis) => mountAxis(axis));

    const getGridLayouts = ():
      | { layout: GridLayout; requestedLayout: GridLayout }
      | undefined => {
      const [columnState, rowState] = resizeAxes.map((axis) =>
        getMountedAxisState(axis.id)
      );
      if (
        !columnState ||
        !rowState ||
        columnState.defaultLayoutDeferred ||
        rowState.defaultLayoutDeferred
      ) {
        // This indicates that the Grid has not finished mounting yet
        // Likely because it has been rendered inside of a hidden DOM subtree
        // Ignore layouts in this case because they will not have been validated
        return undefined;
      }

      return {
        layout: { columns: columnState.layout, rows: rowState.layout },
        requestedLayout: {
          columns: columnState.requestedLayout,
          rows: rowState.requestedLayout
        }
      };
    };

    {
      const layouts = getGridLayouts();
      if (layouts) {
        try {
          // Either handler may throw; onLayoutChanged should still be called if onLayoutChange throws
          try {
            onLayoutChangeStable(layouts.layout);
          } finally {
            // Initial mount is not a user interaction (#716).
            onLayoutChangedStable(
              layouts.layout,
              false,
              layouts.requestedLayout
            );
          }
        } catch (error) {
          // An effect that throws can't return a cleanup function, so unmount the axes before re-throwing
          registeredAxesRef.current = [];
          unmountAxes.forEach((unmount) => unmount());

          throw error;
        }
      }
    }

    const removeChangeEventListeners = resizeAxes.map((axis) =>
      subscribeToMountedAxis(axis.id, (event) => {
        const {
          defaultLayoutDeferred,
          derivedItemConstraints,
          layout,
          requestedLayout
        } = event.next;

        if (defaultLayoutDeferred || derivedItemConstraints.length === 0) {
          return;
        }

        recordAxisLayoutChange({
          derivedItemConstraints,
          axis,
          layout,
          prevLayout: event.prev?.layout,
          requestedLayout
        });

        const gridLayouts = getGridLayouts();
        if (gridLayouts) {
          const interactionState = getInteractionState();
          const isCompleted =
            interactionState.state !== "active" ||
            !interactionState.hitRegions.some((region) =>
              resizeAxes.includes(region.axis)
            );

          // Either handler may throw; onLayoutChanged should still be called if onLayoutChange throws
          try {
            onLayoutChangeStable(gridLayouts.layout);
          } finally {
            if (isCompleted) {
              onLayoutChangedStable(
                gridLayouts.layout,
                event.isUserInteraction,
                gridLayouts.requestedLayout
              );
            }
          }
        }
      })
    );

    return () => {
      registeredAxesRef.current = [];

      unmountAxes.forEach((unmount) => unmount());
      removeChangeEventListeners.forEach((remove) => remove());
    };
  }, [
    columnTracks,
    disabled,
    getResizeAxisId,
    id,
    onLayoutChangedStable,
    onLayoutChangeStable,
    rowTracks,
    cellOrSeparatorChangeSigil,
    stableProps
  ]);

  // Not all props require re-registering the grid;
  // Some can be updated after the grid has been registered
  useEffect(() => {
    registeredAxesRef.current.forEach((resizeAxis) => {
      resizeAxis.mutableState.defaultLayout =
        defaultLayout?.[
          resizeAxis.orientation === "horizontal" ? "columns" : "rows"
        ];
      resizeAxis.mutableState.disableCursor = !!disableCursor;
    });
  });

  const imperativeHandle = useMemo((): GridImperativeHandle => {
    const getLayout = (): GridLayout => {
      const [columnAxisId, rowAxisId] = AXES.map(getResizeAxisId);
      if (!getRegisteredAxis(columnAxisId) || !getRegisteredAxis(rowAxisId)) {
        return { columns: {}, rows: {} };
      }

      return {
        columns: getImperativeAxisMethods({
          axisId: columnAxisId
        }).getLayout(),
        rows: getImperativeAxisMethods({ axisId: rowAxisId }).getLayout()
      };
    };

    const formatIds = (ids: string[]) =>
      ids.map((trackId) => `"${trackId}"`).join(", ");

    // Returns a track handle whose methods verify that the track (still) exists before delegating to the Panel methods;
    // this provides clearer errors than the (Panel-specific) messages would
    const createTrackHandle = (
      axis: GridAxis,
      trackId: string
    ): GridTrackImperativeHandle => {
      const axisId = getResizeAxisId(axis);
      const getMethods = () => {
        const resizeAxis = getRegisteredAxis(axisId);
        assert(resizeAxis, `Grid "${id}" has not been mounted`);
        assert(
          resizeAxis.items.some((item) => item.id === trackId),
          `Grid "${id}" no longer contains a ${axis} with id "${trackId}"; ${axis} ids are ${formatIds(resizeAxis.items.map((item) => item.id))}`
        );

        return getImperativeItemMethods({ axisId, itemId: trackId });
      };

      return {
        collapse: () => getMethods().collapse(),
        expand: () => getMethods().expand(),
        getSize: () => getMethods().getSize(),
        isCollapsed: () => getMethods().isCollapsed(),
        resize: (size: number | string) => getMethods().resize(size)
      };
    };

    return {
      getLayout,
      getTrackById: (axis: GridAxis, trackId: string | number) => {
        const tracks = axis === "column" ? columnTracks : rowTracks;
        const normalizedId = `${trackId}`;
        assert(
          tracks.some((track) => track.id === normalizedId),
          `Grid "${id}" does not contain a ${axis} with id "${normalizedId}"; ${axis} ids are ${formatIds(tracks.map((track) => track.id))}`
        );

        return createTrackHandle(axis, normalizedId);
      },
      getTrackByIndex: (axis: GridAxis, index: number) => {
        const tracks = axis === "column" ? columnTracks : rowTracks;
        const track = Number.isInteger(index) ? tracks[index] : undefined;
        assert(
          track,
          `Grid "${id}" does not contain a ${axis} at index ${index}; it has ${tracks.length} ${axis}s`
        );

        return createTrackHandle(axis, track.id);
      },
      setLayout: (layout: Parameters<GridImperativeHandle["setLayout"]>[0]) => {
        AXES.forEach((axis) => {
          const axisLayout = layout[axis === "column" ? "columns" : "rows"];
          const axisId = getResizeAxisId(axis);
          if (axisLayout && getRegisteredAxis(axisId)) {
            getImperativeAxisMethods({ axisId }).setLayout(axisLayout);
          }
        });

        return getLayout();
      }
    };
  }, [columnTracks, getResizeAxisId, id, rowTracks]);

  useImperativeHandle(gridRef, () => imperativeHandle, [imperativeHandle]);

  // Methods are delegated (rather than copied) so the context value doesn't change when the tracks do
  const imperativeHandleRef = useRef(imperativeHandle);
  useIsomorphicLayoutEffect(() => {
    imperativeHandleRef.current = imperativeHandle;
  });
  const parentGrid = useMemo<ParentGrid>(
    () => ({
      getLayout: () => imperativeHandleRef.current.getLayout(),
      getTrackById: (axis, trackId) =>
        imperativeHandleRef.current.getTrackById(axis, trackId),
      getTrackByIndex: (axis, index) =>
        imperativeHandleRef.current.getTrackByIndex(axis, index),
      id,
      setLayout: (layout) => imperativeHandleRef.current.setLayout(layout)
    }),
    [id]
  );

  // The grid template is the only thing that needs to be re-rendered when the layout changes
  const readTemplate = () =>
    AXES.map((axis) => {
      const state = getMountedAxisState(getResizeAxisId(axis));
      const tracks = getTracks(axis);

      const sizes =
        state && !state.defaultLayoutDeferred
          ? tracks.map((track) => `minmax(0, ${state.layout[track.id] ?? 1}fr)`)
          : getInitialTrackSizes(
              tracks,
              defaultLayout?.[axis === "column" ? "columns" : "rows"]
            );

      return sizes.join(gutters[axis] ? " auto " : " ");
    }).join("|");

  const subscribeToLayout = useCallback(
    (callback: () => void) => {
      const unsubscribes = AXES.map((axis) =>
        subscribeToMountedAxis(getResizeAxisId(axis), callback)
      );
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    },
    [getResizeAxisId]
  );

  const template = useSyncExternalStore(
    subscribeToLayout,
    readTemplate,
    readTemplate
  );
  const [gridTemplateColumns, gridTemplateRows] = template.split("|");

  return (
    <GridContext.Provider value={context}>
      <div
        {...rest}
        className={className}
        data-grid
        data-testid={getTestId(rest, idProp)}
        id={id}
        ref={mergedRef}
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",

          ...style,

          display: "grid",
          gridTemplateColumns,
          gridTemplateRows,

          // Inform the browser that the library is handling touch events for this element
          // NOTE This is not an inherited style
          touchAction: "none"
        }}
      >
        {/* Cells should not inherit context from a parent Group (if this Grid is nested within one) */}
        <GroupContext.Provider value={null}>
          <ParentGridContext.Provider value={parentGrid}>
            {children}
          </ParentGridContext.Provider>
        </GroupContext.Provider>
      </div>
    </GridContext.Provider>
  );
}

/**
 * A Grid arranges resizable Cells in two dimensions.
 * Columns can be resized horizontally and rows can be resized vertically;
 * dragging the point where a column boundary and a row boundary intersect resizes both.
 *
 * Size constraints (e.g. min/max size, collapsible) are specified per track (column or row),
 * using the same format as Panel props.
 *
 * Cells can span multiple columns and/or rows.
 * Track boundaries cannot be resized alongside of a cell that spans across them.
 *
 * Grid elements always include the following attributes:
 *
 * ```html
 * <div data-grid data-testid="grid-id-prop" id="grid-id-prop">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 */
export const Grid = /* @__PURE__ */ Object.assign(GridComponent, {
  displayName: "Grid"
});

function useNormalizedTracks(
  tracks: number | GridTrackProps[],
  propName: string
): NormalizedTrack[] {
  // Track props are expected to be defined inline, so compare them by value
  const key = JSON.stringify(tracks);

  return useMemo(() => {
    const normalized: NormalizedTrack[] =
      typeof tracks === "number"
        ? Array.from({ length: tracks }, (_, index) => ({ id: `${index}` }))
        : tracks.map((track, index) => ({
            ...track,
            id: `${track.id ?? index}`
          }));

    assert(
      normalized.length > 0,
      `Grid must have at least one track; "${propName}" is ${key}`
    );

    return normalized;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
