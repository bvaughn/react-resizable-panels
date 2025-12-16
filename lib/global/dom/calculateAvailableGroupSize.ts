import type { RegisteredGroup } from "../../components/group/types";

export function calculateAvailableGroupSize({
  group
}: {
  group: RegisteredGroup;
}) {
  const { orientation, panels } = group;

  return panels.reduce((totalSize, panel) => {
    totalSize +=
      orientation === "horizontal"
        ? panel.element.offsetWidth
        : panel.element.offsetHeight;
    return totalSize;
  }, 0);
}
