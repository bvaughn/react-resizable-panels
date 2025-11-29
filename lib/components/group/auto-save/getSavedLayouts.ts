import { getStorageKey } from "./getStorageKey";
import type { SavedLayouts } from "./types";

export function getSavedLayouts({
  id,
  storage
}: {
  id: string;
  storage: Storage;
}): SavedLayouts {
  const storageKey = getStorageKey(id);
  try {
    const serialized = storage.getItem(storageKey);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (typeof parsed === "object" && parsed != null) {
        return parsed as SavedLayouts;
      }
    }
  } catch (error) {
    console.error(error);
  }

  return {
    layouts: {}
  };
}
