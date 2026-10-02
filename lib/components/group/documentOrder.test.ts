import { describe, expect, test } from "vitest";
import { isInDocumentOrder } from "./documentOrder";

function createElements(...ids: string[]) {
  const parent = document.createElement("div");
  return ids.map((id) => {
    const element = document.createElement("div");
    element.id = id;
    parent.appendChild(element);
    return element;
  });
}

describe("isInDocumentOrder", () => {
  test("isInDocumentOrder", () => {
    const [a, b, c] = createElements("a", "b", "c");

    expect(isInDocumentOrder([])).toBe(true);
    expect(isInDocumentOrder([a])).toBe(true);
    expect(isInDocumentOrder([a, b, c])).toBe(true);
    expect(isInDocumentOrder([a, c])).toBe(true);
    expect(isInDocumentOrder([b, a, c])).toBe(false);
    expect(isInDocumentOrder([a, c, b])).toBe(false);
  });

  test("isInDocumentOrder treats disconnected elements as in order", () => {
    const [a, b] = createElements("a", "b");
    const detached = document.createElement("div");

    expect(isInDocumentOrder([a, detached, b])).toBe(true);
    expect(isInDocumentOrder([b, detached])).toBe(true);
  });
});
