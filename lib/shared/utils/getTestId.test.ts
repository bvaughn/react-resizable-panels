import { describe, expect, test } from "vitest";
import { getTestId } from "./getTestId";

describe("getTestId", () => {
  test("should use the id prop", () => {
    expect(getTestId({}, "id")).toBe("id");
    expect(getTestId(undefined, "id")).toBe("id");
    expect(getTestId({}, 0)).toBe("0");
  });

  test("should prefer the data-testid prop", () => {
    expect(getTestId({ "data-testid": "testid" }, "id")).toBe("testid");
    expect(getTestId({ "data-testid": "testid" }, undefined)).toBe("testid");
    expect(getTestId({ "data-testid": 0 }, "id")).toBe("0");
  });

  test("should ignore undefined and empty values", () => {
    expect(getTestId({}, undefined)).toBeUndefined();
    expect(getTestId({}, "")).toBeUndefined();
    expect(getTestId({ "data-testid": undefined }, "id")).toBe("id");
    expect(getTestId({ "data-testid": "" }, "id")).toBe("id");
    expect(getTestId({ "data-testid": "" }, "")).toBeUndefined();
  });
});
