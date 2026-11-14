"use client";

import { Tab } from "./Tab";
import { TabList } from "./TabList";
import { TabPanels } from "./TabPanels";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";
import { useDragState } from "../hooks/useDragState";
import { expandTabset } from "../models/expandTabset";
import type { ParentTabsetState, TabsetNode } from "../types";
import { getTabsetState } from "../utils/getTabsetState";
import { isHeaderEmptySpace } from "../utils/isHeaderEmptySpace";
import { resolveElementValue } from "../utils/resolveElementValue";
import { isTabsetDragDisabled } from "../utils/isTabsetDragDisabled";
import { isTabsetDragStart } from "../utils/isTabsetDragStart";

function TabsetViewComponent() {
  const workspace = useWorkspaceContext("TabsetView");
  const {
    activeTabsetId,
    classNames,
    disabled,
    dragGroup,
    dragStore,
    model,
    modelIndex,
    renderTabsetToolbar,
    setActiveTabsetId,
    startFloatingGesture,
    startTabsetDrag,
    styles,
    updateModel
  } = workspace;
  const {
    isCollapsed,
    setHeaderElement,
    setTabsetElement,
    tabPlacement,
    tabset
  } = useTabsetContext("TabsetView");

  const isDragging = useDragState(
    dragStore,
    ({ dragSource }) =>
      dragSource?.type === "tabset" && dragSource.tabsetId === tabset.id
  );

  const isFloating = modelIndex.floatingTabsetIds.has(tabset.id);

  // Dragging a floating tabset moves it, rather than dropping it elsewhere (see isTabsetDragDisabled)
  const isDragDisabled = isTabsetDragDisabled(
    model,
    tabset,
    disabled,
    dragGroup
  );

  // Computed once (and only if one of the classNames or styles is a function) for all of the tabset's elements
  let state: ParentTabsetState | undefined;
  const getArgs = (): [TabsetNode, ParentTabsetState] => {
    state ??= getTabsetState(workspace, tabset);

    return [tabset, state];
  };

  const header = (
    <div
      className={resolveElementValue(classNames?.header, getArgs)}
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
          if (isFloating) {
            startFloatingGesture(tabset.id, "move", event);
          } else {
            startTabsetDrag(tabset.id, event);
          }
        }
      }}
      ref={setHeaderElement}
      style={resolveElementValue(styles?.header, getArgs)}
    >
      <TabList>
        {tabset.tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} />
        ))}
      </TabList>
      {renderTabsetToolbar && (
        <div
          className={resolveElementValue(classNames?.toolbar, getArgs)}
          data-tab-placement={tabPlacement}
          data-tabset-collapsed={isCollapsed || undefined}
          data-tabset-toolbar
          style={resolveElementValue(styles?.toolbar, getArgs)}
        >
          {renderTabsetToolbar(tabset)}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={resolveElementValue(classNames?.tabset, getArgs)}
      data-tab-placement={tabPlacement}
      data-tabset
      data-tabset-active={activeTabsetId === tabset.id || undefined}
      data-tabset-collapsed={isCollapsed || undefined}
      data-tabset-dragging={isDragging || undefined}
      data-tabset-floating={isFloating || undefined}
      data-tabset-id={tabset.id}
      data-tabset-maximized={model.maximizedTabsetId === tabset.id || undefined}
      onFocusCapture={() => setActiveTabsetId(tabset.id)}
      onPointerDownCapture={() => setActiveTabsetId(tabset.id)}
      ref={setTabsetElement}
      style={resolveElementValue(styles?.tabset, getArgs)}
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
