import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels";

const showLeftPanel = false;

// <begin>

// eslint-disable-next-line react-hooks/rules-of-hooks
const { defaultLayout, onLayoutChange } = useDefaultLayout({
  id: "unique-layout-id",
  // This set of ids must match the Panels rendered during mount,
  // or the default layout will not be restored
  panelIds: showLeftPanel ? ["left", "right"] : ["right"],
  storage: localStorage
});

/* prettier-ignore */
<Group defaultLayout={defaultLayout} onLayoutChange={onLayoutChange}>
  {showLeftPanel && (
    <>
      <Panel id="left">left</Panel>
      <Separator />
    </>
  )}
  <Panel id="center">center</Panel>
</Group>
