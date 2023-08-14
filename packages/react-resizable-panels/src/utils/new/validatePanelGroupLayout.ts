import { fuzzyCompareNumbers } from "./fuzzyCompareNumbers";
import { resizePanel } from "./resizePanel";
import { PanelConstraints } from "./types";

// All units must be in percentages; pixel values should be pre-converted
export function validatePanelGroupLayout({
  groupSizePixels,
  layout,
  panelConstraints,
}: {
  groupSizePixels: number;
  layout: number[];
  panelConstraints: PanelConstraints[];
}): number[] {
  // Validate layout expectations
  if (layout.length !== panelConstraints.length) {
    throw Error(
      `Invalid ${panelConstraints.length} panel layout: ${layout
        .map((size) => `${size}%`)
        .join(", ")}`
    );
  } else if (
    !fuzzyCompareNumbers(
      layout.reduce((accumulated, current) => accumulated + current, 0),
      100
    )
  ) {
    throw Error(
      `Invalid layout total size: ${layout
        .map((size) => `${size}%`)
        .join(", ")}`
    );
  }

  let remainingSize = 0;

  // First pass: Validate the proposed layout given each panel's constraints
  for (let index = 0; index < panelConstraints.length; index++) {
    const unsafeSize = layout[index]!;

    const safeSize = resizePanel({
      groupSizePixels,
      panelConstraints,
      panelIndex: index,
      size: unsafeSize,
    });

    if (unsafeSize != safeSize) {
      remainingSize += unsafeSize - safeSize;

      layout[index] = safeSize;
    }
  }

  // If there is additional, left over space, assign it to any panel(s) that permits it
  // (It's not worth taking multiple additional passes to evenly distribute)
  if (!fuzzyCompareNumbers(remainingSize, 0)) {
    for (let index = 0; index < panelConstraints.length; index++) {
      const prevSize = layout[index]!;
      const unsafeSize = prevSize + remainingSize;
      const safeSize = resizePanel({
        groupSizePixels,
        panelConstraints,
        panelIndex: index,
        size: unsafeSize,
      });

      if (prevSize !== safeSize) {
        remainingSize -= safeSize - prevSize;
        layout[index] = safeSize;

        // Once we've used up the remainder, bail
        if (fuzzyCompareNumbers(remainingSize, 0)) {
          break;
        }
      }
    }
  }

  return layout;
}
