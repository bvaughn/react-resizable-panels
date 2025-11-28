import { Group } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/code-snippets/PersistentLayouts.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { Header } from "../components/Header";
import { Panel } from "../components/styled-panels/Panel";

export default function PersistentLayoutsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Persistent layouts" />
      <div>
        Panel groups can be configured to automatically save and restore layouts
        between page visits using the <code>autoSave</code> and <code>id</code>{" "}
        props.
      </div>
      <div>
        Resize the panels below and then reload the page to see an example.
      </div>
      <Code html={ExampleHTML} />
      <Group autoSave className="h-15 gap-1" id="auto-save-example">
        <Panel id="left" minSize={50} showSizeAsPercentage>
          left
        </Panel>
        <Panel id="center" minSize={50} showSizeAsPercentage>
          center
        </Panel>
        <Panel id="right" minSize={50} showSizeAsPercentage>
          right
        </Panel>
      </Group>
      <Callout intent="warning">
        Both Groups and Panels require unique <code>id</code> props to restore
        saved layouts.
      </Callout>
    </Box>
  );
}
