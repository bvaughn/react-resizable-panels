import * as React from "react";
import { useState, type ComponentType, type ReactNode } from "react";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import type { HiddenTabBehavior, ParentTabState, TabNode } from "../types";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import { getTabState } from "../utils/getTabState";
import { resolveElementValue } from "../utils/resolveElementValue";
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
  const workspace = useWorkspaceContext("TabContent");
  const {
    classNames,
    getTabHandle,
    getTabHost,
    getTabsetHandle,
    modelIndex,
    styles
  } = workspace;

  const tabset = modelIndex.tabsetsByTabId.get(tab.id);
  const tabState = tabset ? getTabState(workspace, tabset, tab) : undefined;
  const isSelected = tabState?.isSelected === true;
  const isVisible = tabState?.isVisible === true;

  // Whether the tab has been visible since its content was first rendered (by this workspace), for "mount-on-show";
  // a selected tab isn't visible while its tabset is collapsed or covered by a maximized tabset (see getTabState).
  // This is tracked for every behavior, so a tab that has been shown mounts right away if its behavior becomes "mount-on-show" (intended).
  // It's updated while rendering (rather than in an effect) so that the content mounts in the same render the tab is first shown
  const [hasBeenVisible, setHasBeenVisible] = useState(isVisible);
  if (isVisible && !hasBeenVisible) {
    setHasBeenVisible(true);
  }

  if (!tabset || !tabState) {
    return null;
  }

  const getArgs = (): [TabNode, ParentTabState] => [tab, tabState];

  let content: ReactNode = null;
  if (
    hiddenTabBehavior === "mount-on-show"
      ? hasBeenVisible
      : isSelected || hiddenTabBehavior !== "unmount"
  ) {
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
        if (process.env.NODE_ENV !== "production") {
          warnOnce(
            'hiddenTabBehavior "activity" requires React 19.2 or newer; falling back to "keep-mounted"'
          );
        }
      }
    }
  }

  const { panelId, tabElementId } = getTabHost(tab.id);

  return (
    <div
      aria-labelledby={tabElementId}
      className={resolveElementValue(classNames?.tabContent, getArgs)}
      data-tab-content=""
      id={panelId}
      role="tabpanel"
      style={resolveElementValue(styles?.tabContent, getArgs)}
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
