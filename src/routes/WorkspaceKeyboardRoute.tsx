import { Box, Callout, ExternalLink, Header } from "react-lib-tools";
import { Link } from "../components/Link";

export default function WorkspaceKeyboardRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Keyboard and accessibility" />
      <div>
        Tabsets follow the{" "}
        <ExternalLink href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/">
          ARIA tabs pattern
        </ExternalLink>
        : each tab list has <code>role="tablist"</code>, each tab has{" "}
        <code>role="tab"</code>, and each tab's content has{" "}
        <code>role="tabpanel"</code>, linked to its tab. Only one tab per list
        (normally the selected one) is in the page's tab order; within a list,
        focus moves with the arrow keys:
      </div>
      <ul className="list-disc pl-6">
        <li>
          <kbd>←</kbd> and <kbd>→</kbd> (or <kbd>↑</kbd> and <kbd>↓</kbd> when
          tabs are placed on the left or right) move focus to the previous or
          next tab, wrapping at the ends
        </li>
        <li>
          <kbd>Home</kbd> and <kbd>End</kbd> move focus to the first or last tab
        </li>
        <li>
          <kbd>Enter</kbd> or <kbd>Space</kbd> selects the focused tab (or, on
          the selected tab of a{" "}
          <Link to="/examples/workspace/collapsing-and-maximizing">
            collapsible tabset
          </Link>
          , collapses or expands it)
        </li>
        <li>
          <kbd>Delete</kbd> or <kbd>Backspace</kbd> closes the focused tab
          (unless closing is disabled) and moves focus to its neighbor
        </li>
      </ul>
      <Callout>
        Tabs use manual activation: moving focus doesn't select a tab, so
        arrowing past a tab doesn't mount its content.
      </Callout>
      <div>
        The separators between tabsets are tab-focusable{" "}
        <ExternalLink href="https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/">
          window splitters
        </ExternalLink>
        , so tabsets can be resized with the keyboard like any other{" "}
        <Link to="/props/separator">
          <code>Separator</code>
        </Link>{" "}
        (including the invisible default ones). A visible separator can also
        show keyboard users which one has focus (see{" "}
        <Link anchor="separators" to="/examples/workspace/sizing">
          separators
        </Link>
        ).
      </div>
      <div>
        Custom tabs keep this behavior as long as they spread the props that{" "}
        <code>renderTab</code> receives onto the element they return (see{" "}
        <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link>).
        The{" "}
        <Link to="/props/tabset-collapse-button">
          <code>TabsetCollapseButton</code>
        </Link>{" "}
        and{" "}
        <Link to="/props/tabset-maximize-button">
          <code>TabsetMaximizeButton</code>
        </Link>{" "}
        components set the ARIA attributes their toggles need (
        <code>aria-expanded</code> and <code>aria-pressed</code>).
      </div>
    </Box>
  );
}
