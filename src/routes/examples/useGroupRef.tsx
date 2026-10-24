// <begin>

import { Group, Panel, Separator, useGroupRef } from "react-resizable-panels";

function ExampleComponent() {
  const ref = useGroupRef();

  const maximizeLeftPanel = () => {
    ref.current?.setLayout({ left: 75, right: 25 });
  };

  return (
    <Group groupRef={ref}>
      <Panel id="left">
        <button onClick={maximizeLeftPanel}>maximize</button>
      </Panel>
      <Separator />
      <Panel id="right">...</Panel>
    </Group>
  );
}

// <end>

export { ExampleComponent };
