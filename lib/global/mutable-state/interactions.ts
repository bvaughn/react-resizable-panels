import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredSeparator } from "../../components/separator/types";
import { EventEmitter } from "../../utils/EventEmitter";
import type {
  InteractionActive,
  InteractionState,
  ResizePreview
} from "./types";

let state: InteractionState = {
  cursorFlags: 0,
  state: "inactive"
};

type ChangeEvent = {
  next: InteractionState;
  prev: InteractionState;
};

const eventEmitter = new EventEmitter<{
  change: ChangeEvent;
}>();

export function getInteractionState() {
  return state;
}

export function subscribeToInteractionState(
  callback: (event: ChangeEvent) => void
) {
  return eventEmitter.addListener("change", callback);
}

export function updateCursorFlags(
  cursorFlags: number,
  previews: ResizePreview[] = [],
  previewLayoutMap?: InteractionActive["previewLayoutMap"]
) {
  const prev = state;

  const next = { ...state };
  next.cursorFlags = cursorFlags;
  if (next.state === "active") {
    next.previews = previews;
    if (previewLayoutMap) {
      next.previewLayoutMap = previewLayoutMap;
    }
  }

  state = next;

  eventEmitter.emit("change", {
    prev,
    next
  });
}

export function updateInteractionState(next: InteractionState) {
  const prev = state;

  state = next;

  eventEmitter.emit("change", {
    prev,
    next
  });
}

/**
 * The preview prop is read through a registered separator getter.
 * Notify after its layout effect has updated that getter, without re-registering the group.
 */
export function notifySeparatorPreviewChanged(separator: RegisteredSeparator) {
  if (
    state.state !== "active" ||
    !state.previews.some((preview) => preview.separator === separator)
  ) {
    return;
  }

  updateInteractionState({
    ...state,
    previews: state.previews.map((preview) =>
      preview.separator === separator ? { ...preview } : preview
    )
  });
}

export function removeGroupFromInteraction(group: RegisteredGroup) {
  if (state.state === "inactive") {
    return false;
  }

  const hitRegions = state.hitRegions.filter(
    (region) => region.group !== group
  );
  const hasPreviews =
    state.state === "active" &&
    state.previews.some((preview) => preview.group === group);
  if (hitRegions.length === state.hitRegions.length && !hasPreviews) {
    return false;
  }

  if (hitRegions.length === 0) {
    updateInteractionState({ cursorFlags: 0, state: "inactive" });
  } else if (state.state === "active") {
    const initialLayoutMap = new Map(state.initialLayoutMap);
    const previewLayoutMap = new Map(state.previewLayoutMap);
    initialLayoutMap.delete(group);
    previewLayoutMap.delete(group);

    updateInteractionState({
      ...state,
      cursorFlags: 0,
      hitRegions,
      initialLayoutMap,
      previewLayoutMap,
      previews: state.previews.filter((preview) => preview.group !== group)
    });
  } else {
    updateInteractionState({ ...state, hitRegions });
  }

  return true;
}
