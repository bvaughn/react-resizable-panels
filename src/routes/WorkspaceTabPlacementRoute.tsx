import { useState } from "react";
import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import type { WorkspaceModel } from "react-resizable-panels";
import { html as DefaultHTML } from "../../public/generated/examples/WorkspaceTabPlacement.json";
import { html as MixedHTML } from "../../public/generated/examples/WorkspaceTabPlacementMixed.json";
import { DemoButton } from "../components/DemoButton";
import { Link } from "../components/Link";
import {
  DemoWorkspace,
  type TabPlacement
} from "../components/workspace/WorkspaceDemo";
import { type TabData } from "./examples/WorkspaceModel";

const PLACEMENTS: TabPlacement[] = ["top", "bottom", "left", "right"];

const initialModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        size: 25,
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      },
      {
        type: "tabset",
        id: "editors",
        size: 35,
        tabs: [
          { id: "notes", title: "Notes", data: { kind: "notes" } },
          { id: "counter", title: "Counter", data: { kind: "counter" } }
        ]
      }
    ]
  }
};

// Same layout as the other demos, with the sidebar's tabs on the left
const mixedModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        size: 25,
        tabPlacement: "left",
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      },
      {
        type: "tabset",
        id: "editors",
        size: 35,
        tabPlacement: "top",
        tabs: [
          { id: "notes", title: "Notes", data: { kind: "notes" } },
          { id: "counter", title: "Counter", data: { kind: "counter" } }
        ]
      }
    ]
  }
};

export default function WorkspaceTabPlacementRoute() {
  const [tabPlacement, setTabPlacement] = useState<TabPlacement>("left");

  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Tab placement" />
      <div>
        Tabs can be placed on any side of a tabset with the{" "}
        <code>tabPlacement</code> prop:
      </div>
      <Code html={DefaultHTML} />
      <Callout>
        Tabs placed on the left or right are stacked: dropped tabs are inserted
        based on their vertical position, and the up and down arrow keys move
        between tabs.
      </Callout>
      <div className="flex flex-wrap gap-2">
        {PLACEMENTS.map((placement) => (
          <DemoButton
            className={placement === tabPlacement ? "bg-sky-500" : ""}
            key={placement}
            onClick={() => setTabPlacement(placement)}
          >
            {placement}
          </DemoButton>
        ))}
      </div>
      <DemoWorkspace
        className="h-60"
        defaultModel={initialModel}
        tabPlacement={tabPlacement}
      />
      <div>
        Elements within a tabset have a <code>data-tab-placement</code>{" "}
        attribute, which can be used to style them for each placement (see{" "}
        <Link to="/examples/workspace/styling">styling</Link>).
      </div>
      <Callout>
        Tabs on the left or right don't have to be rotated; the demo above
        rotates them with the <code>writing-mode</code> CSS property, but a
        vertical list of unrotated tabs works too.
      </Callout>
      <SectionHeader>Mixing placements</SectionHeader>
      <div>
        Tabsets can override the workspace's placement with the{" "}
        <code>tabPlacement</code> field of their model node:
      </div>
      <Code html={MixedHTML} />
      <DemoWorkspace className="h-60" defaultModel={mixedModel} />
      <Callout>
        Tabsets created by dragging a tab to the edge of another tabset use the
        workspace's <code>tabPlacement</code> prop.
      </Callout>
    </Box>
  );
}
