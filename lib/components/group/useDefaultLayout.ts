import { useMemo, useSyncExternalStore } from "react";
import { debounce } from "../../utils/debounce";
import { getStorageKey } from "./auto-save/getStorageKey";
import type { Layout, LayoutStorage, OnGroupLayoutChange } from "./types";

/**
 * Saves and restores group layouts between page loads.
 * It can be configured to store values using `localStorage`, `sessionStorage`, cookies, or any other persistence layer that makes sense for your application.
 */
export function useDefaultLayout({
  debounceSaveMs = 100,
  panelIds,
  storage = localStorage,
  ...rest
}: {
  /**
   * Debounce save operation by the specified number of milliseconds; defaults to 100ms
   */
  debounceSaveMs?: number;

  /**
   * For Groups that contain conditionally-rendered Panels, this prop can be used to save and restore multiple layouts.
   *
   * ℹ️ This prevents layout shift for server-rendered apps.
   *
   * ⚠️ Panel ids must match the Panels rendered within the Group during mount or the initial layout will be incorrect.
   */
  panelIds?: string[] | undefined;

  /**
   * Storage implementation; supports localStorage, sessionStorage, and custom implementations
   * Refer to documentation site for example integrations.
   *
   */
  storage?: LayoutStorage;
} & (
  | {
      /**
       * Group id; must be unique in order for layouts to be saved separately.
       * @deprecated Use the {@link id} param instead
       */
      groupId: string;
    }
  | {
      /**
       * Uniquely identifies a specific group/layout.
       */
      id: string;
    }
)) {
  const hasPanelIds = panelIds !== undefined;
  const id = "id" in rest ? rest.id : rest.groupId;

  const readStorageKey = getStorageKey(id, panelIds ?? []);

  // In the event that a client-only storage API is provided,
  // useSyncExternalStore prevents server/client hydration mismatch warning
  // This is not ideal; if possible a server-friendly storage API should be used
  const defaultLayoutString = useSyncExternalStore(
    subscribe,
    () => storage.getItem(readStorageKey),
    () => storage.getItem(readStorageKey)
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
      let writeStorageKey: string;
      if (hasPanelIds) {
        writeStorageKey = getStorageKey(id, Object.keys(layout));
      } else {
        writeStorageKey = getStorageKey(id, []);
      }

      try {
        storage.setItem(writeStorageKey, JSON.stringify(layout));
      } catch (error) {
        console.error(error);
      }
    };

    return debounceSaveMs > 0
      ? debounce(saveLayout, debounceSaveMs)
      : saveLayout;
  }, [debounceSaveMs, hasPanelIds, id, storage]);

  return {
    defaultLayout,
    onLayoutChange
  };
}

function subscribe() {
  return function unsubscribe() {};
}
