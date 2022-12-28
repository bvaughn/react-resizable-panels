import { PanelResizeHandle } from "react-resizable-panels";

import Icon from "./Icon";
import styles from "./ResizeHandle.module.css";

export default function ResizeHandle({
  className = "",
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <PanelResizeHandle
      className={[styles.ResizeHandleOuter, className].join(" ")}
      id={id}
    >
      <div className={styles.ResizeHandleInner}>
        <Icon className={styles.HorizontalIcon} type="resize-horizontal" />
        <Icon className={styles.VerticalIcon} type="resize-vertical" />
      </div>
    </PanelResizeHandle>
  );
}
