import type { ComponentProps } from "react";
import { Group } from "react-resizable-panels";

declare const rest: ComponentProps<typeof Group>;

// <begin>

import { useDefaultLayout } from "react-resizable-panels";

// eslint-disable-next-line react-hooks/rules-of-hooks
const { defaultLayout, onLayoutChanged } = useDefaultLayout({
  id: "unique-layout-id"
});

/* prettier-ignore */
<Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged} {...rest} />
