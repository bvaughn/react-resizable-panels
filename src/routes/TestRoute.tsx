import { Box } from "react-lib-tools";
import { AccordionGroup } from "../components/accordion/AccordionGroup";
import { AccordionPanel } from "../components/accordion/AccordionPanel";

export default function TestRoute() {
  return (
    <Box className="m-2" direction="column" gap={1}>
      <div>
        This is a test route. Any content shown here is temporary and should not
        be referenced externally.
      </div>
      <AccordionGroup>
        <AccordionPanel index={1}>This is the first panel.</AccordionPanel>
        <AccordionPanel index={2}>This is the second panel.</AccordionPanel>
        <AccordionPanel index={3}>This is the third panel.</AccordionPanel>
      </AccordionGroup>
    </Box>
  );
}
