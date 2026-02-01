import { beforeEach, describe, expect, test } from "vitest";
import { CursorFlags } from "../../constants";
import { MutableGroupForTest } from "../../state/tests/MutableGroupForTest";
import { getCursorStyle } from "./getCursorStyle";
import { overrideSupportsAdvancedCursorStylesForTesting } from "./supportsAdvancedCursorStyles";

describe("getCursorStyle", () => {
  const horizontalGroup = new MutableGroupForTest({
    rect: new DOMRect(0, 0, 100, 50),
    orientation: "horizontal"
  });
  horizontalGroup.addMutablePanel(new DOMRect(0, 0, 50, 50));
  horizontalGroup.addMutablePanel(new DOMRect(50, 0, 50, 50));

  const verticalGroup = new MutableGroupForTest({
    orientation: "vertical",
    rect: new DOMRect(0, 0, 100, 50)
  });
  verticalGroup.addMutablePanel(new DOMRect(0, 0, 50, 50));
  verticalGroup.addMutablePanel(new DOMRect(50, 0, 50, 50));

  const disabledGroup = new MutableGroupForTest({
    rect: new DOMRect(0, 0, 100, 50)
  });
  disabledGroup.disableCursor = true;
  disabledGroup.addMutablePanel(new DOMRect(0, 0, 50, 50));
  disabledGroup.addMutablePanel(new DOMRect(50, 0, 50, 50));

  describe("advanced cursor style support", () => {
    beforeEach(() => {
      overrideSupportsAdvancedCursorStylesForTesting(true);
    });

    describe("state: inactive", () => {
      test("should return null", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup, verticalGroup],
            state: "inactive"
          })
        ).toBeUndefined();
      });
    });

    describe("state: hover", () => {
      test("horizontal", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup],
            state: "hover"
          })
        ).toBe("ew-resize");
      });

      test("vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [verticalGroup],
            state: "hover"
          })
        ).toBe("ns-resize");
      });

      test("horizontal and vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup, verticalGroup],
            state: "hover"
          })
        ).toBe("move");
      });

      test("cursor flags should be ignored", () => {
        expect(
          getCursorStyle({
            cursorFlags: CursorFlags.horizontalMax,
            groups: [horizontalGroup],
            state: "hover"
          })
        ).toBe("ew-resize");
      });

      test("disabled groups", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [disabledGroup],
            state: "hover"
          })
        ).toBeUndefined();
      });
    });

    describe("state: active", () => {
      test("horizontal", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup],
            state: "active"
          })
        ).toBe("ew-resize");
      });

      test("vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [verticalGroup],
            state: "active"
          })
        ).toBe("ns-resize");
      });

      test("horizontal and vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup, verticalGroup],
            state: "active"
          })
        ).toBe("move");
      });

      test.each([
        [CursorFlags.horizontalMin, "e-resize"],
        [CursorFlags.horizontalMin | CursorFlags.verticalMin, "se-resize"],
        [CursorFlags.horizontalMin | CursorFlags.verticalMax, "ne-resize"],
        [CursorFlags.horizontalMax, "w-resize"],
        [CursorFlags.horizontalMax | CursorFlags.verticalMin, "sw-resize"],
        [CursorFlags.horizontalMax | CursorFlags.verticalMax, "nw-resize"],
        [CursorFlags.verticalMin, "s-resize"],
        [CursorFlags.verticalMax, "n-resize"]
      ])("cursor flags: %i -> %s", (cursorFlags, expected) => {
        expect(
          getCursorStyle({
            cursorFlags,
            groups: [horizontalGroup, verticalGroup],
            state: "active"
          })
        ).toBe(expected);
      });

      test("disabled groups", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [disabledGroup],
            state: "active"
          })
        ).toBeUndefined();
      });
    });
  });

  describe("basic cursor style support", () => {
    beforeEach(() => {
      overrideSupportsAdvancedCursorStylesForTesting(false);
    });

    describe("state: inactive", () => {
      test("should return null", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup, verticalGroup],
            state: "inactive"
          })
        ).toBeUndefined();
      });
    });

    describe("state: hover", () => {
      test("horizontal", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup],
            state: "hover"
          })
        ).toBe("col-resize");
      });

      test("vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [verticalGroup],
            state: "hover"
          })
        ).toBe("row-resize");
      });

      test("horizontal and vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup, verticalGroup],
            state: "hover"
          })
        ).toBe("grab");
      });

      test("cursor flags should be ignored", () => {
        expect(
          getCursorStyle({
            cursorFlags: CursorFlags.horizontalMax,
            groups: [horizontalGroup],
            state: "hover"
          })
        ).toBe("col-resize");
      });

      test("disabled groups", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [disabledGroup],
            state: "hover"
          })
        ).toBeUndefined();
      });
    });

    describe("state: active", () => {
      test("horizontal", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup],
            state: "active"
          })
        ).toBe("col-resize");
      });

      test("vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [verticalGroup],
            state: "active"
          })
        ).toBe("row-resize");
      });

      test("horizontal and vertical", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [horizontalGroup, verticalGroup],
            state: "active"
          })
        ).toBe("grab");
      });

      test.each([
        [CursorFlags.horizontalMin, "grab"],
        [CursorFlags.horizontalMin | CursorFlags.verticalMin, "grab"],
        [CursorFlags.horizontalMin | CursorFlags.verticalMax, "grab"],
        [CursorFlags.horizontalMax, "grab"],
        [CursorFlags.horizontalMax | CursorFlags.verticalMin, "grab"],
        [CursorFlags.horizontalMax | CursorFlags.verticalMax, "grab"],
        [CursorFlags.verticalMin, "grab"],
        [CursorFlags.verticalMax, "grab"]
      ])("cursor flags: %i -> %s", (cursorFlags, expected) => {
        expect(
          getCursorStyle({
            cursorFlags,
            groups: [horizontalGroup, verticalGroup],
            state: "active"
          })
        ).toBe(expected);
      });

      test("disabled groups", () => {
        expect(
          getCursorStyle({
            cursorFlags: 0,
            groups: [disabledGroup],
            state: "active"
          })
        ).toBeUndefined();
      });
    });
  });
});
