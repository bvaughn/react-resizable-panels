import { useEffect } from "react";

declare function watchFile(path: string, onDelete: () => void): () => void;

// <begin>

import { useParentTab } from "react-resizable-panels";

function Editor({ path }: { path: string }) {
  const tab = useParentTab();

  useEffect(() => watchFile(path, () => tab?.close()), [path, tab]);

  // ...
}

// <end>

export { Editor };
