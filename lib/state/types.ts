import type { AriaAttributes } from "react";
import type { Layout } from "../components/group/types";
import type { SizeUnit } from "../components/panel/types";
import type { Dimensions, Rect } from "../types";
import type { EventListener } from "../utils/EventEmitter";

export type { PanelConstraints as ScaledPanelConstraints } from "../components/panel/types";

/**
 * Panel constraints as specified by the user via props;
 * Can be represented as pixels, percentages, and other supported units.
 * Values specified using CSS units other than percentages must be scaled to the Group's current dimensions.
 */
export type PanelConstraints = {
  collapsedSize: number | string | undefined;
  collapsible: boolean | undefined;
  maxSize: number | string | undefined;
  minSize: number | string | undefined;
};

/**
 * Map of Panel id to Flex styles;
 */
export type GroupLayout = Layout;

export type ScalePanelConstraintFunction = (
  size: number,
  unit: SizeUnit,
  groupSize: number
) => number;

export type SeparatorState = "default" | "hover" | "dragging";

export type SeparatorAriaAttributes = {
  ariaControls: AriaAttributes["aria-controls"];
  ariaValueMax: AriaAttributes["aria-valuemax"];
  ariaValueMin: AriaAttributes["aria-valuemin"];
  ariaValueNow: AriaAttributes["aria-valuenow"];
};

export interface HTMLElementInterface {
  getElementRect(): Rect;
  onResize(listener: EventListener<Rect>): () => void;
}

export interface GroupHTMLElementInterface extends HTMLElementInterface {
  getChildren(): HTMLElement[];
}

export interface PanelHTMLElementInterface extends HTMLElementInterface {
  getElementFontSize(): number;
  getRootFontSize(): number;
  getWindowSize(): Dimensions;
}

export interface SeparatorHTMLElementInterface extends HTMLElementInterface {
  focus(): void;
}

/**
 * Map of Panel id to the corresponding Selector(s) ARIA attributes;
 */
export type GroupAriaAttributes = {
  [id: string]: SeparatorAriaAttributes;
};
