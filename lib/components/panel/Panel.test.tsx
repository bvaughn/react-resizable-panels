import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Group } from "../group/Group";
import { Panel } from "./Panel";

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

      const panel = container.querySelector("[data-panel]") as HTMLElement;

      expect(panel.getAttribute("data-testid")).toBe("panel");
    });

    test("should pass through ...rest attributes", () => {
      const { container } = render(
        <Group>
          <Panel data-foo="abc" data-bar="123" />
        </Group>
      );

      const panel = container.querySelector("[data-panel]") as HTMLElement;

      expect(panel.getAttribute("data-foo")).toBe("abc");
      expect(panel.getAttribute("data-bar")).toBe("123");
    });

    test("problematic styles should be suppressed", () => {
      const { container } = render(
        <Group>
          <Panel
            style={{
              minHeight: 100,
              maxHeight: 100,
              height: 100,

              minWidth: 100,
              maxWidth: 100,
              width: 100,

              border: "100px solid black",
              borderWidth: 100,
              padding: 100,
              margin: 100
            }}
          />
        </Group>
      );

      const panel = container.querySelector("[data-panel]") as HTMLElement;

      expect(panel.style.minHeight).toBe("unset");
      expect(panel.style.maxHeight).toBe("unset");
      expect(panel.style.height).toBe("unset");

      expect(panel.style.minWidth).toBe("unset");
      expect(panel.style.maxWidth).toBe("unset");
      expect(panel.style.width).toBe("unset");

      expect(panel.style.border).toBe("unset");
      expect(panel.style.borderWidth).toBe("unset");
      expect(panel.style.padding).toBe("unset");
      expect(panel.style.margin).toBe("unset");
    });

    describe("ARIA attributes", () => {
      test("should pass through explicit id prop", () => {
        const { container } = render(
          <Group>
            <Panel id="panel" />
          </Group>
        );

        const panel = container.querySelector("[data-panel]") as HTMLElement;

        expect(panel.getAttribute("data-testid")).toBe("panel");
        expect(panel.getAttribute("id")).toBe("panel");
      });

      test("should assign an id prop to support the ARIA separator", () => {
        const { container } = render(
          <Group>
            <Panel />
          </Group>
        );

        const panel = container.querySelector("[data-panel]") as HTMLElement;

        expect(panel.hasAttribute("data-testid")).toBe(true);
        expect(panel.hasAttribute("id")).toBe(true);
      });
    });
  });
});
