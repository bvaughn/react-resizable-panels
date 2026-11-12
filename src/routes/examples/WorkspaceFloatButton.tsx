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

  if (!workspace || !tabset || !state || state.isRoot) {
    return null;
  }

  return state.isFloating ? (
    <button onClick={() => workspace.moveTabset(tabset.id, { edge: "right" })}>
      Dock
    </button>
  ) : (
    <button onClick={() => tabset.float()}>Float</button>
  );
}

// <end>

export { FloatButton };
