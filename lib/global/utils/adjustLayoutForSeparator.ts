import { assert } from "../../utils/assert";
import { update } from "../mutableState";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { findSeparatorGroup } from "./findSeparatorGroup";
import { getImperativeGroupMethods } from "./getImperativeGroupMethods";
import { getMountedGroup } from "./getMountedGroup";
import { layoutsEqual } from "./layoutsEqual";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function adjustLayoutForSeparator(
  separatorElement: HTMLElement,
  delta: number
) {
  const group = findSeparatorGroup(separatorElement);
  const mountedGroup = getMountedGroup(group);

  const separator = group.separators.find(
    (current) => current.element === separatorElement
  );
  assert(separator, "Matching separator not found");

  const panels = mountedGroup.separatorToPanels.get(separator);
  assert(panels, "Matching panels not found");

  const pivotIndices = panels.map((panel) => group.panels.indexOf(panel));

  const groupAPI = getImperativeGroupMethods({ groupId: group.id });
  const prevLayout = groupAPI.getLayout();

  const unsafeLayout = adjustLayoutByDelta({
    delta,
    initialLayout: prevLayout,
    panelConstraints: mountedGroup.derivedPanelConstraints,
    pivotIndices,
    prevLayout,
    trigger: "keyboard"
  });
  const nextLayout = validatePanelGroupLayout({
    layout: unsafeLayout,
    panelConstraints: mountedGroup.derivedPanelConstraints
  });

  if (!layoutsEqual(prevLayout, nextLayout)) {
    update((prevState) => ({
      mountedGroups: new Map(prevState.mountedGroups).set(group, {
        defaultLayoutDeferred: mountedGroup.defaultLayoutDeferred,
        derivedPanelConstraints: mountedGroup.derivedPanelConstraints,
        layout: nextLayout,
        separatorToPanels: mountedGroup.separatorToPanels
      })
    }));
  }
}
