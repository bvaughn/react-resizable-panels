"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";
import type { Orientation } from "../../global/types";
import { TabListContext } from "../contexts/TabListContext";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";
import { isTabsetDragDisabled } from "../utils/isTabsetDragDisabled";
import { measureTabListFreeSpace } from "../utils/measureTabListFreeSpace";

function TabListComponent({ children }: { children: ReactNode }) {
  const { classNames, disabled, model, styles, tabListFreeSpaceStore } =
    useWorkspaceContext("TabList");
  const { isCollapsed, tabPlacement, tabset } = useTabsetContext("TabList");

  const orientation: Orientation =
    tabPlacement === "left" || tabPlacement === "right"
      ? "vertical"
      : "horizontal";

  const elementRef = useRef<HTMLDivElement | null>(null);

  // Tabs let the list be scrolled by touch while it overflows (see Tab)
  const [isOverflowing, setIsOverflowing] = useState(false);

  // The list overflows (and its free space changes) when it or its tabs change size, or when tabs are added or removed;
  // its free space also changes when the header or its children change size, or when header children are added or removed
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
    let lastFreeSpace: number | undefined;
    const update = () => {
      updateOverflow();

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
    element.addEventListener("scroll", updateOverflow, { passive: true });

    return () => {
      isDisposed = true;
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      element.removeEventListener("scroll", updateOverflow);
    };
  }, [orientation, tabListFreeSpaceStore, tabsetId]);

  // Cleared when the list is removed (e.g. the tabset is closed), rather than when it's measured again (e.g. its orientation changes)
  useIsomorphicLayoutEffect(
    () => tabListFreeSpaceStore.retain(tabsetId),
    [tabListFreeSpaceStore, tabsetId]
  );

  // The list's empty space drags the tabset (see TabsetView), so it handles touch drags itself like tabs do (see Tab)
  let touchAction = styles?.tabList?.touchAction;
  if (!isTabsetDragDisabled(model, tabset, disabled)) {
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
        className={classNames?.tabList}
        data-orientation={orientation}
        data-tab-list
        data-tab-placement={tabPlacement}
        data-tabset-collapsed={isCollapsed || undefined}
        ref={elementRef}
        role="tablist"
        style={{ ...styles?.tabList, touchAction }}
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
 * ℹ️ While the list overflows, it can be scrolled by swiping along it on touch devices;
 * tabs are then dragged by first moving across the list (e.g. downward from tabs placed at the top).
 */
export const TabList = /* @__PURE__ */ Object.assign(TabListComponent, {
  displayName: "Workspace.TabList"
});
