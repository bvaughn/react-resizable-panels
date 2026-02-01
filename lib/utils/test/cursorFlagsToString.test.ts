import { describe, expect, test } from "vitest";
import { CursorFlags } from "../../constants";
import { cursorFlagsToString } from "./cursorFlagsToString";

describe("cursorFlagsToString", () => {
  test.each([
    [0, ""],
    [CursorFlags.horizontal, "horizontal"],
    [CursorFlags.horizontalMax, "horizontal-max"],
    [CursorFlags.horizontalMin, "horizontal-min"],
    [CursorFlags.vertical, "vertical"],
    [CursorFlags.verticalMax, "vertical-max"],
    [CursorFlags.verticalMin, "vertical-min"],
    [CursorFlags.horizontal | CursorFlags.vertical, "horizontal + vertical"],
    [
      CursorFlags.horizontalMax | CursorFlags.vertical,
      "horizontal-max + vertical"
    ],
    [
      CursorFlags.horizontalMin | CursorFlags.vertical,
      "horizontal-min + vertical"
    ],
    [
      CursorFlags.horizontal | CursorFlags.verticalMax,
      "horizontal + vertical-max"
    ],
    [
      CursorFlags.horizontal | CursorFlags.verticalMin,
      "horizontal + vertical-min"
    ]
  ])("test: %o -> %s", (cursorFlags, expectedString) => {
    expect(cursorFlagsToString(cursorFlags)).toBe(expectedString);
  });
});
