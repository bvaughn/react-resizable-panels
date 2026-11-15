import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as MaxSizeModelHTML } from "../../public/generated/examples/WorkspaceMaxSizeModel.json";
import { html as ResizeSplitHTML } from "../../public/generated/examples/WorkspaceResizeSplit.json";
import { html as SeparatorsHTML } from "../../public/generated/examples/WorkspaceSeparators.json";
import { Link } from "../components/Link";
import {
  DemoWorkspace,
  WorkspaceDemo
} from "../components/workspace/WorkspaceDemo";
import { maxSizeModel } from "./examples/WorkspaceMaxSizeModel";

export default function WorkspaceSizingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Sizing tabsets" />
      <div>
        Each child of a split has a <code>size</code> in the model: a percentage
        of the parent split. Siblings without a size share the rest of the
        split. Initial sizes can also be strings with units (e.g.{" "}
        <code>"250px"</code>), but they're converted to percentages when the
        user resizes the split, and they scale with the workspace when it's
        resized.
      </div>
      <div>
        Users resize tabsets by dragging the separators between them. Tabsets
        can also be{" "}
        <Link to="/examples/workspace/collapsing-and-maximizing">
          collapsed to just their headers, or maximized
        </Link>
        .
      </div>
      <SectionHeader>Minimum and maximum sizes</SectionHeader>
      <div>
        The <code>tabsetMinWidth</code> and <code>tabsetMinHeight</code> props
        set a minimum size for the content of every tabset (not including its
        tabs), and a tabset can override them with the <code>minWidth</code> and{" "}
        <code>minHeight</code> fields of its model node. The{" "}
        <code>maxWidth</code> and <code>maxHeight</code> fields limit how large
        a tabset's content can be resized, e.g. a sidebar that can only grow so
        wide. All of them must use absolute units (e.g. <code>"300px"</code> or{" "}
        <code>"20rem"</code>):
      </div>
      <Code html={MaxSizeModelHTML} />
      <div>
        The sidebar below can be resized between 150 and 300 pixels wide, but
        its tab can't be dragged or closed.
      </div>
      <DemoWorkspace
        className="h-80"
        defaultModel={maxSizeModel}
        defaultSeparators
        showResetButton
      />
      <Callout>
        A split always fills its space, so a maximum only applies if something
        else can take up the rest of it, e.g. another tabset in the same split
        without a maximum. Maximums are ignored (with a warning in development)
        if every tabset in a split has one, or if the tabset fills the
        workspace.
      </Callout>
      <Callout>
        A tabset is shown within its minimum and maximum sizes even if its{" "}
        <code>size</code> is outside of them (e.g. a model saved in a wider
        window); its size isn't changed, so it's shown at its size again once
        that fits.
      </Callout>
      <SectionHeader>Resizing tabsets programmatically</SectionHeader>
      <div>
        The <code>resizeSplit</code> method sets the sizes of a split's children
        (tabsets and splits), without replacing the model, e.g. to apply a saved
        preset or to make a sidebar a particular width. It takes sizes keyed by
        the ids of the children: numbers are percentages, strings can have units
        (e.g. <code>"250px"</code>, converted to a percentage of the split's
        current size), and children that aren't listed share the rest of the
        split. For example, a 30/70 preset, or a sidebar 250 pixels wide:
      </div>
      <Code html={ResizeSplitHTML} />
      <div>
        Sizes are applied like the model's own sizes, so tabsets' minimum and
        maximum sizes still apply. The change is reported to{" "}
        <code>onModelChanged</code> with the <code>"resize"</code> reason.
      </div>
      <SectionHeader>Separators</SectionHeader>
      <div>
        By default, a workspace renders an unstyled{" "}
        <Link to="/props/separator">
          <code>Separator</code>
        </Link>{" "}
        between tabsets. It takes up no space and can't be seen, so tabsets are
        resized by dragging the boundary between them. Rendering visible
        separators with the <code>renderSeparator</code> prop is recommended,
        since they show users where tabsets can be resized and give them
        something to grab. It receives the orientation of the split, so
        separators between tabsets side by side can be given a width and those
        between stacked tabsets a height:
      </div>
      <Code html={SeparatorsHTML} />
      <WorkspaceDemo />
      <Callout>
        Separators can be focused and resized with the keyboard (see{" "}
        <Link to="/examples/workspace/keyboard-and-accessibility">
          keyboard and accessibility
        </Link>
        ). To render no separators at all, return <code>null</code> from{" "}
        <code>renderSeparator</code>; tabsets can still be resized by dragging
        the edges between them, but not with the keyboard.
      </Callout>
    </Box>
  );
}
