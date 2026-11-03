import type { SplitNode } from "../types";

/**
 * The parts of a split that its layout depends on (its children, and their sizes and collapsed flags),
 * e.g. to tell whether a layout measured for the split still applies to it (see setMeasuredSplitLayout).
 */
export function getSplitLayoutSignature(split: SplitNode): string {
  return JSON.stringify(
    split.children.map((child) => [
      child.id,
      child.type === "tabset" && !!child.collapsed,
      child.size ?? null
    ])
  );
}
