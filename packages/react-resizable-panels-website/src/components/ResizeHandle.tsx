import { PanelResizeHandle } from "react-resizable-panels";

import styles from "./ResizeHandle.module.css";

export function ResizeHandle({
  className = "",
  collapsed = false,
  id,
}: {
  className?: string;
  collapsed?: boolean;
  id?: string;
}) {
  return (
    <PanelResizeHandle
      className={[styles.ResizeHandle, className].join(" ")}
      id={id}
    />
  );
}
