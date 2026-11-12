// <begin>

import { useParentWorkspace } from "react-resizable-panels";

function FileLink({ path }: { path: string }) {
  const workspace = useParentWorkspace();

  return (
    <button
      onClick={() =>
        workspace?.addTab({ data: { path }, id: path, title: path })
      }
    >
      {path}
    </button>
  );
}

// <end>

export { FileLink };
