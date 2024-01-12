import { PanelData } from "../../Panel";
import { getResizeHandleElement } from "./getResizeHandleElement";
import { getResizeHandleElementsForGroup } from "./getResizeHandleElementsForGroup";

export function getResizeHandlePanelIds(
  groupId: string,
  handleId: string,
  panelsArray: PanelData[],
  scope: ParentNode | HTMLElement = document
): [idBefore: string | null, idAfter: string | null] {
  const handle = getResizeHandleElement(handleId, scope);
  const handles = getResizeHandleElementsForGroup(groupId, scope);
  const index = handle ? handles.indexOf(handle) : -1;

  const idBefore: string | null = panelsArray[index]?.id ?? null;
  const idAfter: string | null = panelsArray[index + 1]?.id ?? null;

  return [idBefore, idAfter];
}
