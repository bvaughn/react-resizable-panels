import { Box, Code, Header } from "react-lib-tools";
import { Panel } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/examples/NestedGroups.json";
import { Group } from "../components/styled-panels/Group";
import { Panel as PreStyledPanel } from "../components/styled-panels/Panel";

export default function NestedGroupsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Nested groups" />
      <div>
        Panel groups can be nested. In this configuration, multiple groups can
        be resized at the same time by clicking near panel intersections.
      </div>
      <Code html={ExampleHTML} />
      <Group className="h-50!">
        <PreStyledPanel minSize={50}>left</PreStyledPanel>
        <Panel minSize={200}>
          <Group orientation="vertical">
            <PreStyledPanel minSize={20}>top</PreStyledPanel>
            <Panel minSize={20}>
              <Group>
                <PreStyledPanel minSize={50}>left</PreStyledPanel>
                <PreStyledPanel minSize={50}>right</PreStyledPanel>
              </Group>
            </Panel>
          </Group>
        </Panel>
        <PreStyledPanel minSize={50}>right</PreStyledPanel>
      </Group>
    </Box>
  );
}
