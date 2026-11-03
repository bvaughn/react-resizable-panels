import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { useWorkspaceRef, type WorkspaceModel } from "react-resizable-panels";
import { html as UseParentTabsetHTML } from "../../public/generated/examples/UseParentTabset.json";
import { html as OpenTabHTML } from "../../public/generated/examples/WorkspaceOpenTab.json";
import { html as TabRemovalSelectionHTML } from "../../public/generated/examples/WorkspaceTabRemovalSelection.json";
import { html as UpdateTabHTML } from "../../public/generated/examples/WorkspaceUpdateTab.json";
import { DemoButton } from "../components/DemoButton";
import { Link } from "../components/Link";
import {
  type DemoTab,
  DemoWorkspace
} from "../components/workspace/WorkspaceDemo";
import { type TabData } from "./examples/WorkspaceModel";

const emptyModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: []
  }
};

// Several tabs in one tabset, to show which tab is selected when the selected one is closed
const tabRemovalModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "tabset",
    id: "tabs",
    tabs: [
      { id: "about", title: "About", data: { kind: "about" } },
      { id: "counter", title: "Counter", data: { kind: "counter" } },
      { id: "notes", title: "Notes", data: { kind: "notes" } },
      { id: "nested", title: "Nested panels", data: { kind: "nested" } }
    ]
  }
};

const FILES: (DemoTab & {
  id: string;
  title: string;
})[] = [
  { id: "notes", kind: "notes", title: "Notes" },
  { id: "about", kind: "about", title: "About" }
];

export default function WorkspaceManagingTabsRoute() {
  const workspaceRef = useWorkspaceRef<DemoTab>();

  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Managing tabs" />
      <div>
        Tabs are usually opened in response to something outside of the
        workspace (e.g. a file being selected in a tree). The{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>'s{" "}
        <code>addTab</code> method adds a tab to the active tabset (the one the
        user most recently interacted with) and selects it:
      </div>
      <Code html={OpenTabHTML} />
      <div>
        If a tab with the same id is already open (anywhere in the workspace),
        it's selected instead, and <code>addTab</code> returns{" "}
        <code>false</code>. Options can add the tab to a specific tabset (
        <code>tabsetId</code>) or position (<code>index</code>), or without
        selecting it (<code>select: false</code>).
      </div>
      <div className="flex flex-wrap gap-2">
        {FILES.map(({ id, kind, title }) => (
          <DemoButton
            key={id}
            onClick={() =>
              workspaceRef.current?.addTab({
                data: { kind },
                id,
                title
              })
            }
          >
            Open {title}
          </DemoButton>
        ))}
      </div>
      <DemoWorkspace
        // Tabs are only added by the buttons above, which use the imperative API
        canAddTabs={() => false}
        className="h-50"
        defaultModel={emptyModel}
        renderEmptyTabset={() => (
          <div className="absolute inset-0 flex items-center justify-center text-ink/60 text-sm">
            Add content using the buttons above
          </div>
        )}
        workspaceRef={workspaceRef}
      />
      <SectionHeader>Adding tabs from a tabset</SectionHeader>
      <div>
        Components within a tabset (e.g. a button rendered by{" "}
        <code>renderTabsetToolbar</code>) can add tabs to that tabset with the{" "}
        <Link to="/hooks/use-parent-tabset">
          <code>useParentTabset</code>
        </Link>{" "}
        hook:
      </div>
      <Code html={UseParentTabsetHTML} />
      <SectionHeader>Updating and closing tabs</SectionHeader>
      <div>
        The <code>updateTab</code> method changes a tab's title, data, or flags,
        and <code>closeTab</code> closes it. Within a tab's content, the{" "}
        <Link to="/hooks/use-parent-tab">
          <code>useParentTab</code>
        </Link>{" "}
        hook returns the tab, so content can update or close its own tab:
      </div>
      <Code html={UpdateTabHTML} />
      <Callout>
        A tab's <code>data</code> is replaced rather than merged when it is
        updated. To confirm before the user closes a tab (e.g. one with unsaved
        changes), see{" "}
        <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link>.
      </Callout>
      <SectionHeader>Selecting a tab after one is closed</SectionHeader>
      <div>
        When the selected tab is closed (or dragged to another tabset), the tab
        after it is selected by default. With the{" "}
        <code>tabRemovalSelectionBehavior</code> prop set to{" "}
        <code>"recent"</code>, the tab that was selected before it is selected
        instead, like in an IDE:
      </div>
      <Code html={TabRemovalSelectionHTML} />
      <div>
        In the workspace below, select a few tabs and then close the selected
        one.
      </div>
      <DemoWorkspace
        className="h-50"
        defaultModel={tabRemovalModel}
        showResetButton
        tabRemovalSelectionBehavior="recent"
      />
      <Callout>
        Each tabset's recently selected tabs are saved in the model (as{" "}
        <Link to="/model/tabset-node">
          <code>recentTabIds</code>
        </Link>
        ), so they're restored with the rest of the layout. If none of the
        remaining tabs has been selected, the tab after the closed one is
        selected.
      </Callout>
      <Callout>
        Changes made with the imperative API are reported by{" "}
        <code>onModelChanged</code> (with <code>isUserInteraction</code> set to{" "}
        <code>false</code>), so they're saved like any other change.
      </Callout>
      <div>
        To keep, move, collapse, or maximize whole tabsets, see{" "}
        <Link to="/examples/workspace/managing-tabsets">managing tabsets</Link>.
      </div>
    </Box>
  );
}
