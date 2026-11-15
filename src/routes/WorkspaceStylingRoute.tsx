import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as ClassNamesHTML } from "../../public/generated/examples/WorkspaceClassNames.json";
import { html as ClassNamesFunctionsHTML } from "../../public/generated/examples/WorkspaceClassNamesFunctions.json";
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
        Entries for the elements of a tabset, tab, or split can also be
        functions of it (and its state, like{" "}
        <Link to="/hooks/use-parent-tabset-state">
          <code>useParentTabsetState</code>
        </Link>{" "}
        returns), e.g. to style tabsets and tabs by their <code>data</code>:
      </div>
      <Code html={ClassNamesFunctionsHTML} />
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
          <code>renderSeparator</code> prop (see{" "}
          <Link anchor="separators" to="/examples/workspace/sizing">
            separators
          </Link>
          ).
        </li>
        <li>
          Elements within a collapsed tabset have a{" "}
          <code>data-tabset-collapsed</code> attribute, and their{" "}
          <code>data-tab-placement</code> is the side its header runs along
          while collapsed (e.g. <code>"left"</code> for a sidebar).
        </li>
        <li>
          While something is dragged, the drag preview, the drop indicator, and
          the tab or tabset being dragged have data attributes of their own (see{" "}
          <Link
            anchor="drag-previews-and-drop-indicators"
            to="/examples/workspace/drag-and-drop"
          >
            drag previews and drop indicators
          </Link>
          ).
        </li>
      </ul>
      <Callout intent="warning">
        A maximized tabset is rendered above the rest of the workspace, so it
        should have a background.
      </Callout>
    </Box>
  );
}
