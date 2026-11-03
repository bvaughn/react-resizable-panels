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
import type { Orientation } from "../../global/types";
import type { TabsetNode } from "../types";
import { measureChromeSize } from "../utils/measureChromeSize";
import { isTabsetCollapsed } from "../utils/isTabsetCollapsed";
import { measureCollapsedSize } from "../utils/measureCollapsedSize";
import { useMemo, useRef, useState } from "react";

function TabsetSlotComponent({
  isMaximizedOverlay = false,
  tabset
}: {
  isMaximizedOverlay?: boolean;
  tabset: TabsetNode;
}) {
  const {
    collapseOverrides,
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
    !isMaximizedOverlay && isTabsetCollapsed(tabset, collapseOverrides);
  // While its split is being resized, the tabset is previewed (see SplitView) and isn't measured, since its split's constraints shouldn't change during a resize;
  // a tabset that's collapsed to fit is measured (its collapsed size changes, but it stays collapsed)
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

  // The collapsed size measured while the tabset was collapsed (see below)
  const measuredCollapsedSizeRef = useRef<{
    orientation: Orientation;
    size: number;
  } | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!tabsetElement || !panelsElement) {
      return;
    }

    const measure = () => {
      if (isPreviewed) {
        return;
      }

      // A collapsed tabset's panels are hidden, so its chrome is measured while it's expanded;
      // not while its panels have no size along its split, though (e.g. its Group squeezed it to its collapsed size, just before it's shown collapsed to fit),
      // since they can't shrink any further, so the measurement would be the size of the whole tabset
      if (!isCollapsed) {
        const panelsRect = panelsElement.getBoundingClientRect();
        const isSqueezed =
          orientation === "horizontal"
            ? panelsRect.width <= 0
            : orientation === "vertical"
              ? panelsRect.height <= 0
              : panelsRect.width <= 0 || panelsRect.height <= 0;
        if (!isSqueezed) {
          reportChromeSize(
            tabset.id,
            measureChromeSize(tabsetElement, panelsElement)
          );
        }
      }

      // While the tabset is expanded, its collapsed size is an estimate (see measureCollapsedSize),
      // so it doesn't replace a size measured while it was collapsed (which would change its Group's constraints each time it's collapsed or expanded,
      // e.g. as it's collapsed to fit; see TabsetNode.collapsible)
      if (headerElement && collapsedOrientation) {
        const size = measureCollapsedSize(
          tabsetElement,
          headerElement,
          collapsedOrientation
        );
        const measured = measuredCollapsedSizeRef.current;
        if (isCollapsed) {
          measuredCollapsedSizeRef.current = {
            orientation: collapsedOrientation,
            size
          };
          reportCollapsedSize(tabset.id, size);
        } else if (measured?.orientation !== collapsedOrientation) {
          reportCollapsedSize(tabset.id, size);
        }
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
    orientation,
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
