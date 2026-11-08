import {
  useParentTabset,
  useParentTabsetState,
  useParentWorkspace
} from "react-resizable-panels";

// <begin>

function FloatButton() {
  const workspace = useParentWorkspace();
  const tabset = useParentTabset();
  const state = useParentTabsetState();

  // The only tabset in a workspace fills it, so it can't float
  if (!workspace || !tabset || !state || state.isRoot) {
    return null;
  }

  return state.isFloating ? (
    // Moving a floating tabset beside the others docks it
    <button onClick={() => workspace.moveTabset(tabset.id, { edge: "right" })}>
      Dock
    </button>
  ) : (
    <button onClick={() => tabset.float()}>Float</button>
  );
}

// <end>

export { FloatButton };
