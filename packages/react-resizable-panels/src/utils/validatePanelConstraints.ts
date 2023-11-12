import { isDevelopment } from "#is-development";
import { PanelConstraints } from "../Panel";
import { computePercentagePanelConstraints } from "./computePercentagePanelConstraints";

export function validatePanelConstraints({
  groupSizePixels,
  panelConstraints,
  panelId,
  panelIndex,
}: {
  groupSizePixels: number;
  panelConstraints: PanelConstraints[];
  panelId: string | undefined;
  panelIndex: number;
}): boolean {
  if (isDevelopment) {
    const warnings = [];

    {
      const {
        collapsedSizePercentage,
        collapsedSizePixels,
        defaultSizePercentage,
        defaultSizePixels,
        maxSizePercentage,
        maxSizePixels,
        minSizePercentage,
        minSizePixels,
      } = panelConstraints[panelIndex]!;

      const conflictingUnits: string[] = [];

      if (collapsedSizePercentage != null && collapsedSizePixels != null) {
        conflictingUnits.push("collapsed size");
      }
      if (defaultSizePercentage != null && defaultSizePixels != null) {
        conflictingUnits.push("default size");
      }
      if (maxSizePercentage != null && maxSizePixels != null) {
        conflictingUnits.push("max size");
      }
      if (minSizePercentage != null && minSizePixels != null) {
        conflictingUnits.push("min size");
      }

      if (conflictingUnits.length > 0) {
        warnings.push(
          `should not specify both percentage and pixel units for: ${conflictingUnits.join(
            ", "
          )}`
        );
      }
    }

    {
      const {
        collapsedSizePercentage,
        defaultSizePercentage,
        maxSizePercentage,
        minSizePercentage,
      } = computePercentagePanelConstraints(
        panelConstraints,
        panelIndex,
        groupSizePixels
      );

      if (minSizePercentage > maxSizePercentage) {
        warnings.push(
          `min size (${minSizePercentage}%) should not be greater than max size (${maxSizePercentage}%)`
        );
      }

      if (defaultSizePercentage != null) {
        if (defaultSizePercentage < 0) {
          warnings.push("default size should not be less than 0");
        } else if (defaultSizePercentage < minSizePercentage) {
          warnings.push("default size should not be less than min size");
        }

        if (defaultSizePercentage > 100) {
          warnings.push("default size should not be greater than 100");
        } else if (defaultSizePercentage > maxSizePercentage) {
          warnings.push("default size should not be greater than max size");
        }
      }

      if (collapsedSizePercentage > minSizePercentage) {
        warnings.push("collapsed size should not be greater than min size");
      }
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
