import { describe, expect, test } from "vitest";
import { createSiblingElements } from "../../global/test/createSiblingElements";
import { isInDocumentOrder } from "./isInDocumentOrder";

describe("isInDocumentOrder", () => {
  test("isInDocumentOrder", () => {
    const [a, b, c] = createSiblingElements("a", "b", "c");

    expect(isInDocumentOrder([])).toBe(true);
    expect(isInDocumentOrder([a])).toBe(true);
    expect(isInDocumentOrder([a, b, c])).toBe(true);
    expect(isInDocumentOrder([a, c])).toBe(true);
    expect(isInDocumentOrder([b, a, c])).toBe(false);
    expect(isInDocumentOrder([a, c, b])).toBe(false);
  });

  test("isInDocumentOrder treats disconnected elements as in order", () => {
    const [a, b] = createSiblingElements("a", "b");
    const detached = document.createElement("div");

    expect(isInDocumentOrder([a, detached, b])).toBe(true);
    expect(isInDocumentOrder([b, detached])).toBe(true);
  });
});
