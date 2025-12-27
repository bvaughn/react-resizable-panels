import { Box, ComponentProps } from "react-lib-tools";
import json from "../../public/generated/js-docs/Panel.json";
import type { ComponentMetadata } from "../types";

export default function PanelPropsRoute() {
  return (
    <Box direction="column" gap={4}>
      <ComponentProps json={json as ComponentMetadata} section="Props" />
    </Box>
  );
}
