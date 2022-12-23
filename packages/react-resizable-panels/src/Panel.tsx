import { ReactNode, useContext, useLayoutEffect } from "react";

import { PanelGroupContext } from "./PanelContexts";

// TODO [panels]
// Support min pixel size too.
// PanelGroup should warn if total width is less min pixel widths.
export default function Panel({
  children = null,
  className = "",
  defaultSize = 0.1,
  id,
  minSize = 0.1,
}: {
  children?: ReactNode;
  className?: string;
  defaultSize?: number;
  id: string;
  minSize?: number;
}) {
  const context = useContext(PanelGroupContext);
  if (context === null) {
    throw Error(
      `Panel components must be rendered within a PanelGroup container`
    );
  }

  if (minSize > defaultSize) {
    console.error(
      `Panel minSize ${minSize} cannot be greater than defaultSize ${defaultSize}`
    );

    defaultSize = minSize;
  }

  const { getPanelStyle, registerPanel, unregisterPanel } = context;

  useLayoutEffect(() => {
    const panel = {
      defaultSize,
      id,
      minSize,
    };

    registerPanel(id, panel);

    return () => {
      unregisterPanel(id);
    };
  }, [defaultSize, id, minSize, registerPanel, unregisterPanel]);

  const style = getPanelStyle(id);

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
