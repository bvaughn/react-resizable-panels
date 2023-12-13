import { PanelConstraints, PanelData } from "../Panel";
import { calculateAriaValues } from "./calculateAriaValues";

describe("calculateAriaValues", () => {
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

  it("should work correctly for panels with no min/max constraints", () => {
    expect(
      calculateAriaValues({
        layout: [50, 50],
        panelsArray: [createPanelData(), createPanelData()],
        pivotIndices: [0, 1],
      })
    ).toEqual({
      valueMax: 100,
      valueMin: 0,
      valueNow: 50,
    });

    expect(
      calculateAriaValues({
        layout: [20, 50, 30],
        panelsArray: [createPanelData(), createPanelData(), createPanelData()],
        pivotIndices: [0, 1],
      })
    ).toEqual({
      valueMax: 100,
      valueMin: 0,
      valueNow: 20,
    });

    expect(
      calculateAriaValues({
        layout: [20, 50, 30],
        panelsArray: [createPanelData(), createPanelData(), createPanelData()],
        pivotIndices: [1, 2],
      })
    ).toEqual({
      valueMax: 100,
      valueMin: 0,
      valueNow: 50,
    });
  });

  it("should work correctly for panels with min/max constraints", () => {
    expect(
      calculateAriaValues({
        layout: [25, 75],
        panelsArray: [
          createPanelData({
            maxSize: 35,
            minSize: 10,
          }),
          createPanelData(),
        ],
        pivotIndices: [0, 1],
      })
    ).toEqual({
      valueMax: 35,
      valueMin: 10,
      valueNow: 25,
    });

    expect(
      calculateAriaValues({
        layout: [25, 50, 25],
        panelsArray: [
          createPanelData({
            maxSize: 35,
            minSize: 10,
          }),
          createPanelData(),
          createPanelData({
            maxSize: 35,
            minSize: 10,
          }),
        ],
        pivotIndices: [1, 2],
      })
    ).toEqual({
      valueMax: 80,
      valueMin: 30,
      valueNow: 50,
    });
  });
});
