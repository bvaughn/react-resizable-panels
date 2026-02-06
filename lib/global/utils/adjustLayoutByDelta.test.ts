import { describe, expect, test } from "vitest";
import type { Layout } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { adjustLayoutByDelta as adjustLayoutByDeltaExternal } from "./adjustLayoutByDelta";

type Args = Parameters<typeof adjustLayoutByDeltaExternal>[0];

function adjustLayoutByDelta({
  delta,
  initialLayout,
  panelConstraints,
  pivotIndices = [0, 1],
  prevLayout,
  trigger = "imperative-api"
}: Omit<Args, "pivotIndices" | "trigger"> & {
  pivotIndices?: Args["pivotIndices"];
  trigger?: Args["trigger"];
}) {
  return adjustLayoutByDeltaExternal({
    delta,
    initialLayout,
    panelConstraints,
    pivotIndices,
    prevLayout,
    trigger
  });
}

function c(partials: Partial<PanelConstraints>[]) {
  const constraints: PanelConstraints[] = [];

  partials.forEach((current, index) => {
    constraints.push({
      collapsedSize: 0,
      collapsible: false,
      defaultSize: undefined,
      disabled: current.disabled,
      maxSize: 100,
      minSize: 0,
      ...current,
      panelId: "" + index
    });
  });

  return constraints;
}

function l(numbers: number[]) {
  const layout: Layout = {};

  numbers.forEach((current, index) => {
    layout[index] = current;
  });

  return layout;
}

describe("adjustLayoutByDelta", () => {
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        initialLayout: l([50, 50]),
        panelConstraints: c([{}, {}]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([51, 49]));
  });

  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([50, 50]),
        panelConstraints: c([{}, {}]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([75, 25]));

    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([50, 50]),
        panelConstraints: c([{}, {}]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([100, 0]));
  });

  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {
            minSize: 20,
            maxSize: 60
          },
          {
            minSize: 10,
            maxSize: 90
          }
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([60, 40]));
  });

  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          }
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([75, 25]));
  });

  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 40,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          }
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([95, 5]));
  });

  // Edge case
  // Expanding from a collapsed state to less than the min size via imperative API should do nothing
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        initialLayout: l([10, 90]),
        panelConstraints: c([
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25
          },
          {}
        ]),
        prevLayout: l([10, 90])
      })
    ).toEqual(l([10, 90]));
  });

  // Edge case
  // Keyboard interactions should always expand a collapsed panel
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        initialLayout: l([10, 90]),
        panelConstraints: c([
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25
          },
          {}
        ]),
        prevLayout: l([10, 90]),
        trigger: "keyboard"
      })
    ).toEqual(l([25, 75]));
  });

  // Edge case
  // Keyboard interactions should always collapse a collapsible panel once it's at the minimum size
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        initialLayout: l([75, 25]),
        panelConstraints: c([
          {},
          {
            collapsible: true,
            minSize: 25
          }
        ]),
        prevLayout: l([75, 25]),
        trigger: "keyboard"
      })
    ).toEqual(l([100, 0]));
  });

  // Edge case
  // Expanding from a collapsed state to less than the min size via imperative API should do nothing
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        initialLayout: l([4, 96]),
        panelConstraints: c([
          {
            collapsedSize: 4,
            collapsible: true,
            defaultSize: 15,
            maxSize: 15,
            minSize: 6
          },
          {
            minSize: 5
          }
        ]),
        prevLayout: l([4, 96])
      })
    ).toEqual(l([4, 96]));
  });

  // Edge case
  // Expanding from a collapsed state to less than the min size via keyboard should snap to min size
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        initialLayout: l([4, 96]),
        panelConstraints: c([
          {
            collapsedSize: 4,
            collapsible: true,
            defaultSize: 15,
            maxSize: 15,
            minSize: 6
          },
          {
            minSize: 5
          }
        ]),
        prevLayout: l([4, 96]),
        trigger: "keyboard"
      })
    ).toEqual(l([6, 94]));
  });

  // Edge case
  // Expanding from a collapsed state to greater than the max size
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([4, 96]),
        panelConstraints: c([
          {
            collapsedSize: 4,
            collapsible: true,
            defaultSize: 15,
            maxSize: 15,
            minSize: 6
          },
          {
            minSize: 5
          }
        ]),
        prevLayout: l([4, 96])
      })
    ).toEqual(l([15, 85]));
  });

  // Edge case
  // Expanding from a collapsed state mimicking an imperative API call
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([5, 95]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            maxSize: 50,
            minSize: 25
          },
          {
            minSize: 50
          }
        ]),
        prevLayout: l([5, 95])
      })
    ).toEqual(l([35, 65]));
  });

  // Edge case
  // Expanding from a collapsed state mimicking an keyboard event
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([5, 95]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            maxSize: 50,
            minSize: 25
          },
          {
            minSize: 50
          }
        ]),
        prevLayout: l([5, 95]),
        trigger: "keyboard"
      })
    ).toEqual(l([35, 65]));
  });

  // Edge case
  // Expanding from a collapsed state mimicking an keyboard event when there is no min size
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([0, 100]),
        panelConstraints: c([
          {
            collapsedSize: 0,
            collapsible: true,
            maxSize: 50,
            minSize: 0
          },
          {}
        ]),
        prevLayout: l([0, 100]),
        trigger: "keyboard"
      })
    ).toEqual(l([30, 70]));
  });

  test("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        initialLayout: l([50, 50]),
        panelConstraints: c([{}, {}]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([49, 51]));
  });

  test("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        initialLayout: l([50, 50]),
        panelConstraints: c([{}, {}]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([25, 75]));
  });

  test("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([50, 50]),
        panelConstraints: c([{}, {}]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([0, 100]));
  });

  test("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {
            minSize: 20,
            maxSize: 60
          },
          {
            minSize: 10,
            maxSize: 90
          }
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([20, 80]));
  });

  test("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          },
          {}
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([25, 75]));
  });

  test("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -30,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          },
          {}
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([25, 75]));

    expect(
      adjustLayoutByDelta({
        delta: -36,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          },
          {}
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([5, 95]));
  });

  test("[1--,2]", () => {
    // Edge case
    // The second panel should prevent the first panel from collapsing
    expect(
      adjustLayoutByDelta({
        delta: -30,
        initialLayout: l([50, 50]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          },
          { maxSize: 80 }
        ]),
        prevLayout: l([50, 50])
      })
    ).toEqual(l([25, 75]));
  });

  // Edge case
  // Keyboard interactions should always expand a collapsed panel
  test("[1--,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        initialLayout: l([90, 10]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25
          }
        ]),
        prevLayout: l([90, 10]),
        trigger: "keyboard"
      })
    ).toEqual(l([75, 25]));
  });

  // Edge case
  // Keyboard interactions should always collapse a collapsible panel once it's at the minimum size
  test("[1++,2]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        initialLayout: l([25, 75]),
        panelConstraints: c([
          {
            collapsedSize: 10,
            collapsible: true,
            minSize: 25
          },
          {}
        ]),
        prevLayout: l([25, 75]),
        trigger: "keyboard"
      })
    ).toEqual(l([10, 90]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([26, 49, 25]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([50, 25, 25]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([75, 0, 25]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 75,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([100, 0, 0]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{ maxSize: 35 }, { minSize: 25 }, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([35, 40, 25]));
  });

  test("[1++,2,3]", () => {
    // Any further than the max size should stop the drag/keyboard resize
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{ maxSize: 35 }, { minSize: 25 }, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([35, 40, 25]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        initialLayout: l([25, 40, 35]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          },
          { minSize: 25 }
        ]),
        prevLayout: l([25, 40, 35])
      })
    ).toEqual(l([30, 35, 35]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 26,
        initialLayout: l([25, 40, 35]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          },
          { minSize: 25 }
        ]),
        prevLayout: l([25, 40, 35])
      })
    ).toEqual(l([60, 5, 35]));
  });

  test("[1++,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 80,
        initialLayout: l([25, 40, 35]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 25
          },
          { minSize: 25 }
        ]),
        prevLayout: l([25, 40, 35])
      })
    ).toEqual(l([70, 5, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([24, 51, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([0, 75, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{ minSize: 20 }, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([24, 51, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{ minSize: 20 }, {}, {}]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([20, 55, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([
          {
            // Implied min size 10
          },
          { maxSize: 70 },
          { maxSize: 20 }
        ]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([20, 55, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([
          {
            // Implied min size 10
          },
          { maxSize: 70 },
          { maxSize: 20 }
        ]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([10, 65, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 15
          },
          {},
          {}
        ]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([15, 60, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 15
          },
          {},
          {}
        ]),
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([5, 70, 25]));
  });

  test("[1--,2,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        initialLayout: l([45, 50, 5]),
        panelConstraints: c([
          {},
          {
            maxSize: 50
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 15
          }
        ]),
        prevLayout: l([45, 50, 5])
      })
    ).toEqual(l([25, 50, 25]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 49, 26]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 25, 50]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 0, 75]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -75,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([0, 0, 100]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, { minSize: 15 }]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 55, 20]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 20,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, { minSize: 15 }]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 60, 15]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, { collapsible: true, minSize: 20 }]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 55, 20]));
  });

  test("[1,2++,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, { collapsible: true, minSize: 20 }]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 55, 20]));

    expect(
      adjustLayoutByDelta({
        delta: 16,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, { collapsible: true, minSize: 20 }]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 75, 0]));
  });

  test("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 51, 24]));
  });

  test("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 75, 0]));
  });

  test("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -20,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, { minSize: 40 }, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([15, 40, 45]));
  });

  test("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([{}, {}, { maxSize: 30 }]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 45, 30]));
  });

  test("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -35,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([20, 20, 60]));

    expect(
      adjustLayoutByDelta({
        delta: -40,
        initialLayout: l([25, 50, 25]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 50, 25])
      })
    ).toEqual(l([25, 5, 70]));
  });

  test("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 0, 75]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {},
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 0, 75])
      })
    ).toEqual(l([20, 0, 80]));

    expect(
      adjustLayoutByDelta({
        delta: -20,
        initialLayout: l([25, 0, 75]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {},
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 0, 75])
      })
    ).toEqual(l([5, 0, 95]));
  });

  // Edge case
  test("[1,2--,3]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        initialLayout: l([100 / 3, 100 / 3, 100 / 3]),
        panelConstraints: c([{}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([100 / 3, 100 / 3, 100 / 3]),
        trigger: "mouse-or-touch"
      })
    ).toEqual(l([0, 0, 100]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 1,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([26, 24, 25, 25]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([50, 0, 25, 25]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([75, 0, 0, 25]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 75,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([100, 0, 0, 0]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 25,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{ maxSize: 35 }, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([35, 15, 25, 25]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 100,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          { minSize: 10 },
          { minSize: 10 },
          { minSize: 10 }
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([70, 10, 10, 10]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          }
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([35, 20, 20, 25]));

    expect(
      adjustLayoutByDelta({
        delta: 15,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          }
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([45, 5, 25, 25]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 40,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          }
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([65, 5, 5, 25]));
  });

  test("[1++,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 100,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          }
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([85, 5, 5, 5]));
  });

  test("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -1,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([24, 26, 25, 25]));
  });

  test("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([0, 50, 25, 25]));
  });

  test("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{ minSize: 20 }, {}, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 30, 25, 25]));
  });

  test("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, { maxSize: 35 }, {}, {}]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([0, 35, 40, 25]));
  });

  test("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {},
          {},
          {}
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 30, 25, 25]));

    expect(
      adjustLayoutByDelta({
        delta: -15,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {},
          {},
          {}
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([5, 45, 25, 25]));
  });

  test("[1--,2,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          { maxSize: 35 },
          {},
          {}
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 30, 25, 25]));

    expect(
      adjustLayoutByDelta({
        delta: -15,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          { maxSize: 35 },
          {},
          {}
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([5, 35, 35, 25]));
  });

  test("[1--,2,3,4]", () => {
    // This might be controversial behavior;
    // Perhaps the 1st panel should collapse
    // rather than being blocked by the max size constraints of the 2nd panel
    // since the 3rd panel has room to grow still
    //
    // An alternate layout result might be: [5, 30, 40, 25]
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          { maxSize: 30 },
          {},
          {}
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 30, 25, 25]));
  });

  test("[1--,2,3,4]", () => {
    // This might be controversial behavior;
    // Perhaps the 1st panel should collapse
    // rather than being blocked by the max size constraints of the 2nd panel
    // since the 3rd panel has room to grow still
    //
    // An alternate layout result might be: [5, 30, 35, 30]
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          { maxSize: 30 },
          { maxSize: 35 },
          {}
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 30, 25, 25]));
  });

  // Edge case (issues/210)
  test("[1--,2,3,4]", () => {
    // If the size doesn't drop below the halfway point, the panel should not collapse
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          { maxSize: 35 },
          { maxSize: 35 },
          { maxSize: 35 }
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 30, 25, 25]));

    // If the size drops below the halfway point, the panel should collapse
    // In this case it needs to add sizes to multiple other panels in order to collapse
    // because the nearest neighbor panel's max size constraints won't allow it to expand to cover all of the difference
    expect(
      adjustLayoutByDelta({
        delta: -20,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          { maxSize: 35 },
          { maxSize: 35 },
          { maxSize: 35 }
        ]),
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([5, 35, 35, 25]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 35, 15, 25]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 55, 0, 20]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 75, 0, 0]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, { maxSize: 35 }, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([65, 35, 0, 0]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, { minSize: 20 }, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 55, 20, 0]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 10
          }
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 35, 15, 25]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 10
          },
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 55, 5, 15]));
  });

  test("[1,2++,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 10
          },
          { minSize: 10 }
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 60, 5, 10]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -25,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 0, 50, 25]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([0, 0, 75, 25]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, { minSize: 20 }, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([0, 20, 55, 25]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{ minSize: 20 }, {}, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 0, 55, 25]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{ minSize: 20 }, { minSize: 20 }, {}, {}]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 20, 35, 25]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -5,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {},
          {},
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 20, 30, 25]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {},
          {},
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([5, 0, 70, 25]));
  });

  test("[1,2--,3,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {},
          {}
        ]),
        pivotIndices: [1, 2],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([0, 5, 70, 25]));
  });

  test("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 25, 35, 15]));
  });

  test("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 25, 50, 0]));
  });

  test("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, { maxSize: 40 }, {}]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 35, 40, 0]));
  });

  test("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 30,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, { minSize: 10 }]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 25, 40, 10]));
  });

  test("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 5,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          }
        ]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 25, 30, 20]));
  });

  test("[1,2,3++,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: 50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {},
          {},
          {},
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          }
        ]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 25, 45, 5]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -10,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 25, 15, 35]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -40,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 10, 0, 65]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, {}]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([0, 0, 0, 100]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          { minSize: 10 },
          { minSize: 10 },
          { minSize: 10 },
          {}
        ]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([10, 10, 10, 70]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, {}, {}, { maxSize: 40 }]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([25, 25, 10, 40]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -50,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([{}, { minSize: 5 }, {}, {}]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 5, 0, 75]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {}
        ]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([5, 5, 5, 85]));
  });

  test("[1,2,3--,4]", () => {
    expect(
      adjustLayoutByDelta({
        delta: -100,
        initialLayout: l([25, 25, 25, 25]),
        panelConstraints: c([
          {
            minSize: 20
          },
          {
            collapsedSize: 5,
            collapsible: true,
            minSize: 20
          },
          {
            minSize: 20
          },
          {}
        ]),
        pivotIndices: [2, 3],
        prevLayout: l([25, 25, 25, 25])
      })
    ).toEqual(l([20, 5, 20, 55]));
  });

  describe("invalid layouts", () => {
    test("should ignore changes that violate max or min size constraints", () => {
      expect(
        adjustLayoutByDelta({
          delta: 1,
          initialLayout: l([50, 50]),
          panelConstraints: c([{ maxSize: 50 }, {}]),
          prevLayout: l([50, 50])
        })
      ).toEqual(l([50, 50]));

      expect(
        adjustLayoutByDelta({
          delta: 1,
          initialLayout: l([50, 50]),
          panelConstraints: c([{}, { minSize: 50 }]),
          prevLayout: l([50, 50])
        })
      ).toEqual(l([50, 50]));
    });
  });

  // Edge case (issues/311)
  test("should fallback to the previous layout if an intermediate layout is invalid", () => {
    expect(
      adjustLayoutByDelta({
        delta: 16,
        initialLayout: l([5, 15, 40, 40]),
        panelConstraints: c([
          { collapsedSize: 5, collapsible: true, minSize: 15, maxSize: 20 },
          { minSize: 30, maxSize: 30 },
          { minSize: 30 },
          { minSize: 20, maxSize: 40 }
        ]),
        prevLayout: l([20, 30, 30, 20])
      })
    ).toEqual(l([20, 30, 30, 20]));
  });

  // Edge case (issues/311)
  test("should (re)collapse an already-collapsed panel that's been expanded and (re)collapsed as part of a single drag", () => {
    expect(
      adjustLayoutByDelta({
        delta: -3,
        initialLayout: l([5, 15, 40, 40]),
        panelConstraints: c([
          { collapsedSize: 5, collapsible: true, minSize: 15, maxSize: 20 },
          { minSize: 15, maxSize: 30 },
          { minSize: 30 },
          { minSize: 20, maxSize: 40 }
        ]),
        prevLayout: l([15, 15, 30, 36])
      })
    ).toEqual(l([5, 15, 40, 40]));
  });

  // Edge case issues/210 and issues/629
  describe("collapsible panel thresholds", () => {
    ["left", "right"].forEach((panelId) => {
      describe(`${panelId} panel with collapsedSize:0`, () => {
        const collapsiblePanelConstraints = {
          collapsedSize: 0,
          collapsible: true,
          minSize: 10
        };

        const open = panelId === "left" ? l([10, 90]) : l([90, 10]);
        const closed = panelId === "left" ? l([0, 100]) : l([100, 0]);
        const panelConstraints =
          panelId === "left"
            ? c([collapsiblePanelConstraints, {}])
            : c([{}, collapsiblePanelConstraints]);

        test("remain open if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -4 : 4,
              initialLayout: open,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });

        test("close if delta is greater than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -6 : 6,
              initialLayout: open,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("re-open if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -4 : 4,
              initialLayout: open,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });

        test("remain closed if delta is more than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -6 : 6,
              initialLayout: open,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("remain closed if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 4 : -4,
              initialLayout: closed,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("open if delta is greater than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 6 : -6,
              initialLayout: closed,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });

        test("close if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 4 : -4,
              initialLayout: closed,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("remain open if delta is more than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 6 : -6,
              initialLayout: closed,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });
      });

      describe(`${panelId} panel with collapsedSize:5`, () => {
        const collapsiblePanelConstraints = {
          collapsedSize: 5,
          collapsible: true,
          minSize: 15
        };

        const open = panelId === "left" ? l([15, 85]) : l([85, 15]);
        const closed = panelId === "left" ? l([5, 95]) : l([95, 5]);
        const panelConstraints =
          panelId === "left"
            ? c([collapsiblePanelConstraints, {}])
            : c([{}, collapsiblePanelConstraints]);

        test("remain open if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -4 : 4,
              initialLayout: open,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });

        test("close if delta is greater than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -6 : 6,
              initialLayout: open,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("re-open if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -4 : 4,
              initialLayout: open,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });

        test("remain closed if delta is more than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? -6 : 6,
              initialLayout: open,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("remain closed if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 4 : -4,
              initialLayout: closed,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("open if delta is greater than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 6 : -6,
              initialLayout: closed,
              panelConstraints,
              prevLayout: closed,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });

        test("close if delta is less than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 4 : -4,
              initialLayout: closed,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(closed);
        });

        test("remain open if delta is more than minimum threshold", () => {
          expect(
            adjustLayoutByDelta({
              delta: panelId === "left" ? 6 : -6,
              initialLayout: closed,
              panelConstraints,
              prevLayout: open,
              trigger: "mouse-or-touch"
            })
          ).toEqual(open);
        });
      });
    });

    describe("3-panel layouts", () => {
      const collapsibleConstraints = {
        collapsedSize: 5,
        collapsible: true,
        minSize: 15
      };

      test("expand left when there are multiple panels", () => {
        expect(
          adjustLayoutByDelta({
            delta: -70,
            initialLayout: l([25, 50, 25]),
            panelConstraints: c([{}, {}, collapsibleConstraints]),
            prevLayout: l([25, 50, 25]),
            pivotIndices: [1, 2],
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([5, 0, 95]));
      });

      test("expand right when there are multiple panels", () => {
        expect(
          adjustLayoutByDelta({
            delta: 70,
            initialLayout: l([25, 50, 25]),
            panelConstraints: c([collapsibleConstraints, {}, {}]),
            prevLayout: l([25, 50, 25]),
            pivotIndices: [0, 1],
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([95, 0, 5]));
      });

      test("edge case issues/639", () => {
        (
          [
            [-10, l([20, 40, 40])],
            [-20, l([20, 30, 50])],
            [-30, l([20, 20, 60])],
            [-40, l([10, 20, 70])],
            [-50, l([0, 20, 80])]
          ] satisfies [number, Layout][]
        ).forEach(([delta, expectedLayout]) => {
          expect(
            adjustLayoutByDelta({
              delta,
              initialLayout: l([20, 50, 30]),
              panelConstraints: c([
                {
                  collapsedSize: 0,
                  collapsible: true,
                  defaultSize: 20,
                  minSize: 10
                },
                {
                  defaultSize: 50,
                  minSize: 20
                },
                {
                  collapsedSize: 0,
                  collapsible: true,
                  defaultSize: 30,
                  minSize: 10
                }
              ]),
              prevLayout: l([20, 50, 30]),
              pivotIndices: [1, 2],
              trigger: "mouse-or-touch"
            })
          ).toEqual(expectedLayout);
        });
      });

      test("edge case issues/650", () => {
        const collapsible = {
          collapsedSize: 0,
          collapsible: true,
          minSize: 10
        };

        (
          [
            [-4, c([collapsible, {}]), l([46, 54])],
            [-6, c([collapsible, {}]), l([44, 56])],
            [-4, c([{}, collapsible]), l([46, 54])],
            [-6, c([{}, collapsible]), l([44, 56])],
            [4, c([collapsible, {}]), l([54, 46])],
            [6, c([collapsible, {}]), l([56, 44])],
            [4, c([{}, collapsible]), l([54, 46])],
            [6, c([{}, collapsible]), l([56, 44])]
          ] satisfies [number, PanelConstraints[], Layout][]
        ).forEach(([delta, panelConstraints, expectedLayout]) => {
          expect(
            adjustLayoutByDelta({
              delta,
              initialLayout: l([50, 50]),
              panelConstraints,
              prevLayout: l([50, 50]),
              pivotIndices: [0, 1],
              trigger: "mouse-or-touch"
            })
          ).toEqual(expectedLayout);
        });
      });

      test("edge case discussions/643", () => {
        (
          [
            [4, l([10, 90])],
            [6, l([20, 80])],
            [10, l([20, 80])],
            [15, l([25, 75])],
            [25, l([35, 65])],
            [40, l([50, 50])],
            [50, l([50, 50])]
          ] satisfies [number, Layout][]
        ).forEach(([delta, expectedLayout]) => {
          expect(
            adjustLayoutByDelta({
              delta,
              initialLayout: l([10, 90]),
              panelConstraints: c([
                {
                  collapsedSize: 10,
                  collapsible: true,
                  defaultSize: 10,
                  maxSize: 50,
                  minSize: 20
                },
                {}
              ]),
              prevLayout: l([10, 90]),
              trigger: "mouse-or-touch"
            })
          ).toEqual(expectedLayout);
        });

        // 2nd panel variation of the above
        (
          [
            [-4, l([90, 10])],
            [-6, l([80, 20])],
            [-10, l([80, 20])],
            [-15, l([75, 25])],
            [-25, l([65, 35])],
            [-40, l([50, 50])],
            [-50, l([50, 50])]
          ] satisfies [number, Layout][]
        ).forEach(([delta, expectedLayout]) => {
          expect(
            adjustLayoutByDelta({
              delta,
              initialLayout: l([90, 10]),
              panelConstraints: c([
                {},
                {
                  collapsedSize: 10,
                  collapsible: true,
                  defaultSize: 10,
                  maxSize: 50,
                  minSize: 20
                }
              ]),
              prevLayout: l([90, 10]),
              trigger: "mouse-or-touch"
            })
          ).toEqual(expectedLayout);
        });
      });
    });
  });

  describe("disabled panels", () => {
    test("should not be resizable in a 2 panel group", () => {
      (
        [
          [-50, c([{ disabled: true }, {}])],
          [50, c([{ disabled: true }, {}])],
          [-50, c([{}, { disabled: true }])],
          [50, c([{}, { disabled: true }])]
        ] satisfies [number, PanelConstraints[]][]
      ).forEach(([delta, panelConstraints]) => {
        expect(
          adjustLayoutByDelta({
            delta,
            initialLayout: l([50, 50]),
            panelConstraints,
            prevLayout: l([50, 50]),
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([50, 50]));
      });
    });

    test("should not be resizable if 1 of 3 panels are disabled", () => {
      const layout = l([25, 50, 25]);

      {
        // Left panel disabled
        const panelConstraints = c([{ disabled: true }, {}, {}]);

        expect(
          adjustLayoutByDelta({
            delta: -25,
            initialLayout: layout,
            panelConstraints,
            pivotIndices: [0, 1],
            prevLayout: layout,
            trigger: "mouse-or-touch"
          })
        ).toEqual(layout);

        expect(
          adjustLayoutByDelta({
            delta: -75,
            initialLayout: layout,
            panelConstraints,
            pivotIndices: [1, 2],
            prevLayout: layout,
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([25, 0, 75]));
      }

      {
        // Center panel disabled
        const panelConstraints = c([{}, { disabled: true }, {}]);

        expect(
          adjustLayoutByDelta({
            delta: -25,
            initialLayout: layout,
            panelConstraints,
            pivotIndices: [0, 1],
            prevLayout: layout,
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([0, 50, 50]));

        expect(
          adjustLayoutByDelta({
            delta: -25,
            initialLayout: layout,
            panelConstraints,
            pivotIndices: [1, 2],
            prevLayout: layout,
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([0, 50, 50]));
      }

      {
        // Right panel disabled
        const panelConstraints = c([{}, {}, { disabled: true }]);

        expect(
          adjustLayoutByDelta({
            delta: -25,
            initialLayout: layout,
            panelConstraints,
            pivotIndices: [0, 1],
            prevLayout: layout,
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([0, 75, 25]));

        expect(
          adjustLayoutByDelta({
            delta: -25,
            initialLayout: layout,
            panelConstraints,
            pivotIndices: [1, 2],
            prevLayout: layout,
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([25, 50, 25]));
      }
    });

    test("should not be resizable if 2 of 3 panels are disabled", () => {
      (
        [
          [-50, c([{ disabled: true }, { disabled: true }, {}])],
          [50, c([{ disabled: true }, { disabled: true }, {}])],
          [-50, c([{ disabled: true }, {}, { disabled: true }])],
          [50, c([{ disabled: true }, {}, { disabled: true }])],
          [-50, c([{}, { disabled: true }, { disabled: true }])],
          [50, c([{}, { disabled: true }, { disabled: true }])]
        ] satisfies [number, PanelConstraints[]][]
      ).forEach(([delta, panelConstraints]) => {
        expect(
          adjustLayoutByDelta({
            delta,
            initialLayout: l([25, 50, 25]),
            panelConstraints,
            pivotIndices: [0, 1],
            prevLayout: l([25, 50, 25]),
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([25, 50, 25]));

        expect(
          adjustLayoutByDelta({
            delta,
            initialLayout: l([25, 50, 25]),
            panelConstraints,
            pivotIndices: [1, 2],
            prevLayout: l([25, 50, 25]),
            trigger: "mouse-or-touch"
          })
        ).toEqual(l([25, 50, 25]));
      });
    });

    test("should be resizable via the imperative API", () => {
      (
        [
          [-5, c([{ disabled: true }, {}]), l([45, 55])],
          [5, c([{ disabled: true }, {}]), l([55, 45])],
          [-5, c([{}, { disabled: true }]), l([45, 55])],
          [5, c([{}, { disabled: true }]), l([55, 45])]
        ] satisfies [number, PanelConstraints[], Layout][]
      ).forEach(([delta, panelConstraints, expectedLayout]) => {
        expect(
          adjustLayoutByDelta({
            delta,
            initialLayout: l([50, 50]),
            panelConstraints,
            prevLayout: l([50, 50]),
            trigger: "imperative-api"
          })
        ).toEqual(expectedLayout);
      });
    });
  });
});
