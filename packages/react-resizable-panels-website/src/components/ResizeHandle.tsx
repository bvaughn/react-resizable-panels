import { PanelResizeHandle } from "react-resizable-panels";

import styles from "./ResizeHandle.module.css";

export function ResizeHandle({
  className = "",
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <PanelResizeHandle
      className={[styles.ResizeHandle, className].join(" ")}
      id={id}
    />
  );
}
