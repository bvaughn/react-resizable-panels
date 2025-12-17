import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getStorageKey } from "./auto-save/getStorageKey";
import { saveGroupLayout } from "./auto-save/saveGroupLayout";
import type { Layout, LayoutStorage, OnGroupLayoutChange } from "./types";

export function useDefaultLayout({
  groupId,
  storage
}: {
  groupId: string;
  storage: LayoutStorage;
}) {
  // In the event that a client-only storage API is provided,
  // useSyncExternalStore prevents server/client hydration mismatch warning
  // This is not ideal; if possible a server-friendly storage API should be used
  const defaultLayoutString = useSyncExternalStore(
    subscribe,
    () => storage.getItem(getStorageKey(groupId)),
    () => storage.getItem(getStorageKey(groupId))
  );

  const defaultLayout = useMemo(
    () =>
      defaultLayoutString
        ? (JSON.parse(defaultLayoutString) as Layout)
        : undefined,
    [defaultLayoutString]
  );

  const onLayoutChange = useCallback<NonNullable<OnGroupLayoutChange>>(
    (layout) =>
      saveGroupLayout({
        id: groupId,
        layout,
        storage
      }),
    [groupId, storage]
  );

  return {
    defaultLayout,
    onLayoutChange
  };
}

function subscribe() {
  return function unsubscribe() {};
}
