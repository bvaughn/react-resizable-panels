/**
 * Applies changes to a map of tabsets shown collapsed (or expanded) unlike the model (see isTabsetCollapsed);
 * `undefined` removes a tabset's override. Returns the previous map if nothing changed.
 */
export function updateCollapseOverrides(
  prev: { [tabsetId: string]: boolean },
  changes: { [tabsetId: string]: boolean | undefined }
): { [tabsetId: string]: boolean } {
  let next = prev;
  for (const [tabsetId, isCollapsed] of Object.entries(changes)) {
    if (prev[tabsetId] !== isCollapsed) {
      if (next === prev) {
        next = { ...prev };
      }

      if (isCollapsed === undefined) {
        delete next[tabsetId];
      } else {
        next[tabsetId] = isCollapsed;
      }
    }
  }

  return next;
}
