import type { Layout, RegisteredGroup } from "../../components/group/types";
import type { MountedGroup } from "../mutableState";
import { read, update } from "../mutableState";
import { formatLayoutNumber } from "./formatLayoutNumber";
import { layoutsEqual } from "./layoutsEqual";

const SMOOTHING_EPSILON = 0.01;
const scheduleAnimationFrame =
  typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : (callback: FrameRequestCallback) => setTimeout(callback, 16);

type LayoutSmoothingResult = {
  layout: Layout;
  isAtTarget: boolean;
};

export function getNextGroupLayoutState({
  group,
  current,
  layoutTarget
}: {
  group: RegisteredGroup;
  current: MountedGroup;
  layoutTarget: Layout;
}): {
  next: MountedGroup;
  didChange: boolean;
  shouldSchedule: boolean;
} {
  const prevLayoutTarget = current.layoutTarget ?? current.layout;
  const smoothing = group.resizeSmoothing ?? 0;
  const nextLayout = smoothing > 0 ? current.layout : layoutTarget;
  const targetChanged = !layoutsEqual(prevLayoutTarget, layoutTarget);
  const layoutChanged = !layoutsEqual(current.layout, nextLayout);
  const shouldSchedule =
    smoothing > 0 && !layoutsEqual(nextLayout, layoutTarget);

  if (!targetChanged && !layoutChanged) {
    return {
      next: current,
      didChange: false,
      shouldSchedule
    };
  }

  return {
    next: {
      ...current,
      layout: nextLayout,
      layoutTarget
    },
    didChange: true,
    shouldSchedule
  };
}

let animationFrameId: number | null = null;

export function scheduleLayoutSmoothing() {
  if (animationFrameId !== null) {
    return;
  }

  animationFrameId = scheduleAnimationFrame(runLayoutSmoothing);
}

function runLayoutSmoothing() {
  animationFrameId = null;

  const { mountedGroups } = read();

  let needsAnotherFrame = false;
  let didChange = false;
  let nextMountedGroups = mountedGroups;

  mountedGroups.forEach((value, group) => {
    const smoothing = group.resizeSmoothing ?? 0;
    const layoutTarget = value.layoutTarget ?? value.layout;

    if (smoothing <= 0) {
      if (!layoutsEqual(value.layout, layoutTarget)) {
        if (nextMountedGroups === mountedGroups) {
          nextMountedGroups = new Map(mountedGroups);
        }
        nextMountedGroups.set(group, {
          ...value,
          layout: layoutTarget,
          layoutTarget
        });
        didChange = true;
      }
      return;
    }

    if (layoutsEqual(value.layout, layoutTarget)) {
      return;
    }

    const { layout: nextLayout, isAtTarget } = getSmoothedLayout({
      currentLayout: value.layout,
      targetLayout: layoutTarget,
      smoothing
    });

    if (nextMountedGroups === mountedGroups) {
      nextMountedGroups = new Map(mountedGroups);
    }

    nextMountedGroups.set(group, {
      ...value,
      layout: isAtTarget ? layoutTarget : nextLayout,
      layoutTarget
    });

    didChange = true;
    if (!isAtTarget) {
      needsAnotherFrame = true;
    }
  });

  if (didChange) {
    update({
      mountedGroups: nextMountedGroups
    });
  }

  if (needsAnotherFrame) {
    scheduleLayoutSmoothing();
  }
}

function getSmoothedLayout({
  currentLayout,
  targetLayout,
  smoothing
}: {
  currentLayout: Layout;
  targetLayout: Layout;
  smoothing: number;
}): LayoutSmoothingResult {
  let isAtTarget = true;
  const nextLayout: Layout = {};

  for (const panelId in targetLayout) {
    const currentValue = currentLayout[panelId] ?? targetLayout[panelId];
    const targetValue = targetLayout[panelId];
    const delta = targetValue - currentValue;

    if (Math.abs(delta) <= SMOOTHING_EPSILON) {
      nextLayout[panelId] = targetValue;
      continue;
    }

    isAtTarget = false;

    const nextValue = currentValue + smoothing * delta;
    const formatted = formatLayoutNumber(nextValue);
    nextLayout[panelId] = formatted === currentValue ? targetValue : formatted;
  }

  if (isAtTarget) {
    return { layout: targetLayout, isAtTarget: true };
  }

  return {
    layout: nextLayout,
    isAtTarget: layoutsEqual(nextLayout, targetLayout)
  };
}
