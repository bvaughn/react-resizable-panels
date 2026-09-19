import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as GroupResizeBehaviorHTML } from "../../public/generated/examples/GroupResizeBehavior.json";
import { html as GroupResizePreviewModeHTML } from "../../public/generated/examples/GroupResizePreviewMode.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function ResizeBehavior() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Resize behavior" />
      <div className="text-lg font-bold">Resize preview modes</div>
      <div>TODO</div>
      <Code html={GroupResizePreviewModeHTML} />
      <Group resizePreviewMode="separator">
        <Panel minSize="10%">left</Panel>
        <Separator />
        <Panel minSize="10%">right</Panel>
      </Group>
      <div className="text-lg font-bold">
        Freezing panels during group resize
      </div>
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
      <Code html={GroupResizeBehaviorHTML} />
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
