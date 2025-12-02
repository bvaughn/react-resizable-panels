import type { ComponentProps } from "react";
import { Group } from "react-resizable-panels";

declare const props: ComponentProps<typeof Group>;

// <begin>

import { useGroupCallbackRef } from "react-resizable-panels";

// @ts-expect-error Unused variable
// eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-unused-vars
const [groupRef, setGroupRef] = useGroupCallbackRef();

<Group groupRef={setGroupRef} {...props} />;
