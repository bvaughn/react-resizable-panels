<img src="https://react-resizable-panels.vercel.app/og.png" alt="react-resizable-panels logo" width="400" height="210" />

`react-resizable-panels`: React components for resizable panel groups/layouts.

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

### Group

<!-- Group:description:begin -->

A Group wraps a set of resizable Panel components.
Group content can be resized _horizontally_ or _vertically_.

Group elements always include the following attributes:

```html
<div data-group data-testid="group-id-prop" id="group-id-prop"></div>
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

<!-- Group:description:end -->

#### Required props

<!-- Group:required-props:begin -->

None

<!-- Group:required-props:end -->

#### Optional props

<!-- Group:optional-props:begin -->

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
<p>ℹ️ This value will also be assigned to the <code>data-group</code> attribute.</p>
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
<li><code>setLayout(layout: Layout): void</code></li>
</ul>
<p>ℹ️ The <code>useGroupRef</code> and <code>useGroupCallbackRef</code> hooks are exported for convenience use in TypeScript projects.</p>
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
      <td><p>Called after the Group&#39;s layout has  been changed.</p>
<p>ℹ️ For layout changes caused by pointer events, this method is not called until the pointer has been released.
This method is recommended when saving layouts to some storage api.</p>
<p>ℹ️ The second argument contains meta information about the layout change.
The <code>isUserInteraction</code> attribute signals whether the resize was caused by direct user input.
It is true for resizes caused by pointer or keyboard input
and false for other triggers (e.g. imperative API calls, initial mount, etc.)</p>
</td>
    </tr>
    <tr>
      <td>resizePreviewMode</td>
      <td><p>Controls whether pointer dragging updates <code>Panel</code>s sizes immediately,
or renders overlay separator previews until the pointer is released.</p>
<p>Defaults to <code>&quot;panel&quot;</code> (immediate resizing); <code>&quot;separator&quot;</code> defers resizing until release.</p>
<p>Customize previews using the <code>SeparatorOverlay</code> component.</p>
</td>
    </tr>
    <tr>
      <td>resizeTargetMinimumSize</td>
      <td><p>Minimum size of the resizable hit target area (either <code>Separator</code> or <code>Panel</code> edge)
This threshold ensures are large enough to avoid mis-clicks.</p>
<ul>
<li>Coarse inputs (typically a finger on a touchscreen) have reduced accuracy;
to ensure accessibility and ease of use, hit targets should be larger to prevent mis-clicks.</li>
<li>Fine inputs (typically a mouse) can be smaller</li>
</ul>
<p>ℹ️ <a href="https://developer.apple.com/design/human-interface-guidelines/accessibility">Apple interface guidelines</a> suggest <code>20pt</code> (<code>27px</code>) on desktops and <code>28pt</code> (<code>37px</code>) for touch devices
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

<!-- Group:optional-props:end -->

### Panel

<!-- Panel:description:begin -->

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
<div data-panel data-testid="panel-id-prop" id="panel-id-prop"></div>
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

⚠️ Panel elements must be direct DOM children of their parent Group elements.

<!-- Panel:description:end -->

#### Required props

<!-- Panel:required-props:begin -->

None

<!-- Panel:required-props:end -->

#### Optional props

<!-- Panel:optional-props:begin -->

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
<p>ℹ️ This value will also be assigned to the <code>data-panel</code> attribute.</p>
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
it will collapse when resized below 20% and expands when resized above 10%.</p>
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
<p>ℹ️ A collapsible panel will collapse when it&#39;s size is less than of the specified <code>minSize</code></p>
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
      <td><p>Called when panel sizes change.
@param panelSize Panel size (both as a percentage of the parent Group and in pixels)
@param id Panel id (if one was provided as a prop)
@param prevPanelSize Previous panel size (will be undefined on mount)</p>
</td>
    </tr>
    <tr>
      <td>panelRef</td>
      <td><p>Exposes the following imperative API:</p>
<ul>
<li><code>collapse(): void</code></li>
<li><code>expand(): void</code></li>
<li><code>getSize(): number</code></li>
<li><code>isCollapsed(): boolean</code></li>
<li><code>resize(size: number): void</code></li>
</ul>
<p>ℹ️ The <code>usePanelRef</code> and <code>usePanelCallbackRef</code> hooks are exported for convenience use in TypeScript projects.</p>
</td>
    </tr>
  </tbody>
</table>

<!-- Panel:optional-props:end -->

### Separator

<!-- Separator:description:begin -->

Separators are not _required_ but they are _recommended_ as they improve keyboard accessibility.

⚠️ Separator elements must be direct DOM children of their parent Group elements.

Separator elements always include the following attributes:

```html
<div
  data-separator
  data-testid="separator-id-prop"
  id="separator-id-prop"
  role="separator"
></div>
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

ℹ️ In addition to the attributes shown above, separator also renders all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).

<!-- Separator:description:end -->

#### Required props

<!-- Separator:required-props:begin -->

None

<!-- Separator:required-props:end -->

#### Optional props

<!-- Separator:optional-props:begin -->

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
<p>ℹ️ This value will also be assigned to the <code>data-separator</code> attribute.</p>
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

<!-- Separator:optional-props:end -->

### Grid

<!-- Grid:description:begin -->

A Grid arranges resizable Cells in two dimensions.
Columns can be resized horizontally and rows can be resized vertically;
dragging the point where a column boundary and a row boundary intersect resizes both.

Size constraints (e.g. min/max size, collapsible) are specified per track (column or row),
using the same format as Panel props.

Cells can span multiple columns and/or rows.
Track boundaries cannot be resized alongside of a cell that spans across them.

Grid elements always include the following attributes:

```html
<div data-grid data-testid="grid-id-prop" id="grid-id-prop"></div>
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

<!-- Grid:description:end -->

#### Required props

<!-- Grid:required-props:begin -->

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

<!-- Grid:required-props:end -->

#### Optional props

<!-- Grid:optional-props:begin -->

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
<p>ℹ️ This value will also be assigned to the <code>data-grid</code> attribute.</p>
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
      <td><p>Cell and GridSeparator components that comprise this grid.</p>
<p>⚠️ Cell and GridSeparator elements must be direct DOM children of their parent Grid element.</p>
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
<li><code>getTrack(axis: &quot;column&quot; | &quot;row&quot;, id: string | number): GridTrackImperativeHandle</code></li>
<li><code>setLayout(layout: Partial&lt;GridLayout&gt;): GridLayout</code></li>
</ul>
<p>ℹ️ The <code>useGridRef</code> and <code>useGridCallbackRef</code> hooks are exported for convenience use in TypeScript projects.</p>
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
<p>ℹ️ For layout changes caused by pointer events, this method is not called until the pointer has been released.
This method is recommended when saving layouts to some storage api.</p>
</td>
    </tr>
    <tr>
      <td>resizeTargetMinimumSize</td>
      <td><p>Minimum size of the resizable hit target area (either <code>GridSeparator</code> or <code>Cell</code> edge)
This threshold ensures targets are large enough to avoid mis-clicks.</p>
<p>ℹ️ Refer to the <code>Group</code> prop of the same name for more information.</p>
</td>
    </tr>
  </tbody>
</table>

<!-- Grid:optional-props:end -->

### Cell

<!-- Cell:description:begin -->

A Cell occupies one or more tracks (columns and rows) within a Grid.
Cells are resized along with the tracks they occupy.

Cell elements always include the following attributes:

```html
<div data-cell data-testid="cell-id-prop" id="cell-id-prop"></div>
```

ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.

⚠️ Cell elements must be direct DOM children of their parent Grid elements.

<!-- Cell:description:end -->

#### Required props

<!-- Cell:required-props:begin -->

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

<!-- Cell:required-props:end -->

#### Optional props

<!-- Cell:optional-props:begin -->

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
<p>ℹ️ This value will also be assigned to the <code>data-cell</code> attribute.</p>
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

<!-- Cell:optional-props:end -->

### GridSeparator

<!-- GridSeparator:description:begin -->

GridSeparators are not _required_ but they are _recommended_ as they improve keyboard accessibility.

A separator resizes either the columns or the rows of a Grid:

- `<GridSeparator column={1} />` is rendered between columns 0 and 1 (and spans all rows)
- `<GridSeparator row={1} />` is rendered between rows 0 and 1 (and spans all columns)

Separators can also span a subset of the opposite axis (e.g. `<GridSeparator column={1} rowStart={1} rowSpan={2} />`).

Where column and row separators intersect, dragging resizes both axes.

GridSeparators support the same props and attributes as Separators:

```html
<div
  data-separator
  data-testid="separator-id-prop"
  id="separator-id-prop"
  role="separator"
></div>
```

⚠️ GridSeparator elements must be direct DOM children of their parent Grid elements.

<!-- GridSeparator:description:end -->

#### Required props

<!-- GridSeparator:required-props:begin -->

None

<!-- GridSeparator:required-props:end -->

#### Optional props

<!-- GridSeparator:optional-props:begin -->

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
<p>ℹ️ This value will also be assigned to the <code>data-separator</code> attribute.</p>
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
      <td>column</td>
      <td><p>The separator is rendered along the leading (left) edge of this column,
between it and the previous column.
Must be greater than 0.</p>
</td>
    </tr>
    <tr>
      <td>rowStart</td>
      <td><p>First row the separator is rendered alongside; defaults to 0.</p>
</td>
    </tr>
    <tr>
      <td>rowSpan</td>
      <td><p>Number of rows the separator spans; defaults to all rows (starting from <code>rowStart</code>).</p>
</td>
    </tr>
    <tr>
      <td>row</td>
      <td><p>The separator is rendered along the leading (top) edge of this row,
between it and the previous row.
Must be greater than 0.</p>
</td>
    </tr>
    <tr>
      <td>columnStart</td>
      <td><p>First column the separator is rendered alongside; defaults to 0.</p>
</td>
    </tr>
    <tr>
      <td>columnSpan</td>
      <td><p>Number of columns the separator spans; defaults to all columns (starting from <code>columnStart</code>).</p>
</td>
    </tr>
  </tbody>
</table>

<!-- GridSeparator:optional-props:end -->
