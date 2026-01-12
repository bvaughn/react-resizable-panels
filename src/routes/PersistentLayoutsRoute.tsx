import { Box, Callout, Code, Header } from "react-lib-tools";
import { useDefaultLayout } from "react-resizable-panels";
import { html as ComponentExampleHTML } from "../../public/generated/examples/PersistentLayouts.json";
import { Link } from "../components/Link";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function PersistentLayoutsRoute() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "unique-layout-id",
    storage: sessionStorage
  });

  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Persistent layouts" />
      <div>
        Panel groups can be configured to save and restore layouts between page
        visits with the <code>useDefaultLayout</code> hook.
      </div>
      <div>
        Resize the panels below and then reload the page to see an example.
      </div>
      <Code html={ComponentExampleHTML} />
      <Group
        className="h-15"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        <Panel id="left" minSize={50} showSizeAsPercentage>
          left
        </Panel>
        <Separator />
        <Panel id="center" minSize={50} showSizeAsPercentage>
          center
        </Panel>
        <Separator />
        <Panel id="right" minSize={50} showSizeAsPercentage>
          right
        </Panel>
      </Group>
      <Callout intent="warning">
        Panels require unique <code>id</code> props to restore saved layouts.
      </Callout>
      <div>
        The example above works well with client rendered application. Click
        below for more guidance about server rendering.
      </div>
      <ul className="pl-8">
        <li className="list-disc">
          <Link to="/examples/persistent-layout/conditional-panels">
            Persistent layouts with conditional panels
          </Link>
        </li>
        <li className="list-disc">
          <Link to="/examples/persistent-layout/server-rendering">
            Persistent layouts with server rendering
          </Link>
        </li>
        <li className="list-disc">
          <Link to="/examples/persistent-layout/server-components">
            Persistent layouts with server components
          </Link>
        </li>
      </ul>
    </Box>
  );
}
