import type { ReactNode } from "react";
import { Group, Panel } from "react-resizable-panels";

declare function VirtualList(): ReactNode;
declare function DetailsPanel(): ReactNode;

// <begin>

/* prettier-ignore */
<Group className="h-screen" orientation="horizontal">
  <Panel>
    <VirtualList />
  </Panel>
  <Panel>
    <DetailsPanel />
  </Panel>
</Group>
