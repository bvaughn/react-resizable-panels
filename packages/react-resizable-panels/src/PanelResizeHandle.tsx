import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import useUniqueId from "./hooks/useUniqueId";
import { useWindowSplitterResizeHandlerBehavior } from "./hooks/useWindowSplitterBehavior";
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
  const divElementRef = useRef<HTMLDivElement>(null);

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

  const stopDraggingAndBlur = useCallback(() => {
    // Clicking on the drag handle shouldn't leave it focused;
    // That would cause the PanelGroup to think it was still active.
    const div = divElementRef.current!;
    div.blur();

    stopDragging();
  }, [stopDragging]);

  useEffect(() => {
    if (disabled) {
      setResizeHandler(null);
    } else {
      const resizeHandler = registerResizeHandle(id);
      setResizeHandler(() => resizeHandler);
    }
  }, [disabled, id, registerResizeHandle]);

  useEffect(() => {
    if (disabled || resizeHandler == null || !isDragging) {
      return;
    }

    document.body.style.cursor =
      direction === "horizontal" ? "ew-resize" : "ns-resize";

    const onMove = (event: ResizeEvent) => {
      resizeHandler(event);
    };

    document.body.addEventListener("mouseleave", stopDraggingAndBlur);
    document.body.addEventListener("mousemove", onMove);
    document.body.addEventListener("touchmove", onMove);
    document.body.addEventListener("mouseup", stopDraggingAndBlur);

    return () => {
      document.body.style.cursor = "";

      document.body.removeEventListener("mouseleave", stopDraggingAndBlur);
      document.body.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("touchmove", onMove);
      document.body.removeEventListener("mouseup", stopDraggingAndBlur);
    };
  }, [direction, disabled, isDragging, resizeHandler, stopDraggingAndBlur]);

  useWindowSplitterResizeHandlerBehavior({
    disabled,
    handleId: id,
    resizeHandler,
  });

  return (
    <div
      className={className}
      data-panel-group-id={groupId}
      data-panel-resize-handle-enabled={!disabled}
      data-panel-resize-handle-id={id}
      onMouseDown={() => startDragging(id)}
      onMouseUp={stopDraggingAndBlur}
      onTouchCancel={stopDraggingAndBlur}
      onTouchEnd={stopDraggingAndBlur}
      onTouchStart={() => startDragging(id)}
      ref={divElementRef}
      role="separator"
      style={{
        cursor: direction === "horizontal" ? "ew-resize" : "ns-resize",
        touchAction: "none",
        userSelect: "none",
      }}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
