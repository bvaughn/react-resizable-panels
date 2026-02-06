import { type PropsWithChildren } from "react";
import { Group, Panel } from "react-resizable-panels";

export function AccordionGroup({ children }: PropsWithChildren) {
  return (
    <Group className="h-35! gap-1">
      {children}
      <Panel className="flex flex-row rounded bg-slate-800" />
    </Group>
  );
}
