"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import type { Orientation } from "../../global/types";
import { TabListContext } from "../contexts/TabListContext";
import {
  useTabsetContext,
  useWorkspaceContext
} from "../hooks/useWorkspaceContext";

function TabListComponent({ children }: { children: ReactNode }) {
  const { classNames, styles } = useWorkspaceContext("TabList");
  const { tabPlacement } = useTabsetContext("TabList");

  const orientation: Orientation =
    tabPlacement === "left" || tabPlacement === "right"
      ? "vertical"
      : "horizontal";

  const elementRef = useRef<HTMLDivElement | null>(null);

  // Tabs let the list be scrolled by touch while it overflows (see Tab)
  const [isOverflowing, setIsOverflowing] = useState(false);

  // The list overflows when it or its tabs change size, or when tabs are added or removed
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    const window = element?.ownerDocument.defaultView;
    if (!element || !window) {
      return;
    }

    // The overflow attributes aren't rendered by React (so updating them while scrolling doesn't re-render the list);
    // only whether the list overflows at all is state, since tabs need it (see Tab)
    const update = () => {
      const isVertical = element.dataset.orientation === "vertical";
      const offset = isVertical ? element.scrollTop : element.scrollLeft;
      const overflow = isVertical
        ? element.scrollHeight - element.offsetHeight
        : element.scrollWidth - element.offsetWidth;

      element.toggleAttribute("data-overflow-start", offset > 1);
      element.toggleAttribute("data-overflow-end", overflow - offset > 1);

      setIsOverflowing(overflow > 1);
    };

    const resizeObserver = window.ResizeObserver
      ? new window.ResizeObserver(update)
      : null;
    resizeObserver?.observe(element);
    for (const child of element.children) {
      resizeObserver?.observe(child);
    }

    const mutationObserver = window.MutationObserver
      ? new window.MutationObserver((records) => {
          for (const record of records) {
            for (const node of record.addedNodes) {
              if (node instanceof window.Element) {
                resizeObserver?.observe(node);
              }
            }
            for (const node of record.removedNodes) {
              if (node instanceof window.Element) {
                resizeObserver?.unobserve(node);
              }
            }
          }
          update();
        })
      : null;
    mutationObserver?.observe(element, { childList: true });

    update();
    element.addEventListener("scroll", update, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [orientation]);

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
        ref={elementRef}
        role="tablist"
        style={styles?.tabList}
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
 * ℹ️ While the list overflows, it can be scrolled by swiping along it on touch devices;
 * tabs are then dragged by first moving across the list (e.g. downward from tabs placed at the top).
 */
export const TabList = /* @__PURE__ */ Object.assign(TabListComponent, {
  displayName: "Workspace.TabList"
});
