import { ReactNode, useContext, useEffect, useState } from "react";

import useUniqueId from "./hooks/useUniqueId";
import { PanelContext, PanelGroupContext } from "./PanelContexts";
import type { ResizeHandler, ResizeEvent } from "./types";

export default function PanelResizeHandle({
  children = null,
  className = "",
  disabled = false,
  id: idProp = null,
}: {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string | null;
}) {
  const panelContext = useContext(PanelContext);
  const panelGroupContext = useContext(PanelGroupContext);
  if (panelContext === null || panelGroupContext === null) {
    throw Error(
      `PanelResizeHandle components must be rendered within a PanelGroup container`
    );
  }

  const id = useUniqueId(idProp);

  const { activeHandleId } = panelContext;
  const {
    direction,
    groupId,
    registerResizeHandle,
    startDragging,
    stopDragging,
  } = panelGroupContext;

  const isDragging = activeHandleId === id;

  const [resizeHandler, setResizeHandler] = useState<ResizeHandler | null>(
    null
  );

  useEffect(() => {
    if (disabled) {
      setResizeHandler(null);
    } else {
      const resizeHandler = registerResizeHandle(id);
      setResizeHandler(() => resizeHandler);
    }
  }, [disabled, groupId, id, registerResizeHandle]);

  useEffect(() => {
    if (disabled || resizeHandler == null || !isDragging) {
      return;
    }

    document.body.style.cursor =
      direction === "horizontal" ? "ew-resize" : "ns-resize";

    const onMove = (event: ResizeEvent) => {
      resizeHandler(event);
    };

    document.body.addEventListener("mouseleave", stopDragging);
    document.body.addEventListener("mousemove", onMove);
    document.body.addEventListener("touchmove", onMove);
    document.body.addEventListener("mouseup", stopDragging);

    return () => {
      document.body.style.cursor = "";

      document.body.removeEventListener("mouseleave", stopDragging);
      document.body.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("touchmove", onMove);
      document.body.removeEventListener("mouseup", stopDragging);
    };
  }, [direction, disabled, isDragging, resizeHandler, stopDragging]);

  return (
    <div
      className={className}
      data-panel-group-id={groupId}
      data-panel-resize-handle-id={id}
      onMouseDown={() => startDragging(id)}
      onMouseUp={stopDragging}
      onTouchCancel={stopDragging}
      onTouchEnd={stopDragging}
      onTouchStart={() => startDragging(id)}
      style={{
        cursor: direction === "horizontal" ? "ew-resize" : "ns-resize",
      }}
    >
      {children}
    </div>
  );
}
