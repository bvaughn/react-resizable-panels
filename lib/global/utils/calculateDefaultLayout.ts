import type { Layout } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { formatLayoutNumber } from "./formatLayout";

export function calculateDefaultLayout(
  derivedPanelConstraints: PanelConstraints[]
): Layout {
  let explicitCount = 0;
  let total = 0;

  const layout: Layout = {};

  for (const current of derivedPanelConstraints) {
    if (current.defaultSize !== undefined) {
      explicitCount++;

      const size = formatLayoutNumber(current.defaultSize);

      total += size;
      layout[current.panelId] = size;
    } else {
      // @ts-expect-error Add panel keys in order to simplify traversal elsewhere; we'll fill them in in the loop below
      layout[current.panelId] = undefined;
    }
  }

  const remainingPanelCount = derivedPanelConstraints.length - explicitCount;
  if (remainingPanelCount !== 0) {
    const size = formatLayoutNumber((100 - total) / remainingPanelCount);

    for (const current of derivedPanelConstraints) {
      if (current.defaultSize === undefined) {
        layout[current.panelId] = size;
      }
    }
  }

  return layout;
}
