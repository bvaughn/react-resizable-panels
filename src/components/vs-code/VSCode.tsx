import { useMemo, useState } from "react";
import { Group, usePanelCallbackRef } from "react-resizable-panels";
import { VSCodeCollapsibleSidePanel } from "./VSCodeCollapsibleSidePanel";
import type { Tab } from "./VSCodeContext";
import { VSCodeContext } from "./VSCodeContext";
import { VSCodePrimaryContentPanel } from "./VSCodePrimaryContentPanel";
import { VSCodeSeparator } from "./VSCodeSeparator";
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
      <Group className="rounded">
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
        <VSCodeSeparator />
        <VSCodePrimaryContentPanel />
      </Group>
    </VSCodeContext>
  );
}
