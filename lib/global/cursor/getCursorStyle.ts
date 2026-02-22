import type { Properties } from "csstype";
import type { RegisteredGroup } from "../../components/group/types";
import {
  CURSOR_FLAG_HORIZONTAL_MAX,
  CURSOR_FLAG_HORIZONTAL_MIN,
  CURSOR_FLAG_VERTICAL_MAX,
  CURSOR_FLAG_VERTICAL_MIN
} from "../../constants";
import type { InteractionState } from "../mutable-state/types";
import { supportsAdvancedCursorStyles } from "./supportsAdvancedCursorStyles";

export function getCursorStyle({
  cursorFlags,
  groups,
  state
}: {
  cursorFlags: number;
  groups: RegisteredGroup[];
  state: InteractionState["state"];
}): Properties["cursor"] {
  let horizontalCount = 0;
  let verticalCount = 0;

  switch (state) {
    case "active":
    case "hover": {
      groups.forEach((group) => {
        if (group.mutableState.disableCursor) {
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
          const horizontalMin =
            (cursorFlags & CURSOR_FLAG_HORIZONTAL_MIN) !== 0;
          const horizontalMax =
            (cursorFlags & CURSOR_FLAG_HORIZONTAL_MAX) !== 0;
          const verticalMin = (cursorFlags & CURSOR_FLAG_VERTICAL_MIN) !== 0;
          const verticalMax = (cursorFlags & CURSOR_FLAG_VERTICAL_MAX) !== 0;

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
