import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Panel } from "./Panel";
import { Group } from "../group/Group";

describe("Panel", () => {
  test("should throw if rendered outside of a Group", () => {
    expect(() => render(<Panel />)).toThrow(
      "Group Context not found; did you render a Panel or Separator outside of a Group?"
    );
  });

  test("should expose id as testid", () => {
    const { container } = render(
      <Group>
        <Panel id="panel" />
      </Group>
    );

    expect(
      container.querySelector("[data-panel]")?.getAttribute("data-testid")
    ).toBe("panel");
  });

  describe("ARIA attributes", () => {
    test("should pass through explicit id prop", () => {
      const { container } = render(
        <Group>
          <Panel id="panel" />
        </Group>
      );

      const panel = container.querySelector("[data-panel]");

      expect(panel?.getAttribute("data-testid")).toBe("panel");
      expect(panel?.getAttribute("id")).toBe("panel");
    });

    test("should assign an id prop to support the ARIA separator", () => {
      const { container } = render(
        <Group>
          <Panel />
        </Group>
      );

      const panel = container.querySelector("[data-panel]");

      expect(panel?.hasAttribute("data-testid")).toBe(true);
      expect(panel?.hasAttribute("id")).toBe(true);
    });
  });
});
