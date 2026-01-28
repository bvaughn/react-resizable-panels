import type { CSSProperties } from "react";
import type {
  OnPanelResize,
  PanelSize,
  SizeUnit
} from "../components/panel/types";
import type { Rect } from "../types";
import { EventEmitter } from "../utils/EventEmitter";
import { parseSizeAndUnit } from "../utils/parseSizeAndUnit";
import type { MutableGroup } from "./MutableGroup";
import type {
  GroupLayout,
  PanelConstraints,
  PanelHTMLElementInterface,
  SeparatorAriaAttributes
} from "./types";

export class MutablePanel extends EventEmitter<{
  constraintsChange: void;
  styleChange: CSSProperties;
}> {
  #ariaAttributes: SeparatorAriaAttributes | undefined = undefined;
  canBeInvalidateByGroupDimensions = false;
  collapsedSize: number = 0;
  collapsedUnit: SizeUnit = "%";
  collapsible: boolean = false;
  readonly defaultSize: number | undefined = undefined;
  readonly defaultUnit: SizeUnit = "%";
  readonly elementInterface: PanelHTMLElementInterface;
  expandToSize: number | undefined = undefined;
  readonly group: MutableGroup;
  readonly id: string;
  maxSize: number = 100;
  maxUnit: SizeUnit = "%";
  minSize: number = 0;
  minUnit: SizeUnit = "%";
  #style: CSSProperties;

  constructor({
    defaultSize: defaultSizeParam,
    elementInterface,
    group,
    id
  }: {
    defaultSize: number | string | undefined;
    elementInterface: PanelHTMLElementInterface;
    group: MutableGroup;
    id: string;
  }) {
    super();

    if (defaultSizeParam !== undefined) {
      const [defaultSize, defaultUnit] = parseSizeAndUnit(defaultSizeParam);

      this.defaultSize = defaultSize;
      this.defaultUnit = defaultUnit;
    }

    this.group = group;
    this.id = id;
    this.elementInterface = elementInterface;
    this.#style = {
      flexGrow: group.layout[id] ?? 1
    };
  }

  get ariaAttributes() {
    return this.#ariaAttributes;
  }

  get offset() {
    const { x, y } = this.elementInterface.getElementRect();
    return this.group.orientation === "horizontal" ? x : y;
  }

  get size() {
    const { width, height } = this.elementInterface.getElementRect();
    return this.group.orientation === "horizontal" ? width : height;
  }

  get style() {
    return this.#style;
  }

  mount() {
    this.group.addListener("layoutChange", this.#onGroupLayoutChange);
    this.group.addPanels(this);
  }

  unmount() {
    this.group.removePanels(this);
    this.group.removeListener("layoutChange", this.#onGroupLayoutChange);
  }

  updateConstraints(constraints: PanelConstraints) {
    let didChange = false;

    const [collapsedSize, collapsedUnit] = parseSizeAndUnit(
      constraints.collapsedSize ?? "0%"
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
      this.collapsible = constraints.collapsible === true;

      didChange = true;
    }

    const [maxSize, maxUnit] = parseSizeAndUnit(constraints.maxSize ?? "100%");
    if (this.maxSize !== maxSize || this.maxUnit !== maxUnit) {
      this.maxSize = maxSize;
      this.maxUnit = maxUnit;

      didChange = true;
    }

    const [minSize, minUnit] = parseSizeAndUnit(constraints.minSize ?? "0%");
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
      this.emit("constraintsChange", undefined);
    }
  }

  updateResizeListener(onResize: OnPanelResize) {
    let prevPanelSize: PanelSize | undefined = undefined;

    return this.elementInterface.onResize((rect: Rect) => {
      const { layout, orientation } = this.group;

      const size = layout[this.id];
      if (size !== undefined) {
        const nextPanelSize: PanelSize = {
          asPercentage: size,
          inPixels: orientation === "horizontal" ? rect.width : rect.height
        };

        onResize(nextPanelSize, this.id, prevPanelSize);

        prevPanelSize = nextPanelSize;
      }
    });
  }

  #onGroupLayoutChange = (layout: GroupLayout) => {
    const flexGrow = layout[this.id] ?? 1;
    if (this.#style.flexGrow !== flexGrow) {
      this.#style = { flexGrow };

      this.emit("styleChange", this.#style);
    }
  };
}
