import type { ComponentProps } from "react";
import { Group } from "react-resizable-panels";

declare const props: ComponentProps<typeof Group>;

// <begin>

import { useGroupRef } from "react-resizable-panels";

// eslint-disable-next-line react-hooks/rules-of-hooks
const ref = useGroupRef();

<Group groupRef={ref} {...props} />;
