import { assert } from "../../utils/assert";
import type { Layout, ResizeItemConstraints } from "../types";
import { layoutNumbersEqual } from "./layoutNumbersEqual";
import { validateItemSize } from "./validateItemSize";

// All units must be in percentages; pixel values should be pre-converted
export function validateAxisLayout({
  layout,
  itemConstraints
}: {
  layout: Layout;
  itemConstraints: ResizeItemConstraints[];
}): Layout {
  const prevLayout = itemConstraints.map(({ itemId }) => layout[itemId]);
  const nextLayout = [...prevLayout];

  const nextLayoutTotalSize = nextLayout.reduce(
    (accumulated, current) => accumulated + current,
    0
  );

  // Validate layout expectations
  if (Object.keys(layout).length !== itemConstraints.length) {
    throw Error(
      `Invalid ${itemConstraints.length} panel layout: ${Object.values(layout)
        .map((size) => `${size}%`)
        .join(", ")}`
    );
  } else if (
    !layoutNumbersEqual(nextLayoutTotalSize, 100) &&
    nextLayout.length > 0
  ) {
    for (let index = 0; index < itemConstraints.length; index++) {
      const unsafeSize = nextLayout[index];
      assert(unsafeSize != null, `No layout data found for index ${index}`);
      const safeSize = (100 / nextLayoutTotalSize) * unsafeSize;
      nextLayout[index] = safeSize;
    }
  }

  let remainingSize = 0;

  // First pass: Validate the proposed layout given each panel's constraints
  for (let index = 0; index < itemConstraints.length; index++) {
    const prevSize = prevLayout[index];
    assert(prevSize != null, `No layout data found for index ${index}`);

    const unsafeSize = nextLayout[index];
    assert(unsafeSize != null, `No layout data found for index ${index}`);

    const safeSize = validateItemSize({
      overrideDisabledItems: true,
      itemConstraints: itemConstraints[index],
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
    for (let index = 0; index < itemConstraints.length; index++) {
      const prevSize = nextLayout[index];
      assert(prevSize != null, `No layout data found for index ${index}`);
      const unsafeSize = prevSize + remainingSize;
      const safeSize = validateItemSize({
        overrideDisabledItems: true,
        itemConstraints: itemConstraints[index],
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

  return nextLayout.reduce<Layout>((accumulated, current, index) => {
    accumulated[itemConstraints[index].itemId] = current;
    return accumulated;
  }, {});
}
