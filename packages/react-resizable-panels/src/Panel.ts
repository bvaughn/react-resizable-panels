import {
  createElement,
  CSSProperties,
  ElementType,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicEffect";
import useUniqueId from "./hooks/useUniqueId";

import { PanelGroupContext } from "./PanelContexts";
import { PanelOnCollapse, PanelOnResize } from "./types";

export type PanelProps = {
  children?: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultSize?: number | null;
  id?: string | null;
  maxSize?: number;
  minSize?: number;
  onCollapse?: PanelOnCollapse | null;
  onResize?: PanelOnResize | null;
  order?: number | null;
  style?: CSSProperties;
  tagName?: ElementType;
};

export default function Panel({
  children = null,
  className: classNameFromProps = "",
  collapsible = false,
  defaultSize = null,
  id: idFromProps = null,
  maxSize = 100,
  minSize = 10,
  onCollapse = null,
  onResize = null,
  order = null,
  style: styleFromProps = {},
  tagName: Type = "div",
}: PanelProps) {
  const context = useContext(PanelGroupContext);
  if (context === null) {
    throw Error(
      `Panel components must be rendered within a PanelGroup container`
    );
  }

  // Use a ref to guard against users passing inline props
  const callbacksRef = useRef<{
    onCollapse: PanelOnCollapse | null;
    onResize: PanelOnResize | null;
  }>({ onCollapse, onResize });
  useEffect(() => {
    callbacksRef.current.onCollapse = onCollapse;
    callbacksRef.current.onResize = onResize;
  });

  // Basic props validation
  if (minSize < 0 || minSize > 100) {
    throw Error(`Panel minSize must be between 0 and 100, but was ${minSize}`);
  } else if (maxSize < 0 || maxSize > 100) {
    throw Error(`Panel maxSize must be between 0 and 100, but was ${maxSize}`);
  } else {
    if (defaultSize !== null) {
      if (defaultSize < 0 || defaultSize > 100) {
        throw Error(
          `Panel defaultSize must be between 0 and 100, but was ${defaultSize}`
        );
      } else if (minSize > defaultSize && !collapsible) {
        console.error(
          `Panel minSize ${minSize} cannot be greater than defaultSize ${defaultSize}`
        );

        defaultSize = minSize;
      }
    }
  }

  const panelId = useUniqueId(idFromProps);

  const { getPanelStyle, registerPanel, unregisterPanel } = context;

  useIsomorphicLayoutEffect(() => {
    const panel = {
      callbacksRef,
      collapsible,
      defaultSize,
      id: panelId,
      maxSize,
      minSize,
      order,
    };

    registerPanel(panelId, panel);

    return () => {
      unregisterPanel(panelId);
    };
  }, [
    collapsible,
    defaultSize,
    panelId,
    maxSize,
    minSize,
    order,
    registerPanel,
    unregisterPanel,
  ]);

  const style = getPanelStyle(panelId);

  return createElement(Type, {
    children,
    className: classNameFromProps,
    "data-panel": "",
    "data-panel-collapsible": collapsible || undefined,
    "data-panel-id": panelId,
    "data-panel-size": parseFloat("" + style.flexGrow).toFixed(1),
    id: `data-panel-id-${panelId}`,
    style: {
      ...style,
      ...styleFromProps,
    },
  });
}

// Workaround for Parcel scope hoisting (which renames objects/functions).
// Casting to :any is required to avoid corrupting the generated TypeScript types.
// See github.com/parcel-bundler/parcel/issues/8724
(Panel as any).displayName = "Panel";
