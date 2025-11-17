import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Header } from "../components/Header";

export default function PersistentLayoutsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Persistent layouts" />
      <Callout intent="warning">Coming soon</Callout>
    </Box>
  );
}
