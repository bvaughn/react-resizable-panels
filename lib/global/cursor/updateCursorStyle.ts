import type { Properties } from "csstype";
import { read } from "../mutableState";
import { getCursorStyle } from "./getCursorStyle";

let prevCursor: Properties["cursor"] | null = null;
let styleSheet: CSSStyleSheet | undefined = undefined;

export function updateCursorStyle() {
  if (styleSheet === undefined) {
    styleSheet = new CSSStyleSheet();

    document.adoptedStyleSheets = [styleSheet];
  }

  const { cursorFlags, interactionState } = read();

  switch (interactionState.state) {
    case "active":
    case "hover": {
      const style = getCursorStyle({
        cursorFlags,
        groups: interactionState.hitRegions.map((current) => current.group),
        state: interactionState.state
      });

      if (prevCursor === style) {
        return;
      }

      prevCursor = style;

      if (style) {
        if (styleSheet.cssRules.length === 0) {
          styleSheet.insertRule(`*{cursor: ${style} !important;}`);
        } else {
          styleSheet.replaceSync(`*{cursor: ${style} !important;}`);
        }
      } else if (styleSheet.cssRules.length === 1) {
        styleSheet.deleteRule(0);
      }
      break;
    }
    case "inactive": {
      prevCursor = null;

      if (styleSheet.cssRules.length === 1) {
        styleSheet.deleteRule(0);
      }
      break;
    }
  }
}
