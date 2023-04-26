type CursorState =
  | "horizontal"
  | "horizontal-max"
  | "horizontal-min"
  | "vertical"
  | "vertical-max"
  | "vertical-min";

let currentState: CursorState | null = null;
let element: HTMLStyleElement | null = null;

export function getCursorStyle(state: CursorState): string {
  switch (state) {
    case "horizontal":
      return "ew-resize";
    case "horizontal-max":
      return "w-resize";
    case "horizontal-min":
      return "e-resize";
    case "vertical":
      return "ns-resize";
    case "vertical-max":
      return "n-resize";
    case "vertical-min":
      return "s-resize";
  }
}

export function resetGlobalCursorStyle() {
  if (element !== null) {
    document.head.removeChild(element);

    currentState = null;
    element = null;
  }
}

export function setGlobalCursorStyle(state: CursorState) {
  if (currentState === state) {
    return;
  }

  currentState = state;

  const style = getCursorStyle(state);

  if (element === null) {
    element = document.createElement("style");

    document.head.appendChild(element);
  }

  element.innerHTML = `*{cursor: ${style}!important;}`;
}
