import { EventEmitter } from "../../utils/EventEmitter";
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

  eventEmitter.emit("axisChange", {
    axis,
    isUserInteraction: meta?.isUserInteraction === true,
    prev,
    next
  });
}
