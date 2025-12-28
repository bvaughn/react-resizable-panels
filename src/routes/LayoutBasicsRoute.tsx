import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { html as HorizontalHTML } from "../../public/generated/examples/LayoutBasicsHorizontal.json";
import { html as SeparatorHTML } from "../../public/generated/examples/LayoutBasicsSeparator.json";
import { html as VerticalHTML } from "../../public/generated/examples/LayoutBasicsVertical.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function LayoutBasicsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="The basics" />
      <div>
        The simplest resizable panel configuration is two panels within a group.
      </div>
      <Code html={HorizontalHTML} />
      <Group className="h-15">
        <Panel>left</Panel>
        <Panel>right</Panel>
      </Group>
      <div>
        Panel groups use a{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Basic_concepts">
          flexbox
        </ExternalLink>{" "}
        layout with a default orientation of <em>horizontal</em> but the{" "}
        <code>orientation</code> prop can be used to specify a <em>vertical</em>{" "}
        layout.
      </div>
      <Code html={VerticalHTML} />
      <Callout intent="warning">
        Vertical groups require an explicit height to be set using either{" "}
        <code>className</code> or <code>style</code> props.
      </Callout>
      <Group className="h-30" orientation="vertical">
        <Panel>top</Panel>
        <Panel>bottom</Panel>
      </Group>
      <div>
        Panels can be resized by clicking on their borders but explicit
        separators can be rendered to improve UX.
      </div>
      <Group className="h-15">
        <Panel>left</Panel>
        <Separator orientation="horizontal" />
        <Panel>right</Panel>
      </Group>
      <Code html={SeparatorHTML} />
      <Callout intent="primary">
        Separators improve keyboard accessibility by providing a tab-focusable{" "}
        <ExternalLink href="https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/">
          window splitter
        </ExternalLink>{" "}
        element.
      </Callout>
    </Box>
  );
}
