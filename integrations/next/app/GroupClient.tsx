"use client";

import { Group, Layout, Panel } from "react-resizable-panels";

export default function GroupClient({
  defaultLayout
}: {
  defaultLayout: Layout | undefined;
}) {
  return (
    <Group
      className="h-25 gap-2"
      defaultLayout={defaultLayout}
      id="group-one"
      onLayoutChange={(layout) => {
        document.cookie = `group-one-layout=${JSON.stringify(layout)}`;
      }}
    >
      <Panel
        className="bg-slate-800 rounded rounded-md p-2"
        id="left"
        minSize={50}
      >
        left
      </Panel>
      <Panel
        className="bg-slate-800 rounded rounded-md p-2"
        id="center"
        minSize={50}
      >
        center
      </Panel>
      <Panel
        className="bg-slate-800 rounded rounded-md p-2"
        id="right"
        minSize={50}
      >
        right
      </Panel>
    </Group>
  );
}
