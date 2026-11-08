"use client";

import { useContext } from "react";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { WorkspaceStoreContext } from "../contexts/WorkspaceStoreContext";
import { closeTab } from "../models/closeTab";
import type { TabCloseButtonProps } from "../types";
import { resolveStatefulProps } from "../utils/resolveStatefulProps";
import { useParentTabState } from "../hooks/useParentTabState";
import { useWorkspaceStoreSelector } from "../hooks/useWorkspaceStoreSelector";

function TabCloseButtonComponent({
  "aria-label": ariaLabel,
  children = "×",
  className,
  onClick,
  style,
  title,
  ...rest
}: TabCloseButtonProps) {
  // Read from the store (rather than WorkspaceContext), so that the button only re-renders when its tab's state (or title) changes
  const store = useContext(WorkspaceStoreContext);
  const parentTab = useContext(ParentTabContext);
  const tabState = useParentTabState();
  const tabId = parentTab?.id;
  const tabLabel = useWorkspaceStoreSelector(({ modelIndex }) => {
    const tab =
      tabId !== undefined ? modelIndex.tabsById.get(tabId) : undefined;

    return tab ? { title: tab.title ?? tab.id } : null;
  });

  if (!store || !parentTab) {
    if (process.env.NODE_ENV !== "production") {
      warnOnce("TabCloseButton must be rendered within a tab (see renderTab)");
    }
  } else if (tabState?.isCloseDisabled) {
    return null;
  }

  const tabTitle = tabLabel?.title ?? "tab";
  const resolved = resolveStatefulProps(
    { children, className, style, title },
    { tabTitle }
  );

  return (
    <button
      aria-label={ariaLabel ?? `Close ${tabTitle}`}
      // Tabs shouldn't contain focusable content; the tab itself can be closed with Delete or Backspace
      tabIndex={-1}
      type="button"
      {...rest}
      className={resolved.className}
      style={resolved.style}
      title={resolved.title}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented && store && parentTab) {
          store.updateModel("close", true, (prev) =>
            closeTab(prev, parentTab.id)
          );
        }
      }}
    >
      {resolved.children}
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
 *     <TabCloseButton>×</TabCloseButton>
 *   </div>
 * )}
 * ```
 *
 * The button renders nothing if closing is disabled (by the tab's `disableClose` flag or the Workspace's `disabled` prop).
 * Its content defaults to "×" (e.g. it can be replaced with an icon),
 * and its default `aria-label` is "Close" followed by the tab's title (or id).
 *
 * Its `children`, `className`, `style`, and `title` can also be functions of its state (see `TabCloseButtonState`):
 *
 * ```tsx
 * <TabCloseButton title={({ tabTitle }) => `Close ${tabTitle}`} />
 * ```
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
