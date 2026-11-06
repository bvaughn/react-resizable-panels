/**
 * The elements a tabset is rendered with (null until they're mounted).
 */
export type TabsetElements = {
  panels: HTMLElement | null;
  tabList: HTMLElement | null;
  tabset: HTMLElement | null;
};

export type TabsetElementRegistry = {
  // The elements of the tabset as it's currently rendered, if it is
  get: (tabsetId: string) => TabsetElements | undefined;
  // Returns a function that unregisters the elements
  register: (tabsetId: string, elements: TabsetElements) => () => void;
};

/**
 * Tabsets register their elements here (see TabsetSlot), so that they can be found without searching the document,
 * e.g. while hit testing a drag (see getDropTarget).
 * Each workspace has its own registry, so tabsets of workspaces nested within its tabs (which may use the same ids) aren't included.
 *
 * ℹ️ A tabset may be registered more than once (e.g. while it's maximized, by both its place in the layout and the overlay it's rendered in);
 * only the registration whose elements are mounted is returned.
 */
export function createTabsetElementRegistry(): TabsetElementRegistry {
  const registrations = new Map<string, Set<TabsetElements>>();

  return {
    get: (tabsetId) => {
      const set = registrations.get(tabsetId);
      if (set) {
        for (const elements of set) {
          if (elements.tabset) {
            return elements;
          }
        }
      }

      return undefined;
    },
    register: (tabsetId, elements) => {
      let set = registrations.get(tabsetId);
      if (!set) {
        set = new Set();
        registrations.set(tabsetId, set);
      }
      set.add(elements);

      const registered = set;
      return () => {
        registered.delete(elements);
        if (
          registered.size === 0 &&
          registrations.get(tabsetId) === registered
        ) {
          registrations.delete(tabsetId);
        }
      };
    }
  };
}
