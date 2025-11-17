import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Header } from "../components/Header";

export default function UpdateGroupLayoutRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Imperative API" title="Update Group layout" />
      <Callout intent="warning">Coming soon</Callout>
    </Box>
  );
}
