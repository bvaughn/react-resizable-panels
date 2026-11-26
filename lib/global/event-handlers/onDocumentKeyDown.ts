import { assert } from "../../shared/utils/assert";
import { getMountedAxisState } from "../mutable-state/axes";
import { adjustLayoutForSeparator } from "../utils/adjustLayoutForSeparator";
import { findSeparatorAxis } from "../utils/findSeparatorAxis";
import { getEnabledSeparators } from "../utils/getEnabledSeparators";
import { getExpandedItemSize } from "../utils/getExpandedItemSize";
import { getMinimumExpandedSize } from "../utils/getMinimumExpandedSize";
import { getKeyboardEdgeDelta } from "../utils/getKeyboardEdgeDelta";
import { getKeyboardStepDelta } from "../utils/getKeyboardStepDelta";

export function onDocumentKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const separatorElement = event.currentTarget as HTMLElement;

  const axis = findSeparatorAxis(separatorElement);
  if (axis.disabled) {
    return;
  }

  // findSeparatorAxis guarantees that a matching separator exists
  const separator = axis.separators.find(
    (current) => current.element === separatorElement
  );
  assert(separator, "Matching separator not found");
  if (separator.disabled) {
    return;
  }

  const adjustLayout = (delta: number) =>
    adjustLayoutForSeparator({
      axis,
      axisState: getMountedAxisState(axis.id, true),
      delta,
      separator
    });

  // Arrow keys move the separator to the next snap size (if there is one)
  const step = (direction: -1 | 1) => {
    const delta = getKeyboardStepDelta({
      axis,
      axisState: getMountedAxisState(axis.id, true),
      direction,
      separator
    });
    if (delta !== undefined) {
      adjustLayout(delta);
    }
  };

  // Home/End move the separator to the furthest snap size (if there is one)
  const edge = (direction: -1 | 1) => {
    const delta = getKeyboardEdgeDelta({
      axis,
      axisState: getMountedAxisState(axis.id, true),
      direction,
      separator
    });
    if (delta !== undefined) {
      adjustLayout(delta);
    }
  };

  switch (event.key) {
    case "ArrowDown": {
      event.preventDefault();

      if (axis.orientation === "vertical") {
        step(1);
      }
      break;
    }
    case "ArrowLeft": {
      event.preventDefault();

      if (axis.orientation === "horizontal") {
        step(-1);
      }
      break;
    }
    case "ArrowRight": {
      event.preventDefault();

      if (axis.orientation === "horizontal") {
        step(1);
      }
      break;
    }
    case "ArrowUp": {
      event.preventDefault();

      if (axis.orientation === "vertical") {
        step(-1);
      }
      break;
    }
    case "End": {
      event.preventDefault();

      // Moves splitter to the position that gives the primary pane its largest allowed size.
      // This may completely collapse the secondary pane.

      edge(1);
      break;
    }
    case "Enter": {
      event.preventDefault();

      // If the primary pane is not collapsed, collapses the pane.
      // If the pane is collapsed, restores the splitter to its previous position.

      const axisState = getMountedAxisState(axis.id, true);
      const { derivedItemConstraints, layout, separatorToItems } = axisState;

      const items = separatorToItems.get(separator);
      assert(items, "Matching panels not found");

      const primaryItem = items[0];
      const constraints = derivedItemConstraints.find(
        (current) => current.itemId === primaryItem.id
      );
      assert(constraints, "Panel metadata not found");

      if (constraints.collapsible) {
        const prevSize = layout[primaryItem.id];
        const expanded = axis.mutableState.expandedItemSizes[primaryItem.id];

        const nextSize =
          constraints.collapsedSize === prevSize
            ? expanded
              ? getExpandedItemSize({
                  axisSize: axisState.axisSize,
                  expanded,
                  groupResizeBehavior:
                    primaryItem.constraintProps.groupResizeBehavior
                })
              : getMinimumExpandedSize(constraints)
            : constraints.collapsedSize;

        adjustLayoutForSeparator({
          axis,
          axisState,
          delta: nextSize - prevSize,
          separator
        });
      }
      break;
    }
    case "F6": {
      event.preventDefault();

      // Cycle through window panes.

      const separatorElements = getEnabledSeparators(axis).map(
        (separator) => separator.element
      );

      const index = separatorElements.findIndex(
        (current) => current === event.currentTarget
      );
      assert(index !== -1, "Index not found");

      const nextIndex = event.shiftKey
        ? index > 0
          ? index - 1
          : separatorElements.length - 1
        : index + 1 < separatorElements.length
          ? index + 1
          : 0;

      const nextSeparatorElement = separatorElements[nextIndex] as HTMLElement;
      nextSeparatorElement.focus({
        preventScroll: true
      });
      break;
    }
    case "Home": {
      event.preventDefault();

      // Moves splitter to the position that gives the primary pane its smallest allowed size.
      // This may completely collapse the primary pane.

      edge(-1);
      break;
    }
  }
}
