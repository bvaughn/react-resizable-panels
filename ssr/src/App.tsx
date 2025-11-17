import { Group } from "react-resizable-panels";
import { Panel } from "../../src/components/styled-panels/Panel";

export function App() {
  return (
    <div className="p-2">
      <Group autoSave className="h-25 gap-2" id="test-group">
        <Panel minSize={50} showSizeAsPercentage showSizeInPixels>
          left
        </Panel>
        <Panel minSize={50} showSizeAsPercentage showSizeInPixels>
          center
        </Panel>
        <Panel minSize={50} showSizeAsPercentage showSizeInPixels>
          right
        </Panel>
      </Group>
    </div>
  );
}
