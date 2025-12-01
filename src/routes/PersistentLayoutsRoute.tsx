import { Group, useDefaultLayout } from "react-resizable-panels";
import { html as ComponentExampleHTML } from "../../public/generated/code-snippets/PersistentLayouts.json";
import { html as cookieStorageExampleHTML } from "../../public/generated/code-snippets/cookieStorage.json";
import { html as ClientComponentExampleHTML } from "../../public/generated/code-snippets/ClientComponent.json";
import { html as ServerComponentExampleHTML } from "../../public/generated/code-snippets/ServerComponent.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { Header } from "../components/Header";
import { Panel } from "../components/styled-panels/Panel";
import { ExternalLink } from "../components/ExternalLink";

export default function PersistentLayoutsRoute() {
  const { defaultLayout, onLayoutChange } = useDefaultLayout({
    groupId: "persisted-group"
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
        className="h-15 gap-1"
        defaultLayout={defaultLayout}
        id="persisted-group"
        onLayoutChange={onLayoutChange}
      >
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
      <div className="text-xl mt-4">Server rendering</div>
      <div>
        Because <code>localStorage</code> is unavailable on the server, a custom{" "}
        <code>storage</code> configuration is needed to avoid layout shift when
        server rendering.
      </div>
      <div>A Cookie based storage might look like this:</div>
      <Code html={cookieStorageExampleHTML} />
      <Callout intent="primary">
        If an async storage API is required, saved layouts should be loaded
        using{" "}
        <ExternalLink href="https://react.dev/reference/react/Suspense">
          suspense
        </ExternalLink>
        .
      </Callout>
      <div className="text-xl mt-4">Server components</div>
      <div>
        When using{" "}
        <ExternalLink href="https://react.dev/reference/rsc/server-components">
          server components
        </ExternalLink>{" "}
        with a framework like Next.js, a slightly different approach is
        required:
      </div>
      <Code html={ServerComponentExampleHTML} />
      <Code html={ClientComponentExampleHTML} />
    </Box>
  );
}
