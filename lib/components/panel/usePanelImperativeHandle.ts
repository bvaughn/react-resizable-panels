import { useImperativeHandle, useRef, type Ref } from "react";
import { NOOP_FUNCTION } from "../../constants";
import { getImperativeItemMethods } from "../../global/utils/getImperativeItemMethods";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useGroupContext } from "../group/useGroupContext";
import type { PanelImperativeHandle } from "./types";

export function usePanelImperativeHandle(
  panelId: string,
  panelRef: Ref<PanelImperativeHandle> | undefined
) {
  const { id: groupId } = useGroupContext();

  const imperativePanelRef = useRef<PanelImperativeHandle>({
    collapse: NOOP_FUNCTION,
    expand: NOOP_FUNCTION,
    getSize: () => ({
      asPercentage: 0,
      inPixels: 0
    }),
    isCollapsed: () => false,
    resize: NOOP_FUNCTION
  });

  useImperativeHandle(panelRef, () => imperativePanelRef.current, []);

  useIsomorphicLayoutEffect(() => {
    Object.assign(
      imperativePanelRef.current,
      getImperativeItemMethods({ axisId: groupId, itemId: panelId })
    );
  });
}
