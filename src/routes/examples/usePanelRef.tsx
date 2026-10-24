// <begin>

import { useState } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";

function ExampleComponent() {
  const ref = usePanelRef();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = () => {
    const panel = ref.current;
    if (panel?.isCollapsed()) {
      panel.expand();
    } else {
      panel?.collapse();
    }
  };

  return (
    <Group>
      <Panel
        collapsible
        minSize="10%"
        onResize={(size) => setIsCollapsed(size.inPixels === 0)}
        panelRef={ref}
      >
        left
      </Panel>
      <button onClick={toggle}>{isCollapsed ? "»" : "«"}</button>
      <Separator />
      <Panel>right</Panel>
    </Group>
  );
}

// <end>

export { ExampleComponent };
