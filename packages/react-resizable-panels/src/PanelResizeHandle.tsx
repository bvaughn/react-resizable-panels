import {
  CSSProperties,
  ElementType,
  MouseEvent,
  ReactNode,
  TouchEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useUniqueId from "./hooks/useUniqueId";

import { useWindowSplitterResizeHandlerBehavior } from "./hooks/useWindowSplitterBehavior";
import { PanelGroupContext } from "./PanelContexts";
import type { ResizeHandler, ResizeEvent } from "./types";

export default function PanelResizeHandle({
  children = null,
  className: classNameFromProps = "",
  disabled = false,
  id: idFromProps = null,
  style: styleFromProps = {},
  tagName: Type = "div",
}: {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string | null;
  style?: CSSProperties;
  tagName?: ElementType;
}) {
  const divElementRef = useRef<HTMLDivElement>(null);

  const panelGroupContext = useContext(PanelGroupContext);
  if (panelGroupContext === null) {
    throw Error(
      `PanelResizeHandle components must be rendered within a PanelGroup container`
    );
  }

  const {
    activeHandleId,
    direction,
    groupId,
    registerResizeHandle,
    startDragging,
    stopDragging,
  } = panelGroupContext;

  const resizeHandleId = useUniqueId(idFromProps);
  const isDragging = activeHandleId === resizeHandleId;

  const [isFocused, setIsFocused] = useState(false);

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
      const resizeHandler = registerResizeHandle(resizeHandleId);
      setResizeHandler(() => resizeHandler);
    }
  }, [disabled, resizeHandleId, registerResizeHandle]);

  useEffect(() => {
    if (disabled || resizeHandler == null || !isDragging) {
      return;
    }

    document.body.style.cursor =
      direction === "horizontal" ? "ew-resize" : "ns-resize";

    const onMove = (event: ResizeEvent) => {
      resizeHandler(event);
    };

    document.body.addEventListener("contextmenu", stopDraggingAndBlur);
    document.body.addEventListener("mouseleave", stopDraggingAndBlur);
    document.body.addEventListener("mousemove", onMove);
    document.body.addEventListener("touchmove", onMove);
    document.body.addEventListener("mouseup", stopDraggingAndBlur);

    return () => {
      document.body.style.cursor = "";

      document.body.removeEventListener("contextmenu", stopDraggingAndBlur);
      document.body.removeEventListener("mouseleave", stopDraggingAndBlur);
      document.body.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("touchmove", onMove);
      document.body.removeEventListener("mouseup", stopDraggingAndBlur);
    };
  }, [direction, disabled, isDragging, resizeHandler, stopDraggingAndBlur]);

  useWindowSplitterResizeHandlerBehavior({
    disabled,
    handleId: resizeHandleId,
    resizeHandler,
  });

  const style: CSSProperties = {
    cursor: direction === "horizontal" ? "ew-resize" : "ns-resize",
    touchAction: "none",
    userSelect: "none",
  };

  return (
    <Type
      className={classNameFromProps}
      data-resize-handle-active={
        isDragging ? "pointer" : isFocused ? "keyboard" : undefined
      }
      data-panel-group-direction={direction}
      data-panel-group-id={groupId}
      data-panel-resize-handle-enabled={!disabled}
      data-panel-resize-handle-id={resizeHandleId}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onMouseDown={(event: MouseEvent) =>
        startDragging(resizeHandleId, event.nativeEvent)
      }
      onMouseUp={stopDraggingAndBlur}
      onTouchCancel={stopDraggingAndBlur}
      onTouchEnd={stopDraggingAndBlur}
      onTouchStart={(event: TouchEvent) =>
        startDragging(resizeHandleId, event.nativeEvent)
      }
      ref={divElementRef}
      role="separator"
      style={{
        ...style,
        ...styleFromProps,
      }}
      tabIndex={0}
    >
      {children}
    </Type>
  );
}

// Workaround for Parcel scope hoisting (which renames objects/functions)
PanelResizeHandle.displayName = "PanelResizeHandle";
