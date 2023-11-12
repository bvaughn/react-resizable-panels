# react-resizable-panels

React components for resizable panel groups/layouts

```jsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

<PanelGroup autoSaveId="example" direction="horizontal">
  <Panel defaultSizePercentage={25}>
    <SourcesExplorer />
  </Panel>
  <PanelResizeHandle />
  <Panel>
    <SourceViewer />
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSizePercentage={25}>
    <Console />
  </Panel>
</PanelGroup>;
```

### If you like this project, 🎉 [become a sponsor](https://github.com/sponsors/bvaughn/) or ☕ [buy me a coffee](http://givebrian.coffee/)

## Props

### `PanelGroup`

| prop                               | type                         | description                                                       |
| :--------------------------------- | :--------------------------- | :---------------------------------------------------------------- |
| `autoSaveId`                       | `?string`                    | Unique id used to auto-save group arrangement via `localStorage`  |
| `children`                         | `ReactNode`                  | Arbitrary React element(s)                                        |
| `className`                        | `?string`                    | Class name to attach to root element                              |
| `direction`                        | `"horizontal" \| "vertical"` | Group orientation                                                 |
| `disablePointerEventsDuringResize` | `?boolean = false`           | Disable pointer events inside `Panel`s during resize <sup>2</sup> |
| `id`                               | `?string`                    | Group id; falls back to `useId` when not provided                 |
| `onLayout`                         | `?(sizes: number[]) => void` | Called when group layout changes                                  |
| `storage`                          | `?PanelGroupStorage`         | Custom storage API; defaults to `localStorage` <sup>1</sup>       |
| `style`                            | `?CSSProperties`             | CSS style to attach to root element                               |
| `tagName`                          | `?string = "div"`            | HTML element tag name for root element                            |

<sup>1</sup>: Storage API must define the following _synchronous_ methods:

- `getItem: (name:string) => string`
- `setItem: (name: string, value: string) => void`

<sup>2</sup>: This behavior is disabled by default because it can interfere with scrollbar styles, but it can be useful in the edge case where a `Panel` contains an `<iframe>`

`PanelGroup` components also expose an imperative API for manual resizing:
| method | description
| :-------------------------------- | :---
| `setLayout(panelSizes: number[])` | Resize panel group to the specified _panelSizes_ (`[1 - 100, ...]`).

### `Panel`

| prop            | type                            | description                                                                                   |
| :-------------- | :------------------------------ | :-------------------------------------------------------------------------------------------- |
| `children`      | `ReactNode`                     | Arbitrary React element(s)                                                                    |
| `className`     | `?string`                       | Class name to attach to root element                                                          |
| `collapsedSize` | `?number=0`                     | Panel should collapse to this size                                                            |
| `collapsible`   | `?boolean=false`                | Panel should collapse when resized beyond its `minSize`                                       |
| `defaultSize`   | `?number`                       | Initial size of panel (numeric value between 1-100)                                           |
| `id`            | `?string`                       | Panel id (unique within group); falls back to `useId` when not provided                       |
| `maxSize`       | `?number = 100`                 | Maximum allowable size of panel (numeric value between 1-100); defaults to `100`              |
| `minSize`       | `?number = 10`                  | Minimum allowable size of panel (numeric value between 1-100); defaults to `10`               |
| `onCollapse`    | `?(collapsed: boolean) => void` | Called when panel is collapsed; `collapsed` boolean parameter reflecting the new state        |
| `onResize`      | `?(size: number) => void`       | Called when panel is resized; `size` parameter is a numeric value between 1-100. <sup>1</sup> |
| `order`         | `?number`                       | Order of panel within group; required for groups with conditionally rendered panels           |
| `style`         | `?CSSProperties`                | CSS style to attach to root element                                                           |
| `tagName`       | `?string = "div"`               | HTML element tag name for root element                                                        |

<sup>1</sup>: If any `Panel` has an `onResize` callback, the `order` prop should be provided for all `Panel`s.

`Panel` components also expose an imperative API for manual resizing:
| method | description
| :--------------------------- | :---
| `collapse()` | If panel is `collapsible`, collapse it fully.
| `expand()` | If panel is currently _collapsed_, expand it to its most recent size.
| `getCollapsed(): boolean` | Returns `true` if the panel is currently _collapsed_ (`size === 0`).
| `getSize(): number` | Returns the most recently commited size of the panel as a percentage (`1 - 100`).
| `resize(percentage: number)` | Resize panel to the specified _percentage_ (`1 - 100`).

### `PanelResizeHandle`

| prop         | type                             | description                                                                     |
| :----------- | :------------------------------- | :------------------------------------------------------------------------------ |
| `children`   | `?ReactNode`                     | Custom drag UI; can be any arbitrary React element(s)                           |
| `className`  | `?string`                        | Class name to attach to root element                                            |
| `disabled`   | `?boolean`                       | Disable drag handle                                                             |
| `id`         | `?string`                        | Resize handle id (unique within group); falls back to `useId` when not provided |
| `onDragging` | `?(isDragging: boolean) => void` | Called when group layout changes                                                |
| `style`      | `?CSSProperties`                 | CSS style to attach to root element                                             |
| `tagName`    | `?string = "div"`                | HTML element tag name for root element                                          |

---

#### If you like this project, [buy me a coffee](http://givebrian.coffee/).
