import { PanelData } from "../Panel";
import { assert } from "./assert";

export function calculateUnsafeDefaultLayout({
  panelDataArray,
}: {
  panelDataArray: PanelData[];
}): number[] {
  const layout = Array<number>(panelDataArray.length);

  const panelConstraintsArray = panelDataArray.map(
    (panelData) => panelData.constraints
  );

  let numPanelsWithSizes = 0;
  let remainingSize = 100;

  // Distribute default sizes first
  for (let index = 0; index < panelDataArray.length; index++) {
    const panelConstraints = panelConstraintsArray[index];
    assert(panelConstraints);
    const { defaultSize } = panelConstraints;

    if (defaultSize != null) {
      numPanelsWithSizes++;
      layout[index] = defaultSize;
      remainingSize -= defaultSize;
    }
  }

  // Remaining size should be distributed evenly between panels without default sizes
  for (let index = 0; index < panelDataArray.length; index++) {
    const panelConstraints = panelConstraintsArray[index];
    assert(panelConstraints);
    const { defaultSize } = panelConstraints;

    if (defaultSize != null) {
      continue;
    }

    const numRemainingPanels = panelDataArray.length - numPanelsWithSizes;
    const size = remainingSize / numRemainingPanels;

    numPanelsWithSizes++;
    layout[index] = size;
    remainingSize -= size;
  }

  return layout;
}
