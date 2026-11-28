import type {
  KeyboardMoveAnnouncementArgs,
  TabDropRegion,
  TabNode,
  TabsetNode
} from "../types";

type Args = Omit<KeyboardMoveAnnouncementArgs, "defaultAnnouncement">;

const SIDES: { [side in Exclude<TabDropRegion, "center">]: string } = {
  bottom: "Bottom",
  left: "Left",
  right: "Right",
  top: "Top"
};

/**
 * The (English) text announced for a step of moving a tab from the keyboard (see the Workspace's getKeyboardMoveAnnouncement prop).
 */
export function getDefaultKeyboardMoveAnnouncement({
  tab,
  target,
  targetCount,
  targetIndex,
  targetTabset,
  type
}: Args): string {
  const title = getTitle(tab);

  switch (type) {
    case "start": {
      return targetCount === 0
        ? `${title} can't be moved anywhere.`
        : `Moving ${title}. Use the arrow keys to choose where to move it, then press Enter to move it there, or Escape to cancel.`;
    }
    case "target": {
      return target
        ? `${describeTarget(target, targetTabset, tab)}, ${targetIndex + 1} of ${targetCount}`
        : "";
    }
    case "drop": {
      return target
        ? `Moved ${title}: ${lowerFirst(describeTarget(target, targetTabset, tab))}.`
        : `Moved ${title}.`;
    }
    case "cancel": {
      return `Canceled moving ${title}.`;
    }
  }
}

function describeTarget(
  target: NonNullable<Args["target"]>,
  tabset: TabsetNode | undefined,
  movedTab: TabNode
): string {
  if ("edge" in target) {
    return `${SIDES[target.edge]} edge of the workspace`;
  }

  const name = describeTabset(tabset, movedTab);
  if ("index" in target) {
    return `End of the collapsed ${name}`;
  }

  return target.region === "center"
    ? `Into the ${name}`
    : `${SIDES[target.region]} side of the ${name}`;
}

// Tabsets have no titles of their own, so they're named by their selected tabs
function describeTabset(tabset: TabsetNode | undefined, movedTab: TabNode) {
  if (!tabset) {
    return "tabset";
  }

  // The tab's own tabset (e.g. when splitting it) is named by another of its tabs, since it'd otherwise be named after the tab itself
  const tabs = tabset.tabs.filter(({ id }) => id !== movedTab.id);
  const named = tabs.find(({ id }) => id === tabset.selectedId) ?? tabs[0];
  if (!named) {
    return tabset.tabs.length === 0 ? "empty tabset" : "tabset";
  }

  return `tabset with ${getTitle(named)}`;
}

function getTitle(tab: TabNode) {
  return tab.title ?? tab.id;
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
