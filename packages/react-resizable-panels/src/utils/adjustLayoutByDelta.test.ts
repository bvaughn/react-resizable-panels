import { adjustLayoutByDelta } from "./adjustLayoutByDelta";

describe("adjustLayoutByDelta", () => {
  it("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [{}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([75, 25]);
    expect(
      adjustLayoutByDelta({
        delta: 50,
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {
            minSizePercentage: 20,
            maxSizePercentage: 60,
          },
          {
            minSizePercentage: 10,
            maxSizePercentage: 90,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: NaN,
        layout: [10, 90],
        panelConstraints: [
          {
            collapsedSizePercentage: 10,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: NaN,
        layout: [10, 90],
        panelConstraints: [
          {
            collapsedSizePercentage: 10,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: NaN,
        layout: [75, 25],
        panelConstraints: [
          {},
          {
            collapsible: true,
            minSizePercentage: 25,
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
    // collapsed 4%, min size 6%, max size 15%
    expect(
      adjustLayoutByDelta({
        delta: 1,
        groupSizePixels: 1_000,
        layout: [4, 96],
        panelConstraints: [
          {
            collapsedSizePixels: 40,
            collapsible: true,
            defaultSizePixels: 150,
            maxSizePixels: 150,
            minSizePixels: 60,
          },
          {
            minSizePercentage: 50,
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
    // collapsed 4%, min size 6%, max size 15%

    expect(
      adjustLayoutByDelta({
        delta: 1,
        groupSizePixels: 1_000,
        layout: [4, 96],
        panelConstraints: [
          {
            collapsedSizePixels: 40,
            collapsible: true,
            defaultSizePixels: 150,
            maxSizePixels: 150,
            minSizePixels: 60,
          },
          {
            minSizePercentage: 50,
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
    // collapsed 4%, min size 6%, max size 15%
    expect(
      adjustLayoutByDelta({
        delta: 25,
        groupSizePixels: 1_000,
        layout: [4, 96],
        panelConstraints: [
          {
            collapsedSizePixels: 40,
            collapsible: true,
            defaultSizePixels: 150,
            maxSizePixels: 150,
            minSizePixels: 60,
          },
          {
            minSizePercentage: 50,
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
        groupSizePixels: 100,
        layout: [5, 95],
        panelConstraints: [
          {
            collapsedSizePixels: 5,
            collapsible: true,
            maxSizePixels: 50,
            minSizePixels: 25,
          },
          {
            minSizePercentage: 50,
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
        groupSizePixels: 100,
        layout: [5, 95],
        panelConstraints: [
          {
            collapsedSizePixels: 5,
            collapsible: true,
            maxSizePixels: 50,
            minSizePixels: 25,
          },
          {
            minSizePercentage: 50,
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
        groupSizePixels: 100,
        layout: [0, 100],
        panelConstraints: [
          {
            collapsedSizePixels: 0,
            collapsible: true,
            maxSizePixels: 50,
            minSizePixels: 0,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {
            minSizePercentage: 20,
            maxSizePercentage: 60,
          },
          {
            minSizePercentage: 10,
            maxSizePercentage: 90,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: 100,
        layout: [50, 50],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
          },
          { maxSizePercentage: 80 },
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
        groupSizePixels: NaN,
        layout: [90, 10],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 10,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: NaN,
        layout: [25, 75],
        panelConstraints: [
          {
            collapsedSizePercentage: 10,
            collapsible: true,
            minSizePercentage: 25,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          { maxSizePercentage: 35 },
          { minSizePercentage: 25 },
          {},
        ],
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          { maxSizePercentage: 35 },
          { minSizePercentage: 25 },
          {},
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 40, 25]);
  });

  it("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        groupSizePixels: 100,
        layout: [25, 40, 35],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
          },
          { minSizePercentage: 25 },
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
        groupSizePixels: 100,
        layout: [25, 40, 35],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
          },
          { minSizePercentage: 25 },
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
        groupSizePixels: 100,
        layout: [25, 40, 35],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 25,
          },
          { minSizePercentage: 25 },
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [{ minSizePercentage: 20 }, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([24, 51, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [{ minSizePercentage: 20 }, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 55, 25]);
  });

  it("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            // Implied min size 10
          },
          { maxSizePercentage: 70 },
          { maxSizePercentage: 20 },
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            // Implied min size 10
          },
          { maxSizePercentage: 70 },
          { maxSizePercentage: 20 },
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePixels: 15,
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePixels: 15,
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
        groupSizePixels: 100,
        layout: [45, 50, 5],
        panelConstraints: [
          {},
          {
            maxSizePercentage: 50,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePixels: 15,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { minSizePercentage: 15 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 20,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { minSizePercentage: 15 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 60, 15]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {},
          {},
          { collapsible: true, minSizePercentage: 20 },
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20]);
  });

  it("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {},
          {},
          { collapsible: true, minSizePercentage: 20 },
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20]);

    expect(
      adjustLayoutByDelta({
        delta: 16,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {},
          {},
          { collapsible: true, minSizePercentage: 20 },
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 75, 0]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [{}, { minSizePercentage: 40 }, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([15, 40, 45]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [{}, {}, { maxSizePercentage: 30 }],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 45, 30]);
  });

  it("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -35,
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 50, 25],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 0, 75],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 0, 75],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {},
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([5, 0, 95]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{ maxSizePercentage: 35 }, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 15, 25, 25]);
  });

  it("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 100,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          { minSizePercentage: 10 },
          { minSizePercentage: 10 },
          { minSizePercentage: 10 },
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
        ],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([35, 20, 20, 25]);

    expect(
      adjustLayoutByDelta({
        delta: 15,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{ minSizePercentage: 20 }, {}, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([20, 30, 25, 25]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { maxSizePercentage: 35 }, {}, {}],
        pivotIndices: [0, 1],
        trigger: "imperative-api",
      })
    ).toEqual([0, 35, 40, 25]);
  });

  it("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          { maxSizePercentage: 35 },
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          { maxSizePercentage: 35 },
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          { maxSizePercentage: 30 },
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          { maxSizePercentage: 30 },
          { maxSizePercentage: 35 },
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          { maxSizePercentage: 35 },
          { maxSizePercentage: 35 },
          { maxSizePercentage: 35 },
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          { maxSizePercentage: 35 },
          { maxSizePercentage: 35 },
          { maxSizePercentage: 35 },
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { maxSizePercentage: 35 }, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([65, 35, 0, 0]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, { minSizePercentage: 20 }, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([25, 55, 20, 0]);
  });

  it("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 10,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 10,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 10,
          },
          { minSizePercentage: 10 },
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { minSizePercentage: 20 }, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([0, 20, 55, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{ minSizePercentage: 20 }, {}, {}, {}],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([20, 0, 55, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          { minSizePercentage: 20 },
          { minSizePercentage: 20 },
          {},
          {},
        ],
        pivotIndices: [1, 2],
        trigger: "imperative-api",
      })
    ).toEqual([20, 20, 35, 25]);
  });

  it("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, { maxSizePercentage: 40 }, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 35, 40, 0]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, { minSizePercentage: 10 }],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 40, 10]);
  });

  it("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {},
          {},
          {},
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          { minSizePercentage: 10 },
          { minSizePercentage: 10 },
          { minSizePercentage: 10 },
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, {}, {}, { maxSizePercentage: 40 }],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([25, 25, 10, 40]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [{}, { minSizePercentage: 5 }, {}, {}],
        pivotIndices: [2, 3],
        trigger: "imperative-api",
      })
    ).toEqual([20, 5, 0, 75]);
  });

  it("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
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
        groupSizePixels: 100,
        layout: [25, 25, 25, 25],
        panelConstraints: [
          {
            minSizePercentage: 20,
          },
          {
            collapsedSizePercentage: 5,
            collapsible: true,
            minSizePercentage: 20,
          },
          {
            minSizePercentage: 20,
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
          groupSizePixels: 100,
          layout: [50, 50],
          panelConstraints: [{ maxSizePercentage: 50 }, {}],
          pivotIndices: [0, 1],
          trigger: "imperative-api",
        })
      ).toEqual([50, 50]);

      expect(
        adjustLayoutByDelta({
          delta: 1,
          groupSizePixels: 100,
          layout: [50, 50],
          panelConstraints: [{}, { minSizePercentage: 50 }],
          pivotIndices: [0, 1],
          trigger: "imperative-api",
        })
      ).toEqual([50, 50]);
    });
  });
});
