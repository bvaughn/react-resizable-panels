import { isDevelopment } from "#is-development";
import { PanelConstraints } from "../Panel";
import { assert } from "./assert";

export function validatePanelConstraints({
  panelConstraints: panelConstraintsArray,
  panelId,
  panelIndex,
}: {
  panelConstraints: PanelConstraints[];
  panelId: string | undefined;
  panelIndex: number;
}): boolean {
  if (isDevelopment) {
    const warnings = [];

    const panelConstraints = panelConstraintsArray[panelIndex];
    assert(panelConstraints);

    const {
      collapsedSize = 0,
      collapsible = false,
      defaultSize,
      maxSize = 100,
      minSize = 0,
    } = panelConstraints;

    if (minSize > maxSize) {
      warnings.push(
        `min size (${minSize}%) should not be greater than max size (${maxSize}%)`
      );
    }

    if (defaultSize != null) {
      if (defaultSize < 0) {
        warnings.push("default size should not be less than 0");
      } else if (
        defaultSize < minSize &&
        (!collapsible || defaultSize !== collapsedSize)
      ) {
        warnings.push("default size should not be less than min size");
      }

      if (defaultSize > 100) {
        warnings.push("default size should not be greater than 100");
      } else if (defaultSize > maxSize) {
        warnings.push("default size should not be greater than max size");
      }
    }

    if (collapsedSize > minSize) {
      warnings.push("collapsed size should not be greater than min size");
    }

    if (warnings.length > 0) {
      const name = panelId != null ? `Panel "${panelId}"` : "Panel";
      console.warn(
        `${name} has an invalid configuration:\n\n${warnings.join("\n")}`
      );

      return false;
    }
  }

  return true;
}
