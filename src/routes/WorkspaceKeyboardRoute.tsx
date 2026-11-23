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
        <li>
          <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>PageUp</kbd> and <kbd>Ctrl</kbd>
          +<kbd>Shift</kbd>+<kbd>PageDown</kbd> move the focused tab one place
          earlier or later in its tab list (unless it can't be dragged), keeping
          focus on it without changing which tab is selected; nothing happens at
          either end
        </li>
        <li>
          <kbd>Ctrl</kbd>+<kbd>M</kbd> (or <kbd>Cmd</kbd>+<kbd>M</kbd>) starts
          docking the focused tab. Arrow keys cycle through available tabsets,
          split regions, and workspace edges, using the same drop indicator as
          dragging. <kbd>Enter</kbd> moves the tab; <kbd>Escape</kbd> cancels.
          Moving focus elsewhere or pressing <kbd>Tab</kbd> also cancels.
        </li>
      </ul>
      <Callout>
        Moving a tab from the keyboard is checked like dropping it at the same
        place: <code>disableDrop</code> can reject it, and it's reported to{" "}
        <code>onBeforeModelChange</code> and <code>onModelChanged</code> with
        the <code>"move"</code> reason (and <code>isUserInteraction: true</code>
        ). Tabs that can be moved have an <code>aria-keyshortcuts</code>{" "}
        attribute, so screen readers can announce these keys.
      </Callout>
      <div>
        Docking destinations and results are announced in a live region. Use{" "}
        <code>getKeyboardMoveAnnouncement</code> to localize these messages; its
        argument contains the <code>phase</code>, <code>tab</code>, and{" "}
        <code>target</code>. Set <code>{"keyboardMove={false}"}</code> to
        disable both docking shortcuts and keyboard reordering.
      </div>
      <div>
        Applications can also provide a “Move to…” menu using the workspace's{" "}
        <code>moveTab</code> imperative method. A menu offers destinations to
        screen reader and switch users without requiring a keyboard shortcut.
        Apply your application's movement restrictions when building that menu:
        imperative methods are not restricted by <code>disableDrop</code>.
      </div>
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
