import { useContext } from "react";
import { PanelContext, PanelResizeHandle } from "react-resizable-panels";

import styles from "./styles.module.css";

export default function DragHandle({ id }: { id: string }) {
  const { activeHandleId } = useContext(PanelContext);
  const isDragging = activeHandleId === id;

  return (
    <PanelResizeHandle className={styles.HorizontalResizeHandle} id={id}>
      <div
        className={isDragging ? styles.ActiveResizeHandle : styles.ResizeHandle}
      />
    </PanelResizeHandle>
  );
}
