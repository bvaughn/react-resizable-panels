import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { type WorkspaceModel } from "react-resizable-panels";
import { html as SelectTabHTML } from "../../public/generated/examples/WorkspaceSelectTab.json";
import { html as TabRemovalSelectionHTML } from "../../public/generated/examples/WorkspaceTabRemovalSelection.json";
import { Link } from "../components/Link";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { type TabData } from "./examples/WorkspaceModel";

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

export default function WorkspaceTabSelectionRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Selecting tabs" />
      <div>
        Each tabset's selected tab is saved in the model as its{" "}
        <Link to="/model/tabset-node">
          <code>selectedId</code>
        </Link>
        . The imperative <code>selectTab</code> method selects a tab by id (in
        whichever tabset contains it):
      </div>
      <Code html={SelectTabHTML} />
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
        ), so they're restored with the rest of the model. If none of the
        remaining tabs has been selected, the tab after the closed one is
        selected.
      </Callout>
    </Box>
  );
}
