import { EventEmitter } from "../../shared/utils/EventEmitter";
import type { DragNode, DragSource } from "../types";

/**
 * A drag (using HTML drag and drop) between workspaces with the same `dragGroup` prop.
 *
 * Workspaces in other windows (e.g. popups opened by the application) share this module, since they're rendered by the same application (with portals);
 * so the dragged tab is read from here, rather than from the drag's `DataTransfer` (which other pages could read).
 * Drags are shared with other pages from the same origin through a `BroadcastChannel` (see nativeDragChannel).
 */
export type NativeDrag = {
  dragGroup: string;

  /** Identifies the drag in messages between pages */
  id: string;

  /** Whether the dragged tab (or tabset) is still in its workspace; drags of sources removed during the drag (e.g. by the imperative API) can't be dropped */
  hasSource: () => boolean;

  /** Set when a workspace accepts the drop, since browsers don't report this consistently (e.g. by the `dragend` event's `dropEffect`) */
  isDropped: boolean;

  /** Set for drags that started in another page */
  isRemote: boolean;

  /** Set for drags that other pages know about (see nativeDragChannel) */
  isShared: boolean;

  /** The most recent event that a workspace accepted as a copy (see the copyTab prop), so that every workspace in its document can tell once it has been handled */
  lastCopyEvent: Event | undefined;

  /**
   * The document the pointer was over most recently; workspaces in other documents hide their drop indicators and drag previews.
   * `undefined` while the pointer is over another page.
   */
  lastDocument: Document | undefined;

  /** The most recent `dragover` event over any workspace in the group (used to tell whether the pointer left every window; see isNativeTearOff) */
  lastDragover:
    | { clientX: number; clientY: number; time: number; view: Window }
    | undefined;

  /** Distance (in pixels) the pointer moved between the last two `dragover` events */
  lastMoveStep: number;

  /** When another page last reported the pointer over it (used to tell whether the pointer left every window; see isNativeTearOff) */
  lastRemoteDragoverTime: number;

  /** The dragged tab (or tabset), as it was when the drag started */
  node: DragNode;

  /** The workspace that shows the drag preview within each document (see useTabDrag) */
  previewOwners: Map<Document, object>;

  /** Removes the dragged tab (or tabset) from its workspace (or page), once it has been dropped into another one */
  removeFromSource: () => void;

  source: DragSource;

  /** The `dragSourceInfo` prop of the workspace the drag started in (see DisableDropArgs.sourceInfo) */
  sourceInfo: unknown;

  sourceOwner: object;

  /** The id of the workspace the drag started in (`undefined` for a drag from a page that uses an earlier release) */
  sourceWorkspaceId: string | undefined;
};

let current: NativeDrag | null = null;

const eventEmitter = new EventEmitter<{ change: NativeDrag | null }>();

export function getNativeDrag() {
  return current;
}

export function setNativeDrag(next: NativeDrag | null) {
  if (current !== next) {
    current = next;
    eventEmitter.emit("change", next);
  }
}

// Called for each dragover event, so that workspaces in the document the pointer left can hide their drop indicators and drag previews
export function updateNativeDragDocument(
  drag: NativeDrag,
  document: Document | undefined
) {
  if (drag.lastDocument !== document) {
    drag.lastDocument = document;
    eventEmitter.emit("change", drag);
  }
}

export function subscribeToNativeDrag(
  callback: (drag: NativeDrag | null) => void
) {
  return eventEmitter.addListener("change", callback);
}
