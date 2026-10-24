import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/20/solid";
import { useState } from "react";
import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { html as SeparatorsExampleHTML } from "../../public/generated/examples/ConditionalSeparators.json";
import { DemoButton } from "../components/DemoButton";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function ConditionalPanelsRoute() {
  const [hideLeftPanel, setHideLeftPanel] = useState(false);
  const [hideRightPanel, setHideRightPanel] = useState(false);

  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Conditional panels" />
      <div>Panels can be conditionally rendered.</div>
      <Code html={SeparatorsExampleHTML} />
      <Group>
        {hideLeftPanel ? (
          <DemoButton
            onClick={() => setHideLeftPanel(false)}
            title="Show left panel"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </DemoButton>
        ) : (
          <>
            <Panel id="left" minSize={50}>
              left
            </Panel>
            <DemoButton
              onClick={() => setHideLeftPanel(true)}
              title="Hide left panel"
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </DemoButton>
            <Separator />
          </>
        )}
        <Panel id="center" minSize={100}>
          center
        </Panel>
        {hideRightPanel ? (
          <DemoButton
            onClick={() => setHideRightPanel(false)}
            title="Show right panel"
          >
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          </DemoButton>
        ) : (
          <>
            <Separator />
            <DemoButton
              onClick={() => setHideRightPanel(true)}
              title="Hide right panel"
            >
              <ChevronDoubleRightIcon className="w-4 h-4" />
            </DemoButton>
            <Panel id="right" minSize={50}>
              right
            </Panel>
          </>
        )}
      </Group>
      <Callout intent="warning">
        Conditional panels should also specify ids to help match previous, saved
        layouts.
      </Callout>
      <Callout intent="warning">
        It is recommended to use <code>usePanelCallbackRef</code> rather than{" "}
        <code>usePanelRef</code> when attaching a ref to a
        conditionally-rendered panel. See{" "}
        <ExternalLink href="https://github.com/bvaughn/react-resizable-panels/issues/717">
          issue #717
        </ExternalLink>{" "}
        for more information.
      </Callout>
    </Box>
  );
}
