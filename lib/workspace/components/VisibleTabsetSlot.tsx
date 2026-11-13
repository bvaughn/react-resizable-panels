import { useVisibleSize } from "../hooks/useVisibleSize";
import type { Orientation } from "../../global/types";
import type { TabsetNode } from "../types";
import { TabsetSlot } from "./TabsetSlot";

/**
 * A maximized tabset in a workspace that grows (see the growDirection prop): it covers what's visible of the workspace
 * (rather than all of it), and stays there as it's scrolled.
 *
 * ℹ️ This is its own component, so that re-measuring while scrolling doesn't re-render the whole Workspace.
 */
export function VisibleTabsetSlot({
  growDirection,
  rootElement,
  tabset
}: {
  growDirection: Orientation;
  rootElement: HTMLElement | null;
  tabset: TabsetNode;
}) {
  const visibleSize = useVisibleSize(rootElement, growDirection, true);
  const isVertical = growDirection === "vertical";

  const slot = <TabsetSlot isMaximizedOverlay tabset={tabset} />;
  return visibleSize !== undefined ? (
    <div
      style={{
        [isVertical ? "height" : "width"]: `min(100%, ${visibleSize}px)`,
        [isVertical ? "width" : "height"]: "100%",
        [isVertical ? "top" : "left"]: 0,
        position: "sticky"
      }}
    >
      {slot}
    </div>
  ) : (
    slot
  );
}
