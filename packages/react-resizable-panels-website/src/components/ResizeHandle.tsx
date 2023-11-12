import { PanelResizeHandle } from "react-resizable-panels";

import Icon from "./Icon";
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
      className={[styles.ResizeHandleOuter, className].join(" ")}
      id={id}
    >
      <div
        className={styles.ResizeHandleInner}
        data-collapsed={collapsed || undefined}
      >
        <Icon className={styles.HorizontalIcon} type="resize-horizontal" />
        <Icon className={styles.VerticalIcon} type="resize-vertical" />
      </div>
    </PanelResizeHandle>
  );
}
