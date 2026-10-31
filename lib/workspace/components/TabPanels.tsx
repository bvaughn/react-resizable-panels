"use client";

import { useRef, type CSSProperties } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../shared/hooks/useMergedRefs";
import { TabContent } from "./TabContent";
import type { TabDropRegion } from "../types";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";

// Every region sets all four insets, so that changes between regions can be animated (e.g. "transition: inset 250ms")
const DROP_INDICATOR_STYLES: { [region in TabDropRegion]: CSSProperties } = {
  bottom: { bottom: 0, left: 0, right: 0, top: "50%" },
  center: { bottom: 0, left: 0, right: 0, top: 0 },
  left: { bottom: 0, left: 0, right: "50%", top: 0 },
  right: { bottom: 0, left: "50%", right: 0, top: 0 },
  top: { bottom: "50%", left: 0, right: 0, top: 0 }
};

function TabPanelsComponent() {
  const {
    classNames,
    dropTarget,
    getHiddenTabBehavior,
    getTabHost,
    isHydrating,
    renderEmptyTabset,
    renderTabContent,
    shouldServerRenderTabContent,
    styles
  } = useWorkspaceContext("TabPanels");
  const { setPanelsElement, tabPlacement, tabset } =
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

  const dropRegion =
    dropTarget?.tabsetId === tabset.id && "region" in dropTarget
      ? dropTarget.region
      : undefined;

  return (
    <div
      className={classNames?.tabPanels}
      data-tab-panels
      data-tab-placement={tabPlacement}
      ref={mergedRef}
      style={{ position: "relative", ...styles?.tabPanels }}
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
      {dropRegion && (
        <div
          className={classNames?.dropIndicator}
          data-drop-indicator
          data-region={dropRegion}
          style={{
            ...styles?.dropIndicator,
            ...DROP_INDICATOR_STYLES[dropRegion],
            pointerEvents: "none",
            position: "absolute",
            zIndex: 1
          }}
        />
      )}
    </div>
  );
}

/**
 * Shows the content of a tabset's selected tab.
 *
 * Dragging a tab over the panels splits the tabset (near an edge) or adds the tab to it (in the center);
 * while a tab is dragged over the panels, an element with `data-drop-indicator` and `data-region` attributes shows where it will be dropped.
 */
export const TabPanels = /* @__PURE__ */ Object.assign(TabPanelsComponent, {
  displayName: "Workspace.TabPanels"
});
