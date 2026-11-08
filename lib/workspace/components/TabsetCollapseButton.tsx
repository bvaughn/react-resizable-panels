"use client";

import { useContext } from "react";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import { WorkspaceStoreContext } from "../contexts/WorkspaceStoreContext";
import { useParentTabsetState } from "../hooks/useParentTabsetState";
import { collapseTabset } from "../models/collapseTabset";
import { expandTabset } from "../models/expandTabset";
import type { TabsetCollapseButtonProps } from "../types";
import { resolveStatefulProps } from "../utils/resolveStatefulProps";

function TabsetCollapseButtonComponent({
  "aria-label": ariaLabel = "Collapse tabset",
  children,
  className,
  onClick,
  style,
  title,
  ...rest
}: TabsetCollapseButtonProps) {
  // Read from the store (rather than WorkspaceContext), so that the button only re-renders when its tabset's state changes
  const store = useContext(WorkspaceStoreContext);
  const parentTabset = useContext(ParentTabsetContext);
  const tabsetState = useParentTabsetState();

  if (!store || !parentTabset) {
    if (process.env.NODE_ENV !== "production") {
      warnOnce(
        "TabsetCollapseButton must be rendered within a tabset (see renderTabsetToolbar)"
      );
    }
  }

  // A maximized tabset is shown expanded (even if it's collapsed), and stays that way until it's restored
  if (!tabsetState?.isCollapsible || tabsetState.isMaximized) {
    return null;
  }

  const { isCollapsed, isCollapsedToFit, selectedTabId } = tabsetState;
  const resolved = resolveStatefulProps(
    { children, className, style, title },
    { isCollapsed, isCollapsedToFit }
  );

  return (
    <button
      // The selected tab's panel is what the button shows or hides (an empty tabset has none)
      aria-controls={
        store && selectedTabId !== undefined
          ? store.getTabPanelId(selectedTabId)
          : undefined
      }
      // Disabled with an attribute (rather than the "disabled" property), so that it stays focusable (e.g. so that its state can be read)
      aria-disabled={isCollapsedToFit || undefined}
      aria-expanded={!isCollapsed}
      aria-label={ariaLabel}
      type="button"
      {...rest}
      className={resolved.className}
      onClick={(event) => {
        onClick?.(event);

        if (
          !event.defaultPrevented &&
          !isCollapsedToFit &&
          store &&
          parentTabset
        ) {
          const tabsetId = parentTabset.id;
          if (isCollapsed) {
            store.updateModel("expand", true, (prev) =>
              expandTabset(prev, tabsetId)
            );
          } else {
            store.updateModel("collapse", true, (prev) =>
              collapseTabset(prev, tabsetId)
            );
          }
        }
      }}
      style={resolved.style}
      title={resolved.title}
    >
      {resolved.children}
    </button>
  );
}

/**
 * Collapses (or expands) the tabset it is rendered within; render it within the content returned by the Workspace's `renderTabsetToolbar` prop.
 * Its `children`, `className`, `style`, and `title` can be functions of its state (see `TabsetCollapseButtonState`), e.g. to show a different icon while the tabset is collapsed:
 *
 * ```tsx
 * renderTabsetToolbar={() => (
 *   <TabsetCollapseButton title={({ isCollapsed }) => (isCollapsed ? "Expand" : "Collapse")}>
 *     {({ isCollapsed }) => (isCollapsed ? "▸" : "▾")}
 *   </TabsetCollapseButton>
 * )}
 * ```
 *
 * The button renders nothing if the tabset can't be collapsed (see `ParentTabsetState.isCollapsible`), or while it's maximized.
 * While the tabset is collapsed only because it doesn't fit (see `ParentTabsetState.isCollapsedToFit`), it can't be expanded, so the button has `aria-disabled="true"`.
 *
 * Its `aria-expanded` attribute reflects whether the tabset is expanded, and its `aria-controls` attribute refers to the selected tab's panel;
 * its default `aria-label` ("Collapse tabset") doesn't change, since `aria-expanded` describes the state.
 *
 * To keep the tabset as it is, call `event.preventDefault()` in an `onClick` handler.
 *
 * ℹ️ Clicking a tab of a collapsed tabset also expands it.
 */
export const TabsetCollapseButton = /* @__PURE__ */ Object.assign(
  TabsetCollapseButtonComponent,
  {
    displayName: "TabsetCollapseButton"
  }
);
