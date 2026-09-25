import type {
  GridAxis,
  GridSeparatorPlacement,
  RegisteredCell
} from "../../components/grid/types";
import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredSeparator } from "../../components/separator/types";
import { expandHitTarget } from "../utils/expandHitTarget";
import type { HitRegion } from "./calculateHitRegions";
import { excludeSpanningCells } from "./excludeSpanningCells";

type Segment = {
  crossEnd: number;
  crossStart: number;
  end: number;
  start: number;
};

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
 */
export function calculateGridHitRegions({
  axis,
  cells,
  crossTrackCount,
  expandHitTargets,
  group,
  groupSize,
  includeDisabled,
  separatorPlacements
}: {
  axis: GridAxis;
  cells: RegisteredCell[];
  crossTrackCount: number;
  expandHitTargets: boolean;
  group: RegisteredGroup;
  groupSize: number;
  includeDisabled: boolean;
  separatorPlacements: Map<RegisteredSeparator, GridSeparatorPlacement>;
}): HitRegion[] {
  const { panels: tracks, separators } = group;
  const trackCount = tracks.length;

  let firstEnabledIndex = -1;
  let lastEnabledIndex = -1;
  let numEnabled = 0;
  tracks.forEach((track, index) => {
    if (!track.panelConstraints.disabled) {
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

  const isBoundaryResizable = (index: number) =>
    includeDisabled || (index > firstEnabledIndex && index <= lastEnabledIndex);

  const hitRegions: HitRegion[] = [];

  const createHitRegion = (
    index: number,
    rect: DOMRect,
    separator?: RegisteredSeparator
  ): HitRegion => ({
    group,
    groupSize,
    panels: [tracks[index - 1], tracks[index]],
    rect,
    separator
  });

  // Returns the position (along the cross axis) where the specified cross track starts or ends
  const getCrossTrackEdge = (crossIndex: number, edge: "start" | "end") => {
    let position: number | undefined = undefined;
    for (const cell of cells) {
      const cellCrossStart = axis === "column" ? cell.row : cell.column;
      const cellCrossSpan = axis === "column" ? cell.rowSpan : cell.columnSpan;
      if (
        edge === "start"
          ? cellCrossStart === crossIndex
          : cellCrossStart + cellCrossSpan - 1 === crossIndex
      ) {
        const rect = cell.element.getBoundingClientRect();
        if (edge === "start") {
          const start = axis === "column" ? rect.top : rect.left;
          position = position === undefined ? start : Math.min(position, start);
        } else {
          const end = axis === "column" ? rect.bottom : rect.right;
          position = position === undefined ? end : Math.max(position, end);
        }
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
    let rectStart = axis === "column" ? rect.top : rect.left;
    let rectEnd = axis === "column" ? rect.bottom : rect.right;
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
    rect =
      axis === "column"
        ? new DOMRect(rect.x, rectStart, rect.width, rectEnd - rectStart)
        : new DOMRect(rectStart, rect.y, rectEnd - rectStart, rect.height);

    rect = expandHitTarget({ expandHitTargets, group, rect });

    if (includeDisabled) {
      // Used to map gridlines to tracks (e.g. for keyboard interactions and aria attributes)
      hitRegions.push(createHitRegion(placement.index, rect, separator));
    } else {
      // Gridlines should not be rendered alongside of cells that span across their boundary (this is logged as an error)
      // but if they are, those cells should still not be treated as resize targets
      excludeSpanningCells({
        axis,
        cells,
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
      index,
      rect: expandHitTarget({ expandHitTargets, group, rect })
    }).forEach((current) => {
      hitRegions.push(createHitRegion(index, current));
    });
  };

  // Map each (cross track, track) slot to the Cell that occupies it (if any)
  const slots: (RegisteredCell | undefined)[][] = Array.from(
    { length: crossTrackCount },
    () => new Array(trackCount)
  );
  for (const cell of cells) {
    const [start, span, crossStart, crossSpan] =
      axis === "column"
        ? [cell.column, cell.columnSpan, cell.row, cell.rowSpan]
        : [cell.row, cell.rowSpan, cell.column, cell.columnSpan];

    for (
      let crossIndex = Math.max(0, crossStart);
      crossIndex < Math.min(crossTrackCount, crossStart + crossSpan);
      crossIndex++
    ) {
      for (
        let index = Math.max(0, start);
        index < Math.min(trackCount, start + span);
        index++
      ) {
        // If cells overlap, the first one wins
        slots[crossIndex][index] ??= cell;
      }
    }
  }

  const bounds = new Map<RegisteredCell, Segment>();
  const getBounds = (cell: RegisteredCell) => {
    let segment = bounds.get(cell);
    if (!segment) {
      const rect = cell.element.getBoundingClientRect();
      segment =
        axis === "column"
          ? {
              crossEnd: rect.bottom,
              crossStart: rect.top,
              end: rect.right,
              start: rect.left
            }
          : {
              crossEnd: rect.right,
              crossStart: rect.left,
              end: rect.bottom,
              start: rect.top
            };
      bounds.set(cell, segment);
    }
    return segment;
  };

  const toDOMRect = ({ crossEnd, crossStart, end, start }: Segment) =>
    axis === "column"
      ? new DOMRect(start, crossStart, end - start, crossEnd - crossStart)
      : new DOMRect(crossStart, start, crossEnd - crossStart, end - start);

  for (let index = 1; index < trackCount; index++) {
    if (boundariesWithSeparators.has(index) || !isBoundaryResizable(index)) {
      continue;
    }

    let pending: Segment | undefined = undefined;

    for (let crossIndex = 0; crossIndex < crossTrackCount; crossIndex++) {
      const before = slots[crossIndex][index - 1];
      const after = slots[crossIndex][index];

      let segment: Segment | undefined = undefined;
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
        addImplicitHitRegions(index, toDOMRect(pending));
        pending = undefined;
      }
    }

    if (pending) {
      addImplicitHitRegions(index, toDOMRect(pending));
    }
  }

  return hitRegions;
}
