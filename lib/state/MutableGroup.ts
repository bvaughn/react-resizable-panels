import { EMPTY_DOM_RECT } from "../constants";
import type { Dimensions, Rect } from "../types";
import { EventEmitter } from "../utils/EventEmitter";
import type { MutablePanel } from "./MutablePanel";
import type { MutableSeparator } from "./MutableSeparator";
import type { GroupLayout } from "./types";

export class MutableGroup extends EventEmitter<{
  change: [];
  layoutChangeStart: [];
  layoutChange: [];
  layoutChangeStop: [];
  resize: [];
}> {
  #defaultLayout: GroupLayout | undefined;
  #dimensions: Dimensions = EMPTY_DOM_RECT;
  #disabled = false;
  #id: string;
  #layoutChangeInProgress = false;
  #layoutRequiresValidation = false;
  #panels: MutablePanel[] = [];
  #separators: MutableSeparator[] = [];

  constructor(id: string, defaultLayout: GroupLayout | undefined = undefined) {
    super();

    this.#defaultLayout = defaultLayout;
    this.#id = id;
  }

  addPanel(panel: MutablePanel) {
    panel.addListener("constraintsChange", this.#onPanelConstraintsChange);

    this.#layoutRequiresValidation = true;
    this.#panels.push(panel);

    this.emit("change", []);

    return () => this.removePanel(panel);
  }

  addSeparator(separator: MutableSeparator) {
    this.#layoutRequiresValidation = true;
    this.#separators.push(separator);

    this.emit("change", []);

    return () => this.removeSeparator(separator);
  }

  /**
   * If layout requires validation, do it.
   * This method is used to batch layout updates resulting from multiple Panels/Separators.
   */
  flushPendingValidation() {
    if (this.#layoutRequiresValidation) {
      this.#validateLayout();
    }
  }

  removePanel(panel: MutablePanel) {
    panel.removeListener("constraintsChange", this.#onPanelConstraintsChange);

    const index = this.#panels.indexOf(panel);
    if (index >= 0) {
      this.#layoutRequiresValidation = true;
      this.#panels.splice(index, 1);

      this.emit("change", []);
    }
  }

  removeSeparator(panel: MutableSeparator) {
    const index = this.#separators.indexOf(panel);
    if (index >= 0) {
      this.#layoutRequiresValidation = true;
      this.#separators.splice(index, 1);

      this.emit("change", []);
    }
  }

  /**
   * Notify the MutableGroup that its view's dimensions have changed.
   * This will require revalidating the current layout (in case any Panels have specified non-percentage based constraints).
   */
  updateDimensions(dimensions: Dimensions) {
    this.#dimensions = dimensions;
    this.emit("resize", []);

    for (const panel of this.#panels) {
      if (panel.canBeInvalidateByGroupDimensions) {
        this.#validateLayout();
        break;
      }
    }
  }

  #onPanelConstraintsChange = () => {
    this.#layoutRequiresValidation = true;
  };

  #validateLayout() {
    this.#layoutRequiresValidation = false;

    // TODO
  }
}
