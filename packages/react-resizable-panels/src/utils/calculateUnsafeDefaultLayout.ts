import { PanelData } from "../Panel";
import { computePercentagePanelConstraints } from "./computePercentagePanelConstraints";

export function calculateUnsafeDefaultLayout({
  groupSizePixels,
  panelDataArray,
}: {
  groupSizePixels: number;
  panelDataArray: PanelData[];
}): number[] {
  const layout = Array<number>(panelDataArray.length);

  const panelDataConstraints = panelDataArray.map(
    (panelData) => panelData.constraints
  );

  let numPanelsWithSizes = 0;
  let remainingSize = 100;

  // Distribute default sizes first
  for (let index = 0; index < panelDataArray.length; index++) {
    const { defaultSizePercentage } = computePercentagePanelConstraints(
      panelDataConstraints,
      index,
      groupSizePixels
    );

    if (defaultSizePercentage != null) {
      numPanelsWithSizes++;
      layout[index] = defaultSizePercentage;
      remainingSize -= defaultSizePercentage;
    }
  }

  // Remaining size should be distributed evenly between panels without default sizes
  for (let index = 0; index < panelDataArray.length; index++) {
    const { defaultSizePercentage } = computePercentagePanelConstraints(
      panelDataConstraints,
      index,
      groupSizePixels
    );
    if (defaultSizePercentage != null) {
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
