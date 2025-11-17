import { Group } from "react-resizable-panels";
import { html as CustomStylesExampleHTML } from "../../public/generated/code-snippets/ResizeHandleCustomStyles.json";
import { html as DataAttributesExampleHTML } from "../../public/generated/code-snippets/ResizeHandleDataAttributes.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { Header } from "../components/Header";
import { Panel } from "../components/styled-panels/Panel";
import { ResizeHandle } from "../components/styled-panels/ResizeHandle";

export default function CustomStylesRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Custom CSS styles" />
      <div>
        <code>className</code> and <code>style</code> props can be used to
        customize styles, but there are a few limitations to remember:
      </div>
      <ul className="pl-8">
        <li className="list-disc">
          Certain style properties cannot be overridden; (refer to component
          documentation for a list of specific styles)
        </li>
        <li className="list-disc">
          Panel styles are applied to a nested <code>HTMLDivElement</code> to
          prevent interfering with the Flex layout
        </li>
      </ul>
      <div>
        The ResizeHandle component renders a{" "}
        <code>data-resize-handle-state</code> attribute to support custom styles
        for <em>hover</em> or <em>drag</em> states.
      </div>
      <Code html={DataAttributesExampleHTML} />
      <div>An example using Tailwind CSS might look something like this.</div>
      <Code html={CustomStylesExampleHTML} />
      <Group className="h-15 gap-1">
        <Panel>left</Panel>
        <ResizeHandle />
        <Panel>right</Panel>
      </Group>
      <Callout intent="success">
        Using data-attributes for ResizeHandle styles enables visual updates
        when a pointer is <em>near</em> (but not directly on top of) a draggable
        region.
      </Callout>
    </Box>
  );
}
