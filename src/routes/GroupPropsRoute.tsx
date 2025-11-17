import json from "../../public/generated/js-docs/Group.json";
import { Box } from "../components/Box";
import { ComponentProps } from "../components/props/ComponentProps";
import type { ComponentMetadata } from "../types";

export default function GroupPropsRoute() {
  return (
    <Box direction="column" gap={4}>
      <ComponentProps json={json as ComponentMetadata} section="Props" />
    </Box>
  );
}
