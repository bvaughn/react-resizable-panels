import {
  Box,
  Callout,
  Code,
  ExternalLink,
  Header,
  SectionHeader
} from "react-lib-tools";
import { html as SeparatorsHTML } from "../../public/generated/examples/WorkspaceSeparators.json";
import { WorkspaceDemo } from "../components/workspace/WorkspaceDemo";
import { Link } from "../components/Link";

export default function WorkspaceSeparatorsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Separators and accessibility" />
      <div>
        By default, a workspace renders an unstyled{" "}
        <Link to="/props/separator">
          <code>Separator</code>
        </Link>{" "}
        between tabsets. It takes up no space and can't be seen, so tabsets are
        resized by dragging the space between them (like in the{" "}
        <Link to="/examples/workspace">basics</Link> demo). Rendering visible
        separators with the <code>renderSeparator</code> prop is recommended; it
        receives the orientation of the split, so separators between tabsets
        side by side can be given a width and those between stacked tabsets a
        height:
      </div>
      <Code html={SeparatorsHTML} />
      <WorkspaceDemo />
      <ul className="list-disc pl-6">
        <li>
          Visible separators show users where tabsets can be resized, and give
          them something to grab.
        </li>
        <li>
          Separators are tab-focusable{" "}
          <ExternalLink href="https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/">
            window splitters
          </ExternalLink>
          , so tabsets can be resized with the keyboard (by the default
          separators too); a visible separator can also show keyboard users
          which one has focus.
        </li>
      </ul>
      <Callout>
        To render no separators at all, return <code>null</code> from{" "}
        <code>renderSeparator</code>. Tabsets can still be resized by dragging
        the edges between them, but not with the keyboard.
      </Callout>
      <SectionHeader>Keyboard and accessibility</SectionHeader>
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
          <kbd>Enter</kbd> or <kbd>Space</kbd> selects the focused tab
        </li>
        <li>
          <kbd>Delete</kbd> or <kbd>Backspace</kbd> closes the focused tab
          (unless closing is disabled) and moves focus to its neighbor
        </li>
      </ul>
      <Callout>
        Tabs use manual activation: moving focus doesn't select a tab, so
        arrowing past a tab doesn't mount its content. Separators between
        tabsets can be resized with the keyboard like any other{" "}
        <Link to="/props/separator">
          <code>Separator</code>
        </Link>
        .
      </Callout>
    </Box>
  );
}
