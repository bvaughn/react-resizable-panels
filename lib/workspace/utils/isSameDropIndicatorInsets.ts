import type { DropIndicatorInsets } from "./measureDropIndicatorInsets";

export function isSameDropIndicatorInsets(
  a: DropIndicatorInsets | undefined,
  b: DropIndicatorInsets | undefined
) {
  if (a === undefined || b === undefined) {
    return a === b;
  }

  return (
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.right === b.right &&
    a.top === b.top
  );
}
