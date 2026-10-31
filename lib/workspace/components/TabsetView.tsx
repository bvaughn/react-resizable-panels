"use client";

import { Tab } from "./Tab";
import { TabList } from "./TabList";
import { TabPanels } from "./TabPanels";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";

function TabsetViewComponent() {
  const {
    activeTabsetId,
    classNames,
    model,
    renderTabsetToolbar,
    setActiveTabsetId,
    styles
  } = useWorkspaceContext("TabsetView");
  const { setTabsetElement, tabPlacement, tabset } =
    useTabsetContext("TabsetView");

  const header = (
    <div
      className={classNames?.header}
      data-tab-placement={tabPlacement}
      data-tabset-header
      style={styles?.header}
    >
      <TabList>
        {tabset.tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} />
        ))}
      </TabList>
      {renderTabsetToolbar && (
        <div
          className={classNames?.toolbar}
          data-tab-placement={tabPlacement}
          data-tabset-toolbar
          style={styles?.toolbar}
        >
          {renderTabsetToolbar(tabset)}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={classNames?.tabset}
      data-tab-placement={tabPlacement}
      data-tabset
      data-tabset-active={activeTabsetId === tabset.id || undefined}
      data-tabset-id={tabset.id}
      data-tabset-maximized={model.maximizedTabsetId === tabset.id || undefined}
      onFocusCapture={() => setActiveTabsetId(tabset.id)}
      onPointerDownCapture={() => setActiveTabsetId(tabset.id)}
      ref={setTabsetElement}
      style={styles?.tabset}
    >
      {tabPlacement === "bottom" || tabPlacement === "right" ? (
        <>
          <TabPanels />
          {header}
        </>
      ) : (
        <>
          {header}
          <TabPanels />
        </>
      )}
    </div>
  );
}

/**
 * Renders a tabset: a header (containing the tab list and toolbar) and the tab panels,
 * ordered by the tabset's placement.
 *
 * ℹ️ Like the rest of the library, this rendering is unstyled.
 */
export const TabsetView = /* @__PURE__ */ Object.assign(TabsetViewComponent, {
  displayName: "Workspace.TabsetView"
});
