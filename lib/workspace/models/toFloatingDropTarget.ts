import { isFloatingTabset } from "./isFloatingTabset";
import type {
  TabDropTarget,
  TabsetNode,
  WorkspaceDropEdge,
  WorkspaceModel
} from "../types";

type TabsetDropTarget = Exclude<TabDropTarget, { edge: WorkspaceDropEdge }>;

// Floating tabsets can't be split, so their edge regions add to them instead (like their centers)
export function toFloatingDropTarget<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  destination: TabsetNode<TabData, TabsetData>,
  target: TabsetDropTarget
): TabsetDropTarget {
  return "region" in target &&
    target.region !== "center" &&
    isFloatingTabset(model, destination)
    ? { region: "center", tabsetId: target.tabsetId }
    : target;
}
