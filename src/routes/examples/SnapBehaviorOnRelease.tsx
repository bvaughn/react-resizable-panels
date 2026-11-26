import { Group, Panel, Separator } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Group snapBehavior="on-release">
  <Panel snapSizes={["25%", "50%", "75%"]}>left</Panel>
  <Separator />
  <Panel>right</Panel>
</Group>
