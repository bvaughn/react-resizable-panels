import { ReactNode, useContext, useLayoutEffect } from "react";

import { PanelGroupContext } from "./PanelContexts";
import { PanelId } from "./types";

// TODO [panels]
// Support min pixel size too.
// PanelGroup should warn if total width is less min pixel widths.
export default function Panel({
  children,
  className = "",
  defaultSize = 0.1,
  id,
  minSize = 0.1,
}: {
  children: ReactNode;
  className?: string;
  defaultSize?: number;
  id: PanelId;
  minSize?: number;
}) {
  const context = useContext(PanelGroupContext);
  if (context === null) {
    throw Error(`Panel components must be rendered within a PanelGroup container`);
  }

  const { getPanelStyle, registerPanel } = context;

  useLayoutEffect(() => {
    const panel = {
      defaultSize,
      id,
      minSize,
    };

    registerPanel(id, panel);
  }, [defaultSize, minSize, registerPanel, id]);

  const style = getPanelStyle(id);

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
