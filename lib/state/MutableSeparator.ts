import { EventEmitter } from "../utils/EventEmitter";
import type { MutableGroup } from "./MutableGroup";
import type {
  SeparatorAriaAttributes,
  SeparatorHTMLElementInterface,
  SeparatorState
} from "./types";

export class MutableSeparator extends EventEmitter<{
  ariaAttributes: SeparatorAriaAttributes;
  separatorState: SeparatorState;
}> {
  #ariaAttributes: SeparatorAriaAttributes | undefined;
  elementInterface: SeparatorHTMLElementInterface;
  id: string;
  readonly group: MutableGroup;
  #state: SeparatorState = "default";

  constructor({
    elementInterface,
    group,
    id
  }: {
    elementInterface: SeparatorHTMLElementInterface;
    group: MutableGroup;
    id: string;
  }) {
    super();

    this.#ariaAttributes = undefined;
    this.elementInterface = elementInterface;
    this.id = id;

    this.group = group;
  }

  mount() {
    this.group.addListener("layoutChange", this.#onLayoutChange);
    this.group.addListener(
      "separatorStatesChange",
      this.#onSeparatorStatesChange
    );
    this.group.addSeparators(this);
  }

  unmount() {
    this.group.removeSeparators(this);
    this.group.removeListener("layoutChange", this.#onLayoutChange);
    this.group.removeListener(
      "separatorStatesChange",
      this.#onSeparatorStatesChange
    );
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

  get state() {
    return this.#state;
  }

  #onLayoutChange = () => {
    const ariaAttributes = this.group.getAriaAttributes(this);
    if (
      this.#ariaAttributes === undefined ||
      this.#ariaAttributes["ariaControls"] !== ariaAttributes["ariaControls"] ||
      this.#ariaAttributes["ariaValueMax"] !== ariaAttributes["ariaValueMax"] ||
      this.#ariaAttributes["ariaValueMin"] !== ariaAttributes["ariaValueMin"] ||
      this.#ariaAttributes["ariaValueNow"] !== ariaAttributes["ariaValueNow"]
    ) {
      this.#ariaAttributes = ariaAttributes;

      this.emit("ariaAttributes", ariaAttributes);
    }
  };

  #onSeparatorStatesChange = () => {
    const state = this.group.separatorStates.get(this) ?? "default";
    if (this.#state !== state) {
      this.#state = state;

      this.emit("separatorState", state);
    }
  };
}
