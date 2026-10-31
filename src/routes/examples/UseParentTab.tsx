import { useEffect } from "react";

declare function watchFile(path: string, onDelete: () => void): () => void;

// <begin>

import { useParentTab } from "react-resizable-panels";

function Editor({ path }: { path: string }) {
  const tab = useParentTab();

  // tab doesn't change, so this effect doesn't re-run when the tab is selected or moved
  useEffect(() => watchFile(path, () => tab?.close()), [path, tab]);

  // ...
}

// <end>

export { Editor };
