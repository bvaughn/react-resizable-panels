import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/20/solid";
import { useState } from "react";
import { Box, Code, Header } from "react-lib-tools";
import { useDefaultLayout } from "react-resizable-panels";
import { html } from "../../public/generated/examples/PersistConditionalPanelLayouts.json";
import { DemoButton } from "../components/DemoButton";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function PersistentLayoutsConditionalPanelsRoute() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "conditional-panels-layout-id",
    panelIds: showLeftPanel ? ["left", "center", "right"] : ["center", "right"],
    storage: sessionStorage
  });

  return (
    <Box direction="column" gap={4}>
      <Header
        section="Flex"
        title="Persistent layouts with conditional panels"
      />
      <div>
        For Groups that contain conditionally rendered Panels, it can be useful
        to save multiple layouts (one for each set of Panels). To enable this,
        pass the additional <code>panelIds</code> prop as shown below.
      </div>
      <Code html={html} />
      <div>
        Resize the panels below, hide the left panel, and resize them again.
        Each set of panels remembers its own layout, including after the page is
        reloaded.
      </div>
      <Group
        className="h-15"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        {showLeftPanel ? (
          <>
            <Panel id="left" minSize={50} showSizeAsPercentage>
              left
            </Panel>
            <DemoButton
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              title="Hide left panel"
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </DemoButton>
            <Separator />
          </>
        ) : (
          <DemoButton
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            title="Show left panel"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </DemoButton>
        )}
        <Panel id="center" minSize={50} showSizeAsPercentage>
          center
        </Panel>
        <Separator />
        <Panel id="right" minSize={50} showSizeAsPercentage>
          right
        </Panel>
      </Group>
    </Box>
  );
}
