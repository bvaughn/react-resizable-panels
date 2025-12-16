import { Box } from "../components/Box";
import { Header } from "../components/Header";
import { html as PanelsExampleHTML } from "../../public/generated/code-snippets/ConditionalPanels.json";
import { html as SeparatorsExampleHTML } from "../../public/generated/code-snippets/ConditionalSeparators.json";
import { Code } from "../components/code/Code";
import { useState } from "react";
import { Group } from "react-resizable-panels";
import { Panel } from "../components/styled-panels/Panel";
import { Callout } from "../components/Callout";
import { Separator } from "../components/styled-panels/Separator";

export default function ConditionalPanelsRoute() {
  const [hideLeftPanel, setHideLeftPanel] = useState(false);
  const [hideRight, setHideRight] = useState(false);

  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Conditional Panels" />
      <div>Panel can be conditionally rendered.</div>
      <Code html={PanelsExampleHTML} />
      <Box direction="row" gap={4} justify="center">
        <button
          className="bg-sky-700 hover:bg-sky-600 py-1 px-2 rounded cursor-pointer"
          onClick={() => setHideRight(!hideRight)}
        >
          {hideRight ? "show left panel" : "hide left panel"}
        </button>
        <button
          className="bg-sky-700 hover:bg-sky-600 py-1 px-2 rounded cursor-pointer"
          onClick={() => setHideLeftPanel(!hideLeftPanel)}
        >
          {hideLeftPanel ? "show right panel" : "hide right panel"}
        </button>
      </Box>
      <Group className="h-15 gap-1">
        {hideRight || (
          <Panel id="left" minSize={50}>
            left
          </Panel>
        )}
        <Panel id="center" minSize={100}>
          center
        </Panel>
        {hideLeftPanel || (
          <Panel id="right" minSize={50}>
            right
          </Panel>
        )}
      </Group>
      <Callout intent="warning">
        Conditional panels should also specify ids to help match previous, saved
        layouts.
      </Callout>
      <div>Separators can also be conditionally rendered.</div>
      <Code html={SeparatorsExampleHTML} />
      <Group className="h-15 gap-1">
        {hideRight || (
          <>
            <Panel id="left" minSize={50}>
              left
            </Panel>
            <Separator />
          </>
        )}
        <Panel id="center" minSize={100}>
          center
        </Panel>
        {hideLeftPanel || (
          <>
            <Separator />
            <Panel id="right" minSize={50}>
              right
            </Panel>
          </>
        )}
      </Group>
    </Box>
  );
}
