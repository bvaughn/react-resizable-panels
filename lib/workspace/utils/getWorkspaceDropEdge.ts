import { getClientScale } from "../../global/dom/getClientScale";
import type { WorkspaceDropEdge } from "../types";

// Dropping within this distance (in layout pixels) of an edge of the workspace's layout drops beside all of its tabsets
export const WORKSPACE_EDGE_THRESHOLD = 16;

/**
 * Which edge of the workspace (if any) a point is at: within the root element's padding, or within a few pixels of the edge of its layout
 * (where the tabsets beneath still accept drops further in, e.g. at the edge regions of their panels).
 *
 * ℹ️ Tabset headers (which contain the tab lists, so that drops between tabs stay precise) aren't edges of the workspace,
 * wherever they're placed (e.g. along the top), so an edge lined with tab lists only accepts drops within the root's padding.
 */
export function getWorkspaceDropEdge({
  clientX,
  clientY,
  element,
  layoutElement,
  rootElement
}: {
  clientX: number;
  clientY: number;
  /** The element at the point */
  element: Element;
  layoutElement: HTMLElement;
  rootElement: HTMLElement;
}): WorkspaceDropEdge | undefined {
  const scaleX = getClientScale(rootElement, "horizontal");
  const scaleY = getClientScale(rootElement, "vertical");

  // The root's padding box (its border doesn't accept drops); border widths are in layout pixels
  const rootRect = rootElement.getBoundingClientRect();
  const style =
    rootElement.ownerDocument.defaultView?.getComputedStyle(rootElement);
  const getBorder = (side: "Bottom" | "Left" | "Right" | "Top") =>
    parseFloat(style?.[`border${side}Width`] ?? "") || 0;
  if (
    clientX < rootRect.left + getBorder("Left") * scaleX ||
    clientX > rootRect.right - getBorder("Right") * scaleX ||
    clientY < rootRect.top + getBorder("Top") * scaleY ||
    clientY > rootRect.bottom - getBorder("Bottom") * scaleY
  ) {
    return undefined;
  }

  // Signed distances from the edges of the layout (negative within the root's padding)
  const layoutRect = layoutElement.getBoundingClientRect();
  const distances: { [edge in WorkspaceDropEdge]: number } = {
    bottom: layoutRect.bottom - clientY,
    left: clientX - layoutRect.left,
    right: layoutRect.right - clientX,
    top: clientY - layoutRect.top
  };

  // Over a header, only the root's padding accepts drops
  const isOverHeader = isWithinOwnHeader(element, rootElement);
  const thresholdX = isOverHeader ? 0 : WORKSPACE_EDGE_THRESHOLD * scaleX;
  const thresholdY = isOverHeader ? 0 : WORKSPACE_EDGE_THRESHOLD * scaleY;
  const thresholds: { [edge in WorkspaceDropEdge]: number } = {
    bottom: thresholdY,
    left: thresholdX,
    right: thresholdX,
    top: thresholdY
  };

  // In a corner, the edge the point is furthest past (or nearest to) wins
  let closest: WorkspaceDropEdge | undefined = undefined;
  for (const edge of Object.keys(distances) as WorkspaceDropEdge[]) {
    if (
      distances[edge] < thresholds[edge] &&
      (closest === undefined || distances[edge] < distances[closest])
    ) {
      closest = edge;
    }
  }

  return closest;
}

// Headers of other workspaces' tabsets (e.g. one rendered within a tab) are part of those tabsets' content
function isWithinOwnHeader(element: Element, rootElement: HTMLElement) {
  return (
    element.closest("[data-tabset-header]")?.closest("[data-workspace]") ===
    rootElement
  );
}
