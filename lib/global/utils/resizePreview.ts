import type { Layout } from "../../components/group/types";
import type { HitRegion } from "../dom/calculateHitRegions";
import {
  getMountedGroupState,
  updateMountedGroup
} from "../mutable-state/groups";
import { getInteractionState } from "../mutable-state/interactions";
import type { ResizePreview } from "../mutable-state/types";

export function getResizePreview(hit: HitRegion, initialLayout: Layout) {
  const state = getInteractionState();
  if (state.state !== "active") return;
  const existing = state.preview?.get(hit.group);
  if (existing) return existing;
  if (!hit.group.panels.some((panel) => panel.mode === "preview")) return;

  const { group, rect } = hit;
  const horizontal = group.orientation === "horizontal";
  const indicator = group.element.ownerDocument.createElement("div");
  indicator.setAttribute("data-resize-preview", "");
  indicator.setAttribute("aria-hidden", "true");
  Object.assign(indicator.style, {
    position: "fixed",
    inset: "auto",
    margin: "0",
    padding: "0",
    border: "0",
    left: `${horizontal ? rect.x + rect.width / 2 - 1 : rect.x}px`,
    top: `${horizontal ? rect.y : rect.y + rect.height / 2 - 1}px`,
    width: `${horizontal ? 2 : rect.width}px`,
    height: `${horizontal ? rect.height : 2}px`,
    background: "Highlight",
    pointerEvents: "none",
    zIndex: "2147483647",
    contain: "strict"
  });
  group.element.ownerDocument.body.appendChild(indicator);
  // The top layer keeps the indicator visible inside modal dialogs.
  if (indicator.showPopover) {
    indicator.popover = "manual";
    indicator.showPopover();
  }
  const preview = { layout: initialLayout, indicator };
  state.preview ??= new Map();
  state.preview.set(group, preview);
  // Disable content hit-testing on the first move, just as live resizing does.
  updateMountedGroup(group, getMountedGroupState(group.id, true));
  return preview;
}

export function updateResizePreview(
  preview: ResizePreview,
  hit: HitRegion,
  initial: Layout
) {
  const pivot = hit.group.panels.indexOf(hit.panels[0]);
  const delta =
    (hit.group.panels
      .slice(0, pivot + 1)
      .reduce(
        (sum, panel) => sum + preview.layout[panel.id] - initial[panel.id],
        0
      ) *
      hit.groupSize) /
    100;
  preview.indicator.style.transform =
    hit.group.orientation === "horizontal"
      ? `translateX(${delta}px)`
      : `translateY(${delta}px)`;
}
