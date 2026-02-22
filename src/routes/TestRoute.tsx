import { Box, Callout, Header } from "react-lib-tools";
import { AccordionGroup } from "../components/accordion/AccordionGroup";
import { AccordionPanel } from "../components/accordion/AccordionPanel";
import { VSCode } from "../components/vs-code/VSCode";

export default function TestRoute() {
  return (
    <Box className="m-2" direction="column" gap={1}>
      <Callout intent="warning" minimal>
        This is a test route. Any content shown here is temporary and should not
        be referenced externally.
      </Callout>
      <div />
      <Header title="Accordion demo" />
      <AccordionGroup>
        <AccordionPanel index={1}>This is the first panel.</AccordionPanel>
        <AccordionPanel index={2}>This is the second panel.</AccordionPanel>
        <AccordionPanel index={3}>This is the third panel.</AccordionPanel>
      </AccordionGroup>
      <div />
      <Header title="VS Code demo" />
      <VSCode />
    </Box>
  );
}
