import {
  Box,
  ImperativeHandle,
  type ImperativeHandleMetadata
} from "react-lib-tools";
import json from "../../public/generated/docs/GridImperativeHandle.json";

export default function GridImperativeHandleRoute() {
  return (
    <Box direction="column" gap={4}>
      <ImperativeHandle
        json={json as ImperativeHandleMetadata}
        section="Imperative API"
      />
    </Box>
  );
}
