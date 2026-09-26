import { calculateDefaultLayout } from "./calculateDefaultLayout";
import { validateLayoutKeys } from "./validateLayoutKeys";
import type {
  Layout,
  RegisteredResizeAxis,
  ResizeItemConstraints
} from "../types";

export function getDefaultLayout({
  axis,
  itemConstraints
}: {
  axis: RegisteredResizeAxis;
  itemConstraints: ResizeItemConstraints[];
}): Layout {
  const itemIdsKey = axis.items.map(({ id }) => id).join(",");
  const defaultLayout = axis.mutableState.defaultLayout;

  // Dynamic panel configurations can invalidate a supplied default layout.
  return (
    axis.mutableState.layouts[itemIdsKey] ??
    (defaultLayout && validateLayoutKeys(axis.items, defaultLayout)
      ? defaultLayout
      : calculateDefaultLayout(itemConstraints))
  );
}
