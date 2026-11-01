import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as ClassNamesHTML } from "../../public/generated/examples/WorkspaceClassNames.json";
import { html as StylesHTML } from "../../public/generated/examples/WorkspaceStyles.json";
import { Link } from "../components/Link";

export default function WorkspaceStylingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Styling" />
      <div>
        Like the rest of the library, workspaces are unstyled. The{" "}
        <code>classNames</code> and <code>styles</code> props apply class names
        and inline styles to the elements a workspace renders:
      </div>
      <Code html={ClassNamesHTML} />
      <Callout>
        Tabsets re-render when these objects (or the render props) change, so in
        large workspaces define them outside of the component (or memoize them)
        rather than inline.
      </Callout>
      <div>
        Each element also has a data attribute (e.g. <code>data-tab</code>), and
        exposes its state as data attributes, which can be used for styling:
      </div>
      <Code html={StylesHTML} />
      <ul className="list-disc pl-6">
        <li>
          Elements within a tabset have a <code>data-tab-placement</code>{" "}
          attribute (see{" "}
          <Link to="/examples/workspace/tab-placement">tab placement</Link>).
        </li>
        <li>
          Each split is a{" "}
          <Link to="/props/group">
            <code>Group</code>
          </Link>{" "}
          with <code>data-split</code> and <code>data-split-id</code>{" "}
          attributes; its <code>gap</code> (set with the <code>split</code>{" "}
          entry of <code>classNames</code> or <code>styles</code>) adds space
          between tabsets, and counts toward their minimum sizes.
        </li>
        <li>
          Separators between tabsets are rendered by the{" "}
          <code>renderSeparator</code> prop, which should return a{" "}
          <Link to="/props/separator">
            <code>Separator</code>
          </Link>{" "}
          (or <code>null</code>, in which case tabsets can still be resized by
          dragging their edges).
        </li>
        <li>
          The content of the element that follows the pointer while a tab is
          dragged can be customized with the <code>renderDragPreview</code>{" "}
          prop.
        </li>
      </ul>
      <Callout intent="warning">
        A maximized tabset is rendered above the rest of the workspace, so it
        should have a background.
      </Callout>
    </Box>
  );
}
