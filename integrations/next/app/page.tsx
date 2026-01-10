import { cookies } from "next/headers";
import { type Layout, Panel, Separator } from "react-resizable-panels";
import Group from "./components/Group";
import { LayoutShiftDetecter } from "../../tests";

export default async function Home() {
  const defaultLayoutOne = await getDefaultLayout("group-one");
  const defaultLayoutTwo = await getDefaultLayout("group-two");

  return (
    <div className="p-2 flex flex-col gap-2">
      <LayoutShiftDetecter />
      <Group
        className="h-25 gap-2"
        defaultLayout={defaultLayoutOne}
        id="group-one"
      >
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="left"
          minSize={50}
        >
          id: left
        </Panel>
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="center"
          minSize={50}
        >
          id: center
        </Panel>
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="right"
          minSize={50}
        >
          id: right
        </Panel>
      </Group>
      <Group
        className="min-h-35 gap-2"
        defaultLayout={defaultLayoutTwo}
        id="group-two"
        orientation="vertical"
      >
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="top"
          minSize={30}
        >
          id: top
        </Panel>
        <Separator className="h-2 rounded rounded-md bg-slate-700" />
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="bottom"
          minSize={30}
        >
          id: bottom
        </Panel>
      </Group>
    </div>
  );
}

async function getDefaultLayout(groupId: string) {
  const api = await cookies();
  const defaultLayoutString = api.get(groupId)?.value;
  return defaultLayoutString
    ? (JSON.parse(defaultLayoutString) as Layout)
    : undefined;
}
