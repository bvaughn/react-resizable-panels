import { Group, Panel } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Group orientation="horizontal">
  <Panel>left</Panel>
  <Panel>
    <Group orientation="vertical">
      <Panel>top</Panel>
      <Panel>
        <Group orientation="horizontal">
        <Panel>left</Panel>
        <Panel>right</Panel>
        </Group>
      </Panel>
    </Group>
  </Panel>
  <Panel>right</Panel>
</Group>
