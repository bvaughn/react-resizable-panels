import { Group, Panel, ResizeHandle } from "react-resizable-panels";
import { html as HorizontalHTML } from "../../public/generated/code-snippets/LayoutBasicsHorizontal.json";
import { html as ResizeHandleHTML } from "../../public/generated/code-snippets/LayoutBasicsResizeHandle.json";
import { html as VerticalHTML } from "../../public/generated/code-snippets/LayoutBasicsVertical.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { ExternalLink } from "../components/ExternalLink";
import { Header } from "../components/Header";
import { Text } from "../components/Text";

export default function LayoutBasicsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="The basics" />
      <div>
        The simplest resizable panel configuration is two panels within a group.
      </div>
      <Code html={HorizontalHTML} />
      <Group className="h-15 gap-1">
        <Panel className="border border-2 border-slate-700 rounded">
          <Text>left</Text>
        </Panel>
        <Panel className="border border-2 border-slate-700 rounded">
          <Text>right</Text>
        </Panel>
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
        <Panel className="border border-2 border-slate-700 rounded">
          <Text>top</Text>
        </Panel>
        <Panel className="border border-2 border-slate-700 rounded">
          <Text>bottom</Text>
        </Panel>
      </Group>
      <div>
        Panels can be resized by clicking on their borders, but explicit resize
        handles can often improve UX.
      </div>
      <Group className="h-15 gap-1">
        <Panel className="border border-2 border-slate-700 rounded">
          <Text>left</Text>
        </Panel>
        <ResizeHandle className="w-2 rounded bg-slate-700" />
        <Panel className="border border-2 border-slate-700 rounded">
          <Text>right</Text>
        </Panel>
      </Group>
      <Code html={ResizeHandleHTML} />
      <Callout intent="primary">
        Explicit resize handles are important for keyboard accessibility.
      </Callout>
    </Box>
  );
}
