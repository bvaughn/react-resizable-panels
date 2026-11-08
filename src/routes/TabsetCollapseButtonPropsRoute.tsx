import { Box, type ComponentMetadata, ComponentProps } from "react-lib-tools";
import json from "../../public/generated/docs/TabsetCollapseButton.json";

export default function TabsetCollapseButtonPropsRoute() {
  return (
    <Box direction="column" gap={4}>
      <ComponentProps json={json as ComponentMetadata} section="Props" />
    </Box>
  );
}
