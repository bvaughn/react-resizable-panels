import type { GroupResizeBehavior } from "../../flex/types";
import type { RegisteredResizeAxis } from "../types";

/**
 * Returns each item's group resize behavior, in item order, with the default ("preserve-relative-size") filled in.
 * Explicitly specifying the default behavior is equivalent to omitting it.
 */
export function getItemResizeBehaviors(
  axis: RegisteredResizeAxis
): GroupResizeBehavior[] {
  return axis.items.map(
    ({ constraintProps }) =>
      constraintProps.groupResizeBehavior ?? "preserve-relative-size"
  );
}
