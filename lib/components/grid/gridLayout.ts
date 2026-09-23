import type { Layout } from "../group/types";
import type { PanelConstraints } from "../panel/types";
import { parseSizeAndUnit } from "../../global/styles/parseSizeAndUnit";
import { sizeStyleToPixels } from "../../global/styles/sizeStyleToPixels";
import { adjustLayoutByDelta } from "../../global/utils/adjustLayoutByDelta";
import { calculateDefaultLayout } from "../../global/utils/calculateDefaultLayout";
import { validatePanelGroupLayout } from "../../global/utils/validatePanelGroupLayout";
import type { GridAxis, GridLayout, GridTrack, RegisteredCell } from "./types";

export function getTracks(
  tracks: readonly GridTrack[] | undefined,
  count: number
) {
  const result = (tracks ?? Array.from({ length: count }, () => ({}))).map(
    (track: GridTrack, index) => ({ ...track, id: track.id ?? `${index}` })
  );
  if (new Set(result.map(({ id }) => id)).size !== result.length) {
    throw Error("Grid track ids must be unique within each axis");
  }
  return result;
}

export function validateCells(
  cells: RegisteredCell[],
  rows: number,
  columns: number
) {
  const occupied = new Map<string, string>();
  for (const cell of cells) {
    if (
      cell.row + cell.rowSpan > rows ||
      cell.column + cell.columnSpan > columns
    ) {
      throw Error(`Cell "${cell.id}" extends beyond the Grid tracks`);
    }
    for (let row = cell.row; row < cell.row + cell.rowSpan; row++) {
      for (
        let column = cell.column;
        column < cell.column + cell.columnSpan;
        column++
      ) {
        const key = `${row}:${column}`;
        if (occupied.has(key))
          throw Error(
            `Grid cells "${occupied.get(key)}" and "${cell.id}" overlap`
          );
        occupied.set(key, cell.id);
      }
    }
  }
}

export function getConstraints(
  tracks: ReturnType<typeof getTracks>,
  availableSize: number,
  element: HTMLElement | null
): PanelConstraints[] {
  const convert = (value: number | string, fallback: number) => {
    const [number, unit] = parseSizeAndUnit(value);
    if (!Number.isFinite(number) || number < 0)
      throw Error("Grid track sizes must be finite and non-negative");
    if (unit === "%") return number;
    if (!element || availableSize <= 0) return fallback;
    return (
      (100 *
        sizeStyleToPixels({
          groupSize: availableSize,
          panelElement: element,
          styleProp: value
        })) /
      availableSize
    );
  };
  return tracks.map((track) => {
    const minSize = convert(track.minSize ?? "0%", 0);
    const maxSize =
      track.maxSize === undefined
        ? Math.max(100, minSize)
        : convert(track.maxSize, 100);
    if (minSize > maxSize)
      throw Error(`Grid track "${track.id}" has minSize greater than maxSize`);
    return {
      panelId: track.id,
      collapsedSize: 0,
      collapsible: false,
      defaultSize:
        track.defaultSize === undefined
          ? undefined
          : convert(track.defaultSize, 100 / tracks.length),
      disabled: track.disabled,
      minSize,
      maxSize
    };
  });
}

export function validateAxis(
  layout: Layout,
  constraints: PanelConstraints[]
): Layout {
  const ids = constraints.map(({ panelId }) => panelId);
  if (
    Object.keys(layout).length !== ids.length ||
    ids.some(
      (id) =>
        !Object.hasOwn(layout, id) ||
        !Number.isFinite(layout[id]) ||
        layout[id] < 0
    )
  ) {
    throw Error(
      "Grid layout must contain a finite, non-negative size for every track id"
    );
  }
  const total = Object.values(layout).reduce((sum, value) => sum + value, 0);
  if (ids.length && (!Number.isFinite(total) || total <= 0))
    throw Error("Grid layout must have a positive total size");
  // If the container becomes too small, honor minima and let tracks overflow.
  // This is preferable to silently violating constraints or returning NaN sizes.
  return validatePanelGroupLayout({ layout, panelConstraints: constraints });
}

export function reconcileAxis(
  layout: Layout | undefined,
  constraints: PanelConstraints[]
) {
  if (
    layout &&
    constraints.length === Object.keys(layout).length &&
    constraints.every(({ panelId }) => Object.hasOwn(layout, panelId))
  ) {
    return validateAxis(layout, constraints);
  }
  const initial = calculateDefaultLayout(constraints);
  for (const key of Object.keys(initial))
    initial[key] = Math.max(0, initial[key]);
  if (Object.values(initial).every((value) => value === 0)) {
    for (const key of Object.keys(initial))
      initial[key] = 100 / constraints.length;
  }
  return validateAxis(initial, constraints);
}

export function resizeAxis(
  layout: Layout,
  constraints: PanelConstraints[],
  after: number,
  delta: number,
  trigger: "keyboard" | "mouse-or-touch" = "mouse-or-touch"
) {
  return adjustLayoutByDelta({
    delta,
    initialLayout: layout,
    prevLayout: layout,
    panelConstraints: constraints,
    pivotIndices: [after, after + 1],
    trigger
  });
}

export function copyLayout(layout: GridLayout): GridLayout {
  return { rows: { ...layout.rows }, columns: { ...layout.columns } };
}

/** Merge adjacent visible portions; a spanning cell masks its interior boundaries. */
export function getSegments(
  axis: GridAxis,
  after: number,
  crossCount: number,
  cells: RegisteredCell[]
) {
  const segments: { start: number; span: number }[] = [];
  for (let cross = 0; cross < crossCount; cross++) {
    const hidden = cells.some((cell) => {
      const start = axis === "column" ? cell.column : cell.row;
      const span = axis === "column" ? cell.columnSpan : cell.rowSpan;
      const crossStart = axis === "column" ? cell.row : cell.column;
      const crossSpan = axis === "column" ? cell.rowSpan : cell.columnSpan;
      return (
        start <= after &&
        start + span > after + 1 &&
        crossStart <= cross &&
        crossStart + crossSpan > cross
      );
    });
    if (!hidden) {
      const previous = segments.at(-1);
      if (previous && previous.start + previous.span === cross) previous.span++;
      else segments.push({ start: cross, span: 1 });
    }
  }
  return segments;
}
