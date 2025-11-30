import { Group, Panel, Separator } from "react-resizable-panels";

const hideLeftPanel = false;
const hideRightPanel = false;

// <begin>

/* prettier-ignore */
<Group>
  {hideLeftPanel || (
    <>
      <Panel id="left">left panel</Panel>
      <Separator />
    </>
  )}
  <Panel id="center">center panel</Panel>
  {hideRightPanel || (
    <>
      <Separator />
      <Panel id="right">right panel</Panel>
    </>
  )}
</Group>
