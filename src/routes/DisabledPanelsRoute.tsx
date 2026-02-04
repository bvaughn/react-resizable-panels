import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as DisabledSeparatorHTML } from "../../public/generated/examples/DisabledSeparator.json";
import { html as DisabledPanelsHTML } from "../../public/generated/examples/DisabledPanels.json";
import { html as DisabledPanelHTML } from "../../public/generated/examples/DisabledPanel.json";
import { html as DisabledPanelAndSeparatorHTML } from "../../public/generated/examples/DisabledPanelAndSeparator.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function DisabledPanelsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Disabling interactions" />
      <div>
        <code>Panel</code> and <code>Separator</code> components can be disabled
        to disable or limit resize behavior. Below are a few examples of how
        this can be used to implement different types of UIs.
      </div>
      <div>
        In groups with only two panels, disabling a separator is sufficient to
        completely prevent resizing.
      </div>
      <Code html={DisabledSeparatorHTML} />
      <Group>
        <Panel>left</Panel>
        <Separator disabled />
        <Panel>right</Panel>
      </Group>
      <div>
        The same applies to disabling one or both panels when there is no
        explicit separator element.
      </div>
      <Callout intent="primary">
        Note this is functionally the same as disabling the entire{" "}
        <code>Group</code> component.
      </Callout>
      <Code html={DisabledPanelsHTML} />
      <Group>
        <Panel disabled>left</Panel>
        <Panel disabled>right</Panel>
      </Group>
      <div>
        In groups with three or more panels, disabling a separator does not
        completely prevent a panel from being resized. In the example below,
        resizing the center panel can indirectly cause the left panel to be
        resized as well.
      </div>
      <Group>
        <Panel>left</Panel>
        <Separator disabled />
        <Panel>center</Panel>
        <Separator />
        <Panel>right</Panel>
      </Group>
      <div>
        Disabling a panel prevents it from being resized, though its separator
        can still be used to resize other panels.
      </div>
      <Code html={DisabledPanelHTML} />
      <Group>
        <Panel>left</Panel>
        <Separator />
        <Panel disabled>center (disabled)</Panel>
        <Separator />
        <Panel>right</Panel>
      </Group>
      <div>
        You can also disable both a panel and its separator to completely
        prevent them from being resized or interacted with in any way.
      </div>
      <Code html={DisabledPanelAndSeparatorHTML} />
      <Group>
        <Panel disabled>left (disabled)</Panel>
        <Separator disabled />
        <Panel>center</Panel>
        <Separator />
        <Panel>right</Panel>
      </Group>
    </Box>
  );
}
