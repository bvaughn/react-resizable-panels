import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getStorageKey } from "./auto-save/getStorageKey";
import { saveGroupLayout } from "./auto-save/saveGroupLayout";
import type { Layout, LayoutStorage, OnGroupLayoutChange } from "./types";

export function useDefaultLayout({
  groupId,
  storage,
  panelIds
}: {
  groupId: string;
  storage: LayoutStorage;
  panelIds?: string[];
}) {
  // Stable sorted reference for panelIds
  const sortedPanelIds = useMemo(
    () => (panelIds ? [...panelIds].sort() : undefined),
    [panelIds]
  );

  // In the event that a client-only storage API is provided,
  // useSyncExternalStore prevents server/client hydration mismatch warning
  // This is not ideal; if possible a server-friendly storage API should be used
  const defaultLayoutString = useSyncExternalStore(
    subscribe,
    () => storage.getItem(getStorageKey(groupId)),
    () => storage.getItem(getStorageKey(groupId))
  );

  const defaultLayout = useMemo(() => {
    if (!defaultLayoutString) {
      return undefined;
    }

    try {
      const layout = JSON.parse(defaultLayoutString) as Layout;

      // If panelIds provided, validate layout matches
      if (sortedPanelIds) {
        const layoutPanelIds = Object.keys(layout).sort();
        const panelIdsMatch =
          layoutPanelIds.length === sortedPanelIds.length &&
          layoutPanelIds.every((id, index) => id === sortedPanelIds[index]);

        if (!panelIdsMatch) {
          // Layout doesn't match current panels, ignore it
          console.warn(
            `[react-resizable-panels] Ignoring saved layout for group "${groupId}" ` +
              `because panel IDs don't match. ` +
              `Expected: [${sortedPanelIds.join(", ")}], ` +
              `Found: [${layoutPanelIds.join(", ")}]`
          );
          return undefined;
        }
      }

      return layout;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }, [defaultLayoutString, sortedPanelIds, groupId]);

  const onLayoutChange = useCallback<NonNullable<OnGroupLayoutChange>>(
    (layout) => {
      // Validate before saving
      if (sortedPanelIds) {
        const layoutPanelIds = Object.keys(layout).sort();
        const panelIdsMatch =
          layoutPanelIds.length === sortedPanelIds.length &&
          layoutPanelIds.every((id, index) => id === sortedPanelIds[index]);

        if (!panelIdsMatch) {
          console.warn(
            `[react-resizable-panels] Not saving layout for group "${groupId}" ` +
              `because panel IDs don't match expected configuration`
          );
          return;
        }
      }

      saveGroupLayout({
        id: groupId,
        layout,
        storage
      });
    },
    [groupId, storage, sortedPanelIds]
  );

  return {
    defaultLayout,
    onLayoutChange
  };
}

function subscribe() {
  return function unsubscribe() {};
}
