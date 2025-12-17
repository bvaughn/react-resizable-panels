import type { GroupProps, PanelProps } from "react-resizable-panels";

export type Config = {
  groupProps?: Partial<GroupProps>;
  panelProps?: Partial<PanelProps>;
};

export type GroupJson = {
  type: "Group";
  children: (PanelJson | SeparatorJson)[];
  props: object;
};

export type PanelJson = {
  children?: GroupJson | undefined;
  type: "Panel";
  props: object;
};

export type SeparatorJson = {
  type: "Separator";
  props: object;
};
