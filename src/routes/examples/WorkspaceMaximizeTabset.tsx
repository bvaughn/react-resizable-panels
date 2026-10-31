import { useParentTabset, useParentTabsetState } from "react-resizable-panels";

// <begin>

function MaximizeButton() {
  const tabset = useParentTabset();
  const state = useParentTabsetState();
  const isMaximized = state?.isMaximized;

  // Maximizing the only tabset in a workspace isn't useful
  if (state?.isRoot) {
    return null;
  }

  return (
    <button
      onClick={() => (isMaximized ? tabset?.restore() : tabset?.maximize())}
    >
      {isMaximized ? "Restore" : "Maximize"}
    </button>
  );
}

// <end>

export { MaximizeButton };
