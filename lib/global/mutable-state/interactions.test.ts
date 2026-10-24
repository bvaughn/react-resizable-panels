import { afterEach, describe, expect, test, vi } from "vitest";
import { calculateHitRegions } from "../dom/calculateHitRegions";
import { mockGroup } from "../test/mockGroup";
import { calculateResizePreviews } from "../utils/calculateResizePreviews";
import {
  getInteractionState,
  removeAxisFromInteraction,
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
  const hitRegions = groups.flatMap((group) =>
    calculateHitRegions({ axis: group })
  );
  const initialLayoutMap = new Map(
    groups.map((group) => [
      group,
      {
        [group.items[0].id]: 50,
        [group.items[1].id]: 50
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
    ownerDocument: document,
    pointerId: 1,
    pointerType: "mouse",
    previewLayoutMap: new Map(initialLayoutMap),
    previews,
    state: "active"
  });

  removeAxisFromInteraction(groups[0]);

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

  removeAxisFromInteraction(groups[1]);
  expect(getInteractionState().state).toBe("inactive");
});

describe("click events after a pointer drag", () => {
  let button: HTMLButtonElement | undefined;

  afterEach(() => {
    button?.remove();
    button = undefined;
    vi.useRealTimers();
  });

  // Boundaries between Panels without Separators don't capture the pointer,
  // so releasing it over an element where the drag began would otherwise "click" that element
  function dragAndRelease({ didPointerMove }: { didPointerMove: boolean }) {
    const group = mockGroup(new DOMRect(0, 0, 200, 100));
    group.addPanel(new DOMRect(0, 0, 100, 100));
    group.addPanel(new DOMRect(100, 0, 100, 100));
    const hitRegions = calculateHitRegions({ axis: group });
    const initialLayoutMap = new Map([
      [group, { [group.items[0].id]: 50, [group.items[1].id]: 50 }]
    ]);

    updateInteractionState({
      cursorFlags: 0,
      didPointerMove,
      hitRegions,
      initialLayoutMap,
      ownerDocument: document,
      pointerDownAtPoint: { x: 100, y: 50 },
      pointerId: 1,
      pointerType: "mouse",
      previewLayoutMap: new Map(initialLayoutMap),
      previews: [],
      state: "active"
    });
    updateInteractionState({ cursorFlags: 0, state: "inactive" });
  }

  function renderButton() {
    const onClick = vi.fn();
    button = document.createElement("button");
    button.addEventListener("click", onClick);
    document.body.appendChild(button);
    return onClick;
  }

  test("suppresses the click that follows a drag", () => {
    const onClick = renderButton();

    dragAndRelease({ didPointerMove: true });
    button!.click();

    expect(onClick).not.toHaveBeenCalled();
  });

  test("only suppresses one click", () => {
    const onClick = renderButton();

    dragAndRelease({ didPointerMove: true });
    button!.click();
    button!.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not suppress a later click if none followed the drag", () => {
    vi.useFakeTimers();
    const onClick = renderButton();

    dragAndRelease({ didPointerMove: true });
    vi.runAllTimers();
    button!.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not suppress the click if the pointer did not move", () => {
    const onClick = renderButton();

    dragAndRelease({ didPointerMove: false });
    button!.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
