import { afterEach, describe, expect, test, vi } from "vitest";
import { isViableHitTarget } from "./isViableHitTarget";

describe("isViableHitTarget", () => {
  const hitRegion = new DOMRect(0, 0, 10, 10);

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function mockModal(dialog: HTMLDialogElement, modal: boolean) {
    // JSDom supports neither showModal() nor the ":modal" pseudo-class
    const matches = dialog.matches.bind(dialog);
    vi.spyOn(dialog, "matches").mockImplementation((selector) =>
      selector === ":modal" ? modal : matches(selector)
    );
  }

  test("allows targets inside of the group", () => {
    const groupElement = document.createElement("div");
    const target = document.createElement("div");
    groupElement.appendChild(target);
    document.body.appendChild(groupElement);

    expect(
      isViableHitTarget({
        groupElement,
        hitRegion,
        pointerEventTarget: target
      })
    ).toBe(true);
  });

  test("ignores targets inside of a modal dialog that is inside of the group", () => {
    const groupElement = document.createElement("div");
    const dialog = document.createElement("dialog");
    const target = document.createElement("div");
    dialog.appendChild(target);
    groupElement.appendChild(dialog);
    document.body.appendChild(groupElement);

    mockModal(dialog, true);

    expect(
      isViableHitTarget({
        groupElement,
        hitRegion,
        pointerEventTarget: target
      })
    ).toBe(false);

    // The dialog itself (e.g. its ::backdrop) should also be ignored
    expect(
      isViableHitTarget({
        groupElement,
        hitRegion,
        pointerEventTarget: dialog
      })
    ).toBe(false);
  });

  test("ignores targets inside of a modal dialog that is outside of the group", () => {
    const groupElement = document.createElement("div");
    const dialog = document.createElement("dialog");
    const target = document.createElement("div");
    dialog.appendChild(target);
    document.body.appendChild(dialog);
    document.body.appendChild(groupElement);

    mockModal(dialog, true);

    expect(
      isViableHitTarget({
        groupElement,
        hitRegion,
        pointerEventTarget: target
      })
    ).toBe(false);
  });

  test("allows targets inside of a modal dialog that contains the group", () => {
    const dialog = document.createElement("dialog");
    const groupElement = document.createElement("div");
    const target = document.createElement("div");
    groupElement.appendChild(target);
    dialog.appendChild(groupElement);
    document.body.appendChild(dialog);

    mockModal(dialog, true);

    expect(
      isViableHitTarget({
        groupElement,
        hitRegion,
        pointerEventTarget: target
      })
    ).toBe(true);
  });

  test("allows targets inside of a non-modal dialog that is inside of the group", () => {
    const groupElement = document.createElement("div");
    const dialog = document.createElement("dialog");
    const target = document.createElement("div");
    dialog.appendChild(target);
    groupElement.appendChild(dialog);
    document.body.appendChild(groupElement);

    mockModal(dialog, false);

    expect(
      isViableHitTarget({
        groupElement,
        hitRegion,
        pointerEventTarget: target
      })
    ).toBe(true);
  });

  test("falls back to previous behavior if the :modal pseudo-class is not supported", () => {
    const groupElement = document.createElement("div");
    const dialog = document.createElement("dialog");
    const target = document.createElement("div");
    dialog.appendChild(target);
    groupElement.appendChild(dialog);
    document.body.appendChild(groupElement);

    // JSDom throws for ":modal" (no mock)
    expect(() => dialog.matches(":modal")).toThrow();

    expect(
      isViableHitTarget({
        groupElement,
        hitRegion,
        pointerEventTarget: target
      })
    ).toBe(true);
  });
});
