import { Box, ExternalLink, Header } from "react-lib-tools";

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
    </Box>
  );
}
