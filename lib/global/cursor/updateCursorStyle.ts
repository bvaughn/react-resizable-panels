import { read } from "../mutableState";
import { getCursorStyle } from "./getCursorStyle";

let prevStyle: string | undefined = undefined;
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
      const cursorStyle = getCursorStyle({
        cursorFlags,
        groups: interactionState.hitRegions.map((current) => current.group),
        state: interactionState.state
      });

      const nextStyle = `*{cursor: ${cursorStyle} !important; ${interactionState.state === "active" ? "touch-action: none;" : ""} }`;
      if (prevStyle === nextStyle) {
        return;
      }

      prevStyle = nextStyle;

      if (cursorStyle) {
        if (styleSheet.cssRules.length === 0) {
          styleSheet.insertRule(nextStyle);
        } else {
          styleSheet.replaceSync(nextStyle);
        }
      } else if (styleSheet.cssRules.length === 1) {
        styleSheet.deleteRule(0);
      }
      break;
    }
    case "inactive": {
      prevStyle = undefined;

      if (styleSheet.cssRules.length === 1) {
        styleSheet.deleteRule(0);
      }
      break;
    }
  }
}
