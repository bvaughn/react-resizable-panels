import { useEffect } from "react";
import { useParentTab, useParentWorkspace } from "react-resizable-panels";

declare function useFile(path: string): {
  hasUnsavedChanges: boolean;
  isDeleted: boolean;
  name: string;
};

// <begin>

function Editor({ path }: { path: string }) {
  const tab = useParentTab();
  const workspace = useParentWorkspace();
  const { hasUnsavedChanges, isDeleted, name } = useFile(path);

  // Show unsaved changes in the tab's title
  useEffect(() => {
    if (tab) {
      workspace?.updateTab(tab.id, {
        title: hasUnsavedChanges ? `${name} •` : name
      });
    }
  }, [hasUnsavedChanges, name, tab, workspace]);

  // Close the tab if its file is deleted
  useEffect(() => {
    if (isDeleted) {
      tab?.close();
    }
  }, [isDeleted, tab]);

  // ...
}

// <end>

export { Editor };
