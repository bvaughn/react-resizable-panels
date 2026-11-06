import type { GridAxis, GridSegment, RegisteredCell } from "../types";
import { getCellRange } from "./getCellRange";
import { getRectSegment } from "./getRectSegment";
import { setRectCrossRange } from "./setRectCrossRange";

/**
 * Removes the parts of a (resize target) rect that overlap cells spanning across the boundary before the specified track.
 * This prevents resize targets that have been expanded (to meet the minimum hit target size)
 * from extending into cells that span across the boundary.
 *
 * Cell bounds are read using `getCellBounds` so that callers can cache them.
 */
export function excludeSpanningCells({
  axis,
  cells,
  getCellBounds,
  index,
  rect
}: {
  axis: GridAxis;
  cells: RegisteredCell[];
  getCellBounds: (cell: RegisteredCell) => GridSegment;
  index: number;
  rect: DOMRect;
}): DOMRect[] {
  let rects = [rect];
  for (const cell of cells) {
    const [start, span] = getCellRange(cell, axis);
    if (start >= index || start + span <= index) {
      continue;
    }

    const { crossStart: blockedStart, crossEnd: blockedEnd } =
      getCellBounds(cell);
    if (blockedEnd <= blockedStart) {
      continue;
    }

    rects = rects.flatMap((rect) => {
      const { crossStart, crossEnd } = getRectSegment(rect, axis);
      if (blockedStart >= crossEnd || blockedEnd <= crossStart) {
        return [rect];
      }

      const segments: DOMRect[] = [];
      if (crossStart < blockedStart) {
        segments.push(setRectCrossRange(rect, axis, crossStart, blockedStart));
      }
      if (crossEnd > blockedEnd) {
        segments.push(setRectCrossRange(rect, axis, blockedEnd, crossEnd));
      }
      return segments;
    });
  }

  return rects;
}
