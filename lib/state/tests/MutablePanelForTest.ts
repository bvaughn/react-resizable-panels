import type { MutableGroup } from "../MutableGroup";
import { MutablePanel } from "../MutablePanel";
import {
  createMockPanelHTMLElementInterface,
  type MockPanelHTMLElementInterface
} from "./createMockPanelHTMLElementInterface";
import { MutableGroupForTest } from "./MutableGroupForTest";

export class MutablePanelForTest extends MutablePanel {
  constructor({
    defaultSize,
    elementInterface = createMockPanelHTMLElementInterface(),
    group = new MutableGroupForTest(),
    id = "panel"
  }: {
    defaultSize?: number | string | undefined;
    elementInterface?: MockPanelHTMLElementInterface;
    group?: MutableGroup;
    id?: string;
  } = {}) {
    super({
      defaultSize,
      elementInterface,
      group,
      id
    });
  }

  get mockPanelHTMLElementInterface() {
    return this.elementInterface as MockPanelHTMLElementInterface;
  }
}
