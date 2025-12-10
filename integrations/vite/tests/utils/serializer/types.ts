export type GroupJson = {
  type: "Group";
  children: (PanelJson | SeparatorJson)[];
  props: object;
};

export type PanelJson = {
  type: "Panel";
  props: object;
};

export type SeparatorJson = {
  type: "Separator";
  props: object;
};
