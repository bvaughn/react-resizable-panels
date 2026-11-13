import { calculateDefaultLayout } from "./calculateDefaultLayout";
import { validateLayoutKeys } from "./validateLayoutKeys";
import type {
  Layout,
  RegisteredResizeAxis,
  ResizeItemConstraints
} from "../types";

export function getDefaultLayout({
  axis,
  axisSize,
  itemConstraints
}: {
  axis: RegisteredResizeAxis;
  axisSize: number;
  itemConstraints: ResizeItemConstraints[];
}): { axisSize: number; layout: Layout } {
  const itemIdsKey = axis.items.map(({ id }) => id).join(",");
  const cached = axis.mutableState.layouts[itemIdsKey];
  if (cached) {
    // A resize behavior change has always applied the cached percentages at the current size.
    // Only restore the old pixel-size basis while the resize behaviors are unchanged.
    const resizeBehaviorsMatch = cached.resizeBehaviors.every(
      (behavior, index) =>
        behavior ===
        (axis.items[index].constraintProps.groupResizeBehavior ??
          "preserve-relative-size")
    );
    return {
      axisSize: resizeBehaviorsMatch ? cached.axisSize : axisSize,
      layout: cached.layout
    };
  }

  const defaultLayout = axis.mutableState.defaultLayout;

  // Dynamic panel configurations can invalidate a supplied default layout.
  return {
    axisSize,
    layout:
      defaultLayout && validateLayoutKeys(axis.items, defaultLayout)
        ? defaultLayout
        : calculateDefaultLayout(itemConstraints)
  };
}
