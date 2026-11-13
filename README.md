<img src="https://react-resizable-panels.vercel.app/og.png" alt="react-resizable-panels logo" width="400" height="210" />

`react-resizable-panels`: React components for resizable layouts: panel groups, grids, and workspaces of tabsets that users can rearrange by dragging tabs.

## Support

If you like this project there are several ways to support it:

- [Become a GitHub sponsor](https://github.com/sponsors/bvaughn/)
- or [buy me a coffee](http://givebrian.coffee/)

## Installation

Begin by installing the library from NPM:

```sh
npm install react-resizable-panels
```

## TypeScript types

TypeScript definitions are included within the published `dist` folder

## FAQs

Frequently asked questions can be found [here](https://react-resizable-panels.vercel.app/common-questions).

## Documentation

Documentation for this project is available at [react-resizable-panels.vercel.app](https://react-resizable-panels.vercel.app/).

<!-- react-lib-tools:api:begin -->

## Components

### Cell

A Cell occupies one or more tracks (columns and rows) within a Grid.
Cells are resized along with the tracks they occupy.

Cell elements always include the following attributes:

```html
<div data-cell data-testid="cell-id-prop" id="cell-id-prop">
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

⚠️ Cell elements must be direct DOM children of their parent Grid elements.

#### Required props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>column</td>
      <td><p>Index of the (first) column this cell occupies.</p>
</td>
    </tr>
    <tr>
      <td>row</td>
      <td><p>Index of the (first) row this cell occupies.</p>
</td>
    </tr>
  </tbody>
</table>

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies this cell within the parent grid.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This value will also be assigned to the <code>id</code> and <code>data-testid</code> attributes (an explicit <code>data-testid</code> prop will take precedence).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>⚠️ Grid placement properties are managed by the Cell and cannot be overridden.</p>
</td>
    </tr>
    <tr>
      <td>children</td>
      <td><p>Cell contents.</p>
</td>
    </tr>
    <tr>
      <td>columnSpan</td>
      <td><p>Number of columns this cell spans; defaults to 1.</p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>rowSpan</td>
      <td><p>Number of rows this cell spans; defaults to 1.</p>
</td>
    </tr>
  </tbody>
</table>

### Grid

A Grid arranges resizable Cells in two dimensions.
Columns can be resized horizontally and rows can be resized vertically;
dragging the point where a column boundary and a row boundary intersect resizes both.

Size constraints (e.g. min/max size, collapsible) are specified per track (column or row),
using the same format as Panel props.

Cells can span multiple columns and/or rows.
Track boundaries cannot be resized alongside of a cell that spans across them.

Grid elements always include the following attributes:

```html
<div data-grid data-testid="grid-id-prop" id="grid-id-prop">
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

#### Required props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>columns</td>
      <td><p>Grid columns; either the number of columns or an array of size constraints (one per column).</p>
</td>
    </tr>
    <tr>
      <td>rows</td>
      <td><p>Grid rows; either the number of rows or an array of size constraints (one per row).</p>
</td>
    </tr>
  </tbody>
</table>

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies this grid within an application.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This value will also be assigned to the <code>id</code> and <code>data-testid</code> attributes (an explicit <code>data-testid</code> prop will take precedence).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>⚠️ Grid template and display properties are managed by the Grid and cannot be overridden.</p>
</td>
    </tr>
    <tr>
      <td>children</td>
      <td><p>Cell and Gridline components that comprise this grid.</p>
<p>⚠️ Cell and Gridline elements must be direct DOM children of their parent Grid element.</p>
</td>
    </tr>
    <tr>
      <td>defaultLayout</td>
      <td><p>Default layout for either or both of the Grid&#39;s axes.</p>
<p>ℹ️ This value allows layouts to be remembered between page reloads.</p>
</td>
    </tr>
    <tr>
      <td>disableCursor</td>
      <td><p>This library sets custom mouse cursor styles to indicate drag state.
Use this prop to disable that behavior for this grid.</p>
</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td><p>Disable resize functionality.</p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>gridRef</td>
      <td><p>Exposes the following imperative API:</p>
<ul>
<li><code>getLayout(): GridLayout</code></li>
<li><code>getTrackById(axis: &quot;column&quot; | &quot;row&quot;, id: string | number): GridTrackImperativeHandle</code></li>
<li><code>getTrackByIndex(axis: &quot;column&quot; | &quot;row&quot;, index: number): GridTrackImperativeHandle</code></li>
<li><code>setLayout(layout: Partial&lt;GridLayout&gt;): GridLayout</code></li>
</ul>
<p>ℹ️ The <code>useGridRef</code> and <code>useGridCallbackRef</code> hooks are exported for convenience in TypeScript projects.</p>
</td>
    </tr>
    <tr>
      <td>onLayoutChange</td>
      <td><p>Called when the Grid&#39;s layout is changing.</p>
<p>⚠️ For layout changes caused by pointer events, this method is called each time the pointer is moved.
For most cases, it is recommended to use the <code>onLayoutChanged</code> callback instead.</p>
</td>
    </tr>
    <tr>
      <td>onLayoutChanged</td>
      <td><p>Called after the Grid&#39;s layout has been changed.</p>
<p>ℹ️ For layout changes caused by pointer events, this callback is not called until the pointer has been released.
This callback is recommended for saving layouts to storage.</p>
</td>
    </tr>
    <tr>
      <td>resizeTargetMinimumSize</td>
      <td><p>Minimum size of the resizable hit target area (either a <code>Gridline</code> or a <code>Cell</code> edge).
This threshold ensures targets are large enough to avoid mis-clicks.</p>
<p>ℹ️ Refer to the <code>Group</code> prop of the same name for more information.</p>
</td>
    </tr>
  </tbody>
</table>

### Gridline

Resizes the columns (or rows) of a Grid.

For example:

```tsx
// Rendered between columns 0 and 1 and spans all rows
<Gridline type="column" column={1} />
```

```tsx
// Rendered between rows 0 and 1 and spans all columns
<Gridline type="row" row={1} />
```

```tsx
// Rendered between columns 0 and 1 alongside of row 2 only
<Gridline type="column" column={1} row={2} rowSpan={1} />
```

A gridline should not be rendered alongside of a Cell that spans across its boundary
(this includes disabled gridlines; in development builds, an error will be logged to the console);
render multiple gridlines along the same boundary instead (e.g. before and after the spanning Cell).

ℹ️ Once a boundary contains a gridline, it can only be resized using gridlines;
the parts of the boundary that aren't alongside of a gridline can't be dragged.

Where column and row gridlines intersect, dragging resizes both axes.

Gridlines are not _required_ but they are _recommended_ as they improve keyboard accessibility.

Gridline elements always include the following attributes:

```html
<div aria-orientation="vertical" data-separator role="separator">
```

ℹ️ Column gridlines are vertical (`aria-orientation="vertical"`) and row gridlines are horizontal (`aria-orientation="horizontal"`).

ℹ️ In addition to the attributes shown above, gridlines also render all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).

⚠️ Gridline elements must be direct DOM children of their parent Grid elements.

ℹ️ Gridlines rendered by another component (rather than directly within the Grid) aren't detected until they mount, so server-rendered layouts may shift slightly during hydration.

#### Required props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>type</td>
      <td><p>Column gridlines are vertical; they resize the columns on either side of them.
Row gridlines are horizontal; they resize the rows on either side of them.</p>
</td>
    </tr>
  </tbody>
</table>

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>children</td>
      <td><p>Gridline contents (e.g. a drag handle icon).</p>
</td>
    </tr>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
<p>ℹ️ Use the <code>data-separator</code> attribute for custom <em>hover</em> and <em>active</em> styles</p>
</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td><p>When disabled, the gridline cannot be used to resize its neighboring tracks.</p>
<p>ℹ️ The tracks may still be resized indirectly (e.g. by an intersecting gridline or another boundary).
To prevent a track from being resized at all, it needs to also be disabled.</p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>⚠️ Grid placement properties are managed by the gridline and cannot be overridden.</p>
</td>
    </tr>
    <tr>
      <td>column</td>
      <td><p>When <code>type</code> is &quot;column&quot;, the gridline is rendered along the leading (left) edge of this column
(between it and the previous column); must be greater than 0 and less than the number of columns.
When <code>type</code> is &quot;row&quot;, index of the first column the gridline is rendered alongside of; defaults to 0.</p>
</td>
    </tr>
    <tr>
      <td>row</td>
      <td><p>When <code>type</code> is &quot;column&quot;, index of the first row the gridline is rendered alongside of; defaults to 0.
When <code>type</code> is &quot;row&quot;, the gridline is rendered along the leading (top) edge of this row
(between it and the previous row); must be greater than 0 and less than the number of rows.</p>
</td>
    </tr>
    <tr>
      <td>rowSpan</td>
      <td><p>Number of rows a column gridline spans; defaults to all rows (starting from <code>row</code>).</p>
<p>ℹ️ Gridlines can span a subset of rows in order to avoid cells that span across the boundary they sit on;
multiple gridlines can be rendered along the same boundary (e.g. above and below a spanning cell).</p>
</td>
    </tr>
    <tr>
      <td>columnSpan</td>
      <td><p>Number of columns a row gridline spans; defaults to all columns (starting from <code>column</code>).</p>
<p>ℹ️ Gridlines can span a subset of columns in order to avoid cells that span across the boundary they sit on;
multiple gridlines can be rendered along the same boundary (e.g. before and after a spanning cell).</p>
</td>
    </tr>
  </tbody>
</table>

### Group

A Group wraps a set of resizable Panel components.
Group content can be resized _horizontally_ or _vertically_.

Group elements always include the following attributes:

```html
<div data-group data-testid="group-id-prop" id="group-id-prop">
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

#### Required props

None

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies this group within an application.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This value will also be assigned to the <code>id</code> and <code>data-testid</code> attributes (an explicit <code>data-testid</code> prop will take precedence).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>⚠️ The default inline styles cannot be overridden, except for <a href="https://react-resizable-panels.vercel.app/examples/overflow"><code>overflow</code></a>.</p>
</td>
    </tr>
    <tr>
      <td>children</td>
      <td><p>Panel and Separator components that comprise this group.</p>
</td>
    </tr>
    <tr>
      <td>defaultLayout</td>
      <td><p>Default layout for the Group.</p>
<p>ℹ️ This value allows layouts to be remembered between page reloads.</p>
<p>⚠️ Slight layout shift may occur when server-rendering panels with percentage-based default sizes.
Refer to the documentation for suggestions on how to minimize the impact of this.</p>
</td>
    </tr>
    <tr>
      <td>disableCursor</td>
      <td><p>This library sets custom mouse cursor styles to indicate drag state.
Use this prop to disable that behavior for Panels and Separators in this group.</p>
</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td><p>Disable resize functionality.</p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>groupRef</td>
      <td><p>Exposes the following imperative API:</p>
<ul>
<li><code>getLayout(): Layout</code></li>
<li><code>setLayout(layout: Layout): Layout</code></li>
</ul>
<p>ℹ️ The <code>useGroupRef</code> and <code>useGroupCallbackRef</code> hooks are exported for convenience in TypeScript projects.</p>
</td>
    </tr>
    <tr>
      <td>onLayoutChange</td>
      <td><p>Called when the Group&#39;s layout is changing.</p>
<p>⚠️ For layout changes caused by pointer events, this method is called each time the pointer is moved.
For most cases, it is recommended to use the <code>onLayoutChanged</code> callback instead.</p>
</td>
    </tr>
    <tr>
      <td>onLayoutChanged</td>
      <td><p>Called after the Group&#39;s layout has been changed.</p>
<p>ℹ️ For layout changes caused by pointer events, this callback is not called until the pointer has been released.
This callback is recommended for saving layouts to storage.</p>
<p>ℹ️ The second argument contains meta information about the layout change.
The <code>isUserInteraction</code> attribute signals whether the resize was caused by direct user input.
It is true for resizes caused by pointer or keyboard input
and false for other triggers (e.g. imperative API calls, initial mount, etc.)
The <code>requestedLayout</code> attribute is the layout before constraints were applied for the current Group size;
prefer it when persisting layouts.</p>
</td>
    </tr>
    <tr>
      <td>resizePreviewMode</td>
      <td><p>Controls whether pointer dragging updates <code>Panel</code> sizes immediately,
or renders overlay separator previews until the pointer is released.</p>
<p>Defaults to <code>&quot;panel&quot;</code> (immediate resizing); <code>&quot;separator&quot;</code> defers resizing until release.</p>
<p>Customize previews using the <code>SeparatorOverlay</code> component.</p>
</td>
    </tr>
    <tr>
      <td>resizeTargetMinimumSize</td>
      <td><p>Minimum size of the resizable hit target area (either <code>Separator</code> or <code>Panel</code> edge).
This threshold ensures targets are large enough to avoid mis-clicks.</p>
<ul>
<li>Coarse inputs (typically a finger on a touchscreen) have reduced accuracy;
to ensure accessibility and ease of use, hit targets should be larger to prevent mis-clicks.</li>
<li>Fine inputs (typically a mouse) can be smaller</li>
</ul>
<p>ℹ️ <a href="https://developer.apple.com/design/human-interface-guidelines/accessibility">Apple interface guidelines</a> suggest <code>20pt</code> (<code>27px</code>) on desktops and <code>28pt</code> (<code>37px</code>) for touch devices.
In practice this seems to be much larger than many of their own applications use though.</p>
</td>
    </tr>
    <tr>
      <td>orientation</td>
      <td><p>Specifies the resizable orientation (&quot;horizontal&quot; or &quot;vertical&quot;); defaults to &quot;horizontal&quot;</p>
</td>
    </tr>
  </tbody>
</table>

### Panel

A Panel wraps resizable content and can be configured with min/max size constraints and collapsible behavior.

Panel size props can be in the following formats:
- Percentage of the parent Group (0..100)
- Pixels
- Relative font units (em, rem)
- Viewport relative units (vh, vw)

ℹ️ Numeric values are assumed to be pixels.
Strings without explicit units are assumed to be percentages (0%..100%).
Percentages may also be specified as strings ending with "%" (e.g. "33%")
Pixels may also be specified as strings ending with the unit "px".
Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)

Panel elements always include the following attributes:

```html
<div data-panel data-testid="panel-id-prop" id="panel-id-prop">
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

⚠️ Panel elements must be direct DOM children of their parent Group elements.

#### Required props

None

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
<p>⚠️ Class is applied to nested <code>HTMLDivElement</code> to avoid styles that interfere with Flex layout.</p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies this panel within the parent group.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This prop is used to associate persisted group layouts with the original panel.</p>
<p>ℹ️ This value will also be assigned to the <code>id</code> and <code>data-testid</code> attributes (an explicit <code>data-testid</code> prop will take precedence).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>⚠️ The default inline styles cannot be overridden, except for <a href="https://react-resizable-panels.vercel.app/examples/overflow"><code>overflow</code></a>.</p>
</td>
    </tr>
    <tr>
      <td>collapsedSize</td>
      <td><p>Panel size when collapsed; defaults to 0%.</p>
</td>
    </tr>
    <tr>
      <td>collapsedThreshold</td>
      <td><p>Distance a collapsible panel must be resized past its <code>minSize</code> to collapse,
or past its <code>collapsedSize</code> to expand.
Defaults to half the distance between <code>collapsedSize</code> and <code>minSize</code>.</p>
<p>For example if a panel declares <code>collapsedSize=&quot;5%&quot;</code>, <code>collapsedThreshold=&quot;5%&quot;</code>, and <code>minSize=&quot;25%&quot;</code>,
it will collapse when resized below 20% and expand when resized above 10%.</p>
<p>ℹ️ Interpretation rules:</p>
<ul>
<li>Numbers are interpreted as pixels (e.g. <code>minSize={200}</code> is 200 pixels)</li>
<li>Strings without explicit units are interpreted as percentage (e.g. <code>minSize=&quot;50&quot;</code> is 50 percent)</li>
<li>Use explicit units (e.g. &quot;px&quot;, &quot;%&quot;, &quot;em&quot;, &quot;rem&quot;, &quot;vh&quot;, or &quot;vw&quot;) to change interpretation</li>
</ul>
</td>
    </tr>
    <tr>
      <td>collapsible</td>
      <td><p>This panel can be collapsed.</p>
<p>ℹ️ A collapsible panel will collapse when its size is less than the specified <code>minSize</code></p>
</td>
    </tr>
    <tr>
      <td>defaultSize</td>
      <td><p>Default size of Panel within its parent group; default is auto-assigned based on the total number of Panels.</p>
<p>ℹ️ Interpretation rules:</p>
<ul>
<li>Numbers are interpreted as pixels (e.g. <code>defaultSize={200}</code> is 200 pixels)</li>
<li>Strings without explicit units are interpreted as percentage (e.g. <code>defaultSize=&quot;50&quot;</code> is 50 percent)</li>
<li>Use explicit units (e.g. &quot;px&quot;, &quot;%&quot;, &quot;em&quot;, &quot;rem&quot;, &quot;vh&quot;, or &quot;vw&quot;) to change interpretation</li>
</ul>
<p>⚠️ Percentage based sizes may cause slight layout shift when server-rendering.
For more information see the documentation.</p>
</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td><p>When disabled, a panel cannot be resized either directly or indirectly (by resizing another panel).</p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>groupResizeBehavior</td>
      <td><p>How should this Panel behave if the parent Group is resized?
Defaults to <code>preserve-relative-size</code>.</p>
<ul>
<li><code>preserve-relative-size</code>: Retain the current relative size (as a percentage of the Group)</li>
<li><code>preserve-pixel-size</code>: Retain its current size (in pixels)</li>
</ul>
<p>ℹ️ Panel min/max size constraints may impact this behavior.</p>
<p>⚠️ A Group must contain at least one Panel with <code>preserve-relative-size</code> resize behavior.</p>
</td>
    </tr>
    <tr>
      <td>maxSize</td>
      <td><p>Maximum size of Panel within its parent group; defaults to <code>&quot;100%&quot;</code>.</p>
<p>ℹ️ Interpretation rules:</p>
<ul>
<li>Numbers are interpreted as pixels (e.g. <code>maxSize={200}</code> is 200 pixels)</li>
<li>Strings without explicit units are interpreted as percentage (e.g. <code>maxSize=&quot;50&quot;</code> is 50 percent)</li>
<li>Use explicit units (e.g. &quot;px&quot;, &quot;%&quot;, &quot;em&quot;, &quot;rem&quot;, &quot;vh&quot;, or &quot;vw&quot;) to change interpretation</li>
</ul>
</td>
    </tr>
    <tr>
      <td>minSize</td>
      <td><p>Minimum size of Panel within its parent group; defaults to 0%.</p>
<p>ℹ️ Interpretation rules:</p>
<ul>
<li>Numbers are interpreted as pixels (e.g. <code>minSize={200}</code> is 200 pixels)</li>
<li>Strings without explicit units are interpreted as percentage (e.g. <code>minSize=&quot;50&quot;</code> is 50 percent)</li>
<li>Use explicit units (e.g. &quot;px&quot;, &quot;%&quot;, &quot;em&quot;, &quot;rem&quot;, &quot;vh&quot;, or &quot;vw&quot;) to change interpretation</li>
</ul>
</td>
    </tr>
    <tr>
      <td>onResize</td>
      <td><p>Called when panel sizes change.</p>
<ul>
<li><code>panelSize</code> Panel size (both as a percentage of the parent Group and in pixels)</li>
<li><code>id</code> Panel id (if one was provided as a prop)</li>
<li><code>prevPanelSize</code> Previous panel size (will be undefined on mount)</li>
</ul>
</td>
    </tr>
    <tr>
      <td>panelRef</td>
      <td><p>Exposes the following imperative API:</p>
<ul>
<li><code>collapse(): void</code></li>
<li><code>expand(): void</code></li>
<li><code>getSize(): PanelSize</code></li>
<li><code>isCollapsed(): boolean</code></li>
<li><code>resize(size: number | string): void</code></li>
</ul>
<p>ℹ️ The <code>usePanelRef</code> and <code>usePanelCallbackRef</code> hooks are exported for convenience in TypeScript projects.</p>
</td>
    </tr>
  </tbody>
</table>

### Separator

Separators are not _required_ but they are _recommended_ as they improve keyboard accessibility.

⚠️ Separator elements must be direct DOM children of their parent Group elements.

Separator elements always include the following attributes:

```html
<div data-separator data-testid="separator-id-prop" id="separator-id-prop" role="separator">
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

ℹ️ In addition to the attributes shown above, separator also renders all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).

#### Required props

None

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
<p>ℹ️ Use the <code>data-separator</code> attribute for custom <em>hover</em> and <em>active</em> styles</p>
<p>⚠️ The following properties cannot be overridden: <code>flex-grow</code>, <code>flex-shrink</code></p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies the separator within the parent group.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This value will also be assigned to the <code>id</code> and <code>data-testid</code> attributes (an explicit <code>data-testid</code> prop will take precedence).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>ℹ️ Use the <code>data-separator</code> attribute for custom <em>hover</em> and <em>active</em> styles</p>
<p>⚠️ The following properties cannot be overridden: <code>flex-grow</code>, <code>flex-shrink</code></p>
</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td><p>When disabled, the separator cannot be used to resize its neighboring panels.</p>
<p>ℹ️ The panels may still be resized indirectly (while other panels are being resized).
To prevent a panel from being resized at all, it needs to also be disabled.</p>
</td>
    </tr>
    <tr>
      <td>disableDoubleClick</td>
      <td><p>When true, double-clicking this <code>Separator</code> will not reset its <code>Panel</code> to its default size.</p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>preview</td>
      <td><p>Overrides the <code>Group</code> default preview for this <code>Separator</code> when <code>resizePreviewMode</code> is &quot;separator&quot;.</p>
</td>
    </tr>
  </tbody>
</table>

### TabCloseButton

Closes the tab it is rendered within; render it within the element returned by the Workspace's `renderTab` prop:

```tsx
renderTab={(tab, props) => (
  <div {...props}>
    {tab.title}
    <TabCloseButton>×</TabCloseButton>
  </div>
)}
```

The button renders nothing if closing is disabled (by the tab's `disableClose` flag or the Workspace's `disabled` prop).
Its content defaults to "×" (e.g. it can be replaced with an icon),
and its default `aria-label` is "Close" followed by the tab's title (or id).

Its `children`, `className`, `style`, and `title` can also be functions of its state (see `TabCloseButtonState`):

```tsx
<TabCloseButton title={({ tabTitle }) => `Close ${tabTitle}`} />
```

To keep the tab open (e.g. to confirm unsaved changes first), call `event.preventDefault()` in an `onClick` handler:

```tsx
<TabCloseButton
  onClick={(event) => {
    if (hasUnsavedChanges && !confirm("Discard unsaved changes?")) {
      event.preventDefault();
    }
  }}
/>
```

ℹ️ This button is not focusable by default (`tabIndex={-1}`), since tabs shouldn't contain focusable content;
keyboard users can close the focused tab with Delete or Backspace.

#### Required props

None

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>children</td>
      <td><p>Content of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>className</td>
      <td><p>Class name of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>Inline styles of the element, or a function that returns them (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>title</td>
      <td><p>Tooltip of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
  </tbody>
</table>

### TabsetCollapseButton

Collapses (or expands) the tabset it is rendered within; render it within the content returned by the Workspace's `renderTabsetToolbar` prop.
Its `children`, `className`, `style`, and `title` can be functions of its state (see `TabsetCollapseButtonState`), e.g. to show a different icon while the tabset is collapsed:

```tsx
renderTabsetToolbar={() => (
  <TabsetCollapseButton title={({ isCollapsed }) => (isCollapsed ? "Expand" : "Collapse")}>
    {({ isCollapsed }) => (isCollapsed ? "▸" : "▾")}
  </TabsetCollapseButton>
)}
```

The button renders nothing if the tabset can't be collapsed (see `ParentTabsetState.isCollapsible`), or while it's maximized.
While the tabset is collapsed only because it doesn't fit (see `ParentTabsetState.isCollapsedToFit`), it can't be expanded, so the button has `aria-disabled="true"`.

Its `aria-expanded` attribute reflects whether the tabset is expanded, and its `aria-controls` attribute refers to the selected tab's panel;
its default `aria-label` ("Collapse tabset") doesn't change, since `aria-expanded` describes the state.

To keep the tabset as it is, call `event.preventDefault()` in an `onClick` handler.

ℹ️ Clicking a tab of a collapsed tabset also expands it.

#### Required props

None

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>children</td>
      <td><p>Content of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>className</td>
      <td><p>Class name of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>Inline styles of the element, or a function that returns them (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>title</td>
      <td><p>Tooltip of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
  </tbody>
</table>

### TabsetDragHandle

Drags the tabset it is rendered within; render it within the content returned by the Workspace's `renderTabsetToolbar` prop:

```tsx
renderTabsetToolbar={() => (
  <TabsetDragHandle>⠿</TabsetDragHandle>
)}
```

By default, a tabset is dragged by the empty space in its header;
once its header contains a drag handle, only the handle drags it.
Any element with a `data-tabset-drag-handle` attribute is a drag handle;
this component also sets `touch-action: none`, so that it can be dragged by touch.

The handle has a `data-disabled` attribute when the tabset can't be dragged (see `useParentTabsetState`), e.g. to hide it.
Its `children`, `className`, `style`, and `title` can also be functions of its state (see `TabsetDragHandleState`):

```tsx
<TabsetDragHandle title={({ isDisabled }) => (isDisabled ? undefined : "Drag tabset")}>
  ⠿
</TabsetDragHandle>
```

#### Required props

None

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>children</td>
      <td><p>Content of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>className</td>
      <td><p>Class name of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>Inline styles of the element, or a function that returns them (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>title</td>
      <td><p>Tooltip of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
  </tbody>
</table>

### TabsetMaximizeButton

Maximizes (or restores) the tabset it is rendered within; render it within the content returned by the Workspace's `renderTabsetToolbar` prop.
Its `children`, `className`, `style`, and `title` can be functions of its state (see `TabsetMaximizeButtonState`), e.g. to show a different icon while the tabset is maximized:

```tsx
renderTabsetToolbar={() => (
  <TabsetMaximizeButton title={({ isMaximized }) => (isMaximized ? "Restore" : "Maximize")}>
    {({ isMaximized }) => (isMaximized ? "Restore" : "Maximize")}
  </TabsetMaximizeButton>
)}
```

The button renders nothing for the only tabset in a workspace (see `ParentTabsetState.isRoot`) and for floating tabsets, which can't be maximized.

Its `aria-pressed` attribute reflects whether the tabset is maximized;
its default `aria-label` ("Maximize tabset") doesn't change, since `aria-pressed` describes the state.

To keep the tabset as it is, call `event.preventDefault()` in an `onClick` handler.

#### Required props

None

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>children</td>
      <td><p>Content of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>className</td>
      <td><p>Class name of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>Inline styles of the element, or a function that returns them (given the component&#39;s state).</p>
</td>
    </tr>
    <tr>
      <td>title</td>
      <td><p>Tooltip of the element, or a function that returns it (given the component&#39;s state).</p>
</td>
    </tr>
  </tbody>
</table>

### Workspace

A Workspace arranges tabsets that users can rearrange by dragging tabs:
between tabsets, within a tabset's list of tabs, or onto the edge of a tabset to split it.
Tabsets can be resized and maximized.

The layout is described by a serializable model (see `WorkspaceModel`).
Workspaces are uncontrolled: provide an initial model with the `defaultModel` prop, save changes from the `onModelChanged` callback,
and make changes using the imperative API (see `WorkspaceImperativeHandle`).

ℹ️ Tab content is not remounted when a tab is moved.
Its elements are moved within the document, though, which resets some browser state (e.g. iframes are reloaded).

Workspace elements always include the following attributes:

```html
<div data-workspace data-testid="workspace-id-prop" id="workspace-id-prop">
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

#### Required props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>defaultModel</td>
      <td><p>Initial layout of the workspace.</p>
<p>ℹ️ Splits and tabsets may omit their ids; they&#39;re assigned ids based on their position (see <code>WorkspaceModelInput</code>).</p>
<p>ℹ️ This value is only used when the Workspace mounts; use the imperative <code>setModel</code> method to replace it later.</p>
</td>
    </tr>
    <tr>
      <td>renderTabContent</td>
      <td><p>Content of a tab.</p>
<p>ℹ️ Content is only re-rendered when its tab changes or this function does;
a function created while rendering (e.g. an inline arrow function) re-renders the content of every tab whenever the Workspace&#39;s parent re-renders,
so it should be memoized (e.g. with <code>useCallback</code>) when tab content is expensive to render.</p>
</td>
    </tr>
  </tbody>
</table>

#### Optional props

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies this workspace within an application.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This value will also be assigned to the <code>id</code> and <code>data-testid</code> attributes (an explicit <code>data-testid</code> prop will take precedence).</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
</td>
    </tr>
    <tr>
      <td>acceptExternalDrop</td>
      <td><p>Lets the workspace accept drags that use the browser&#39;s drag and drop from outside of any workspace
(e.g. an element of the application with the <code>draggable</code> attribute, a file, or a link from another application),
showing the drop indicator while the drag is over the workspace, and creating a tab where it&#39;s dropped.
The new tab is reported to <code>onModelChanged</code> with the <code>&quot;add&quot;</code> reason.</p>
<p>ℹ️ <code>disableDrop</code> can&#39;t be called until the tab is created (when the drag is dropped), so a target it rejects is shown as accepted while dragging;
the drop is ignored then. Drag sources within the application can use the imperative <code>startExternalDrag</code> method instead, which doesn&#39;t have this limitation.</p>
<p>ℹ️ Elements within the workspace&#39;s tab content that handle the same drags themselves (by canceling the <code>dragover</code> and <code>drop</code> events) take precedence.</p>
<p>ℹ️ This object is read when drag events are handled, so it doesn&#39;t need to be memoized.</p>
</td>
    </tr>
    <tr>
      <td>classNames</td>
      <td><p>CSS class names for the elements the workspace renders within its root element:</p>
<ul>
<li><code>tabset</code>: root element of a tabset (<code>data-tabset</code>)</li>
<li><code>header</code>: contains a tabset&#39;s tab list and toolbar (<code>data-tabset-header</code>)</li>
<li><code>tabList</code>: contains a tabset&#39;s tabs (<code>data-tab-list</code>)</li>
<li><code>tab</code>: passed to <code>renderTab</code> with the rest of a tab&#39;s props (<code>data-tab</code>)</li>
<li><code>toolbar</code>: contains the content returned by <code>renderTabsetToolbar</code> (<code>data-tabset-toolbar</code>)</li>
<li><code>tabPanels</code>: contains a tabset&#39;s tab content (<code>data-tab-panels</code>)</li>
<li><code>tabContent</code>: the element each tab&#39;s content is rendered into (<code>data-tab-content</code>)</li>
<li><code>dropIndicator</code>: shows where a dragged tab will be dropped within a tabset&#39;s panels, or at an edge of the workspace (<code>data-drop-indicator</code>)</li>
<li><code>dragPreview</code>: follows the pointer while a tab or tabset is dragged (<code>data-drag-preview</code>)</li>
</ul>
<p>ℹ️ Elements expose their state as data attributes (e.g. <code>data-tab-selected</code>, or <code>data-tabset-dragging</code> while a tabset is dragged), which can be used for styling.
Elements within a collapsed tabset have a <code>data-tabset-collapsed</code> attribute.
Elements within a tabset also have a <code>data-tab-placement</code> attribute (see <code>tabPlacement</code>).</p>
<p>ℹ️ The drop indicator is the same element for the whole drag (rendered within the workspace&#39;s root element),
so it can be animated between regions and tabsets (e.g. <code>transition: inset 250ms</code>).
Its <code>data-region</code> attribute is the region of a tabset&#39;s panels it covers, or its <code>data-edge</code> attribute is the edge of the workspace it&#39;s at;
while a tab isn&#39;t over either, it has neither and isn&#39;t shown (<code>opacity: 0</code>).</p>
<p>ℹ️ Like the render props, this object is part of what tabsets re-render for;
in large workspaces, define it outside of the component (or memoize it) rather than inline.</p>
</td>
    </tr>
    <tr>
      <td>copyTab</td>
      <td><p>Lets tabs be copied by dragging them: a tab dropped while the copy modifier key is held (Option on macOS, Ctrl elsewhere) adds the copy this function returns,
leaving the dragged tab where it was. The change is reported to <code>onModelChanged</code> with the <code>&quot;copy&quot;</code> reason.</p>
<p>Returning <code>null</code> (or <code>undefined</code>) moves the dragged tab instead. If that move isn&#39;t allowed either (the <code>disableDrop</code> prop rejects it, the ids conflict, or it isn&#39;t a valid place to move the tab), nothing happens.</p>
<p>ℹ️ The copy needs an id that isn&#39;t used by any other node of the workspace (e.g. <code>crypto.randomUUID()</code>); copies with ids that are in use are rejected (and the tab is moved instead).</p>
<p>ℹ️ The workspace the tab is dropped into makes the copy, so a tab dragged from another workspace (see the <code>dragGroup</code> prop) is copied by the workspace it&#39;s dropped into
(and is only copied if that workspace has this prop).</p>
<ul>
<li><code>tab</code> The tab being dragged</li>
<li><code>target</code> Where the copy will be dropped</li>
</ul>
</td>
    </tr>
    <tr>
      <td>copyTabset</td>
      <td><p>Lets tabsets be copied by dragging them (by their headers), like the <code>copyTab</code> prop does for tabs: a tabset dropped while the copy modifier key is held adds the copy this function returns,
leaving the dragged tabset where it was. The change is reported to <code>onModelChanged</code> with the <code>&quot;copy&quot;</code> reason.</p>
<p>The copy includes its tabs, which need ids that aren&#39;t used by any other node of the workspace too; the <code>copyTab</code> argument copies a tab:</p>
<pre><code class="language-tsx">copyTabset={(tabset, copyTab) =&gt; ({ ...tabset, id: crypto.randomUUID(), tabs: tabset.tabs.map(copyTab) })}
</code></pre>
<p>Returning <code>null</code> (or <code>undefined</code>) moves the dragged tabset instead. If that move isn&#39;t allowed either (the <code>disableDrop</code> prop rejects it, the ids conflict, a <code>keepWhenEmpty</code> tabset is dropped into another workspace, or it isn&#39;t a valid place to move the tabset), nothing happens.</p>
<p>ℹ️ The copy&#39;s selected tab is the copy of the dragged tabset&#39;s selected tab (matched by position), unless the copy selects one of its own tabs.</p>
<p>ℹ️ A copy dropped into a tab list (or onto the center of another tabset) only adds its tabs; its id and data are only used where it&#39;s added as a tabset.</p>
<ul>
<li><code>tabset</code> The tabset being dragged</li>
<li><code>copyTab</code> Copies a tab with the <code>copyTab</code> prop (and the same drop target); without that prop (or if it returns <code>null</code>), the copy is a shallow copy of the tab with a new id</li>
<li><code>target</code> Where the copy will be dropped</li>
</ul>
</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td><p>Locks the arrangement: tabs cannot be resized, dragged, dropped, or closed by the user.
Selecting tabs and maximizing tabsets still work.</p>
<p>ℹ️ This prop overrides the <code>disableClose</code> and <code>disableDrag</code> flags of individual tabs.</p>
</td>
    </tr>
    <tr>
      <td>disableDragBetweenApps</td>
      <td><p>Keeps drags between workspaces (see <code>dragGroup</code>) within this copy of the application:
tabs dragged from this workspace can&#39;t be dropped into other copies of the application (e.g. the application loaded in another browser window or tab), and tabs dragged from other copies can&#39;t be dropped into this workspace.
Workspaces in popout windows rendered by this copy of the application (with portals) are still part of the group.</p>
<p>Defaults to <code>false</code>, so that workspaces with the same <code>dragGroup</code> in other copies of the application from the same origin can exchange tabs.</p>
</td>
    </tr>
    <tr>
      <td>disableDrop</td>
      <td><p>Prevents tabs (and tabsets) from being dropped onto some (or all) targets.</p>
<p>Functions are called when the target under the pointer changes;
returning <code>true</code> rejects the target.</p>
<p>ℹ️ While a tabset is dragged, this function is called for each of its tabs (see <code>DisableDropArgs</code>),
so restrictions on where tabs can be dropped apply to dragged tabsets too.</p>
<p>ℹ️ Tabs can also be dropped at the edges of the workspace (beside all of the other tabsets), within a few pixels of the edges of its layout
(except over tabset headers, where the tab lists are) or within its root element&#39;s padding.
These targets have an <code>edge</code> rather than a <code>tabsetId</code>; <code>disableDrop={({ target }) =&gt; &quot;edge&quot; in target}</code> turns them off.</p>
</td>
    </tr>
    <tr>
      <td>dragGroup</td>
      <td><p>Lets tabs (and tabsets) be dragged between workspaces with the same <code>dragGroup</code>,
including workspaces in popout windows (opened by the application and rendered into with a portal)
and in other copies of the application from the same origin, e.g. the application loaded in another browser window or tab (see <code>disableDragBetweenApps</code>).
Dropping one into another workspace moves it there, keeping its id and data;
both workspaces report the change to <code>onModelChanged</code> with the <code>&quot;transfer&quot;</code> reason.</p>
<p>Mouse drags use the browser&#39;s drag and drop when this prop is set, since pointer events can&#39;t follow the pointer into another window.
Touch drags still use pointer events, so they can&#39;t leave the window.</p>
<p>ℹ️ Tab ids must be unique within the group; a tab can&#39;t be dropped into a workspace that already has a tab with its id (and a tabset with the <code>keepWhenEmpty</code> flag can&#39;t be dragged to another workspace).
A tab dragged to another workspace is rendered by that workspace, so its content is mounted again.</p>
<p>⚠️ A tab dragged to another copy of the application is sent there with the structured clone algorithm (like <code>postMessage</code>), so its data must be cloneable (e.g. no functions);
tabs whose data can&#39;t be cloned (and tabsets containing them) can only be dragged within their copy of the application.
Copies loaded at different times may be running different versions of the application, so the other copy may need to handle tab data it doesn&#39;t recognize.</p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>hiddenTabBehavior</td>
      <td><p>What happens to the content of tabs that are not selected.
Can be a function to choose per tab (e.g. based on its data).</p>
<ul>
<li><code>&quot;keep-mounted&quot;</code>: content stays mounted (and its effects keep running)</li>
<li><code>&quot;activity&quot;</code>: content stays mounted but is rendered within a hidden React <code>&lt;Activity&gt;</code> boundary, so its effects are unmounted;
requires React 19.2 (falls back to <code>&quot;keep-mounted&quot;</code> otherwise)</li>
<li><code>&quot;unmount&quot;</code>: content is unmounted</li>
</ul>
<p>ℹ️ Moving a tab never remounts its content.</p>
<p>⚠️ Its React state is preserved, but its elements are moved within the document, which resets some browser state:
iframes are reloaded, playing media is paused, and focused elements are blurred.</p>
</td>
    </tr>
    <tr>
      <td>onModelChanged</td>
      <td><p>Called after the model has changed (e.g. a tab was moved, selected, or closed, or a tabset was resized).</p>
<p>ℹ️ For changes caused by pointer events, this callback is not called until the pointer has been released.
This callback is recommended for saving models to storage.</p>
</td>
    </tr>
    <tr>
      <td>onTearOff</td>
      <td><p>Called when a tab (or a whole tabset) is dropped outside of the window, e.g. to open it in a popup window.
Return <code>true</code> to accept it, which removes it from this workspace (reported to <code>onModelChanged</code> with the <code>&quot;tear-off&quot;</code> reason);
otherwise nothing changes.</p>
<p>Tabs and tabsets can only be torn off if they could be dragged, and tabsets with the <code>keepWhenEmpty</code> flag can&#39;t be torn off.
Without this prop, dropping a tab outside of the window does nothing.</p>
<p>⚠️ The Workspace can&#39;t tell whether the application showed the tab, so check whether <code>window.open</code> returned <code>null</code> (because the popup was blocked)
and return <code>false</code> then to keep the tab; returning <code>true</code> removes it even if nothing shows it.</p>
<p>ℹ️ This is called while the release of the pointer is being handled (which browsers treat as user input), so a popup can be opened from it.
With the <code>dragGroup</code> prop, a tab is torn off when it&#39;s dropped outside of every window in the group; the end of those drags isn&#39;t treated as user input,
so browsers block popups opened then unless the drag started a few seconds earlier at most (and Safari blocks them always).</p>
<p>⚠️ Deprecated: browsers don&#39;t reliably report where a drag that leaves the window ends, and some block popups opened at the end of a drag.
Open popout windows from a button instead (see <code>usePopoutWindows</code>). This will be removed in the next major version.</p>
<p>❌ This prop has been deprecated. Open popout windows from a button instead (see <code>usePopoutWindows</code>).</p>
</td>
    </tr>
    <tr>
      <td>renderDragPreview</td>
      <td><p>Content of the element that follows the pointer while a tab is being dragged.
Defaults to the tab&#39;s title (or id).</p>
<p>ℹ️ The element has a <code>data-tear-off</code> attribute while releasing the pointer would tear off the tab (see the deprecated <code>onTearOff</code> prop).</p>
</td>
    </tr>
    <tr>
      <td>renderTabsetDragPreview</td>
      <td><p>Content of the element that follows the pointer while a whole tabset is being dragged.
Defaults to the title (or id) of its selected tab followed by the number of other tabs being dragged (e.g. &quot;One (+2)&quot;), or the selected tab&#39;s <code>renderDragPreview</code> when that prop is set, or the tabset&#39;s id if it has no tabs.</p>
<p>ℹ️ The element has a <code>data-drag-type</code> attribute: <code>&quot;tabset&quot;</code> while a tabset is dragged, and <code>&quot;tab&quot;</code> while a tab is.
It also has a <code>data-tear-off</code> attribute while releasing the pointer would tear off the tabset (see the deprecated <code>onTearOff</code> prop).</p>
</td>
    </tr>
    <tr>
      <td>renderEmptyTabset</td>
      <td><p>Content shown in the panels of a tabset that has no tabs (e.g. &quot;Drag a tab here&quot;):
the root tabset of an empty workspace, or a tabset with the <code>keepWhenEmpty</code> flag.</p>
</td>
    </tr>
    <tr>
      <td>renderSeparator</td>
      <td><p>Separator rendered between the children of a split.
Should return a <code>Separator</code> (or <code>null</code> for no separator); defaults to an unstyled <code>Separator</code>.</p>
<p>ℹ️ Without separators, tabsets can still be resized by dragging their edges (like Panels in a Group without separators),
but separators are recommended: they can be resized with the keyboard,
and an edge&#39;s hit area can overlap the tabs beside it (pressing there resizes the tabset rather than dragging the tab).</p>
</td>
    </tr>
    <tr>
      <td>renderTab</td>
      <td><p>Renders a tab (within its tabset&#39;s tab list).
Spread <code>props</code> onto the returned element:
they make it a tab (its role and ARIA attributes, keyboard and pointer handling, and data attributes),
and attach a <code>ref</code> that dragging and keyboard focus depend on.</p>
<pre><code class="language-tsx">renderTab={(tab, props) =&gt; (
  &lt;div {...props}&gt;
    {tab.title}
    &lt;TabCloseButton /&gt;
  &lt;/div&gt;
)}
</code></pre>
<p>Individual props can be overridden or wrapped, e.g. to confirm before the Delete key closes a tab
(call <code>props.onKeyDown</code> for other keys).</p>
<p>⚠️ Merge <code>className</code> and <code>style</code> rather than replacing them (e.g. <code>style={{ ...props.style, padding: 4 }}</code>):
they include the <code>tab</code> entries of the <code>classNames</code> and <code>styles</code> props, and <code>style</code> includes the <code>touch-action</code> that touch dragging depends on.</p>
<p>ℹ️ Pointer and keyboard events from interactive descendants (<code>button</code> elements, <code>role=&quot;button&quot;</code>, or elements with a <code>data-tab-ignore</code> attribute) are ignored,
so clicking a button within a tab doesn&#39;t select or drag it.</p>
<p>ℹ️ When this prop is not provided, tabs show their title (or id) followed by a <code>TabCloseButton</code>.</p>
</td>
    </tr>
    <tr>
      <td>renderTabsetToolbar</td>
      <td><p>Content shown after a tabset&#39;s tab list (e.g. buttons to add a tab or maximize the tabset).</p>
<p>ℹ️ The <code>useParentTabset</code> and <code>useParentTabsetState</code> hooks can be used within this content.</p>
</td>
    </tr>
    <tr>
      <td>resizePreviewMode</td>
      <td><p>Controls whether pointer dragging updates sizes immediately,
or renders overlay separator previews until the pointer is released.</p>
</td>
    </tr>
    <tr>
      <td>serverRenderTabContent</td>
      <td><p>Render the content of selected tabs on the server.
Can be a function to choose per tab (e.g. based on its data).</p>
<p>Tab content is rendered through portals (so that moving a tab doesn&#39;t remount it), which React can&#39;t render on the server.
Content opted into server rendering is rendered inline instead, then moved into a portal once hydration has finished.</p>
<p>⚠️ That move remounts the content once (e.g. resetting its state and re-running its effects),
so this is best suited to content that is cheap to mount and benefits from being in the server-rendered HTML.</p>
<p>ℹ️ This prop has no effect for workspaces that are not server rendered.</p>
</td>
    </tr>
    <tr>
      <td>styles</td>
      <td><p>CSS properties for the elements the workspace renders within its root element (see <code>classNames</code>).</p>
</td>
    </tr>
    <tr>
      <td>tabPlacement</td>
      <td><p>Where tabs are placed relative to tab content.</p>
<p>Tabs placed on the left or right are stacked (&quot;vertical&quot;):
this determines how a dropped tab&#39;s position is found and which arrow keys move focus between tabs.</p>
<p>ℹ️ Elements within a tabset have a <code>data-tab-placement</code> attribute, which can be used for styling (e.g. rotating tabs on the left or right).</p>
<p>ℹ️ &quot;left&quot; and &quot;right&quot; are the start and end of the tabset (its header is rendered before or after its content),
so in a right-to-left layout (e.g. within <code>dir=&quot;rtl&quot;</code>) tabs placed on the &quot;left&quot; are on the right;
styles for them should use logical properties (e.g. <code>border-inline-end</code> rather than <code>border-right</code>).</p>
<p>ℹ️ Tabsets can override this with the <code>tabPlacement</code> field of their model node.</p>
</td>
    </tr>
    <tr>
      <td>tabRemovalSelectionBehavior</td>
      <td><p>Which tab is selected when a tabset&#39;s selected tab is removed (closed, or dragged to another tabset):</p>
<ul>
<li><code>&quot;adjacent&quot;</code>: the tab after it (or before it, if it was the last tab)</li>
<li><code>&quot;recent&quot;</code>: the tabset&#39;s most recently selected tab (like an IDE&#39;s editor groups),
falling back to <code>&quot;adjacent&quot;</code> if none of its other tabs has been selected</li>
</ul>
<p>ℹ️ In <code>&quot;recent&quot;</code> mode, each tabset&#39;s recently selected tabs are saved in the model (see <code>TabsetNode.recentTabIds</code>),
so they&#39;re restored with the rest of the layout.</p>
</td>
    </tr>
    <tr>
      <td>tabsetMinHeight</td>
      <td><p>Minimum height of each tabset&#39;s content area (not including its header).</p>
<p>ℹ️ Tabsets can override this with the <code>minHeight</code> field of their model node.</p>
<p>ℹ️ Interpretation rules:</p>
<ul>
<li>Strings must specify a unit: &quot;px&quot;, &quot;em&quot;, &quot;rem&quot;, &quot;vh&quot;, or &quot;vw&quot; (e.g. <code>tabsetMinHeight: &quot;200px&quot;</code>)</li>
<li>Percentages (and strings without units) are not allowed</li>
</ul>
</td>
    </tr>
    <tr>
      <td>tabsetMinWidth</td>
      <td><p>Minimum width of each tabset&#39;s content area (not including its header).</p>
<p>ℹ️ Tabsets can override this with the <code>minWidth</code> field of their model node.</p>
<p>ℹ️ Interpretation rules:</p>
<ul>
<li>Strings must specify a unit: &quot;px&quot;, &quot;em&quot;, &quot;rem&quot;, &quot;vh&quot;, or &quot;vw&quot; (e.g. <code>tabsetMinWidth: &quot;200px&quot;</code>)</li>
<li>Percentages (and strings without units) are not allowed</li>
</ul>
</td>
    </tr>
    <tr>
      <td>workspaceRef</td>
      <td><p>Exposes the imperative API (see <code>WorkspaceImperativeHandle</code>).</p>
<p>ℹ️ The <code>useWorkspaceRef</code> and <code>useWorkspaceCallbackRef</code> hooks are exported for convenience in TypeScript projects.</p>
</td>
    </tr>
  </tbody>
</table>

## Imperative APIs

### GridImperativeHandle

Imperative Grid API.

ℹ️ The `useGridRef` and `useGridCallbackRef` hooks are exported for convenience in TypeScript projects.

#### Methods

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>getLayout</td>
      <td><p>Get the Grid&#39;s current layout: maps of column and row ids to percentages (0..100)</p>
</td>
    </tr>
    <tr>
      <td>getTrackById</td>
      <td><p>Imperative API for the column or row with the specified id (see <code>GridTrackImperativeHandle</code>).</p>
<p>ℹ️ Tracks without an explicit <code>id</code> use their index (e.g. <code>&quot;0&quot;</code>) as their id.</p>
<p>⚠️ An error will be thrown if the Grid does not contain a matching track.</p>
<ul>
<li><code>axis</code> &quot;column&quot; or &quot;row&quot;</li>
<li><code>id</code> Track id</li>
</ul>
</td>
    </tr>
    <tr>
      <td>getTrackByIndex</td>
      <td><p>Imperative API for the column or row at the specified index (see <code>GridTrackImperativeHandle</code>).</p>
<p>ℹ️ The index is resolved to a track id when this method is called; the returned API continues to refer to that id.
Tracks without an explicit <code>id</code> use their index as their id,
so specify ids if the API needs to refer to the same track after tracks are added or removed before it.</p>
<p>⚠️ An error will be thrown if the index is out of range.</p>
<ul>
<li><code>axis</code> &quot;column&quot; or &quot;row&quot;</li>
<li><code>index</code> Track index (starting at 0)</li>
</ul>
</td>
    </tr>
    <tr>
      <td>setLayout</td>
      <td><p>Set a new layout for one or both of the Grid&#39;s axes.</p>
<ul>
<li><code>layout</code> Map of column and/or row ids to percentages (numbers between 0..100)</li>
</ul>
</td>
    </tr>
  </tbody>
</table>

### GridTrackImperativeHandle

Imperative API for an individual Grid track (column or row); returned by `GridImperativeHandle.getTrackById` and `GridImperativeHandle.getTrackByIndex`.

ℹ️ Sizes are relative to the space available to the track's axis
(e.g. the width of the Grid, minus gaps and gridlines, for a column).

#### Methods

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>collapse</td>
      <td><p>Collapse the track to its <code>collapsedSize</code>.</p>
<p>⚠️ This method will do nothing if the track is not <code>collapsible</code> or if it is already collapsed.</p>
</td>
    </tr>
    <tr>
      <td>expand</td>
      <td><p>Expand a collapsed track to its most recent size.</p>
<p>ℹ️ If restoring that size would require collapsing another track, the track expands to the largest size that fits instead (as long as that is at least its <code>minSize</code>).</p>
<p>⚠️ This method will do nothing if the track is not currently collapsed.</p>
</td>
    </tr>
    <tr>
      <td>getSize</td>
      <td><p>Get the current size of the track in pixels as well as a percentage of its axis (0..100).</p>
</td>
    </tr>
    <tr>
      <td>isCollapsed</td>
      <td><p>The track is currently collapsed.</p>
</td>
    </tr>
    <tr>
      <td>resize</td>
      <td><p>Update the track&#39;s size.
Size can be in the following formats:</p>
<ul>
<li>Percentage of the axis (0..100)</li>
<li>Pixels</li>
<li>Relative font units (em, rem)</li>
<li>Viewport relative units (vh, vw)</li>
</ul>
<p>ℹ️ Numeric values are assumed to be pixels.
Strings without explicit units are assumed to be percentages (0%..100%).
Percentages may also be specified as strings ending with &quot;%&quot; (e.g. &quot;33%&quot;)
Pixels may also be specified as strings ending with the unit &quot;px&quot;.
Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)</p>
<ul>
<li><code>size</code> New track size</li>
</ul>
</td>
    </tr>
  </tbody>
</table>

### GroupImperativeHandle

Imperative Group API.

ℹ️ The `useGroupRef` and `useGroupCallbackRef` hooks are exported for convenience in TypeScript projects.

#### Methods

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>getLayout</td>
      <td><p>Get the Group&#39;s current layout as a map of Panel id to percentage (0..100)</p>
</td>
    </tr>
    <tr>
      <td>setLayout</td>
      <td><p>Set a new layout for the Group</p>
<ul>
<li><code>layout</code> Map of Panel id to percentage (a number between 0..100)</li>
</ul>
</td>
    </tr>
  </tbody>
</table>

### PanelImperativeHandle

Imperative Panel API

ℹ️ The `usePanelRef` and `usePanelCallbackRef` hooks are exported for convenience in TypeScript projects.

#### Methods

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>collapse</td>
      <td><p>Collapse the Panel to its <code>collapsedSize</code>.</p>
<p>⚠️ This method will do nothing if the Panel is not <code>collapsible</code> or if it is already collapsed.</p>
</td>
    </tr>
    <tr>
      <td>expand</td>
      <td><p>Expand a collapsed Panel to its most recent size.</p>
<p>ℹ️ If restoring that size would require collapsing another Panel, the Panel expands to the largest size that fits instead (as long as that is at least its <code>minSize</code>).</p>
<p>⚠️ This method will do nothing if the Panel is not currently collapsed.</p>
</td>
    </tr>
    <tr>
      <td>getSize</td>
      <td><p>Get the current size of the Panel in pixels as well as a percentage of the parent group (0..100).</p>
</td>
    </tr>
    <tr>
      <td>isCollapsed</td>
      <td><p>The Panel is currently collapsed.</p>
</td>
    </tr>
    <tr>
      <td>resize</td>
      <td><p>Update the Panel&#39;s size.
Size can be in the following formats:</p>
<ul>
<li>Percentage of the parent Group (0..100)</li>
<li>Pixels</li>
<li>Relative font units (em, rem)</li>
<li>Viewport relative units (vh, vw)</li>
</ul>
<p>ℹ️ Numeric values are assumed to be pixels.
Strings without explicit units are assumed to be percentages (0%..100%).
Percentages may also be specified as strings ending with &quot;%&quot; (e.g. &quot;33%&quot;)
Pixels may also be specified as strings ending with the unit &quot;px&quot;.
Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)</p>
<ul>
<li><code>size</code> New panel size</li>
</ul>
</td>
    </tr>
  </tbody>
</table>

### WorkspaceImperativeHandle

Imperative Workspace API.
The easiest way to interact with this API is to use the `useWorkspaceRef` and `useWorkspaceCallbackRef` hooks.

ℹ️ These methods are not restricted by `disabled`, `disableClose`, `disableDrag`, or `disableDrop`.

#### Methods

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>addTab</td>
      <td><p>Add a tab to a tabset.</p>
<p>ℹ️ If a tab with the same id already exists, it is selected instead (and its data is not changed).</p>
<ul>
<li><code>tab</code> Tab to add</li>
<li><code>options</code> .tabsetId Tabset to add the tab to; defaults to the active tabset</li>
<li><code>options</code> .index Position within the tabset; defaults to the end</li>
<li><code>options</code> .select Select the new tab; defaults to true</li>
</ul>
</td>
    </tr>
    <tr>
      <td>closeTab</td>
      <td><p>Close a tab.</p>
</td>
    </tr>
    <tr>
      <td>closeTabset</td>
      <td><p>Close a tabset, along with any tabs it contains (e.g. to remove an empty tabset with the <code>keepWhenEmpty</code> flag).</p>
<p>ℹ️ Like the rest of the imperative API, this isn&#39;t restricted by tabs&#39; <code>disableClose</code> flags.
If the root tabset is closed, the workspace is left with an empty root tabset.</p>
</td>
    </tr>
    <tr>
      <td>collapseTabset</td>
      <td><p>Collapse a tabset to just its header.</p>
<p>ℹ️ This has no effect unless the tabset has the <code>collapsible</code> flag (or is floating; see <code>FloatingTabsetNode</code>);
the only tabset in a workspace, and tabsets whose siblings are all collapsed, can&#39;t be collapsed.</p>
</td>
    </tr>
    <tr>
      <td>expandTabset</td>
      <td><p>Expand a collapsed tabset to its previous size.</p>
<p>ℹ️ Tabsets are shown at least at their minimum sizes (if they fit), even if the model&#39;s sizes are smaller (see <code>TabsetNode.size</code>).</p>
<p>ℹ️ This has no effect on a tabset that&#39;s only collapsed to fit, which is expanded once it fits (see <code>TabsetNode.collapsible</code>).</p>
</td>
    </tr>
    <tr>
      <td>floatTab</td>
      <td><p>Move a tab into a new floating tabset (see <code>WorkspaceModel.floating</code>), on top of any other floating tabsets.</p>
<p>ℹ️ Parts of the position and size that aren&#39;t specified default to those of the tab&#39;s tabset, offset slightly down and to the right
(and moved, if needed, to fit within the workspace).</p>
<p>ℹ️ This has no effect on the only tab of a floating tabset (unless the tabset has the <code>keepWhenEmpty</code> flag).</p>
</td>
    </tr>
    <tr>
      <td>floatTabset</td>
      <td><p>Move a tabset out of the layout, to float above it (see <code>WorkspaceModel.floating</code>), on top of any other floating tabsets.</p>
<p>ℹ️ Parts of the position and size that aren&#39;t specified default to those of the tabset, offset slightly down and to the right
(and moved, if needed, to fit within the workspace).</p>
<p>ℹ️ This has no effect on the root tabset (which fills the workspace) or a tabset that&#39;s already floating.
A maximized tabset is restored first.</p>
</td>
    </tr>
    <tr>
      <td>getActiveTabsetId</td>
      <td><p>Id of the tabset the user most recently interacted with (by pointer or focus).</p>
</td>
    </tr>
    <tr>
      <td>getModel</td>
      <td><p>Get the current model.</p>
</td>
    </tr>
    <tr>
      <td>getTabListFreeSpace</td>
      <td><p>Space (in pixels) in a tabset&#39;s tab list that its tabs don&#39;t use, e.g. how much a toolbar beside the tabs could grow
before they overflow (and how much space an overflow menu needs to free up, once it&#39;s negative).</p>
<p>ℹ️ The space is measured along the tab list: its width, or its height if its tabs are placed on the left or right
(or the tabset is collapsed to a vertical strip).
If the tab list can&#39;t shrink any further (e.g. it&#39;s 0px wide, beside a toolbar that doesn&#39;t shrink), the amount the header&#39;s content
overflows the header is subtracted too, so it&#39;s still how much space a toolbar needs to free up.</p>
<p>ℹ️ The tab list&#39;s <code>--tab-list-free-space</code> custom property has the same value (e.g. &quot;120px&quot;).</p>
<p>ℹ️ Within a tabset (e.g. its toolbar), the <code>useTabListFreeSpace</code> hook returns this value (and re-renders when it changes).</p>
</td>
    </tr>
    <tr>
      <td>getTabListOverflow</td>
      <td><p>Ids of a tabset&#39;s tabs that are out of view (scrolled out of its tab list, which overflows), in the order they&#39;re shown;
e.g. to list them in an overflow menu.</p>
<p>ℹ️ The same array is returned until the tabs out of view change.
Tabs that aren&#39;t rendered at all (e.g. hidden with <code>display: none</code>) aren&#39;t included.</p>
<p>ℹ️ Within a tabset (e.g. its toolbar), the <code>useTabListOverflow</code> hook returns this value (and re-renders when it changes).</p>
</td>
    </tr>
    <tr>
      <td>maximizeTabset</td>
      <td><p>Maximize a tabset, so that it covers the rest of the workspace.</p>
<p>ℹ️ This has no effect on the only tabset in a workspace (the root), which already fills it, or on a floating tabset.
A maximized tabset is restored if it becomes the only one (e.g. after the other tabsets are closed).</p>
</td>
    </tr>
    <tr>
      <td>moveTab</td>
      <td><p>Move a tab to a position within a tabset&#39;s tab list, to a region of a tabset&#39;s content area,
or to an <code>edge</code> of the workspace (in a new tabset beside all of the other tabsets).</p>
<p>ℹ️ The <code>&quot;left&quot;</code> and <code>&quot;right&quot;</code> regions (and edges) are sides of the screen (so they&#39;re mirrored in right-to-left layouts).</p>
<p>ℹ️ Floating tabsets can&#39;t be split, so a tab moved to an edge region of one is added to it instead (like the <code>&quot;center&quot;</code> region).</p>
</td>
    </tr>
    <tr>
      <td>moveTabset</td>
      <td><p>Move a tabset beside another tabset (by dropping it onto a region at the edge of that tabset&#39;s content area),
or beside all of the other tabsets (at an <code>edge</code> of the workspace),
or move its tabs into another tabset (at an <code>index</code> within its tab list, or onto the <code>&quot;center&quot;</code> of its content area).
The <code>&quot;left&quot;</code> and <code>&quot;right&quot;</code> regions (and edges) are sides of the screen (so they&#39;re mirrored in right-to-left layouts).</p>
<p>ℹ️ When its tabs are moved, the emptied tabset is removed (unless it has the <code>keepWhenEmpty</code> flag).</p>
<p>ℹ️ A floating tabset moved beside another tabset (or to an edge of the workspace) is docked: it&#39;s moved into the layout, and stops floating.
Floating tabsets can&#39;t be split, so a tabset moved to an edge region of one has its tabs moved into it instead (like the <code>&quot;center&quot;</code> region).</p>
</td>
    </tr>
    <tr>
      <td>restoreTabset</td>
      <td><p>Restore the maximized tabset (if there is one).</p>
</td>
    </tr>
    <tr>
      <td>selectTab</td>
      <td><p>Select a tab within its tabset.</p>
<p>ℹ️ Like a tab selected any other way, it&#39;s scrolled into view if its tab list overflows.</p>
</td>
    </tr>
    <tr>
      <td>setModel</td>
      <td><p>Replace the model.</p>
</td>
    </tr>
    <tr>
      <td>startExternalDrag</td>
      <td><p>Start dragging a tab that isn&#39;t in the workspace yet, from an element outside of it (e.g. an item in a palette of widgets);
call it from the element&#39;s <code>pointerdown</code> handler.
The tab is dragged like tabs within the workspace are (with the same drop targets, drop indicator, and <code>disableDrop</code> checks, with the <code>&quot;new&quot;</code> source),
and is added where it&#39;s dropped (reported to <code>onModelChanged</code> with the <code>&quot;add&quot;</code> reason).
The drag starts once the pointer has moved a few pixels, so a press that doesn&#39;t move (e.g. a click) does nothing;
the click that follows a drag is suppressed. Pressing Escape cancels the drag.</p>
<p>ℹ️ Unlike other imperative methods, the drop is restricted by <code>disabled</code> and <code>disableDrop</code>, since the user chooses where it goes.</p>
<p>ℹ️ The element must be in the same document as the workspace.
Like tabs, it should have <code>touch-action: none</code> (e.g. with CSS), so that touch input drags it rather than scrolling the page.</p>
<ul>
<li><code>event</code> The <code>pointerdown</code> event of the pressed element</li>
</ul>
</td>
    </tr>
    <tr>
      <td>subscribeToTabListFreeSpace</td>
      <td><p>Subscribe to changes to the free space in a tabset&#39;s tab list (see <code>getTabListFreeSpace</code>),
e.g. from a toolbar rendered outside of the Workspace.</p>
<p>ℹ️ The listener is called synchronously when the tab list is measured (when it or its tabs change size, or tabs are added or removed),
before the browser paints; changes it makes to the DOM (e.g. with <code>flushSync</code>) are shown in the same frame.</p>
<p>ℹ️ The listener is called with <code>undefined</code> when the tabset is removed (e.g. closed, or merged into another tabset).</p>
</td>
    </tr>
    <tr>
      <td>subscribeToTabListOverflow</td>
      <td><p>Subscribe to changes to which of a tabset&#39;s tabs are out of view (see <code>getTabListOverflow</code>),
e.g. from an overflow menu rendered outside of the Workspace.</p>
<p>ℹ️ The listener is called synchronously when the tab list is measured (when it&#39;s scrolled, when it or its tabs change size, or when tabs are added or removed),
before the browser paints, except while the user scrolls the list (it&#39;s reported in the scroll event, and the browser may show the new position first).</p>
<p>ℹ️ The listener is called with <code>undefined</code> when the tabset is removed (e.g. closed, or merged into another tabset).</p>
</td>
    </tr>
    <tr>
      <td>updateTab</td>
      <td><p>Update a tab; fields that are not specified are not changed.</p>
<p>ℹ️ <code>data</code> is replaced rather than merged.</p>
</td>
    </tr>
    <tr>
      <td>updateTabset</td>
      <td><p>Update a tabset; fields that are not specified are not changed.</p>
<p>ℹ️ <code>data</code> is replaced rather than merged.</p>
<p>ℹ️ Setting <code>minHeight</code>, <code>minWidth</code>, or <code>tabPlacement</code> to <code>undefined</code> removes the tabset&#39;s override,
so the corresponding Workspace prop is used; setting <code>maxHeight</code> or <code>maxWidth</code> to <code>undefined</code> removes the maximum.</p>
<p>ℹ️ The position and size (<code>x</code>, <code>y</code>, <code>width</code>, and <code>height</code>) of a floating tabset can be changed too (and are ignored for other tabsets),
as can be its <code>collapsible</code> flag (which is ignored for floating tabsets).</p>
</td>
    </tr>
  </tbody>
</table>

<!-- react-lib-tools:api:end -->