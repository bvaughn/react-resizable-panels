import { Box, Code, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/PersistConditionalPanelLayouts.json";

export default function PersistentLayoutsConditionalPanelsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Examples"
        title="Persistent layouts with conditional panels"
      />
      <div>
        For Groups that contain conditionally rendered Panels, it can be useful
        to save multiple layouts (one for each set of Panels). To enable this,
        pass the additional <code>panelIds</code> prop as shown below.
      </div>
      <Code html={html} />
    </Box>
  );
}
