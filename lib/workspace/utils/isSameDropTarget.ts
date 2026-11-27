import type { TabDropTarget } from "../types";

export function isSameDropTarget(
  a: TabDropTarget | undefined,
  b: TabDropTarget | undefined
) {
  if (a === undefined || b === undefined) {
    return a === b;
  } else if ("float" in a || "float" in b) {
    return (
      "float" in a &&
      "float" in b &&
      a.float.x === b.float.x &&
      a.float.y === b.float.y &&
      a.float.width === b.float.width &&
      a.float.height === b.float.height
    );
  } else if ("edge" in a || "edge" in b) {
    return "edge" in a && "edge" in b && a.edge === b.edge;
  } else if (a.tabsetId !== b.tabsetId) {
    return false;
  } else if ("index" in a && "index" in b) {
    return a.index === b.index;
  } else if ("region" in a && "region" in b) {
    return a.region === b.region;
  }

  return false;
}
