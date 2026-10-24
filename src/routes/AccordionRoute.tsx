import { Box, Callout, Code, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/Accordion.json";
import { Accordion } from "../components/accordion/Accordion";
import { Link } from "../components/Link";

export default function AccordionRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Accordion" />
      <div>
        <Link to="/examples/collapsible-panels">Collapsible panels</Link> with a{" "}
        <code>collapsedSize</code> can be used to build an accordion, like the
        sections in VS Code's explorer. Each section collapses down to the
        height of its header, so the header stays visible and can be clicked to
        expand it again. Clicking a header calls the panel's{" "}
        <Link to="/imperative-api/panel">collapse or expand</Link> method;
        expanding a section takes space from the nearest open sections.
      </div>
      <Code html={html} />
      <Callout>
        The demo below also keeps at least one section open, and uses each
        panel's <code>onResize</code> callback to keep its header in sync when
        sections are resized by dragging.
      </Callout>
      <div>
        Click a header below to collapse or expand its section, or drag between
        sections to resize them.
      </div>
      <Accordion />
    </Box>
  );
}
