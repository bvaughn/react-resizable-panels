import { beforeEach, describe, expect, test, vi } from "vitest";
import type { InteractionState } from "../mutable-state/types";
import { updateCursorStyle } from "./updateCursorStyle";
import { updateCursorStyles } from "./updateCursorStyles";

vi.mock("./updateCursorStyle", () => ({
  updateCursorStyle: vi.fn()
}));

describe("updateCursorStyles", () => {
  const documentA = document.implementation.createHTMLDocument("a");
  const documentB = document.implementation.createHTMLDocument("b");

  const inactive: InteractionState = { cursorFlags: 0, state: "inactive" };

  function hover(ownerDocument: Document): InteractionState {
    return { cursorFlags: 0, hitRegions: [], ownerDocument, state: "hover" };
  }

  beforeEach(() => {
    vi.mocked(updateCursorStyle).mockClear();
  });

  test("updates the document that becomes active", () => {
    updateCursorStyles({ prev: inactive, next: hover(documentA) });

    expect(vi.mocked(updateCursorStyle).mock.calls).toEqual([[documentA]]);
  });

  test("updates the document that becomes inactive", () => {
    updateCursorStyles({ prev: hover(documentA), next: inactive });

    expect(vi.mocked(updateCursorStyle).mock.calls).toEqual([[documentA]]);
  });

  test("updates both documents when interaction moves between them", () => {
    updateCursorStyles({ prev: hover(documentA), next: hover(documentB) });

    expect(vi.mocked(updateCursorStyle).mock.calls).toEqual([
      [documentA],
      [documentB]
    ]);
  });

  test("updates a document once when interaction stays in it", () => {
    updateCursorStyles({ prev: hover(documentA), next: hover(documentA) });

    expect(vi.mocked(updateCursorStyle).mock.calls).toEqual([[documentA]]);
  });

  test("does nothing while inactive", () => {
    updateCursorStyles({ prev: inactive, next: inactive });

    expect(updateCursorStyle).not.toHaveBeenCalled();
  });
});
