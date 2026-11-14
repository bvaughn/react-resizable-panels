import type { DragNode, DragSource } from "../types";
import {
  getNativeDrag,
  setNativeDrag,
  subscribeToNativeDrag,
  updateNativeDragDocument,
  type NativeDrag
} from "./nativeDrag";

const CHANNEL_NAME = "react-resizable-panels-workspace";

// Pages using other versions of this library ignore each other's messages (since they may not be compatible)
const PROTOCOL_VERSION = 1;

// How often (in milliseconds) a page reports that the pointer is over it, while a shared drag is over it
const DRAGOVER_INTERVAL = 50;

// How long (in milliseconds) a drag can still be removed from its source after it ends,
// since the message from the page it was dropped into may arrive after the source's dragend event
const REMOVE_TIMEOUT = 5000;

type Message = { version: number } & (
  | {
      dragGroup: string;
      id: string;
      node: DragNode;
      source: DragSource;
      // Missing from pages that use an earlier release with the same protocol version
      sourceInfo?: unknown;
      sourceWorkspaceId?: string | undefined;
      type: "start";
    }
  | { id: string; type: "end" | "over" | "remove" }
);

let channel: BroadcastChannel | null = null;
let connections = 0;
let unsubscribeFromDrag: (() => void) | null = null;

// The drag that started in this page and was shared with other pages, while it's in progress
let activeDrag: NativeDrag | null = null;

// Drags that started in this page and were shared with other pages, until shortly after they end (see REMOVE_TIMEOUT)
const sharedDrags = new Map<string, NativeDrag>();

let lastDragoverPost = { id: "", time: 0 };

function post(message: Message) {
  try {
    channel?.postMessage(message);

    return channel !== null;
  } catch {
    // Data that can't be cloned (e.g. a function in a tab's data) can't be sent to other pages
    return false;
  }
}

function endActiveDrag() {
  if (activeDrag) {
    const { id } = activeDrag;
    activeDrag = null;

    post({ id, type: "end", version: PROTOCOL_VERSION });
    setTimeout(() => sharedDrags.delete(id), REMOVE_TIMEOUT);
  }
}

function onDragChange(drag: NativeDrag | null) {
  if (activeDrag && drag !== activeDrag) {
    endActiveDrag();
  }
}

function onMessage(event: MessageEvent) {
  const message = event.data as Message | undefined;
  if (message?.version !== PROTOCOL_VERSION) {
    return;
  }

  const current = getNativeDrag();
  switch (message.type) {
    case "start": {
      const { dragGroup, id, node, source, sourceInfo, sourceWorkspaceId } =
        message;
      setNativeDrag({
        dragGroup,
        hasSource: () => true,
        id,
        isDropped: false,
        isRemote: true,
        isShared: true,
        lastCopyEvent: undefined,
        lastDocument: undefined,
        lastDragover: undefined,
        lastMoveStep: 0,
        lastRemoteDragoverTime: Date.now(),
        node,
        previewOwners: new Map(),
        removeFromSource: () =>
          post({ id, type: "remove", version: PROTOCOL_VERSION }),
        source,
        sourceInfo,
        // Not the owner of any workspace in this page, so drops are handled as transfers from another workspace
        sourceOwner: {},
        sourceWorkspaceId
      });
      break;
    }
    case "over": {
      if (current?.id === message.id) {
        current.lastRemoteDragoverTime = Date.now();
        updateNativeDragDocument(current, undefined);
      }
      break;
    }
    case "remove": {
      const drag = sharedDrags.get(message.id);
      if (drag && !drag.isDropped) {
        drag.isDropped = true;
        if (current === drag) {
          setNativeDrag(null);
        }
        drag.removeFromSource();
      }
      break;
    }
    case "end": {
      if (current?.isRemote && current.id === message.id) {
        setNativeDrag(null);
      }
      break;
    }
  }
}

/**
 * Connects to the channel that shares drags (using HTML drag and drop) with workspaces in other pages from the same origin;
 * returns a function that disconnects (the channel is closed once every workspace has disconnected).
 */
export function connectNativeDragChannel() {
  if (typeof BroadcastChannel === "undefined") {
    return () => {};
  }

  if (connections++ === 0) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", onMessage);
    unsubscribeFromDrag = subscribeToNativeDrag(onDragChange);
  }

  let isConnected = true;

  return () => {
    if (isConnected) {
      isConnected = false;

      if (--connections === 0) {
        channel?.close();
        channel = null;
        unsubscribeFromDrag?.();
        unsubscribeFromDrag = null;
      }
    }
  };
}

/**
 * Shares a drag that started in this page with other pages (before it's set as the current drag);
 * returns `false` if it couldn't be shared (e.g. its tab's data can't be cloned), in which case it stays within this page.
 */
export function shareNativeDrag(drag: NativeDrag) {
  endActiveDrag();

  const { dragGroup, id, node, source, sourceInfo, sourceWorkspaceId } = drag;
  if (
    !post({
      dragGroup,
      id,
      node,
      source,
      sourceInfo,
      sourceWorkspaceId,
      type: "start",
      version: PROTOCOL_VERSION
    })
  ) {
    return false;
  }

  drag.isShared = true;
  activeDrag = drag;
  sharedDrags.set(id, drag);

  return true;
}

/**
 * Tells other pages that the pointer is over this one (so they hide their drop indicators and drag previews, and the source doesn't tear off the drag).
 */
export function reportNativeDragover(drag: NativeDrag) {
  const now = Date.now();
  if (
    drag.isShared &&
    (lastDragoverPost.id !== drag.id ||
      now - lastDragoverPost.time >= DRAGOVER_INTERVAL)
  ) {
    lastDragoverPost = { id: drag.id, time: now };
    post({ id: drag.id, type: "over", version: PROTOCOL_VERSION });
  }
}
