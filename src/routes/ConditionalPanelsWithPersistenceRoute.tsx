import { useState } from "react";
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

  const { defaultLayout, onLayoutChange } = useDefaultLayout({
    groupId: "conditional-persistent-demo",
    storage: localStorage
  });

  return (
    <Box direction="column" gap={4}>
      <Header
        section="Examples"
        title="Conditional Panels with Persistent Layout"
      />
      <div>
        This example demonstrates a known issue when combining conditional
        panels with persistent layouts using localStorage.
      </div>
      <Callout intent="warning">
        <strong>Issue:</strong> When a panel is conditionally hidden and then
        shown again, the layout restored from localStorage may contain size
        values for panels that no longer exist, causing an "Invalid panel
        layout" error.
      </Callout>
      <div>
        <strong>Steps to reproduce:</strong>
      </div>
      <ol className="pl-8 space-y-2">
        <li className="list-decimal">
          Resize the panels below to create a custom layout with all 3 panels
          visible
        </li>
        <li className="list-decimal">
          Click "Hide middle panel" to conditionally remove the middle panel
        </li>
        <li className="list-decimal">
          Resize the remaining 2 panels (this saves a 2-panel layout)
        </li>
        <li className="list-decimal">
          Click "Show middle panel" to restore the middle panel
        </li>
        <li className="list-decimal">
          The error occurs because the stored layout has 2 values but 3 panels
          are now rendered
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
      <Callout intent="warning">
        <strong>Current behavior:</strong> The library may throw an error or
        produce unexpected layouts when the number of panels changes between
        saves.
      </Callout>
      <Callout intent="warning">
        <strong>Expected behavior:</strong> The library should gracefully handle
        layout mismatches by either:
        <ul className="pl-6 mt-2 space-y-1">
          <li className="list-disc">
            Ignoring the saved layout when panel count doesn't match
          </li>
          <li className="list-disc">
            Falling back to default layout for missing/extra panels
          </li>
          <li className="list-disc">
            Validating the saved layout against current panel IDs
          </li>
        </ul>
      </Callout>
    </Box>
  );
}
