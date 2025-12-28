import { Group, Panel } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Group className="h-50" orientation="horizontal">
  <Panel>left</Panel>
  <Panel>
    <Group className="h-full" orientation="vertical">
      <Panel>top</Panel>
      <Panel>
        <Group className="h-full" orientation="horizontal">
        <Panel>left</Panel>
        <Panel>right</Panel>
        </Group>
      </Panel>
    </Group>
  </Panel>
  <Panel>right</Panel>
</Group>
