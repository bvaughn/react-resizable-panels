import type { GridAxis, GridSlots, RegisteredCell } from "../types";
import { getCellRange } from "./getCellRange";

/**
 * Maps each (cross track, track) slot to the Cell that occupies it (if any);
 * if cells overlap, the first one wins
 */
export function getGridSlots({
  axis,
  cells,
  crossTrackCount,
  trackCount
}: {
  axis: GridAxis;
  cells: RegisteredCell[];
  crossTrackCount: number;
  trackCount: number;
}): GridSlots {
  const slots: GridSlots = Array.from(
    { length: crossTrackCount },
    () => new Array(trackCount)
  );
  for (const cell of cells) {
    const [start, span, crossStart, crossSpan] = getCellRange(cell, axis);

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
        slots[crossIndex][index] ??= cell;
      }
    }
  }
  return slots;
}
