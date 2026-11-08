import { Box, type ComponentMetadata, ComponentProps } from "react-lib-tools";
import json from "../../public/generated/docs/TabsetMaximizeButton.json";

export default function TabsetMaximizeButtonPropsRoute() {
  return (
    <Box direction="column" gap={4}>
      <ComponentProps json={json as ComponentMetadata} section="Props" />
    </Box>
  );
}
