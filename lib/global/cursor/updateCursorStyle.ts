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
    // Constructable stylesheets aren't supported in all environments
    // (e.g. Safari < 16.4, jsdom). Calling `new CSSStyleSheet()` there
    // throws "TypeError: Illegal constructor", so only construct one when
    // adoptedStyleSheets is available.
    if (ownerDocument.adoptedStyleSheets) {
      styleSheet = new ownerDocument.defaultView.CSSStyleSheet();

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

  if (styleSheet === undefined) {
    // The environment doesn't support constructed stylesheets, so cursor
    // overrides can't be applied. This is a no-op, not an error.
    return;
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
