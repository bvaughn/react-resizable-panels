import type { Point } from "../../types";
import type {
  HitRegion,
  Layout,
  RegisteredResizeAxis,
  RegisteredResizeItem,
  RegisteredSeparator
} from "../types";

export type InteractionInactive = {
  cursorFlags: 0;
  state: "inactive";
};

export type InteractionHover = {
  cursorFlags: 0;
  hitRegions: HitRegion[];
  ownerDocument: Document;
  state: "hover";
};

export type ResizePreview = {
  active: boolean;
  axis: RegisteredResizeAxis;
  key: string;
  offset: number;
  itemIndex: number;
  rect: DOMRect;
  separator?: RegisteredSeparator | undefined;
};

export type InteractionActive = {
  cursorFlags: number;
  didPointerMove: boolean;
  hitRegions: HitRegion[];
  initialLayoutMap: Map<RegisteredResizeAxis, Layout>;
  ownerDocument: Document;
  pointerDownAtPoint: Point;
  pointerId: number;
  pointerType: string;
  previewLayoutMap: Map<RegisteredResizeAxis, Layout>;
  previews: ResizePreview[];
  state: "active";
};

export type InteractionState =
  | InteractionInactive
  | InteractionHover
  | InteractionActive;

export type SeparatorToItemsMap = Map<
  RegisteredSeparator,
  [primaryItem: RegisteredResizeItem, secondaryItem: RegisteredResizeItem]
>;
