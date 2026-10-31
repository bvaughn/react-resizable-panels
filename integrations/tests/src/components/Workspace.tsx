"use client";

import { useState } from "react";
import {
  Separator,
  Workspace as WorkspaceExternal,
  type TabNode,
  type WorkspaceChangedMeta,
  type WorkspaceModel,
  type WorkspaceProps
} from "react-resizable-panels";

// Props that can be serialized for tests (render functions are provided by this component)
export type TestWorkspaceProps = Omit<
  WorkspaceProps,
  | "disableDrop"
  | "elementRef"
  | "hiddenTabBehavior"
  | "onModelChanged"
  | "renderDragPreview"
  | "renderSeparator"
  | "renderEmptyTabset"
  | "renderTab"
  | "renderTabContent"
  | "renderTabsetToolbar"
  | "workspaceRef"
> & {
  hiddenTabBehavior?: "activity" | "keep-mounted" | "unmount" | undefined;
};

// Geometry is specified with inline styles (rather than CSS classes) so that tests can make exact assertions:
// the workspace is 808x400, tab lists are 30px tall, and separators are 8px
export const SEPARATOR_SIZE = 8;
export const TAB_LIST_HEIGHT = 30;

export function Workspace({ style, ...rest }: TestWorkspaceProps) {
  const [changes, setChanges] = useState<
    { meta: WorkspaceChangedMeta; model: WorkspaceModel }[]
  >([]);

  return (
    <>
      <WorkspaceExternal
        className="bg-slate-950 text-slate-300"
        classNames={{ tabContent: "h-full" }}
        onModelChanged={(model, meta) =>
          setChanges((prev) => [...prev, { meta, model }])
        }
        renderSeparator={() => (
          <Separator
            className="bg-slate-600"
            style={{ flexBasis: SEPARATOR_SIZE }}
          />
        )}
        renderTabContent={(tab) => <TabContent tab={tab} />}
        style={{ height: 400, width: 808, ...style }}
        styles={{
          header: { display: "flex", flex: `0 0 ${TAB_LIST_HEIGHT}px` },
          tab: {
            alignItems: "center",
            display: "flex",
            gap: 4,
            padding: "0 10px"
          },
          tabList: { display: "flex" },
          tabPanels: { flex: "1 1 0", minHeight: 0 },
          tabset: {
            background: "#020617",
            display: "flex",
            flexDirection: "column",
            height: "100%"
          }
        }}
        {...rest}
      />
      <pre data-testid="workspace-changes" hidden>
        {JSON.stringify(changes)}
      </pre>
    </>
  );
}

// Each tab has local state, so tests can verify that it's preserved when tabs are moved
function TabContent({ tab }: { tab: TabNode }) {
  const [count, setCount] = useState(0);

  return (
    <button
      data-testid={`content-${tab.id}`}
      onClick={() => setCount(count + 1)}
      style={{ height: "100%", width: "100%" }}
    >
      {tab.id}: {count}
    </button>
  );
}
