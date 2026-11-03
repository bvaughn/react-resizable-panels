import { warnOnce } from "../../shared/utils/warnOnce";
import type {
  MaximumSize,
  MinimumSize,
  TabsetNode,
  WorkspaceNode
} from "../types";

type Applies = { height: boolean; width: boolean };

/**
 * Calculates the maximum size (in pixels) of every node in the tree; Infinity means no maximum.
 *
 * A tabset's maximum is the maximum size of its content area plus its "chrome" (its header).
 * A split's maximum is the sum of its children's maximums (plus separators and gaps) in its own direction, if they all have one,
 * and the smallest of them in the other direction (since its children share that size);
 * a collapsed tabset only counts its collapsed size (its header) in its split's direction.
 *
 * Maximums are only kept where they can be applied, since a split's children always fill it:
 * - In a split's direction, if another expanded child has no maximum (and can take up the rest of the space),
 *   or if the split's own maximum is applied by its parent
 * - In the other direction, if the split's own maximum is applied by its parent
 *
 * The root fills the workspace, so its maximum is never applied.
 *
 * ℹ️ A collapsed tabset's own maximum is the maximum it expands to.
 */
export function calculateMaximumSizes(
  root: WorkspaceNode,
  {
    getChromeSize,
    getCollapsedSize,
    getContentMaximumSize,
    getSeparatorsSize
  }: {
    getChromeSize: (tabsetId: string) => MinimumSize | undefined;
    getCollapsedSize: (tabsetId: string) => number | undefined;
    getContentMaximumSize: (tabset: TabsetNode) => MaximumSize;
    getSeparatorsSize: (splitId: string) => number | undefined;
  }
): Map<string, MaximumSize> {
  const contentSizes = new Map<string, MaximumSize>();
  const sizes = new Map<string, MaximumSize>();

  // Each node's maximum, whether or not it can be applied
  const visit = (node: WorkspaceNode): MaximumSize => {
    let size: MaximumSize;

    if (node.type === "tabset") {
      const content = getContentMaximumSize(node);
      const chrome = getChromeSize(node.id) ?? { height: 0, width: 0 };
      contentSizes.set(node.id, content);

      size = {
        height: content.height + chrome.height,
        width: content.width + chrome.width
      };
    } else {
      const children = node.children.map((child) => {
        const size = visit(child);
        if (child.type !== "tabset" || !child.collapsed) {
          return size;
        }

        const collapsedSize = getCollapsedSize(child.id) ?? 0;
        return node.orientation === "horizontal"
          ? { ...size, width: collapsedSize }
          : { ...size, height: collapsedSize };
      });
      const separators = getSeparatorsSize(node.id) ?? 0;

      const sum = (key: keyof MaximumSize) =>
        children.reduce((total, child) => total + child[key], 0) + separators;
      const min = (key: keyof MaximumSize) =>
        Math.min(...children.map((child) => child[key]));

      size =
        node.orientation === "horizontal"
          ? { height: min("height"), width: sum("width") }
          : { height: sum("height"), width: min("width") };
    }

    sizes.set(node.id, size);

    return size;
  };

  // Maximums that can't be applied are removed
  const apply = (node: WorkspaceNode, applies: Applies) => {
    const size = sizes.get(node.id)!;

    if (node.type === "tabset") {
      const content = contentSizes.get(node.id)!;
      for (const key of ["height", "width"] as const) {
        if (!applies[key] && Number.isFinite(content[key])) {
          warnOnce(
            `Tabset "${node.id}" can't be limited to its ${key === "height" ? "maxHeight" : "maxWidth"}, since nothing else can take up the rest of the space (e.g. every other tabset in its split has a maximum ${key}, or it fills the workspace)`
          );
        }
      }
    } else {
      const along = node.orientation === "horizontal" ? "width" : "height";
      const across = along === "width" ? "height" : "width";

      // Read before the children are visited (which replaces their maximums)
      const unlimitedIds = node.children
        .filter(
          (child) =>
            !(child.type === "tabset" && child.collapsed) &&
            !Number.isFinite(sizes.get(child.id)![along])
        )
        .map(({ id }) => id);

      for (const child of node.children) {
        const hasUnlimitedSibling = unlimitedIds.some((id) => id !== child.id);

        apply(child, {
          [along]: hasUnlimitedSibling || applies[along],
          [across]: applies[across]
        } as Applies);
      }
    }

    sizes.set(node.id, {
      height: applies.height ? size.height : Infinity,
      width: applies.width ? size.width : Infinity
    });
  };

  visit(root);
  apply(root, { height: false, width: false });

  return sizes;
}
