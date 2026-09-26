import type {
  CellProps,
  GridProps,
  GridlineProps,
  GroupProps,
  PanelProps,
  SeparatorProps
} from "react-resizable-panels";
import type { ContainerProps } from "../../../src/components/Container";
import type { DialogProps } from "../../components/Dialog";
import type { DisplayModeToggleProps } from "../../../src/components/DisplayModeToggle";
import type { PopupWindowProps } from "../../../src/components/PopupWindow";
import type { ClickableProps } from "../../../src/components/Clickable";
import type { IFrameProps } from "../../components/IFrame";

type EncodedElementWithChildren<Props extends object = object> = Omit<
  Props,
  "children"
> & { children?: EncodedElement[] | undefined };

export interface EncodedCellElement {
  props: EncodedElementWithChildren<CellProps>;
  type: "Cell";
}

export interface EncodedClickableElement {
  props: EncodedElementWithChildren<ClickableProps>;
  type: "Clickable";
}

export interface EncodedContainerElement {
  props: EncodedElementWithChildren<ContainerProps>;
  type: "Container";
}

export interface EncodedDialogElement {
  props: EncodedElementWithChildren<DialogProps>;
  type: "Dialog";
}

export interface EncodedDisplayModeToggleElement {
  props: EncodedElementWithChildren<DisplayModeToggleProps>;
  type: "DisplayModeToggle";
}

export interface EncodedGridElement {
  props: EncodedElementWithChildren<GridProps>;
  type: "Grid";
}

// Omit that preserves union types (e.g. GridlineProps)
type DistributiveOmit<Type, Key extends PropertyKey> = Type extends unknown
  ? Omit<Type, Key>
  : never;

export interface EncodedGridlineElement {
  props: DistributiveOmit<GridlineProps, "children" | "elementRef">;
  type: "Gridline";
}

export interface EncodedGroupElement {
  props: EncodedElementWithChildren<GroupProps>;
  type: "Group";
}

export interface EncodedIFrameElement {
  props: IFrameProps;
  type: "IFrame";
}

export interface EncodedPanelElement {
  props: EncodedElementWithChildren<PanelProps>;
  type: "Panel";
}

export interface EncodedPopupWindowElement {
  props: EncodedElementWithChildren<PopupWindowProps>;
  type: "PopupWindow";
}

export interface EncodedSeparatorElement {
  props: SeparatorProps;
  type: "Separator";
}

export type TextProps = {
  children: string;
  className?: string | undefined;
};

export interface EncodedTextElement {
  props: TextProps;
  type: "Text";
}

export type EncodedElement =
  | EncodedCellElement
  | EncodedClickableElement
  | EncodedContainerElement
  | EncodedDialogElement
  | EncodedDisplayModeToggleElement
  | EncodedGridElement
  | EncodedGridlineElement
  | EncodedGroupElement
  | EncodedIFrameElement
  | EncodedPanelElement
  | EncodedPopupWindowElement
  | EncodedSeparatorElement
  | EncodedTextElement;
