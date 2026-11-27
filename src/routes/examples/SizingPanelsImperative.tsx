// <begin>

import {
  Group,
  Panel,
  Separator,
  useGroupRef,
  usePanelRef
} from "react-resizable-panels";

function ExampleComponent() {
  const groupRef = useGroupRef();
  const panelRef = usePanelRef();

  return (
    <>
      <button onClick={() => panelRef.current?.resize("200px")}>
        sidebar 200px
      </button>
      <button
        onClick={() => groupRef.current?.setLayout({ left: 50, right: 50 })}
      >
        reset
      </button>
      <Group groupRef={groupRef}>
        <Panel id="left" panelRef={panelRef}>
          left
        </Panel>
        <Separator />
        <Panel id="right">right</Panel>
      </Group>
    </>
  );
}

// <end>

export { ExampleComponent };
