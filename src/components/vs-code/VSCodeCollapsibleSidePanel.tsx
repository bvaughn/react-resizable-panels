import { type Ref, useContext } from "react";
import { Box } from "react-lib-tools";
import {
  type OnPanelResize,
  Panel,
  type PanelImperativeHandle
} from "react-resizable-panels";
import { VSCodeContext } from "./VSCodeContext";
import { VSCodeSidePanelContent } from "./VSCodeSidePanelContent";

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
      className="bg-white/8 rounded-md"
      collapsible
      defaultSize="25%"
      maxSize={300}
      minSize={100}
      onResize={onResize}
      panelRef={panelRef}
    >
      {/* Padding is applied here (rather than to the Panel) so that nothing shows when it collapses */}
      <Box className="p-2" direction="column" gap={2}>
        <div className="text-xs uppercase tracking-wide text-white/60 truncate">
          {activeTab}
        </div>
        <VSCodeSidePanelContent tab={activeTab} />
      </Box>
    </Panel>
  );
}
