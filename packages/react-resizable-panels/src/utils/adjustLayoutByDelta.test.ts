import { adjustLayoutByDelta } from "./adjustLayoutByDelta";

describe("adjustLayoutByDelta", () => {
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        layout: [50, 50],
        panelConstraints: [{}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([51, 49]);
  });

  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [50, 50],
        panelConstraints: [{}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([75, 25]);
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [50, 50],
        panelConstraints: [{}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([100, 0]);
  });

  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [50, 50],
        panelConstraints: [
          {
            minSize: 20,
            maxSize: 60,
          },
          {
            minSize: 10,
            maxSize: 90,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([60, 40]);
  });

  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [50, 50],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([75, 25]);
  });

  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 40,
        layout: [50, 50],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([95, 5]);
  });

  // Edge case
  // Expanding from a collapsed state to less than the min size via imperative API should do nothing
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        layout: [10, 90],
        panelConstraints: [
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25,
          },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([10, 90]);
  });

  // Edge case
  // Keyboard interactions should always expand a collapsed panel
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        layout: [10, 90],
        panelConstraints: [
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25,
          },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "keyboard",
      })
    ).toEqual([25, 75]);
  });

  // Edge case
  // Keyboard interactions should always collapse a collapsible panel once it's at the minimum size
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        layout: [75, 25],
        panelConstraints: [
          {},
          {
            collapsible: true,
            minSize: 25,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "keyboard",
      })
    ).toEqual([100, 0]);
  });

  // Edge case
  // Expanding from a collapsed state to less than the min size via imperative API should do nothing
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        layout: [4, 96],
        panelConstraints: [
          {
            collapsedSize: 4,
            collapsible: true,
            defaultSize: 15,
            maxSize: 15,
            minSize: 6,
          },
          {
            minSize: 5,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([4, 96]);
  });

  // Edge case
  // Expanding from a collapsed state to less than the min size via keyboard should snap to min size
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        layout: [4, 96],
        panelConstraints: [
          {
            collapsedSize: 4,
            collapsible: true,
            defaultSize: 15,
            maxSize: 15,
            minSize: 6,
          },
          {
            minSize: 5,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "keyboard",
      })
    ).toEqual([6, 94]);
  });

  // Edge case
  // Expanding from a collapsed state to greater than the max size
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [4, 96],
        panelConstraints: [
          {
            collapsedSize: 4,
            collapsible: true,
            defaultSize: 15,
            maxSize: 15,
            minSize: 6,
          },
          {
            minSize: 5,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([15, 85]);
  });

  // Edge case
  // Expanding from a collapsed state mimicking an imperative API call
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [5, 95],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            maxSize: 50,
            minSize: 25,
          },
          {
            minSize: 50,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 65]);
  });

  // Edge case
  // Expanding from a collapsed state mimicking an keyboard event
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [5, 95],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            maxSize: 50,
            minSize: 25,
          },
          {
            minSize: 50,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "keyboard",
      })
    ).toEqual([35, 65]);
  });

  // Edge case
  // Expanding from a collapsed state mimicking an keyboard event when there is no min size
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [0, 100],
        panelConstraints: [
          {
            collapsedSize: 0,
            collapsible: true,
            maxSize: 50,
            minSize: 0,
          },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "keyboard",
      })
    ).toEqual([30, 70]);
  });

  it("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        layout: [50, 50],
        panelConstraints: [{}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([49, 51]);
  });

  it("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        layout: [50, 50],
        panelConstraints: [{}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75]);
  });

  it("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [50, 50],
        panelConstraints: [{}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([0, 100]);
  });

  it("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [50, 50],
        panelConstraints: [
          {
            minSize: 20,
            maxSize: 60,
          },
          {
            minSize: 10,
            maxSize: 90,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 80]);
  });

  it("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75]);
  });

  it("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -30,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75]);

    expect(
      adjustLayoutByDelta({
        delta: -36,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([5, 95]);
  });

  it("[1--,2]", () => {
    // Edge case
    // The second panel should prevent the first panel from collapsing
    expect(
      adjustLayoutByDelta({
        delta: -30,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
          { maxSize: 80 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75]);
  });

  // Edge case
  // Keyboard interactions should always expand a collapsed panel
  it("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        layout: [90, 10],
        panelConstraints: [
          {},
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "keyboard",
      })
    ).toEqual([75, 25]);
  });

  // Edge case
  // Keyboard interactions should always collapse a collapsible panel once it's at the minimum size
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        layout: [25, 75],
        panelConstraints: [
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25,
          },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "keyboard",
      })
    ).toEqual([10, 90]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([26, 49, 25]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([50, 25, 25]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([75, 0, 25]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 75,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([100, 0, 0]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [25, 50, 25],
        panelConstraints: [{ maxSize: 35 }, { minSize: 25 }, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 40, 25]);
  });

  it("[1++,2,3]", () => {
    // Any further than the max size should stop the drag/keyboard resize
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [25, 50, 25],
        panelConstraints: [{ maxSize: 35 }, { minSize: 25 }, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 40, 25]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        layout: [25, 40, 35],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
          { minSize: 25 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([30, 35, 35]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 26,
        layout: [25, 40, 35],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
          { minSize: 25 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([60, 5, 35]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 80,
        layout: [25, 40, 35],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25,
          },
          { minSize: 25 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([70, 5, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([24, 51, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([0, 75, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        layout: [25, 50, 25],
        panelConstraints: [{ minSize: 20 }, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([24, 51, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 50, 25],
        panelConstraints: [{ minSize: 20 }, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 55, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            // Implied min size 10
          },
          { maxSize: 70 },
          { maxSize: 20 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 55, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            // Implied min size 10
          },
          { maxSize: 70 },
          { maxSize: 20 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([10, 65, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 15,
          },
          {},
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([15, 60, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 15,
          },
          {},
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([5, 70, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        layout: [45, 50, 5],
        panelConstraints: [
          {},
          {
            maxSize: 50,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 15,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([25, 50, 25]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 49, 26]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 50]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 0, 75]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -75,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([0, 0, 100]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { minSize: 15 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 20,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { minSize: 15 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 60, 15]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { collapsible: true, minSize: 20 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { collapsible: true, minSize: 20 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20]);

    expect(
      adjustLayoutByDelta({
        delta: 16,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { collapsible: true, minSize: 20 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75, 0]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 51, 24]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75, 0]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        layout: [25, 50, 25],
        panelConstraints: [{}, { minSize: 40 }, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([15, 40, 45]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { maxSize: 30 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 45, 30]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -35,
        layout: [25, 50, 25],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([20, 20, 60]);

    expect(
      adjustLayoutByDelta({
        delta: -40,
        layout: [25, 50, 25],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 5, 70]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 0, 75],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([20, 0, 80]);

    expect(
      adjustLayoutByDelta({
        delta: -20,
        layout: [25, 0, 75],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([5, 0, 95]);
  });

  // Edge case
  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        layout: [100 / 3, 100 / 3, 100 / 3],
        panelConstraints: [{}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "mouse-or-touch",
      })
    ).toEqual([0, 0, 100]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([26, 24, 25, 25]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([50, 0, 25, 25]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([75, 0, 0, 25]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 75,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([100, 0, 0, 0]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        layout: [25, 25, 25, 25],
        panelConstraints: [{ maxSize: 35 }, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 15, 25, 25]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          { minSize: 10 },
          { minSize: 10 },
          { minSize: 10 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([70, 10, 10, 10]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 20, 20, 25]);

    expect(
      adjustLayoutByDelta({
        delta: 15,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([45, 5, 25, 25]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 40,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([65, 5, 5, 25]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([85, 5, 5, 5]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([24, 26, 25, 25]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([0, 50, 25, 25]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 25, 25, 25],
        panelConstraints: [{ minSize: 20 }, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 30, 25, 25]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { maxSize: 35 }, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([0, 35, 40, 25]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
          {},
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 30, 25, 25]);

    expect(
      adjustLayoutByDelta({
        delta: -15,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
          {},
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([5, 45, 25, 25]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          { maxSize: 35 },
          {},
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 30, 25, 25]);

    expect(
      adjustLayoutByDelta({
        delta: -15,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          { maxSize: 35 },
          {},
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([5, 35, 35, 25]);
  });

  it("[1--,2,3,4]", () => {
    // This might be controversial behavior;
    // Perhaps the 1st panel should collapse
    // rather than being blocked by the max size constraints of the 2nd panel
    // since the 3rd panel has room to grow still
    //
    // An alternate layout result might be: [5, 30, 40, 25]
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          { maxSize: 30 },
          {},
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 30, 25, 25]);
  });

  it("[1--,2,3,4]", () => {
    // This might be controversial behavior;
    // Perhaps the 1st panel should collapse
    // rather than being blocked by the max size constraints of the 2nd panel
    // since the 3rd panel has room to grow still
    //
    // An alternate layout result might be: [5, 30, 35, 30]
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          { maxSize: 30 },
          { maxSize: 35 },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 30, 25, 25]);
  });

  // Edge case (issues/210)
  it("[1--,2,3,4]", () => {
    // If the size doesn't drop below the halfway point, the panel should not collapse
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          { maxSize: 35 },
          { maxSize: 35 },
          { maxSize: 35 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 30, 25, 25]);

    // If the size drops below the halfway point, the panel should collapse
    // In this case it needs to add sizes to multiple other panels in order to collapse
    // because the nearest neighbor panel's max size constraints won't allow it to expand to cover all of the difference
    expect(
      adjustLayoutByDelta({
        delta: -20,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          { maxSize: 35 },
          { maxSize: 35 },
          { maxSize: 35 },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([5, 35, 35, 25]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 35, 15, 25]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 0, 20]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75, 0, 0]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { maxSize: 35 }, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([65, 35, 0, 0]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, { minSize: 20 }, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20, 0]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 10,
          },
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 35, 15, 25]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 10,
          },
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 5, 15]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 10,
          },
          { minSize: 10 },
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 60, 5, 10]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 0, 50, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([0, 0, 75, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { minSize: 20 }, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([0, 20, 55, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{ minSize: 20 }, {}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([20, 0, 55, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{ minSize: 20 }, { minSize: 20 }, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([20, 20, 35, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
          {},
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 20, 30, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
          {},
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([5, 0, 70, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([0, 5, 70, 25]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 35, 15]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 50, 0]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, { maxSize: 40 }, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 35, 40, 0]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, { minSize: 10 }],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 40, 10]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
        ],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 30, 20]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
        ],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 45, 5]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 15, 35]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -40,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 10, 0, 65]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([0, 0, 0, 100]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          { minSize: 10 },
          { minSize: 10 },
          { minSize: 10 },
          {},
        ],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([10, 10, 10, 70]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, { maxSize: 40 }],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 10, 40]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { minSize: 5 }, {}, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([20, 5, 0, 75]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {},
        ],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([5, 5, 5, 85]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            minSize: 20,
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20,
          },
          {
            minSize: 20,
          },
          {},
        ],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([20, 5, 20, 55]);
  });

  describe("invalid layouts", () => {
    it("should ignore changes that violate max or min size constraints", () => {
      expect(
        adjustLayoutByDelta({
          delta: 1,
          layout: [50, 50],
          panelConstraints: [{ maxSize: 50 }, {}],
          pivotIndices: [0, 1],
          trigger: "imperative-api",
        })
      ).toEqual([50, 50]);

      expect(
        adjustLayoutByDelta({
          delta: 1,
          layout: [50, 50],
          panelConstraints: [{}, { minSize: 50 }],
          pivotIndices: [0, 1],
          trigger: "imperative-api",
        })
      ).toEqual([50, 50]);
    });
  });
});
