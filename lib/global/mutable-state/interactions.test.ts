import { afterEach, expect, test } from "vitest";
import { calculateHitRegions } from "../dom/calculateHitRegions";
import { mockGroup } from "../test/mockGroup";
import { calculateResizePreviews } from "../utils/calculateResizePreviews";
import {
  getInteractionState,
  removeGroupFromInteraction,
  updateInteractionState
} from "./interactions";

afterEach(() => {
  updateInteractionState({ cursorFlags: 0, state: "inactive" });
});

test("removing a group preserves the other group in a shared drag", () => {
  const groups = [0, 100].map((top) => {
    const group = mockGroup(new DOMRect(0, top, 200, 100));
    group.addPanel(new DOMRect(0, 0, 100, 100));
    group.addPanel(new DOMRect(100, 0, 100, 100));
    return group;
  });
  const hitRegions = groups.flatMap((group) => calculateHitRegions({ group }));
  const initialLayoutMap = new Map(
    groups.map((group) => [
      group,
      {
        [group.panels[0].id]: 50,
        [group.panels[1].id]: 50
      }
    ])
  );
  const previews = groups.flatMap((group) =>
    calculateResizePreviews(group, hitRegions)
  );

  updateInteractionState({
    cursorFlags: 0,
    didPointerMove: false,
    hitRegions,
    initialLayoutMap,
    pointerDownAtPoint: { x: 100, y: 100 },
    previewLayoutMap: new Map(initialLayoutMap),
    previews,
    state: "active"
  });

  removeGroupFromInteraction(groups[0]);

  const interaction = getInteractionState();
  expect(interaction.state).toBe("active");
  if (interaction.state !== "active") {
    throw Error("Expected active interaction");
  }
  expect(interaction.hitRegions).toEqual([hitRegions[1]]);
  expect(interaction.previews).toEqual([previews[1]]);
  expect(interaction.previews[0]).toBe(previews[1]);
  expect(interaction.initialLayoutMap.has(groups[0])).toBe(false);
  expect(interaction.previewLayoutMap.has(groups[0])).toBe(false);
  expect(interaction.initialLayoutMap.get(groups[1])).toBe(
    initialLayoutMap.get(groups[1])
  );

  removeGroupFromInteraction(groups[1]);
  expect(getInteractionState().state).toBe("inactive");
});
