import { Group, type Layout, Panel } from "react-resizable-panels";

// <begin>

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
("use client");

export default function ClientComponent({
  defaultLayout,
  groupId
}: {
  defaultLayout: Layout | undefined;
  groupId: string;
}) {
  return (
    <Group
      defaultLayout={defaultLayout}
      id={groupId}
      onLayoutChange={(layout) => {
        document.cookie = `${groupId}=${JSON.stringify(layout)}; path=/;`;
      }}
    >
      <Panel id="left" minSize={25}>
        left
      </Panel>
      <Panel id="right" minSize={25}>
        right
      </Panel>
    </Group>
  );
}
