import {
  Box,
  ImperativeHandle,
  type ImperativeHandleMetadata
} from "react-lib-tools";
import trackJson from "../../public/generated/docs/GridTrackImperativeHandle.json";

export default function GridTrackImperativeHandleRoute() {
  return (
    <Box direction="column" gap={4}>
      <ImperativeHandle
        json={trackJson as ImperativeHandleMetadata}
        section="Imperative API"
      />
    </Box>
  );
}
