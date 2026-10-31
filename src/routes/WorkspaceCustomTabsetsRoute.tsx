import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as ConfirmCloseHTML } from "../../public/generated/examples/WorkspaceCustomTabConfirmClose.json";
import { html as CustomTabsetHTML } from "../../public/generated/examples/WorkspaceCustomTabset.json";
import { Link } from "../components/Link";

export default function WorkspaceCustomTabsetsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Custom tabsets" />
      <div>
        By default, each tabset shows a list of tabs (with close buttons) above
        its content. The <code>tabPlacement</code> prop moves the list to
        another <Link to="/examples/workspace/tab-placement">side</Link>, and
        these props customize what a tabset contains:
      </div>
      <ul className="list-disc pl-6">
        <li>
          <code>renderTab</code> renders each tab.
        </li>
        <li>
          <code>renderTabsetToolbar</code> renders content after the tabs (e.g.
          buttons to add a tab or maximize the tabset).
        </li>
        <li>
          <code>renderEmptyTabset</code> renders content in tabsets without
          tabs.
        </li>
      </ul>
      <Code html={CustomTabsetHTML} />
      <div>
        <code>renderTab</code> receives the props that make an element a tab
        (its role and ARIA attributes, keyboard and pointer handling, data
        attributes, and a <code>ref</code>); spread them onto the element it
        returns. The{" "}
        <Link to="/props/tab-close-button">
          <code>TabCloseButton</code>
        </Link>{" "}
        component closes the tab it's rendered within.
      </div>
      <Callout>
        Buttons (and other elements with <code>role="button"</code> or a{" "}
        <code>data-tab-ignore</code> attribute) within a tab don't select or
        drag it.
      </Callout>
      <div>
        Props can be overridden or wrapped. For example, to confirm before
        closing a tab with unsaved changes (whether by its close button or the
        Delete key):
      </div>
      <Code html={ConfirmCloseHTML} />
      <div>
        Like the rest of the library, tabsets are unstyled; see{" "}
        <Link to="/examples/workspace/styling">styling</Link>.
      </div>
    </Box>
  );
}
