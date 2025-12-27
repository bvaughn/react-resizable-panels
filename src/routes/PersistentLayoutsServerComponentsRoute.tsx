import { Box, Code, ExternalLink, Header } from "react-lib-tools";
import { html as ClientComponentExampleHTML } from "../../public/generated/examples/ClientComponent.json";
import { html as ServerComponentExampleHTML } from "../../public/generated/examples/ServerComponent.json";

export default function PersistentLayoutsServerComponentsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Examples"
        title="Persistent layouts with server components"
      />
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
