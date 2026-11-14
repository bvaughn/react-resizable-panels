"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../shared/hooks/useMergedRefs";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";
import type { Orientation } from "../../global/types";
import { TabListContext } from "../contexts/TabListContext";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";
import type { ParentTabsetState, TabsetNode } from "../types";
import { getTabsetState } from "../utils/getTabsetState";
import { isTabsetDragDisabled } from "../utils/isTabsetDragDisabled";
import { resolveElementValue } from "../utils/resolveElementValue";
import { getTabListTabElements } from "../utils/getTabListTabElements";
import { measureTabListFreeSpace } from "../utils/measureTabListFreeSpace";
import { measureTabListOverflow } from "../utils/measureTabListOverflow";
import { scrollTabIntoView } from "../utils/scrollTabIntoView";

function TabListComponent({ children }: { children: ReactNode }) {
  const workspace = useWorkspaceContext("TabList");
  const {
    classNames,
    disabled,
    dragGroup,
    model,
    styles,
    tabListFreeSpaceStore,
    tabListOverflowStore
  } = workspace;
  const { isCollapsed, setTabListElement, tabPlacement, tabset } =
    useTabsetContext("TabList");

  const orientation: Orientation =
    tabPlacement === "left" || tabPlacement === "right"
      ? "vertical"
      : "horizontal";

  const elementRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(elementRef, setTabListElement);

  // Tabs let the list be scrolled by touch while it overflows (see Tab)
  const [isOverflowing, setIsOverflowing] = useState(false);

  // The selected tab is scrolled into view when it's selected (however it's selected, e.g. from an overflow menu, or with the imperative API),
  // and when the list is first rendered (e.g. with a model that was saved while a tab at the end of the list was selected);
  // not when the list is resized or scrolled afterward, which would fight the user scrolling it.
  // A list that has no size when that's attempted (e.g. it's in a hidden container, or content that's moved into a popup after its effects run)
  // can't be scrolled yet, so the scroll is pending until the list is first measured with a size (see the observers below).
  const selectedTabId = tabset.selectedId;
  const selectedTabIdRef = useRef(selectedTabId);
  selectedTabIdRef.current = selectedTabId;
  const isScrollPendingRef = useRef(true);
  const scrollSelectedTabIntoView = useCallback(() => {
    const element = elementRef.current;
    const tabId = selectedTabIdRef.current;
    if (!element || tabId === undefined) {
      isScrollPendingRef.current = false;
      return;
    }

    const tab = getTabListTabElements(element).find(
      (child) => child.dataset.tabId === tabId
    );
    if (!tab || scrollTabIntoView(element, tab)) {
      isScrollPendingRef.current = false;
    }
  }, []);

  // The list overflows (and its free space changes) when it or its tabs change size, or when tabs are added or removed;
  // its free space also changes when the header or its children change size, or when header children are added or removed,
  // and which of its tabs are out of view also changes when it's scrolled
  const tabsetId = tabset.id;
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    // The overflow attributes aren't rendered by React (so updating them while scrolling doesn't re-render the list);
    // only whether the list overflows at all is state, since tabs need it (see Tab)
    const updateOverflow = () => {
      const isVertical = element.dataset.orientation === "vertical";
      // In a right-to-left layout, scrollLeft is 0 at the start (the right) and negative toward the end
      const offset = Math.abs(
        isVertical ? element.scrollTop : element.scrollLeft
      );
      const overflow = isVertical
        ? element.scrollHeight - element.offsetHeight
        : element.scrollWidth - element.offsetWidth;

      element.toggleAttribute("data-overflow-start", offset > 1);
      element.toggleAttribute("data-overflow-end", overflow - offset > 1);

      setIsOverflowing(overflow > 1);
    };

    // Free space is reported synchronously from ResizeObserver and MutationObserver callbacks (which run before the browser paints),
    // so that e.g. a toolbar can move items into an overflow menu without showing them in the wrong place for a frame
    // (Tabs out of view are reported to the store the same way, and also when the list is scrolled)
    const updateTabsOutOfView = () => {
      tabListOverflowStore.set(
        tabsetId,
        measureTabListOverflow(element, tabListOverflowStore.get(tabsetId))
      );
    };

    let lastFreeSpace: number | undefined;
    const update = () => {
      if (isScrollPendingRef.current) {
        scrollSelectedTabIntoView();
      }

      updateOverflow();
      updateTabsOutOfView();

      const freeSpace = measureTabListFreeSpace(element);
      if (freeSpace !== lastFreeSpace) {
        lastFreeSpace = freeSpace;
        element.style.setProperty("--tab-list-free-space", `${freeSpace}px`);
      }
      tabListFreeSpaceStore.set(tabsetId, freeSpace);
    };

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    // The observers are created (and the free space is first measured) after the commit, but before the browser paints:
    // - They come from the window the list is in by then, rather than when this effect runs (e.g. content rendered into a container
    //   that's created by one window and moved into another, like a popup, after its effects run); an observer from another window
    //   isn't notified of changes to the list
    // - Listeners aren't called while React is committing (e.g. a listener that calls flushSync would be warned)
    updateOverflow();
    let isDisposed = false;
    queueMicrotask(() => {
      const window = element.ownerDocument.defaultView;
      if (isDisposed || !window) {
        return;
      }

      // The header (and e.g. its toolbar) is observed too: once the list is 0px wide, the header can shrink (or its toolbar can grow)
      // without the list or its tabs changing size (see measureTabListFreeSpace).
      // The list is always rendered directly within the header (see TabsetView).
      const header = element.parentElement;

      // A header child with "display: contents" (e.g. a toolbar whose items are the header's flex items) has no size of its own,
      // so its children are observed instead (see getLayoutChildren).
      // Whether a child has "display: contents" is only checked when it's observed, so a child that switches (e.g. by a class or media query)
      // isn't observed differently until it's added again.
      const observeHeaderChild = (node: HTMLElement) => {
        if (window.getComputedStyle(node).display === "contents") {
          mutationObserver?.observe(node, { childList: true });
          for (const child of node.children) {
            if (isHTMLElement(child)) {
              observeHeaderChild(child);
            }
          }
        } else {
          resizeObserver?.observe(node);
        }
      };

      // A removed "display: contents" node's descendants are no longer observed either
      // (its own mutation observer target can't be removed, but it no longer changes anything)
      const unobserveTree = (node: HTMLElement) => {
        resizeObserver?.unobserve(node);
        for (const child of node.children) {
          if (isHTMLElement(child)) {
            unobserveTree(child);
          }
        }
      };

      resizeObserver = window.ResizeObserver
        ? new window.ResizeObserver(update)
        : null;
      mutationObserver = window.MutationObserver
        ? new window.MutationObserver((records) => {
            // Elements are detected without "instanceof", which is false for elements created by another window (e.g. a popup's opener)
            for (const record of records) {
              for (const node of record.addedNodes) {
                if (!isHTMLElement(node)) {
                  continue;
                } else if (record.target === element) {
                  resizeObserver?.observe(node);
                } else {
                  observeHeaderChild(node);
                }
              }
              for (const node of record.removedNodes) {
                if (isHTMLElement(node)) {
                  unobserveTree(node);
                }
              }
            }
            update();
          })
        : null;

      resizeObserver?.observe(element);
      for (const child of element.children) {
        resizeObserver?.observe(child);
      }
      mutationObserver?.observe(element, { childList: true });
      if (header) {
        resizeObserver?.observe(header);
        for (const child of header.children) {
          if (isHTMLElement(child) && child !== element) {
            observeHeaderChild(child);
          }
        }
        mutationObserver?.observe(header, { childList: true });
      }

      update();
    });
    // Scroll events are dispatched before the browser paints (but never while React is committing)
    const onScroll = () => {
      updateOverflow();
      updateTabsOutOfView();
    };
    element.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      isDisposed = true;
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      element.removeEventListener("scroll", onScroll);
    };
  }, [
    orientation,
    scrollSelectedTabIntoView,
    tabListFreeSpaceStore,
    tabListOverflowStore,
    tabsetId
  ]);

  // Cleared when the list is removed (e.g. the tabset is closed), rather than when it's measured again (e.g. its orientation changes)
  useIsomorphicLayoutEffect(
    () => tabListFreeSpaceStore.retain(tabsetId),
    [tabListFreeSpaceStore, tabsetId]
  );
  useIsomorphicLayoutEffect(
    () => tabListOverflowStore.retain(tabsetId),
    [tabListOverflowStore, tabsetId]
  );

  useIsomorphicLayoutEffect(() => {
    isScrollPendingRef.current = true;
    scrollSelectedTabIntoView();
  }, [orientation, scrollSelectedTabIntoView, selectedTabId]);

  // The list's empty space drags the tabset (see TabsetView), so it handles touch drags itself like tabs do (see Tab)
  const getArgs = (): [TabsetNode, ParentTabsetState] => [
    tabset,
    getTabsetState(workspace, tabset)
  ];
  const style = resolveElementValue(styles?.tabList, getArgs);

  let touchAction = style?.touchAction;
  if (!isTabsetDragDisabled(model, tabset, disabled, dragGroup)) {
    if (isOverflowing) {
      touchAction = orientation === "horizontal" ? "pan-x" : "pan-y";
    } else {
      touchAction = "none";
    }
  }

  const context = useMemo(
    () => ({ isOverflowing, orientation }),
    [isOverflowing, orientation]
  );

  return (
    <TabListContext.Provider value={context}>
      <div
        aria-orientation={orientation}
        className={resolveElementValue(classNames?.tabList, getArgs)}
        data-orientation={orientation}
        data-tab-list
        data-tab-placement={tabPlacement}
        data-tabset-collapsed={isCollapsed || undefined}
        ref={mergedRef}
        role="tablist"
        style={{ ...style, touchAction }}
      >
        {children}
      </div>
    </TabListContext.Provider>
  );
}

/**
 * Contains the tabs of a tabset.
 * Tabs placed on the left or right are stacked ("vertical").
 *
 * ℹ️ The `data-overflow-start` and `data-overflow-end` attributes are set while the list is scrolled away from its start or end
 * (e.g. to show that there are more tabs beyond the edge).
 *
 * ℹ️ The `--tab-list-free-space` custom property is set to the space the list's tabs don't use (negative once they overflow);
 * see `WorkspaceImperativeHandle.getTabListFreeSpace`.
 *
 * ℹ️ While the list overflows, the selected tab is scrolled into view whenever it's selected (see `useTabListOverflow` for the tabs that are out of view).
 *
 * ℹ️ While the list overflows, it can be scrolled by swiping along it on touch devices;
 * tabs are then dragged by first moving across the list (e.g. downward from tabs placed at the top).
 */
export const TabList = /* @__PURE__ */ Object.assign(TabListComponent, {
  displayName: "Workspace.TabList"
});
