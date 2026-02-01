import type { Properties } from "csstype";

const documentToStyleMap = new WeakMap<
  Document,
  {
    prevStyle: string | undefined;
    styleSheet: CSSStyleSheet;
  }
>();

export function updateCursorStyle({
  cursorStyle,
  ownerDocument,
  state
}: {
  cursorStyle: Properties["cursor"];
  ownerDocument: Document;
  state: "active" | "hover" | "inactive";
}) {
  // NOTE undefined is not technically a valid value but it has been reported that it is present in some environments (Vite HMR?)
  // See github.com/bvaughn/react-resizable-panels/issues/559
  if (ownerDocument.defaultView == null) {
    return;
  }

  let { prevStyle, styleSheet } = documentToStyleMap.get(ownerDocument) ?? {};

  if (styleSheet === undefined) {
    styleSheet = new ownerDocument.defaultView.CSSStyleSheet();

    ownerDocument.adoptedStyleSheets.push(styleSheet);
  }

  if (cursorStyle === "") {
    prevStyle = undefined;

    if (styleSheet.cssRules.length === 1) {
      styleSheet.deleteRule(0);
    }
  } else {
    const nextStyle = `*, *:hover {cursor: ${cursorStyle} !important; ${state === "active" ? "touch-action: none;" : ""} }`;
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
  }

  documentToStyleMap.set(ownerDocument, {
    prevStyle,
    styleSheet
  });
}
