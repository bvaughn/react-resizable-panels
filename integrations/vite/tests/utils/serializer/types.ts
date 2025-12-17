import type { GroupProps, PanelProps } from "react-resizable-panels";

export type Config = {
  groupProps?: Partial<GroupProps>;
  panelProps?: Partial<PanelProps>;
};

export type GroupJson = {
  children: (PanelJson | SeparatorJson)[];
  className?: string;
  props: object;
  type: "Group";
};

export type PanelJson = {
  children?: GroupJson | undefined;
  className?: string;
  props: object;
  type: "Panel";
};

export type SeparatorJson = {
  className?: string;
  props: object;
  type: "Separator";
};
