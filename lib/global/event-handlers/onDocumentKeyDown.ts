import { assert } from "../../utils/assert";
import { getMountedGroupState } from "../mutable-state/groups";
import { adjustLayoutForSeparator } from "../utils/adjustLayoutForSeparator";
import { findSeparatorGroup } from "../utils/findSeparatorGroup";

export function onDocumentKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const separatorElement = event.currentTarget as HTMLElement;

  const group = findSeparatorGroup(separatorElement);
  if (group.disabled) {
    return;
  }

  switch (event.key) {
    case "ArrowDown": {
      event.preventDefault();

      if (group.orientation === "vertical") {
        adjustLayoutForSeparator(separatorElement, 5);
      }
      break;
    }
    case "ArrowLeft": {
      event.preventDefault();

      if (group.orientation === "horizontal") {
        adjustLayoutForSeparator(separatorElement, -5);
      }
      break;
    }
    case "ArrowRight": {
      event.preventDefault();

      if (group.orientation === "horizontal") {
        adjustLayoutForSeparator(separatorElement, 5);
      }
      break;
    }
    case "ArrowUp": {
      event.preventDefault();

      if (group.orientation === "vertical") {
        adjustLayoutForSeparator(separatorElement, -5);
      }
      break;
    }
    case "End": {
      event.preventDefault();

      // Moves splitter to the position that gives the primary pane its largest allowed size.
      // This may completely collapse the secondary pane.

      adjustLayoutForSeparator(separatorElement, 100);
      break;
    }
    case "Enter": {
      event.preventDefault();

      // If the primary pane is not collapsed, collapses the pane.
      // If the pane is collapsed, restores the splitter to its previous position.

      const group = findSeparatorGroup(separatorElement);

      const groupState = getMountedGroupState(group.id, true);
      const { derivedPanelConstraints, layout, separatorToPanels } = groupState;

      const separator = group.separators.find(
        (current) => current.element === separatorElement
      );
      assert(separator, "Matching separator not found");

      const panels = separatorToPanels.get(separator);
      assert(panels, "Matching panels not found");

      const primaryPanel = panels[0];
      const constraints = derivedPanelConstraints.find(
        (current) => current.panelId === primaryPanel.id
      );
      assert(constraints, "Panel metadata not found");

      if (constraints.collapsible) {
        const prevSize = layout[primaryPanel.id];

        const nextSize =
          constraints.collapsedSize === prevSize
            ? (group.mutableState.expandedPanelSizes[primaryPanel.id] ??
              constraints.minSize)
            : constraints.collapsedSize;

        adjustLayoutForSeparator(separatorElement, nextSize - prevSize);
      }
      break;
    }
    case "F6": {
      event.preventDefault();

      // Cycle through window panes.

      const group = findSeparatorGroup(separatorElement);

      const separatorElements = group.separators.map(
        (separator) => separator.element
      );

      const index = Array.from(separatorElements).findIndex(
        (current) => current === event.currentTarget
      );
      assert(index !== null, "Index not found");

      const nextIndex = event.shiftKey
        ? index > 0
          ? index - 1
          : separatorElements.length - 1
        : index + 1 < separatorElements.length
          ? index + 1
          : 0;

      const nextSeparatorElement = separatorElements[nextIndex] as HTMLElement;
      nextSeparatorElement.focus();
      break;
    }
    case "Home": {
      event.preventDefault();

      // Moves splitter to the position that gives the primary pane its smallest allowed size.
      // This may completely collapse the primary pane.

      adjustLayoutForSeparator(separatorElement, -100);
      break;
    }
  }
}
