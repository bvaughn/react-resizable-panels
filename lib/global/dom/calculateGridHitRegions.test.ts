import { describe, expect, test } from "vitest";
import type {
  GridAxis,
  GridSeparatorPlacement,
  RegisteredCell
} from "../../components/grid/types";
import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredSeparator } from "../../components/separator/types";
import { setElementBounds } from "../../utils/test/mockBoundingClientRect";
import { calculateGridHitRegions } from "./calculateGridHitRegions";

// 2x2 grid of 50x50 cells separated by 10px gaps
function createCell(
  row: number,
  column: number,
  rowSpan = 1,
  columnSpan = 1
): RegisteredCell {
  const element = document.createElement("div");
  setElementBounds(
    element,
    new DOMRect(column * 60, row * 60, columnSpan * 60 - 10, rowSpan * 60 - 10)
  );

  return { column, columnSpan, element, id: `${row},${column}`, row, rowSpan };
}

function createGroup({
  axis,
  disabledTracks = [],
  separators = [],
  trackCount = 2
}: {
  axis: GridAxis;
  disabledTracks?: number[];
  separators?: RegisteredSeparator[];
  trackCount?: number;
}): RegisteredGroup {
  const element = document.createElement("div");

  return {
    disabled: false,
    element,
    id: axis,
    mutableState: {
      defaultLayout: undefined,
      disableCursor: false,
      expandedPanelSizes: {},
      layouts: {}
    },
    orientation: axis === "column" ? "horizontal" : "vertical",
    panels: Array.from(
      { length: trackCount },
      (_, index): RegisteredPanel => ({
        element,
        id: `${index}`,
        idIsStable: true,
        mutableValues: { expandToSize: undefined, prevSize: undefined },
        onResize: undefined,
        panelConstraints: { disabled: disabledTracks.includes(index) }
      })
    ),
    resizePreviewMode: "panel",
    resizeTargetMinimumSize: { coarse: 0, fine: 0 },
    separators
  };
}

function calculate({
  axis,
  cells,
  crossTrackCount = 2,
  group = createGroup({ axis }),
  includeDisabled = false,
  separatorPlacements = new Map()
}: {
  axis: GridAxis;
  cells: RegisteredCell[];
  crossTrackCount?: number;
  group?: RegisteredGroup;
  includeDisabled?: boolean;
  separatorPlacements?: Map<RegisteredSeparator, GridSeparatorPlacement>;
}) {
  return calculateGridHitRegions({
    axis,
    cells,
    crossTrackCount,
    expandHitTargets: true,
    group,
    groupSize: 100,
    includeDisabled,
    separatorPlacements
  }).map(({ panels, rect, separator }) => ({
    panels: panels.map((panel) => panel.id),
    rect: [rect.x, rect.y, rect.width, rect.height],
    separator: separator?.id
  }));
}

const twoByTwo = () => [
  createCell(0, 0),
  createCell(0, 1),
  createCell(1, 0),
  createCell(1, 1)
];

describe("calculateGridHitRegions", () => {
  test("merges adjacent segments (including gaps) into a single region", () => {
    expect(calculate({ axis: "column", cells: twoByTwo() })).toEqual([
      { panels: ["0", "1"], rect: [50, 0, 10, 110], separator: undefined }
    ]);
    expect(calculate({ axis: "row", cells: twoByTwo() })).toEqual([
      { panels: ["0", "1"], rect: [0, 50, 110, 10], separator: undefined }
    ]);
  });

  test("excludes segments covered by spanning cells", () => {
    const cells = [createCell(0, 0), createCell(0, 1), createCell(1, 0, 1, 2)];

    expect(calculate({ axis: "column", cells })).toEqual([
      { panels: ["0", "1"], rect: [50, 0, 10, 50], separator: undefined }
    ]);
  });

  test("splits boundaries into multiple regions", () => {
    const cells = [
      createCell(0, 0),
      createCell(0, 1),
      createCell(1, 0, 1, 2),
      createCell(2, 0),
      createCell(2, 1)
    ];

    expect(calculate({ axis: "column", cells, crossTrackCount: 3 })).toEqual([
      { panels: ["0", "1"], rect: [50, 0, 10, 50], separator: undefined },
      { panels: ["0", "1"], rect: [50, 120, 10, 50], separator: undefined }
    ]);
  });

  test("includes boundaries next to empty slots", () => {
    const cells = [createCell(0, 0), createCell(1, 1)];

    expect(calculate({ axis: "column", cells })).toEqual([
      { panels: ["0", "1"], rect: [50, 0, 10, 110], separator: undefined }
    ]);
  });

  test("does not include boundaries without any adjacent cells", () => {
    expect(calculate({ axis: "column", cells: [] })).toEqual([]);
  });

  test("expands hit targets to the minimum size", () => {
    const group = {
      ...createGroup({ axis: "column" }),
      resizeTargetMinimumSize: { coarse: 20, fine: 20 }
    };

    expect(calculate({ axis: "column", cells: twoByTwo(), group })).toEqual([
      { panels: ["0", "1"], rect: [45, 0, 20, 110], separator: undefined }
    ]);
  });

  test("prefers explicit separators", () => {
    const element = document.createElement("div");
    setElementBounds(element, new DOMRect(52, 0, 6, 110));
    const separator: RegisteredSeparator = { element, id: "separator" };

    const group = createGroup({
      axis: "column",
      separators: [separator],
      trackCount: 3
    });
    const cells = [
      ...twoByTwo(),
      // Third column (no separator)
      createCell(0, 2),
      createCell(1, 2)
    ];

    expect(
      calculate({
        axis: "column",
        cells,
        group,
        separatorPlacements: new Map([
          [
            separator,
            { axis: "column", crossSpan: undefined, crossStart: 0, index: 1 }
          ]
        ])
      })
    ).toEqual([
      { panels: ["0", "1"], rect: [52, 0, 6, 110], separator: "separator" },
      { panels: ["1", "2"], rect: [110, 0, 10, 110], separator: undefined }
    ]);
  });

  test("excludes disabled separators unless requested", () => {
    const element = document.createElement("div");
    element.setAttribute("aria-disabled", "true");
    setElementBounds(element, new DOMRect(52, 0, 6, 110));
    const separator: RegisteredSeparator = { element, id: "separator" };

    const group = createGroup({ axis: "column", separators: [separator] });
    const separatorPlacements = new Map<
      RegisteredSeparator,
      GridSeparatorPlacement
    >([
      [
        separator,
        { axis: "column", crossSpan: undefined, crossStart: 0, index: 1 }
      ]
    ]);

    expect(
      calculate({
        axis: "column",
        cells: twoByTwo(),
        group,
        separatorPlacements
      })
    ).toEqual([]);
    expect(
      calculate({
        axis: "column",
        cells: twoByTwo(),
        group,
        includeDisabled: true,
        separatorPlacements
      })
    ).toHaveLength(1);
  });

  test("excludes boundaries outside of the enabled tracks", () => {
    const cells = [
      createCell(0, 0),
      createCell(0, 1),
      createCell(0, 2),
      createCell(1, 0),
      createCell(1, 1),
      createCell(1, 2)
    ];

    expect(
      calculate({
        axis: "column",
        cells,
        group: createGroup({
          axis: "column",
          disabledTracks: [0],
          trackCount: 3
        })
      })
    ).toEqual([
      { panels: ["1", "2"], rect: [110, 0, 10, 110], separator: undefined }
    ]);

    expect(
      calculate({
        axis: "column",
        cells,
        group: createGroup({
          axis: "column",
          disabledTracks: [0, 1],
          trackCount: 3
        })
      })
    ).toEqual([]);
  });
});
