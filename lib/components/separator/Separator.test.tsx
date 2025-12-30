import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Group } from "../group/Group";
import { Panel } from "../panel/Panel";
import { Separator } from "./Separator";

describe("Separator", () => {
  describe("HTML attributes", () => {
    test("should expose id and data-testid", () => {
      render(
        <Group>
          <Panel />
          <Separator id="separator" />
          <Panel />
        </Group>
      );

      expect(screen.getByRole("separator")).toHaveAttribute(
        "data-testid",
        "separator"
      );
      expect(screen.getByRole("separator")).toHaveAttribute("id", "separator");
    });

    test("should pass through ...rest attributes", () => {
      render(
        <Group>
          <Panel />
          <Separator data-foo="abc" data-bar="123" />
          <Panel />
        </Group>
      );

      expect(screen.getByRole("separator")).toHaveAttribute("data-foo", "abc");
      expect(screen.getByRole("separator")).toHaveAttribute("data-bar", "123");
    });

    test.each([
      [-1, 0],
      [undefined, 0],
      [0, 0],
      [1, 1],
      [100, 100]
    ])("should apply tabIndex %o as %o", (tabIndex, expectedTabIndex) => {
      render(
        <Group>
          <Panel />
          <Separator id="separator" tabIndex={tabIndex} />
          <Panel />
        </Group>
      );

      expect(screen.getByRole("separator")).toHaveAttribute(
        "tabIndex",
        "" + expectedTabIndex
      );
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
});
