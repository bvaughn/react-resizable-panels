import { Group, Panel } from "react-resizable-panels";

const hideLeftPanel = false;
const hideRightPanel = false;

// <begin>

/* prettier-ignore */
<Group>
  {hideLeftPanel || (
    <Panel id="left">left panel</Panel>
  )}
  <Panel id="center">center panel</Panel>
  {hideRightPanel || (
    <Panel id="right">right panel</Panel>
  )}
</Group>
