import type { GridAxis, RegisteredCell } from "../../components/grid/types";

/**
 * Removes the parts of a (resize target) rect that overlap cells spanning across the boundary before the specified track.
 * This prevents resize targets that have been expanded (to meet the minimum hit target size)
 * from extending into cells that span across the boundary.
 */
export function excludeSpanningCells({
  axis,
  cells,
  index,
  rect
}: {
  axis: GridAxis;
  cells: RegisteredCell[];
  index: number;
  rect: DOMRect;
}): DOMRect[] {
  let rects = [rect];
  for (const cell of cells) {
    const start = axis === "column" ? cell.column : cell.row;
    const span = axis === "column" ? cell.columnSpan : cell.rowSpan;
    if (start >= index || start + span <= index) {
      continue;
    }

    const bounds = cell.element.getBoundingClientRect();
    const blockedStart = axis === "column" ? bounds.top : bounds.left;
    const blockedEnd = axis === "column" ? bounds.bottom : bounds.right;
    if (blockedEnd <= blockedStart) {
      continue;
    }

    rects = rects.flatMap((rect) => {
      const crossStart = axis === "column" ? rect.top : rect.left;
      const crossEnd = axis === "column" ? rect.bottom : rect.right;
      if (blockedStart >= crossEnd || blockedEnd <= crossStart) {
        return [rect];
      }

      const segments: DOMRect[] = [];
      const addSegment = (start: number, end: number) => {
        segments.push(
          axis === "column"
            ? new DOMRect(rect.x, start, rect.width, end - start)
            : new DOMRect(start, rect.y, end - start, rect.height)
        );
      };
      if (crossStart < blockedStart) {
        addSegment(crossStart, blockedStart);
      }
      if (crossEnd > blockedEnd) {
        addSegment(blockedEnd, crossEnd);
      }
      return segments;
    });
  }

  return rects;
}
