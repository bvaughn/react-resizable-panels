/**
 * The value nearest to the target (the first one, if several are equally near), or undefined if there are no values.
 */
export function findNearestValue(
  values: readonly number[],
  target: number
): number | undefined {
  let nearest: number | undefined = undefined;
  for (const value of values) {
    if (
      nearest === undefined ||
      Math.abs(value - target) < Math.abs(nearest - target)
    ) {
      nearest = value;
    }
  }

  return nearest;
}
