import type { ComponentProps } from "react";

declare const rest: ComponentProps<typeof Panel>;

// <begin>

import { Group, Panel, usePanelCallbackRef } from "react-resizable-panels";

function ExampleComponent() {
  // panelRef can safely be shared with other components, context, and hooks
  // It can also be used as a dependency to effects
  // @ts-expect-error Unused variable
  // eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-unused-vars
  const [panelRef, setPanelRef] = usePanelCallbackRef();

  return (
    <Group>
      <Panel panelRef={setPanelRef} {...rest} />
      {/* Other panels... */}
    </Group>
  );
}

// <end>

export { ExampleComponent };
