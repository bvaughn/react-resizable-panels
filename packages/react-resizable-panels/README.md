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
| `className`  | `?string`                   | Class name
| `direction`  | `"horizontal" \| "vertical"` | Group orientation
| `id`         | `?string`                   | Optional group id; falls back to `useId` when not provided

### `Panel`
| prop          | type        | description
| :------------ | :---------- | :---
| `children`    | `ReactNode` | Arbitrary React element(s)
| `className`   | `?string`   | Class name
| `defaultSize` | `?number`   | Initial size of panel (numeric value between 1-100)
| `id`          | `?string`   | Optional panel id (unique within group); falls back to `useId` when not provided
| `minSize`     | `?number`   | Minimum allowable size of panel (numeric value between 1-100)
| `order`       | `?number`   | Order of panel within group; required for groups with conditionally rendered panels

### `PanelResizeHandle`
| prop          | type         | description
| :------------ | :----------- | :---
| `children`    | `?ReactNode` | Custom drag UI; can be any arbitrary React element(s)
| `className`   | `?string`    | Class name
| `disabled`    | `?boolean`   | Disable drag handle
| `id`          | `?string`    | Optional resize handle id (unique within group); falls back to `useId` when not provided

### `PanelContext`
| prop         | type                 | description
| :----------- | :------------------- | :---
| `activeHandleId` | `string \| null` | Resize handle currently being dragged (or `null`)