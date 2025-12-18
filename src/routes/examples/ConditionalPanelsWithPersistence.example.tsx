import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels";
import { useMemo } from "react";

const hideMiddlePanel = false;

// <begin>

// Compute current panel IDs based on conditional rendering
// eslint-disable-next-line react-hooks/rules-of-hooks
const panelIds = useMemo(
  () => (hideMiddlePanel ? ["left", "right"] : ["left", "middle", "right"]),
  [hideMiddlePanel]
);

// eslint-disable-next-line react-hooks/rules-of-hooks
const { defaultLayout, onLayoutChange } = useDefaultLayout({
  groupId: "conditional-persistent-group",
  storage: localStorage,
  panelIds // Pass current panel configuration
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
