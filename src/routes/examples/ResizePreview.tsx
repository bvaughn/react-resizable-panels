import { Group, Panel, Separator } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Group resizePreviewMode="separator">
  <Panel defaultSize="50%" minSize="20%">left</Panel>
  <Separator />
  <Panel minSize="20%">right</Panel>
</Group>
