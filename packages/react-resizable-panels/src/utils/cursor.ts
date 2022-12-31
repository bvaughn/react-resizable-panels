type CursorState =
  | "horizontal"
  | "horizontal-max"
  | "horizontal-min"
  | "vertical"
  | "vertical-max"
  | "vertical-min";

let element: HTMLStyleElement | null = null;

export function getCursorStyle(state: CursorState): string {
  switch (state) {
    case "horizontal":
      return "col-resize";
    case "horizontal-max":
      return "w-resize";
    case "horizontal-min":
      return "e-resize";
    case "vertical":
      return "row-resize";
    case "vertical-max":
      return "n-resize";
    case "vertical-min":
      return "s-resize";
  }
}

export function resetGlobalCursorStyle() {
  if (element !== null) {
    document.head.removeChild(element);

    element = null;
  }
}

export function setGlobalCursorStyle(state: CursorState) {
  const style = getCursorStyle(state);

  if (element === null) {
    element = document.createElement("style");

    document.head.appendChild(element);
  }

  element.innerHTML = `*{cursor: ${style}!important;}`;
}
