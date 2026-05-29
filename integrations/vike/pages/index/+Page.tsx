import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels";
import { usePageContext } from "vike-react/usePageContext";
import { LayoutShiftDetecter } from "../../../tests";
import { useCookieStorage } from "./useCookieStorage";
import { useLocalStorage } from "./useLocalStorage";

export default function Page() {
  const {
    urlParsed: {
      search: { storageType }
    }
  } = usePageContext();

  const cookieStorage = useCookieStorage();
  const localStorage = useLocalStorage();
  const storage = storageType === "localStorage" ? localStorage : cookieStorage;

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
      <LayoutShiftDetecter />
      <div className="text-lg">Group: Default layout</div>
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
      <div className="text-lg">Panel: Default sizes</div>
      <DefaultSize defaultSize="25%" />
      <DefaultSize defaultSize="100px" />
      <DefaultSize defaultSize="25vw" />
      <DefaultSize defaultSize="15rem" />
      <DefaultSize defaultSize={0} />
    </div>
  );
}

function DefaultSize({ defaultSize }: { defaultSize: number | string }) {
  return (
    <Group className="h-25 gap-2">
      <Panel className="bg-slate-800 rounded rounded-md p-2" id="left">
        left
      </Panel>
      <Panel
        className="bg-slate-800 rounded rounded-md p-2"
        defaultSize={defaultSize}
        id="right"
      >
        right: {defaultSize}
      </Panel>
    </Group>
  );
}
