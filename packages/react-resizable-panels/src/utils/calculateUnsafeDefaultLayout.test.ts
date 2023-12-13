import { PanelConstraints, PanelData } from "../Panel";
import { calculateUnsafeDefaultLayout } from "./calculateUnsafeDefaultLayout";
import { expectToBeCloseToArray } from "./test-utils";

describe("calculateUnsafeDefaultLayout", () => {
  let idCounter = 0;
  let orderCounter = 0;

  function createPanelData(constraints: PanelConstraints = {}): PanelData {
    return {
      callbacks: {
        onCollapse: undefined,
        onExpand: undefined,
        onResize: undefined,
      },
      constraints,
      id: `${idCounter++}`,
      idIsFromProps: false,
      order: orderCounter++,
    };
  }

  beforeEach(() => {
    idCounter = 0;
    orderCounter = 0;
  });

  it("should assign even sizes for every panel by default", () => {
    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        panelDataArray: [createPanelData()],
      }),
      [100]
    );

    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        panelDataArray: [createPanelData(), createPanelData()],
      }),
      [50, 50]
    );

    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        panelDataArray: [
          createPanelData(),
          createPanelData(),
          createPanelData(),
        ],
      }),
      [33.3, 33.3, 33.3]
    );
  });

  it("should respect default panel size constraints", () => {
    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        panelDataArray: [
          createPanelData({
            defaultSize: 15,
          }),
          createPanelData({
            defaultSize: 85,
          }),
        ],
      }),
      [15, 85]
    );
  });

  it("should ignore min and max panel size constraints", () => {
    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        panelDataArray: [
          createPanelData({
            minSize: 40,
          }),
          createPanelData(),
          createPanelData({
            maxSize: 10,
          }),
        ],
      }),
      [33.3, 33.3, 33.3]
    );
  });
});
