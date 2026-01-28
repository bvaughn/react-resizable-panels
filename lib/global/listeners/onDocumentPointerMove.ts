import {
  groups,
  pendingTransactions,
  pointerDownAtPoint
} from "../../state/Root";
import { adjustLayoutByDelta } from "../../utils/adjustLayoutByDelta";
import { findMatchingHitRegions } from "../../utils/findMatchingHitRegions";
import { scalePanelDimensions } from "../../utils/scalePanelDimensions";

export function onDocumentPointerMove(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const point = pointerDownAtPoint.current;
  if (point && pendingTransactions.length) {
    if (pendingTransactions.length) {
      pendingTransactions.forEach((transaction) => {
        const { group, initialLayout, pendingLayout, pivotIndices } =
          transaction;

        const deltaInPixels =
          group.orientation === "horizontal"
            ? event.clientX - point.x
            : event.clientY - point.y;
        const deltaAsPercentage = (deltaInPixels / group.groupSize) * 100;

        const scaledConstraints = scalePanelDimensions({
          groupSize: transaction.group.groupSize,
          panels: transaction.group.panels
        });

        const unsafeLayout = adjustLayoutByDelta({
          delta: deltaAsPercentage,
          initialLayout: initialLayout,
          panelConstraints: scaledConstraints,
          pivotIndices,
          prevLayout: pendingLayout,
          trigger: "mouse-or-touch"
        });

        transaction.proposedUpdate(unsafeLayout);
      });
    }

    // TODO Update global cursor
  } else {
    const hitRegions = findMatchingHitRegions(event, groups);
    if (hitRegions.length) {
      // TODO Update global cursor
    }
  }
}
