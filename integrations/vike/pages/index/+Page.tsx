import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels";
import { useCookieStorage } from "./useCookieStorage";

export default function Page() {
  const storage = useCookieStorage();

  const groupOneProps = useDefaultLayout({
    id: "group-one",
    storage
  });

  const groupTwoProps = useDefaultLayout({
    id: "group-two",
    storage
  });

  return (
    <div className="p-2 flex flex-col gap-2">
      <Group className="h-25 gap-2" id="group-one" {...groupOneProps}>
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
      <Group className="h-25 gap-2" id="group-two" {...groupTwoProps}>
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="left"
          minSize={50}
        >
          left
        </Panel>
        <Separator className="w-2 rounded rounded-md bg-slate-600" />
        <Panel
          className="bg-slate-800 rounded rounded-md p-2"
          id="right"
          minSize={50}
        >
          right
        </Panel>
      </Group>
      <Group className="h-25 gap-2">
        <Panel className="bg-slate-800 rounded rounded-md p-2" minSize={50}>
          left
        </Panel>
        <Panel className="bg-slate-800 rounded rounded-md p-2" minSize={50}>
          right
        </Panel>
      </Group>
    </div>
  );
}
