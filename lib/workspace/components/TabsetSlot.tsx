import { ParentGroupContext } from "../../flex/contexts/ParentGroupContext";
import { ParentPanelContext } from "../../flex/contexts/ParentPanelContext";
import { ParentGridContext } from "../../grid/contexts/ParentGridContext";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { TabsetView } from "./TabsetView";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import { TabsetContext } from "../contexts/TabsetContext";
import type { TabsetContextType } from "../contexts/TabsetContext";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import type { TabsetNode } from "../types";
import { useMemo, useState } from "react";

function TabsetSlotComponent({
  isMaximizedOverlay = false,
  tabset
}: {
  isMaximizedOverlay?: boolean;
  tabset: TabsetNode;
}) {
  const {
    getTabsetHandle,
    model,
    outerParents,
    reportChromeSize,
    tabPlacement: defaultTabPlacement
  } = useWorkspaceContext("TabsetSlot");

  const tabPlacement = tabset.tabPlacement ?? defaultTabPlacement;

  const [tabsetElement, setTabsetElement] = useState<HTMLElement | null>(null);
  const [panelsElement, setPanelsElement] = useState<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!tabsetElement || !panelsElement) {
      return;
    }

    const measure = () => {
      const tabsetRect = tabsetElement.getBoundingClientRect();
      const panelsRect = panelsElement.getBoundingClientRect();

      reportChromeSize(tabset.id, {
        height: Math.max(0, tabsetRect.height - panelsRect.height),
        width: Math.max(0, tabsetRect.width - panelsRect.width)
      });
    };

    measure();

    const ResizeObserver =
      tabsetElement.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserver) {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(tabsetElement);
      resizeObserver.observe(panelsElement);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [panelsElement, reportChromeSize, tabset.id, tabsetElement]);

  const context = useMemo<TabsetContextType>(
    () => ({ setPanelsElement, setTabsetElement, tabPlacement, tabset }),
    [tabPlacement, tabset]
  );

  if (!isMaximizedOverlay && model.maximizedTabsetId === tabset.id) {
    return null;
  }

  // Tabsets see the same Grid, Group, and Panel as tab content (the ones outside of the Workspace),
  // rather than the Groups and Panels the Workspace renders internally;
  // they aren't within a tab, even if the Workspace is rendered within another Workspace's tab
  return (
    <ParentGridContext.Provider value={outerParents.grid}>
      <ParentGroupContext.Provider value={outerParents.group}>
        <ParentPanelContext.Provider value={outerParents.panel}>
          <ParentTabContext.Provider value={null}>
            <ParentTabsetContext.Provider value={getTabsetHandle(tabset.id)}>
              <TabsetContext.Provider value={context}>
                <TabsetView />
              </TabsetContext.Provider>
            </ParentTabsetContext.Provider>
          </ParentTabContext.Provider>
        </ParentPanelContext.Provider>
      </ParentGroupContext.Provider>
    </ParentGridContext.Provider>
  );
}

/**
 * Renders a tabset
 * and measures its "chrome" (everything other than its TabPanels), which counts toward its minimum size.
 *
 * ℹ️ A maximized tabset is rendered in an overlay rather than within the layout.
 */
export const TabsetSlot = /* @__PURE__ */ Object.assign(TabsetSlotComponent, {
  displayName: "Workspace.TabsetSlot"
});
