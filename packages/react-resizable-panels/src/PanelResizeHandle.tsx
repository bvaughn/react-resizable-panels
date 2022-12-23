import { ReactNode, useContext, useEffect, useState } from "react";

import useUniqueId from "./hooks/useUniqueId";
import { PanelGroupContext } from "./PanelContexts";
import { ResizeHandler } from "./types";

export default function PanelResizeHandle({
  children = null,
  className = "",
  disabled = false,
}: {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const context = useContext(PanelGroupContext);
  if (context === null) {
    throw Error(
      `PanelResizeHandle components must be rendered within a PanelGroup container`
    );
  }

  const id = useUniqueId();

  const { direction, groupId, registerResizeHandle } = context;

  const setGroupId = useState<string | null>(null);
  const [resizeHandler, setResizeHandler] = useState<ResizeHandler | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);

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

    const onMouseLeave = (_: MouseEvent) => {
      setIsDragging(false);
    };

    const onMouseMove = (event: MouseEvent) => {
      resizeHandler(event);
    };

    const onMouseUp = (_: MouseEvent) => {
      setIsDragging(false);
    };

    document.body.addEventListener("mouseleave", onMouseLeave);
    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.cursor = "";

      document.body.removeEventListener("mouseleave", onMouseLeave);
      document.body.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseup", onMouseUp);
    };
  }, [direction, disabled, isDragging, resizeHandler]);

  return (
    <div
      className={className}
      data-panel-group-id={groupId}
      data-panel-resize-handle-id={id}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      style={{
        cursor: direction === "horizontal" ? "ew-resize" : "ns-resize",
      }}
    >
      {children}
    </div>
  );
}
