import type { RegisteredResizeAxis } from "../types";

// Disabled separators remain registered (see mountAxis) so callers must filter them out
export function getEnabledSeparators(axis: RegisteredResizeAxis) {
  return axis.separators.filter((separator) => !separator.disabled);
}
