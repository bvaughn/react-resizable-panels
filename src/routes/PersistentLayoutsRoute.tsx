import { Group, Panel } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/code-snippets/PersistentLayouts.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { Header } from "../components/Header";
import { Text } from "../components/Text";

export default function PersistentLayoutsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Persistent layouts" />
      <div>
        Panel groups can be configured to automatically save and restore layouts
        between page visits using the <code>autoSave</code> prop. Resize the
        panels below and then reload the page to see an example.
      </div>
      <Code html={ExampleHTML} />
      <Group className="h-15 gap-1">
        <Panel
          className="border border-2 border-slate-700 rounded"
          minSize={50}
        >
          <Text>left</Text>
        </Panel>
        <Panel
          className="border border-2 border-slate-700 rounded"
          minSize={50}
        >
          <Text>center</Text>
        </Panel>
        <Panel
          className="border border-2 border-slate-700 rounded"
          minSize={50}
        >
          <Text>right</Text>
        </Panel>
      </Group>
      <Callout intent="warning">
        In order to re-associate saved layouts with the appropriate group,
        auto-save groups require a unique <code>id</code> prop.
      </Callout>
    </Box>
  );
}
