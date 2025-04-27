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
} from "react";
import { DATA_ATTRIBUTES } from "./constants";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicEffect";
import useUniqueId from "./hooks/useUniqueId";
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

export type PanelResizeHandleOnDragging = (isDragging: boolean) => void;
export type ResizeHandlerState = "drag" | "hover" | "inactive";

export type PanelResizeHandleProps = Omit<
  HTMLAttributes<keyof HTMLElementTagNameMap>,
  "id" | "onBlur" | "onClick" | "onFocus" | "onPointerDown" | "onPointerUp"
> &
  PropsWithChildren<{
    className?: string;
    disabled?: boolean;
    hitAreaMargins?: PointerHitAreaMargins;
    id?: string | null;
    onBlur?: () => void;
    onClick?: () => void;
    onDragging?: PanelResizeHandleOnDragging;
    onFocus?: () => void;
    onPointerDown?: () => void;
    onPointerUp?: () => void;
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
  onBlur,
  onClick,
  onDragging,
  onFocus,
  onPointerDown,
  onPointerUp,
  style: styleFromProps = {},
  tabIndex = 0,
  tagName: Type = "div",
  ...rest
}: PanelResizeHandleProps): ReactElement {
  const elementRef = useRef<HTMLElement>(null);

  // Use a ref to guard against users passing inline props
  const callbacksRef = useRef<{
    onClick: (() => void) | undefined;
    onDragging: PanelResizeHandleOnDragging | undefined;
    onPointerDown: (() => void) | undefined;
    onPointerUp: (() => void) | undefined;
  }>({ onClick, onDragging, onPointerDown, onPointerUp });
  useEffect(() => {
    callbacksRef.current.onClick = onClick;
    callbacksRef.current.onDragging = onDragging;
    callbacksRef.current.onPointerDown = onPointerDown;
    callbacksRef.current.onPointerUp = onPointerUp;
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

  // Extract hit area margins before passing them to the effect's dependency array
  // so that inline object values won't trigger re-renders
  const coarseHitAreaMargins = hitAreaMargins?.coarse ?? 15;
  const fineHitAreaMargins = hitAreaMargins?.fine ?? 5;

  useEffect(() => {
    if (disabled || resizeHandler == null) {
      return;
    }

    const element = elementRef.current;
    assert(element, "Element ref not attached");

    let didMove = false;

    const setResizeHandlerState = (
      action: ResizeHandlerAction,
      isActive: boolean,
      event: ResizeEvent | null
    ) => {
      if (!isActive) {
        setState("inactive");
        return;
      }

      switch (action) {
        case "down": {
          setState("drag");

          didMove = false;

          assert(event, 'Expected event to be defined for "down" action');

          startDragging(resizeHandleId, event);

          const { onDragging, onPointerDown } = callbacksRef.current;
          onDragging?.(true);
          onPointerDown?.();
          break;
        }
        case "move": {
          const { state } = committedValuesRef.current;

          didMove = true;

          if (state !== "drag") {
            setState("hover");
          }

          assert(event, 'Expected event to be defined for "move" action');

          resizeHandler(event);
          break;
        }
        case "up": {
          setState("hover");

          stopDragging();

          const { onClick, onDragging, onPointerUp } = callbacksRef.current;
          onDragging?.(false);
          onPointerUp?.();

          if (!didMove) {
            onClick?.();
          }
          break;
        }
      }
    };

    return registerResizeHandle(
      resizeHandleId,
      element,
      direction,
      {
        coarse: coarseHitAreaMargins,
        fine: fineHitAreaMargins,
      },
      setResizeHandlerState
    );
  }, [
    coarseHitAreaMargins,
    direction,
    disabled,
    fineHitAreaMargins,
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
    onBlur: () => {
      setIsFocused(false);
      onBlur?.();
    },
    onFocus: () => {
      setIsFocused(true);
      onFocus?.();
    },
    ref: elementRef,
    role: "separator",
    style: {
      ...style,
      ...styleFromProps,
    },
    tabIndex,

    // CSS selectors
    [DATA_ATTRIBUTES.groupDirection]: direction,
    [DATA_ATTRIBUTES.groupId]: groupId,
    [DATA_ATTRIBUTES.resizeHandle]: "",
    [DATA_ATTRIBUTES.resizeHandleActive]:
      state === "drag" ? "pointer" : isFocused ? "keyboard" : undefined,
    [DATA_ATTRIBUTES.resizeHandleEnabled]: !disabled,
    [DATA_ATTRIBUTES.resizeHandleId]: resizeHandleId,
    [DATA_ATTRIBUTES.resizeHandleState]: state,
  });
}

PanelResizeHandle.displayName = "PanelResizeHandle";
