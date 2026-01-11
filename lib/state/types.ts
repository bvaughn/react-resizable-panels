/**
 * Map of Panel id to flexGrow value;
 */
export type GroupLayout = {
  [id: string]: number;
};

/**
 * Panel constraints; represented as pixels, percentages, and other supported units.
 * Values specified using other CSS units must be pre-converted.
 */
export type PanelConstraints = {
  collapsedSize: number | string;
  collapsible: boolean;
  maxSize: number | string;
  minSize: number | string;
  panelId: string;
};
