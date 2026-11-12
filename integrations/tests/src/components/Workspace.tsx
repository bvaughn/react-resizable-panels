"use client";

import { useState } from "react";
import {
  Separator,
  Workspace as WorkspaceExternal,
  type TabNode,
  type TearOffArgs,
  type WorkspaceChangedMeta,
  type WorkspaceModel,
  type WorkspaceProps,
  useParentTabsetState,
  useTabListFreeSpace,
  useTabListOverflow
} from "react-resizable-panels";

// Props that can be serialized for tests (render functions are provided by this component)
export type TestWorkspaceProps = Omit<
  WorkspaceProps,
  | "disableDrop"
  | "elementRef"
  | "hiddenTabBehavior"
  | "onModelChanged"
  | "onTearOff"
  | "renderDragPreview"
  | "renderSeparator"
  | "renderEmptyTabset"
  | "renderTab"
  | "renderTabContent"
  | "renderTabsetToolbar"
  | "workspaceRef"
> & {
  hiddenTabBehavior?: "activity" | "keep-mounted" | "unmount" | undefined;
  // Renders a toolbar that shows each tabset's tab list free space (and makes tab lists fill their headers);
  // a "responsive" toolbar shrinks when there's little free space (like a toolbar that moves items into an overflow menu)
  showTabListFreeSpace?: boolean | "responsive" | undefined;
  // Renders a toolbar that shows the ids of each tabset's tabs that are out of view (and makes tab lists fill their headers)
  showTabListOverflow?: boolean | undefined;
  // Renders a toolbar that shows each tabset's state (see useParentTabsetState) as data attributes
  showTabsetState?: boolean | undefined;
  // Adds an onTearOff prop that records its arguments and accepts (or rejects) each tear off
  tearOff?: "accept" | "reject" | undefined;
};

// Geometry is specified with inline styles (rather than CSS classes) so that tests can make exact assertions:
// the workspace is 808x400, tab lists are 30px tall, and separators are 8px
export const SEPARATOR_SIZE = 8;
export const TAB_LIST_HEIGHT = 30;

export const FREE_SPACE_TOOLBAR_WIDTH = 60;
const NARROW_TOOLBAR_WIDTH = 20;

export function Workspace({
  showTabListFreeSpace,
  showTabListOverflow,
  showTabsetState,
  style,
  tearOff,
  ...rest
}: TestWorkspaceProps) {
  const [changes, setChanges] = useState<
    { meta: WorkspaceChangedMeta; model: WorkspaceModel }[]
  >([]);
  const [tearOffs, setTearOffs] = useState<TearOffArgs[]>([]);

  return (
    <>
      <WorkspaceExternal
        className="bg-slate-950 text-slate-300"
        classNames={{ tabContent: "h-full" }}
        onModelChanged={(model, meta) =>
          setChanges((prev) => [...prev, { meta, model }])
        }
        onTearOff={
          tearOff
            ? (args) => {
                setTearOffs((prev) => [...prev, args]);
                return tearOff === "accept";
              }
            : undefined
        }
        renderSeparator={() => (
          <Separator
            className="bg-slate-600"
            style={{ flexBasis: SEPARATOR_SIZE }}
          />
        )}
        renderTabContent={(tab) => <TabContent tab={tab} />}
        renderTabsetToolbar={
          showTabListFreeSpace
            ? (tabset) => (
                <FreeSpace
                  isResponsive={showTabListFreeSpace === "responsive"}
                  tabsetId={tabset.id}
                />
              )
            : showTabListOverflow
              ? (tabset) => <Overflow tabsetId={tabset.id} />
              : showTabsetState
                ? (tabset) => <TabsetState tabsetId={tabset.id} />
                : undefined
        }
        style={{ height: 400, width: 808, ...style }}
        styles={{
          header: { display: "flex", flex: `0 0 ${TAB_LIST_HEIGHT}px` },
          tab: {
            alignItems: "center",
            display: "flex",
            gap: 4,
            padding: "0 10px"
          },
          tabList:
            showTabListFreeSpace || showTabListOverflow
              ? {
                  display: "flex",
                  flex: "1 1 0",
                  minWidth: 0,
                  overflow: "hidden"
                }
              : { display: "flex" },
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
      <pre data-testid="workspace-tear-offs" hidden>
        {JSON.stringify(tearOffs)}
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

// Fixed size, so that rendering a new value doesn't resize the tab list (and change its free space again)
function FreeSpace({
  isResponsive,
  tabsetId
}: {
  isResponsive: boolean;
  tabsetId: string;
}) {
  const freeSpace = useTabListFreeSpace();
  // The toolbar can use the free space plus the size it had when the free space was measured (see the docs' overflow toolbar)
  const [placement, setPlacement] = useState({
    freeSpace: undefined as number | undefined,
    isNarrow: false
  });
  if (
    isResponsive &&
    freeSpace !== undefined &&
    freeSpace !== placement.freeSpace
  ) {
    const width = placement.isNarrow
      ? NARROW_TOOLBAR_WIDTH
      : FREE_SPACE_TOOLBAR_WIDTH;
    setPlacement({
      freeSpace,
      isNarrow: freeSpace + width < FREE_SPACE_TOOLBAR_WIDTH
    });
  }
  const { isNarrow } = placement;

  return (
    <div
      data-testid={`free-space-${tabsetId}`}
      style={{
        overflow: "hidden",
        width: isNarrow ? NARROW_TOOLBAR_WIDTH : FREE_SPACE_TOOLBAR_WIDTH
      }}
    >
      {String(freeSpace)}
    </div>
  );
}

function Overflow({ tabsetId }: { tabsetId: string }) {
  const hidden = useTabListOverflow();
  const hiddenOrClipped = useTabListOverflow({ includePartiallyVisible: true });

  return (
    <div style={{ overflow: "hidden", width: FREE_SPACE_TOOLBAR_WIDTH }}>
      <span data-testid={`overflow-${tabsetId}`}>{hidden.join(",")}</span>
      <span data-testid={`overflow-clipped-${tabsetId}`}>
        {hiddenOrClipped.join(",")}
      </span>
    </div>
  );
}

function TabsetState({ tabsetId }: { tabsetId: string }) {
  const state = useParentTabsetState();

  return (
    <span
      data-collapsed={state?.isCollapsed}
      data-collapsed-to-fit={state?.isCollapsedToFit}
      data-testid={`tabset-state-${tabsetId}`}
    />
  );
}
