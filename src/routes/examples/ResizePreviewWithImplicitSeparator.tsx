import { Group, Panel, SeparatorOverlay } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Group resizePreviewMode="separator">
  <Panel minSize="10%">left</Panel>
  <Panel minSize="10%">center</Panel>
  <Panel minSize="10%">right</Panel>
  <Panel minSize="10%">right</Panel>

  <SeparatorOverlay
    className="w-2 bg-sky-500 data-[separator-overlay=inactive]:bg-sky-700 opacity-80"
  />
</Group>
