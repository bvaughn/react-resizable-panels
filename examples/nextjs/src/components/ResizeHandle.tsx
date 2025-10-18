import {
  PanelResizeHandle,
  PanelResizeHandleProps,
  usePanelGroupContext,
} from "react-resizable-panels";

import styles from "./ResizeHandle.module.css";
import Icon from "./Icon";

export function ResizeHandle({
  className = "",
  id,
  ...rest
}: PanelResizeHandleProps & {
  className?: string;
  id?: string;
}) {
  const { direction } = usePanelGroupContext();

  return (
    <PanelResizeHandle
      className={[styles.ResizeHandle, className].join(" ")}
      id={id}
      {...rest}
    >
      <Icon
        className={styles.ResizeHandleThumb}
        data-direction={direction}
        type="drag"
      />
    </PanelResizeHandle>
  );
}
