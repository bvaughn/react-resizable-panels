import { read } from "../mutableState";

export function findSeparatorGroup(separatorElement: HTMLElement) {
  const { mountedGroups } = read();

  for (const [group] of mountedGroups) {
    if (
      group.separators.some(
        (separator) => separator.element === separatorElement
      )
    ) {
      return group;
    }
  }

  throw Error("Could not find parent Group for separator element");
}
