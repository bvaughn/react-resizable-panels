import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as ResizeSplitHTML } from "../../public/generated/examples/WorkspaceResizeSplit.json";
import { html as SeparatorsHTML } from "../../public/generated/examples/WorkspaceSeparators.json";
import { Link } from "../components/Link";
import { WorkspaceDemo } from "../components/workspace/WorkspaceDemo";

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
      <div>
        Tabsets can be limited to{" "}
        <Link to="/examples/workspace/sizing/min-max-sizes">
          minimum and maximum sizes
        </Link>
        , or to a set of{" "}
        <Link to="/examples/workspace/sizing/snapping">snap sizes</Link>.
      </div>
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
        Sizes are applied like the model's own sizes, so tabsets' minimum,
        maximum, and snap sizes still apply. The change is reported to{" "}
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
