import { useLayoutEffect } from "react";
import styles from "./VisibleCursor.module.css";
import { getResizeEventCoordinates } from "../../../react-resizable-panels/src/utils/events/getResizeEventCoordinates";

export function VisibleCursor() {
  useLayoutEffect(() => {
    const element = document.createElement("div");
    element.classList.add(styles.VisibleCursor!);
    element.setAttribute("data-state", "up");

    document.body.appendChild(element);

    const onMouseDown = () => {
      element.setAttribute("data-state", "down");
    };

    const onMouseMove = (event: MouseEvent | TouchEvent) => {
      const { x, y } = getResizeEventCoordinates(event);
      element.style.left = x + "px";
      element.style.top = y + "px";
    };

    const onMouseUp = () => {
      element.setAttribute("data-state", "up");
    };

    document.addEventListener("mousedown", onMouseDown, true);
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("mouseup", onMouseUp, true);
    document.addEventListener("touchcancel", onMouseUp, true);
    document.addEventListener("touchend", onMouseUp, true);
    document.addEventListener("touchmove", onMouseMove, true);
    document.addEventListener("touchstart", onMouseDown, true);

    return () => {
      document.body.removeChild(element);

      document.removeEventListener("mousedown", onMouseDown, true);
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("mouseup", onMouseUp, true);
      document.removeEventListener("touchcancel", onMouseUp, true);
      document.removeEventListener("touchend", onMouseUp, true);
      document.removeEventListener("touchmove", onMouseMove, true);
      document.removeEventListener("touchstart", onMouseDown, true);
    };
  });

  return null;
}
