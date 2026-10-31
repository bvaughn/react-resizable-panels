import { useContext, useRef, useSyncExternalStore } from "react";
import { objectsEqual } from "../../global/utils/objectsEqual";
import { subscribeToNothing } from "../../shared/utils/subscribeToNothing";
import { WorkspaceStoreContext } from "../contexts/WorkspaceStoreContext";
import type { WorkspaceState } from "../utils/createWorkspaceStore";

/**
 * Selects a value from the nearest Workspace's state (or returns null if there is no Workspace);
 * the component only re-renders when the selected value changes (compared shallowly).
 */
export function useWorkspaceStoreSelector<Value extends object>(
  selector: (state: WorkspaceState) => Value | null
): Value | null {
  const store = useContext(WorkspaceStoreContext);

  // Selectors usually return new objects, so the previous value is returned while it's equal
  // (otherwise useSyncExternalStore would re-render after every change)
  const cacheRef = useRef<{ value: Value | null } | null>(null);
  const getSnapshot = () => {
    const value = store ? selector(store.getState()) : null;

    const cache = cacheRef.current;
    if (
      cache &&
      (cache.value === value ||
        (cache.value !== null &&
          value !== null &&
          objectsEqual(cache.value, value)))
    ) {
      return cache.value;
    }

    cacheRef.current = { value };
    return value;
  };

  return useSyncExternalStore(
    store?.subscribe ?? subscribeToNothing,
    getSnapshot,
    getSnapshot
  );
}
