import { Group, Panel, Separator } from "react-resizable-panels";

declare function RequestDetails(): null;
declare function RequestLog(): null;

// <begin>

/* prettier-ignore */
<Group resizePreviewMode="separator">
  <Panel minSize="25%">
    <RequestLog />
  </Panel>
  <Separator />
  <Panel minSize="25%">
    <RequestDetails />
  </Panel>
</Group>
