import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/20/solid";
import { type Ref, useState } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { DemoButton } from "../DemoButton";
import { Group } from "../styled-panels/Group";
import { Panel } from "../styled-panels/Panel";
import { Separator } from "../styled-panels/Separator";

/**
 * Demonstrates the imperative Panel API with a collapse/expand toggle;
 * shared by the usePanelRef and usePanelCallbackRef pages.
 */
export function PanelCollapseDemo({
  getPanel,
  panelRef
}: {
  getPanel: () => PanelImperativeHandle | null;
  panelRef: Ref<PanelImperativeHandle | null>;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = () => {
    const panel = getPanel();
    if (panel?.isCollapsed()) {
      panel.expand();
    } else {
      panel?.collapse();
    }
  };

  return (
    <Group>
      <Panel
        collapsible
        minSize="10%"
        onResize={(size) => setIsCollapsed(size.inPixels === 0)}
        panelRef={panelRef}
        showSizeAsPercentage
      >
        left
      </Panel>
      <DemoButton
        onClick={toggle}
        title={isCollapsed ? "Expand left panel" : "Collapse left panel"}
      >
        {isCollapsed ? (
          <ChevronDoubleRightIcon className="w-4 h-4" />
        ) : (
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        )}
      </DemoButton>
      <Separator />
      <Panel>right</Panel>
    </Group>
  );
}
