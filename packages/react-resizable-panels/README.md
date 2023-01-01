# react-resizable-panels
React components for resizable panel groups/layouts

```jsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

<PanelGroup autoSaveId="example" direction="horizontal">
  <Panel defaultSize={25}>
    <SourcesExplorer />
  </Panel>
  <PanelResizeHandle />
  <Panel>
    <SourceViewer />
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={25}>
    <Console />
  </Panel>
</PanelGroup>
```

## Props

### `PanelGroup`
| prop         | type                        | description
| :----------- | :-------------------------- | :---
| `autoSaveId` | `?string`                   | Unique id used to auto-save group arrangement via `localStorage`
| `children`   | `ReactNode`                 | Arbitrary React element(s)
| `className`  | `?string`                   | Optional class name to attach to root element
| `direction`  | `"horizontal" \| "vertical"` | Group orientation
| `id`         | `?string`                   | Optional group id; falls back to `useId` when not provided
| `style`      | `?CSSProperties`            | Optional CSS style to attach to root element
| `tagName`    | `?string = "div"`           | Optional HTML element tag name for root element

### `Panel`
| prop          | type                            | description
| :------------ | :------------------------------ | :---
| `children`    | `ReactNode`                     | Arbitrary React element(s)
| `className`   | `?string`                       | Optional class name to attach to root element
| `collapsible` | `?boolean=false`                | Panel should collapse when resized beyond its `minSize`
| `defaultSize` | `?number`                       | Initial size of panel (numeric value between 1-100)
| `id`          | `?string`                       | Optional panel id (unique within group); falls back to `useId` when not provided
| `maxSize`     | `?number = 100`                 | Maximum allowable size of panel (numeric value between 1-100); defaults to `100`
| `minSize`     | `?number = 10`                  | Minimum allowable size of panel (numeric value between 1-100); defaults to `10`
| `onCollapse`  | `?(collapsed: boolean) => void` | Optional function to be called when panel is collapsed; `collapsed` boolean parameter reflecting the new state
| `onResize`    | `?(size: number) => void`       | Optional function to be called when panel is resized; `size` parameter is a numeric value between 1-100
| `order`       | `?number`                       | Order of panel within group; required for groups with conditionally rendered panels
| `style`       | `?CSSProperties`                | Optional CSS style to attach to root element
| `tagName`     | `?string = "div"`               | Optional HTML element tag name for root element

### `PanelResizeHandle`
| prop          | type              | description
| :------------ | :---------------- | :---
| `children`    | `?ReactNode`      | Custom drag UI; can be any arbitrary React element(s)
| `className`   | `?string`         | Optional class name to attach to root element
| `disabled`    | `?boolean`        | Disable drag handle
| `id`          | `?string`         | Optional resize handle id (unique within group); falls back to `useId` when not provided
| `style`       | `?CSSProperties`  | Optional CSS style to attach to root element
| `tagName`     | `?string = "div"` | Optional HTML element tag name for root element