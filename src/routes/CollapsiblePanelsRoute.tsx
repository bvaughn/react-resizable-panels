import { Group } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/code-snippets/CollapsiblePanels.json";
import { html as ExampleWithCollapsedSizeHTML } from "../../public/generated/code-snippets/CollapsiblePanelsCollapsedSize.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { Header } from "../components/Header";
import { ResizeHandle } from "../components/styled/ResizeHandle";
import { Panel } from "../components/styled/Panel";

export default function CollapsiblePanelsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="The basics" />
      <div>
        Panels can be configured to be collapsible using the{" "}
        <code>collapsible</code> and <code>minSize</code> properties.
      </div>
      <Code html={ExampleHTML} />
      <Group className="h-15 gap-1">
        <Panel collapsible maxSize="25%" minSize={100} />
        <ResizeHandle />
        <Panel>
          The panel on the left is will collapse if resized smaller than 100
          pixels.
        </Panel>
      </Group>
      <div>
        The <code>collapsedSize</code> property can also be used to specify a
        custom collapsed size.
      </div>
      <Code html={ExampleWithCollapsedSizeHTML} />
      <Group className="h-15 gap-1">
        <Panel
          collapsedSize={25}
          collapsible
          maxSize="25%"
          minSize={100}
        ></Panel>
        <Panel>The panel on the left collapses to a size of 25 pixels.</Panel>
      </Group>
      <div>This enables building UIs like VS Code's "Folders" side panel.</div>
      <Callout intent="primary">
        It's usually a good idea to include a <code>ResizeHandle</code> for
        panels that can be collapsed fully, as this helps when reopening them.
      </Callout>
    </Box>
  );
}
