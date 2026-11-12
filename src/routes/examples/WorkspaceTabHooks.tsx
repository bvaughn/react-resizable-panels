import { useEffect } from "react";
import { useParentTab, useParentTabState } from "react-resizable-panels";

declare const editor: {
  focus(): void;
  onFileDeleted(callback: () => void): () => void;
};

// <begin>

function Editor() {
  const tab = useParentTab();

  const tabState = useParentTabState();
  const isVisible = tabState?.isVisible;

  useEffect(() => editor.onFileDeleted(() => tab?.close()), [tab]);

  useEffect(() => {
    if (isVisible) {
      editor.focus();
    }
  }, [isVisible]);

  // ...
}

// <end>

export { Editor };
