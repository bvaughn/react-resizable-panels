import type { SplitNode } from "../types";
import { isLengthSize } from "./isLengthSize";

/**
 * Each expanded child's share (as a percentage) of the expanded children's total length, in a split that grows (see the Workspace's growDirection prop):
 * the split is as large as its children's lengths, so these are the sizes its Group should give them.
 *
 * ℹ️ Collapsed children are as large as their headers (their Panels' collapsed sizes), so they aren't included.
 *
 * @param toPixels Converts a length (e.g. "20rem") to pixels
 */
export function getGrowingShares(
  split: SplitNode,
  defaultSize: string,
  toPixels: (length: string) => number
): { [nodeId: string]: number } {
  const lengths: { [nodeId: string]: number } = {};
  let total = 0;
  for (const child of split.children) {
    if (child.type === "tabset" && child.collapsed) {
      continue;
    }

    const length = toPixels(
      isLengthSize(child.size) ? child.size : defaultSize
    );
    lengths[child.id] = length;
    total += length;
  }

  const shares: { [nodeId: string]: number } = {};
  for (const [nodeId, length] of Object.entries(lengths)) {
    shares[nodeId] = total > 0 ? (length / total) * 100 : 0;
  }

  return shares;
}
