import { read } from "../mutableState";
import { getCursorStyle } from "./getCursorStyle";

const documentToStyleMap = new WeakMap<
  Document,
  {
    prevStyle: string | undefined;
    styleSheet: CSSStyleSheet;
  }
>();

export function updateCursorStyle(ownerDocument: Document) {
  // NOTE undefined is not technically a valid value but it has been reported that it is present in some environments (Vite HMR?)
  // See github.com/bvaughn/react-resizable-panels/issues/559
  if (
    ownerDocument.defaultView === null ||
    ownerDocument.defaultView === undefined
  ) {
    return;
  }

  let { prevStyle, styleSheet } = documentToStyleMap.get(ownerDocument) ?? {};

  if (styleSheet === undefined) {
    styleSheet = new ownerDocument.defaultView.CSSStyleSheet();

    // adoptedStyleSheets is undefined in jsdom
    if (ownerDocument.adoptedStyleSheets) {
      ownerDocument.adoptedStyleSheets.push(styleSheet);
    }
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

      const nextStyle = `*, *:hover {cursor: ${cursorStyle} !important; }`;
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

  documentToStyleMap.set(ownerDocument, {
    prevStyle,
    styleSheet
  });
}
