import { Box, type ComponentMetadata, ComponentProps } from "react-lib-tools";
import json from "../../public/generated/docs/TabCloseButton.json";

export default function TabCloseButtonPropsRoute() {
  return (
    <Box direction="column" gap={4}>
      <ComponentProps json={json as ComponentMetadata} section="Props" />
    </Box>
  );
}
