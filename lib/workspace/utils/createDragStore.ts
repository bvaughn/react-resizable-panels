import { EventEmitter } from "../../shared/utils/EventEmitter";
import type { DragSource, TabDropTarget } from "../types";
import { isSameDropTarget } from "./isSameDropTarget";

export type DragState = {
  dragSource: DragSource | undefined;
  dropTarget: TabDropTarget | undefined;
};

export type DragStore = {
  getState: () => DragState;
  setDragSource: (dragSource: DragSource | undefined) => void;
  setDropTarget: (dropTarget: TabDropTarget | undefined) => void;
  subscribe: (listener: () => void) => () => void;
};

/**
 * The tab (or tabset) being dragged, and where it would be dropped.
 *
 * ℹ️ This state changes often during a drag, so it's kept out of WorkspaceContext (which every part of the workspace reads);
 * only the components that show it subscribe to it (see useDragState), and only re-render when what they show changes.
 */
export function createDragStore(): DragStore {
  const eventEmitter = new EventEmitter<{ change: undefined }>();
  let state: DragState = { dragSource: undefined, dropTarget: undefined };

  return {
    getState: () => state,
    setDragSource: (dragSource) => {
      if (state.dragSource !== dragSource) {
        state = { ...state, dragSource };
        eventEmitter.emit("change", undefined);
      }
    },
    setDropTarget: (dropTarget) => {
      if (!isSameDropTarget(state.dropTarget, dropTarget)) {
        state = { ...state, dropTarget };
        eventEmitter.emit("change", undefined);
      }
    },
    subscribe: (listener) => eventEmitter.addListener("change", listener)
  };
}
