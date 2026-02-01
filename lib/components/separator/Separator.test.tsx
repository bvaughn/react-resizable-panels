import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { Group } from "../group/Group";
import { Panel } from "../panel/Panel";
import { Separator } from "./Separator";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";

describe("Separator", () => {
  beforeEach(() => {
    setElementBoundsFunction((element) => {
      if (element.hasAttribute("data-group")) {
        return new DOMRect(0, 0, 100, 50);
      } else {
        const x = parseInt(element.getAttribute("data-x") || "0");
        return new DOMRect(x, 0, 50, 50);
      }
    });
  });

  describe("HTML attributes", () => {
    test("should expose id and data-testid", () => {
      render(
        <Group>
          <Panel data-x="0" />
          <Separator data-x="10" id="separator" />
          <Panel data-x="20" />
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

    describe("ARIA attributes", () => {
      test("should identify its primary panel by id", () => {
        render(
          <Group>
            <Panel data-x="0" id="left-panel" />
            <Separator data-x="10" id="left-separator" />
            <Panel data-x="20" />
            <Separator data-x="30" id="right-separator" />
            <Panel data-x="40" />
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
