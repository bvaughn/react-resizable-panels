import { useEffect } from "react";
import { useParentTab, useParentTabState } from "react-resizable-panels";

declare const editor: {
  focus(): void;
  onFileDeleted(callback: () => void): () => void;
};

// <begin>

function Editor() {
  // Stable for the life of the tab; safe to use as an effect dependency
  const tab = useParentTab();

  // Re-renders when the tab's state changes
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
