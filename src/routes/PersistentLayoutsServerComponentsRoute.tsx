import { html as ClientComponentExampleHTML } from "../../public/generated/code-snippets/ClientComponent.json";
import { html as ServerComponentExampleHTML } from "../../public/generated/code-snippets/ServerComponent.json";
import { Box } from "../components/Box";
import { Code } from "../components/code/Code";
import { ExternalLink } from "../components/ExternalLink";
import { Header } from "../components/Header";

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
