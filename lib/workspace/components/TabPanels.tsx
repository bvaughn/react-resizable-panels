"use client";

import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../shared/hooks/useMergedRefs";
import { TabContent } from "./TabContent";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";

function TabPanelsComponent() {
  const {
    classNames,
    getHiddenTabBehavior,
    getTabHost,
    isHydrating,
    renderEmptyTabset,
    renderTabContent,
    shouldServerRenderTabContent,
    styles
  } = useWorkspaceContext("TabPanels");
  const { isCollapsed, setPanelsElement, tabPlacement, tabset } =
    useTabsetContext("TabPanels");

  const elementRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(elementRef, setPanelsElement);

  // Move this tabset's tab content into the panels and show only the selected tab's
  // (content isn't rendered into these elements until hydration has finished)
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element && !isHydrating) {
      for (const tab of tabset.tabs) {
        const { element: host } = getTabHost(tab.id);
        if (host) {
          if (host.parentElement !== element) {
            element.appendChild(host);
          }
          host.style.display =
            tab.id === tabset.selectedId ? "contents" : "none";
        }
      }
    }
  });

  // Content opted into server rendering is rendered inline until hydration has finished,
  // within a wrapper that matches the host element it's rendered into afterward (see Workspace)
  const selectedTab = tabset.tabs.find(({ id }) => id === tabset.selectedId);
  const inlineTab =
    isHydrating && selectedTab && shouldServerRenderTabContent(selectedTab)
      ? selectedTab
      : undefined;

  return (
    <div
      className={classNames?.tabPanels}
      data-tab-panels
      data-tab-placement={tabPlacement}
      data-tabset-collapsed={isCollapsed || undefined}
      ref={mergedRef}
      // A collapsed tabset only shows its header; its content stays mounted
      style={{
        position: "relative",
        ...styles?.tabPanels,
        ...(isCollapsed && { display: "none" })
      }}
    >
      {tabset.tabs.length === 0 && renderEmptyTabset?.(tabset)}
      {inlineTab && (
        <div style={{ display: "contents" }}>
          <TabContent
            hiddenTabBehavior={getHiddenTabBehavior(inlineTab)}
            renderTabContent={renderTabContent}
            tab={inlineTab}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Shows the content of a tabset's selected tab.
 *
 * Dragging a tab over the panels splits the tabset (near an edge) or adds the tab to it (in the center);
 * while a tab is dragged over the panels, an element with `data-drop-indicator` and `data-region` attributes shows where it will be dropped
 * (see DropIndicator).
 */
export const TabPanels = /* @__PURE__ */ Object.assign(TabPanelsComponent, {
  displayName: "Workspace.TabPanels"
});
