import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { useWorkspaceRef, type WorkspaceModel } from "react-resizable-panels";
import { html as GrowDirectionHTML } from "../../public/generated/examples/WorkspaceGrowDirection.json";
import { DemoButton } from "../components/DemoButton";
import {
  type DemoTab,
  DemoWorkspace
} from "../components/workspace/WorkspaceDemo";
import { type TabData } from "./examples/WorkspaceModel";

const growingModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "rows",
    orientation: "vertical",
    children: [
      {
        type: "split",
        id: "top",
        orientation: "horizontal",
        size: "220px",
        children: [
          {
            type: "tabset",
            id: "about-tabset",
            tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
          },
          {
            type: "tabset",
            id: "counter-tabset",
            tabs: [
              { id: "counter", title: "Counter", data: { kind: "counter" } }
            ]
          }
        ]
      },
      {
        type: "tabset",
        id: "notes-tabset",
        size: "180px",
        tabs: [{ id: "notes", title: "Notes", data: { kind: "notes" } }]
      },
      {
        type: "tabset",
        id: "nested-tabset",
        size: "260px",
        tabs: [
          { id: "nested", title: "Nested panels", data: { kind: "nested" } }
        ]
      }
    ]
  }
};

export default function WorkspaceScrollingLayoutsRoute() {
  const workspaceRef = useWorkspaceRef<DemoTab>();

  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Scrolling layouts" />
      <div>
        By default, a workspace fills its container, and its tabsets share the
        space. With the <code>growDirection</code> prop, it grows instead, like
        a dashboard: the root split's children are rows (or columns, with{" "}
        <code>"horizontal"</code>), each as large as its <code>size</code>, and
        the workspace is as tall as its rows. Your app decides what scrolls,
        e.g. the page, or an element around the workspace:
      </div>
      <Code html={GrowDirectionHTML} />
      <div>
        Drag the separator between two rows to move space between them, or the
        grow handle after the last row to make it (and the workspace) taller.
        Drop a tab at the top or bottom edge of the workspace (or of a row) to
        add a row.
      </div>
      <div className="max-h-120 overflow-auto rounded-md border border-ink/20 p-2">
        <DemoWorkspace
          className="h-auto"
          defaultModel={growingModel}
          growDirection="vertical"
          renderGrowHandle={() => (
            <EllipsisHorizontalIcon className="w-6 h-6 sm:w-4 sm:h-4 shrink-0" />
          )}
          workspaceRef={workspaceRef}
        />
      </div>
      <div>
        <DemoButton
          onClick={() => workspaceRef.current?.setModel(growingModel)}
        >
          Reset layout
        </DemoButton>
      </div>
      <Callout>
        Only the root split grows; everything within a row fits it, as usual.
        Each row's size is a length (e.g. <code>"300px"</code>). A tabset moved
        to a new row keeps its size, and a tab moved out of a tabset takes that
        tabset's size; other new rows (e.g. tabs dragged in from another
        workspace) are <code>defaultGrowSize</code> (300px by default).
      </Callout>
      <SectionHeader>Resizing rows</SectionHeader>
      <div>
        The separators between rows are the workspace's usual separators (see{" "}
        <code>renderSeparator</code>): they move space between the rows beside
        them, so the workspace stays the same size. It grows (or shrinks) as
        rows are added (or removed), and the grow handle after the last row
        resizes that row, and the workspace with it.
      </div>
      <div>
        The grow handle can be focused and resized with the arrow keys (by 10px,
        or 50px with Shift), and Home and End resize the last row to its minimum
        and maximum. Its content comes from the <code>renderGrowHandle</code>{" "}
        prop (e.g. a grip icon), and it's styled with the{" "}
        <code>growHandle</code> entries of the <code>classNames</code> and{" "}
        <code>styles</code> props (or its <code>data-grow-handle</code>{" "}
        attribute, with <code>data-active</code> while it's dragged). Since it
        doesn't move space between rows, it can look different from the
        separators, or be hidden (e.g. <code>display: none</code>); the demo
        above styles it like them.
      </div>
      <SectionHeader>Dragging tabs</SectionHeader>
      <div>
        Tabs (and tabsets) are dropped as usual, except at the workspace's
        edges: dropping at its top or bottom edge adds a row there, and its left
        and right edges (beside every row) don't accept drops. While a tab is
        dragged near the edge of what the workspace scrolls within (e.g. the
        page, or the box around the demo above), it's scrolled, so rows that are
        scrolled out of view can be reached.
      </div>
      <SectionHeader>Maximized tabsets</SectionHeader>
      <div>
        A maximized tabset covers the part of the workspace that's visible
        (rather than the whole workspace), and stays there as it's scrolled.
      </div>
      <Callout intent="warning">
        <code>growDirection</code> shouldn't change after the workspace mounts,
        since the model's sizes mean different things with and without it;
        render a new workspace (e.g. with a different <code>key</code>) instead.
      </Callout>
      <Callout>
        The workspace's root element has a <code>data-grow-direction</code>{" "}
        attribute, e.g. to style it (or the element it scrolls within).
      </Callout>
    </Box>
  );
}
