import { useContext } from "react";
import { PanelContext, PanelResizeHandle } from "react-resizable-panels";

import styles from "./ResizeHandle.module.css";

export default function ResizeHandle({
  className = "",
  id,
}: {
  className?: string;
  id?: string;
}) {
  const { activeHandleId } = useContext(PanelContext);
  const isDragging = activeHandleId === id;

  return (
    <PanelResizeHandle
      className={[styles.ResizeHandle, className].join(" ")}
      id={id}
    >
      <div
        className={
          isDragging ? styles.ResizeHandleActive : styles.ResizeHandleInactive
        }
      />
    </PanelResizeHandle>
  );
}
