import type { ComponentProps } from "react";
import { Grid } from "react-resizable-panels";

declare const rest: ComponentProps<typeof Grid>;

// <begin>

import { useDefaultGridLayout } from "react-resizable-panels";

// eslint-disable-next-line react-hooks/rules-of-hooks
const { defaultLayout, onLayoutChanged } = useDefaultGridLayout({
  id: "unique-layout-id"
});

/* prettier-ignore */
<Grid defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged} {...rest} />
