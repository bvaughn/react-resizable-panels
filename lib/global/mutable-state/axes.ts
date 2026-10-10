import { EventEmitter } from "../../utils/EventEmitter";
import type { CaughtError } from "../../utils/CaughtError";
import type {
  Layout,
  RegisteredResizeAxis,
  ResizeItemConstraints
} from "../types";
import type { SeparatorToItemsMap } from "./types";

type State = {
  defaultLayoutDeferred: boolean;
  derivedItemConstraints: ResizeItemConstraints[];
  axisSize: number;
  layout: Layout;

  /**
   * Layout most recently requested by the user or application (e.g. default layout, pointer or keyboard resize, imperative API).
   * When the axis is resized, `layout` is re-derived from this value so that constraints don't permanently alter it.
   * See #720.
   */
  requestedLayout: Layout;

  /**
   * Axis size (in pixels) when the requested layout was recorded; used for `preserve-pixel-size` items.
   */
  requestedAxisSize: number;

  separatorToItems: SeparatorToItemsMap;
};

export type MountedAxes = Map<RegisteredResizeAxis, State>;

let map: MountedAxes = new Map();

type AxisChangeEvent = {
  axis: RegisteredResizeAxis;
  // True if the change was triggered by a pointer or keyboard event handler
  // False for other types of resize (constraint recompute, default-size change, imperative API, etc.).
  isUserInteraction: boolean;
  next: State;
  prev: State | undefined;
};
type AxesChangeEvent = {
  next: MountedAxes;
  prev: MountedAxes;
};

const eventEmitter = new EventEmitter<{
  axisChange: AxisChangeEvent;
  axesChange: AxesChangeEvent;
}>();

// Change events dispatched while a batch is open are queued rather than emitted,
// so that listeners (which call user callbacks) can't interrupt a multi-axis update part way through
let batchDepth = 0;
const batchedEvents: AxisChangeEvent[] = [];
let batchedError: CaughtError | undefined;

/**
 * Queues axis change events until the matching endAxisChangeBatch() call.
 * Every call must be paired with endAxisChangeBatch() (in a finally block).
 */
export function startAxisChangeBatch() {
  batchDepth++;
}

/**
 * Emits queued axis change events (e.g. before interaction state changes in a way listeners would observe).
 * Errors thrown by listeners are deferred until the outermost batch ends.
 */
export function flushAxisChangeBatch() {
  // Listeners may update axes, which appends more events while iterating
  for (let i = 0; i < batchedEvents.length; i++) {
    try {
      eventEmitter.emit("axisChange", batchedEvents[i]);
    } catch (error) {
      batchedError ??= { error };
    }
  }
  batchedEvents.length = 0;
}

/**
 * Closes a batch opened by startAxisChangeBatch().
 * When the outermost batch ends, queued events are emitted and the first error thrown by a listener (if any) is re-thrown.
 */
export function endAxisChangeBatch() {
  if (batchDepth === 1) {
    // Flush while the batch is still open so that updates made by listeners are queued (and their errors deferred)
    flushAxisChangeBatch();
  }

  batchDepth--;

  if (batchDepth === 0 && batchedError) {
    const { error } = batchedError;
    batchedError = undefined;
    throw error;
  }
}

export function deleteMutableAxis(axis: RegisteredResizeAxis) {
  map = new Map(map);
  map.delete(axis);
}

export function getRegisteredAxis(
  axisId: string
): RegisteredResizeAxis | undefined;
export function getRegisteredAxis(
  axisId: string,
  assert: true
): RegisteredResizeAxis;
export function getRegisteredAxis(axisId: string, assert?: boolean) {
  for (const [axis] of map) {
    if (axis.id === axisId) {
      return axis;
    }
  }

  if (assert) {
    throw Error(`Could not find data for Group with id ${axisId}`);
  }

  return undefined;
}

export function getMountedAxisState(axisId: string): State | undefined;
export function getMountedAxisState(axisId: string, assert: true): State;
export function getMountedAxisState(axisId: string, assert?: boolean) {
  for (const [axis, mountedAxis] of map) {
    if (axis.id === axisId) {
      return mountedAxis;
    }
  }

  if (assert) {
    throw Error(`Could not find data for Group with id ${axisId}`);
  }

  return undefined;
}

export function getMountedAxes() {
  return map;
}

export function subscribeToMountedAxis(
  axisId: string,
  callback: (event: AxisChangeEvent) => void
) {
  return eventEmitter.addListener("axisChange", (event) => {
    if (event.axis.id === axisId) {
      callback(event);
    }
  });
}

export function updateMountedAxis(
  axis: RegisteredResizeAxis,
  next: State,
  meta?: { isUserInteraction?: boolean }
) {
  const prev = map.get(axis);

  map = new Map(map);
  map.set(axis, next);

  const event: AxisChangeEvent = {
    axis,
    isUserInteraction: meta?.isUserInteraction === true,
    prev,
    next
  };

  if (batchDepth > 0) {
    batchedEvents.push(event);
  } else {
    eventEmitter.emit("axisChange", event);
  }
}
