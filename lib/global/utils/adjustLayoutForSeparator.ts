import {
  updateMountedAxis,
  type MountedAxisState
} from "../mutable-state/axes";
import type { RegisteredResizeAxis, RegisteredSeparator } from "../types";
import { assert } from "../../shared/utils/assert";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { layoutsEqual } from "./layoutsEqual";
import { validateAxisLayout } from "./validateAxisLayout";

export function adjustLayoutForSeparator({
  axis,
  axisState,
  delta,
  separator
}: {
  axis: RegisteredResizeAxis;
  axisState: MountedAxisState;
  delta: number;
  separator: RegisteredSeparator;
}) {
  const items = axisState.separatorToItems.get(separator);
  assert(items, "Matching panels not found");

  const pivotIndices = items.map((item) => axis.items.indexOf(item));

  // A deferred layout (e.g. an axis mounted in a hidden DOM subtree) has not been validated, so it should not be used
  const prevLayout = axisState.defaultLayoutDeferred ? {} : axisState.layout;

  const unsafeLayout = adjustLayoutByDelta({
    delta,
    initialLayout: prevLayout,
    itemConstraints: axisState.derivedItemConstraints,
    pivotIndices,
    prevLayout,
    trigger: "keyboard"
  });
  const nextLayout = validateAxisLayout({
    layout: unsafeLayout,
    itemConstraints: axisState.derivedItemConstraints
  });

  if (!layoutsEqual(prevLayout, nextLayout)) {
    updateMountedAxis(
      axis,
      {
        defaultLayoutDeferred: axisState.defaultLayoutDeferred,
        derivedItemConstraints: axisState.derivedItemConstraints,
        axisSize: axisState.axisSize,
        layout: nextLayout,
        requestedAxisSize: axisState.axisSize,
        requestedLayout: nextLayout,
        separatorToItems: axisState.separatorToItems
      },
      // Keyboard resizes (arrow keys, Home/End, Enter collapse/expand) originate
      // from a real DOM event on the separator, so they are user interactions
      // just like pointer drags. This function is only reached from
      // onDocumentKeyDown. See #716.
      { isUserInteraction: true }
    );
  }
}
