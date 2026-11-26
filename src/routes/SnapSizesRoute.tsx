import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as SnapBehaviorOnReleaseHTML } from "../../public/generated/examples/SnapBehaviorOnRelease.json";
import { html as SnapBehaviorOnReleasePreviewHTML } from "../../public/generated/examples/SnapBehaviorOnReleasePreview.json";
import { html as SnapSizesHTML } from "../../public/generated/examples/SnapSizes.json";
import { Link } from "../components/Link";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function SnapSizesRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Snapping" />
      <div>
        Panels can be limited to a set of sizes. Snap sizes use the same units
        as <Link to="/examples/min-max-sizes">min/max sizes</Link>. Dragging a
        separator snaps it to the nearest snap size, and arrow keys move a
        focused separator to the next one. Collapsible panels can also be
        collapsed.
      </div>
      <Code html={SnapSizesHTML} />
      <Group>
        <Panel
          collapsible
          minSize="25%"
          showSizeAsPercentage
          snapSizes={["25%", "50%", "75%"]}
        >
          left
        </Panel>
        <Separator />
        <Panel showSizeAsPercentage>right</Panel>
      </Group>
      <div>
        By default, separators snap while they are dragged. With{" "}
        <code>snapBehavior="on-release"</code>, separators move freely and then
        snap once they are released.
      </div>
      <Code html={SnapBehaviorOnReleaseHTML} />
      <Group snapBehavior="on-release">
        <Panel showSizeAsPercentage snapSizes={["25%", "50%", "75%"]}>
          left
        </Panel>
        <Separator />
        <Panel showSizeAsPercentage>right</Panel>
      </Group>
      <div>
        This behavior can also be combined with the{" "}
        <Link to="/examples/panel-resize-behavior">resize preview</Link>{" "}
        feature, which shows where the separator will snap to while it is
        dragged.
      </div>
      <Code html={SnapBehaviorOnReleasePreviewHTML} />
      <Group resizePreviewMode="separator" snapBehavior="on-release">
        <Panel showSizeAsPercentage snapSizes={["25%", "50%", "75%"]}>
          left
        </Panel>
        <Separator />
        <Panel showSizeAsPercentage>right</Panel>
      </Group>
      <Callout intent="primary">
        Snap sizes outside of a panel's min/max sizes are ignored. Default
        layouts and the imperative <code>resize</code> and{" "}
        <code>setLayout</code> APIs are snapped too, as are pixel-based snap
        sizes when the group is resized.
      </Callout>
    </Box>
  );
}
