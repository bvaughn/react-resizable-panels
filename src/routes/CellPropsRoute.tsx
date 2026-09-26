import { Box, ComponentProps, type ComponentMetadata } from "react-lib-tools";
import json from "../../public/generated/docs/Cell.json";

export default function CellPropsRoute() {
  return (
    <Box direction="column" gap={4}>
      <ComponentProps json={json as ComponentMetadata} section="Props" />
    </Box>
  );
}
