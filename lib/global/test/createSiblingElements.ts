/**
 * Creates sibling elements (with the specified ids) under a common, detached parent.
 */
export function createSiblingElements(...ids: string[]): HTMLElement[] {
  const parent = document.createElement("div");
  return ids.map((id) => {
    const element = document.createElement("div");
    element.id = id;
    parent.appendChild(element);
    return element;
  });
}
