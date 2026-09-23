# Resizable grids

`Grid` and `Cell` provide aligned two-dimensional layouts. Rows and columns own their sizes; every cell occupying a track shares its size. A column boundary resizes all rows together.

```tsx
import { Cell, Grid, Separator, useGridRef } from "react-resizable-panels";

function Example() {
  const gridRef = useGridRef();
  return (
    <Grid
      gridRef={gridRef}
      style={{ height: 400 }}
      columns={[
        { id: "left", defaultSize: "40%", minSize: 100 },
        { id: "right", minSize: 100 }
      ]}
      rows={[{ id: "top", minSize: 60 }, { id: "bottom", minSize: 60 }]}
    >
      <Cell row={0} column={0}>A</Cell>
      <Cell row={0} column={1}>B</Cell>
      <Cell row={1} column={0}>C</Cell>
      <Cell row={1} column={1}>D</Cell>
      <Separator axis="column" after={0} aria-label="Left column" />
    </Grid>
  );
}
```

## Tracks and cells

Omit `rows` and `columns` to infer their counts from mounted cells and start with equal sizes. Explicit definitions are recommended for server rendering and stable persistence. Inferred tracks are established when cells mount, so the server-rendered layout may shift during hydration. Give the grid a definite height.

Track definitions support `id`, `defaultSize`, `minSize`, `maxSize`, and `disabled`. Size units match `Panel`: numbers mean pixels; strings without units mean percentages; `%`, `px`, `em`, `rem`, `vw`, and `vh` are supported. Font-relative units use the Grid element. Percentages are relative to space excluding gutters. Pixel constraints are recalculated on container resize. User resizing preserves disabled track sizes; imperative layout changes may override them.

`Cell` uses zero-based `row` and `column` positions and optional positive `rowSpan`/`columnSpan` values (default one). A spanning cell occupies its tracks and intervening gutters. Overlapping cells and positions outside explicitly defined tracks are rejected; empty slots are allowed. Cells must be direct DOM children of the Grid; React wrappers and fragments are fine when they do not add DOM wrappers.

`Cell.onResize(size, id, previousSize)` reports `width` and `height`, each with `inPixels` and `asPercentage`. These measured cell percentages include any spanned gutters and are relative to the full grid dimensions. `elementRef` exposes the cell's element.

## Separators

Grid generates separators automatically. `<Separator axis="column" after={0} />` customizes the boundary after column zero; `axis="row"` customizes a row boundary. `axis` names the tracks being resized, not the visual orientation of the separator. Existing Group separators keep their existing API.

One logical boundary can render multiple segments when spans hide portions of it. Every segment resizes the same tracks; only the first segment is a tab stop. `className`, `style`, children, disabled state, and ARIA labels apply to all segments. A custom `id` and `elementRef` identify the first segment; subsequent segment IDs receive a suffix. Supply meaningful `aria-label` or `aria-labelledby` values for your application.

- Drag a segment to resize its axis; drag a crossing to resize both axes atomically.
- Arrow keys resize by 5 percentage points; Shift increases the step to 10.
- Home/End resize to the permitted minimum/maximum.
- Double-click restores the preceding track toward its default size, respecting constraints. `disableDoubleClick` disables this.
- `gap` sets gutter thickness in pixels (default 4). Separator styles cannot change track allocation.
- `resizeTargetMinimumSize` configures fine/coarse hit target widths (defaults 10/20).
- `disabled` disables the entire grid. `disableCursor` disables library cursor styling.

Separators cannot be dragged through the interior of a spanning cell. Content within cells keeps normal scrolling; touch gestures on separators are reserved for resizing. Coordinates use left-to-right column order.

## Layouts and persistence

```tsx
const layout = {
  rows: { top: 50, bottom: 50 },
  columns: { left: 40, right: 60 }
};

<Grid defaultLayout={layout} onLayoutChanged={saveLayout}>{/* cells */}</Grid>
```

Each axis maps track IDs to numeric percentages. Unnamed tracks use their zero-based index as an ID. Normally each axis totals 100; mutually infeasible constraints can overflow or leave unused space, matching the shared constraint validator. Choose constraints the container can satisfy.

`onLayoutChange` runs during resizing; `onLayoutChanged(layout, { isUserInteraction })` runs when a drag finishes or a keyboard resize completes. Initialization and imperative changes report `isUserInteraction: false`. Callbacks receive snapshots of both axes. A hidden grid waits until it has measurable dimensions before notifying.

`useGridRef()` exposes `getLayout()` and `setLayout(layout)`. `setLayout` validates both axes before applying either, and returns the applied layout. Layout inputs must have a finite, non-negative size for every current track, and positive totals. Returned layouts are copies. Use `setLayout` for updates after initialization; `defaultLayout` is an initial value.

Track IDs preserve sizes when reordered. Adding or removing track IDs resets the affected axis to its track defaults. Changing cell spans without changing tracks preserves sizes.

This initial API uses track constraints. Cell-level width/height constraints, track collapsing, preservation of fixed pixel sizes during container resize, and deferred separator previews are not included.

See `/examples/grid` on the documentation site for an interactive example.
