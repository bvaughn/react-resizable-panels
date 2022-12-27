import { ReactNode, useContext, useLayoutEffect } from "react";
import useUniqueId from "./hooks/useUniqueId";

import { PanelGroupContext } from "./PanelContexts";

// TODO [panels]
// Support min pixel size too.
// PanelGroup should warn if total width is less min pixel widths.
export default function Panel({
  children = null,
  className = "",
  defaultSize = null,
  id: idFromProps = null,
  minSize = 10,
  order = null,
}: {
  children?: ReactNode;
  className?: string;
  defaultSize?: number | null;
  id?: string | null;
  minSize?: number;
  order?: number | null;
}) {
  const context = useContext(PanelGroupContext);
  if (context === null) {
    throw Error(
      `Panel components must be rendered within a PanelGroup container`
    );
  }

  const panelId = useUniqueId(idFromProps);

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

  const { getPanelStyle, registerPanel, unregisterPanel } = context;

  useLayoutEffect(() => {
    const panel = {
      defaultSize,
      id: panelId,
      minSize,
      order,
    };

    registerPanel(panelId, panel);

    return () => {
      unregisterPanel(panelId);
    };
  }, [defaultSize, panelId, minSize, order, registerPanel, unregisterPanel]);

  const style = getPanelStyle(panelId);

  return (
    <div
      className={className}
      data-panel-id={panelId}
      id={`data-panel-id-${panelId}`}
      style={style}
    >
      {children}
    </div>
  );
}
