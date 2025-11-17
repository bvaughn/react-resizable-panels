import type { RegisteredGroup } from "../../components/group/types";

export function calculateAvailableGroupSize({
  group
}: {
  group: RegisteredGroup;
}) {
  const { direction, panels } = group;

  return panels.reduce((totalSize, panel) => {
    totalSize +=
      direction === "horizontal"
        ? panel.element.offsetWidth
        : panel.element.offsetHeight;
    return totalSize;
  }, 0);
}
