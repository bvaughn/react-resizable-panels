import type { TabDropTarget } from "../types";

export function isSameDropTarget(
  a: TabDropTarget | undefined,
  b: TabDropTarget | undefined
) {
  if (a === undefined || b === undefined) {
    return a === b;
  } else if (a.tabsetId !== b.tabsetId) {
    return false;
  } else if ("index" in a && "index" in b) {
    return a.index === b.index;
  } else if ("region" in a && "region" in b) {
    return a.region === b.region;
  }

  return false;
}
