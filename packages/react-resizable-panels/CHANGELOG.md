# Changelog

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
