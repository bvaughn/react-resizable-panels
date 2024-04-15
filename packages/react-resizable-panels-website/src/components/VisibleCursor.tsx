import { useLayoutEffect } from "react";
import { getResizeEventCoordinates } from "../../../react-resizable-panels/src/utils/events/getResizeEventCoordinates";
import styles from "./VisibleCursor.module.css";

export function VisibleCursor() {
  useLayoutEffect(() => {
    const element = document.createElement("div");
    element.classList.add(styles.VisibleCursor!);
    element.setAttribute("data-state", "up");

    document.body.appendChild(element);

    const onMouseDown = () => {
      element.setAttribute("data-state", "down");
    };

    const onMouseMove = (event: PointerEvent) => {
      const { x, y } = getResizeEventCoordinates(event);
      element.style.left = x + "px";
      element.style.top = y + "px";
    };

    const onMouseUp = () => {
      element.setAttribute("data-state", "up");
    };

    document.addEventListener("pointerdown", onMouseDown, true);
    document.addEventListener("pointermove", onMouseMove, true);
    document.addEventListener("pointerup", onMouseUp, true);

    return () => {
      document.body.removeChild(element);

      document.removeEventListener("pointerdown", onMouseDown, true);
      document.removeEventListener("pointermove", onMouseMove, true);
      document.removeEventListener("pointerup", onMouseUp, true);
    };
  });

  return null;
}
