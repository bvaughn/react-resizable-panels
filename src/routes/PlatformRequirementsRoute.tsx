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
      <div>
        The <code>Workspace</code> component moves tab content between tabsets
        using{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore">
          <code>moveBefore</code>
        </ExternalLink>{" "}
        where it's supported, which preserves browser state such as iframes,
        playing media, and focus. Browsers that don't support it yet (e.g.
        Safari) move content with <code>appendChild</code>, which{" "}
        <Link to="/examples/workspace/tab-content">resets that state</Link>.
      </div>
    </Box>
  );
}
