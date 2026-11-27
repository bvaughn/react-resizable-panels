import { useState } from "react";
import {
  getInteractionState,
  subscribeToInteractionState
} from "../../global/mutable-state/interactions";
import type { InteractionState } from "../../global/mutable-state/types";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

// Axis ids can contain any character, so the dependency key uses one that ids are very unlikely to contain
const SEPARATOR = "\u0000";

/**
 * Whether any of the specified resize axes is being dragged by a pointer.
 */
export function useIsAxisResizing(axisIds: readonly string[]): boolean {
  const key = axisIds.join(SEPARATOR);

  const [isResizing, setIsResizing] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const ids = new Set(key === "" ? [] : key.split(SEPARATOR));

    // Interaction state changes often (e.g. on every pointer move), so only re-render when the value changes
    let current: boolean | undefined;
    const update = (interaction: InteractionState) => {
      const next =
        interaction.state === "active" &&
        interaction.hitRegions.some((hitRegion) => ids.has(hitRegion.axis.id));
      if (next !== current) {
        current = next;
        setIsResizing(next);
      }
    };

    const unsubscribe = subscribeToInteractionState(({ next }) => update(next));

    update(getInteractionState());

    return unsubscribe;
  }, [key]);

  return isResizing;
}
