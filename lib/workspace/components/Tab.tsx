"use client";

import { useCallback, useContext, useRef, type KeyboardEvent } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { TabListContext } from "../contexts/TabListContext";
import { closeTab } from "../models/closeTab";
import { expandTabset } from "../models/expandTabset";
import { getReplacementTabId } from "../models/getReplacementTabId";
import { selectTab } from "../models/selectTab";
import { TabCloseButton } from "./TabCloseButton";
import { useDragState } from "../hooks/useDragState";
import type { ParentTabState, TabNode, TabRenderProps } from "../types";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";
import { isFromInteractiveDescendant } from "../utils/isFromInteractiveDescendant";
import { getTabState } from "../utils/getTabState";
import { isRightToLeft } from "../utils/isRightToLeft";
import { resolveElementValue } from "../utils/resolveElementValue";

function TabComponent({ tab: tabProp }: { tab: TabNode }) {
  const workspace = useWorkspaceContext("Tab");
  const {
    classNames,
    disabled,
    dragStore,
    getTabHandle,
    getTabHost,
    modelIndex,
    renderTab,
    requestFocus,
    startTabDrag,
    styles,
    takeFocusRequest,
    updateModel
  } = workspace;
  const {
    isCollapsed,
    tabPlacement,
    tabset: slotTabset
  } = useTabsetContext("Tab");
  const { isOverflowing, orientation } = useContext(TabListContext);

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

  const getArgs = (): [TabNode, ParentTabState] => [
    tab,
    getTabState(workspace, tabset, tab)
  ];
  const className = resolveElementValue(classNames?.tab, getArgs);
  const style = resolveElementValue(styles?.tab, getArgs);

  // Tabs handle touch drags themselves, except that a list that overflows can be scrolled by swiping along it
  // (in which case a tab is dragged by first moving across the list)
  let touchAction = style?.touchAction;
  if (!isDragDisabled) {
    if (isOverflowing) {
      touchAction = orientation === "horizontal" ? "pan-x" : "pan-y";
    } else {
      touchAction = "none";
    }
  }

  // Only the tabs whose drag state changes re-render during a drag (see createDragStore)
  const dropPosition = useDragState(dragStore, ({ dropTarget }) => {
    if (
      dropTarget === undefined ||
      !("index" in dropTarget) ||
      dropTarget.tabsetId !== tabset.id
    ) {
      return undefined;
    } else if (dropTarget.index === index) {
      return "before";
    } else if (
      dropTarget.index === tabset.tabs.length &&
      index === tabset.tabs.length - 1
    ) {
      return "after";
    }

    return undefined;
  });
  const isDragging = useDragState(
    dragStore,
    ({ dragSource }) =>
      dragSource?.type === "tab" && dragSource.tabId === tab.id
  );

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
      if (process.env.NODE_ENV !== "production") {
        warnOnce(
          "The element returned by renderTab must receive its props (including ref); otherwise tabs can't be selected, dragged, or focused"
        );
      }
    } else if (
      !isDragDisabled &&
      // Environments without touch-action support (e.g. jsdom) can't be checked
      "touchAction" in element.style &&
      element.style.touchAction !== touchAction
    ) {
      if (process.env.NODE_ENV !== "production") {
        warnOnce(
          "The element returned by renderTab replaced props.style (rather than merging it, e.g. style={{ ...props.style, padding: 4 }}); tabs can't be dragged by touch without its touch-action"
        );
      }
    }
  }, [isDragDisabled, touchAction]);

  const { panelId, tabElementId } = getTabHost(tab.id);

  // Selecting a tab in a collapsed tabset expands the tabset, if it's collapsed in the model
  // (a maximized tabset is shown expanded, and stays collapsed in the model until it's restored;
  // a tabset that's only collapsed to fit is expanded once it fits, see TabsetNode.collapsible)
  const select = () =>
    isCollapsed && tabset.collapsed
      ? updateModel("expand", true, (prev) =>
          expandTabset(selectTab(prev, tab.id), tabset.id)
        )
      : updateModel("select", true, (prev) => selectTab(prev, tab.id));

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

    // In a right-to-left layout, a horizontal list's next tab is on the left
    let [previousKey, nextKey] =
      orientation === "horizontal"
        ? ["ArrowLeft", "ArrowRight"]
        : ["ArrowUp", "ArrowDown"];
    if (orientation === "horizontal" && isRightToLeft(tabList)) {
      [previousKey, nextKey] = [nextKey, previousKey];
    }

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

          // Focus moves to the tab that will be selected instead (which is in the page's tab order), or to a neighbor
          const focusId = isSelected
            ? getReplacementTabId(tabset, tab.id)
            : (tabset.tabs[index + 1] ?? tabset.tabs[index - 1])?.id;
          if (focusId !== undefined) {
            requestFocus(focusId);
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
    className,
    "data-drop-after": dropPosition === "after" || undefined,
    "data-drop-before": dropPosition === "before" || undefined,
    "data-tab": "",
    "data-tab-dragging": isDragging || undefined,
    "data-tab-id": tab.id,
    "data-tab-placement": tabPlacement,
    "data-tabset-collapsed": isCollapsed || undefined,
    "data-tab-selected": isSelected || undefined,
    id: tabElementId,
    onClick: (event) => {
      if (!isFromInteractiveDescendant(event)) {
        select();
      }
    },
    onKeyDown: (event) => {
      onTabKeyDown(event);
    },
    onPointerDown: (event) => {
      if (
        event.button === 0 &&
        !isDragDisabled &&
        !isFromInteractiveDescendant(event)
      ) {
        startTabDrag(tab.id, event);
      }
    },
    ref: setElement,
    role: "tab",
    style: {
      ...style,

      touchAction,

      // Suppress the long-press menu on iOS, which would interrupt touch drags
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
