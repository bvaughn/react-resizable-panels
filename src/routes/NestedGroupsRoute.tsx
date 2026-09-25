import { Box, Callout, Code, Header } from "react-lib-tools";
import { Panel } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/examples/NestedGroups.json";
import { Group } from "../components/styled-panels/Group";
import { Panel as PreStyledPanel } from "../components/styled-panels/Panel";
import { PanelText } from "../components/styled-panels/PanelText";
import { Link } from "../components/Link";

export default function NestedGroupsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Nested groups" />
      <div>
        Panel groups can be nested. In this configuration, multiple groups can
        be resized at the same time by clicking near panel intersections.
      </div>
      <Code html={ExampleHTML} />
      <Group className="h-50!">
        <PreStyledPanel minSize={50}>
          <PanelText>left</PanelText>
        </PreStyledPanel>
        <Panel minSize={200}>
          <Group orientation="vertical">
            <PreStyledPanel minSize={20}>
              <PanelText>top</PanelText>
            </PreStyledPanel>
            <Panel minSize={20}>
              <Group>
                <PreStyledPanel minSize={50}>
                  <PanelText>left</PanelText>
                </PreStyledPanel>
                <PreStyledPanel minSize={50}>
                  <PanelText>right</PanelText>
                </PreStyledPanel>
              </Group>
            </Panel>
          </Group>
        </Panel>
        <PreStyledPanel minSize={50}>
          <PanelText>right</PanelText>
        </PreStyledPanel>
      </Group>
      <Callout intent="warning">
        If your nested panels form a grid (e.g. each row has the same columns),
        consider using the{" "}
        <Link to="/examples/grid-basics">Grid component</Link> instead.
      </Callout>
    </Box>
  );
}
