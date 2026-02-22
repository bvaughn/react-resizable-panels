import { useContext, type Ref } from "react";
import {
  Panel,
  type OnPanelResize,
  type PanelImperativeHandle
} from "react-resizable-panels";
import { VSCodeContext } from "./VSCodeContext";
import { Box } from "react-lib-tools";

export function VSCodeCollapsibleSidePanel({
  onResize,
  panelRef
}: {
  onResize: OnPanelResize;
  panelRef: Ref<PanelImperativeHandle | null> | undefined;
}) {
  const { activeTab } = useContext(VSCodeContext);

  return (
    <Panel
      className="bg-slate-900 p-2 border-l border-l-[2px] border-black"
      collapsible
      defaultSize={200}
      maxSize={300}
      minSize={100}
      onResize={onResize}
      panelRef={panelRef}
    >
      <Box direction="column" gap={2}>
        <div className="text-lg capitalize">{activeTab}</div>
        <div>Side panel content goes here</div>
      </Box>
    </Panel>
  );
}
