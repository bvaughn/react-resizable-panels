import type {
  GridAxis,
  GridSegment,
  GridSeparatorPlacement,
  GridSlots,
  RegisteredCell
} from "../types";
import { expandHitTarget } from "../../global/utils/expandHitTarget";
import { excludeSpanningCells } from "./excludeSpanningCells";
import { getCellRange } from "./getCellRange";
import { getGridSlots } from "./getGridSlots";
import { getRectSegment } from "./getRectSegment";
import { segmentToRect } from "./segmentToRect";
import { setRectCrossRange } from "./setRectCrossRange";
import type {
  HitRegion,
  RegisteredResizeAxis,
  RegisteredSeparator
} from "../../global/types";

/**
 * Determines hit regions for one axis of a Grid; a hit region is either:
 * - 1: An explicit Gridline element
 * - 2: The (implicit) boundary between two adjacent tracks
 *
 * Implicit boundaries are split into segments by cells that span across them.
 * For example, a cell that spans columns 0 and 1 prevents the boundary between those columns from being resized
 * alongside of it (though the boundary may still be resized in other rows).
 *
 * Adjacent segments are merged into a single region, including the gap between rows (or columns).
 * This ensures that the area where column and row boundaries intersect is included in the hit regions for both axes,
 * allowing both to be resized at once.
 *
 * ℹ️ The axis size and slots are requested lazily (only if there may be hit regions)
 * so that callers can defer (or cache) the work required to compute them.
 */
export function calculateGridHitRegions({
  axis,
  cells,
  crossTrackCount,
  expandHitTargets,
  getAxisSize,
  getSlots,
  includeDisabled,
  resizeAxis,
  separatorPlacements
}: {
  axis: GridAxis;
  cells: RegisteredCell[];
  crossTrackCount: number;
  expandHitTargets: boolean;
  getAxisSize: () => number;
  getSlots?: () => GridSlots;
  includeDisabled: boolean;
  resizeAxis: RegisteredResizeAxis;
  separatorPlacements: Map<RegisteredSeparator, GridSeparatorPlacement>;
}): HitRegion[] {
  const { items: tracks, separators } = resizeAxis;
  const trackCount = tracks.length;

  let firstEnabledIndex = -1;
  let lastEnabledIndex = -1;
  let numEnabled = 0;
  tracks.forEach((track, index) => {
    if (!track.constraintProps.disabled) {
      numEnabled++;
      if (firstEnabledIndex === -1) {
        firstEnabledIndex = index;
      }
      lastEnabledIndex = index;
    }
  });

  // If all (or all but one) of the tracks are disabled, there can be no resize interactions.
  if (!includeDisabled && numEnabled < 2) {
    return [];
  }

  const axisSize = getAxisSize();

  const isBoundaryResizable = (index: number) =>
    includeDisabled || (index > firstEnabledIndex && index <= lastEnabledIndex);

  const hitRegions: HitRegion[] = [];

  const createHitRegion = (
    index: number,
    rect: DOMRect,
    separator?: RegisteredSeparator
  ): HitRegion => ({
    axis: resizeAxis,
    axisSize,
    items: [tracks[index - 1], tracks[index]],
    rect,
    separator
  });

  // Cell bounds are read (at most) once per call
  const bounds = new Map<RegisteredCell, GridSegment>();
  const getBounds = (cell: RegisteredCell) => {
    let segment = bounds.get(cell);
    if (!segment) {
      segment = getRectSegment(cell.element.getBoundingClientRect(), axis);
      bounds.set(cell, segment);
    }
    return segment;
  };

  // Returns the position (along the cross axis) where the specified cross track starts or ends
  const getCrossTrackEdge = (crossIndex: number, edge: "start" | "end") => {
    let position: number | undefined = undefined;
    for (const cell of cells) {
      const [, , cellCrossStart, cellCrossSpan] = getCellRange(cell, axis);
      if (edge === "start") {
        if (cellCrossStart === crossIndex) {
          const { crossStart } = getBounds(cell);
          position =
            position === undefined
              ? crossStart
              : Math.min(position, crossStart);
        }
      } else if (cellCrossStart + cellCrossSpan - 1 === crossIndex) {
        const { crossEnd } = getBounds(cell);
        position =
          position === undefined ? crossEnd : Math.max(position, crossEnd);
      }
    }
    return position;
  };

  // Explicit separators always take precedence over implicit cell boundaries
  const boundariesWithSeparators = new Set<number>();
  for (const separator of separators) {
    const placement = separatorPlacements.get(separator);
    if (!placement || placement.index < 1 || placement.index >= trackCount) {
      continue;
    }

    boundariesWithSeparators.add(placement.index);

    if (
      !includeDisabled &&
      (separator.disabled || separator.element.hasAttribute("aria-disabled"))
    ) {
      continue;
    }

    if (!isBoundaryResizable(placement.index)) {
      continue;
    }

    let rect = separator.element.getBoundingClientRect();

    // Separators that span a subset of the cross axis are extended into the gap before/after them (if any)
    // so that the area where they intersect a separator on the other axis resizes both axes
    const { crossSpan, crossStart } = placement;
    const crossEnd =
      crossSpan === undefined ? crossTrackCount : crossStart + crossSpan;
    let { crossStart: rectStart, crossEnd: rectEnd } = getRectSegment(
      rect,
      axis
    );
    if (crossStart > 0) {
      const previousEnd = getCrossTrackEdge(crossStart - 1, "end");
      if (previousEnd !== undefined && previousEnd < rectStart) {
        rectStart = previousEnd;
      }
    }
    if (crossEnd < crossTrackCount) {
      const nextStart = getCrossTrackEdge(crossEnd, "start");
      if (nextStart !== undefined && nextStart > rectEnd) {
        rectEnd = nextStart;
      }
    }
    rect = setRectCrossRange(rect, axis, rectStart, rectEnd);

    rect = expandHitTarget({ expandHitTargets, axis: resizeAxis, rect });

    if (includeDisabled) {
      // Used to map gridlines to tracks (e.g. for keyboard interactions and aria attributes)
      hitRegions.push(createHitRegion(placement.index, rect, separator));
    } else {
      // Gridlines should not be rendered alongside of cells that span across their boundary (this is logged as an error)
      // but if they are, those cells should still not be treated as resize targets
      excludeSpanningCells({
        axis,
        cells,
        getCellBounds: getBounds,
        index: placement.index,
        rect
      }).forEach((current) => {
        hitRegions.push(createHitRegion(placement.index, current, separator));
      });
    }
  }

  // Implicit boundaries may be expanded (to meet the minimum hit target size) into cells that span across them;
  // those portions are excluded so that the spanning cells remain interactive
  const addImplicitHitRegions = (index: number, rect: DOMRect) => {
    excludeSpanningCells({
      axis,
      cells,
      getCellBounds: getBounds,
      index,
      rect: expandHitTarget({ expandHitTargets, axis: resizeAxis, rect })
    }).forEach((current) => {
      hitRegions.push(createHitRegion(index, current));
    });
  };

  // Map each (cross track, track) slot to the Cell that occupies it (if any)
  const slots = getSlots
    ? getSlots()
    : getGridSlots({ axis, cells, crossTrackCount, trackCount });

  for (let index = 1; index < trackCount; index++) {
    if (boundariesWithSeparators.has(index) || !isBoundaryResizable(index)) {
      continue;
    }

    let pending: GridSegment | undefined = undefined;

    for (let crossIndex = 0; crossIndex < crossTrackCount; crossIndex++) {
      const before = slots[crossIndex][index - 1];
      const after = slots[crossIndex][index];

      let segment: GridSegment | undefined = undefined;
      if ((before || after) && before !== after) {
        const beforeBounds = before ? getBounds(before) : undefined;
        const afterBounds = after ? getBounds(after) : undefined;

        // The boundary is the space between the two cells (e.g. the gap)
        const from = beforeBounds?.end ?? afterBounds!.start;
        const to = afterBounds?.start ?? beforeBounds!.end;

        // Along the cross axis, the boundary is only resizable where the cells are next to each other
        const crossStart = Math.max(
          beforeBounds?.crossStart ?? -Infinity,
          afterBounds?.crossStart ?? -Infinity
        );
        const crossEnd = Math.min(
          beforeBounds?.crossEnd ?? Infinity,
          afterBounds?.crossEnd ?? Infinity
        );

        segment = {
          crossEnd: Math.max(crossStart, crossEnd),
          crossStart,
          end: Math.max(from, to),
          start: Math.min(from, to)
        };
      }

      if (segment) {
        pending = pending
          ? {
              crossEnd: Math.max(pending.crossEnd, segment.crossEnd),
              crossStart: Math.min(pending.crossStart, segment.crossStart),
              end: Math.max(pending.end, segment.end),
              start: Math.min(pending.start, segment.start)
            }
          : segment;
      } else if (pending) {
        addImplicitHitRegions(index, segmentToRect(pending, axis));
        pending = undefined;
      }
    }

    if (pending) {
      addImplicitHitRegions(index, segmentToRect(pending, axis));
    }
  }

  return hitRegions;
}
