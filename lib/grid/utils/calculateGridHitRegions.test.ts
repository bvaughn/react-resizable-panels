import { describe, expect, test, vi } from "vitest";
import type {
  RegisteredResizeAxis,
  RegisteredResizeItem,
  RegisteredSeparator
} from "../../global/types";
import type {
  GridAxis,
  GridSeparatorPlacement,
  RegisteredCell
} from "../types";
import { setElementBounds } from "../../shared/utils/test/mockBoundingClientRect";
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
}): RegisteredResizeAxis {
  const element = document.createElement("div");

  return {
    disabled: false,
    element,
    id: axis,
    mutableState: {
      defaultLayout: undefined,
      disableCursor: false,
      expandedItemSizes: {},
      layouts: {}
    },
    orientation: axis === "column" ? "horizontal" : "vertical",
    items: Array.from(
      { length: trackCount },
      (_, index): RegisteredResizeItem => ({
        element,
        id: `${index}`,
        idIsStable: true,
        mutableValues: { expandToSize: undefined, prevSize: undefined },
        onResize: undefined,
        constraintProps: { disabled: disabledTracks.includes(index) }
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
  group?: RegisteredResizeAxis;
  includeDisabled?: boolean;
  separatorPlacements?: Map<RegisteredSeparator, GridSeparatorPlacement>;
}) {
  return calculateGridHitRegions({
    axis,
    cells,
    crossTrackCount,
    expandHitTargets: true,
    resizeAxis: group,
    getAxisSize: () => 100,
    includeDisabled,
    separatorPlacements
  }).map(({ items: panels, rect, separator }) => ({
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
            {
              axis: "column",
              crossSpan: undefined,
              crossStart: 0,
              disabled: false,
              index: 1
            }
          ]
        ])
      })
    ).toEqual([
      { panels: ["0", "1"], rect: [52, 0, 6, 110], separator: "separator" },
      { panels: ["1", "2"], rect: [110, 0, 10, 110], separator: undefined }
    ]);
  });

  test.each(["column", "row"] as const)(
    "extends %s separators that span a subset of tracks into the adjacent gaps",
    (axis) => {
      const column = axis === "column";

      // 2x3 (or 3x2) grid with a cell spanning the boundary in the middle track;
      // separators are rendered alongside of the first and last tracks only
      const cells = column
        ? [
            createCell(0, 0),
            createCell(0, 1),
            createCell(1, 0, 1, 2),
            createCell(2, 0),
            createCell(2, 1)
          ]
        : [
            createCell(0, 0),
            createCell(1, 0),
            createCell(0, 1, 2, 1),
            createCell(0, 2),
            createCell(1, 2)
          ];

      const first = document.createElement("div");
      const last = document.createElement("div");
      setElementBounds(
        first,
        column ? new DOMRect(52, 0, 6, 50) : new DOMRect(0, 52, 50, 6)
      );
      setElementBounds(
        last,
        column ? new DOMRect(52, 120, 6, 50) : new DOMRect(120, 52, 50, 6)
      );
      const firstSeparator: RegisteredSeparator = {
        element: first,
        id: "first"
      };
      const lastSeparator: RegisteredSeparator = { element: last, id: "last" };

      expect(
        calculate({
          axis,
          cells,
          crossTrackCount: 3,
          group: createGroup({
            axis,
            separators: [firstSeparator, lastSeparator]
          }),
          separatorPlacements: new Map<
            RegisteredSeparator,
            GridSeparatorPlacement
          >([
            [
              firstSeparator,
              { axis, crossSpan: 1, crossStart: 0, disabled: false, index: 1 }
            ],
            [
              lastSeparator,
              {
                axis,
                crossSpan: undefined,
                crossStart: 2,
                disabled: false,
                index: 1
              }
            ]
          ])
        })
      ).toEqual([
        {
          panels: ["0", "1"],
          // Extends through the gap after the first track (up to the spanning cell)
          rect: column ? [52, 0, 6, 60] : [0, 52, 60, 6],
          separator: "first"
        },
        {
          panels: ["0", "1"],
          // Extends through the gap before the last track (up to the spanning cell)
          rect: column ? [52, 110, 6, 60] : [110, 52, 60, 6],
          separator: "last"
        }
      ]);
    }
  );

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
        {
          axis: "column",
          crossSpan: undefined,
          crossStart: 0,
          disabled: false,
          index: 1
        }
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

  test("does not measure the axis if there are no resizable boundaries", () => {
    const getAxisSize = vi.fn(() => 100);

    expect(
      calculateGridHitRegions({
        axis: "column",
        cells: twoByTwo(),
        crossTrackCount: 2,
        expandHitTargets: true,
        getAxisSize,
        includeDisabled: false,
        resizeAxis: createGroup({ axis: "column", disabledTracks: [0] }),
        separatorPlacements: new Map()
      })
    ).toEqual([]);
    expect(getAxisSize).not.toHaveBeenCalled();
  });

  test("reads each cell's bounds at most once", () => {
    // Rows: 0 (two cells), 1 (spanning cell), 2 (two cells); gridlines above and below the spanning cell
    const cells = [
      createCell(0, 0),
      createCell(0, 1),
      createCell(1, 0, 1, 2),
      createCell(2, 0),
      createCell(2, 1)
    ];
    const spies = cells.map((cell) =>
      vi.spyOn(cell.element, "getBoundingClientRect")
    );

    const createSeparator = (id: string, y: number) => {
      const element = document.createElement("div");
      setElementBounds(element, new DOMRect(50, y, 10, 50));
      return { element, id } satisfies RegisteredSeparator;
    };
    const before = createSeparator("before", 0);
    const after = createSeparator("after", 120);

    const getAxisSize = vi.fn(() => 100);
    const regions = calculateGridHitRegions({
      axis: "column",
      cells,
      crossTrackCount: 3,
      expandHitTargets: true,
      getAxisSize,
      includeDisabled: false,
      resizeAxis: createGroup({
        axis: "column",
        separators: [before, after]
      }),
      separatorPlacements: new Map([
        [
          before,
          {
            axis: "column",
            crossSpan: 1,
            crossStart: 0,
            disabled: false,
            index: 1
          }
        ],
        [
          after,
          {
            axis: "column",
            crossSpan: 1,
            crossStart: 2,
            disabled: false,
            index: 1
          }
        ]
      ])
    });

    expect(
      regions.map(({ axisSize, rect, separator }) => ({
        axisSize,
        rect: [rect.x, rect.y, rect.width, rect.height],
        separator: separator?.id
      }))
    ).toEqual([
      // Extended into the gaps next to the spanning cell, but not over it
      { axisSize: 100, rect: [50, 0, 10, 60], separator: "before" },
      { axisSize: 100, rect: [50, 110, 10, 60], separator: "after" }
    ]);
    expect(getAxisSize).toHaveBeenCalledTimes(1);
    spies.forEach((spy) => {
      expect(spy.mock.calls.length).toBeLessThanOrEqual(1);
    });
  });

  test("uses precomputed slots when provided", () => {
    const cells = twoByTwo();
    const getSlots = vi.fn(() => [
      [cells[0], cells[1]],
      [cells[2], cells[3]]
    ]);

    expect(
      calculateGridHitRegions({
        axis: "column",
        cells,
        crossTrackCount: 2,
        expandHitTargets: true,
        getAxisSize: () => 100,
        getSlots,
        includeDisabled: false,
        resizeAxis: createGroup({ axis: "column" }),
        separatorPlacements: new Map()
      }).map(({ rect }) => [rect.x, rect.y, rect.width, rect.height])
    ).toEqual([[50, 0, 10, 110]]);
    expect(getSlots).toHaveBeenCalledTimes(1);
  });
});
