import type { Layout, LayoutStorage } from "../types";
import { getStorageKey } from "./getStorageKey";

export function saveGroupLayout({
  id,
  layout,
  storage
}: {
  id: string;
  layout: Layout;
  storage: LayoutStorage;
}) {
  try {
    const storageKey = getStorageKey(id);

    storage.setItem(storageKey, JSON.stringify(layout));
  } catch (error) {
    console.error(error);
  }
}
