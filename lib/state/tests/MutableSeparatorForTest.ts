import type { MutableGroup } from "../MutableGroup";
import { MutableSeparator } from "../MutableSeparator";
import {
  createMockSeparatorHTMLElementInterface,
  type MockSeparatorHTMLElementInterface
} from "./createMockSeparatorHTMLElementInterface";
import { MutableGroupForTest } from "./MutableGroupForTest";

export class MutableSeparatorForTest extends MutableSeparator {
  constructor({
    elementInterface = createMockSeparatorHTMLElementInterface(),
    group = new MutableGroupForTest(),
    id = "separator"
  }: {
    elementInterface?: MockSeparatorHTMLElementInterface;
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
    return this.elementInterface as MockSeparatorHTMLElementInterface;
  }
}
