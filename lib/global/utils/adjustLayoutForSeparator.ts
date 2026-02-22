import { assert } from "../../utils/assert";
import { getMountedGroup, updateMountedGroup } from "../mutable-state/groups";
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
  const [_, data] = getMountedGroup(group.id, true);

  const separator = group.separators.find(
    (current) => current.element === separatorElement
  );
  assert(separator, "Matching separator not found");

  const panels = data.separatorToPanels.get(separator);
  assert(panels, "Matching panels not found");

  const pivotIndices = panels.map((panel) => group.panels.indexOf(panel));

  const groupAPI = getImperativeGroupMethods({ groupId: group.id });
  const prevLayout = groupAPI.getLayout();

  const unsafeLayout = adjustLayoutByDelta({
    delta,
    initialLayout: prevLayout,
    panelConstraints: data.derivedPanelConstraints,
    pivotIndices,
    prevLayout,
    trigger: "keyboard"
  });
  const nextLayout = validatePanelGroupLayout({
    layout: unsafeLayout,
    panelConstraints: data.derivedPanelConstraints
  });

  if (!layoutsEqual(prevLayout, nextLayout)) {
    updateMountedGroup(group, {
      defaultLayoutDeferred: data.defaultLayoutDeferred,
      derivedPanelConstraints: data.derivedPanelConstraints,
      layout: nextLayout,
      separatorToPanels: data.separatorToPanels
    });
  }
}
