import {
  Group,
  Panel,
  Separator,
  SeparatorOverlay
} from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Group resizePreviewMode="separator">
  <Panel minSize="10%">left</Panel>
  <Separator />
  <Panel minSize="10%">center</Panel>
  <Separator />
  <Panel minSize="10%">right</Panel>

  <SeparatorOverlay
    className="w-2 bg-sky-500 data-[separator-overlay=inactive]:bg-sky-700 opacity-80"
  />
</Group>
