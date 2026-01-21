import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { html as cookieStorageExampleHTML } from "../../public/generated/examples/cookieStorage.json";

export default function PersistentLayoutsServerRenderingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Examples"
        title="Persistent layouts with server rendering"
      />
      <div>
        Because <code>localStorage</code> is unavailable on the server, a custom{" "}
        <code>storage</code> configuration is needed to avoid layout shift when
        server rendering.
      </div>
      <div>
        Building on the previous example, a Cookie based storage might look like
        this:
      </div>
      <Code html={cookieStorageExampleHTML} />
      <Callout intent="primary">
        If an async storage API is required, saved layouts should be loaded
        using{" "}
        <ExternalLink href="https://react.dev/reference/react/Suspense">
          suspense
        </ExternalLink>
        .
      </Callout>
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
