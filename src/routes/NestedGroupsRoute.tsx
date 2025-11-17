import { Group, Panel } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/code-snippets/NestedGroups.json";
import { Box } from "../components/Box";
import { Header } from "../components/Header";
import { Text } from "../components/Text";
import { Code } from "../components/code/Code";
import { Panel as PreStyledPanel } from "../components/styled/Panel";

export default function NestedGroupsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Nested groups" />
      <div>
        Panel groups can be nested. In this configuration, multiple groups can
        be resized at the same time by clicking near panel intersections.
      </div>
      <Code html={ExampleHTML} />
      <Group className="h-50 gap-1">
        <PreStyledPanel minSize={50}>
          <Text>left</Text>
        </PreStyledPanel>
        <Panel minSize={200}>
          <Group className="h-full gap-1" direction="vertical">
            <PreStyledPanel minSize={20}>
              <Text>top</Text>
            </PreStyledPanel>
            <Panel minSize={20}>
              <Group className="h-full gap-1">
                <PreStyledPanel minSize={50}>
                  <Text>left</Text>
                </PreStyledPanel>
                <PreStyledPanel minSize={50}>
                  <Text>right</Text>
                </PreStyledPanel>
              </Group>
            </Panel>
          </Group>
        </Panel>
        <PreStyledPanel minSize={50}>
          <Text>right</Text>
        </PreStyledPanel>
      </Group>
    </Box>
  );
}
