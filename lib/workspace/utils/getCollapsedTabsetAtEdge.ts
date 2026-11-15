import type { WorkspaceDropEdge } from "../types";

// Rounding (e.g. at fractional display scaling) can leave a tabset that lines an edge a fraction of a pixel inside it
const TOLERANCE = 1;

/**
 * The id of the collapsed tabset that lines an edge of the workspace's layout at a point along that edge (if there is one),
 * e.g. a sidebar collapsed to a strip of tabs, which tabs dropped at that edge are added to (rather than being dropped beside all of the tabsets).
 *
 * ℹ️ The tabset is found by where it is shown (rather than by its place in the model), so it can be nested within other splits
 * (e.g. a sidebar beside an editor, above a bottom panel that spans the workspace).
 * Edges are sides of the screen (see getWorkspaceDropEdge), as are the tabsets' boxes, so no conversion is needed for right-to-left layouts.
 */
export function getCollapsedTabsetAtEdge({
  clientX,
  clientY,
  edge,
  isEligible,
  layoutElement,
  rootElement
}: {
  clientX: number;
  clientY: number;
  edge: WorkspaceDropEdge;
  // Lets the caller skip tabsets (e.g. those whose headers don't run along the edge)
  isEligible?: ((tabsetId: string) => boolean) | undefined;
  layoutElement: HTMLElement;
  rootElement: HTMLElement;
}): string | undefined {
  const layoutRect = layoutElement.getBoundingClientRect();

  // Floating tabsets and a maximized tabset are rendered outside of the layout element, so they aren't included
  for (const element of Array.from(
    layoutElement.querySelectorAll<HTMLElement>(
      "[data-tabset-id][data-tabset-collapsed]"
    )
  )) {
    // Tabsets of workspaces nested within tabs are part of those tabs' content
    if (element.closest("[data-workspace]") !== rootElement) {
      continue;
    }

    if (isEligible && !isEligible(element.dataset.tabsetId!)) {
      continue;
    }

    const rect = element.getBoundingClientRect();
    const isAlongEdge =
      edge === "left" || edge === "right"
        ? clientY >= rect.top && clientY < rect.bottom
        : clientX >= rect.left && clientX < rect.right;
    if (!isAlongEdge) {
      continue;
    }

    let distance: number;
    switch (edge) {
      case "bottom":
        distance = layoutRect.bottom - rect.bottom;
        break;
      case "left":
        distance = rect.left - layoutRect.left;
        break;
      case "right":
        distance = layoutRect.right - rect.right;
        break;
      case "top":
        distance = rect.top - layoutRect.top;
        break;
    }

    if (Math.abs(distance) <= TOLERANCE) {
      return element.dataset.tabsetId;
    }
  }

  return undefined;
}
