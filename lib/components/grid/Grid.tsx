"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode
} from "react";
import { calculateGridHitRegions } from "../../global/dom/calculateGridHitRegions";
import { measureGridAxis } from "../../global/dom/measureGridAxis";
import { parseSizeAndUnit } from "../../global/styles/parseSizeAndUnit";
import { mountGroup } from "../../global/mountGroup";
import {
  getMountedGroupState,
  getRegisteredGroup,
  subscribeToMountedGroup
} from "../../global/mutable-state/groups";
import { getInteractionState } from "../../global/mutable-state/interactions";
import { getImperativeGroupMethods } from "../../global/utils/getImperativeGroupMethods";
import { getImperativePanelMethods } from "../../global/utils/getImperativePanelMethods";
import { layoutsEqual } from "../../global/utils/layoutsEqual";
import { recordGroupLayoutChange } from "../../global/utils/recordGroupLayoutChange";
import { useForceUpdate } from "../../hooks/useForceUpdate";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { useStableObject } from "../../hooks/useStableObject";
import { assert } from "../../utils/assert";
import { GroupContext } from "../group/GroupContext";
import type { Layout, RegisteredGroup } from "../group/types";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredSeparator } from "../separator/types";
import { GridContext } from "./GridContext";
import { Gridline } from "./Gridline";
import { isValidGridlineIndex } from "./gridPlacement";
import type {
  GridAxis,
  GridContextType,
  GridImperativeHandle,
  GridLayout,
  GridProps,
  GridSeparatorPlacement,
  GridTrackImperativeHandle,
  GridTrackProps,
  RegisteredCell
} from "./types";

type NormalizedTrack = GridTrackProps & { id: string };

type AxisValues = {
  expandedPanelSizes: { [trackId: string]: number };
  layouts: { [trackIds: string]: Layout };
};

const AXES: GridAxis[] = ["column", "row"];

const EMPTY_GRID_LAYOUT: GridLayout = { columns: {}, rows: {} };

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
export function Grid({
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

  const getGroupId = useCallback(
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
    (layout: GridLayout, isUserInteraction: boolean) => {
      if (gridLayoutsEqual(prevLayoutRef.current.onLayoutChanged, layout)) {
        // Memoize callback
        return;
      }

      prevLayoutRef.current.onLayoutChanged = layout;
      onLayoutChangedUnstable?.(layout, { isUserInteraction });
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
    column: { expandedPanelSizes: {}, layouts: {} },
    loggedErrors: new Set(),
    row: { expandedPanelSizes: {}, layouts: {} },
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
      getGroupId,
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
      getGroupId,
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

  const registeredGroupsRef = useRef<RegisteredGroup[]>([]);

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

    const createAxisGroup = (axis: GridAxis): RegisteredGroup => {
      const tracks = axis === "column" ? columnTracks : rowTracks;
      const crossTracks = axis === "column" ? rowTracks : columnTracks;
      const trackIds = tracks.map((track) => track.id);
      const groupId = getGroupId(axis);
      const separators = getSeparators(axis);
      const hasGutters = separators.length > 0;

      const panels = tracks.map<RegisteredPanel>(
        ({ id: _, ...panelConstraints }, index) => ({
          // Tracks don't have DOM elements of their own;
          // the Grid element is used to resolve relative size constraints (e.g. "em")
          element: element,
          id: trackIds[index],
          idIsStable: true,
          mutableValues: {
            expandToSize: undefined,
            prevSize: undefined
          },
          onResize: undefined,
          panelConstraints
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
          layout: getMountedGroupState(groupId)?.layout,
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
        id: groupId,
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
          calculateHitRegions: ({ expandHitTargets, group, includeDisabled }) =>
            calculateGridHitRegions({
              axis,
              cells: inMemoryValues.cells,
              crossTrackCount: crossTracks.length,
              expandHitTargets,
              group,
              groupSize: measure().availableSize,
              includeDisabled,
              separatorPlacements: inMemoryValues.separators
            }),
          getItemSizeInPixels: (trackId: string) =>
            measure().trackSizes[trackIds.indexOf(trackId)] ?? 0
        },
        mutableState: {
          defaultLayout: preSortedDefaultLayout,
          disableCursor: !!stableProps.disableCursor,
          expandedPanelSizes: inMemoryValues[axis].expandedPanelSizes,
          layouts: inMemoryValues[axis].layouts
        },
        orientation: axis === "column" ? "horizontal" : "vertical",
        panels,
        resizePreviewMode: "panel",
        get resizeTargetMinimumSize() {
          return stableProps.resizeTargetMinimumSize;
        },
        separators
      };
    };

    const groups = AXES.map(createAxisGroup);

    registeredGroupsRef.current = groups;

    const unmountGroups = groups.map((group) => mountGroup(group));

    const getGridLayout = (): GridLayout | undefined => {
      const [columnState, rowState] = groups.map((group) =>
        getMountedGroupState(group.id)
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

      return { columns: columnState.layout, rows: rowState.layout };
    };

    {
      const layout = getGridLayout();
      if (layout) {
        onLayoutChangeStable(layout);
        // Initial mount is not a user interaction (#716).
        onLayoutChangedStable(layout, false);
      }
    }

    const removeChangeEventListeners = groups.map((group) =>
      subscribeToMountedGroup(group.id, (event) => {
        const { defaultLayoutDeferred, derivedPanelConstraints, layout } =
          event.next;

        if (defaultLayoutDeferred || derivedPanelConstraints.length === 0) {
          return;
        }

        recordGroupLayoutChange({
          derivedPanelConstraints,
          group,
          layout,
          prevLayout: event.prev?.layout
        });

        const gridLayout = getGridLayout();
        if (gridLayout) {
          const interactionState = getInteractionState();
          const isCompleted =
            interactionState.state !== "active" ||
            !interactionState.hitRegions.some((region) =>
              groups.includes(region.group)
            );

          onLayoutChangeStable(gridLayout);
          if (isCompleted) {
            onLayoutChangedStable(gridLayout, event.isUserInteraction);
          }
        }
      })
    );

    return () => {
      registeredGroupsRef.current = [];

      unmountGroups.forEach((unmount) => unmount());
      removeChangeEventListeners.forEach((remove) => remove());
    };
  }, [
    columnTracks,
    disabled,
    getGroupId,
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
    registeredGroupsRef.current.forEach((group) => {
      group.mutableState.defaultLayout =
        defaultLayout?.[
          group.orientation === "horizontal" ? "columns" : "rows"
        ];
      group.mutableState.disableCursor = !!disableCursor;
    });
  });

  useImperativeHandle(gridRef, (): GridImperativeHandle => {
    const getLayout = (): GridLayout => {
      const [columnGroupId, rowGroupId] = AXES.map(getGroupId);
      if (
        !getRegisteredGroup(columnGroupId) ||
        !getRegisteredGroup(rowGroupId)
      ) {
        return { columns: {}, rows: {} };
      }

      return {
        columns: getImperativeGroupMethods({
          groupId: columnGroupId
        }).getLayout(),
        rows: getImperativeGroupMethods({ groupId: rowGroupId }).getLayout()
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
      const groupId = getGroupId(axis);
      const getMethods = () => {
        const group = getRegisteredGroup(groupId);
        assert(group, `Grid "${id}" has not been mounted`);
        assert(
          group.panels.some((panel) => panel.id === trackId),
          `Grid "${id}" no longer contains a ${axis} with id "${trackId}"; ${axis} ids are ${formatIds(group.panels.map((panel) => panel.id))}`
        );

        return getImperativePanelMethods({ groupId, panelId: trackId });
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
          const groupId = getGroupId(axis);
          if (axisLayout && getRegisteredGroup(groupId)) {
            getImperativeGroupMethods({ groupId }).setLayout(axisLayout);
          }
        });

        return getLayout();
      }
    };
  }, [columnTracks, getGroupId, id, rowTracks]);

  // The grid template is the only thing that needs to be re-rendered when the layout changes
  const readTemplate = () =>
    AXES.map((axis) => {
      const state = getMountedGroupState(getGroupId(axis));
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
        subscribeToMountedGroup(getGroupId(axis), callback)
      );
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    },
    [getGroupId]
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
        data-testid={id}
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
        <GroupContext.Provider value={null}>{children}</GroupContext.Provider>
      </div>
    </GridContext.Provider>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Grid.displayName = "Grid";

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

function findSeparatorsInChildren(
  children: ReactNode,
  gutters: { column: boolean; row: boolean }
) {
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Gridline) {
        const { type } = child.props as { type?: unknown };
        if (type === "column") {
          gutters.column = true;
        } else if (type === "row") {
          gutters.row = true;
        }
      } else if (
        // Fragments
        typeof child.type === "symbol" &&
        child.props !== null &&
        typeof child.props === "object" &&
        "children" in child.props
      ) {
        findSeparatorsInChildren(child.props.children as ReactNode, gutters);
      }
    }
  });
}

/**
 * Approximates the default layout before the Grid has been mounted (e.g. during server rendering)
 * using the default layout (if one was specified) or the default size of each track.
 */
function getInitialTrackSizes(
  tracks: NormalizedTrack[],
  defaultLayout: Layout | undefined
): string[] {
  if (defaultLayout) {
    return tracks.map(
      (track) => `minmax(0, ${defaultLayout[track.id] ?? 1}fr)`
    );
  }

  const defaultSizes = tracks.map((track) =>
    track.defaultSize === undefined
      ? undefined
      : parseSizeAndUnit(track.defaultSize)
  );

  let remainingPercentage = 100;
  let numUnspecified = 0;
  defaultSizes.forEach((defaultSize) => {
    if (defaultSize === undefined) {
      numUnspecified++;
    } else if (defaultSize[1] === "%") {
      remainingPercentage -= defaultSize[0];
    }
  });

  return defaultSizes.map((defaultSize) => {
    if (defaultSize === undefined) {
      return `minmax(0, ${Math.max(0, remainingPercentage) / Math.max(1, numUnspecified)}fr)`;
    }

    const [size, unit] = defaultSize;
    return unit === "%" ? `minmax(0, ${size}fr)` : `${size}${unit}`;
  });
}

function getPlacementErrors({
  cells,
  separatorPlacements,
  trackCounts
}: {
  cells: RegisteredCell[];
  separatorPlacements: ReadonlyMap<RegisteredSeparator, GridSeparatorPlacement>;
  trackCounts: { column: number; row: number };
}): string[] {
  const errors: string[] = [];

  // Cells must be placed within the Grid's tracks
  for (const cell of cells) {
    AXES.forEach((axis) => {
      const [index, span] =
        axis === "column"
          ? [cell.column, cell.columnSpan]
          : [cell.row, cell.rowSpan];
      const trackCount = trackCounts[axis];
      if (
        !Number.isInteger(index) ||
        !Number.isInteger(span) ||
        index < 0 ||
        span < 1 ||
        index + span > trackCount
      ) {
        errors.push(
          `Invalid Cell ${axis} placement (${axis}: ${index}, ${axis}Span: ${span}); Grid has ${trackCount} ${axis}s`
        );
      }
    });
  }

  const describe = ({
    axis,
    crossSpan,
    crossStart,
    disabled,
    index
  }: GridSeparatorPlacement) => {
    const crossAxis = axis === "column" ? "row" : "column";
    let props = `type="${axis}" ${axis}={${index}}`;
    if (crossStart !== 0 || crossSpan !== undefined) {
      props += ` ${crossAxis}={${crossStart}}`;
    }
    if (crossSpan !== undefined) {
      props += ` ${crossAxis}Span={${crossSpan}}`;
    }
    if (disabled) {
      props += " disabled";
    }
    return `<Gridline ${props} />`;
  };

  // Gridlines must be placed between two tracks (and alongside of tracks on the opposite axis)
  const placements = Array.from(separatorPlacements.values()).filter(
    (placement) => {
      const { axis, crossSpan, crossStart, index } = placement;
      const crossAxis = axis === "column" ? "row" : "column";
      const trackCount = trackCounts[axis];
      const crossCount = trackCounts[crossAxis];

      let isValid = true;
      if (!isValidGridlineIndex(index, trackCount)) {
        errors.push(
          `Invalid ${axis} Gridline ${axis} (${index}); must be between 1 and ${trackCount - 1}`
        );
        isValid = false;
      }
      if (
        !Number.isInteger(crossStart) ||
        crossStart < 0 ||
        crossStart >= crossCount
      ) {
        errors.push(
          `Invalid ${axis} Gridline ${crossAxis} (${crossStart}); must be between 0 and ${crossCount - 1}`
        );
        isValid = false;
      } else if (
        crossSpan !== undefined &&
        (!Number.isInteger(crossSpan) ||
          crossSpan < 1 ||
          crossStart + crossSpan > crossCount)
      ) {
        errors.push(
          `Invalid ${axis} Gridline ${crossAxis}Span (${crossSpan}); Grid has ${crossCount} ${crossAxis}s`
        );
        isValid = false;
      }

      // Gridlines with invalid placements are not checked for overlaps (below)
      return isValid;
    }
  );

  const getCrossRange = (placement: GridSeparatorPlacement) => {
    const crossCount =
      trackCounts[placement.axis === "column" ? "row" : "column"];
    return [
      placement.crossStart,
      placement.crossSpan === undefined
        ? crossCount
        : placement.crossStart + placement.crossSpan
    ];
  };

  placements.forEach((placement, placementIndex) => {
    const { axis, index } = placement;
    const [crossStart, crossEnd] = getCrossRange(placement);

    // Gridlines should not be rendered alongside of cells that span across their boundary
    for (const cell of cells) {
      const [start, span, cellCrossStart, cellCrossSpan] =
        axis === "column"
          ? [cell.column, cell.columnSpan, cell.row, cell.rowSpan]
          : [cell.row, cell.rowSpan, cell.column, cell.columnSpan];
      if (
        start < index &&
        index < start + span &&
        cellCrossStart < crossEnd &&
        crossStart < cellCrossStart + cellCrossSpan
      ) {
        const crossAxis = axis === "column" ? "row" : "column";
        errors.push(
          `${describe(placement)} overlaps a Cell that spans across it (${axis}: ${start}, ${axis}Span: ${span}, ${crossAxis}: ${cellCrossStart}, ${crossAxis}Span: ${cellCrossSpan}); use the ${crossAxis} and ${crossAxis}Span props to render gridlines beside the Cell instead`
        );
      }
    }

    // Gridlines along the same boundary should not overlap each other
    for (const other of placements.slice(placementIndex + 1)) {
      if (other.axis === axis && other.index === index) {
        const [otherCrossStart, otherCrossEnd] = getCrossRange(other);
        if (otherCrossStart < crossEnd && crossStart < otherCrossEnd) {
          errors.push(`${describe(placement)} overlaps ${describe(other)}`);
        }
      }
    }
  });

  return errors;
}

function gridLayoutsEqual(a: GridLayout, b: GridLayout) {
  return layoutsEqual(a.columns, b.columns) && layoutsEqual(a.rows, b.rows);
}
