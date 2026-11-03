"use client";

import { useContext } from "react";
import { warnOnce } from "../../shared/utils/warnOnce";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import { useParentTabsetState } from "../hooks/useParentTabsetState";
import type { TabsetDragHandleProps } from "../types";

function TabsetDragHandleComponent({ style, ...rest }: TabsetDragHandleProps) {
  const parentTabset = useContext(ParentTabsetContext);
  const tabsetState = useParentTabsetState();

  if (!parentTabset) {
    warnOnce(
      "TabsetDragHandle must be rendered within a tabset's header (see renderTabsetToolbar)"
    );
  }

  const isDragDisabled = tabsetState?.isDragDisabled ?? true;

  return (
    <div
      data-disabled={isDragDisabled || undefined}
      data-tabset-drag-handle=""
      {...rest}
      // The handle handles touch drags itself (rather than letting them scroll the page)
      style={isDragDisabled ? style : { touchAction: "none", ...style }}
    />
  );
}

/**
 * Drags the tabset it is rendered within; render it within the content returned by the Workspace's `renderTabsetToolbar` prop:
 *
 * ```tsx
 * renderTabsetToolbar={() => (
 *   <TabsetDragHandle>⠿</TabsetDragHandle>
 * )}
 * ```
 *
 * By default, a tabset is dragged by the empty space in its header;
 * once its header contains a drag handle, only the handle drags it.
 * Any element with a `data-tabset-drag-handle` attribute is a drag handle;
 * this component also sets `touch-action: none`, so that it can be dragged by touch.
 *
 * The handle has a `data-disabled` attribute when the tabset can't be dragged (see `useParentTabsetState`), e.g. to hide it.
 */
export const TabsetDragHandle = /* @__PURE__ */ Object.assign(
  TabsetDragHandleComponent,
  {
    displayName: "TabsetDragHandle"
  }
);
