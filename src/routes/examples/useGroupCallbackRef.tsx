// <begin>

import {
  Group,
  type GroupImperativeHandle,
  Panel,
  Separator,
  useGroupCallbackRef
} from "react-resizable-panels";

function ExampleComponent() {
  // groupRef can safely be shared with other components, context, and hooks
  // It can also be used as a dependency to effects
  const [groupRef, setGroupRef] = useGroupCallbackRef();

  return (
    <Group groupRef={setGroupRef}>
      <Panel id="left">
        <MaximizeButton group={groupRef} />
      </Panel>
      <Separator />
      <Panel id="right">...</Panel>
    </Group>
  );
}

function MaximizeButton({ group }: { group: GroupImperativeHandle | null }) {
  return (
    <button onClick={() => group?.setLayout({ left: 75, right: 25 })}>
      maximize
    </button>
  );
}

// <end>

export { ExampleComponent };
