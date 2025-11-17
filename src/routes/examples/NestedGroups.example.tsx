import { Group, Panel } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Group direction="horizontal">
  <Panel>left</Panel>
  <Panel>
    <Group direction="vertical">
      <Panel>top</Panel>
      <Panel>
        <Group direction="horizontal">
        <Panel>left</Panel>
        <Panel>right</Panel>
        </Group>
      </Panel>
    </Group>
  </Panel>
  <Panel>right</Panel>
</Group>
