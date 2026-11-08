"use client";

import { useContext } from "react";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import { WorkspaceStoreContext } from "../contexts/WorkspaceStoreContext";
import { useParentTabsetState } from "../hooks/useParentTabsetState";
import { maximizeTabset } from "../models/maximizeTabset";
import { restoreTabset } from "../models/restoreTabset";
import type { TabsetMaximizeButtonProps } from "../types";
import { resolveStatefulProps } from "../utils/resolveStatefulProps";

function TabsetMaximizeButtonComponent({
  "aria-label": ariaLabel = "Maximize tabset",
  children,
  className,
  onClick,
  style,
  title,
  ...rest
}: TabsetMaximizeButtonProps) {
  // Read from the store (rather than WorkspaceContext), so that the button only re-renders when its tabset's state changes
  const store = useContext(WorkspaceStoreContext);
  const parentTabset = useContext(ParentTabsetContext);
  const tabsetState = useParentTabsetState();

  if (!store || !parentTabset) {
    if (process.env.NODE_ENV !== "production") {
      warnOnce(
        "TabsetMaximizeButton must be rendered within a tabset (see renderTabsetToolbar)"
      );
    }
  }

  // The only tabset in a workspace already fills it, and floating tabsets can't be maximized
  if (!tabsetState || tabsetState.isRoot || tabsetState.isFloating) {
    return null;
  }

  const { isMaximized } = tabsetState;
  const resolved = resolveStatefulProps(
    { children, className, style, title },
    { isMaximized }
  );

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={isMaximized}
      type="button"
      {...rest}
      className={resolved.className}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented && store && parentTabset) {
          const tabsetId = parentTabset.id;
          if (isMaximized) {
            store.updateModel("restore", true, restoreTabset);
          } else {
            store.updateModel("maximize", true, (prev) =>
              maximizeTabset(prev, tabsetId)
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
 * Maximizes (or restores) the tabset it is rendered within; render it within the content returned by the Workspace's `renderTabsetToolbar` prop.
 * Its `children`, `className`, `style`, and `title` can be functions of its state (see `TabsetMaximizeButtonState`), e.g. to show a different icon while the tabset is maximized:
 *
 * ```tsx
 * renderTabsetToolbar={() => (
 *   <TabsetMaximizeButton title={({ isMaximized }) => (isMaximized ? "Restore" : "Maximize")}>
 *     {({ isMaximized }) => (isMaximized ? "Restore" : "Maximize")}
 *   </TabsetMaximizeButton>
 * )}
 * ```
 *
 * The button renders nothing for the only tabset in a workspace (see `ParentTabsetState.isRoot`) and for floating tabsets, which can't be maximized.
 *
 * Its `aria-pressed` attribute reflects whether the tabset is maximized;
 * its default `aria-label` ("Maximize tabset") doesn't change, since `aria-pressed` describes the state.
 *
 * To keep the tabset as it is, call `event.preventDefault()` in an `onClick` handler.
 */
export const TabsetMaximizeButton = /* @__PURE__ */ Object.assign(
  TabsetMaximizeButtonComponent,
  {
    displayName: "TabsetMaximizeButton"
  }
);
