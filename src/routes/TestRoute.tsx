import { Box, Callout, Header } from "react-lib-tools";
import { Accordion } from "../components/accordion/Accordion";
import { VSCode } from "../components/vs-code/VSCode";

export default function TestRoute() {
  return (
    <Box className="m-2" direction="column" gap={1}>
      <Callout intent="warning">
        This is a test route. Any content shown here is temporary and should not
        be referenced externally.
      </Callout>
      <div />
      <Header title="Accordion demo" />
      <Accordion />
      <div />
      <Header title="VS Code demo" />
      <VSCode />
    </Box>
  );
}
