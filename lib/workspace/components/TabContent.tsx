import * as React from "react";
import { type ComponentType, type ReactNode } from "react";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import type { HiddenTabBehavior, TabNode } from "../types";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import { MemoizedContent } from "./MemoizedContent";

type ActivityType = ComponentType<{
  children: ReactNode;
  mode: "hidden" | "visible";
}>;

function TabContentComponent({
  hiddenTabBehavior,
  renderTabContent,
  tab
}: {
  hiddenTabBehavior: HiddenTabBehavior;
  renderTabContent: (tab: TabNode) => ReactNode;
  tab: TabNode;
}) {
  const {
    classNames,
    getTabHandle,
    getTabHost,
    getTabsetHandle,
    modelIndex,
    styles
  } = useWorkspaceContext("TabContent");

  const tabset = modelIndex.tabsetsByTabId.get(tab.id);
  if (!tabset) {
    return null;
  }

  const isSelected = tabset.selectedId === tab.id;

  let content: ReactNode = null;
  if (hiddenTabBehavior !== "unmount" || isSelected) {
    content = <MemoizedContent render={renderTabContent} tab={tab} />;

    if (hiddenTabBehavior === "activity") {
      // Read from the namespace (rather than imported by name) since Activity requires React 19.2
      const Activity = (React as unknown as { Activity?: ActivityType })
        .Activity;
      if (Activity) {
        content = (
          <Activity mode={isSelected ? "visible" : "hidden"}>
            {content}
          </Activity>
        );
      } else {
        warnOnce(
          'hiddenTabBehavior "activity" requires React 19.2 or newer; falling back to "keep-mounted"'
        );
      }
    }
  }

  const { panelId, tabElementId } = getTabHost(tab.id);

  return (
    <div
      aria-labelledby={tabElementId}
      className={classNames?.tabContent}
      data-tab-content=""
      id={panelId}
      role="tabpanel"
      style={styles?.tabContent}
    >
      <ParentTabsetContext.Provider value={getTabsetHandle(tabset.id)}>
        <ParentTabContext.Provider value={getTabHandle(tab.id)}>
          {content}
        </ParentTabContext.Provider>
      </ParentTabsetContext.Provider>
    </div>
  );
}

/**
 * Content of a tab, within its tab panel element (`data-tab-content`).
 *
 * ℹ️ This is rendered (via a portal) into a host element that is moved into whichever TabPanels shows the tab;
 * the panel element is rendered by React (rather than being the host itself) so that `classNames.tabContent` and `styles.tabContent` are applied like any other element's.
 */
export const TabContent = /* @__PURE__ */ Object.assign(TabContentComponent, {
  displayName: "Workspace.TabContent"
});
