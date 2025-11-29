import type { Layout } from "../types";

/**
 * Stores layout(s) for a groups of panels, e.g.
 * ```
 * {
 *   "layouts: {
 *     "left,center,right": { "left": 30, "center": 50, "right": 20 },
 *     "center,right": { "center": 55, "right": 45 }
 *   },
 *   "mostRecentLayout": { "center": 55, "right": 45 }
 * }
 * ```
 *
 * Layouts are stored separately for different combinations of panels.
 * The most recently updated layout is also stored as "mostRecentLayout"
 * and will be the assumed layout for the group if it is server-rendered.
 */
export type SavedLayouts = {
  layouts: {
    [panelIds: string]: Layout;
  };
  mostRecentLayout?: Layout;
};
