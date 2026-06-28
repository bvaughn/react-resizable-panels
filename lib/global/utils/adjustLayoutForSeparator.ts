import { assert } from "../../utils/assert";
import {
  getMountedGroupState,
  updateMountedGroup
} from "../mutable-state/groups";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { findSeparatorGroup } from "./findSeparatorGroup";
import { getImperativeGroupMethods } from "./getImperativeGroupMethods";
import { layoutsEqual } from "./layoutsEqual";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function adjustLayoutForSeparator(
  separatorElement: HTMLElement,
  delta: number
) {
  const group = findSeparatorGroup(separatorElement);
  const groupState = getMountedGroupState(group.id, true);

  const separator = group.separators.find(
    (current) => current.element === separatorElement
  );
  assert(separator, "Matching separator not found");

  const panels = groupState.separatorToPanels.get(separator);
  assert(panels, "Matching panels not found");

  const pivotIndices = panels.map((panel) => group.panels.indexOf(panel));

  const groupAPI = getImperativeGroupMethods({ groupId: group.id });
  const prevLayout = groupAPI.getLayout();

  const unsafeLayout = adjustLayoutByDelta({
    delta,
    initialLayout: prevLayout,
    panelConstraints: groupState.derivedPanelConstraints,
    pivotIndices,
    prevLayout,
    trigger: "keyboard"
  });
  const nextLayout = validatePanelGroupLayout({
    layout: unsafeLayout,
    panelConstraints: groupState.derivedPanelConstraints
  });

  if (!layoutsEqual(prevLayout, nextLayout)) {
    updateMountedGroup(
      group,
      {
        defaultLayoutDeferred: groupState.defaultLayoutDeferred,
        derivedPanelConstraints: groupState.derivedPanelConstraints,
        groupSize: groupState.groupSize,
        layout: nextLayout,
        separatorToPanels: groupState.separatorToPanels
      },
      // Keyboard resizes (arrow keys, Home/End, Enter collapse/expand) originate
      // from a real DOM event on the separator, so they are user interactions
      // just like pointer drags. This function is only reached from
      // onDocumentKeyDown. See #716.
      { isUserInteraction: true }
    );
  }
}
