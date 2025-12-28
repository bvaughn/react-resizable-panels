import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels";

// <begin>

// eslint-disable-next-line react-hooks/rules-of-hooks
const { defaultLayout, onLayoutChange } = useDefaultLayout({
  id: "unique-layout-id",
  storage: localStorage
});

/* prettier-ignore */
<Group defaultLayout={defaultLayout} onLayoutChange={onLayoutChange}>
  <Panel id="left" minSize={50}>left</Panel>
  <Separator />
  <Panel id="center" minSize={50}>center</Panel>
  <Separator />
  <Panel id="right" minSize={50}>right</Panel>
</Group>
