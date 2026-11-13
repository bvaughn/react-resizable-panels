export type TabListStore<Value> = {
  get: (tabsetId: string) => Value | undefined;
  // Called while a tabset's tab list is rendered; the returned function is called when it's removed
  retain: (tabsetId: string) => () => void;
  // Notifies the tabset's subscribers if its value changed
  set: (tabsetId: string, value: Value | undefined) => void;
  subscribe: (
    tabsetId: string,
    listener: (value: Value | undefined) => void
  ) => () => void;
};

/**
 * Values measured from each tabset's tab list by TabList (e.g. its free space), by tabset id.
 *
 * ℹ️ A tabset's value is cleared when its tab list is removed, unless another one is rendered in the same commit
 * (e.g. when the tabset is maximized or restored, its tab list moves to or from the overlay).
 *
 * ℹ️ This isn't React state, so subscribers (e.g. a toolbar rendered outside of the Workspace) are notified synchronously
 * when the list is measured, which is before the browser paints.
 *
 * ℹ️ Tabset ids come from the model, so they're only used as Map keys (e.g. an id of "constructor" isn't a property of a plain object).
 *
 * @param isEqual Whether two (defined) values are the same; subscribers aren't notified when the value is set to the same value again
 */
export function createTabListStore<Value>(
  isEqual: (a: Value, b: Value) => boolean = Object.is
): TabListStore<Value> {
  const values = new Map<string, Value>();
  const listeners = new Map<string, Set<(value: Value | undefined) => void>>();
  const retainCounts = new Map<string, number>();

  const set = (tabsetId: string, value: Value | undefined) => {
    const prevValue = values.get(tabsetId);
    if (
      prevValue === value ||
      (prevValue !== undefined &&
        value !== undefined &&
        isEqual(prevValue, value))
    ) {
      return;
    }

    if (value === undefined) {
      values.delete(tabsetId);
    } else {
      values.set(tabsetId, value);
    }

    const tabsetListeners = listeners.get(tabsetId);
    if (!tabsetListeners) {
      return;
    }

    // Listeners may throw (or unsubscribe); every listener is still called, and the first error is thrown afterward
    let caughtError: { error: unknown } | undefined;
    for (const listener of Array.from(tabsetListeners)) {
      try {
        listener(value);
      } catch (error) {
        caughtError ??= { error };
      }
    }

    if (caughtError) {
      throw caughtError.error;
    }
  };

  return {
    get: (tabsetId) => values.get(tabsetId),
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
