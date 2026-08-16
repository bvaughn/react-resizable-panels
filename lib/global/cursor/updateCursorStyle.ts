import { getInteractionState } from "../mutable-state/interactions";
import { getCursorStyle } from "./getCursorStyle";

const documentToStyleMap = new WeakMap<
  Document,
  {
    prevStyle: string | undefined;
    styleSheet: CSSStyleSheet;
  }
>();

export function updateCursorStyle(ownerDocument: Document) {
  if (!ownerDocument.defaultView || !ownerDocument.adoptedStyleSheets) {
    // Gracefully degrade for environments that don't support these DOM APIs (e.g. Safari < 16.4, jsdom)
    // See issues#559, issues#621, issues#554, pull#730
    return;
  }

  let { prevStyle, styleSheet } = documentToStyleMap.get(ownerDocument) ?? {};

  if (styleSheet === undefined) {
    styleSheet = new ownerDocument.defaultView.CSSStyleSheet();

    // adoptedStyleSheets is undefined in jsdom
    if (ownerDocument.adoptedStyleSheets) {
      if (Object.isExtensible(ownerDocument.adoptedStyleSheets)) {
        ownerDocument.adoptedStyleSheets.push(styleSheet);
      } else {
        ownerDocument.adoptedStyleSheets = [
          ...ownerDocument.adoptedStyleSheets,
          styleSheet
        ];
      }
    }
  }

  const interactionState = getInteractionState();

  switch (interactionState.state) {
    case "active":
    case "hover": {
      const cursorStyle = getCursorStyle({
        cursorFlags: interactionState.cursorFlags,
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
