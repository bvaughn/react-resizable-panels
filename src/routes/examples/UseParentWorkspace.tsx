// <begin>

import { useParentWorkspace } from "react-resizable-panels";

function FileLink({ path }: { path: string }) {
  const workspace = useParentWorkspace();

  return (
    <button
      onClick={() =>
        // Opens the file in the active tabset (or selects its tab if it's already open)
        workspace?.addTab({ data: { path }, id: path, title: path })
      }
    >
      {path}
    </button>
  );
}

// <end>

export { FileLink };
