import {
  createElement,
  CSSProperties,
  ElementType,
  ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import useUniqueId from "./hooks/useUniqueId";

import { PanelGroupContext } from "./PanelContexts";
import { PanelOnResize } from "./types";

export type PanelProps = {
  children?: ReactNode;
  className?: string;
  defaultSize?: number | null;
  id?: string | null;
  maxSize?: number;
  minSize?: number;
  onResize?: PanelOnResize | null;
  order?: number | null;
  style?: CSSProperties;
  tagName?: ElementType;
};

export default function Panel({
  children = null,
  className: classNameFromProps = "",
  defaultSize = null,
  id: idFromProps = null,
  maxSize = 100,
  minSize = 10,
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

  const onResizeRef = useRef<PanelOnResize | null>(onResize);

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
      } else if (minSize > defaultSize) {
        console.error(
          `Panel minSize ${minSize} cannot be greater than defaultSize ${defaultSize}`
        );

        defaultSize = minSize;
      }
    }
  }

  const panelId = useUniqueId(idFromProps);

  const { getPanelStyle, registerPanel, unregisterPanel } = context;

  useLayoutEffect(() => {
    const panel = {
      defaultSize,
      id: panelId,
      maxSize,
      minSize,
      onResizeRef,
      order,
    };

    registerPanel(panelId, panel);

    return () => {
      unregisterPanel(panelId);
    };
  }, [
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
    "data-panel-id": panelId,
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
