import type {
  GroupProps,
  PanelProps,
  SeparatorProps
} from "react-resizable-panels";

type EncodedElementWithChildren<Props extends object = object> = Omit<
  Props,
  "children"
> & { children?: EncodedElement[] | undefined };

export interface EncodedGroupElement {
  props: EncodedElementWithChildren<GroupProps>;
  type: "Group";
}

export interface EncodedPanelElement {
  props: EncodedElementWithChildren<PanelProps>;
  type: "Panel";
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
  | EncodedGroupElement
  | EncodedPanelElement
  | EncodedSeparatorElement
  | EncodedTextElement;
