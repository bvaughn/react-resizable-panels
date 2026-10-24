import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as ExampleHTML } from "../../public/generated/examples/NestedGroups.json";
import { EmailClient } from "../components/email/EmailClient";
import { Link } from "../components/Link";

export default function NestedGroupsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Nested groups" />
      <div>
        Panel groups can be nested. In this configuration, multiple groups can
        be resized at the same time by clicking near panel intersections.
      </div>
      <Code html={ExampleHTML} />
      <div>
        For example, the email client below nests a vertical group (the message
        list and reading pane) inside of a horizontal one. Try dragging the
        point where all three panels meet.
      </div>
      <EmailClient />
      <Callout intent="warning">
        If your nested panels form a grid (e.g. each row has the same columns),
        consider using the{" "}
        <Link to="/examples/grid-basics">Grid component</Link> instead.
      </Callout>
    </Box>
  );
}
