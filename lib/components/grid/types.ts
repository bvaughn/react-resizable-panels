import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import type { Layout, LayoutChangedMeta } from "../group/types";
import type { PanelConstraintProps } from "../panel/types";
import type { RegisteredSeparator } from "../separator/types";

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
 * Imperative API for an individual Grid track (column or row); returned by `GridImperativeHandle.getTrackById` and `GridImperativeHandle.getTrackByIndex`.
 *
 * ℹ️ Sizes are relative to the space available to the track's axis
 * (e.g. the width of the Grid, minus gaps and gridlines, for a column).
 */
export interface GridTrackImperativeHandle {
  /**
   * Collapse the track to its `collapsedSize`.
   *
   * ⚠️ This method will do nothing if the track is not `collapsible` or if it is already collapsed.
   */
  collapse: () => void;

  /**
   * Expand a collapsed track to its most recent size.
   *
   * ⚠️ This method will do nothing if the track is not currently collapsed.
   */
  expand: () => void;

  /**
   * Get the current size of the track in pixels as well as a percentage of its axis (0..100).
   *
   * @return Track size (in pixels and as a percentage of its axis)
   */
  getSize: () => {
    asPercentage: number;
    inPixels: number;
  };

  /**
   * The track is currently collapsed.
   */
  isCollapsed: () => boolean;

  /**
   * Update the track's size.
   *
   * Size can be in the following formats:
   * - Percentage of the axis (0..100)
   * - Pixels
   * - Relative font units (em, rem)
   * - Viewport relative units (vh, vw)
   *
   * ℹ️ Numeric values are assumed to be pixels.
   * Strings without explicit units are assumed to be percentages (0%..100%).
   * Percentages may also be specified as strings ending with "%" (e.g. "33%")
   * Pixels may also be specified as strings ending with the unit "px".
   * Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)
   *
   * @param size New track size
   */
  resize: (size: number | string) => void;
}

/**
 * Imperative Grid API.
 *
 * ℹ️ The `useGridRef` and `useGridCallbackRef` hooks are exported for convenience use in TypeScript projects.
 */
export interface GridImperativeHandle {
  /**
   * Get the Grid's current layout: maps of column and row ids to percentages (0..100)
   *
   * @return Map of column ids to percentages and map of row ids to percentages (specified as numbers ranging between 0..100)
   */
  getLayout: () => {
    columns: { [columnId: string]: number };
    rows: { [rowId: string]: number };
  };

  /**
   * Imperative API for the column or row with the specified id (see `GridTrackImperativeHandle`).
   *
   * ℹ️ Tracks without an explicit `id` use their index (e.g. `"0"`) as their id.
   *
   * ⚠️ An error will be thrown if the Grid does not contain a matching track.
   *
   * @param axis "column" or "row"
   * @param id Track id
   */
  getTrackById: (
    axis: "column" | "row",
    id: string | number
  ) => GridTrackImperativeHandle;

  /**
   * Imperative API for the column or row at the specified index (see `GridTrackImperativeHandle`).
   *
   * ℹ️ The index is resolved to a track id when this method is called; the returned API continues to refer to that id.
   * Tracks without an explicit `id` use their index as their id,
   * so specify ids if the API needs to refer to the same track after tracks are added or removed before it.
   *
   * ⚠️ An error will be thrown if the index is out of range.
   *
   * @param axis "column" or "row"
   * @param index Track index (starting at 0)
   */
  getTrackByIndex: (
    axis: "column" | "row",
    index: number
  ) => GridTrackImperativeHandle;

  /**
   * Set a new layout for one or both of the Grid's axes.
   *
   * @param layout Map of column and/or row ids to percentages (numbers between 0..100)
   * @return Applied layout (after validation)
   */
  setLayout: (layout: {
    columns?: { [columnId: string]: number } | undefined;
    rows?: { [rowId: string]: number } | undefined;
  }) => {
    columns: { [columnId: string]: number };
    rows: { [rowId: string]: number };
  };
}

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Cell and Gridline components that comprise this grid.
   *
   * ⚠️ Cell and Gridline elements must be direct DOM children of their parent Grid element.
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
   * - `getTrackById(axis: "column" | "row", id: string | number): GridTrackImperativeHandle`
   * - `getTrackByIndex(axis: "column" | "row", index: number): GridTrackImperativeHandle`
   * - `setLayout(layout: Partial<GridLayout>): GridLayout`
   *
   * ℹ️ The `useGridRef` and `useGridCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  gridRef?: Ref<GridImperativeHandle | null> | undefined;

  /**
   * Uniquely identifies this grid within an application.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `id` and `data-testid` attributes.
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
   * Minimum size of the resizable hit target area (either a `Gridline` or a `Cell` edge)
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
   * ℹ️ This value will also be assigned to the `id` and `data-testid` attributes.
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

type BaseGridlineProps = {
  /**
   * Gridline contents (e.g. a drag handle icon).
   */
  children?: ReactNode | undefined;

  /**
   * CSS class name.
   *
   * ℹ️ Use the `data-separator` attribute for custom _hover_ and _active_ styles
   */
  className?: string | undefined;

  /**
   * When disabled, the gridline cannot be used to resize its neighboring tracks.
   *
   * ℹ️ The tracks may still be resized indirectly (e.g. by an intersecting gridline or another boundary).
   * To prevent a track from being resized at all, it needs to also be disabled.
   */
  disabled?: boolean | undefined;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement> | undefined;

  /**
   * CSS properties.
   *
   * ⚠️ Grid placement properties are managed by the gridline and cannot be overridden.
   */
  style?: CSSProperties | undefined;
};

export type GridlineProps = BaseGridlineProps &
  (
    | {
        /**
         * Column gridlines are vertical; they resize the columns on either side of them.
         * Row gridlines are horizontal; they resize the rows on either side of them.
         */
        type: "column";

        /**
         * When `type` is "column", the gridline is rendered along the leading (left) edge of this column
         * (between it and the previous column); must be greater than 0 and less than the number of columns.
         */
        column: number;

        /**
         * When `type` is "column", index of the first row the gridline is rendered alongside of; defaults to 0.
         */
        row?: number | undefined;

        /**
         * Number of rows a column gridline spans; defaults to all rows (starting from `row`).
         *
         * ℹ️ Gridlines can span a subset of rows in order to avoid cells that span across the boundary they sit on;
         * multiple gridlines can be rendered along the same boundary (e.g. above and below a spanning cell).
         */
        rowSpan?: number | undefined;
      }
    | {
        /**
         * Column gridlines are vertical; they resize the columns on either side of them.
         * Row gridlines are horizontal; they resize the rows on either side of them.
         */
        type: "row";

        /**
         * When `type` is "row", index of the first column the gridline is rendered alongside of; defaults to 0.
         */
        column?: number | undefined;

        /**
         * Number of columns a row gridline spans; defaults to all columns (starting from `column`).
         *
         * ℹ️ Gridlines can span a subset of columns in order to avoid cells that span across the boundary they sit on;
         * multiple gridlines can be rendered along the same boundary (e.g. before and after a spanning cell).
         */
        columnSpan?: number | undefined;

        /**
         * When `type` is "row", the gridline is rendered along the leading (top) edge of this row
         * (between it and the previous row); must be greater than 0 and less than the number of rows.
         */
        row: number;
      }
  );

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
   * Index of the first track (along the opposite axis) the separator is rendered alongside
   */
  crossStart: number;

  /**
   * Number of tracks (along the opposite axis) the separator spans; undefined means "until the end"
   */
  crossSpan: number | undefined;

  disabled: boolean;
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
  separatorPlacements: ReadonlyMap<RegisteredSeparator, GridSeparatorPlacement>;
  trackCounts: { column: number; row: number };
  updateSeparatorProps: (
    id: string,
    props: {
      disabled: boolean | undefined;
      disableDoubleClick: boolean | undefined;
    }
  ) => void;
};
