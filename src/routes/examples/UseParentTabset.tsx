// <begin>

import { useParentTabset } from "react-resizable-panels";

function NewFileButton() {
  const tabset = useParentTabset();

  return (
    <button
      onClick={() =>
        tabset?.addTab({
          data: { path: null },
          id: crypto.randomUUID(),
          title: "Untitled"
        })
      }
    >
      New file
    </button>
  );
}

// <end>

export { NewFileButton };
