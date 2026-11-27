import { Box, Code, Header } from "react-lib-tools";
import { html as MinMaxExampleHTML } from "../../public/generated/examples/SizeConstraintsMinMax.json";
import { html as PercentageExampleHTML } from "../../public/generated/examples/SizeConstraintsPercentage.json";
import { Link } from "../components/Link";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function SizeConstraintsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Min/max sizes" />
      <div>
        Panels can be configured with minimum/maximum allowed sizes, using any
        of the <Link to="/examples/sizing">size units</Link>.
      </div>
      <div>
        For example, the left panel below only allows itself to be resized
        between 100-200 pixels.
      </div>
      <Code html={MinMaxExampleHTML} />
      <Group>
        <Panel minSize={100} maxSize={200} showSizeInPixels>
          left
        </Panel>
        <Separator />
        <Panel>right</Panel>
      </Group>
      <div>
        As another example, this panel group will not allow any individual panel
        to be smaller than 10% of the group's width.
      </div>
      <Code html={PercentageExampleHTML} />
      <Group>
        <Panel id="left" minSize="10%" showSizeAsPercentage>
          left
        </Panel>
        <Separator />
        <Panel id="middle" minSize="10%" showSizeAsPercentage>
          middle
        </Panel>
        <Separator />
        <Panel id="right" minSize="10%" showSizeAsPercentage>
          right
        </Panel>
      </Group>
    </Box>
  );
}
