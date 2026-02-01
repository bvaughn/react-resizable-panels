import type { Properties } from "csstype";
import { CursorFlags } from "../../constants";
import type { MutableGroup } from "../../state/MutableGroup";
import { supportsAdvancedCursorStyles } from "./supportsAdvancedCursorStyles";

export function getCursorStyle({
  cursorFlags,
  groups,
  state
}: {
  cursorFlags: number;
  groups: MutableGroup[];
  state: "active" | "hover" | "inactive";
}): Properties["cursor"] {
  let horizontalCount = 0;
  let verticalCount = 0;

  switch (state) {
    case "active":
    case "hover": {
      groups.forEach((group) => {
        if (group.disableCursor) {
          return;
        }

        switch (group.orientation) {
          case "horizontal": {
            horizontalCount++;
            break;
          }
          case "vertical": {
            verticalCount++;
            break;
          }
        }
      });
    }
  }

  if (horizontalCount === 0 && verticalCount === 0) {
    return undefined;
  }

  switch (state) {
    case "active": {
      if (cursorFlags) {
        if (supportsAdvancedCursorStyles()) {
          const horizontalMin = (cursorFlags & CursorFlags.horizontalMin) !== 0;
          const horizontalMax = (cursorFlags & CursorFlags.horizontalMax) !== 0;
          const verticalMin = (cursorFlags & CursorFlags.verticalMin) !== 0;
          const verticalMax = (cursorFlags & CursorFlags.verticalMax) !== 0;

          if (horizontalMin) {
            if (verticalMin) {
              return "se-resize";
            } else if (verticalMax) {
              return "ne-resize";
            } else {
              return "e-resize";
            }
          } else if (horizontalMax) {
            if (verticalMin) {
              return "sw-resize";
            } else if (verticalMax) {
              return "nw-resize";
            } else {
              return "w-resize";
            }
          } else if (verticalMin) {
            return "s-resize";
          } else if (verticalMax) {
            return "n-resize";
          }
        }
      }
      break;
    }
  }

  if (supportsAdvancedCursorStyles()) {
    if (horizontalCount > 0 && verticalCount > 0) {
      return "move";
    } else if (horizontalCount > 0) {
      return "ew-resize";
    } else {
      return "ns-resize";
    }
  } else {
    if (horizontalCount > 0 && verticalCount > 0) {
      return "grab";
    } else if (horizontalCount > 0) {
      return "col-resize";
    } else {
      return "row-resize";
    }
  }
}
