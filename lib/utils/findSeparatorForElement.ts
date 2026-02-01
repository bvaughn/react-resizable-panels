import { groups } from "../state/Root";

export function findSeparatorForElement(separatorElement: HTMLElement) {
  for (const group of groups) {
    for (const separator of group.separators) {
      if (separator.id === separatorElement.id) {
        return separator;
      }
    }
  }

  throw new Error("Could not find parent Group for separator element");
}
