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
  const panelKey = getPanelKey(panels);
  const storageKey = getStorageKey(id);

  const savedLayouts = getSavedLayouts({ id, storage });
  savedLayouts[panelKey] = layout;

  try {
    storage.setItem(storageKey, JSON.stringify(savedLayouts));
  } catch (error) {
    console.error(error);
  }
}
