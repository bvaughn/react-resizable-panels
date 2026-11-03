import { useParentTabset, useParentTabsetState } from "react-resizable-panels";

// <begin>

function CollapseButton() {
  const tabset = useParentTabset();
  const state = useParentTabsetState();

  // Hidden for tabsets that can't be collapsed (and for collapsed tabsets, which expand when a tab is clicked)
  if (!state?.isCollapsible || state.isCollapsed) {
    return null;
  }

  return <button onClick={() => tabset?.collapse()}>Collapse</button>;
}

// <end>

export { CollapseButton };
