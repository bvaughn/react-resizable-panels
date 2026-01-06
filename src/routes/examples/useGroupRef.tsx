import type { ComponentProps } from "react";

declare const rest: ComponentProps<typeof Group>;

// <begin>

import { Group, useGroupRef } from "react-resizable-panels";

function ExampleComponent() {
  const ref = useGroupRef();

  return <Group groupRef={ref} {...rest} />;
}

// <end>

export { ExampleComponent };
