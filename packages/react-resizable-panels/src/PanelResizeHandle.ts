import useUniqueId from "./hooks/useUniqueId";
import {
  createElement,
  CSSProperties,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
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
import {
  PointerHitAreaMargins,
  registerResizeHandle,
  ResizeHandlerAction,
} from "./PanelResizeHandleRegistry";
import { assert } from "./utils/assert";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicEffect";

export type PanelResizeHandleOnDragging = (isDragging: boolean) => void;
export type ResizeHandlerState = "drag" | "hover" | "inactive";

export type PanelResizeHandleProps = Omit<
  HTMLAttributes<keyof HTMLElementTagNameMap>,
  "id"
> &
  PropsWithChildren<{
    className?: string;
    disabled?: boolean;
    hitAreaMargins?: PointerHitAreaMargins;
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
  hitAreaMargins,
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
    groupId,
    registerResizeHandle: registerResizeHandleWithParentGroup,
    startDragging,
    stopDragging,
    panelGroupElement,
  } = panelGroupContext;

  const resizeHandleId = useUniqueId(idFromProps);

  const [state, setState] = useState<ResizeHandlerState>("inactive");

  const [isFocused, setIsFocused] = useState(false);

  const [resizeHandler, setResizeHandler] = useState<ResizeHandler | null>(
    null
  );

  const committedValuesRef = useRef<{
    state: ResizeHandlerState;
  }>({
    state,
  });

  useIsomorphicLayoutEffect(() => {
    committedValuesRef.current.state = state;
  });

  useEffect(() => {
    if (disabled) {
      setResizeHandler(null);
    } else {
      const resizeHandler = registerResizeHandleWithParentGroup(resizeHandleId);
      setResizeHandler(() => resizeHandler);
    }
  }, [disabled, resizeHandleId, registerResizeHandleWithParentGroup]);

  useEffect(() => {
    if (disabled || resizeHandler == null) {
      return;
    }

    const element = elementRef.current;
    assert(element, "Element ref not attached");

    const setResizeHandlerState = (
      action: ResizeHandlerAction,
      isActive: boolean,
      event: ResizeEvent
    ) => {
      if (isActive) {
        switch (action) {
          case "down": {
            setState("drag");

            startDragging(resizeHandleId, event);

            const { onDragging } = callbacksRef.current;
            if (onDragging) {
              onDragging(true);
            }
            break;
          }
          case "move": {
            const { state } = committedValuesRef.current;

            if (state !== "drag") {
              setState("hover");
            }

            resizeHandler(event);
            break;
          }
          case "up": {
            setState("hover");

            stopDragging();

            const { onDragging } = callbacksRef.current;
            if (onDragging) {
              onDragging(false);
            }
            break;
          }
        }
      } else {
        setState("inactive");
      }
    };

    return registerResizeHandle(
      resizeHandleId,
      element,
      direction,
      {
        // Coarse inputs (e.g. finger/touch)
        coarse: hitAreaMargins?.coarse ?? 15,
        // Fine inputs (e.g. mouse)
        fine: hitAreaMargins?.fine ?? 5,
      },
      setResizeHandlerState
    );
  }, [
    direction,
    disabled,
    hitAreaMargins,
    registerResizeHandleWithParentGroup,
    resizeHandleId,
    resizeHandler,
    startDragging,
    stopDragging,
  ]);

  useWindowSplitterResizeHandlerBehavior({
    disabled,
    handleId: resizeHandleId,
    resizeHandler,
    panelGroupElement,
  });

  const style: CSSProperties = {
    touchAction: "none",
    userSelect: "none",
  };

  return createElement(Type, {
    ...rest,

    children,
    className: classNameFromProps,
    id: idFromProps,
    onBlur: () => setIsFocused(false),
    onFocus: () => setIsFocused(true),
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
    "data-resize-handle-active":
      state === "drag" ? "pointer" : isFocused ? "keyboard" : undefined,
    "data-resize-handle-state": state,
    "data-panel-resize-handle-enabled": !disabled,
    "data-panel-resize-handle-id": resizeHandleId,
  });
}

PanelResizeHandle.displayName = "PanelResizeHandle";
