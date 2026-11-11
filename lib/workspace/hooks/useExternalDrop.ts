import { useEffect, useState } from "react";
import { WORKSPACE_DRAG_DATA_TYPE } from "../constants";
import type {
  AcceptExternalDrop,
  TabDropTarget,
  TabNode,
  WorkspaceModel
} from "../types";
import type { DragStore } from "../utils/createDragStore";
import type { TabsetElementRegistry } from "../utils/createTabsetElementRegistry";
import { getDropTarget } from "../utils/getDropTarget";
import { getExternalDropEffect } from "../utils/getExternalDropEffect";

// Browsers dispatch "dragleave" when the pointer leaves an element, and "dragover" right after it if the pointer is still over the document;
// the drop indicator is hidden if no "dragover" follows within this time (e.g. the pointer left the window, or the drag was canceled)
const DRAG_LEAVE_DELAY = 100;

/**
 * Accepts drags that use the browser's drag and drop from outside of any workspace (see the acceptExternalDrop prop):
 * shows the drop indicator while one is over the workspace, and creates a tab where it's dropped.
 *
 * Drags between workspaces (see the dragGroup prop) are handled by useTabDrag instead.
 */
export function useExternalDrop({
  areDropsDisabled,
  dragStore,
  getAcceptExternalDrop,
  getModel,
  isEnabled,
  isNewTabDropDisabled,
  onNewTabDrop,
  rootElement,
  tabsetElements
}: {
  /** Whether drops are disabled regardless of the tab (e.g. the workspace is disabled) */
  areDropsDisabled: () => boolean;
  dragStore: DragStore;
  getAcceptExternalDrop: () => AcceptExternalDrop | undefined;
  getModel: () => WorkspaceModel;
  isEnabled: boolean;
  isNewTabDropDisabled: (tab: TabNode, target: TabDropTarget) => boolean;
  onNewTabDrop: (tab: TabNode, target: TabDropTarget) => boolean;
  rootElement: HTMLElement | null;
  tabsetElements: TabsetElementRegistry;
}) {
  // Set while an accepted drag is over the workspace's document, so that the drop indicator stays mounted (and can be animated between tabsets)
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);

  useEffect(() => {
    if (!isEnabled || !rootElement) {
      return;
    }

    const ownerDocument = rootElement.ownerDocument;

    let isOver = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    const clear = () => {
      clearTimeout(timeoutId);
      if (isOver) {
        isOver = false;
        setIsExternalDragOver(false);
        dragStore.setDropTarget(undefined);
      }
    };

    // Data types can be read during the drag (unlike the data itself); browsers lowercase them
    const isAccepted = (event: DragEvent) => {
      const acceptExternalDrop = getAcceptExternalDrop();
      const types = Array.from(event.dataTransfer?.types ?? [], (type) =>
        type.toLowerCase()
      );

      return (
        !!acceptExternalDrop &&
        !types.includes(WORKSPACE_DRAG_DATA_TYPE) &&
        acceptExternalDrop.types.some((type) =>
          types.includes(type.toLowerCase())
        )
      );
    };

    const getTarget = (event: DragEvent) => {
      // Only the innermost workspace under the pointer (e.g. not one that has another workspace within a tab) accepts the drop
      const element = event.composedPath()[0] as Element | undefined;
      if (
        typeof element?.closest !== "function" ||
        element.closest("[data-workspace]") !== rootElement ||
        areDropsDisabled()
      ) {
        return undefined;
      }

      return getDropTarget({
        clientX: event.clientX,
        clientY: event.clientY,
        // The tab doesn't exist yet; it's inserted like a tab from another workspace (whose id isn't used to find targets)
        isExternal: true,
        model: getModel(),
        rootElement,
        source: { tabId: "", type: "tab" },
        tabsetElements
      });
    };

    const onDragOver = (event: DragEvent) => {
      if (!isAccepted(event)) {
        return;
      }

      clearTimeout(timeoutId);
      if (!isOver) {
        isOver = true;
        setIsExternalDragOver(true);
      }

      // Elements within tab content that accept the drag themselves (by canceling the event) take precedence
      const dropEffect = getExternalDropEffect(
        event.dataTransfer?.effectAllowed ?? "uninitialized"
      );
      const target =
        event.defaultPrevented || !dropEffect ? undefined : getTarget(event);
      if (target && dropEffect && event.dataTransfer) {
        // Accepts the drop
        event.preventDefault();
        event.dataTransfer.dropEffect = dropEffect;
      }

      dragStore.setDropTarget(target);
    };

    const onDragLeave = () => {
      if (isOver) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(clear, DRAG_LEAVE_DELAY);
      }
    };

    const onDrop = (event: DragEvent) => {
      if (!isAccepted(event) || event.defaultPrevented) {
        return;
      }

      const target = getTarget(event);
      const { dataTransfer } = event;
      if (!target || !dataTransfer) {
        return;
      }

      // The drop was accepted while the pointer was over the target, so the browser's default action (e.g. opening a dropped file or link) is prevented,
      // even if the application doesn't create a tab
      event.preventDefault();

      const tab = getAcceptExternalDrop()?.createTab(dataTransfer, target);
      if (tab && !isNewTabDropDisabled(tab, target)) {
        onNewTabDrop(tab, target);
      }
    };

    // Elements only accept drops if both events are canceled;
    // drops are listened for during the capture phase too, so the indicator is hidden even if another element stops the event's propagation
    ownerDocument.addEventListener("dragenter", onDragOver);
    ownerDocument.addEventListener("dragover", onDragOver);
    ownerDocument.addEventListener("dragleave", onDragLeave);
    ownerDocument.addEventListener("drop", clear, true);
    ownerDocument.addEventListener("drop", onDrop);

    return () => {
      clear();
      ownerDocument.removeEventListener("dragenter", onDragOver);
      ownerDocument.removeEventListener("dragover", onDragOver);
      ownerDocument.removeEventListener("dragleave", onDragLeave);
      ownerDocument.removeEventListener("drop", clear, true);
      ownerDocument.removeEventListener("drop", onDrop);
    };
  }, [
    areDropsDisabled,
    dragStore,
    getAcceptExternalDrop,
    getModel,
    isEnabled,
    isNewTabDropDisabled,
    onNewTabDrop,
    rootElement,
    tabsetElements
  ]);

  return isExternalDragOver;
}
