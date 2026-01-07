import type { ComponentProps } from "react";

declare const rest: ComponentProps<typeof Group>;

// <begin>

import { Group, useGroupCallbackRef } from "react-resizable-panels";

function ExampleComponent() {
  // groupRef can safely be shared with other components, context, and hooks
  // It can also be used as a dependency to effects
  // @ts-expect-error Unused variable
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [groupRef, setGroupRef] = useGroupCallbackRef();

  return <Group groupRef={setGroupRef} {...rest} />;
}

// <end>

export { ExampleComponent };
