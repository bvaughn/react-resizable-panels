import type { RegisteredPanel } from "../../panel/types";
import type { Layout } from "../types";
import { getPanelKey } from "./getPanelKey";
import { getSavedLayouts } from "./getSavedLayouts";
import { getStorageKey } from "./getStorageKey";

export function saveGroupLayout({
  id,
  layout,
  panels,
  storage
}: {
  id: string;
  layout: Layout;
  panels: RegisteredPanel[];
  storage: Storage;
}) {
  const panelIdsKey = getPanelKey(panels);
  const storageKey = getStorageKey(id);
  const savedLayouts = getSavedLayouts({ id, storage });

  try {
    storage.setItem(
      storageKey,
      JSON.stringify({
        layouts: {
          ...savedLayouts.layouts,
          [panelIdsKey]: layout
        },
        mostRecentLayout: layout
      })
    );
  } catch (error) {
    console.error(error);
  }
}
