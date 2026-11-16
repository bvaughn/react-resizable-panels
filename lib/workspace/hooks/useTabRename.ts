import { useCallback, useContext, useRef } from "react";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { WorkspaceStoreContext } from "../contexts/WorkspaceStoreContext";
import { updateTab } from "../models/updateTab";
import type { TabRename } from "../types";
import { useWorkspaceStoreSelector } from "./useWorkspaceStoreSelector";

/**
 * Edits the title of the nearest ancestor tab, e.g. with an input shown in place of its title (within `renderTab`) after it's double-clicked:
 *
 * ```tsx
 * function RenamableTab({ props, tab }: { props: TabRenderProps; tab: TabNode }) {
 *   const { inputProps, isEditing, startEditing } = useTabRename();
 *
 *   return (
 *     <div {...props} onDoubleClick={startEditing}>
 *       {isEditing ? <input aria-label="Tab title" {...inputProps} /> : (tab.title ?? tab.id)}
 *     </div>
 *   );
 * }
 * ```
 *
 * ℹ️ Use `WorkspaceImperativeHandle.startRenamingTab` to start editing from outside of the tab (e.g. from a context menu).
 *
 * @returns Whether the title is being edited, a function that starts editing it, and props for the input that edits it (see `TabRename`);
 * `isEditing` is always false if the component is not rendered within a tab
 */
export function useTabRename(): TabRename {
  const store = useContext(WorkspaceStoreContext);
  const tabId = useContext(ParentTabContext)?.id;

  const { isEditing, title } =
    useWorkspaceStoreSelector((state) => {
      const tab =
        tabId !== undefined
          ? state.modelIndex.tabsetsByTabId
              .get(tabId)
              ?.tabs.find(({ id }) => id === tabId)
          : undefined;

      return tab
        ? {
            isEditing: state.renamingTabId === tab.id,
            title: tab.title ?? tab.id
          }
        : null;
    }) ?? NOT_IN_TAB;

  // Set when Escape is pressed, so that the blur that follows doesn't save the title
  const isCanceledRef = useRef(false);

  const startEditing = useCallback(() => {
    if (store && tabId !== undefined) {
      store.setRenamingTabId(tabId);
    }
  }, [store, tabId]);

  // Only stops editing this tab (another tab may have started editing since; see startRenamingTab)
  const stopEditing = () =>
    store?.setRenamingTabId((prev) => (prev === tabId ? undefined : prev));

  // Stable, so that the input isn't focused (and its text selected) again whenever the tab re-renders
  const ref = useCallback((input: HTMLInputElement | null) => {
    if (input) {
      isCanceledRef.current = false;
      input.focus();
      input.select();
    }
  }, []);

  return {
    inputProps: {
      defaultValue: title,
      onBlur: (event) => {
        const isCanceled = isCanceledRef.current;
        isCanceledRef.current = false;

        const newTitle = event.currentTarget.value.trim();
        if (
          !isCanceled &&
          store &&
          tabId !== undefined &&
          newTitle !== "" &&
          newTitle !== title
        ) {
          store.updateModel("update", true, (prev) =>
            updateTab(prev, tabId, { title: newTitle })
          );
        }

        stopEditing();
      },
      onKeyDown: (event) => {
        // Keys that end the composition of text with an input method editor (e.g. for Korean or Japanese) aren't handled
        if (event.nativeEvent.isComposing) {
          return;
        }

        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
          isCanceledRef.current = event.key === "Escape";

          // Moving focus to the tab blurs the input, which saves (or cancels) the new title
          const input = event.currentTarget;
          input.closest<HTMLElement>("[data-tab]")?.focus();
          if (input.ownerDocument.activeElement === input) {
            input.blur();
          }
        }
      },
      ref
    },
    isEditing,
    startEditing
  };
}

const NOT_IN_TAB = { isEditing: false, title: "" };
