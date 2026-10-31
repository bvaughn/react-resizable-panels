"use client";

import { useContext } from "react";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { WorkspaceContext } from "../contexts/WorkspaceContext";
import { closeTab } from "../models/closeTab";
import type { TabCloseButtonProps } from "../types";
import { useParentTabState } from "../hooks/useParentTabState";

function TabCloseButtonComponent({
  "aria-label": ariaLabel,
  children = "×",
  onClick,
  ...rest
}: TabCloseButtonProps) {
  const workspace = useContext(WorkspaceContext);
  const parentTab = useContext(ParentTabContext);
  const tabState = useParentTabState();

  if (!workspace || !parentTab) {
    warnOnce("TabCloseButton must be rendered within a tab (see renderTab)");
  } else if (tabState?.isCloseDisabled) {
    return null;
  }

  const tab = parentTab
    ? workspace?.modelIndex.tabsetsByTabId
        .get(parentTab.id)
        ?.tabs.find(({ id }) => id === parentTab.id)
    : undefined;

  return (
    <button
      aria-label={ariaLabel ?? `Close ${tab?.title ?? tab?.id ?? "tab"}`}
      // Tabs shouldn't contain focusable content; the tab itself can be closed with Delete or Backspace
      tabIndex={-1}
      type="button"
      {...rest}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented && workspace && parentTab) {
          workspace.updateModel("close", true, (prev) =>
            closeTab(prev, parentTab.id)
          );
        }
      }}
    >
      {children}
    </button>
  );
}

/**
 * Closes the tab it is rendered within; render it within the element returned by the Workspace's `renderTab` prop:
 *
 * ```tsx
 * renderTab={(tab, props) => (
 *   <div {...props}>
 *     {tab.title}
 *     <TabCloseButton />
 *   </div>
 * )}
 * ```
 *
 * The button renders nothing if closing is disabled (by the tab's `disableClose` flag or the Workspace's `disabled` prop).
 * Its default `aria-label` is "Close" followed by the tab's title (or id).
 *
 * To keep the tab open (e.g. to confirm unsaved changes first), call `event.preventDefault()` in an `onClick` handler:
 *
 * ```tsx
 * <TabCloseButton
 *   onClick={(event) => {
 *     if (hasUnsavedChanges && !confirm("Discard unsaved changes?")) {
 *       event.preventDefault();
 *     }
 *   }}
 * />
 * ```
 *
 * ℹ️ This button is not focusable by default (`tabIndex={-1}`), since tabs shouldn't contain focusable content;
 * keyboard users can close the focused tab with Delete or Backspace.
 */
export const TabCloseButton = /* @__PURE__ */ Object.assign(
  TabCloseButtonComponent,
  {
    displayName: "TabCloseButton"
  }
);
