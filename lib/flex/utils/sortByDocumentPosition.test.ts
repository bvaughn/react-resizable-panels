import { describe, expect, test } from "vitest";
import { createSiblingElements } from "../../global/test/createSiblingElements";
import { sortByDocumentPosition } from "./sortByDocumentPosition";

describe("sortByDocumentPosition", () => {
  test("sortByDocumentPosition", () => {
    const [a, b, c] = createSiblingElements("a", "b", "c");

    expect(sortByDocumentPosition([c, a, b])).toEqual([a, b, c]);
    expect(sortByDocumentPosition([])).toEqual([]);
  });
});
