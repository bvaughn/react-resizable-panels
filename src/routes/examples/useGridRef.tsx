import type { ComponentProps } from "react";

declare const rest: ComponentProps<typeof Grid>;

// <begin>

import { Grid, useGridRef } from "react-resizable-panels";

function ExampleComponent() {
  const ref = useGridRef();

  return <Grid gridRef={ref} {...rest} />;
}

// <end>

export { ExampleComponent };
