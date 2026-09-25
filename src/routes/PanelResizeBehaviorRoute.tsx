import { Box, Callout, Code, Header } from "react-lib-tools";
import { SeparatorOverlay } from "react-resizable-panels";
import { html as ResizePreviewModeHTML } from "../../public/generated/examples/ResizePreviewMode.json";
import { html as ResizePreviewWithImplicitSeparatorHTML } from "../../public/generated/examples/ResizePreviewWithImplicitSeparator.json";
import { html as ResizePreviewWithSeparatorOverlayHTML } from "../../public/generated/examples/ResizePreviewWithSeparatorOverlay.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";
import { Link } from "../components/Link";

export default function PanelResizeBehaviorRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Panel resize behavior" />
      <div>
        Dragging a resize separator causes panels to re-render with updated
        sizes. In most cases, this is what you want, but if re-rendering the
        contents of a panel is too slow, the <code>resizePreviewMode</code> prop
        can be used to defer the re-render until the resize is finished.
      </div>
      <Code html={ResizePreviewModeHTML} />
      <div>
        In place of a panel update, an overlay separator will be rendered
        instead, as shown in the group below.
      </div>
      <Group resizePreviewMode="separator">
        <Panel minSize="10%" showSizeAsPercentage>
          left
        </Panel>
        <Separator />
        <Panel minSize="10%" showSizeAsPercentage>
          right
        </Panel>
      </Group>
      <div>
        By default, this overlay separator is just a partially transparent copy
        of the separator element being dragged. The `SeparatorOverlay` component
        allows users to customize the overlay.
      </div>
      <Code html={ResizePreviewWithSeparatorOverlayHTML} />
      <Group resizePreviewMode="separator">
        <Panel minSize="10%" showSizeAsPercentage>
          left
        </Panel>
        <Separator className="[&[data-separator='active']]:bg-slate-600" />
        <Panel minSize="10%" maxSize="50%" showSizeAsPercentage>
          center
        </Panel>
        <Separator className="[&[data-separator='active']]:bg-slate-600" />
        <Panel minSize="10%" showSizeAsPercentage>
          right
        </Panel>
        <SeparatorOverlay className="w-2 rounded rounded-xs bg-sky-500 data-[separator-overlay=inactive]:bg-sky-700 opacity-80" />
      </Group>
      <div>
        Resize preview mode works even for groups with implicit separators.
      </div>
      <Code html={ResizePreviewWithImplicitSeparatorHTML} />
      <Group resizePreviewMode="separator">
        <Panel minSize="10%" showSizeAsPercentage>
          left
        </Panel>
        <Panel minSize="10%" maxSize="50%" showSizeAsPercentage>
          center
        </Panel>
        <Panel minSize="10%" showSizeAsPercentage>
          right
        </Panel>
        <SeparatorOverlay className="w-1 bg-sky-500 data-[separator-overlay=inactive]:bg-sky-700 opacity-80" />
      </Group>
      <Callout>
        The <code>data-separator-overlay</code> attribute can be used to
        differentiate between a separator that's being active dragged and one
        that's being moved as a result of{" "}
        <Link to="/examples/min-max-sizes">min/max size constraints</Link>.
      </Callout>
    </Box>
  );
}
