import { cookies } from "next/headers";
import { type Layout, Panel, Separator } from "react-resizable-panels";
import Group from "./components/Group";

export default async function Home() {
  const defaultLayoutA = await getDefaultLayout("group-one");
  const defaultLayoutB = await getDefaultLayout("group-two");

  return (
    <div className="p-2 flex flex-col gap-2">
      <Group
        className="h-25 gap-2"
        defaultLayout={defaultLayoutA}
        id="group-one"
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
      <Group
        className="h-25 gap-2"
        defaultLayout={defaultLayoutB}
        id="group-two"
      >
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="left"
          minSize={50}
        >
          left
        </Panel>
        <Separator className="w-2 rounded rounded-md bg-slate-700" />
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="right"
          minSize={50}
        >
          right
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
