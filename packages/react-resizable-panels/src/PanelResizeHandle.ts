import useUniqueId from "./hooks/useUniqueId";
import {
  createElement,
  CSSProperties,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
  MouseEvent as ReactMouseEvent,
  TouchEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "./vendor/react";

import { useWindowSplitterResizeHandlerBehavior } from "./hooks/useWindowSplitterBehavior";
import {
  PanelGroupContext,
  ResizeEvent,
  ResizeHandler,
} from "./PanelGroupContext";
import { assert } from "./utils/assert";
import { getCursorStyle } from "./utils/cursor";

export type PanelResizeHandleOnDragging = (isDragging: boolean) => void;

export type PanelResizeHandleProps = Omit<
  HTMLAttributes<keyof HTMLElementTagNameMap>,
  "id"
> &
  PropsWithChildren<{
    className?: string;
    disabled?: boolean;
    id?: string | null;
    onDragging?: PanelResizeHandleOnDragging;
    style?: CSSProperties;
    tabIndex?: number;
    tagName?: keyof HTMLElementTagNameMap;
  }>;

export function PanelResizeHandle({
  children = null,
  className: classNameFromProps = "",
  disabled = false,
  id: idFromProps,
  onDragging,
  style: styleFromProps = {},
  tabIndex = 0,
  tagName: Type = "div",
  ...rest
}: PanelResizeHandleProps): ReactElement {
  const elementRef = useRef<HTMLElement>(null);

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
    direction,
    dragState,
    groupId,
    registerResizeHandle,
    startDragging,
    stopDragging,
    panelGroupElement,
  } = panelGroupContext;

  const resizeHandleId = useUniqueId(idFromProps);
  const isDragging = dragState?.dragHandleId === resizeHandleId;

  const [isFocused, setIsFocused] = useState(false);

  const [resizeHandler, setResizeHandler] = useState<ResizeHandler | null>(
    null
  );

  const stopDraggingAndBlur = useCallback(() => {
    // Clicking on the drag handle shouldn't leave it focused;
    // That would cause the PanelGroup to think it was still active.
    const element = elementRef.current;
    assert(element);
    element.blur();

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

    const element = elementRef.current;
    assert(element);

    const targetDocument = element.ownerDocument;

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
    panelGroupElement,
  });

  const style: CSSProperties = {
    cursor: getCursorStyle(direction),
    touchAction: "none",
    userSelect: "none",
  };

  return createElement(Type, {
    ...rest,

    children,
    className: classNameFromProps,
    onBlur: () => setIsFocused(false),
    onFocus: () => setIsFocused(true),
    onMouseDown: (event: ReactMouseEvent) => {
      startDragging(resizeHandleId, event.nativeEvent);

      const callbacks = callbacksRef.current;
      assert(callbacks);
      const { onDragging } = callbacks;
      if (onDragging) {
        onDragging(true);
      }
    },
    onMouseUp: stopDraggingAndBlur,
    onTouchCancel: stopDraggingAndBlur,
    onTouchEnd: stopDraggingAndBlur,
    onTouchStart: (event: TouchEvent) => {
      startDragging(resizeHandleId, event.nativeEvent);

      const callbacks = callbacksRef.current;
      assert(callbacks);
      const { onDragging } = callbacks;
      if (onDragging) {
        onDragging(true);
      }
    },
    ref: elementRef,
    role: "separator",
    style: {
      ...style,
      ...styleFromProps,
    },
    tabIndex,

    // CSS selectors
    "data-panel-group-direction": direction,
    "data-panel-group-id": groupId,
    "data-resize-handle": "",
    "data-resize-handle-active": isDragging
      ? "pointer"
      : isFocused
      ? "keyboard"
      : undefined,
    "data-panel-resize-handle-enabled": !disabled,
    "data-panel-resize-handle-id": resizeHandleId,
  });
}

PanelResizeHandle.displayName = "PanelResizeHandle";
