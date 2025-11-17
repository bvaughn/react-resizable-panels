import { Group } from "react-resizable-panels";
import { html as HorizontalHTML } from "../../public/generated/code-snippets/LayoutBasicsHorizontal.json";
import { html as ResizeHandleHTML } from "../../public/generated/code-snippets/LayoutBasicsResizeHandle.json";
import { html as VerticalHTML } from "../../public/generated/code-snippets/LayoutBasicsVertical.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { ExternalLink } from "../components/ExternalLink";
import { Header } from "../components/Header";
import { Panel } from "../components/styled-panels/Panel";
import { ResizeHandle } from "../components/styled-panels/ResizeHandle";

export default function LayoutBasicsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="The basics" />
      <div>
        The simplest resizable panel configuration is two panels within a group.
      </div>
      <Code html={HorizontalHTML} />
      <Group className="h-15 gap-1">
        <Panel>left</Panel>
        <Panel>right</Panel>
      </Group>
      <div>
        Resizable panels use a{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Basic_concepts">
          flexbox
        </ExternalLink>{" "}
        layout. The default direction is horizontal but the{" "}
        <code>direction</code> prop can be used for a vertical layout.
      </div>
      <Code html={VerticalHTML} />
      <Group className="h-30 gap-1" direction="vertical">
        <Panel>top</Panel>
        <Panel>bottom</Panel>
      </Group>
      <div>
        Panels can be resized by clicking on their borders, but explicit resize
        handles can often improve UX.
      </div>
      <Group className="h-15 gap-1">
        <Panel>left</Panel>
        <ResizeHandle direction="horizontal" />
        <Panel>right</Panel>
      </Group>
      <Code html={ResizeHandleHTML} />
      <Callout intent="primary">
        Resize handles improve keyboard accessibility by providing a
        tab-focusable{" "}
        <ExternalLink href="https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/">
          window splitter
        </ExternalLink>{" "}
        element.
      </Callout>
    </Box>
  );
}
