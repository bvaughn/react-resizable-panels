// <begin>

import { useParentTabset, useParentTabsetState } from "react-resizable-panels";

function MaximizeButton() {
  const tabset = useParentTabset();
  const isMaximized = useParentTabsetState()?.isMaximized;

  return isMaximized ? (
    <button onClick={() => tabset?.restore()}>Restore</button>
  ) : (
    <button onClick={() => tabset?.maximize()}>Maximize</button>
  );
}

// <end>

export { MaximizeButton };
