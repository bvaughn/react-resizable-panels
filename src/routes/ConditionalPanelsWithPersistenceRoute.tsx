import { useMemo, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/code-snippets/ConditionalPanelsWithPersistence.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { Header } from "../components/Header";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function ConditionalPanelsWithPersistenceRoute() {
  const [hideMiddlePanel, setHideMiddlePanel] = useState(false);

  // Compute current panel IDs based on conditional rendering
  const panelIds = useMemo(
    () =>
      hideMiddlePanel ? ["left", "right"] : ["left", "middle", "right"],
    [hideMiddlePanel]
  );

  const { defaultLayout, onLayoutChange } = useDefaultLayout({
    groupId: "conditional-persistent-demo",
    storage: localStorage,
    panelIds // This validates layouts and prevents errors!
  });

  return (
    <Box direction="column" gap={4}>
      <Header
        section="Examples"
        title="Conditional Panels with Persistent Layout"
      />
      <div>
        This example demonstrates how to properly use conditional panels with
        persistent layouts using localStorage.
      </div>
      <Callout intent="primary">
        <strong>The Solution:</strong> Pass a <code>panelIds</code> array to{" "}
        <code>useDefaultLayout</code> that reflects the current panel
        configuration. The hook will validate that saved layouts match the
        current panels and ignore layouts that don't match.
      </Callout>
      <div>
        <strong>How it works:</strong>
      </div>
      <ol className="pl-8 space-y-2">
        <li className="list-decimal">
          Compute <code>panelIds</code> array based on your conditional
          rendering logic
        </li>
        <li className="list-decimal">
          Pass <code>panelIds</code> to <code>useDefaultLayout</code>
        </li>
        <li className="list-decimal">
          When panels are shown/hidden, <code>panelIds</code> changes
        </li>
        <li className="list-decimal">
          The hook validates that saved layouts match current{" "}
          <code>panelIds</code>
        </li>
        <li className="list-decimal">
          If validation fails, the saved layout is ignored and a default layout
          is calculated
        </li>
      </ol>
      <Box direction="row" gap={4} justify="center" className="my-4">
        <button
          className="bg-sky-700 hover:bg-sky-600 py-2 px-4 rounded cursor-pointer"
          onClick={() => setHideMiddlePanel(!hideMiddlePanel)}
        >
          {hideMiddlePanel ? "Show middle panel" : "Hide middle panel"}
        </button>
        <button
          className="bg-red-700 hover:bg-red-600 py-2 px-4 rounded cursor-pointer"
          onClick={() => {
            localStorage.removeItem("conditional-persistent-demo:layout");
            window.location.reload();
          }}
        >
          Clear saved layout & reload
        </button>
      </Box>
      <Group
        className="h-15"
        defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
      >
        <Panel id="left" minSize={10} showSizeAsPercentage>
          left
        </Panel>
        <Separator />
        {hideMiddlePanel || (
          <>
            <Panel id="middle" minSize={10} showSizeAsPercentage>
              middle
            </Panel>
            <Separator />
          </>
        )}
        <Panel id="right" minSize={10} showSizeAsPercentage>
          right
        </Panel>
      </Group>
      <Code html={ExampleHTML} />
      <Callout intent="primary">
        <strong>Try it out:</strong> Toggle the middle panel on and off, resize
        the panels between toggles, then reload the page. Each panel
        configuration maintains its own layout state without errors.
      </Callout>
      <Callout intent="primary">
        <strong>Code example:</strong> The code above shows how to compute{" "}
        <code>panelIds</code> using <code>useMemo</code> based on your
        conditional rendering logic, then pass it to{" "}
        <code>useDefaultLayout</code>. The hook handles validation
        automatically.
      </Callout>
    </Box>
  );
}
