"use client";

import { Tab } from "./Tab";
import { TabList } from "./TabList";
import { TabPanels } from "./TabPanels";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";
import { expandTabset } from "../models/expandTabset";
import { isHeaderEmptySpace } from "../utils/isHeaderEmptySpace";
import { isTabsetDragDisabled } from "../utils/isTabsetDragDisabled";
import { isTabsetDragStart } from "../utils/isTabsetDragStart";

function TabsetViewComponent() {
  const {
    activeTabsetId,
    classNames,
    disabled,
    dragGroup,
    dragTabsetId,
    model,
    renderTabsetToolbar,
    setActiveTabsetId,
    startTabsetDrag,
    styles,
    updateModel
  } = useWorkspaceContext("TabsetView");
  const {
    isCollapsed,
    setHeaderElement,
    setTabsetElement,
    tabPlacement,
    tabset
  } = useTabsetContext("TabsetView");

  const isDragDisabled = isTabsetDragDisabled(
    model,
    tabset,
    disabled,
    dragGroup
  );

  const header = (
    <div
      className={classNames?.header}
      data-tab-placement={tabPlacement}
      data-tabset-collapsed={isCollapsed || undefined}
      data-tabset-header
      // Clicking the empty space in a collapsed tabset's header (its own element or its tab list's) expands it;
      // a click after the header is dragged isn't dispatched (see useTabDrag)
      onClick={(event) => {
        if (
          isCollapsed &&
          isHeaderEmptySpace(event.currentTarget, event.target as Element)
        ) {
          updateModel("expand", true, (prev) => expandTabset(prev, tabset.id));
        }
      }}
      onPointerDown={(event) => {
        if (
          event.button === 0 &&
          !isDragDisabled &&
          isTabsetDragStart(event.currentTarget, event.target as Element)
        ) {
          startTabsetDrag(tabset.id, event);
        }
      }}
      ref={setHeaderElement}
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
          data-tabset-collapsed={isCollapsed || undefined}
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
      data-tabset-collapsed={isCollapsed || undefined}
      data-tabset-dragging={dragTabsetId === tabset.id || undefined}
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
