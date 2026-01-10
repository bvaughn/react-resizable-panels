import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels";
import { LayoutShiftDetecter } from "../../../tests";

export function HomeRoute() {
  const groupOneProps = useDefaultLayout({
    id: "group-one"
  });

  const groupTwoProps = useDefaultLayout({
    id: "group-two"
  });

  return (
    <div className="p-2 flex flex-col gap-2">
      <LayoutShiftDetecter />

      <Group className="h-25 gap-2" {...groupOneProps}>
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
        orientation="vertical"
        {...groupTwoProps}
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
