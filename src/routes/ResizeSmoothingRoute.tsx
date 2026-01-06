import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as ExampleHTML } from "../../public/generated/examples/ResizeSmoothing.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function ResizeSmoothingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Resize smoothing" />
      <div>
        Smooth layout changes using an exponential moving average via the{" "}
        <code>resizeSmoothing</code> prop on <code>Group</code>.
      </div>
      <Code html={ExampleHTML} />
      <Group className="h-20 sm:h-15" resizeSmoothing>
        <Panel collapsedSize={128} collapsible minSize={256}>
          Drag or collapse this panel to see smoothing in action.
        </Panel>
        <Separator />
        <Panel collapsedSize={128} collapsible minSize={256}>
          Resize this panel to feel the eased motion.
        </Panel>
      </Group>
      <Callout intent="primary">
        Use <code>resizeSmoothing</code> with a number between 0 and 1 to
        control the smoothing amount, or pass <code>true</code> to use the
        default value (0.2).
      </Callout>
    </Box>
  );
}
