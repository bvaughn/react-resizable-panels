# react-resizable-panels
React components for resizable panel groups/layouts

[Try a demo on Code Sandbox](https://codesandbox.io/s/react-panel-group-demo-ts9xqk)

```jsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

<PanelGroup autoSaveId="horizontal-panel" direction="horizontal">
  <Panel defaultSize={0.3} id="sources-explorer-panel">
    <SourcesExplorer />
  </Panel>
  <Panel defaultSize={0.5} id="source-viewer-panel">
    <PanelResizeHandle panelBefore="sources-explorer-panel" panelAfter="source-viewer-panel" />
    <SourceViewer />
    <PanelResizeHandle panelBefore="source-viewer-panel" panelAfter="console-panel" />
  </Panel>
  <Panel defaultSize={0.2} id="console-panel">
    <Console />
  </Panel>
</PanelGroup>
```

## Props

### `PanelGroup`
| prop         | type                        | description
| :----------- | :-------------------------- | :---
| `autoSaveId` | `?string`                   | Unique id used to auto-save group arrangement via `localStorage`
| `children`   | `ReactNode[]`               | Arbitrary React element(s)
| `className`  | `?string`                   | Class name
| `direction`  | `"horizontal" | "vertical"` | Group orientation
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

### `PanelResizeHandle`
| prop          | type         | description
| :------------ | :----------- | :---
| `children`    | `?ReactNode` | Custom drag UI; can be any arbitrary React element(s)
| `className`   | `?string`    | Class name
| `disabled`    | `?boolean`   | Disable drag handle
| `panelAfter`  | `PanelId`    | Id of panel after (below or to the right of) the drag handle
| `panelBefore` | `PanelId`    | Id of panel before (above or to the left of) the drag handle