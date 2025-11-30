import type { Layout } from "../types";
import { getStorageKey } from "./getStorageKey";

export function loadGroupLayout({
  id,
  storage
}: {
  id: string;
  storage: Pick<Storage, "getItem" | "setItem">;
}): Layout | undefined {
  try {
    const storageKey = getStorageKey(id);
    const text = storage.getItem(storageKey);
    if (text) {
      return JSON.parse(text) as Layout;
    }
  } catch (error) {
    console.error(error);
  }
}
