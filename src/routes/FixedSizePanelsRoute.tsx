import { Box, Code, Header } from "react-lib-tools";
import { html as HorizontalHTML } from "../../public/generated/examples/FixedSizePanels.json";
import { html as FixedSizePanelsMiddleHTML } from "../../public/generated/examples/FixedSizePanelsMiddle.json";
import { html as FixedSizePanelsMiddleNoSeparatorsHTML } from "../../public/generated/examples/FixedSizePanelsMiddleNoSeparators.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function FixedSizePanelsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Fixed size panels" />
      <div>
        You can also render non-interactive elements inside of a group if you
        need fixed-size content.
      </div>
      <Code html={HorizontalHTML} />
      <Group className="h-15">
        <Panel minSize={50}>left</Panel>
        <Separator />
        <Panel minSize={50}>right</Panel>
        <FixedSizeContent />
      </Group>
      <div>Non-interactive elements can also be rendered between panels.</div>
      <Code html={FixedSizePanelsMiddleHTML} />
      <Group className="h-15">
        <Panel minSize={50}>left</Panel>
        <Separator />
        <FixedSizeContent />
        <Separator />
        <Panel minSize={50}>right</Panel>
      </Group>
      <div>
        As with other types of groups, separators are optional (but
        recommended).
      </div>
      <Code html={FixedSizePanelsMiddleNoSeparatorsHTML} />
      <Group className="h-15">
        <Panel minSize={50}>left</Panel>
        <FixedSizeContent />
        <Panel minSize={50}>right</Panel>
      </Group>
    </Box>
  );
}

function FixedSizeContent() {
  return (
    <div className="w-45 bg-slate-600 rounded rounded-md flex items-center justify-center p-2 overflow-auto">
      Fixed sized element
    </div>
  );
}
