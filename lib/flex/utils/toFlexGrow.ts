// Panel sizes add up to 100%, but their fractions can add up to slightly less than 1
// (e.g. 0.90596 + 0.09404 is 0.9999999999999999 in floating point, and sizes are rounded to 3 decimal places).
// That would leave a sliver of empty space, which can change the sizes of elements that are measured to calculate the layout
// (e.g. the header of a collapsed Workspace tabset), and so on, indefinitely.
// Scaling every value by slightly more than 1 ensures that the panels of a group always fill it.
const HEADROOM = 1.001;

/**
 * Converts a panel size (a percentage of its group) to a flex-grow value (about a fraction of its group).
 *
 * Fractions are used (rather than percentages) because flex items whose flex-grow values add up to less than 1
 * only fill that fraction of their container.
 * When a panel is removed, the remaining panels keep their sizes (leaving its space empty) until the layout is updated,
 * so a CSS transition on flex-grow can animate them filling its space (just as it animates a panel being added).
 *
 * Values are rounded to 5 decimal places to avoid floating point noise (e.g. 0.33332999999999996).
 */
export function toFlexGrow(size: number) {
  return parseFloat(((size / 100) * HEADROOM).toFixed(5));
}
