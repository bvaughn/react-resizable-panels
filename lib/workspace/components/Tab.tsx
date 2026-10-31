"use client";

import { useCallback, useContext, useRef, type KeyboardEvent } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { TabListContext } from "../contexts/TabListContext";
import { closeTab } from "../models/closeTab";
import { selectTab } from "../models/selectTab";
import { TabCloseButton } from "./TabCloseButton";
import type { TabNode, TabRenderProps } from "../types";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";
import { isFromInteractiveDescendant } from "../utils/isFromInteractiveDescendant";

function TabComponent({ tab: tabProp }: { tab: TabNode }) {
  const {
    classNames,
    disabled,
    dragTabId,
    dropTarget,
    getTabHandle,
    getTabHost,
    modelIndex,
    renderTab,
    requestFocus,
    startTabDrag,
    styles,
    takeFocusRequest,
    updateModel
  } = useWorkspaceContext("Tab");
  const { tabPlacement, tabset: slotTabset } = useTabsetContext("Tab");
  const orientation = useContext(TabListContext);

  const elementRef = useRef<HTMLElement | null>(null);
  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  const tabset = modelIndex.tabsetsByTabId.get(tabProp.id) ?? slotTabset;
  const index = tabset.tabs.findIndex(({ id }) => id === tabProp.id);
  const tab = tabset.tabs[index] ?? tabProp;

  const isSelected = tabset.selectedId === tab.id;
  const isCloseDisabled = disabled || !!tab.disableClose;
  const isDragDisabled = disabled || !!tab.disableDrag;

  const isDropTargetList =
    dropTarget !== undefined &&
    "index" in dropTarget &&
    dropTarget.tabsetId === tabset.id;
  const isDropBefore = isDropTargetList && dropTarget.index === index;
  const isDropAfter =
    isDropTargetList &&
    dropTarget.index === tabset.tabs.length &&
    index === tabset.tabs.length - 1;

  // Restore focus after a keyboard interaction re-renders the tab (e.g. closing its neighbor)
  useIsomorphicLayoutEffect(() => {
    if (takeFocusRequest(tab.id)) {
      elementRef.current?.focus();
    }
  });

  // Catch common mistakes when spreading the props passed to renderTab
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      warnOnce(
        "The element returned by renderTab must receive its props (including ref); otherwise tabs can't be selected, dragged, or focused"
      );
    } else if (
      !isDragDisabled &&
      // Environments without touch-action support (e.g. jsdom) can't be checked
      "touchAction" in element.style &&
      element.style.touchAction !== "none"
    ) {
      warnOnce(
        "The element returned by renderTab replaced props.style (rather than merging it, e.g. style={{ ...props.style, padding: 4 }}); tabs can't be dragged by touch without its touch-action"
      );
    }
  }, [isDragDisabled]);

  const { panelId, tabElementId } = getTabHost(tab.id);

  const select = () =>
    updateModel("select", true, (prev) => selectTab(prev, tab.id));

  const onTabKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    const tabList = event.currentTarget.closest("[data-tab-list]");
    const tabElements = tabList
      ? Array.from(tabList.querySelectorAll<HTMLElement>("[data-tab]")).filter(
          (element) => element.closest("[data-tab-list]") === tabList
        )
      : [];
    const currentIndex = tabElements.indexOf(event.currentTarget);

    const focusAt = (nextIndex: number) => {
      event.preventDefault();
      tabElements[
        (nextIndex + tabElements.length) % tabElements.length
      ]?.focus();
    };

    const previousKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";

    switch (event.key) {
      case previousKey: {
        focusAt(currentIndex - 1);
        break;
      }
      case nextKey: {
        focusAt(currentIndex + 1);
        break;
      }
      case "Home": {
        focusAt(0);
        break;
      }
      case "End": {
        focusAt(tabElements.length - 1);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        select();
        break;
      }
      case "Backspace":
      case "Delete": {
        if (!isCloseDisabled) {
          event.preventDefault();

          const neighbor = tabset.tabs[index + 1] ?? tabset.tabs[index - 1];
          if (neighbor) {
            requestFocus(neighbor.id);
          }

          updateModel("close", true, (prev) => closeTab(prev, tab.id));
        }
        break;
      }
    }
  };

  const props: TabRenderProps = {
    "aria-controls": panelId,
    "aria-selected": isSelected,
    className: classNames?.tab,
    "data-drop-after": isDropAfter || undefined,
    "data-drop-before": isDropBefore || undefined,
    "data-tab": "",
    "data-tab-dragging": dragTabId === tab.id || undefined,
    "data-tab-id": tab.id,
    "data-tab-placement": tabPlacement,
    "data-tab-selected": isSelected || undefined,
    id: tabElementId,
    onClick: (event) => {
      if (!isFromInteractiveDescendant(event)) {
        select();
      }
    },
    onKeyDown: (event) => {
      if (!isFromInteractiveDescendant(event)) {
        onTabKeyDown(event);
      }
    },
    onPointerDown: (event) => {
      if (
        event.button === 0 &&
        !isDragDisabled &&
        !isFromInteractiveDescendant(event)
      ) {
        startTabDrag(tab, event);
      }
    },
    ref: setElement,
    role: "tab",
    style: {
      ...styles?.tab,

      // Tabs handle touch drags themselves (and suppress the long-press menu on iOS)
      touchAction: isDragDisabled ? styles?.tab?.touchAction : "none",
      WebkitTouchCallout: "none"
    },
    // Only the selected tab is in the page's tab order; arrow keys move focus between tabs
    tabIndex: isSelected ? 0 : -1
  };

  return (
    <ParentTabContext.Provider value={getTabHandle(tab.id)}>
      {renderTab ? (
        renderTab(tab, props)
      ) : (
        <div {...props}>
          {tab.title ?? tab.id}
          <TabCloseButton />
        </div>
      )}
    </ParentTabContext.Provider>
  );
}

/**
 * Renders a tab using the Workspace's `renderTab` prop (or the default rendering),
 * passing it the props that make an element a tab.
 *
 * Keyboard support follows the [ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) (with manual activation):
 * - Arrow keys move focus between tabs (wrapping at the ends); Home and End move focus to the first and last tabs
 * - Enter or Space selects the focused tab
 * - Delete or Backspace closes the focused tab (unless closing is disabled)
 */
export const Tab = /* @__PURE__ */ Object.assign(TabComponent, {
  displayName: "Workspace.Tab"
});
