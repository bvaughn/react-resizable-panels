import type { MinimumSize, TabsetNode, WorkspaceNode } from "../types";

/**
 * Calculates the minimum size (in pixels) of every node in the tree.
 *
 * A tabset's minimum is the minimum size of its content area plus its "chrome" (its header).
 * A split's minimum is the sum of its children's minimums (plus separators) in its own direction, and the largest of them in the other direction.
 */
export function calculateMinimumSizes(
  root: WorkspaceNode,
  {
    getChromeSize,
    getContentMinimumSize,
    getSeparatorsSize
  }: {
    getChromeSize: (tabsetId: string) => MinimumSize | undefined;
    getContentMinimumSize: (tabset: TabsetNode) => MinimumSize;
    getSeparatorsSize: (splitId: string) => number | undefined;
  }
): Map<string, MinimumSize> {
  const sizes = new Map<string, MinimumSize>();

  const visit = (node: WorkspaceNode): MinimumSize => {
    let size: MinimumSize;

    if (node.type === "tabset") {
      const content = getContentMinimumSize(node);
      const chrome = getChromeSize(node.id) ?? { height: 0, width: 0 };

      size = {
        height: content.height + chrome.height,
        width: content.width + chrome.width
      };
    } else {
      const children = node.children.map(visit);
      const separators = getSeparatorsSize(node.id) ?? 0;

      const sum = (key: keyof MinimumSize) =>
        children.reduce((total, child) => total + child[key], 0) + separators;
      const max = (key: keyof MinimumSize) =>
        Math.max(0, ...children.map((child) => child[key]));

      size =
        node.orientation === "horizontal"
          ? { height: max("height"), width: sum("width") }
          : { height: sum("height"), width: max("width") };
    }

    sizes.set(node.id, size);

    return size;
  };

  visit(root);

  return sizes;
}
