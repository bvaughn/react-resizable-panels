import { normalizeNode } from "./normalizeNode";
import type { FloatingTabsetNode, TabsetNode } from "../types";

// Floating tabsets without a valid size (e.g. from a corrupt saved model) are given this one
export const DEFAULT_FLOATING_TABSET_WIDTH = 320;
export const DEFAULT_FLOATING_TABSET_HEIGHT = 240;

/**
 * Tidies a floating tabset (see normalizeNode), changing it in place:
 * - Removes fields that only apply within the layout (its size and `collapsible` flag; floating tabsets can always be collapsed)
 * - Replaces invalid positions with 0 and invalid sizes with the default size (positions may be negative, e.g. a tabset dragged partly off of the left edge)
 *
 * @returns The tabset, or `null` if it should be removed (it has no tabs, and isn't kept when empty)
 */
export function normalizeFloatingTabset<TabData, TabsetData>(
  tabset: FloatingTabsetNode<TabData, TabsetData>
): FloatingTabsetNode<TabData, TabsetData> | null {
  const node = tabset as FloatingTabsetNode<TabData, TabsetData> & {
    collapsible?: unknown;
    size?: unknown;
  };
  delete node.collapsible;
  delete node.size;

  // Normalizing the tabset (below) expands it, since it isn't collapsible (like a tabset in the layout)
  const isCollapsed = node.collapsed === true;

  node.x = isFiniteNumber(node.x) ? node.x : 0;
  node.y = isFiniteNumber(node.y) ? node.y : 0;
  node.width =
    isFiniteNumber(node.width) && node.width > 0
      ? node.width
      : DEFAULT_FLOATING_TABSET_WIDTH;
  node.height =
    isFiniteNumber(node.height) && node.height > 0
      ? node.height
      : DEFAULT_FLOATING_TABSET_HEIGHT;

  // A floating tabset is normalized like a tabset in the layout (e.g. its selection is fixed), other than that it's never the root
  if (
    !normalizeNode(node as unknown as TabsetNode<TabData, TabsetData>, false)
  ) {
    return null;
  }

  if (isCollapsed) {
    node.collapsed = true;
  }

  return node;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
