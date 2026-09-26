import type { Layout, RegisteredResizeItem } from "../types";

export function validateLayoutKeys(
  items: RegisteredResizeItem[],
  layout: Layout
) {
  const itemIds = items.map((item) => item.id);
  const layoutKeys = Object.keys(layout);

  if (itemIds.length !== layoutKeys.length) {
    return false;
  }

  for (const itemId of itemIds) {
    if (!layoutKeys.includes(itemId)) {
      return false;
    }
  }

  return true;
}
