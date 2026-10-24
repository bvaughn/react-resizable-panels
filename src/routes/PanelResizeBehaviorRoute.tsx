import { Box, Callout, Code, Header } from "react-lib-tools";
import { SeparatorOverlay } from "react-resizable-panels";
import { html as ResizePreviewModeHTML } from "../../public/generated/examples/ResizePreviewMode.json";
import { html as ResizePreviewWithImplicitSeparatorHTML } from "../../public/generated/examples/ResizePreviewWithImplicitSeparator.json";
import { html as ResizePreviewWithSeparatorOverlayHTML } from "../../public/generated/examples/ResizePreviewWithSeparatorOverlay.json";
import { Link } from "../components/Link";
import {
  DemoPanel,
  RequestDetails,
  RequestHeaders,
  RequestLog,
  RequestLogDemo
} from "../components/request-log/RequestLog";
import { Group } from "../components/styled-panels/Group";
import { Separator } from "../components/styled-panels/Separator";

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
        instead. In the group below, the panels (and their sizes) only update
        once the separator is released.
      </div>
      <RequestLogDemo />
      <div>
        By default, this overlay separator is just a partially transparent copy
        of the separator element being dragged. The{" "}
        <code>SeparatorOverlay</code> component allows users to customize the
        overlay.
      </div>
      <Code html={ResizePreviewWithSeparatorOverlayHTML} />
      <Group className="h-72!" resizePreviewMode="separator">
        <DemoPanel minSize="20%" title="Requests">
          <RequestLog />
        </DemoPanel>
        <Separator className="[&[data-separator='active']]:bg-slate-600" />
        <DemoPanel maxSize="50%" minSize="20%" title="Response">
          <RequestDetails />
        </DemoPanel>
        <Separator className="[&[data-separator='active']]:bg-slate-600" />
        <DemoPanel minSize="20%" title="Headers">
          <RequestHeaders />
        </DemoPanel>
        <SeparatorOverlay className="w-2 rounded rounded-xs bg-violet-400 data-[separator-overlay=inactive]:bg-violet-700 opacity-80" />
      </Group>
      <div>
        Resize preview mode works even for groups with implicit separators.
      </div>
      <Code html={ResizePreviewWithImplicitSeparatorHTML} />
      <Group className="h-72!" resizePreviewMode="separator">
        <DemoPanel minSize="20%" title="Requests">
          <RequestLog />
        </DemoPanel>
        <DemoPanel maxSize="50%" minSize="20%" title="Response">
          <RequestDetails />
        </DemoPanel>
        <DemoPanel minSize="20%" title="Headers">
          <RequestHeaders />
        </DemoPanel>
        <SeparatorOverlay className="w-1 bg-violet-400 data-[separator-overlay=inactive]:bg-violet-700 opacity-80" />
      </Group>
      <Callout>
        The <code>data-separator-overlay</code> attribute can be used to
        differentiate between a separator that's being actively dragged and one
        that's being moved as a result of{" "}
        <Link to="/examples/min-max-sizes">min/max size constraints</Link>.
      </Callout>
    </Box>
  );
}
