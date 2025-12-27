import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as CustomStylesExampleHTML } from "../../public/generated/examples/SeparatorCustomStyles.json";
import { html as DataAttributesExampleHTML } from "../../public/generated/examples/SeparatorDataAttributes.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

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
      <Callout intent="success">
        When styling a Separator, use the <code>data-separator</code> attribute
        rather than <code>:hover</code> or <code>:active</code> pseudo-classes.
        This attribute is updated when the pointer is near enough to a separator
        element to be interactive, even if it is not directly on top of the
        element.
      </Callout>
      <Code html={DataAttributesExampleHTML} />
      <div>An example using Tailwind CSS might look something like this.</div>
      <Code html={CustomStylesExampleHTML} />
      <Group className="h-15">
        <Panel>left</Panel>
        <Separator />
        <Panel>right</Panel>
      </Group>
    </Box>
  );
}
