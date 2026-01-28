import type { MutableGroup } from "../MutableGroup";
import { MutableSeparator } from "../MutableSeparator";
import {
  createMockHTMLElementInterface,
  type MockHTMLElementInterface
} from "./createMockHTMLElementInterface";
import { MutableGroupForTest } from "./MutableGroupForTest";

export class MutableSeparatorForTest extends MutableSeparator {
  constructor({
    elementInterface = createMockHTMLElementInterface(),
    group = new MutableGroupForTest(),
    id = "separator"
  }: {
    elementInterface?: MockHTMLElementInterface;
    group?: MutableGroup;
    id?: string;
  } = {}) {
    super({
      elementInterface,
      group,
      id
    });
  }

  get mockHTMLElementInterface() {
    return this.elementInterface as MockHTMLElementInterface;
  }
}
