import { Group, Panel, SeparatorOverlay } from "react-resizable-panels";

declare function RequestDetails(): null;
declare function RequestHeaders(): null;
declare function RequestLog(): null;

// <begin>

/* prettier-ignore */
<Group resizePreviewMode="separator">
  <Panel minSize="20%">
    <RequestLog />
  </Panel>
  <Panel minSize="20%" maxSize="50%">
    <RequestDetails />
  </Panel>
  <Panel minSize="20%">
    <RequestHeaders />
  </Panel>

  <SeparatorOverlay
    className="w-1 bg-violet-400 data-[separator-overlay=inactive]:bg-violet-700 opacity-80"
  />
</Group>
