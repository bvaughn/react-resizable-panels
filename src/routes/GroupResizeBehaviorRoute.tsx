import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as ExampleHTML } from "../../public/generated/examples/GroupResizeBehavior.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function GroupResizeBehaviorRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Group resize behavior" />
      <div>
        Resizing a group typically affects the size of panels within the group.
        The <code>groupResizeBehavior</code> prop can be used override this
        behavior and freeze specific panels (in terms of their pixels sizes)
        while the group is resized.
      </div>
      <div>
        For an example of this, resize the browser window while keeping an eye
        on the left panel below.
      </div>
      <Code html={ExampleHTML} />
      <Group>
        <Panel
          defaultSize={250}
          groupResizeBehavior="preserve-pixel-size"
          minSize={125}
          showSizeAsPercentage
          showSizeInPixels
        >
          left (frozen)
        </Panel>
        <Separator />
        <Panel minSize={125} showSizeAsPercentage showSizeInPixels>
          right
        </Panel>
      </Group>
      <Callout>
        Minor pixel changes in the panel above are due to precision/rounding.
      </Callout>
      <Callout intent="warning">
        Groups are required to contain at least one panel without{" "}
        <code>{`groupResizeBehavior="preserve-pixel-size"`}</code>.
      </Callout>
    </Box>
  );
}
