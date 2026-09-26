import { getMountedAxes } from "../mutable-state/axes";

export function findSeparatorAxis(separatorElement: HTMLElement) {
  const mountedAxes = getMountedAxes();

  for (const [axis] of mountedAxes) {
    if (
      axis.separators.some(
        (separator) => separator.element === separatorElement
      )
    ) {
      return axis;
    }
  }

  throw Error("Could not find parent Group for separator element");
}
