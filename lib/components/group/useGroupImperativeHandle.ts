import { useImperativeHandle, useRef, type Ref } from "react";
import { NOOP_FUNCTION } from "../../constants";
import { getImperativeGroupMethods } from "../../global/utils/getImperativeGroupMethods";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { GroupImperativeHandle } from "./types";

export function useGroupImperativeHandle(
  groupId: string,
  groupRef: Ref<GroupImperativeHandle> | undefined
) {
  const imperativeGroupRef = useRef<GroupImperativeHandle>({
    getLayout: () => ({}),
    setLayout: NOOP_FUNCTION
  });

  useImperativeHandle(groupRef, () => imperativeGroupRef.current, []);

  useIsomorphicLayoutEffect(() => {
    Object.assign(
      imperativeGroupRef.current,
      getImperativeGroupMethods({ groupId })
    );
  });
}
