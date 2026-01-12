import type { SizeUnit } from "../components/panel/types";
import { parseSizeAndUnit } from "../global/styles/parseSizeAndUnit";
import { EventEmitter } from "../utils/EventEmitter";
import type { PanelConstraints } from "./types";

export class MutablePanel extends EventEmitter<{
  constraintsChange: [];
}> {
  canBeInvalidateByGroupDimensions = false;
  collapsedSize: number = 0;
  collapsedUnit: SizeUnit = "%";
  collapsible: boolean = false;
  defaultSize: number | undefined = undefined;
  id: string;
  maxSize: number = 100;
  maxUnit: SizeUnit = "%";
  minSize: number = 0;
  minUnit: SizeUnit = "%";

  constructor(id: string, defaultSize?: number | undefined) {
    super();

    this.defaultSize = defaultSize;
    this.id = id;
  }

  updateConstraints(constraints: PanelConstraints) {
    let didChange = false;

    const [collapsedSize, collapsedUnit] = parseSizeAndUnit(
      constraints.collapsedSize
    );
    if (
      this.collapsedSize !== collapsedSize ||
      this.collapsedUnit !== collapsedUnit
    ) {
      this.collapsedSize = collapsedSize;
      this.collapsedUnit = collapsedUnit;

      didChange = true;
    }

    if (this.collapsible !== constraints.collapsible) {
      this.collapsible = constraints.collapsible;

      didChange = true;
    }

    const [maxSize, maxUnit] = parseSizeAndUnit(constraints.maxSize);
    if (this.maxSize !== maxSize || this.maxUnit !== maxUnit) {
      this.maxSize = maxSize;
      this.maxUnit = maxUnit;

      didChange = true;
    }

    const [minSize, minUnit] = parseSizeAndUnit(constraints.minSize);
    if (this.minSize !== minSize || this.minUnit !== minUnit) {
      this.minSize = minSize;
      this.minUnit = minUnit;

      didChange = true;
    }

    this.canBeInvalidateByGroupDimensions =
      this.collapsedUnit === "px" ||
      this.maxUnit === "px" ||
      this.minUnit === "px";

    if (didChange) {
      this.emit("constraintsChange", []);
    }
  }
}
