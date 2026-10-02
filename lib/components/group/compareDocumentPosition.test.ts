import { describe, expect, test } from "vitest";
import { createSiblingElements } from "../../global/test/createSiblingElements";
import { compareDocumentPosition } from "./compareDocumentPosition";

describe("compareDocumentPosition", () => {
  test("compareDocumentPosition", () => {
    const [first, second] = createSiblingElements("first", "second");

    expect(compareDocumentPosition(first, second)).toBe(-1);
    expect(compareDocumentPosition(second, first)).toBe(1);
    expect(compareDocumentPosition(first, first)).toBe(0);
  });

  test("compareDocumentPosition treats disconnected elements as equal", () => {
    const [a] = createSiblingElements("a");
    const detached = document.createElement("div");

    expect(compareDocumentPosition(a, detached)).toBe(0);
    expect(compareDocumentPosition(detached, a)).toBe(0);
  });
});
