import type { Layout } from "../types";
import { validateAxisLayout } from "./validateAxisLayout";

/**
 * Scales a layout so that its sizes total 100% (rounded the same way as validateAxisLayout),
 * without applying item constraints.
 *
 * @param itemIds Ids in render order; determines which item absorbs rounding errors
 */
export function normalizeLayout({
  itemIds,
  layout
}: {
  itemIds: string[];
  layout: Layout;
}): Layout {
  return validateAxisLayout({
    layout,
    itemConstraints: itemIds.map((itemId) => ({
      collapsedSize: 0,
      collapsible: false,
      defaultSize: undefined,
      disabled: undefined,
      itemId,
      maxSize: 100,
      minSize: 0
    }))
  });
}
