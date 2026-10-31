import { EventEmitter } from "../../shared/utils/EventEmitter";
import type { ModelIndex } from "../models/indexModel";
import type { WorkspaceModel } from "../types";

/**
 * The parts of a Workspace's state that are exposed through hooks (e.g. `useParentTabState`).
 */
export type WorkspaceState = {
  activeTabsetId: string | undefined;
  disabled: boolean;
  model: WorkspaceModel;
  modelIndex: ModelIndex;
};

export type WorkspaceStore = {
  getState: () => WorkspaceState;
  // Notifies subscribers if the state has changed since they were last notified
  notify: () => void;
  // Updates the state without notifying subscribers (see notify)
  setState: (state: WorkspaceState) => void;
  subscribe: (listener: () => void) => () => void;
};

/**
 * Hooks subscribe to this store (rather than reading WorkspaceContext, which also changes while dragging)
 * so that they only re-render when the values they select change.
 *
 * ℹ️ The Workspace sets the state while rendering, so that components rendered in the same pass (e.g. the content of a new tab) read the latest state,
 * and notifies subscribers once it commits (so that components that didn't re-render are updated too).
 */
export function createWorkspaceStore(
  initialState: WorkspaceState
): WorkspaceStore {
  const eventEmitter = new EventEmitter<{ change: undefined }>();
  let notifiedState = initialState;
  let state = initialState;

  return {
    getState: () => state,
    notify: () => {
      if (notifiedState !== state) {
        notifiedState = state;
        eventEmitter.emit("change", undefined);
      }
    },
    setState: (next) => {
      state = next;
    },
    subscribe: (listener) => eventEmitter.addListener("change", listener)
  };
}
