import { Group, Panel, ResizeHandle } from "react-resizable-panels";

const hideLeftPanel = false;
const hideRightPanel = false;

// <begin>

/* prettier-ignore */
<Group>
  {hideLeftPanel || (
    <>
      <Panel id="left">left panel</Panel>
      <ResizeHandle />
    </>
  )}
  <Panel id="center">center panel</Panel>
  {hideRightPanel || (
    <>
      <ResizeHandle />
      <Panel id="right">right panel</Panel>
    </>
  )}
</Group>
