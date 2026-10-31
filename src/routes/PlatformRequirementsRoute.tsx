import { Box, ExternalLink, Header } from "react-lib-tools";
import { Link } from "../components/Link";

export default function PlatformRequirementsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header title="Requirements" />
      <div>
        This library requires React{" "}
        <ExternalLink href="https://react.dev/blog/2022/03/29/react-v18">
          version 18
        </ExternalLink>{" "}
        or newer.
      </div>
      <div>
        It also uses the{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver">
          ResizeObserver
        </ExternalLink>{" "}
        (or polyfill) to convert layout constraints into relative percentages.
      </div>
      <div>
        The <code>Workspace</code> component's{" "}
        <Link to="/examples/workspace/tab-content">
          <code>hiddenTabBehavior="activity"</code>
        </Link>{" "}
        option requires React{" "}
        <ExternalLink href="https://react.dev/blog/2025/10/01/react-19-2">
          version 19.2
        </ExternalLink>{" "}
        or newer (for <code>Activity</code>); with older versions it behaves
        like the default (<code>"keep-mounted"</code>).
      </div>
    </Box>
  );
}
