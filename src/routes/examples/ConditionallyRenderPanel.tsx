import type { Ref } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

declare function useResizeObserver(): {
  ref: Ref<HTMLDivElement>;
  width: number | undefined;
};

// <begin>

// eslint-disable-next-line react-hooks/rules-of-hooks
const { ref, width = 0 } = useResizeObserver();

/* prettier-ignore */
<div ref={ref}>
  <Group>
    <Panel minSize="25%">...</Panel>
    {width >= 500 && (
      <>
        <Separator />
        <Panel defaultSize="35%">...</Panel>
      </>
    )}
  </Group>
</div>
