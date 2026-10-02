import { expect, test } from "vitest";
import { sortByDocumentPosition } from "./sortByDocumentPosition";

function createElements(...ids: string[]) {
  const parent = document.createElement("div");
  return ids.map((id) => {
    const element = document.createElement("div");
    element.id = id;
    parent.appendChild(element);
    return element;
  });
}

test("sortByDocumentPosition", () => {
  const [a, b, c] = createElements("a", "b", "c");

  expect(sortByDocumentPosition([c, a, b])).toEqual([a, b, c]);
  expect(sortByDocumentPosition([])).toEqual([]);
});
