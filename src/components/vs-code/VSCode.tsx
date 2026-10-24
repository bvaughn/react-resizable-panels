import { useMemo, useState } from "react";
import { usePanelCallbackRef } from "react-resizable-panels";
import { Group } from "../styled-panels/Group";
import { Separator } from "../styled-panels/Separator";
import { VSCodeCollapsibleSidePanel } from "./VSCodeCollapsibleSidePanel";
import type { Tab } from "./VSCodeContext";
import { VSCodeContext } from "./VSCodeContext";
import { VSCodePrimaryContentPanel } from "./VSCodePrimaryContentPanel";
import { VSCodeSidebar } from "./VSCodeSidebar";

export function VSCode() {
  const [panelRef, setPanelRef] = usePanelCallbackRef();

  const [state, setState] = useState<{
    activeTab: Tab;
    sidebarCollapsed: boolean;
  }>({
    activeTab: "folders",
    sidebarCollapsed: false
  });

  const context = useMemo(
    () => ({
      ...state,
      changeTab: (activeTab: Tab) => {
        setState((prev) => ({ ...prev, activeTab }));
      },
      toggleSidebar: () => {
        if (panelRef) {
          if (panelRef.isCollapsed()) {
            panelRef.expand();
          } else {
            panelRef.collapse();
          }
        }
      }
    }),
    [panelRef, state]
  );

  return (
    <VSCodeContext value={context}>
      <Group className="h-72!">
        <VSCodeSidebar />
        <VSCodeCollapsibleSidePanel
          onResize={(size) => {
            const sidebarCollapsed = size.inPixels === 0;
            setState((prev) =>
              prev.sidebarCollapsed === sidebarCollapsed
                ? prev
                : {
                    ...prev,
                    sidebarCollapsed
                  }
            );
          }}
          panelRef={setPanelRef}
        />
        <Separator
          // A collapsed panel has no width, but the gaps on either side of it remain;
          // pull the separator back by one gap so they don't double up
          className={state.sidebarCollapsed ? "-ml-2 sm:-ml-1" : undefined}
        />
        <VSCodePrimaryContentPanel />
      </Group>
    </VSCodeContext>
  );
}
