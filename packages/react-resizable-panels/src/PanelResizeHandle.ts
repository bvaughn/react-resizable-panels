import {
  createElement,
  CSSProperties,
  ElementType,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  TouchEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "./vendor/react";
import useUniqueId from "./hooks/useUniqueId";

import { useWindowSplitterResizeHandlerBehavior } from "./hooks/useWindowSplitterBehavior";
import { PanelGroupContext } from "./PanelContexts";
import type {
  ResizeHandler,
  ResizeEvent,
  PanelResizeHandleOnDragging,
} from "./types";
import { getCursorStyle } from "./utils/cursor";

export type PanelResizeHandleProps = {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string | null;
  onDragging?: PanelResizeHandleOnDragging;
  style?: CSSProperties;
  tagName?: ElementType;
};

export function PanelResizeHandle({
  children = null,
  className: classNameFromProps = "",
  disabled = false,
  id: idFromProps = null,
  onDragging,
  style: styleFromProps = {},
  tagName: Type = "div",
}: PanelResizeHandleProps) {
  const divElementRef = useRef<HTMLDivElement>(null);

  // Use a ref to guard against users passing inline props
  const callbacksRef = useRef<{
    onDragging: PanelResizeHandleOnDragging | undefined;
  }>({ onDragging });
  useEffect(() => {
    callbacksRef.current.onDragging = onDragging;
  });

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

    const { onDragging } = callbacksRef.current;
    if (onDragging) {
      onDragging(false);
    }
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

    const onMove = (event: ResizeEvent) => {
      resizeHandler(event);
    };

    const onMouseLeave = (event: MouseEvent) => {
      resizeHandler(event);
    };

    const divElement = divElementRef.current!;
    const targetDocument = divElement.ownerDocument;

    targetDocument.body.addEventListener("contextmenu", stopDraggingAndBlur);
    targetDocument.body.addEventListener("mousemove", onMove);
    targetDocument.body.addEventListener("touchmove", onMove);
    targetDocument.body.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseup", stopDraggingAndBlur);
    window.addEventListener("touchend", stopDraggingAndBlur);

    return () => {
      targetDocument.body.removeEventListener(
        "contextmenu",
        stopDraggingAndBlur
      );
      targetDocument.body.removeEventListener("mousemove", onMove);
      targetDocument.body.removeEventListener("touchmove", onMove);
      targetDocument.body.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseup", stopDraggingAndBlur);
      window.removeEventListener("touchend", stopDraggingAndBlur);
    };
  }, [direction, disabled, isDragging, resizeHandler, stopDraggingAndBlur]);

  useWindowSplitterResizeHandlerBehavior({
    disabled,
    handleId: resizeHandleId,
    resizeHandler,
  });

  const style: CSSProperties = {
    cursor: getCursorStyle(direction),
    touchAction: "none",
    userSelect: "none",
  };

  return createElement(Type, {
    children,
    className: classNameFromProps,
    "data-resize-handle-active": isDragging
      ? "pointer"
      : isFocused
      ? "keyboard"
      : undefined,
    "data-panel-group-direction": direction,
    "data-panel-group-id": groupId,
    "data-panel-resize-handle-enabled": !disabled,
    "data-panel-resize-handle-id": resizeHandleId,
    onBlur: () => setIsFocused(false),
    onFocus: () => setIsFocused(true),
    onMouseDown: (event: ReactMouseEvent) => {
      startDragging(resizeHandleId, event.nativeEvent);

      const { onDragging } = callbacksRef.current!;
      if (onDragging) {
        onDragging(true);
      }
    },
    onMouseUp: stopDraggingAndBlur,
    onTouchCancel: stopDraggingAndBlur,
    onTouchEnd: stopDraggingAndBlur,
    onTouchStart: (event: TouchEvent) => {
      startDragging(resizeHandleId, event.nativeEvent);

      const { onDragging } = callbacksRef.current!;
      if (onDragging) {
        onDragging(true);
      }
    },
    ref: divElementRef,
    role: "separator",
    style: {
      ...style,
      ...styleFromProps,
    },
    tabIndex: 0,
  });
}

PanelResizeHandle.displayName = "PanelResizeHandle";
