import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { LayoutChangedMeta, LayoutStorage } from "../group/types";
import type { GridLayout } from "./types";

/**
 * Saves and restores Grid layouts between page loads.
 * It can be configured to store values using `localStorage`, `sessionStorage`, cookies, or any other persistence layer that makes sense for your application.
 */
export function useDefaultGridLayout({
  id,
  onlySaveAfterUserInteractions,
  storage = localStorage
}: {
  /**
   * Uniquely identifies a specific grid/layout.
   */
  id: string;

  /**
   * Only auto-save layouts that were directly caused by user input (e.g. keyboard or mouse events).
   * Ignore layout changes resulting from imperative API calls or window resize events.
   */
  onlySaveAfterUserInteractions?: boolean;

  /**
   * Storage implementation; supports localStorage, sessionStorage, and custom implementations
   * Refer to documentation site for example integrations.
   */
  storage?: LayoutStorage;
}) {
  const storageKey = `react-resizable-panels:grid:${id}`;

  // In the event that a client-only storage API is provided,
  // useSyncExternalStore prevents server/client hydration mismatch warning
  const defaultLayoutString = useSyncExternalStore(
    subscribe,
    () => storage.getItem(storageKey),
    () => storage.getItem(storageKey)
  );

  const defaultLayout = useMemo<Partial<GridLayout> | undefined>(() => {
    if (defaultLayoutString) {
      try {
        const parsed = JSON.parse(defaultLayoutString);
        if (parsed !== null && typeof parsed === "object") {
          return parsed;
        }
      } catch {
        // Ignore invalid layouts
      }
    }
  }, [defaultLayoutString]);

  const onLayoutChanged = useCallback(
    (layout: GridLayout, meta: LayoutChangedMeta) => {
      if (onlySaveAfterUserInteractions && !meta.isUserInteraction) {
        return;
      }

      try {
        storage.setItem(storageKey, JSON.stringify(layout));
      } catch (error) {
        console.error(error);
      }
    },
    [onlySaveAfterUserInteractions, storage, storageKey]
  );

  return {
    /**
     * Pass this value to `Grid` as the `defaultLayout` prop.
     */
    defaultLayout,

    /**
     * Attach this callback on the `Grid` as the `onLayoutChanged` prop.
     */
    onLayoutChanged
  };
}

function subscribe() {
  return function unsubscribe() {};
}
