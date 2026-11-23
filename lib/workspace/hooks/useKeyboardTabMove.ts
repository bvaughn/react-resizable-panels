import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useStableCallback } from "../../shared/hooks/useStableCallback";
import { getModelIndex } from "../models/getModelIndex";
import type {
  DragSource,
  KeyboardMoveAnnouncement,
  TabDropTarget,
  WorkspaceModel
} from "../types";
import type { DragStore } from "../utils/createDragStore";
import type { TabsetElementRegistry } from "../utils/createTabsetElementRegistry";
import { getKeyboardDropTargets } from "../utils/getKeyboardDropTargets";
import { isRightToLeft } from "../utils/isRightToLeft";

export function useKeyboardTabMove({
  dragStore,
  enabled,
  getAnnouncement,
  getModel,
  isDropDisabled,
  model,
  moveTab,
  requestFocus,
  rootElement,
  tabsetElements
}: {
  dragStore: DragStore;
  enabled: boolean;
  getAnnouncement: (event: KeyboardMoveAnnouncement) => string | undefined;
  getModel: () => WorkspaceModel;
  isDropDisabled: (
    source: DragSource,
    target: TabDropTarget,
    isCopy: boolean
  ) => boolean;
  model: WorkspaceModel;
  moveTab: (tabId: string, target: TabDropTarget) => boolean;
  requestFocus: (tabId: string) => void;
  rootElement: HTMLElement | null;
  tabsetElements: TabsetElementRegistry;
}) {
  const [announcement, setAnnouncement] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const cancelRef = useRef<(() => void) | undefined>(undefined);

  const announce = useStableCallback((event: KeyboardMoveAnnouncement) => {
    setAnnouncement(getAnnouncement(event) ?? describeMove(event));
  });

  const startKeyboardMove = useStableCallback(
    (tabId: string, element: HTMLElement) => {
      const tab = getModelIndex(getModel()).tabsById.get(tabId);
      if (
        !enabled ||
        !tab ||
        tab.disableDrag ||
        dragStore.getState().dragSource
      )
        return false;

      const source: DragSource = { tabId, type: "tab" };
      const targets = getKeyboardDropTargets(
        getModel(),
        tabId,
        tabsetElements,
        isRightToLeft(rootElement)
      ).filter((target) => !isDropDisabled(source, target, false));
      if (targets.length === 0) return false;

      const document = element.ownerDocument;
      const window = document.defaultView;
      let index = 0;
      dragStore.setDragSource(source);
      dragStore.setDropTarget(targets[index]);
      setIsMoving(true);
      announce({ phase: "start", tab, target: targets[index] });

      const finish = (commit: boolean) => {
        cancelRef.current = undefined;
        document.removeEventListener("keydown", onKeyDown, true);
        document.removeEventListener("pointerdown", cancel, true);
        document.removeEventListener("focusin", onFocusIn);
        window?.removeEventListener("blur", cancel);
        dragStore.setDropTarget(undefined);
        dragStore.setDragSource(undefined);
        setIsMoving(false);
        const target = targets[index];
        const currentTab = getModelIndex(getModel()).tabsById.get(tabId);
        const moved =
          commit &&
          enabled &&
          currentTab &&
          !currentTab.disableDrag &&
          !isDropDisabled(source, target, false) &&
          moveTab(tabId, target);
        if (moved) requestFocus(tabId);
        announce({
          phase: moved ? "move" : commit ? "blocked" : "cancel",
          tab,
          target
        });
      };
      const cancel = () => finish(false);
      const onFocusIn = (event: FocusEvent) => {
        if (event.target !== element) cancel();
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === "Escape" ||
          ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "m")
        ) {
          event.preventDefault();
          event.stopPropagation();
          if (event.key === "Escape" || !event.repeat) cancel();
        } else if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          finish(true);
        } else if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
            event.key
          )
        ) {
          event.preventDefault();
          event.stopPropagation();
          const delta =
            event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
          index = (index + delta + targets.length) % targets.length;
          dragStore.setDropTarget(targets[index]);
          announce({ phase: "target", tab, target: targets[index] });
        } else if (event.key === "Tab") {
          cancel();
        } else if (
          [
            " ",
            "Delete",
            "Backspace",
            "Home",
            "End",
            "PageUp",
            "PageDown"
          ].includes(event.key)
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      cancelRef.current = cancel;
      document.addEventListener("keydown", onKeyDown, true);
      document.addEventListener("pointerdown", cancel, true);
      document.addEventListener("focusin", onFocusIn);
      window?.addEventListener("blur", cancel);
      return true;
    }
  );

  // A changed model or permission invalidates the destinations chosen at pickup.
  useIsomorphicLayoutEffect(() => {
    cancelRef.current?.();
  }, [model, enabled]);
  useEffect(() => () => cancelRef.current?.(), []);

  return { announcement, isMoving, startKeyboardMove };
}

function describeMove({ phase, tab, target }: KeyboardMoveAnnouncement) {
  const name = tab.title ?? tab.id;
  if (phase === "cancel") return `Cancelled moving ${name}.`;
  if (phase === "blocked") return `Could not move ${name}.`;
  const destination =
    "edge" in target
      ? `${target.edge} edge of workspace`
      : "region" in target
        ? `${target.region} of tabset ${target.tabsetId}`
        : `position ${target.index + 1} in tabset ${target.tabsetId}`;
  if (phase === "move") return `Moved ${name} to ${destination}.`;
  return `Moving ${name} to ${destination}. Use arrow keys to choose a destination, Enter to move, or Escape to cancel.`;
}
