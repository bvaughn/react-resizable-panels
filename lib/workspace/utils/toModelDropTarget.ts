import type { TabDropTarget } from "../types";

// Drop regions are sides of the screen, but splits order their children from the start of the layout (see splitTabset);
// in a right-to-left layout, a horizontal split's first child is on the right, so "left" and "right" are swapped
export function toModelDropTarget(
  target: TabDropTarget,
  isRightToLeft: boolean
): TabDropTarget {
  if (!isRightToLeft || "index" in target) {
    return target;
  }

  switch (target.region) {
    case "left": {
      return { ...target, region: "right" };
    }
    case "right": {
      return { ...target, region: "left" };
    }
    default: {
      return target;
    }
  }
}
