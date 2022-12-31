type CursorState =
  | "horizontal"
  | "horizontal-max"
  | "horizontal-min"
  | "vertical"
  | "vertical-max"
  | "vertical-min";

const WINDOW_EDGE_THRESHOLD = 25;

let currentState: CursorState | null = null;
let element: HTMLStyleElement | null = null;
let previousState: CursorState | null = null;

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

function onDocumentMove(event: MouseEvent) {
  if (previousState !== null) {
    const { clientX, clientY } = event;
    const { clientHeight, clientWidth } = document.body;

    switch (previousState) {
      case "horizontal":
      case "horizontal-max":
      case "horizontal-min": {
        if (
          clientX >= WINDOW_EDGE_THRESHOLD &&
          clientX <= clientWidth - WINDOW_EDGE_THRESHOLD
        ) {
          setGlobalCursorStyle(previousState);

          previousState = null;
        }
        break;
      }

      case "vertical":
      case "vertical-max":
      case "vertical-min": {
        if (
          clientY >= WINDOW_EDGE_THRESHOLD &&
          clientY <= clientHeight - WINDOW_EDGE_THRESHOLD
        ) {
          setGlobalCursorStyle(previousState);

          previousState = null;
        }
        break;
      }
    }
  }
}

function onDocumentLeave() {
  if (currentState !== null) {
    previousState = currentState;

    resetGlobalCursorStyle();
  }
}

export function resetGlobalCursorStyle() {
  if (element !== null) {
    document.head.removeChild(element);

    currentState = null;
    element = null;
  }

  document.body.removeEventListener("mouseleave", onDocumentLeave);
  document.body.removeEventListener("mousemove", onDocumentMove);
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

    document.body.addEventListener("mouseleave", onDocumentLeave);
    document.body.addEventListener("mousemove", onDocumentMove);
  }

  element.innerHTML = `* { cursor: ${style} !important; }`;
}
