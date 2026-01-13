import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as ExampleHTML } from "../../public/generated/examples/CollapsiblePanels.json";
import { html as ExampleCollapsedByDefaultHTML } from "../../public/generated/examples/CollapsiblePanelsCollapsedByDefault.json";
import { html as ExampleWithCollapsedSizeHTML } from "../../public/generated/examples/CollapsiblePanelsCollapsedSize.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function CollapsiblePanelsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Collapsible panels" />
      <div>
        Panels can be configured to be collapsible using the{" "}
        <code>collapsible</code> and <code>minSize</code> properties.
      </div>
      <Code html={ExampleHTML} />
      <Group>
        <Panel collapsible maxSize="75%" minSize={100} showSizeInPixels />
        <Separator />
        <Panel>
          The panel on the left has a minimum size of 100 pixels. It will
          collapse entirely if resized smaller than 50 pixels.
        </Panel>
      </Group>
      <Callout intent="primary">
        Although it isn't required, it's recommended that you also render a{" "}
        <code>Separator</code> for panels that can be collapsed fully. This
        separator gives users something to click to re-open a panel after it's
        been collapsed.
      </Callout>
      <div>
        The <code>collapsedSize</code> property can also be provided to prevent
        a panel from disappearing fully when collapsed.
      </div>
      <Code html={ExampleWithCollapsedSizeHTML} />
      <Group>
        <Panel
          collapsedSize={35}
          collapsible
          maxSize="75%"
          minSize={100}
          showSizeInPixels
        />
        <Separator />
        <Panel>The panel on the left collapses to a width of 35 pixels.</Panel>
      </Group>
      <div>This enables building UIs like VS Code's "Folders" side panel.</div>
      <Callout intent="primary">
        A panel's collapse threshold is half its minimum size.
      </Callout>
      <div>
        Collapsible panels can also be collapsed by default by setting their{" "}
        <code>defaultSize</code> to 0 (pixels or percent).
      </div>
      <Code html={ExampleCollapsedByDefaultHTML} />
      <Group>
        <Panel
          collapsible
          defaultSize={0}
          maxSize="75%"
          minSize="10%"
          showSizeAsPercentage
        />
        <Separator />
        <Panel>
          The panel on the left is collapsed by default but can be expanded by
          dragging the separator.
        </Panel>
      </Group>
    </Box>
  );
}
