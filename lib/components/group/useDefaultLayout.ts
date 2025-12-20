import { useMemo, useSyncExternalStore } from "react";
import { debounce } from "../../utils/debounce";
import { getStorageKey } from "./auto-save/getStorageKey";
import type { Layout, LayoutStorage, OnGroupLayoutChange } from "./types";

export function useDefaultLayout({
  debounceSaveMs = 100,
  groupId,
  storage
}: {
  /**
   * Debounce save operation by the specified number of milliseconds; defaults to 100ms
   */
  debounceSaveMs?: number;

  /**
   * Group id; must be unique in order for layouts to be saved separately.
   */
  groupId: string;

  /**
   * Storage implementation; supports localStorage, sessionStorage, and custom implementations
   * Refer to documentation site for example integrations.
   */
  storage: LayoutStorage;
}) {
  const storageKey = getStorageKey(groupId);

  // In the event that a client-only storage API is provided,
  // useSyncExternalStore prevents server/client hydration mismatch warning
  // This is not ideal; if possible a server-friendly storage API should be used
  const defaultLayoutString = useSyncExternalStore(
    subscribe,
    () => storage.getItem(storageKey),
    () => storage.getItem(storageKey)
  );

  const defaultLayout = useMemo(
    () =>
      defaultLayoutString
        ? (JSON.parse(defaultLayoutString) as Layout)
        : undefined,
    [defaultLayoutString]
  );

  const onLayoutChange = useMemo<NonNullable<OnGroupLayoutChange>>(() => {
    const saveLayout = (layout: Layout) => {
      try {
        storage.setItem(storageKey, JSON.stringify(layout));
      } catch (error) {
        console.error(error);
      }
    };

    return debounceSaveMs > 0
      ? debounce(saveLayout, debounceSaveMs)
      : saveLayout;
  }, [debounceSaveMs, storage, storageKey]);

  return {
    defaultLayout,
    onLayoutChange
  };
}

function subscribe() {
  return function unsubscribe() {};
}
