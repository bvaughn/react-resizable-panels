import { assert } from "../../utils/assert";
import { getMountedAxisState, updateMountedAxis } from "../mutable-state/axes";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { findSeparatorAxis } from "./findSeparatorAxis";
import { getImperativeAxisMethods } from "./getImperativeAxisMethods";
import { layoutsEqual } from "./layoutsEqual";
import { validateAxisLayout } from "./validateAxisLayout";

export function adjustLayoutForSeparator(
  separatorElement: HTMLElement,
  delta: number
) {
  const axis = findSeparatorAxis(separatorElement);
  const axisState = getMountedAxisState(axis.id, true);

  const separator = axis.separators.find(
    (current) => current.element === separatorElement
  );
  assert(separator, "Matching separator not found");

  const items = axisState.separatorToItems.get(separator);
  assert(items, "Matching panels not found");

  const pivotIndices = items.map((item) => axis.items.indexOf(item));

  const axisAPI = getImperativeAxisMethods({ axisId: axis.id });
  const prevLayout = axisAPI.getLayout();

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
