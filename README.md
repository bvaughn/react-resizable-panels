# react-resizable-panels

React components for resizable panel groups/layouts.

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

## Documentation

Documentation for this project is available at [react-resizable-panels.vercel.app](https://react-resizable-panels.vercel.app/).

### Group

#### Required props

<!-- Group:required:begin -->

<!-- Group:required:end -->

#### Optional props

<!-- Group:optional:begin -->

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>autoSave</td>
      <td><p>Remember Panel layouts between page reload.</p>
<p>ℹ️ Layouts are saved using <code>localStorage</code> by default but can be customized using the <code>storageType</code> prop.</p>
<p>⚠️ The <code>id</code> prop must also be specified for auto-save groups.</p>
</td>
    </tr>
    <tr>
      <td>children</td>
      <td><p>Panel and ResizeHandle components that comprise this group.</p>
</td>
    </tr>
    <tr>
      <td>className</td>
      <td><p>CSS class name.</p>
</td>
    </tr>
    <tr>
      <td>direction</td>
      <td><p>Specifies the resizable direction (&quot;horizontal&quot; or &quot;vertical&quot;); defaults to &quot;horizontal&quot;</p>
</td>
    </tr>
    <tr>
      <td>disableCursor</td>
      <td><p>This library sets custom mouse cursor styles to indicate drag state.
Use this prop to disable that behavior for Panels and ResizeHandles in this group.</p>
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
      <td>id</td>
      <td><p>Uniquely identifies this group within an application.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This value will also be assigned to the <code>data-group-id</code> attribute.</p>
<p>⚠️ This prop must be provided if <code>autoSize</code> is true.</p>
</td>
    </tr>
    <tr>
      <td>onLayoutChange</td>
      <td><p>Called when panel sizes change; receives a map of Panel id to size.</p>
</td>
    </tr>
    <tr>
      <td>storageType</td>
      <td><p>Storage API to use for persisted layouts; defaults to <code>&quot;localStorage&quot;</code>.</p>
<p>Can be overridden to use <code>&quot;sessionStorage&quot;</code> instead.</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>⚠️ The following styles cannot be overridden: <code>display</code>, <code>flex-direction</code>, <code>flex-wrap</code>, and <code>overflow</code>.</p>
</td>
    </tr>
  </tbody>
</table>

<!-- Group:optional:end -->

### Panel

#### Required props

<!-- Panel:required:begin -->

<!-- Panel:required:end -->

#### Optional props

<!-- Panel:optional:begin -->

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
      <td>collapsedSize</td>
      <td><p>Panel size when collapsed; defaults to 0.</p>
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
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies this panel within the parent group.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This prop is used to associate persisted group layouts with the original panel.</p>
<p>ℹ️ This value will also be assigned to the <code>data-panel-id</code> attribute.</p>
</td>
    </tr>
    <tr>
      <td>maxSize</td>
      <td><p>Maximum size of Panel within its parent group; defaults to 100%.</p>
</td>
    </tr>
    <tr>
      <td>minSize</td>
      <td><p>Minimum size of Panel within its parent group; defaults to 0%.</p>
</td>
    </tr>
    <tr>
      <td>onResize</td>
      <td><p>Called when panel sizes change; receives a map of Panel id to size.</p>
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
<li><code>isExpanded(): boolean</code></li>
<li><code>resize(size: number): void</code></li>
</ul>
<p>ℹ️ The <code>usePanelRef</code> and <code>usePanelCallbackRef</code> hooks are exported for convenience use in TypeScript projects.</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>⚠️ Style is applied to nested <code>HTMLDivElement</code> to avoid styles that interfere with Flex layout.</p>
</td>
    </tr>
  </tbody>
</table>

<!-- Panel:optional:end -->

### ResizeHandle

#### Required props

<!-- ResizeHandle:required:begin -->

<!-- ResizeHandle:required:end -->

#### Optional props

<!-- ResizeHandle:optional:begin -->

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
<p>ℹ️ Use the <code>data-resize-handle-state</code> attribute for custom <em>hover</em> and <em>active</em> styles</p>
<p>⚠️ The following properties cannot be overridden: <code>flex-grow</code>, <code>flex-shrink</code></p>
</td>
    </tr>
    <tr>
      <td>elementRef</td>
      <td><p>Ref attached to the root <code>HTMLDivElement</code>.</p>
</td>
    </tr>
    <tr>
      <td>id</td>
      <td><p>Uniquely identifies the resize handle within the parent group.
Falls back to <code>useId</code> when not provided.</p>
<p>ℹ️ This value will also be assigned to the <code>data-resize-handle-id</code> attribute.</p>
</td>
    </tr>
    <tr>
      <td>style</td>
      <td><p>CSS properties.</p>
<p>ℹ️ Use the <code>data-resize-handle-state</code> attribute for custom <em>hover</em> and <em>active</em> styles</p>
<p>⚠️ The following properties cannot be overridden: <code>flex-grow</code>, <code>flex-shrink</code></p>
</td>
    </tr>
  </tbody>
</table>

<!-- ResizeHandle:optional:end -->
