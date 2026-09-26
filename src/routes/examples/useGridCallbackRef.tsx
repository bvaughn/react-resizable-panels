import type { ComponentProps } from "react";

declare const rest: ComponentProps<typeof Grid>;

// <begin>

import { Grid, useGridCallbackRef } from "react-resizable-panels";

function ExampleComponent() {
  // gridRef can safely be shared with other components, context, and hooks
  // It can also be used as a dependency to effects
  // @ts-expect-error Unused variable
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [gridRef, setGridRef] = useGridCallbackRef();

  return <Grid gridRef={setGridRef} {...rest} />;
}

// <end>

export { ExampleComponent };
