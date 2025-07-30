import {
  EXCEEDED_HORIZONTAL_MAX,
  EXCEEDED_HORIZONTAL_MIN,
  EXCEEDED_VERTICAL_MAX,
  EXCEEDED_VERTICAL_MIN,
} from "../PanelResizeHandleRegistry";
import { getNonce } from "./csp";

type CursorState = "horizontal" | "intersection" | "vertical";

export type CustomCursorStyleConfig = {
  exceedsHorizontalMaximum: boolean;
  exceedsHorizontalMinimum: boolean;
  exceedsVerticalMaximum: boolean;
  exceedsVerticalMinimum: boolean;
  intersectsHorizontalDragHandle: boolean;
  intersectsVerticalDragHandle: boolean;
  isPointerDown: boolean;
};

type GetCustomCursorStyleFunction = (config: CustomCursorStyleConfig) => string;

let currentCursorStyle: string | null = null;
let enabled: boolean = true;
let getCustomCursorStyleFunction: GetCustomCursorStyleFunction | null = null;
let prevRuleIndex = -1;
let styleElement: HTMLStyleElement | null = null;

export function customizeGlobalCursorStyles(
  callback: GetCustomCursorStyleFunction | null
) {
  getCustomCursorStyleFunction = callback;
}

export function disableGlobalCursorStyles() {
  enabled = false;
}

export function enableGlobalCursorStyles() {
  enabled = true;
}

export function getCursorStyle(
  state: CursorState,
  constraintFlags: number,
  isPointerDown: boolean
): string {
  const horizontalMin = (constraintFlags & EXCEEDED_HORIZONTAL_MIN) !== 0;
  const horizontalMax = (constraintFlags & EXCEEDED_HORIZONTAL_MAX) !== 0;
  const verticalMin = (constraintFlags & EXCEEDED_VERTICAL_MIN) !== 0;
  const verticalMax = (constraintFlags & EXCEEDED_VERTICAL_MAX) !== 0;

  if (getCustomCursorStyleFunction) {
    return getCustomCursorStyleFunction({
      exceedsHorizontalMaximum: horizontalMax,
      exceedsHorizontalMinimum: horizontalMin,
      exceedsVerticalMaximum: verticalMax,
      exceedsVerticalMinimum: verticalMin,
      intersectsHorizontalDragHandle:
        state === "horizontal" || state === "intersection",
      intersectsVerticalDragHandle:
        state === "vertical" || state === "intersection",
      isPointerDown,
    });
  }

  if (constraintFlags) {
    if (horizontalMin) {
      if (verticalMin) {
        return "se-resize";
      } else if (verticalMax) {
        return "ne-resize";
      } else {
        return "e-resize";
      }
    } else if (horizontalMax) {
      if (verticalMin) {
        return "sw-resize";
      } else if (verticalMax) {
        return "nw-resize";
      } else {
        return "w-resize";
      }
    } else if (verticalMin) {
      return "s-resize";
    } else if (verticalMax) {
      return "n-resize";
    }
  }

  switch (state) {
    case "horizontal":
      return "ew-resize";
    case "intersection":
      return "move";
    case "vertical":
      return "ns-resize";
  }
}

export function resetGlobalCursorStyle() {
  if (styleElement !== null) {
    document.head.removeChild(styleElement);

    currentCursorStyle = null;
    styleElement = null;
    prevRuleIndex = -1;
  }
}

export function setGlobalCursorStyle(
  state: CursorState,
  constraintFlags: number,
  isPointerDown: boolean
) {
  if (!enabled) {
    return;
  }

  const style = getCursorStyle(state, constraintFlags, isPointerDown);

  if (currentCursorStyle === style) {
    return;
  }

  currentCursorStyle = style;

  if (styleElement === null) {
    styleElement = document.createElement("style");

    const nonce = getNonce();
    if (nonce) {
      styleElement.setAttribute("nonce", nonce);
    }

    document.head.appendChild(styleElement);
  }

  if (prevRuleIndex >= 0) {
    styleElement.sheet?.removeRule(prevRuleIndex);
  }

  prevRuleIndex =
    styleElement.sheet?.insertRule(`*{cursor: ${style} !important;}`) ?? -1;
}
