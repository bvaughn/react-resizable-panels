import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, Profiler } from "react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getRegisteredGroup } from "../../global/mutable-state/groups";
import {
  getInteractionState,
  updateInteractionState
} from "../../global/mutable-state/interactions";
import type { InteractionActive } from "../../global/mutable-state/types";
import { mockGroup } from "../../global/test/mockGroup";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import { Separator } from "../separator/Separator";
import { SeparatorOverlay } from "../separator/SeparatorOverlay";
import { Group } from "./Group";
import { ResizePreview } from "./ResizePreview";
import type { GroupImperativeHandle } from "./types";

describe("separator previews", () => {
  afterEach(() =>
    updateInteractionState({ state: "inactive", cursorFlags: 0 })
  );

  describe("preview lifecycle", () => {
    function setBounds() {
      setElementBoundsFunction((element) => {
        switch (element.id) {
          case "group": {
            return new DOMRect(0, 0, 210, 100);
          }
          case "a": {
            return new DOMRect(0, 0, 100, 100);
          }
          case "separator": {
            return new DOMRect(100, 0, 10, 100);
          }
          case "b": {
            return new DOMRect(110, 0, 100, 100);
          }
        }
      });
    }

    function ui(label: string, key = "group", disabled = false) {
      return (
        <Group
          disabled={disabled}
          id="group"
          key={key}
          resizePreviewMode="separator"
        >
          <SeparatorOverlay>default</SeparatorOverlay>
          <Panel id="a" />
          <Separator
            id="separator"
            preview={
              label ? <SeparatorOverlay>{label}</SeparatorOverlay> : undefined
            }
          />
          <Panel id="b" />
        </Group>
      );
    }

    test("updates and removes a custom preview without moving the pointer", async () => {
      setBounds();
      const { container, rerender } = render(ui("old"));
      const user = userEvent.setup();

      await user.pointer({
        keys: "[MouseLeft>]",
        coords: { clientX: 105, clientY: 50 }
      });
      const group = getRegisteredGroup("group", true);
      expect(
        container.querySelector("[data-resize-preview]")
      ).toHaveTextContent("old");

      rerender(ui("new"));
      expect(
        container.querySelector("[data-resize-preview]")
      ).toHaveTextContent("new");
      expect(getRegisteredGroup("group", true)).toBe(group);
      expect(getInteractionState().state).toBe("active");

      rerender(ui(""));
      expect(
        container.querySelector("[data-resize-preview]")
      ).toHaveTextContent("default");
      await user.pointer({ keys: "[/MouseLeft]" });
    });

    for (const replacement of ["remount", "disable"] as const) {
      test(`clears previews on group ${replacement}`, async () => {
        setBounds();
        const { container, rerender } = render(ui("old"));
        const user = userEvent.setup();

        await user.pointer({
          keys: "[MouseLeft>]",
          coords: { clientX: 105, clientY: 50 }
        });
        expect(
          container.querySelector("[data-resize-preview]")
        ).toHaveTextContent("old");

        rerender(
          ui(
            "new",
            replacement === "remount" ? "new" : "group",
            replacement === "disable"
          )
        );
        expect(container.querySelector("[data-resize-preview]")).toBeNull();
        expect(getInteractionState().state).toBe("inactive");

        await user.pointer({ keys: "[/MouseLeft]" });
      });
    }
  });

  test("copies computed HTML and SVG styles inside an iframe", () => {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    const ownerDocument = iframe.contentDocument!;
    const ownerWindow = ownerDocument.defaultView!;
    ownerDocument.body.innerHTML = `
      <style>
        .parent .handle { background-color: rgb(255, 0, 0); }
        .parent .handle svg { fill: rgb(0, 0, 255); }
      </style>
      <div class="parent"><div class="handle"><svg /></div></div>
    `;
    const element = ownerDocument.querySelector<HTMLDivElement>(".handle")!;
    const group = mockGroup(new DOMRect(0, 0, 200, 100));
    const { unmount } = render(
      createPortal(
        <ResizePreview
          preview={{
            active: true,
            group,
            key: "separator",
            offset: 0,
            panelIndex: 0,
            rect: new DOMRect(100, 0, 10, 100),
            separator: { element, id: "separator" }
          }}
        />,
        ownerDocument.body
      )
    );

    try {
      const clone = ownerDocument.querySelector(
        "[data-resize-preview] .handle"
      )!;
      expect(ownerWindow.getComputedStyle(clone).backgroundColor).toBe(
        "rgb(255, 0, 0)"
      );
      expect(
        ownerWindow.getComputedStyle(clone.querySelector("svg")!).fill
      ).toBe("rgb(0, 0, 255)");
    } finally {
      unmount();
      iframe.remove();
    }
  });

  test("only renders when this group's visible previews change", () => {
    const onRender = vi.fn();

    const ui = (resizePreviewMode: "panel" | "separator" = "separator") => (
      <Profiler id="group" onRender={onRender}>
        <Group id="group" resizePreviewMode={resizePreviewMode} />
      </Profiler>
    );

    const { container, rerender, unmount } = render(ui());
    const group = getRegisteredGroup("group", true);

    const preview = {
      group,
      panelIndex: 0,
      key: "active",
      active: true,
      rect: new DOMRect(50, 0, 0, 100),
      offset: 0
    };
    const indirect = {
      ...preview,
      key: "indirect",
      active: false
    };
    const unrelated = {
      ...preview,
      group: {
        ...group,
        id: "other"
      }
    };

    let interaction: InteractionActive = {
      state: "active",
      cursorFlags: 0,
      didPointerMove: false,
      hitRegions: [],
      initialLayoutMap: new Map(),
      previewLayoutMap: new Map(),
      pointerDownAtPoint: {
        x: 0,
        y: 0
      },
      previews: [preview, indirect, unrelated]
    };

    act(() => updateInteractionState(interaction));
    expect(container.querySelectorAll("[data-resize-preview]")).toHaveLength(1);

    onRender.mockClear();

    interaction = {
      ...interaction,
      cursorFlags: 1,
      previews: [preview, { ...indirect }, { ...unrelated, offset: 10 }]
    };

    act(() => updateInteractionState(interaction));
    expect(onRender).not.toHaveBeenCalled();

    interaction = {
      ...interaction,
      previews: [preview, { ...indirect, offset: 20 }]
    };

    act(() => updateInteractionState(interaction));
    expect(container.querySelectorAll("[data-resize-preview]")).toHaveLength(2);

    rerender(ui("panel"));
    expect(container.querySelectorAll("[data-resize-preview]")).toHaveLength(0);

    onRender.mockClear();

    act(() => updateInteractionState({ ...interaction, cursorFlags: 0 }));
    expect(onRender).not.toHaveBeenCalled();

    // Switching modes replaces the registration; stale snapshots must not return.
    rerender(ui());
    expect(container.querySelectorAll("[data-resize-preview]")).toHaveLength(0);

    act(() => updateInteractionState({ state: "inactive", cursorFlags: 0 }));
    expect(container.querySelectorAll("[data-resize-preview]")).toHaveLength(0);

    onRender.mockClear();

    act(() =>
      updateInteractionState({ state: "hover", cursorFlags: 0, hitRegions: [] })
    );
    expect(onRender).not.toHaveBeenCalled();

    unmount();
  });

  for (const orientation of ["horizontal", "vertical"] as const) {
    for (const explicit of [true, false]) {
      test(`${orientation}, ${explicit ? "explicit" : "implicit"} separators preview all moved boundaries and commit on release`, async () => {
        const horizontal = orientation === "horizontal";
        const bounds = (start: number, size: number) =>
          horizontal
            ? new DOMRect(start, 0, size, 100)
            : new DOMRect(0, start, 100, size);

        setElementBoundsFunction((element) => {
          switch (element.id) {
            case "group":
              return bounds(0, explicit ? 320 : 300);
            case "a":
              return bounds(0, 100);
            case "ab":
              return bounds(100, 10);
            case "b":
              return bounds(explicit ? 110 : 100, 100);
            case "bc":
              return bounds(210, 10);
            case "c":
              return bounds(explicit ? 220 : 200, 100);
          }
        });

        const groupRef = createRef<GroupImperativeHandle>();

        const { container } = render(
          <Group
            groupRef={groupRef}
            id="group"
            orientation={orientation}
            resizePreviewMode="separator"
          >
            <Panel id="a" />
            {explicit && (
              <Separator id="ab" style={{ backgroundColor: "red" }}>
                <span>handle</span>
              </Separator>
            )}
            <Panel id="b" minSize="80px" />
            {explicit && <Separator id="bc" />}
            <Panel id="c" />
            {!explicit && (
              <SeparatorOverlay
                style={{
                  backgroundColor: "blue",
                  [horizontal ? "width" : "height"]: "1rem"
                }}
              />
            )}
          </Group>
        );

        const initial = groupRef.current!.getLayout();
        const coords = (position: number) =>
          horizontal
            ? { clientX: position, clientY: 50 }
            : { clientX: 50, clientY: position };
        const start = explicit ? 105 : 100;
        const user = userEvent.setup();

        await user.pointer({ keys: "[MouseLeft>]", coords: coords(start) });
        expect(
          container.querySelectorAll("[data-resize-preview]")
        ).toHaveLength(1);

        await user.pointer({ coords: coords(start + 50) });

        const previews = container.querySelectorAll<HTMLElement>(
          "[data-resize-preview]"
        );
        expect(previews).toHaveLength(2);

        const axis = horizontal ? "X" : "Y";
        expect(
          parseFloat(previews[0].style.transform.split("(")[1])
        ).toBeCloseTo(50);
        expect(previews[0].style.transform).toContain(`translate${axis}`);
        expect(
          parseFloat(previews[1].style.transform.split("(")[1])
        ).toBeCloseTo(30);
        expect(groupRef.current!.getLayout()).toEqual(initial);

        if (explicit) {
          expect(previews[0].textContent).toBe("handle");
          expect(previews[0].firstElementChild).toHaveStyle({
            opacity: "0.65"
          });
          expect(container.querySelectorAll("#ab")).toHaveLength(1);
          expect(previews[0].querySelector("[data-separator]")).toHaveStyle({
            backgroundColor: "rgb(255, 0, 0)"
          });
          expect(previews[0]).toHaveAttribute("inert");
          expect(previews[0]).toHaveAttribute("aria-hidden", "true");
        } else {
          expect(previews[0].firstElementChild).toHaveAttribute(
            "data-separator-overlay",
            "active"
          );
          expect(previews[1].firstElementChild).toHaveAttribute(
            "data-separator-overlay",
            "inactive"
          );
          expect(previews[0].firstElementChild).toHaveStyle({
            backgroundColor: "rgb(0, 0, 255)",
            [horizontal ? "width" : "height"]: "1rem"
          });
        }

        await user.pointer({ coords: coords(start + 10) });
        expect(
          container.querySelectorAll("[data-resize-preview]")
        ).toHaveLength(1);

        await user.pointer({
          keys: "[/MouseLeft]",
          coords: coords(start + 50)
        });
        expect(
          container.querySelectorAll("[data-resize-preview]")
        ).toHaveLength(0);
        expect(groupRef.current!.getLayout().a).toBeCloseTo(50);
      });
    }
  }

  test("per-separator overlays override the group default and update during a drag", async () => {
    setElementBoundsFunction((element) => {
      switch (element.id) {
        case "group":
          return new DOMRect(0, 0, 320, 100);
        case "a":
          return new DOMRect(0, 0, 100, 100);
        case "ab":
          return new DOMRect(100, 0, 10, 100);
        case "b":
          return new DOMRect(110, 0, 100, 100);
        case "bc":
          return new DOMRect(210, 0, 10, 100);
        case "c":
          return new DOMRect(220, 0, 100, 100);
      }
    });

    const ui = (label: string, show = true) => (
      <Group id="group" resizePreviewMode="separator">
        {show && (
          <SeparatorOverlay className="default-overlay">
            {label}
          </SeparatorOverlay>
        )}
        <Panel id="a" />
        <Separator
          id="ab"
          preview={
            <SeparatorOverlay className="custom-overlay">
              custom
            </SeparatorOverlay>
          }
        />
        <Panel id="b" minSize="80px" />
        <Separator id="bc" disabled />
        <Panel id="c" />
      </Group>
    );

    const { container, rerender } = render(ui("default"));
    expect(container.querySelector(".default-overlay")).toBeNull();

    const user = userEvent.setup();

    await user.pointer([
      {
        keys: "[MouseLeft>]",
        coords: {
          clientX: 105,
          clientY: 50
        }
      },
      {
        coords: {
          clientX: 155,
          clientY: 50
        }
      }
    ]);
    expect(container.querySelector(".custom-overlay")).toHaveTextContent(
      "custom"
    );
    expect(container.querySelector(".default-overlay")).toHaveTextContent(
      "default"
    );
    expect(container.querySelector(".custom-overlay")).toHaveAttribute(
      "data-separator-overlay",
      "active"
    );
    expect(container.querySelector(".default-overlay")).toHaveAttribute(
      "data-separator-overlay",
      "inactive"
    );

    rerender(ui("updated"));
    expect(container.querySelector(".default-overlay")).toHaveTextContent(
      "updated"
    );

    rerender(ui("updated", false));
    expect(container.querySelector(".default-overlay")).toBeNull();
    expect(container.querySelectorAll("[data-resize-preview]")).toHaveLength(2);
    expect(
      container.querySelectorAll(
        '[data-resize-preview] [data-separator="disabled"]'
      )
    ).toHaveLength(1);

    await user.pointer({ keys: "[/MouseLeft]" });
  });
});
