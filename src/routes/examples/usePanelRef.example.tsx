import type { ComponentProps } from "react";
import { Panel } from "react-resizable-panels";

declare const props: ComponentProps<typeof Panel>;

// <begin>

import { usePanelRef } from "react-resizable-panels";

// eslint-disable-next-line react-hooks/rules-of-hooks
const ref = usePanelRef();

<Panel panelRef={ref} {...props} />;
