import { Group, Panel, useDefaultLayout } from "react-resizable-panels";

// <begin>

// eslint-disable-next-line react-hooks/rules-of-hooks
const { defaultLayout, onLayoutChange } = useDefaultLayout({
  groupId: "persisted-group",
  storage: localStorage
});

/* prettier-ignore */
<Group defaultLayout={defaultLayout} id="persisted-group" onLayoutChange={onLayoutChange}>
  <Panel id="left" minSize={50}>left</Panel>
  <Panel id="center" minSize={50}>center</Panel>
  <Panel id="right" minSize={50}>right</Panel>
</Group>
