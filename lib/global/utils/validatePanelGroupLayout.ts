import type { Layout } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { assert } from "../../utils/assert";
import { layoutNumbersEqual } from "./layoutNumbersEqual";
import { validatePanelSize } from "./validatePanelSize";

// All units must be in percentages; pixel values should be pre-converted
export function validatePanelGroupLayout({
  layout,
  panelConstraints
}: {
  layout: Layout;
  panelConstraints: PanelConstraints[];
}): Layout {
  const prevLayout = Object.values(layout);
  const nextLayout = [...prevLayout];

  const nextLayoutTotalSize = nextLayout.reduce(
    (accumulated, current) => accumulated + current,
    0
  );

  // Validate layout expectations
  if (nextLayout.length !== panelConstraints.length) {
    throw Error(
      `Invalid ${panelConstraints.length} panel layout: ${nextLayout
        .map((size) => `${size}%`)
        .join(", ")}`
    );
  } else if (
    !layoutNumbersEqual(nextLayoutTotalSize, 100) &&
    nextLayout.length > 0
  ) {
    for (let index = 0; index < panelConstraints.length; index++) {
      const unsafeSize = nextLayout[index];
      assert(unsafeSize != null, `No layout data found for index ${index}`);
      const safeSize = (100 / nextLayoutTotalSize) * unsafeSize;
      nextLayout[index] = safeSize;
    }
  }

  let remainingSize = 0;

  // First pass: Validate the proposed layout given each panel's constraints
  for (let index = 0; index < panelConstraints.length; index++) {
    const prevSize = prevLayout[index];
    assert(prevSize != null, `No layout data found for index ${index}`);

    const unsafeSize = nextLayout[index];
    assert(unsafeSize != null, `No layout data found for index ${index}`);

    const safeSize = validatePanelSize({
      panelConstraints: panelConstraints[index],
      prevSize,
      size: unsafeSize
    });

    if (unsafeSize != safeSize) {
      remainingSize += unsafeSize - safeSize;

      nextLayout[index] = safeSize;
    }
  }

  // If there is additional, left over space, assign it to any panel(s) that permits it
  // (It's not worth taking multiple additional passes to evenly distribute)
  if (!layoutNumbersEqual(remainingSize, 0)) {
    for (let index = 0; index < panelConstraints.length; index++) {
      const prevSize = nextLayout[index];
      assert(prevSize != null, `No layout data found for index ${index}`);
      const unsafeSize = prevSize + remainingSize;
      const safeSize = validatePanelSize({
        panelConstraints: panelConstraints[index],
        prevSize,
        size: unsafeSize
      });

      if (prevSize !== safeSize) {
        remainingSize -= safeSize - prevSize;
        nextLayout[index] = safeSize;

        // Once we've used up the remainder, bail
        if (layoutNumbersEqual(remainingSize, 0)) {
          break;
        }
      }
    }
  }

  const prevLayoutKeys = Object.keys(layout);

  return nextLayout.reduce<Layout>((accumulated, current, index) => {
    accumulated[prevLayoutKeys[index]] = current;
    return accumulated;
  }, {});
}
