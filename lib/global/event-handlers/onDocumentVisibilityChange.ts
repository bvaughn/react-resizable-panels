import { getMountedGroups } from "../mutable-state/groups";
import { resizeObserverCallback } from "./resizeObserverCallback";

export function onDocumentVisibilityChange(event: Event) {
  const ownerDocument = event.currentTarget as Document;

  switch (document.visibilityState) {
    case "visible": {
      const mountedGroups = getMountedGroups();

      for (const [group, state] of mountedGroups) {
        if (group.element.ownerDocument === ownerDocument) {
          for (const target of state.pendingResizeEventsForElements) {
            resizeObserverCallback({
              group,
              target
            });
          }
        }
      }
    }
  }
}
