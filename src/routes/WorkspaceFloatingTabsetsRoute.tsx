import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as FloatButtonHTML } from "../../public/generated/examples/WorkspaceFloatButton.json";
import { html as FloatingModelHTML } from "../../public/generated/examples/WorkspaceFloatingModel.json";
import { Link } from "../components/Link";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { floatingModel } from "./examples/WorkspaceFloatingModel";

export default function WorkspaceFloatingTabsetsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Floating tabsets" />
      <div>
        A tabset can float above the layout, e.g. a notepad that can be moved
        out of the way of the content beneath it. Floating tabsets are listed in
        the model's <code>floating</code> field, in stacking order (the last one
        is on top), with their positions and sizes in pixels:
      </div>
      <Code html={FloatingModelHTML} />
      <SectionHeader>Moving and resizing floating tabsets</SectionHeader>
      <div>
        Users move a floating tabset by dragging its header (the empty space
        after its tabs, or its <code>TabsetDragHandle</code>), resize it by
        dragging its edges, and bring it to the front by pressing it. Its tabs
        can be dragged into the layout and other tabs can be dropped into it;
        once its last tab is dragged away, it's removed (unless it has the{" "}
        <code>keepWhenEmpty</code> flag). Floating tabsets stay within the
        workspace: their headers are kept within the layout (so they can always
        be dragged back), and the rest of them is clipped to it.
      </div>
      <SectionHeader>Collapsing floating tabsets</SectionHeader>
      <div>
        Floating tabsets can always be collapsed to just their headers (they
        don't need the <code>collapsible</code> flag), with the{" "}
        <code>collapseTabset</code> method (or the <code>collapse</code>{" "}
        function of the <code>useParentTabset</code> hook). A collapsed floating
        tabset keeps its <code>width</code> and <code>height</code> to expand
        to; until then, it can only be resized along its header. Clicking one of
        its tabs (or the empty space in its header) expands it.
      </div>
      <SectionHeader>Floating and docking tabsets</SectionHeader>
      <div>
        The <code>floatTab</code> and <code>floatTabset</code> methods (and the{" "}
        <code>float</code> functions of the <code>useParentTab</code> and{" "}
        <code>useParentTabset</code> hooks) move a tab or tabset into a new
        floating tabset; moving a floating tabset beside the others (e.g. with{" "}
        <code>moveTabset</code>) docks it:
      </div>
      <Code html={FloatButtonHTML} />
      <div>
        In the workspace below, drag the notepad by its header, or use the
        buttons in each tabset's toolbar to float, collapse, and dock it.
      </div>
      <DemoWorkspace
        className="h-96"
        defaultModel={floatingModel}
        showFloatButtons
        showMaximizeButtons={false}
        showResetButton
      />
      <Callout>
        Floating tabsets can't be split or{" "}
        <Link
          anchor="maximizing-tabsets"
          to="/examples/workspace/managing-tabsets/sizing-tabsets"
        >
          maximized
        </Link>
        : tabs dropped anywhere on one are added to it, and they're shown above
        a maximized tabset. Their elements have{" "}
        <code>data-floating-tabset</code> attributes (and{" "}
        <code>data-tabset-collapsed</code> attributes while collapsed; their
        tabsets have <code>data-tabset-floating</code> attributes), and the{" "}
        <code>floatingTabset</code> and <code>floatingResizeHandle</code> keys
        of the <code>classNames</code> prop style them.
      </Callout>
      <Callout>
        Changes made with the imperative API are reported by{" "}
        <code>onModelChanged</code> (with <code>isUserInteraction</code> set to{" "}
        <code>false</code>), so they're saved like any other change.
      </Callout>
    </Box>
  );
}
