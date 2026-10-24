// <begin>

import {
  Group,
  Panel,
  type PanelImperativeHandle,
  Separator,
  usePanelCallbackRef
} from "react-resizable-panels";

function ExampleComponent() {
  // panelRef can safely be shared with other components, context, and hooks
  // It can also be used as a dependency to effects
  const [panelRef, setPanelRef] = usePanelCallbackRef();

  return (
    <Group>
      <Panel collapsible panelRef={setPanelRef}>
        left
      </Panel>
      <CollapseButton panel={panelRef} />
      <Separator />
      <Panel>right</Panel>
    </Group>
  );
}

function CollapseButton({ panel }: { panel: PanelImperativeHandle | null }) {
  return <button onClick={() => panel?.collapse()}>collapse</button>;
}

// <end>

export { ExampleComponent };
