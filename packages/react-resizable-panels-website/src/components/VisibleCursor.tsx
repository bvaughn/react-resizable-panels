import { useLayoutEffect } from "react";
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

    const onMouseMove = (event: MouseEvent) => {
      element.style.left = event.pageX + "px";
      element.style.top = event.pageY + "px";
    };

    const onMouseUp = () => {
      element.setAttribute("data-state", "up");
    };

    document.addEventListener("mousedown", onMouseDown, true);
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("mouseup", onMouseUp, true);

    return () => {
      document.body.removeChild(element);

      document.removeEventListener("mousedown", onMouseDown, true);
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("mouseup", onMouseUp, true);
    };
  });

  return null;
}
