import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { useWorkspaceRef, type WorkspaceModel } from "react-resizable-panels";
import { html as UseParentTabsetHTML } from "../../public/generated/examples/UseParentTabset.json";
import { html as AddTabAtTargetHTML } from "../../public/generated/examples/WorkspaceAddTabAtTarget.json";
import { html as OpenTabHTML } from "../../public/generated/examples/WorkspaceOpenTab.json";
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

const FILES: {
  id: string;
  kind: "about" | "notes";
  title: string;
}[] = [
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
        <code>tabsetId</code>) or position (<code>index</code>), or add it
        without selecting it (<code>select: false</code>).
      </div>
      <div>
        The <code>target</code> option adds the tab anywhere a tab can be
        dropped, including in a new tabset beside another tabset or along an
        edge of the workspace (the same targets <code>moveTab</code> accepts),
        and <code>size</code> sets the new tabset's share of its split:
      </div>
      <Code html={AddTabAtTargetHTML} />
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
      <Callout>
        Changes made with the imperative API are reported by{" "}
        <code>onModelChanged</code> (with <code>isUserInteraction</code> set to{" "}
        <code>false</code>), so they're saved like any other change.
      </Callout>
      <div>
        Users can also{" "}
        <Link to="/examples/workspace/managing-tabs/dragging-tabs-in">
          drag new tabs in
        </Link>{" "}
        from outside of the workspace, and the tab that's selected when the
        selected tab is closed can be{" "}
        <Link to="/examples/workspace/managing-tabs/selecting-tabs">
          customized
        </Link>
        . To keep, move, resize, collapse, maximize, or float whole tabsets, see{" "}
        <Link to="/examples/workspace/managing-tabsets">managing tabsets</Link>.
      </div>
    </Box>
  );
}
