import { warnOnce } from "../../shared/utils/warnOnce";
import type {
  MaximumSize,
  MinimumSize,
  TabsetNode,
  WorkspaceNode
} from "../types";

type Applies = { height: boolean; width: boolean };

type Size = { height: number; width: number };

/**
 * Calculates the minimum and maximum sizes (in pixels) of every node in the tree, in a single walk; Infinity means no maximum.
 *
 * A tabset's minimum (or maximum) is the minimum (or maximum) size of its content area plus its "chrome" (its header).
 * In a split's direction, its minimum is the sum of its children's minimums (plus separators and gaps), and so is its maximum (if they all have one).
 * In the other direction, its minimum is the largest of its children's minimums, and its maximum is the smallest of their maximums (since its children share that size).
 * A collapsed tabset only counts its collapsed size (its header) in its split's direction.
 *
 * Maximums are only kept where they can be applied, since a split's children always fill it:
 * - In a split's direction, if another expanded child has no maximum (and can take up the rest of the space),
 *   or if the split's own maximum is applied by its parent
 * - In the other direction, if the split's own maximum is applied by its parent
 *
 * The root fills the workspace, so its maximum is never applied.
 * Except along `growDirection` (see the Workspace prop), where rows don't have to fill anything: every maximum along it applies.
 *
 * ℹ️ A collapsed tabset's own minimum (and maximum) is the one it expands to (which collapsible Panels use to decide when to collapse and expand).
 */
export function calculateSizeLimits(
  root: WorkspaceNode,
  {
    getChromeSize,
    getCollapsedSize,
    getContentMaximumSize,
    getContentMinimumSize,
    getSeparatorsSize,
    growDirection
  }: {
    getChromeSize: (tabsetId: string) => MinimumSize | undefined;
    getCollapsedSize: (tabsetId: string) => number | undefined;
    getContentMaximumSize: (tabset: TabsetNode) => MaximumSize;
    getContentMinimumSize: (tabset: TabsetNode) => MinimumSize;
    getSeparatorsSize: (splitId: string) => number | undefined;
    growDirection?: "horizontal" | "vertical" | undefined;
  }
): {
  maximumSizes: Map<string, MaximumSize>;
  minimumSizes: Map<string, MinimumSize>;
} {
  const contentMaximumSizes = new Map<string, MaximumSize>();
  const maximumSizes = new Map<string, MaximumSize>();
  const minimumSizes = new Map<string, MinimumSize>();

  // Each node's minimum and maximum (whether or not the maximum can be applied)
  const visit = (node: WorkspaceNode): { max: Size; min: Size } => {
    let max: Size;
    let min: Size;

    if (node.type === "tabset") {
      const chrome = getChromeSize(node.id) ?? { height: 0, width: 0 };
      const contentMin = getContentMinimumSize(node);
      const contentMax = getContentMaximumSize(node);
      contentMaximumSizes.set(node.id, contentMax);

      min = {
        height: contentMin.height + chrome.height,
        width: contentMin.width + chrome.width
      };
      max = {
        height: contentMax.height + chrome.height,
        width: contentMax.width + chrome.width
      };
    } else {
      const along = node.orientation === "horizontal" ? "width" : "height";
      const across = along === "width" ? "height" : "width";
      const separators = getSeparatorsSize(node.id) ?? 0;

      // Children are summed first, and then separators (and gaps) are added
      let minAlong = 0;
      let minAcross = 0;
      let maxAlong = 0;
      let maxAcross = Infinity;
      for (const child of node.children) {
        const sizes = visit(child);

        // A collapsed tabset only counts its collapsed size along the split (and nothing across it, toward the minimum)
        if (child.type === "tabset" && child.collapsed) {
          const collapsedSize = getCollapsedSize(child.id) ?? 0;
          minAlong += collapsedSize;
          maxAlong += collapsedSize;
          maxAcross = Math.min(maxAcross, sizes.max[across]);
        } else {
          minAlong += sizes.min[along];
          minAcross = Math.max(minAcross, sizes.min[across]);
          maxAlong += sizes.max[along];
          maxAcross = Math.min(maxAcross, sizes.max[across]);
        }
      }

      min = { [along]: minAlong + separators, [across]: minAcross } as Size;
      max = { [along]: maxAlong + separators, [across]: maxAcross } as Size;
    }

    minimumSizes.set(node.id, min);
    maximumSizes.set(node.id, max);

    return { max, min };
  };

  // Maximums that can't be applied are removed
  const apply = (node: WorkspaceNode, applies: Applies) => {
    const size = maximumSizes.get(node.id)!;

    if (node.type === "tabset") {
      const content = contentMaximumSizes.get(node.id)!;
      for (const key of ["height", "width"] as const) {
        if (!applies[key] && Number.isFinite(content[key])) {
          if (process.env.NODE_ENV !== "production") {
            warnOnce(
              `Tabset "${node.id}" can't be limited to its ${key === "height" ? "maxHeight" : "maxWidth"}, since nothing else can take up the rest of the space (e.g. every other tabset in its split has a maximum ${key}, or it fills the workspace)`
            );
          }
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
            !Number.isFinite(maximumSizes.get(child.id)![along])
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

    maximumSizes.set(node.id, {
      height: applies.height ? size.height : Infinity,
      width: applies.width ? size.width : Infinity
    });
  };

  visit(root);
  apply(root, {
    height: growDirection === "vertical",
    width: growDirection === "horizontal"
  });

  return { maximumSizes, minimumSizes };
}
