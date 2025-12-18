import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels";

const hideMiddlePanel = false;

// <begin>

// eslint-disable-next-line react-hooks/rules-of-hooks
const { defaultLayout, onLayoutChange } = useDefaultLayout({
  groupId: "conditional-persistent-group",
  storage: localStorage
});

/* prettier-ignore */
<Group defaultLayout={defaultLayout} onLayoutChange={onLayoutChange}>
  <Panel id="left" minSize={10}>left</Panel>
  <Separator />
  {hideMiddlePanel || (
    <>
      <Panel id="middle" minSize={10}>middle</Panel>
      <Separator />
    </>
  )}
  <Panel id="right" minSize={10}>right</Panel>
</Group>
