import type { HTMLAttributes, Ref } from "react";
import type {
  Layout,
  LayoutChangedMeta,
  ResizeTargetMinimumSize
} from "../group/types";
import type { PanelSize } from "../panel/types";
import type { SeparatorProps } from "../separator/types";

export type GridAxis = "row" | "column";

/** Sizes use the same units as Panel: numbers are pixels, strings default to percentages. */
export type GridTrack = {
  /** Stable identity for persistence. Defaults to the zero-based track index. */
  id?: string | undefined;
  defaultSize?: number | string | undefined;
  minSize?: number | string | undefined;
  maxSize?: number | string | undefined;
  /** Prevent direct and indirect user resizing of this track. */
  disabled?: boolean | undefined;
};

/** Percentages of available space, excluding gutters; each axis totals 100. */
export type GridLayout = { rows: Layout; columns: Layout };
/** Imperative API for reading and updating both axes of a Grid. */
export interface GridImperativeHandle {
  /** Returns a snapshot of row and column sizes as percentages. */
  getLayout: () => GridLayout;
  /** Validates both axes and returns the applied layout. */
  setLayout: (layout: GridLayout) => GridLayout;
}

export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "id"> & {
  id?: string | number | undefined;
  /** Omit to infer the track count from registered cells. */
  rows?: readonly GridTrack[] | undefined;
  columns?: readonly GridTrack[] | undefined;
  defaultLayout?: GridLayout | undefined;
  gridRef?: Ref<GridImperativeHandle | null> | undefined;
  elementRef?: Ref<HTMLDivElement | null> | undefined;
  disabled?: boolean | undefined;
  disableCursor?: boolean | undefined;
  /** Width of column gutters and height of row gutters, in pixels. Defaults to 4. */
  gap?: number | undefined;
  resizeTargetMinimumSize?: ResizeTargetMinimumSize | undefined;
  onLayoutChange?: ((layout: GridLayout) => void) | undefined;
  onLayoutChanged?:
    | ((layout: GridLayout, meta: LayoutChangedMeta) => void)
    | undefined;
};

export type CellSize = { width: PanelSize; height: PanelSize };
export type CellProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "id" | "onResize"
> & {
  id?: string | number | undefined;
  row: number;
  column: number;
  rowSpan?: number | undefined;
  columnSpan?: number | undefined;
  elementRef?: Ref<HTMLDivElement | null> | undefined;
  onResize?:
    | ((
        size: CellSize,
        id: string | number | undefined,
        previousSize: CellSize | undefined
      ) => void)
    | undefined;
};

/** Customizes the automatically generated segments of one track boundary. */
export type GridSeparatorProps = Omit<SeparatorProps, "preview"> & {
  /** Grid only: the tracks resized by this boundary. Requires after. */
  axis: GridAxis;
  /** Grid only: zero-based index of the track preceding the boundary. Requires axis. */
  after: number;
};

export type RegisteredCell = {
  id: string;
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};
