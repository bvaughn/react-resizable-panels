import { useSyncExternalStore } from "react";
import type { DragState, DragStore } from "../utils/createDragStore";

/**
 * Selects a value from a workspace's drag state (see createDragStore);
 * the component only re-renders when the selected value changes.
 *
 * ℹ️ Selectors should return primitives (or values from the state itself), since values are compared by identity.
 */
export function useDragState<Value>(
  dragStore: DragStore,
  selector: (state: DragState) => Value
): Value {
  const getSnapshot = () => selector(dragStore.getState());

  return useSyncExternalStore(dragStore.subscribe, getSnapshot, getSnapshot);
}
