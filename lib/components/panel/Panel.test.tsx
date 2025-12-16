import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Panel } from "./Panel";
import { Group } from "../group/Group";
import { assert } from "../../utils/assert";

describe("Panel", () => {
  test("should throw if rendered outside of a Group", () => {
    expect(() => render(<Panel />)).toThrow(
      "Group Context not found; did you render a Panel or Separator outside of a Group?"
    );
  });

  describe("HTML attributes", () => {
    test("should expose id as testid", () => {
      const { container } = render(
        <Group>
          <Panel id="panel" />
        </Group>
      );

      const panel = container.querySelector("[data-panel]");
      assert(panel);

      expect(panel.getAttribute("data-testid")).toBe("panel");
    });

    test("should pass through ...rest attributes", () => {
      const { container } = render(
        <Group>
          <Panel data-foo="abc" data-bar="123" id="separator" />
        </Group>
      );

      const panel = container.querySelector("[data-panel]");
      assert(panel);

      expect(panel.getAttribute("data-foo")).toBe("abc");
      expect(panel.getAttribute("data-bar")).toBe("123");
    });

    describe("ARIA attributes", () => {
      test("should pass through explicit id prop", () => {
        const { container } = render(
          <Group>
            <Panel id="panel" />
          </Group>
        );

        const panel = container.querySelector("[data-panel]");
        assert(panel);

        expect(panel.getAttribute("data-testid")).toBe("panel");
        expect(panel.getAttribute("id")).toBe("panel");
      });

      test("should assign an id prop to support the ARIA separator", () => {
        const { container } = render(
          <Group>
            <Panel />
          </Group>
        );

        const panel = container.querySelector("[data-panel]");
        assert(panel);

        expect(panel.hasAttribute("data-testid")).toBe(true);
        expect(panel.hasAttribute("id")).toBe(true);
      });
    });
  });
});
