declare function Editor(): null;
declare function FileTree(): null;

// <begin>

import { Group, Panel, Separator } from "react-resizable-panels";

export function App() {
  return (
    <Group>
      <Panel collapsible defaultSize="25%" minSize={100}>
        <FileTree />
      </Panel>
      <Separator />
      <Panel>
        <Editor />
      </Panel>
    </Group>
  );
}
