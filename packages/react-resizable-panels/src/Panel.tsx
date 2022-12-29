import {
  CSSProperties,
  ElementType,
  ReactNode,
  useContext,
  useLayoutEffect,
} from "react";
import useUniqueId from "./hooks/useUniqueId";

import { PanelGroupContext } from "./PanelContexts";

// TODO [panels]
// Support min pixel size too.
// PanelGroup should warn if total width is less min pixel widths.
export default function Panel({
  children = null,
  className: classNameFromProps = "",
  defaultSize = null,
  id: idFromProps = null,
  maxSize = 100,
  minSize = 10,
  order = null,
  style: styleFromProps = {},
  tagName: Type = "div",
}: {
  children?: ReactNode;
  className?: string;
  defaultSize?: number | null;
  id?: string | null;
  maxSize?: number;
  minSize?: number;
  order?: number | null;
  style?: CSSProperties;
  tagName?: ElementType;
}) {
  const context = useContext(PanelGroupContext);
  if (context === null) {
    throw Error(
      `Panel components must be rendered within a PanelGroup container`
    );
  }

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

  return (
    <Type
      className={classNameFromProps}
      data-panel-id={panelId}
      id={`data-panel-id-${panelId}`}
      style={{
        ...style,
        ...styleFromProps,
      }}
    >
      {children}
    </Type>
  );
}

// Workaround for Parcel scope hoisting (which renames objects/functions).
// Casting to :any is required to avoid corrupting the generated TypeScript types.
// See github.com/parcel-bundler/parcel/issues/8724
(Panel as any).displayName = "Panel";
