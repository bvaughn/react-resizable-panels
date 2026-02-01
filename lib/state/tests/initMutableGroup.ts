import type { Orientation } from "../../components/group/types";
import type { Dimensions } from "../../types";
import { MutablePanel } from "../MutablePanel";
import type { GroupLayout, PanelConstraints } from "../types";
import { createMockPanelHTMLElementInterface } from "./createMockPanelHTMLElementInterface";
import { createMockSeparatorHTMLElementInterface } from "./createMockSeparatorHTMLElementInterface";
import { MutableGroupForTest } from "./MutableGroupForTest";
import { MutableSeparatorForTest } from "./MutableSeparatorForTest";

export function initMutableGroup({
  defaultLayout,
  groupDimensions,
  panels = [],
  orientation = "horizontal",
  separators = []
}: {
  defaultLayout?: GroupLayout | undefined;
  groupDimensions?: Dimensions | undefined;
  panels?: Partial<
    PanelConstraints & {
      defaultSize: number | string;
    } & {
      id: string;
    }
  >[];
  orientation?: Orientation;
  separators?: string[];
}) {
  let idCounter = 0;

  if (!groupDimensions) {
    groupDimensions = {
      height: separators.length * 5 + panels.length * 10,
      width: separators.length * 5 + panels.length * 10
    };
  }

  function getNextId() {
    const id = LETTERS[idCounter];
    idCounter++;
    return id;
  }

  const panelOffsetFactor = separators.length > 0 ? 15 : 10;

  const group = new MutableGroupForTest({
    defaultLayout,
    id: getNextId(),
    orientation
  });
  panels.forEach(
    (
      {
        collapsedSize = "0%",
        collapsible = false,
        defaultSize,
        id = getNextId(),
        maxSize = "100%",
        minSize = "0%"
      },
      index
    ) => {
      const panel = new MutablePanel({
        defaultSize,
        elementInterface: createMockPanelHTMLElementInterface({
          height: 10,
          width: 10,
          x: panelOffsetFactor * index,
          y: panelOffsetFactor * index
        }),
        group,
        id
      });
      panel.updateConstraints({
        collapsedSize,
        collapsible,
        maxSize,
        minSize
      });
      panel.mount();
    }
  );

  separators.forEach((id, index) => {
    const separator = new MutableSeparatorForTest({
      elementInterface: createMockSeparatorHTMLElementInterface({
        height: 5,
        width: 5,
        x: 10 + index * 5,
        y: 10 + index * 5
      }),
      group,
      id
    });
    separator.mount();
  });

  group.mockGroupHTMLElementInterface.resizeForTest(groupDimensions);
  group.mount();
  group.flushPendingValidation();

  return group;
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
