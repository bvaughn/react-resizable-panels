import { memo, type ReactNode } from "react";
import type { TabNode } from "../types";

// Tab content is only re-rendered when the tab (or the render function) changes,
// not when other parts of the workspace change (e.g. while a tab is being dragged)
const MemoizedContentMemo = /* @__PURE__ */ memo(
  function MemoizedContent({
    render,
    tab
  }: {
    render: (tab: TabNode) => ReactNode;
    tab: TabNode;
  }) {
    return render(tab);
  },
  (prev, next) =>
    prev.render === next.render &&
    prev.tab.id === next.tab.id &&
    prev.tab.data === next.tab.data &&
    prev.tab.title === next.tab.title &&
    prev.tab.disableClose === next.tab.disableClose &&
    prev.tab.disableDrag === next.tab.disableDrag
);

export const MemoizedContent = /* @__PURE__ */ Object.assign(
  MemoizedContentMemo,
  { displayName: "Workspace.MemoizedContent" }
);
