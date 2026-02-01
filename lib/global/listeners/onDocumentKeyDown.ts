import { adjustLayoutForSeparator } from "../../utils/adjustLayoutForSeparator";
import { assert } from "../../utils/assert";
import { findHitRegionForSeparatorElement } from "../../utils/findHitRegionForSeparatorElement";
import { findSeparatorForElement } from "../../utils/findSeparatorForElement";

export function onDocumentKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const separatorElement = event.currentTarget as HTMLElement;

  const separator = findSeparatorForElement(separatorElement);
  const group = separator.group;
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

      const hitRegion = findHitRegionForSeparatorElement(separatorElement);

      const primaryPanel = hitRegion.panels[0];
      if (primaryPanel.collapsible) {
        const prevSize = group.layout[primaryPanel.id];

        // TODO [mutable] This isn't quite right; minSize should be the previous, pre-collapsed size
        const nextSize =
          primaryPanel.collapsedSize === prevSize
            ? primaryPanel.minSize
            : primaryPanel.collapsedSize;

        adjustLayoutForSeparator(separatorElement, nextSize - prevSize);
      }
      break;
    }
    case "F6": {
      event.preventDefault();

      // Cycle through window panes.

      const index = group.separators.findIndex(
        (separator) => separator.id === separatorElement.id
      );
      assert(index !== null, "Index not found");

      const nextIndex = event.shiftKey
        ? index > 0
          ? index - 1
          : group.separators.length - 1
        : index + 1 < group.separators.length
          ? index + 1
          : 0;

      const nextSeparator = group.separators[nextIndex];
      nextSeparator.elementInterface.focus();
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
