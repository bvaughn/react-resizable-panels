import type { ComponentProps } from "react";

declare const rest: ComponentProps<typeof Panel>;

// <begin>

import { Group, Panel, usePanelRef } from "react-resizable-panels";

function ExampleComponent() {
  const ref = usePanelRef();

  return (
    <Group>
      <Panel panelRef={ref} {...rest} />
      {/* Other panels... */}
    </Group>
  );
}

// <end>

export { ExampleComponent };
