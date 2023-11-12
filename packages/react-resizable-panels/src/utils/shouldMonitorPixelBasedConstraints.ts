import { PanelConstraints } from "../Panel";

export function shouldMonitorPixelBasedConstraints(
  constraints: PanelConstraints[]
): boolean {
  return constraints.some((constraints) => {
    return (
      constraints.collapsedSizePixels !== undefined ||
      constraints.maxSizePixels !== undefined ||
      constraints.minSizePixels !== undefined
    );
  });
}
