import { html as HorizontalHTML } from "../../public/generated/code-snippets/FixedSizePanels.json";
import { Box } from "../components/Box";
import { Code } from "../components/code/Code";
import { Header } from "../components/Header";
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
      <Group className="h-15">
        <Panel minSize={50}>left</Panel>
        <Separator />
        <FixedSizeContent />
        <Panel minSize={50}>right</Panel>
      </Group>
      <Group className="h-15">
        <Panel minSize={50}>left</Panel>
        <FixedSizeContent />
        <Separator />
        <Panel minSize={50}>right</Panel>
      </Group>
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
