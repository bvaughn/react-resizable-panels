import { Group, Panel } from "react-resizable-panels";

declare function Folders(): null;
declare function MessageList(): null;
declare function ReadingPane(): null;

// <begin>

/* prettier-ignore */
<Group orientation="horizontal">
  <Panel>
    <Folders />
  </Panel>
  <Panel>
    <Group orientation="vertical">
      <Panel>
        <MessageList />
      </Panel>
      <Panel>
        <ReadingPane />
      </Panel>
    </Group>
  </Panel>
</Group>
