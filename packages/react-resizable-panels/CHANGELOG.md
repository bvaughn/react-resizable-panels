# Changelog

## 0.0.7
* Add `PanelContext` with `activeHandleId` property identifying the resize handle currently being dragged (or `null`). This enables more customized UI/UX when resizing is in progress.
## 0.0.6
* [#5](https://github.com/bvaughn/react-resizable-panels/issues/5): Removed `panelBefore` and `panelAfter` props from `PanelResizeHandle`. `PanelGroup` now infers this based on position within the group.
## 0.0.5
* TypeScript props type fix

## 0.0.4
* [#8](https://github.com/bvaughn/react-resizable-panels/issues/8): Added optional `order` prop to `Panel` to improve conditional rendering.

## 0.0.3
* [#3](https://github.com/bvaughn/react-resizable-panels/issues/3): `Panel`s can be conditionally rendered within a group. `PanelGroup` will persist separate layouts for each combination of visible panels.

## 0.0.2
* Documentation-only update.

## 0.0.1
* Initial release.
