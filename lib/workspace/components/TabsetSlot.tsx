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
import { measureChromeSize } from "../utils/measureChromeSize";
import { isTabsetCollapsed } from "../utils/isTabsetCollapsed";
import { measureCollapsedSize } from "../utils/measureCollapsedSize";
import { useMemo, useState } from "react";

function TabsetSlotComponent({
  isMaximizedOverlay = false,
  tabset
}: {
  isMaximizedOverlay?: boolean;
  tabset: TabsetNode;
}) {
  const {
    collapsePreview,
    getTabsetHandle,
    model,
    modelIndex,
    outerParents,
    reportChromeSize,
    reportCollapsedSize,
    tabPlacement: defaultTabPlacement
  } = useWorkspaceContext("TabsetSlot");

  const parent = modelIndex.parentsById.get(tabset.id);
  const orientation = parent?.orientation;
  const isCollapsed =
    !isMaximizedOverlay && isTabsetCollapsed(tabset, collapsePreview);
  // While previewed (see isTabsetCollapsed), the tabset isn't measured, since its split's constraints shouldn't change during a resize
  const isPreviewed = collapsePreview[tabset.id] !== undefined;

  // While collapsed, the header runs along the split (e.g. a tabset in a horizontal split collapses to a vertical strip),
  // on the side facing the rest of the split
  let tabPlacement = tabset.tabPlacement ?? defaultTabPlacement;
  if (isCollapsed && parent) {
    const isLast =
      parent.children[parent.children.length - 1]?.id === tabset.id;
    const isHeaderVertical =
      tabPlacement === "left" || tabPlacement === "right";
    if (orientation === "horizontal" && !isHeaderVertical) {
      tabPlacement = isLast ? "right" : "left";
    } else if (orientation === "vertical" && isHeaderVertical) {
      tabPlacement = isLast ? "bottom" : "top";
    }
  }

  const [tabsetElement, setTabsetElement] = useState<HTMLElement | null>(null);
  const [headerElement, setHeaderElement] = useState<HTMLElement | null>(null);
  const [panelsElement, setPanelsElement] = useState<HTMLElement | null>(null);

  // Only collapsible tabsets (within splits) are measured for their collapsed size
  const collapsedOrientation =
    tabset.collapsible && !isMaximizedOverlay ? orientation : undefined;

  useIsomorphicLayoutEffect(() => {
    if (!tabsetElement || !panelsElement) {
      return;
    }

    const measure = () => {
      if (isPreviewed) {
        return;
      }

      // A collapsed tabset's panels are hidden, so its chrome is measured while it's expanded
      if (!isCollapsed) {
        reportChromeSize(
          tabset.id,
          measureChromeSize(tabsetElement, panelsElement)
        );
      }

      if (headerElement && collapsedOrientation) {
        reportCollapsedSize(
          tabset.id,
          measureCollapsedSize(
            tabsetElement,
            headerElement,
            collapsedOrientation
          )
        );
      }
    };

    measure();

    const ResizeObserver =
      tabsetElement.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserver) {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(tabsetElement);
      resizeObserver.observe(panelsElement);
      if (headerElement) {
        resizeObserver.observe(headerElement);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [
    collapsedOrientation,
    headerElement,
    isCollapsed,
    isPreviewed,
    panelsElement,
    reportChromeSize,
    reportCollapsedSize,
    tabPlacement,
    tabset.id,
    tabsetElement
  ]);

  const context = useMemo<TabsetContextType>(
    () => ({
      isCollapsed,
      setHeaderElement,
      setPanelsElement,
      setTabsetElement,
      tabPlacement,
      tabset
    }),
    [isCollapsed, tabPlacement, tabset]
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
