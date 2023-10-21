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
        groupSizePixels: 100_000,
        panelDataArray: [createPanelData()],
      }),
      [100]
    );

    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        groupSizePixels: 100_000,
        panelDataArray: [createPanelData(), createPanelData()],
      }),
      [50, 50]
    );

    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        groupSizePixels: 100_000,
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
        groupSizePixels: 100_000,
        panelDataArray: [
          createPanelData({
            defaultSizePercentage: 15,
          }),
          createPanelData({
            defaultSizePercentage: 85,
          }),
        ],
      }),
      [15, 85]
    );
  });

  it("should ignore min and max panel size constraints", () => {
    expectToBeCloseToArray(
      calculateUnsafeDefaultLayout({
        groupSizePixels: 100_000,
        panelDataArray: [
          createPanelData({
            minSizePercentage: 40,
          }),
          createPanelData(),
          createPanelData({
            maxSizePercentage: 10,
          }),
        ],
      }),
      [33.3, 33.3, 33.3]
    );
  });
});
