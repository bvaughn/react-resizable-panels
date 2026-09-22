import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import type { Layout, LayoutChangedMeta } from "../group/types";
import type {
  PanelConstraintProps,
  PanelImperativeHandle
} from "../panel/types";
import type { RegisteredSeparator, SeparatorProps } from "../separator/types";

/**
 * A Grid has two independently resizable axes:
 * - "column" tracks are resized horizontally
 * - "row" tracks are resized vertically
 */
export type GridAxis = "column" | "row";

/**
 * Grid layouts are a pair of (1-dimensional) layouts, one per axis.
 * Each is a map of track id to percentage (0..100) of the space available to that axis.
 */
export type GridLayout = {
  columns: Layout;
  rows: Layout;
};

/**
 * Size constraints for a Grid track (a column or a row).
 *
 * Tracks support the same constraints as Panels,
 * using the same [interpretation rules](https://react-resizable-panels.vercel.app/examples/size-constraints):
 * - Numbers are interpreted as pixels (e.g. `minSize={200}` is 200 pixels)
 * - Strings without explicit units are interpreted as percentage (e.g. `minSize="50"` is 50 percent)
 * - Use explicit units (e.g. "px", "%", "em", "rem", "vh", or "vw") to change interpretation
 */
export type GridTrackProps = PanelConstraintProps & {
  /**
   * Uniquely identifies this track within its axis; defaults to the track's index.
   *
   * ℹ️ This value is used as the key for this track in the Grid's layout.
   */
  id?: string | number | undefined;
};

/**
 * Imperative API for an individual Grid track (column or row).
 * Sizes are relative to the space available to the track's axis.
 */
export type GridTrackImperativeHandle = PanelImperativeHandle;

/**
 * Imperative Grid API.
 *
 * ℹ️ The `useGridRef` and `useGridCallbackRef` hooks are exported for convenience use in TypeScript projects.
 */
export interface GridImperativeHandle {
  /**
   * Get the Grid's current layout.
   *
   * @return Map of column and row ids to percentages (specified as numbers ranging between 0..100)
   */
  getLayout: () => GridLayout;

  /**
   * Imperative API for a specific column or row.
   *
   * @param axis "column" or "row"
   * @param id Track id (defaults to the track index if no id was specified)
   */
  getTrack: (axis: GridAxis, id: string | number) => GridTrackImperativeHandle;

  /**
   * Set a new layout for one or both of the Grid's axes.
   *
   * @param layout Map of column and/or row ids to percentages (numbers between 0..100)
   * @return Applied layout (after validation)
   */
  setLayout: (layout: Partial<GridLayout>) => GridLayout;
}

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Cell and GridSeparator components that comprise this grid.
   *
   * ⚠️ Cell and GridSeparator elements must be direct DOM children of their parent Grid element.
   */
  children?: ReactNode | undefined;

  /**
   * CSS class name.
   */
  className?: string | undefined;

  /**
   * Grid columns; either the number of columns or an array of size constraints (one per column).
   */
  columns: number | GridTrackProps[];

  /**
   * Default layout for either or both of the Grid's axes.
   *
   * ℹ️ This value allows layouts to be remembered between page reloads.
   */
  defaultLayout?: Partial<GridLayout> | undefined;

  /**
   * This library sets custom mouse cursor styles to indicate drag state.
   * Use this prop to disable that behavior for this grid.
   */
  disableCursor?: boolean | undefined;

  /**
   * Disable resize functionality.
   */
  disabled?: boolean | undefined;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement | null> | undefined;

  /**
   * Exposes the following imperative API:
   * - `getLayout(): GridLayout`
   * - `getTrack(axis: "column" | "row", id: string | number): GridTrackImperativeHandle`
   * - `setLayout(layout: Partial<GridLayout>): GridLayout`
   *
   * ℹ️ The `useGridRef` and `useGridCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  gridRef?: Ref<GridImperativeHandle | null> | undefined;

  /**
   * Uniquely identifies this grid within an application.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-grid` attribute.
   */
  id?: string | number | undefined;

  /**
   * Called when the Grid's layout is changing.
   *
   * ⚠️ For layout changes caused by pointer events, this method is called each time the pointer is moved.
   * For most cases, it is recommended to use the `onLayoutChanged` callback instead.
   */
  onLayoutChange?: ((layout: GridLayout) => void) | undefined;

  /**
   * Called after the Grid's layout has been changed.
   *
   * ℹ️ For layout changes caused by pointer events, this method is not called until the pointer has been released.
   * This method is recommended when saving layouts to some storage api.
   */
  onLayoutChanged?:
    | ((layout: GridLayout, meta: LayoutChangedMeta) => void)
    | undefined;

  /**
   * Minimum size of the resizable hit target area (either `GridSeparator` or `Cell` edge)
   * This threshold ensures targets are large enough to avoid mis-clicks.
   *
   * ℹ️ Refer to the `Group` prop of the same name for more information.
   */
  resizeTargetMinimumSize?: {
    coarse: number;
    fine: number;
  };

  /**
   * Grid rows; either the number of rows or an array of size constraints (one per row).
   */
  rows: number | GridTrackProps[];

  /**
   * CSS properties.
   *
   * ⚠️ Grid template and display properties are managed by the Grid and cannot be overridden.
   */
  style?: CSSProperties | undefined;
};

export type CellProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Cell contents.
   */
  children?: ReactNode | undefined;

  /**
   * CSS class name.
   */
  className?: string | undefined;

  /**
   * Index of the (first) column this cell occupies.
   */
  column: number;

  /**
   * Number of columns this cell spans; defaults to 1.
   */
  columnSpan?: number | undefined;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement | null> | undefined;

  /**
   * Uniquely identifies this cell within the parent grid.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-cell` attribute.
   */
  id?: string | number | undefined;

  /**
   * Index of the (first) row this cell occupies.
   */
  row: number;

  /**
   * Number of rows this cell spans; defaults to 1.
   */
  rowSpan?: number | undefined;

  /**
   * CSS properties.
   *
   * ⚠️ Grid placement properties are managed by the Cell and cannot be overridden.
   */
  style?: CSSProperties | undefined;
};

type BaseGridSeparatorProps = Omit<SeparatorProps, "preview">;

/**
 * Separator between two columns; resizes columns.
 */
export type ColumnSeparatorPlacement = {
  /**
   * The separator is rendered along the leading (left) edge of this column,
   * between it and the previous column.
   * Must be greater than 0.
   */
  column: number;

  /**
   * First row the separator is rendered alongside; defaults to 0.
   */
  rowStart?: number | undefined;

  /**
   * Number of rows the separator spans; defaults to all rows (starting from `rowStart`).
   */
  rowSpan?: number | undefined;

  row?: never;
  columnStart?: never;
  columnSpan?: never;
};

/**
 * Separator between two rows; resizes rows.
 */
export type RowSeparatorPlacement = {
  /**
   * The separator is rendered along the leading (top) edge of this row,
   * between it and the previous row.
   * Must be greater than 0.
   */
  row: number;

  /**
   * First column the separator is rendered alongside; defaults to 0.
   */
  columnStart?: number | undefined;

  /**
   * Number of columns the separator spans; defaults to all columns (starting from `columnStart`).
   */
  columnSpan?: number | undefined;

  column?: never;
  rowStart?: never;
  rowSpan?: never;
};

export type GridSeparatorProps = BaseGridSeparatorProps &
  (ColumnSeparatorPlacement | RowSeparatorPlacement);

/**
 * @internal
 */
export type RegisteredCell = {
  column: number;
  columnSpan: number;
  element: HTMLElement;
  id: string;
  row: number;
  rowSpan: number;
};

/**
 * @internal
 */
export type GridSeparatorPlacement = {
  axis: GridAxis;

  /**
   * Index of the track after the separator (the separator sits between tracks `index - 1` and `index`)
   */
  index: number;

  /**
   * First track along the opposite axis
   */
  crossStart: number;

  /**
   * Number of tracks spanned along the opposite axis (undefined means "until the end")
   */
  crossSpan: number | undefined;
};

/**
 * @internal
 */
export type GridContextType = {
  getDisableCursor: () => boolean;
  getGroupId: (axis: GridAxis) => string;
  gutters: { column: boolean; row: boolean };
  id: string;
  registerCell: (cell: RegisteredCell) => () => void;
  registerSeparator: (
    placement: GridSeparatorPlacement,
    separator: RegisteredSeparator
  ) => () => void;
  trackCounts: { column: number; row: number };
  updateSeparatorProps: (
    id: string,
    props: {
      disabled: boolean | undefined;
      disableDoubleClick: boolean | undefined;
    }
  ) => void;
};
