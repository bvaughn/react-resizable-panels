# react-resizable-panels
React components for resizable panel groups/layouts

```jsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

<PanelGroup autoSaveId="example" direction="horizontal">
  <Panel defaultSize={0.3} id="left">
    <SourcesExplorer />
  </Panel>
  <Panel defaultSize={0.5} id="middle">
    <PanelResizeHandle />
    <SourceViewer />
    <PanelResizeHandle />
  </Panel>
  <Panel defaultSize={0.2} id="right">
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
| `height`     | `number`                    | Height of group (in pixels)
| `width`      | `number`                    | Width of group (in pixels)

### `Panel`
| prop          | type        | description
| :------------ | :---------- | :---
| `children`    | `ReactNode` | Arbitrary React element(s)
| `className`   | `?string`   | Class name
| `defaultSize` | `?number`   | Initial size of panel (relative to other panels within the group)
| `id`          | `string`    | Panel id (must be unique within the current group)
| `minSize`     | `?number`   | Minum allowable size of panel (0.0 - 1.0)
| `order`       | `?number`   | Order of panel within group; required for groups with conditionally rendered panels

### `PanelResizeHandle`
| prop          | type         | description
| :------------ | :----------- | :---
| `children`    | `?ReactNode` | Custom drag UI; can be any arbitrary React element(s)
| `className`   | `?string`    | Class name
| `disabled`    | `?boolean`   | Disable drag handle