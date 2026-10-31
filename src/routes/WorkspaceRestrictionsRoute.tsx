import { useState } from "react";
import { Box, Callout, Code, Header } from "react-lib-tools";
import {
  type TabNode,
  useWorkspaceRef,
  type WorkspaceNode
} from "react-resizable-panels";
import { html } from "../../public/generated/examples/WorkspaceRestrictions.json";
import { html as ModelHTML } from "../../public/generated/examples/WorkspaceRestrictionsModel.json";
import { Link } from "../components/Link";
import {
  type DemoTab,
  DemoWorkspace
} from "../components/workspace/WorkspaceDemo";
import {
  findTabset,
  initialModel
} from "./examples/WorkspaceRestrictionsModel";

function getTabs(node: WorkspaceNode<DemoTab>): TabNode<DemoTab>[] {
  return node.type === "tabset" ? node.tabs : node.children.flatMap(getTabs);
}

export default function WorkspaceRestrictionsRoute() {
  const [isLocked, setIsLocked] = useState(false);
  const [isCloseDisabled, setIsCloseDisabled] = useState(false);
  const workspaceRef = useWorkspaceRef<DemoTab>();

  // Workspaces are uncontrolled, so each tab's disableClose flag is updated with the imperative API
  // (the "Pinned" tab can never be closed, so its flag is left alone)
  const updateDisableClose = (disableClose: boolean) => {
    const workspace = workspaceRef.current;
    if (workspace) {
      for (const tab of getTabs(workspace.getModel().root)) {
        if (tab.data.kind !== "pinned" && !!tab.disableClose !== disableClose) {
          workspace.updateTab(tab.id, { disableClose });
        }
      }
    }
  };

  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Restrictions" />
      <div>
        By default, users can close and drag any tab, and drop it anywhere.
        Restrictions are opt-in:
      </div>
      <ul className="list-disc pl-6">
        <li>
          A tab's <code>disableClose</code> and <code>disableDrag</code> flags
          prevent the user from closing or dragging it. Other tabs can still be
          dropped around it.
        </li>
        <li>
          The <code>disableDrop</code> prop rejects drop targets: either all of
          them, or the ones a function returns <code>true</code> for.
        </li>
        <li>
          The <code>disabled</code> prop locks the arrangement: tabs can't be
          resized, dragged, dropped, or closed (but they can still be selected,
          and tabsets maximized).
        </li>
      </ul>
      <div>
        For example, a tab can opt out of being closed or dragged, and a
        tabset's <code>data</code> can be used to decide whether it accepts
        drops:
      </div>
      <Code html={ModelHTML} />
      <Code html={html} />
      <Callout>
        None of these restrict the{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>; it can still
        be used to add, remove, or re-arrange tabs.
      </Callout>
      <div>
        In the workspace below, the "Pinned" tab can't be closed or dragged, and
        other tabs can't be dropped into its tabset.
      </div>
      <DemoWorkspace
        canAddTabs={(tabset) =>
          (tabset.data as { acceptsDrops?: boolean } | undefined)
            ?.acceptsDrops !== false
        }
        className="h-60"
        defaultModel={initialModel}
        disableDrop={({ model, target }) =>
          (
            findTabset(model.root, target.tabsetId)?.data as
              | { acceptsDrops?: boolean }
              | undefined
          )?.acceptsDrops === false
        }
        disabled={isLocked}
        onModelChanged={(_, { reason }) => {
          // Tabs added while closing is prevented can't be closed either
          if (reason === "add" && isCloseDisabled) {
            updateDisableClose(true);
          }
        }}
        workspaceRef={workspaceRef}
      />
      <div className="flex items-center flex-wrap justify-between gap-2 text-nowrap">
        <label className="flex items-center gap-2">
          <input
            checked={isLocked}
            id="workspace-restrictions-locked"
            onChange={(event) => setIsLocked(event.currentTarget.checked)}
            type="checkbox"
          />
          Lock workspace (<code>disabled</code>)
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={isCloseDisabled}
            id="workspace-restrictions-close-disabled"
            onChange={(event) => {
              setIsCloseDisabled(event.currentTarget.checked);
              updateDisableClose(event.currentTarget.checked);
            }}
            type="checkbox"
          />
          Prevent closing tabs (<code>disableClose</code>)
        </label>
      </div>
    </Box>
  );
}
