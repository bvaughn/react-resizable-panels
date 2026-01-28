import type { Orientation } from "../../components/group/types";
import { Rect } from "../../types";
import { setElementBounds } from "../../utils/test/mockBoundingClientRect";
import { MutableGroup } from "../MutableGroup";
import type { GroupLayout } from "../types";
import {
  createMockGroupHTMLElementInterface,
  MockGroupHTMLElementInterface
} from "./createMockGroupHTMLElementInterface";
import { MutablePanelForTest } from "./MutablePanelForTest";
import { MutableSeparatorForTest } from "./MutableSeparatorForTest";

export class MutableGroupForTest extends MutableGroup {
  #children: HTMLElement[] = [];
  #element: HTMLElement | null = null;
  #id: number = 0;

  constructor({
    defaultLayout,
    id = "group",
    orientation = "horizontal",
    rect = new Rect(0, 0, 1000, 500)
  }: {
    defaultLayout?: GroupLayout | undefined;
    id?: string;
    orientation?: Orientation | undefined;
    rect?: DOMRect | undefined;
  } = {}) {
    super({
      defaultLayout,
      elementInterface: createMockGroupHTMLElementInterface(),
      id,
      orientation,
      resizeTargetMinimumSize: { coarse: 20, fine: 10 }
    });

    this.mockGroupHTMLElementInterface.getChildren.mockReturnValue(
      this.#children
    );
    this.mockGroupHTMLElementInterface.getElementRect(rect);
    this.mockGroupHTMLElementInterface.resizeForTest(rect);

    this.mount();
  }

  mount(): void {
    super.mount();

    if (this.#element === null) {
      this.#element = document.createElement("div");
      this.#element.setAttribute("data-group", "");
      this.#element.setAttribute("data-testid", this.id);
      this.#element.setAttribute("id", this.id);

      document.body.appendChild(this.#element);
    }
  }

  unmount(): void {
    super.unmount();

    if (this.#element) {
      document.body.removeChild(this.#element);
      this.#element = null;
    }
  }

  get mockGroupHTMLElementInterface() {
    return this.elementInterface as MockGroupHTMLElementInterface;
  }

  addDiv(rect: DOMRect): void {
    const element = document.createElement("div");

    setElementBounds(element, rect);

    this.#children.push(element);
  }

  addMutablePanel(rect: DOMRect, id: string = this.#getId()): void {
    const element = document.createElement("div");
    element.setAttribute("data-panel", "");
    element.setAttribute("id", id);

    setElementBounds(element, rect);

    this.#children.push(element);

    const panel = new MutablePanelForTest({
      group: this,
      id
    });
    panel.mockPanelHTMLElementInterface.getElementRect.mockReturnValue(rect);
    panel.mount();
  }

  addMutableSeparator(rect: DOMRect, id: string = this.#getId()): void {
    const element = document.createElement("div");
    element.setAttribute("data-separator", "");
    element.setAttribute("id", id);

    setElementBounds(element, rect);

    this.#children.push(element);

    const panel = new MutableSeparatorForTest({
      group: this,
      id
    });
    panel.mockHTMLElementInterface.getElementRect.mockReturnValue(rect);
    panel.mount();
  }

  updateLayoutForTest(proposedLayout: GroupLayout) {
    super
      .startLayoutTransaction()
      .proposedUpdate(proposedLayout)
      .endTransaction();
  }

  #getId = () => {
    return `${this.#id++}`;
  };
}
