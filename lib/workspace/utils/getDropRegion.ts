import type { TabDropRegion } from "../types";

// Dropping within this fraction of an edge splits the tabset; anywhere else adds the tab to it
const EDGE_THRESHOLD = 0.25;

export function getDropRegion(
  rect: DOMRect,
  clientX: number,
  clientY: number
): TabDropRegion {
  const x = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5;
  const y = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5;

  const distances: { [region in Exclude<TabDropRegion, "center">]: number } = {
    bottom: 1 - y,
    left: x,
    right: 1 - x,
    top: y
  };
  const region = (
    Object.keys(distances) as Exclude<TabDropRegion, "center">[]
  ).reduce(
    (closest, current) =>
      distances[current] < distances[closest] ? current : closest,
    "left"
  );

  return distances[region] < EDGE_THRESHOLD ? region : "center";
}
