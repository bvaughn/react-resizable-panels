import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
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
      <Callout intent="primary">
        The example above includes <code>path=/</code> so that saved layouts can
        be shared between paths; see{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies#define_where_cookies_are_sent">
          Using HTTP cookies
        </ExternalLink>{" "}
        for more.
      </Callout>
    </Box>
  );
}
