import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Panel } from "./Panel";

describe("Panel", () => {
  test("should throw if rendered outside of a Group", () => {
    expect(() => render(<Panel />)).toThrow(
      "Group Context not found; did you render a Panel or Separator outside of a Group?"
    );
  });
});
