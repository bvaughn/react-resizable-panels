export type TabListFreeSpaceStore = {
  get: (tabsetId: string) => number | undefined;
  // Called while a tabset's tab list is rendered; the returned function is called when it's removed
  retain: (tabsetId: string) => () => void;
  // Notifies the tabset's subscribers if its free space changed
  set: (tabsetId: string, freeSpace: number | undefined) => void;
  subscribe: (
    tabsetId: string,
    listener: (freeSpace: number | undefined) => void
  ) => () => void;
};

/**
 * The free space in each tabset's tab list (measured by TabList), by tabset id.
 *
 * ℹ️ A tabset's free space is cleared when its tab list is removed, unless another one is rendered in the same commit
 * (e.g. when the tabset is maximized or restored, its tab list moves to or from the overlay).
 *
 * ℹ️ This isn't React state, so subscribers (e.g. a toolbar rendered outside of the Workspace) are notified synchronously
 * when the list is measured, which is before the browser paints.
 *
 * ℹ️ Tabset ids come from the model, so they're only used as Map keys (e.g. an id of "constructor" isn't a property of a plain object).
 */
export function createTabListFreeSpaceStore(): TabListFreeSpaceStore {
  const freeSpaces = new Map<string, number>();
  const listeners = new Map<
    string,
    Set<(freeSpace: number | undefined) => void>
  >();
  const retainCounts = new Map<string, number>();

  const set = (tabsetId: string, freeSpace: number | undefined) => {
    if (freeSpaces.get(tabsetId) === freeSpace) {
      return;
    }

    if (freeSpace === undefined) {
      freeSpaces.delete(tabsetId);
    } else {
      freeSpaces.set(tabsetId, freeSpace);
    }

    const tabsetListeners = listeners.get(tabsetId);
    if (!tabsetListeners) {
      return;
    }

    // Listeners may throw (or unsubscribe); every listener is still called, and the first error is thrown afterward
    let caughtError: { error: unknown } | undefined;
    for (const listener of Array.from(tabsetListeners)) {
      try {
        listener(freeSpace);
      } catch (error) {
        caughtError ??= { error };
      }
    }

    if (caughtError) {
      throw caughtError.error;
    }
  };

  return {
    get: (tabsetId) => freeSpaces.get(tabsetId),
    retain: (tabsetId) => {
      retainCounts.set(tabsetId, (retainCounts.get(tabsetId) ?? 0) + 1);

      return () => {
        retainCounts.set(tabsetId, retainCounts.get(tabsetId)! - 1);

        // Microtasks run before the browser paints
        queueMicrotask(() => {
          if (!retainCounts.get(tabsetId)) {
            retainCounts.delete(tabsetId);
            set(tabsetId, undefined);
          }
        });
      };
    },
    set,
    subscribe: (tabsetId, listener) => {
      let tabsetListeners = listeners.get(tabsetId);
      if (!tabsetListeners) {
        tabsetListeners = new Set();
        listeners.set(tabsetId, tabsetListeners);
      }
      tabsetListeners.add(listener);

      return () => {
        tabsetListeners.delete(listener);
        if (
          tabsetListeners.size === 0 &&
          listeners.get(tabsetId) === tabsetListeners
        ) {
          listeners.delete(tabsetId);
        }
      };
    }
  };
}
