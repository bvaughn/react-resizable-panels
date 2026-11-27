// @vitest-environment jsdom

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { Group, Panel, Separator, useIsResizing } from "../../index";
import { setElementBoundsFunction } from "../utils/test/mockBoundingClientRect";

function Status({ groupId, testId }: { groupId?: string; testId: string }) {
  const isResizing = useIsResizing(groupId);

  return <div data-testid={testId}>{isResizing ? "resizing" : "idle"}</div>;
}

describe("useIsResizing", () => {
  beforeEach(() => {
    setElementBoundsFunction((element) => {
      switch (element.id) {
        case "group": {
          return new DOMRect(0, 0, 100, 50);
        }
        case "separator": {
          return new DOMRect(50, 0, 0, 50);
        }
        case "right": {
          return new DOMRect(50, 0, 50, 50);
        }
        default: {
          return new DOMRect(0, 0, 50, 50);
        }
      }
    });
  });

  async function startDrag() {
    const user = userEvent.setup();
    await user.pointer({
      keys: "[MouseLeft>]",
      target: document.querySelector<HTMLElement>('[data-testid="separator"]')!,
      coords: { clientX: 50, clientY: 25 }
    });
    await user.pointer({ coords: { clientX: 60, clientY: 25 } });

    return () => user.pointer({ keys: "[/MouseLeft]" });
  }

  test("returns false outside of a Group", () => {
    const { getByTestId } = render(<Status testId="status" />);

    expect(getByTestId("status").textContent).toBe("idle");
  });

  test("tracks the nearest Group by default", async () => {
    const { getByTestId } = render(
      <Group id="group">
        <Panel id="left">
          <Status testId="status" />
        </Panel>
        <Separator id="separator" />
        <Panel id="right" />
      </Group>
    );
    expect(getByTestId("status").textContent).toBe("idle");

    const endDrag = await startDrag();
    expect(getByTestId("status").textContent).toBe("resizing");

    await endDrag();
    expect(getByTestId("status").textContent).toBe("idle");
  });

  test("tracks the Group with the specified id", async () => {
    const { getByTestId } = render(
      <>
        <Status groupId="group" testId="status" />
        <Group id="group">
          <Panel id="left" />
          <Separator id="separator" />
          <Panel id="right" />
        </Group>
      </>
    );
    expect(getByTestId("status").textContent).toBe("idle");

    const endDrag = await startDrag();
    expect(getByTestId("status").textContent).toBe("resizing");

    await endDrag();
    expect(getByTestId("status").textContent).toBe("idle");
  });
});
