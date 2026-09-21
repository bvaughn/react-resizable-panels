import type { Layout, RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredSeparator } from "../../components/separator/types";
import type { Point } from "../../types";
import type { HitRegion } from "../dom/calculateHitRegions";

export type InteractionInactive = {
  cursorFlags: 0;
  state: "inactive";
};

export type InteractionHover = {
  cursorFlags: 0;
  hitRegions: HitRegion[];
  state: "hover";
};

export type ResizePreview = {
  active: boolean;
  group: RegisteredGroup;
  key: string;
  offset: number;
  panelIndex: number;
  rect: DOMRect;
  separator?: RegisteredSeparator | undefined;
};

export type InteractionActive = {
  cursorFlags: number;
  didPointerMove: boolean;
  hitRegions: HitRegion[];
  initialLayoutMap: Map<RegisteredGroup, Layout>;
  pointerDownAtPoint: Point;
  previewLayoutMap: Map<RegisteredGroup, Layout>;
  previews: ResizePreview[];
  state: "active";
};

export type InteractionState =
  | InteractionInactive
  | InteractionHover
  | InteractionActive;

export type SeparatorToPanelsMap = Map<
  RegisteredSeparator,
  [primaryPanel: RegisteredPanel, secondaryPanel: RegisteredPanel]
>;
