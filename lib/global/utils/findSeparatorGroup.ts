import { assert } from "../../utils/assert";
import { read } from "../mutableState";

export function findSeparatorGroup(separatorElement: HTMLElement) {
  const groupElement = separatorElement.parentElement;
  assert(groupElement, "Parent group element not found");

  const { mountedGroups } = read();

  for (const [group] of mountedGroups) {
    if (group.element === groupElement) {
      return group;
    }
  }

  throw Error("Could not find parent Group for separator element");
}
