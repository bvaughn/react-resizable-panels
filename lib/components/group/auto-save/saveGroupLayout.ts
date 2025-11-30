import type { Layout } from "../types";
import { getStorageKey } from "./getStorageKey";

export function saveGroupLayout({
  id,
  layout,
  storage
}: {
  id: string;
  layout: Layout;
  storage: Pick<Storage, "getItem" | "setItem">;
}) {
  try {
    const storageKey = getStorageKey(id);

    storage.setItem(storageKey, JSON.stringify(layout));
  } catch (error) {
    console.error(error);
  }
}
