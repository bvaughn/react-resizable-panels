import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Group } from "../group/Group";
import { Panel } from "../panel/Panel";
import { Separator } from "./Separator";

describe("Separator", () => {
  describe("id/data-testid", () => {
    test("should expose explicit id and testid", () => {
      const { container } = render(
        <Group>
          <Panel />
          <Separator id="separator" />
          <Panel />
        </Group>
      );

      const separator = container.querySelector("[data-separator]");

      expect(separator?.getAttribute("data-testid")).toBe("separator");
      expect(separator?.getAttribute("id")).toBe("separator");
    });
  });

  describe("ARIA attributes", () => {
    test("should identify its primary panel if and only if it has an explicit id", () => {
      render(
        <Group>
          <Panel id="left-panel" />
          <Separator id="left-separator" />
          <Panel />
          <Separator id="right-separator" />
          <Panel />
        </Group>
      );

      expect(screen.getByTestId("left-separator")).toHaveAttribute(
        "aria-controls",
        "left-panel"
      );
      expect(screen.getByTestId("right-separator")).toHaveAttribute(
        "aria-controls"
      );
    });
  });
});
