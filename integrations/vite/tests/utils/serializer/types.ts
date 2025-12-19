import type { GroupProps, PanelProps } from "react-resizable-panels";

export type Config = {
  groupProps?: Partial<GroupProps>;
  panelProps?: Partial<PanelProps>;
};

export type GroupJson = {
  children: (PanelJson | SeparatorJson | TextJson)[];
  props: object;
  type: "Group";
};

export type PanelJson = {
  children?: GroupJson | undefined;
  props: object;
  type: "Panel";
};

export type SeparatorJson = {
  props: object;
  type: "Separator";
};

export type TextJson = {
  props: {
    className?: string;
    children: string;
  };
  type: "Text";
};
