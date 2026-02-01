import { CursorFlags } from "../../constants";

export function cursorFlagsToString(cursorFlags: number) {
  const pieces: string[] = [];

  if (cursorFlags > 0) {
    if (cursorFlags & CursorFlags.horizontal) {
      if ((cursorFlags & CursorFlags.horizontalMin) === 0) {
        pieces.push("horizontal-max");
      } else if ((cursorFlags & CursorFlags.horizontalMax) === 0) {
        pieces.push("horizontal-min");
      } else {
        pieces.push("horizontal");
      }
    }

    if (cursorFlags & CursorFlags.vertical) {
      if ((cursorFlags & CursorFlags.verticalMin) === 0) {
        pieces.push("vertical-max");
      } else if ((cursorFlags & CursorFlags.verticalMax) === 0) {
        pieces.push("vertical-min");
      } else {
        pieces.push("vertical");
      }
    }
  }

  return pieces.join(" + ");
}
