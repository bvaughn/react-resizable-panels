# Changelog

## 0.0.27
* [#4](https://github.com/bvaughn/react-resizable-panels/issues/4): Add `collapsible` and `onCollapse` props to `Panel` to support auto-collapsing panels that resize beyond their `minSize` value (similar to VS Code's panel UX).

## 0.0.26
* Reduce style re-calc from resize-in-progress cursor style.

## 0.0.25
* While a resize is active, the global cursor style now reliably overrides per-element styles (to avoid flickering if you drag over e.g. an anchor element).

## 0.0.24
* [#49](https://github.com/bvaughn/react-resizable-panels/issues/49): Change cursor based on min/max boundaries.

## 0.0.23
* [#40](https://github.com/bvaughn/react-resizable-panels/issues/40): Add optional `maxSize` prop to `Panel`.
* [#41](https://github.com/bvaughn/react-resizable-panels/issues/41): Add optional `onResize` prop to `Panel`. This prop can be used (along with `defaultSize`) to persistence layouts somewhere externally.
* [#42](https://github.com/bvaughn/react-resizable-panels/issues/42): Don't cancel resize operations when exiting the window. Only cancel when a `"mouseup"` (or `"touchend"`) event is fired.

## 0.0.22
* Replaced the `"ew-resize"` and `"ns-resize"` cursor style with `"col-resize"` and `"row-resize"`.

## 0.0.21
* [#39](https://github.com/bvaughn/react-resizable-panels/issues/39): Fixed regression in TypeScript defs introduced in `0.0.20`

## 0.0.20
* Add `displayName` to `Panel`, `PanelGroup`, `PanelGroupContext`, and `PanelResizeHandle` to work around ParcelJS scope hoisting renaming.

## 0.0.19
* Add optional `style` and `tagName` props to `Panel`, `PanelGroup`, and `PanelResizeHandle` to simplify custom styling.
* Add `data-panel-group-direction` attribute to `PanelGroup` and `PanelResizeHandle` to simplify custom drag handle styling.

## 0.0.18
* `Panel` and `PanelGroup` now use `overflow: hidden` style by default to avoid potential scrollbar flickers while resizing.

## 0.0.17
* Bug fix: `Panel` styles include `flex-basis`, `flex-shrink`, and `overflow` so that their sizes are not unintentionally impacted by their content.

## 0.0.16
* Bug fix: Resize handle ARIA attributes now rendering proper min/max/now values for Window Splitter.
* Bug fix: Up/down arrows are ignored for _horizontal_ layouts and left/right arrows are ignored for _vertical_ layouts as per Window Splitter spec.
* [#36](https://github.com/bvaughn/react-resizable-panels/issues/36): Removed `PanelContext` in favor of adding `data-resize-handle-active` attribute to active resize handles. This attribute can be used to update the style for active handles.

## 0.0.15
* [#30](https://github.com/bvaughn/react-resizable-panels/issues/30): `PanelGroup` uses `display: flex` rather than absolute positioning. This provides several benefits: (a) more responsive resizing for nested groups, (b) no explicit `width`/`height` props, and (c) `PanelResizeHandle` components can now be rendered directly within `PanelGroup` (rather than as children of `Panel`s).

## 0.0.14
* [#23](https://github.com/bvaughn/react-resizable-panels/issues/23): Fix small regression with `autoSaveId` that was introduced with non-deterministic `useId` ids.

## 0.0.13
* [#18](https://github.com/bvaughn/react-resizable-panels/issues/18): Support server-side rendering (e.g. Next JS) by using `useId` (when available). `Panel` components no longer _require_ a user-provided `id` prop and will also fall back to using `useId` when none is provided.
* `PanelGroup` component now sets `position: relative` style by default, as well as an explicit `height` and `width` style.

## 0.0.12
* Bug fix: [#19](https://github.com/bvaughn/react-resizable-panels/issues/19): Fix initial "jump" that could occur when dragging started.
* Bug fix: [#20](https://github.com/bvaughn/react-resizable-panels/issues/20): Stop resize/drag operation on "contextmenu" event.
* Bug fix: [#21](https://github.com/bvaughn/react-resizable-panels/issues/21): Disable text selection while dragging active (Firefox only)

## 0.0.11
* Drag UX change: Reversing drag after dragging past the min/max size of a panel will no longer have an effect until the pointer overlaps with the resize handle. (Thanks @davidkpiano for the suggestion!)
* Bug fix: Resize handles are no longer left in a "focused" state after a touch/mouse event.

## 0.0.10
* Corrupt build artifact. Don't use this version.

## 0.0.9
* [#13](https://github.com/bvaughn/react-resizable-panels/issues/13): `PanelResizeHandle` should declare "separator" role and implement the recommended ["Window Splitter" pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)

## 0.0.8
* [#7](https://github.com/bvaughn/react-resizable-panels/issues/7): Support "touch" events for mobile compatibility.

## 0.0.7
* Add `PanelContext` with `activeHandleId` property identifying the resize handle currently being dragged (or `null`). This enables more customized UI/UX when resizing is in progress.
## 0.0.6
* [#5](https://github.com/bvaughn/react-resizable-panels/issues/5): Removed `panelBefore` and `panelAfter` props from `PanelResizeHandle`. `PanelGroup` now infers this based on position within the group.
## 0.0.5
* TypeScript props type fix for `PanelGroup`'s `children` prop.

## 0.0.4
* [#8](https://github.com/bvaughn/react-resizable-panels/issues/8): Added optional `order` prop to `Panel` to improve conditional rendering.

## 0.0.3
* [#3](https://github.com/bvaughn/react-resizable-panels/issues/3): `Panel`s can be conditionally rendered within a group. `PanelGroup` will persist separate layouts for each combination of visible panels.

## 0.0.2
* Documentation-only update.

## 0.0.1
* Initial release.
